<?php

namespace App\Services;

use App\Models\Order;
use App\Models\PaymentTransaction;
use App\Services\GHNOrderService;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class MomoService
{
    /**
     * Tạo yêu cầu thanh toán MoMo Sandbox.
     * Hỗ trợ cả 2 dạng gọi:
     * - Bài Lab: createPayment(Order $order, PaymentTransaction $transaction)
     * - API Gateway: createPayment(string $orderId, float|int $amount, string $orderInfo, array $extra)
     */
    public function createPayment(Order|string $order, PaymentTransaction|float|int|null $transaction = null, string $orderInfo = '', array $extra = []): array
    {
        // 1. Chuẩn hóa tham số đầu vào
        if (is_string($order)) {
            $orderModel = Order::where('id', $order)
                ->orWhere('tracking_number', $order)
                ->first();

            $amount = is_numeric($transaction) ? (float) $transaction : ($orderModel?->total_amount ?? 50000);

            if ($orderModel) {
                $transactionModel = PaymentTransaction::create([
                    'order_id' => $orderModel->id,
                    'gateway' => 'momo',
                    'amount' => $amount,
                    'status' => 'pending',
                ]);
            } else {
                $transactionModel = new PaymentTransaction([
                    'gateway' => 'momo',
                    'amount' => $amount,
                    'status' => 'pending',
                ]);
            }

            return $this->processCreatePayment($orderModel, $transactionModel, $orderInfo, $order);
        }

        return $this->processCreatePayment($order, $transaction, $orderInfo);
    }

    /**
     * Logic tạo thanh toán MoMo Gateway cốt lõi theo đúng tài liệu Lab Sandbox
     */
    protected function processCreatePayment(?Order $order, PaymentTransaction $transaction, string $customOrderInfo = '', string $rawOrderIdentifier = ''): array
    {
        $endpoint = config('services.momo.endpoint', 'https://test-payment.momo.vn/v2/gateway/api/create');
        $partnerCode = config('services.momo.partner_code', env('MOMO_PARTNER_CODE', 'MOMOBKUN20180529'));
        $accessKey = config('services.momo.access_key', env('MOMO_ACCESS_KEY', 'klm05TvNBzhg7h7j'));
        $secretKey = config('services.momo.secret_key', env('MOMO_SECRET_KEY', 'at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa'));

        $displayOrderId = $order ? ($order->tracking_number ?: $order->id) : ($rawOrderIdentifier ?: time());
        $orderInfo = $customOrderInfo ?: ('Thanh toan don hang #' . $displayOrderId);
        $amount = (string) ((int) ($transaction->amount ?: ($order?->total_amount ?? 50000)));

        $uniqueOrderId = ($order ? $order->id : $displayOrderId) . '_' . ($transaction->id ?: Str::random(8)) . '_' . time();

        $redirectUrl = !empty($extra['redirectUrl']) 
            ? $extra['redirectUrl'] 
            : config('services.momo.return_url', 'http://localhost:3000/payment/momo/return');
        $ipnUrl = !empty($extra['ipnUrl']) 
            ? $extra['ipnUrl'] 
            : (config('services.momo.notify_url') ?: (config('services.momo.ipn_url') ?: 'http://127.0.0.1:8000/payment/momo/ipn'));

        $extraData = (string) ($order ? $order->id : $displayOrderId);
        $requestId = (string) time() . '_' . Str::random(6);
        $requestType = 'payWithATM'; // Cổng thanh toán thẻ ATM nội địa Napas

        $rawHash = 'accessKey=' . $accessKey .
            '&amount=' . $amount .
            '&extraData=' . $extraData .
            '&ipnUrl=' . $ipnUrl .
            '&orderId=' . $uniqueOrderId .
            '&orderInfo=' . $orderInfo .
            '&partnerCode=' . $partnerCode .
            '&redirectUrl=' . $redirectUrl .
            '&requestId=' . $requestId .
            '&requestType=' . $requestType;

        $signature = hash_hmac('sha256', $rawHash, $secretKey);

        $data = [
            'partnerCode' => $partnerCode,
            'partnerName' => 'GreenFood Market',
            'storeId' => 'GreenFoodStore',
            'requestId' => $requestId,
            'amount' => $amount,
            'orderId' => $uniqueOrderId,
            'orderInfo' => $orderInfo,
            'redirectUrl' => $redirectUrl,
            'ipnUrl' => $ipnUrl,
            'lang' => 'vi',
            'extraData' => $extraData,
            'requestType' => $requestType,
            'signature' => $signature,
        ];

        if ($transaction->exists) {
            $transaction->update([
                'gateway' => 'momo',
                'gateway_order_id' => $uniqueOrderId,
                'request_payload' => $data,
            ]);
        }

        try {
            $response = Http::withOptions([
                'verify' => filter_var(config('services.momo.verify_ssl', false), FILTER_VALIDATE_BOOLEAN),
                'timeout' => 10,
            ])->post($endpoint, $data);

            $result = $response->json() ?? [];
        } catch (\Throwable $e) {
            Log::error('MoMo API Connection Error: ' . $e->getMessage());
            $result = [
                'resultCode' => 99,
                'message' => 'Lỗi kết nối API MoMo: ' . $e->getMessage()
            ];
        }

        $isPayUrlReady = isset($result['payUrl']);

        if ($transaction->exists) {
            $transaction->update([
                'response_payload' => $result,
                'result_code' => isset($result['resultCode']) ? (int) $result['resultCode'] : null,
                'message' => $result['message'] ?? null,
                'status' => $isPayUrlReady ? 'pending' : 'failed',
            ]);
        }

        // Bổ sung các trường tiện ích cho cả giao diện Web lẫn Frontend Next.js
        $result['success'] = $isPayUrlReady || (($result['resultCode'] ?? -1) === 0);
        $result['orderId'] = $uniqueOrderId;
        $result['requestId'] = $requestId;
        $result['amount'] = (int) $amount;
        if (!empty($result['payUrl'])) {
            $result['qrCodeUrl'] = 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=' . urlencode($result['payUrl']);
        }

        return $result;
    }

    /**
     * Kiểm tra MoMo có báo thanh toán thành công hay không.
     */
    public function isSuccessful(array $payload): bool
    {
        return (string) ($payload['resultCode'] ?? '') === '0';
    }

    /**
     * Cập nhật giao dịch sau khi MoMo thanh toán thành công.
     */
    public function markPaid(PaymentTransaction $transaction, array $payload): void
    {
        $transaction->update([
            'transaction_id' => $payload['transId'] ?? null,
            'momo_trans_id' => $payload['transId'] ?? null,
            'result_code' => (int) ($payload['resultCode'] ?? 0),
            'message' => $payload['message'] ?? 'Giao dịch thành công',
            'response_payload' => $payload,
            'status' => 'success',
            'paid_at' => Carbon::now(),
        ]);
    }

    /**
     * Cập nhật giao dịch thất bại hoặc bị hủy.
     */
    public function markFailed(PaymentTransaction $transaction, array $payload): void
    {
        $transaction->update([
            'transaction_id' => $payload['transId'] ?? null,
            'result_code' => isset($payload['resultCode']) ? (int) $payload['resultCode'] : null,
            'message' => $payload['message'] ?? 'Giao dịch thất bại',
            'response_payload' => $payload,
            'status' => 'failed',
        ]);
    }

    /**
     * Kiểm tra callback MoMo thành công đầy đủ (signature chuẩn + resultCode = 0).
     */
    public function isValidSuccessfulResponse(array $payload): bool
    {
        return $this->isValidResponse($payload) && $this->isSuccessful($payload);
    }

    /**
     * Kiểm tra chữ ký callback MoMo.
     */
    public function isValidResponse(array $payload): bool
    {
        if (!isset($payload['signature'])) {
            return false;
        }

        $accessKey = config('services.momo.access_key', env('MOMO_ACCESS_KEY', 'klm05TvNBzhg7h7j'));
        $secretKey = config('services.momo.secret_key', env('MOMO_SECRET_KEY', 'at67qH6mk8w5Y1nAyMoYKMWACiEi2bsa'));

        $rawHash = 'accessKey=' . $accessKey .
            '&amount=' . ($payload['amount'] ?? '') .
            '&extraData=' . ($payload['extraData'] ?? '') .
            '&message=' . ($payload['message'] ?? '') .
            '&orderId=' . ($payload['orderId'] ?? '') .
            '&orderInfo=' . ($payload['orderInfo'] ?? '') .
            '&orderType=' . ($payload['orderType'] ?? '') .
            '&partnerCode=' . ($payload['partnerCode'] ?? '') .
            '&payType=' . ($payload['payType'] ?? '') .
            '&requestId=' . ($payload['requestId'] ?? '') .
            '&responseTime=' . ($payload['responseTime'] ?? '') .
            '&resultCode=' . ($payload['resultCode'] ?? '') .
            '&transId=' . ($payload['transId'] ?? '');

        return hash_equals(
            hash_hmac('sha256', $rawHash, $secretKey),
            (string) $payload['signature']
        );
    }

    /**
     * Alias xác minh callback (tương thích backward)
     */
    public function verifyCallback(array $payload): bool
    {
        return $this->isValidResponse($payload);
    }

    /**
     * Lấy ID đơn hàng nội bộ từ trường extraData hoặc orderId
     */
    public function orderId(array $payload): ?string
    {
        $orderId = $payload['extraData'] ?? null;
        if (empty($orderId) && !empty($payload['orderId'])) {
            $parts = explode('_', (string) $payload['orderId']);
            $orderId = $parts[0] ?? null;
        }

        return $orderId ? (string) $orderId : null;
    }

    /**
     * Tra cứu trạng thái giao dịch từ MoMo hoặc CSDL nội bộ
     */
    public function checkTransactionStatus(string $orderId, ?string $requestId = null): array
    {
        $order = Order::where('id', $orderId)
            ->orWhere('tracking_number', $orderId)
            ->first();

        $transaction = $order
            ? PaymentTransaction::where('order_id', $order->id)->where('gateway', 'momo')->latest()->first()
            : PaymentTransaction::where('gateway_order_id', $orderId)->first();

        $isPaid = ($transaction && $transaction->status === 'paid') || ($order && $order->payment_status === 'paid');

        return [
            'success' => true,
            'data' => [
                'orderId' => $orderId,
                'status' => $isPaid ? 'paid' : ($transaction?->status ?? 'pending'),
                'resultCode' => $isPaid ? 0 : ($transaction?->result_code ?? 1000),
                'message' => $isPaid ? 'Giao dịch đã thanh toán thành công' : ($transaction?->message ?? 'Đang chờ thanh toán'),
                'amount' => $transaction?->amount ?? ($order?->total_amount ?? 0),
                'transId' => $transaction?->transaction_id ?? null,
            ]
        ];
    }

    /**
     * Xử lý sau khi nhận thông báo thanh toán thành công từ API
     */
    public function handleSuccessfulPayment(string $orderId, string $momoTransId, array $payload = []): array
    {
        $order = Order::where('id', $orderId)
            ->orWhere('tracking_number', $orderId)
            ->first();

        if (!$order) {
            return [
                'success' => false,
                'message' => "Không tìm thấy đơn hàng #{$orderId}"
            ];
        }

        $order->payment_method = 'MOMO';
        $order->status = 'CONFIRMED';
        $order->payment_status = 'paid';
        $order->shipping_status = 'processing';

        // Đẩy đơn hàng sang GHN nếu chưa có
        if (empty($order->ghn_order_code)) {
            try {
                $ghnOrders = app(GHNOrderService::class);
                $res = $ghnOrders->create($order, true);
                if (isset($res['code']) && $res['code'] === 200 && !empty($res['data']['order_code'])) {
                    $order->ghn_order_code = $res['data']['order_code'];
                    $order->shipping_status = 'ready_to_pick';
                }
            } catch (\Throwable $e) {
                Log::error('GHN order push failed in handleSuccessfulPayment: ' . $e->getMessage());
            }
        }

        $order->save();

        $transaction = PaymentTransaction::where('order_id', $order->id)
            ->where('gateway', 'momo')
            ->latest()
            ->first();

        if ($transaction) {
            $this->markPaid($transaction, array_merge($payload, ['transId' => $momoTransId]));
        } else {
            PaymentTransaction::create([
                'order_id' => $order->id,
                'gateway' => 'momo',
                'gateway_order_id' => $payload['orderId'] ?? ($order->tracking_number ?: $order->id),
                'transaction_id' => $momoTransId,
                'momo_trans_id' => $momoTransId,
                'momo_request_id' => $payload['requestId'] ?? null,
                'amount' => $payload['amount'] ?? $order->total_amount,
                'status' => 'success',
                'result_code' => (int) ($payload['resultCode'] ?? 0),
                'message' => $payload['message'] ?? 'Giao dịch thành công',
                'response_payload' => $payload,
                'paid_at' => Carbon::now(),
            ]);
        }

        return [
            'success' => true,
            'message' => 'Cập nhật thanh toán MoMo thành công cho đơn hàng #' . ($order->tracking_number ?: $order->id),
            'order' => $order,
        ];
    }
}
