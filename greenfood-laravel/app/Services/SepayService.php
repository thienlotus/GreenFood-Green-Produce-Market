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
            ->first();

        $trackingNumber = $order ? $order->tracking_number : $orderId;

        // Clean description code for VietQR (alphanumeric, e.g. GF20261001)
        $cleanCode = preg_replace('/[^0-9A-Za-z]/', '', $trackingNumber);
        if (!str_starts_with(strtoupper($cleanCode), 'GF')) {
            $cleanCode = 'GF' . $cleanCode;
        }
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

        if (empty($this->webhookApiKey)) {
            return true;
        }

        // SePay sends Authorization: Apikey <API_KEY>
        if (preg_match('/Apikey\s+(.+)/i', $authHeader, $matches)) {
            return hash_equals(trim($this->webhookApiKey), trim($matches[1]));
        }

        // Bearer token support
        if (preg_match('/Bearer\s+(.+)/i', $authHeader, $matches)) {
            return hash_equals(trim($this->webhookApiKey), trim($matches[1]));
        }

        // Optional query param / body api_key fallback
        $queryKey = $request->input('api_key') ?? $request->header('x-api-key');
        if ($queryKey) {
            return hash_equals(trim($this->webhookApiKey), trim($queryKey));
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
        $order = null;

        if (!empty($code)) {
            $order = Order::where('tracking_number', $code)
                ->orWhere('id', $code)
                ->first();

            if (!$order) {
                // Try alphanumeric normalization
                $cleanedCode = preg_replace('/[^0-9A-Za-z]/', '', $code);
                $order = Order::all()->first(function ($item) use ($cleanedCode) {
                    $itemClean = preg_replace('/[^0-9A-Za-z]/', '', $item->tracking_number);
                    return strcasecmp($itemClean, $cleanedCode) === 0 ||
                           str_ends_with(strtoupper($cleanedCode), strtoupper($itemClean));
                });
            }
        }

        // Regex scan content for GF pattern if order not found by code
        if (!$order && !empty($content)) {
            if (preg_match('/GF[0-9A-Za-z_-]+/i', $content, $matches)) {
                $matchedCode = $matches[0];
                $cleanedMatch = preg_replace('/[^0-9A-Za-z]/', '', $matchedCode);
                $order = Order::where('tracking_number', $matchedCode)
                    ->orWhere('id', $matchedCode)
                    ->first();

                if (!$order) {
                    $order = Order::all()->first(function ($item) use ($cleanedMatch) {
                        $itemClean = preg_replace('/[^0-9A-Za-z]/', '', $item->tracking_number);
                        return strcasecmp($itemClean, $cleanedMatch) === 0 ||
                               str_contains(strtoupper($cleanedMatch), strtoupper($itemClean));
                    });
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
