<?php

namespace App\Services;

use App\Models\Order;
use App\Models\PaymentTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class SepayService
{
    protected string $apiToken;
    protected string $webhookApiKey;
    protected string $accountNumber;
    protected string $bankName;
    protected string $accountName;

    public function __construct()
    {
        $this->apiToken = config('services.sepay.api_token', env('SEPAY_API_TOKEN', '96Z1XOTILFILNUUKPR1EVMVABR2EPETBZAYACPLH3QNP5YIO4GGRTK5XHIW92DMQ'));
        $this->webhookApiKey = config('services.sepay.webhook_api_key', env('SEPAY_WEBHOOK_API_KEY', '96Z1XOTILFILNUUKPR1EVMVABR2EPETBZAYACPLH3QNP5YIO4GGRTK5XHIW92DMQ'));
        $this->accountNumber = config('services.sepay.account_number', env('SEPAY_ACCOUNT_NUMBER', '0987654321'));
        $this->bankName = config('services.sepay.bank_name', env('SEPAY_BANK_NAME', 'MBBank'));
        $this->accountName = config('services.sepay.account_name', env('SEPAY_ACCOUNT_NAME', 'CONG TY GREENFOOD'));
    }

    /**
     * Get active bank account information from SePay API if available, or fallback to config.
     */
    public function getBeneficiaryAccount(): array
    {
        if (!empty($this->apiToken)) {
            try {
                $response = Http::withToken($this->apiToken)
                    ->timeout(5)
                    ->get('https://my.sepay.vn/userapi/bankaccounts/list');

                if ($response->successful()) {
                    $data = $response->json();
                    $bankAccounts = $data['bankaccounts'] ?? [];
                    if (!empty($bankAccounts) && is_array($bankAccounts)) {
                        $primary = $bankAccounts[0];
                        return [
                            'account_number' => $primary['account_number'] ?? $this->accountNumber,
                            'bank_name' => $primary['bank_short_name'] ?? ($primary['bank_name'] ?? $this->bankName),
                            'account_name' => $primary['account_holder_name'] ?? $this->accountName,
                        ];
                    }
                }
            } catch (\Throwable $e) {
                Log::debug('SePay bankaccounts API query skipped/failed: ' . $e->getMessage());
            }
        }

        return [
            'account_number' => $this->accountNumber,
            'bank_name' => $this->bankName,
            'account_name' => $this->accountName,
        ];
    }

    /**
     * Create SePay VietQR payment info and pending transaction.
     */
    public function createPayment(string $orderId, float|int $amount, string $orderInfo = ''): array
    {
        $cleanAmount = (int)round($amount);
        $beneficiary = $this->getBeneficiaryAccount();

        // Find Order if exists
        $order = Order::where('id', $orderId)
            ->orWhere('tracking_number', $orderId)
            ->orWhere('ghn_order_code', $orderId)
            ->first();

        $trackingNumber = $order ? ($order->ghn_order_code ?: $order->tracking_number) : $orderId;

        // Clean description code for VietQR (use GHN order code directly, no arbitrary GF prefix)
        $cleanCode = strtoupper(preg_replace('/[^0-9A-Za-z]/', '', $trackingNumber));
        $description = $cleanCode;

        // Generate VietQR URL through SePay QR endpoint
        $acc = urlencode($beneficiary['account_number']);
        $bank = urlencode($beneficiary['bank_name']);
        $des = urlencode($description);
        $qrCodeUrl = "https://qr.sepay.vn/img?acc={$acc}&bank={$bank}&amount={$cleanAmount}&des={$des}&template=compact";

        // Save or update pending transaction record in database
        if ($order) {
            PaymentTransaction::updateOrCreate(
                [
                    'order_id' => $order->id,
                    'payment_method' => 'SEPAY',
                ],
                [
                    'amount' => $cleanAmount,
                    'status' => 'pending',
                    'transaction_id' => 'SEPAY_' . $cleanCode,
                    'response_data' => [
                        'bank' => $beneficiary['bank_name'],
                        'account_number' => $beneficiary['account_number'],
                        'account_name' => $beneficiary['account_name'],
                        'amount' => $cleanAmount,
                        'description' => $description,
                        'qr_url' => $qrCodeUrl,
                    ],
                ]
            );
        }

        return [
            'success' => true,
            'orderId' => $trackingNumber,
            'amount' => $cleanAmount,
            'bank' => $beneficiary['bank_name'],
            'accountNumber' => $beneficiary['account_number'],
            'accountName' => $beneficiary['account_name'],
            'description' => $description,
            'qrCodeUrl' => $qrCodeUrl,
            'message' => 'Tạo mã thanh toán SePay VietQR thành công',
        ];
    }

    /**
     * Verify SePay Webhook incoming request.
     */
    public function verifyWebhook(Request $request): bool
    {
        $authHeader = $request->header('Authorization', '');

        // 1. Kiểm tra header Authorization (Apikey ...)
        if (preg_match('/Apikey\s+(.+)/i', $authHeader, $matches)) {
            if (!empty($this->webhookApiKey) && hash_equals(trim($this->webhookApiKey), trim($matches[1]))) {
                return true;
            }
        }

        // 2. Bearer token support
        if (preg_match('/Bearer\s+(.+)/i', $authHeader, $matches)) {
            if (!empty($this->webhookApiKey) && hash_equals(trim($this->webhookApiKey), trim($matches[1]))) {
                return true;
            }
        }

        // 3. Optional query param / body api_key fallback
        $queryKey = $request->input('api_key') ?? $request->header('x-api-key');
        if ($queryKey && !empty($this->webhookApiKey)) {
            if (hash_equals(trim($this->webhookApiKey), trim($queryKey))) {
                return true;
            }
        }

        // 4. Nếu SePay ở chế độ 'Không xác thực' (được bật trên portal SePay webhooks)
        // Kiểm tra xem payload có các trường chuẩn xác của SePay webhook không
        $payload = $request->all();
        if (
            (isset($payload['transferType']) || isset($payload['transferAmount']) || isset($payload['gateway'])) &&
            (isset($payload['content']) || isset($payload['description']) || isset($payload['code']))
        ) {
            Log::info('SePay Webhook: Chấp nhận giao dịch webhook từ SePay (chế độ không xác thực header)');
            return true;
        }

        if (empty($this->webhookApiKey)) {
            return true;
        }

        return false;
    }

    /**
     * Process incoming Webhook payload from SePay.
     */
    public function handleWebhook(array $payload): array
    {
        $transferType = strtolower($payload['transferType'] ?? 'in');
        if ($transferType !== 'in') {
            return [
                'success' => false,
                'message' => 'Bỏ qua giao dịch không phải tiền vào (transferType != in)',
            ];
        }

        $transferAmount = (float)($payload['transferAmount'] ?? 0);
        $code = trim($payload['code'] ?? '');
        $content = (string)($payload['content'] ?? ($payload['description'] ?? ''));

        // Locate order from code or content
                if (!empty($code)) {
            $order = Order::where('tracking_number', $code)
                ->orWhere('ghn_order_code', $code)
                ->orWhere('id', $code)
                ->first();

            if (!$order) {
                // Try alphanumeric normalization
                $cleanedCode = preg_replace('/[^0-9A-Za-z]/', '', $code);
                $order = Order::all()->first(function ($item) use ($cleanedCode) {
                    $itemClean = preg_replace('/[^0-9A-Za-z]/', '', $item->tracking_number ?? '');
                    $itemGhn = preg_replace('/[^0-9A-Za-z]/', '', $item->ghn_order_code ?? '');
                    return strcasecmp($itemClean, $cleanedCode) === 0 ||
                           ($itemGhn && strcasecmp($itemGhn, $cleanedCode) === 0) ||
                           str_ends_with(strtoupper($cleanedCode), strtoupper($itemClean));
                });
            }
        }

        // Scan content against order tracking_number and ghn_order_code if order not found by code
        if (!$order && !empty($content)) {
            $cleanContent = strtoupper(preg_replace('/[^0-9A-Za-z]/', '', $content));

            // Check recent unpaid or latest orders first (within last 7 days)
            $candidateOrders = Order::where('payment_status', 'unpaid')
                ->orWhere('created_at', '>=', now()->subDays(7))
                ->orderByDesc('created_at')
                ->limit(50)
                ->get();

            foreach ($candidateOrders as $candidate) {
                $candGhn = strtoupper(preg_replace('/[^0-9A-Za-z]/', '', $candidate->ghn_order_code ?? ''));
                $candTrack = strtoupper(preg_replace('/[^0-9A-Za-z]/', '', $candidate->tracking_number ?? ''));

                if (!empty($candGhn) && str_contains($cleanContent, $candGhn)) {
                    $order = $candidate;
                    break;
                }
                if (!empty($candTrack) && strlen($candTrack) >= 4 && str_contains($cleanContent, $candTrack)) {
                    $order = $candidate;
                    break;
                }
                $candNote = strtoupper(preg_replace('/[^0-9A-Za-z]/', '', $candidate->note ?? ''));
                if (!empty($candNote) && strlen($candNote) >= 4 && str_contains($cleanContent, $candNote)) {
                    $order = $candidate;
                    break;
                }
            }

            if (!$order) {
                // Regex word search in content
                if (preg_match_all('/[A-Za-z0-9]{4,15}/', $content, $matches)) {
                    foreach ($matches[0] as $matchWord) {
                        $order = Order::where('tracking_number', $matchWord)
                            ->orWhere('ghn_order_code', $matchWord)
                            ->first();
                        if ($order) break;
                    }
                }
            }
        }

        if (!$order) {
            Log::warning('SePay Webhook: Không tìm thấy đơn hàng cho nội dung: ' . $content);
            return [
                'success' => false,
                'message' => 'Không tìm thấy đơn hàng tương ứng',
            ];
        }

        // Check paid amount matches order amount (allow minor rounding)
        if ($transferAmount < ($order->total_amount - 100)) {
            Log::warning("SePay Webhook: Số tiền chuyển ({$transferAmount}) ít hơn giá trị đơn ({$order->total_amount}) cho đơn #{$order->tracking_number}");
        }

        // Mark order as paid and confirmed
        $order->payment_method = 'BANK_TRANSFER';
        $order->status = 'CONFIRMED';
        $order->payment_status = 'paid';

        // Đảm bảo đơn hàng được đẩy lên GHN nếu chưa có mã GHN
        if (empty($order->ghn_order_code)) {
            try {
                $ghnOrderService = app(\App\Services\GHNOrderService::class);
                $toDistrictId = (int)($order->to_district_id ?: config('services.ghn.from_district_id', 3440));
                $toWardCode = (string)($order->to_ward_code ?: '13010');
                $ghnRes = $ghnOrderService->create($order, $toWardCode, $toDistrictId, true);
                if (($ghnRes['code'] ?? 0) === 200 && !empty($ghnRes['data']['order_code'])) {
                    $order->ghn_order_code = $ghnRes['data']['order_code'];
                    $order->tracking_number = $ghnRes['data']['order_code'];
                    $order->to_district_id = $toDistrictId;
                    $order->to_ward_code = $toWardCode;
                    Log::info("SePay Webhook: Đã đẩy đơn hàng #{$order->id} lên GHN thành công với mã: {$order->ghn_order_code}");
                }
            } catch (\Throwable $e) {
                Log::error("SePay Webhook: Lỗi khi đẩy đơn lên GHN: " . $e->getMessage());
            }
        }

        $order->save();

        // Update or create payment transaction
        $transId = (string)($payload['referenceCode'] ?? ('SEPAY_' . ($payload['id'] ?? time())));
        PaymentTransaction::updateOrCreate(
            [
                'order_id' => $order->id,
                'payment_method' => 'SEPAY',
            ],
            [
                'transaction_id' => $transId,
                'amount' => $transferAmount > 0 ? $transferAmount : $order->total_amount,
                'status' => 'success',
                'response_data' => $payload,
            ]
        );

        Log::info("SePay Webhook: Xác nhận thanh toán thành công đơn hàng #{$order->tracking_number}, số tiền: {$transferAmount}");

        return [
            'success' => true,
            'message' => 'Xác nhận thanh toán SePay thành công cho đơn hàng #' . $order->tracking_number,
            'order' => $order,
        ];
    }

    /**
     * Check order payment status (Local DB first, SePay API live check fallback).
     */
    public function checkOrderStatus(string $orderId): array
    {
        $order = Order::where('id', $orderId)
            ->orWhere('tracking_number', $orderId)
            ->first();

        if ($order && ($order->payment_status === 'paid' || $order->status === 'CONFIRMED')) {
            return [
                'success' => true,
                'isPaid' => true,
                'status' => 'paid',
                'orderId' => $order->tracking_number,
                'amount' => $order->total_amount,
                'message' => 'Đơn hàng đã được thanh toán thành công',
            ];
        }

        // Live check SePay API transactions list if token is present
        if (!empty($this->apiToken) && $order) {
            try {
                $response = Http::withToken($this->apiToken)
                    ->timeout(6)
                    ->get('https://my.sepay.vn/userapi/transactions/list', [
                        'limit' => 20,
                    ]);

                if ($response->successful()) {
                    $data = $response->json();
                    $transactions = $data['transactions'] ?? [];
                    $cleanTarget = preg_replace('/[^0-9A-Za-z]/', '', $order->tracking_number);

                    foreach ($transactions as $tx) {
                        $transferType = strtolower($tx['transferType'] ?? 'in');
                        if ($transferType !== 'in') continue;

                        $txContent = (string)($tx['content'] ?? ($tx['description'] ?? ''));
                        $txCode = (string)($tx['code'] ?? '');
                        $combined = $txCode . ' ' . $txContent;
                        $cleanedTx = preg_replace('/[^0-9A-Za-z]/', '', $combined);

                        if (str_contains(strtoupper($cleanedTx), strtoupper($cleanTarget))) {
                            // Found matching transaction in SePay! Mark paid!
                            $this->handleWebhook([
                                'id' => $tx['id'] ?? time(),
                                'transferType' => 'in',
                                'transferAmount' => $tx['transferAmount'] ?? $order->total_amount,
                                'code' => $order->tracking_number,
                                'content' => $txContent,
                                'referenceCode' => $tx['referenceCode'] ?? ('SEPAY_' . ($tx['id'] ?? time())),
                            ]);

                            return [
                                'success' => true,
                                'isPaid' => true,
                                'status' => 'paid',
                                'orderId' => $order->tracking_number,
                                'amount' => $order->total_amount,
                                'message' => 'Thanh toán đã được tự động xác nhận qua SePay API',
                            ];
                        }
                    }
                }
            } catch (\Throwable $e) {
                Log::debug('SePay live check fallback error: ' . $e->getMessage());
            }
        }

        return [
            'success' => true,
            'isPaid' => false,
            'status' => 'pending',
            'orderId' => $order ? $order->tracking_number : $orderId,
            'message' => 'Đang chờ chuyển khoản...',
        ];
    }
}
