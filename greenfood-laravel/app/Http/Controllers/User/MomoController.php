<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\PaymentTransaction;
use App\Services\GHNOrderService;
use App\Services\MomoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MomoController extends Controller
{
    /**
     * Bắt đầu thanh toán MoMo cho đơn hàng
     */
    public function start(Order $order, MomoService $momo)
    {
        if (Auth::check() && $order->user_id && $order->user_id !== Auth::id()) {
            abort(403);
        }

        return $this->redirectToMomo($order, $this->newTransaction($order), $momo);
    }

    /**
     * Thanh toán lại khi lần thử trước thất bại (không tạo đơn hàng mới)
     */
    public function payAgain(Order $order, MomoService $momo)
    {
        if (Auth::check() && $order->user_id && $order->user_id !== Auth::id()) {
            abort(403);
        }

        return $this->redirectToMomo($order, $this->newTransaction($order), $momo);
    }

    /**
     * Mô phỏng thanh toán MoMo Sandbox thành công cho môi trường test khi cổng Napas MoMo từ chối thẻ.
     */
    public function simulateSuccess(Order $order, GHNOrderService $ghnOrders, MomoService $momo)
    {
        $transaction = PaymentTransaction::where('order_id', $order->id)
            ->where('gateway', 'momo')
            ->latest()
            ->first();

        if (!$transaction) {
            $transaction = $this->newTransaction($order);
        }

        $orderId = $transaction->gateway_order_id ?: ($order->id . '_' . $transaction->id . '_' . time());
        $requestId = (string) time();
        $amount = (string) ((int) ($order->total_price ?: $order->total_amount));

        $payload = [
            'partnerCode' => config('services.momo.partner_code', 'MOMOBKUN20180529'),
            'orderId' => $orderId,
            'requestId' => $requestId,
            'amount' => $amount,
            'orderInfo' => 'Thanh toan don hang #' . ($order->tracking_number ?: $order->id),
            'orderType' => 'momo_wallet',
            'transId' => (string) rand(1000000000, 9999999999),
            'resultCode' => '0',
            'message' => 'Thành công.',
            'payType' => 'napas',
            'responseTime' => (string) (time() * 1000),
            'extraData' => (string) $order->id,
        ];

        $accessKey = config('services.momo.access_key', 'klm05TvNBzhg7h7j');
        $secretKey = config('services.momo.secret_key', 'at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa');
        $rawHash = 'accessKey=' . $accessKey .
            '&amount=' . $payload['amount'] .
            '&extraData=' . $payload['extraData'] .
            '&message=' . $payload['message'] .
            '&orderId=' . $payload['orderId'] .
            '&orderInfo=' . $payload['orderInfo'] .
            '&orderType=' . $payload['orderType'] .
            '&partnerCode=' . $payload['partnerCode'] .
            '&payType=' . $payload['payType'] .
            '&requestId=' . $payload['requestId'] .
            '&responseTime=' . $payload['responseTime'] .
            '&resultCode=' . $payload['resultCode'] .
            '&transId=' . $payload['transId'];

        $payload['signature'] = hash_hmac('sha256', $rawHash, $secretKey);

        return redirect()->route('user.payment.momo.callback', $payload);
    }

    /**
     * Xử lý khi khách hàng hoàn tất thanh toán trên MoMo quay trở về website (Redirect URL)
     */
    public function callback(Request $request, GHNOrderService $ghnOrders, MomoService $momo)
    {
        Log::info('MoMo callback received', [
            'payload' => $request->except('signature'),
            'has_signature' => $request->has('signature'),
        ]);

        if (!$momo->isValidSuccessfulResponse($request->all())) {
            Log::warning('MoMo callback rejected', [
                'result_code' => $request->input('resultCode'),
                'order_id' => $request->input('orderId'),
                'signature_valid' => $momo->isValidResponse($request->all()),
            ]);

            if ($momo->isValidResponse($request->all())) {
                $this->markFailed($request->all(), $momo);
            }

            // Nếu người dùng gọi từ Frontend Next.js
            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Giao dịch MoMo thất bại hoặc bị hủy.',
                    'data' => $request->all(),
                ], 400);
            }

            // Chuyển hướng về website Next.js (http://localhost:3000)
            $frontendUrl = config('services.momo.return_url', 'http://localhost:3000/payment/momo/return');
            return redirect($frontendUrl . '?' . http_build_query(array_merge($request->all(), ['message' => 'Giao dịch MoMo thất bại hoặc bị hủy'])));
        }

        $result = $this->completePayment($request->all(), $ghnOrders, $momo);
        $message = in_array($result, ['created', 'already_created'], true)
            ? 'Thanh toán MoMo thành công! Vận đơn GHN đã được khởi tạo.'
            : 'Thanh toán thành công! Đơn hàng đang chờ tạo vận đơn GHN.';

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => $message,
                'data' => $request->all(),
            ]);
        }

        // Chuyển hướng về website Next.js (http://localhost:3000) với kết quả thành công
        $frontendUrl = config('services.momo.return_url', 'http://localhost:3000/payment/momo/return');
        return redirect($frontendUrl . '?' . http_build_query(array_merge($request->all(), ['resultCode' => 0, 'message' => $message])));
    }

    /**
     * Nhận thông báo tự động (IPN Webhook) trực tiếp từ máy chủ MoMo
     */
    public function ipn(Request $request, GHNOrderService $ghnOrders, MomoService $momo)
    {
        Log::info('MoMo IPN received', [
            'payload' => $request->except('signature'),
            'has_signature' => $request->has('signature'),
        ]);

        if ($momo->isValidSuccessfulResponse($request->all())) {
            $this->completePayment($request->all(), $ghnOrders, $momo);
        } elseif ($momo->isValidResponse($request->all())) {
            $this->markFailed($request->all(), $momo);
        }

        return response()->json(['message' => 'Received', 'resultCode' => 0]);
    }

    /**
     * Tạo một bản ghi giao dịch mới cho lần thử thanh toán này
     */
    private function newTransaction(Order $order): PaymentTransaction
    {
        return PaymentTransaction::create([
            'order_id' => $order->id,
            'gateway' => 'momo',
            'amount' => (float) ($order->total_price ?: $order->total_amount),
            'status' => 'pending',
        ]);
    }

    /**
     * Gọi MomoService và chuyển hướng khách hàng sang Cổng MoMo Sandbox
     */
    private function redirectToMomo(Order $order, PaymentTransaction $transaction, MomoService $momo)
    {
        $result = $momo->createPayment($order, $transaction);

        return isset($result['payUrl'])
            ? redirect($result['payUrl'])
            : redirect('http://localhost:3000/checkout?error=' . urlencode($result['message'] ?? 'Không thể kết nối MoMo'));
    }

    /**
     * Xác nhận thanh toán thành công và khởi tạo vận đơn GHN tự động
     */
    private function completePayment(array $payload, GHNOrderService $ghnOrders, MomoService $momo): string
    {
        $result = DB::transaction(function () use ($payload, $momo) {
            $orderIdParam = $payload['orderId'] ?? '';
            $transaction = PaymentTransaction::where('gateway', 'momo')
                ->where('gateway_order_id', $orderIdParam)
                ->lockForUpdate()
                ->first();

            // Fallback tìm qua order_id nội bộ nếu gateway_order_id không khớp
            if (!$transaction) {
                $internalId = $momo->orderId($payload);
                if ($internalId) {
                    $transaction = PaymentTransaction::where('order_id', $internalId)
                        ->where('gateway', 'momo')
                        ->latest()
                        ->lockForUpdate()
                        ->first();
                }
            }

            if (!$transaction) {
                return 'invalid';
            }

            $order = Order::lockForUpdate()->find($transaction->order_id);
            if (!$order) {
                return 'invalid';
            }

            if ($order->ghn_order_code) {
                return 'already_created';
            }

            if ($order->shipping_status === 'processing') {
                return 'processing';
            }

            if ((int) $transaction->amount !== (int) ($payload['amount'] ?? 0)) {
                $momo->markFailed($transaction, $payload);
                return 'invalid';
            }

            $order->update([
                'status' => 'paid',
                'payment_status' => 'paid',
                'shipping_status' => 'processing',
            ]);

            $momo->markPaid($transaction, $payload);

            return ['create', $order->id];
        });

        if (!is_array($result)) {
            return (string) $result;
        }

        $order = Order::with('items.product')->find($result[1]);
        $response = $ghnOrders->create($order, true);

        if (isset($response['code']) && $response['code'] === 200 && !empty($response['data']['order_code'])) {
            $order->update([
                'ghn_order_code' => $response['data']['order_code'],
                'shipping_status' => 'ready_to_pick',
            ]);
            return 'created';
        }

        Log::error('GHN order failed after MoMo payment', [
            'order_id' => $order->id,
            'response' => $response,
        ]);

        $order->update(['shipping_status' => 'pending']);

        return 'failed';
    }

    /**
     * Đánh dấu giao dịch thất bại
     */
    private function markFailed(array $payload, MomoService $momo): void
    {
        $transaction = PaymentTransaction::where('gateway', 'momo')
            ->where('gateway_order_id', $payload['orderId'] ?? '')
            ->first();

        if (!$transaction) {
            $internalId = $momo->orderId($payload);
            if ($internalId) {
                $transaction = PaymentTransaction::where('order_id', $internalId)
                    ->where('gateway', 'momo')
                    ->latest()
                    ->first();
            }
        }

        if ($transaction && $transaction->status !== 'paid') {
            $momo->markFailed($transaction, $payload);
        }
    }
}
