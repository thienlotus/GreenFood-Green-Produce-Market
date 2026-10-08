<?php

namespace App\Modules\Payment\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\MomoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MomoController extends Controller
{
    public function __construct(
        protected MomoService $momoService
    ) {}

    /**
     * Create MoMo payment link / QR code.
     * POST /api/v1/payment/momo/create
     */
    public function create(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'order_id' => 'required|string',
            'amount' => 'nullable|numeric|min:1000',
            'order_info' => 'nullable|string|max:255',
        ], [
            'order_id.required' => 'Mã đơn hàng không được để trống!',
            'amount.min' => 'Số tiền thanh toán tối thiểu là 1.000đ!',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors()
            ], 422);
        }

        $orderId = trim($request->input('order_id'));
        $order = Order::where('id', $orderId)
            ->orWhere('tracking_number', $orderId)
            ->first();

        $amount = (float)($request->input('amount') ?? ($order?->total_amount ?? 50000));
        $orderInfo = $request->input('order_info') ?? ("Thanh toan don hang GreenFood #" . ($order?->tracking_number ?? $orderId));

        $result = $this->momoService->createPayment(
            $order ? $order->tracking_number : $orderId,
            $amount,
            $orderInfo
        );

        return response()->json($result, 200);
    }

    /**
     * IPN Webhook callback from MoMo servers.
     * POST /api/v1/payment/momo/callback
     */
    public function callback(Request $request)
    {
        $payload = $request->all();

        // 1. Verify HMAC-SHA256 signature
        $isValid = $this->momoService->verifyCallback($payload);
        if (!$isValid) {
            return response()->json([
                'resultCode' => 99,
                'message' => 'Chữ ký không hợp lệ (Signature mismatch)'
            ], 400);
        }

        $orderId = $payload['orderId'] ?? null;
        $resultCode = (int)($payload['resultCode'] ?? -1);
        $transId = (string)($payload['transId'] ?? ('MOMO' . time()));

        // 2. If payment was successful (resultCode === 0)
        if ($resultCode === 0 && $orderId) {
            $this->momoService->handleSuccessfulPayment($orderId, $transId, $payload);
        }

        return response()->json([
            'resultCode' => 0,
            'message' => 'Xác nhận IPN từ MoMo thành công'
        ], 200);
    }

    /**
     * User return redirect handler after completing or cancelling MoMo checkout.
     * GET /api/v1/payment/momo/return
     */
    public function return(Request $request)
    {
        $payload = $request->all();
        $isValid = $this->momoService->verifyCallback($payload);

        $orderId = $payload['orderId'] ?? null;
        $resultCode = (int)($payload['resultCode'] ?? -1);
        $transId = (string)($payload['transId'] ?? ('MOMO' . time()));

        $isSuccess = ($isValid && $resultCode === 0);

        if ($isSuccess && $orderId) {
            $this->momoService->handleSuccessfulPayment($orderId, $transId, $payload);
        }

        if ($request->wantsJson()) {
            return response()->json([
                'success' => $isSuccess,
                'valid_signature' => $isValid,
                'result_code' => $resultCode,
                'message' => $isSuccess ? 'Thanh toán thành công' : 'Thanh toán không thành công hoặc đã bị hủy',
                'data' => $payload
            ]);
        }

        // Redirect to Frontend return page with query params
        $frontendReturnUrl = config('services.momo.return_url', 'http://localhost:3000/payment/momo/return');
        $query = http_build_query([
            'orderId' => $orderId,
            'resultCode' => $resultCode,
            'transId' => $transId,
            'amount' => $payload['amount'] ?? '',
            'message' => $isSuccess ? 'Thanh toán MoMo thành công' : ($payload['message'] ?? 'Thanh toán thất bại'),
        ]);

        return redirect($frontendReturnUrl . (str_contains($frontendReturnUrl, '?') ? '&' : '?') . $query);
    }

    /**
     * Check transaction status.
     * POST /api/v1/payment/momo/check-status
     */
    public function checkStatus(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'order_id' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
            ], 422);
        }

        $orderId = trim($request->input('order_id'));
        $result = $this->momoService->checkTransactionStatus($orderId);

        return response()->json($result, 200);
    }

    /**
     * Mô phỏng thanh toán MoMo Sandbox thành công cho môi trường test khi cổng Napas MoMo từ chối thẻ.
     * POST /api/v1/payment/momo/simulate
     */
    public function simulate(Request $request)
    {
        $orderId = trim($request->input('order_id', ''));
        if (!$orderId) {
            return response()->json(['success' => false, 'message' => 'Thiếu mã đơn hàng'], 422);
        }

        $transId = 'MOMO_TEST_' . time();
        $payload = [
            'orderId' => $orderId,
            'resultCode' => 0,
            'message' => 'Thành công (Mô phỏng Sandbox)',
            'transId' => $transId,
            'amount' => $request->input('amount', 50000),
        ];

        $res = $this->momoService->handleSuccessfulPayment($orderId, $transId, $payload);

        return response()->json([
            'success' => $res['success'],
            'message' => $res['message'],
            'data' => $payload,
        ]);
    }
}
