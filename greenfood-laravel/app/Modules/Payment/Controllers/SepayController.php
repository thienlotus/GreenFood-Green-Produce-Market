<?php

namespace App\Modules\Payment\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\SepayService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SepayController extends Controller
{
    public function __construct(
        protected SepayService $sepayService
    ) {}

    /**
     * Create SePay VietQR payment info and code.
     * POST /api/v1/payment/sepay/create
     * POST /api/payment/sepay/create
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
                'errors' => $validator->errors(),
            ], 422);
        }

        $orderId = trim($request->input('order_id'));
        $order = Order::where('id', $orderId)
            ->orWhere('tracking_number', $orderId)
            ->first();

        $amount = (float)($request->input('amount') ?? ($order?->total_amount ?? 50000));
        $orderInfo = $request->input('order_info') ?? ("Thanh toan don hang GreenFood #" . ($order?->tracking_number ?? $orderId));

        $result = $this->sepayService->createPayment(
            $order ? $order->tracking_number : $orderId,
            $amount,
            $orderInfo
        );

        return response()->json($result, 200);
    }

    /**
     * Webhook endpoint from SePay.
     * POST /api/v1/payment/sepay/webhook
     * POST /api/payment/sepay/webhook
     */
    public function webhook(Request $request)
    {
        // 1. Verify authorization header from SePay
        $isValid = $this->sepayService->verifyWebhook($request);
        if (!$isValid) {
            return response()->json([
                'success' => false,
                'message' => 'Xác thực SePay Webhook không thành công (API Key mismatch)',
            ], 401);
        }

        $payload = $request->all();

        // 2. Process transaction and confirm order
        $result = $this->sepayService->handleWebhook($payload);

        // SePay expects JSON response with {"success": true}
        return response()->json([
            'success' => true,
            'message' => $result['message'] ?? 'Xử lý webhook SePay thành công',
            'data' => $result,
        ], 200);
    }

    /**
     * Check payment status for polling from client or admin.
     * POST /api/v1/payment/sepay/check-status
     * POST /api/payment/sepay/check-status
     */
    public function checkStatus(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'order_id' => 'required|string',
        ], [
            'order_id.required' => 'Mã đơn hàng không được để trống!',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
            ], 422);
        }

        $orderId = trim($request->input('order_id'));
        $result = $this->sepayService->checkOrderStatus($orderId);

        return response()->json($result, 200);
    }
}
