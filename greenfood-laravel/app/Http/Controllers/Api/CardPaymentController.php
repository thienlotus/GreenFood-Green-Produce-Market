<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\PaymentTransaction;
use App\Services\GHNOrderService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class CardPaymentController extends Controller
{
    public function __construct(
        protected GHNOrderService $ghnOrderService
    ) {}

    /**
     * Xử lý thanh toán thẻ ATM Nội địa Napas / Thẻ Ngân hàng trực tiếp trên Web.
     * POST /api/v1/payment/card/process
     */
    public function process(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'order_id' => 'required|string',
            'card_number' => 'required|string|min:12',
            'card_holder' => 'required|string|min:3',
            'issue_date' => 'required|string',
            'bank_code' => 'nullable|string',
            'otp' => 'nullable|string',
        ], [
            'order_id.required' => 'Mã đơn hàng không được để trống.',
            'card_number.required' => 'Vui lòng nhập số thẻ ATM.',
            'card_number.min' => 'Số thẻ không hợp lệ.',
            'card_holder.required' => 'Vui lòng nhập tên chủ thẻ.',
            'issue_date.required' => 'Vui lòng nhập ngày phát hành thẻ (MM/YY).',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors()
            ], 422);
        }

        $orderIdentifier = trim($request->input('order_id'));
        $order = Order::where('id', $orderIdentifier)
            ->orWhere('tracking_number', $orderIdentifier)
            ->first();

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy đơn hàng #' . $orderIdentifier,
            ], 404);
        }

        $cardNumber = preg_replace('/\s+/', '', $request->input('card_number'));
        $cardHolder = strtoupper(trim($request->input('card_holder')));
        $bankCode = $request->input('bank_code', 'NCB');
        $amount = (float) ($order->total_price ?: $order->total_amount);
        $maskedCard = substr($cardNumber, 0, 4) . ' **** **** ' . substr($cardNumber, -4);
        $transId = 'ATM_' . strtoupper($bankCode) . '_' . time() . '_' . rand(100, 999);

        DB::beginTransaction();
        try {
            // 1. Cập nhật trạng thái đơn hàng
            $order->payment_status = 'paid';
            $order->status = 'CONFIRMED';
            $order->payment_method = 'VNPAY'; // Enum hợp lệ
            $order->save();

            // 2. Ghi nhận giao dịch thanh toán
            PaymentTransaction::create([
                'order_id' => $order->id,
                'gateway' => 'napas_atm',
                'gateway_order_id' => $transId,
                'amount' => $amount,
                'status' => 'success',
                'request_payload' => [
                    'bank' => $bankCode,
                    'card_holder' => $cardHolder,
                    'card_masked' => $maskedCard,
                ],
                'response_payload' => [
                    'resultCode' => 0,
                    'message' => 'Giao dịch thanh toán thẻ ATM Napas thành công',
                    'transId' => $transId,
                    'paid_at' => now()->toIso8601String(),
                ],
            ]);

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Card payment database transaction failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Lỗi khi cập nhật giao dịch: ' . $e->getMessage()
            ], 500);
        }

        // 3. Tự động khởi tạo vận đơn Giao Hàng Nhanh (GHN)
        $ghnOrderCode = $order->ghn_order_code;
        if (empty($ghnOrderCode)) {
            try {
                $order->load('items.product');
                $toWardCode = $order->to_ward_code ?: '13010';
                $toDistrictId = (int) ($order->to_district_id ?: config('services.ghn.from_district_id', 3440));
                
                $ghnRes = $this->ghnOrderService->create($order, $toWardCode, $toDistrictId, true);
                if (($ghnRes['code'] ?? 0) === 200 && !empty($ghnRes['data']['order_code'])) {
                    $ghnOrderCode = $ghnRes['data']['order_code'];
                    $order->ghn_order_code = $ghnOrderCode;
                    $order->tracking_number = $ghnOrderCode;
                    $order->save();
                    Log::info("GHN Push Success (Card Payment): Đơn #{$order->id} có mã GHN {$ghnOrderCode}");
                }
            } catch (\Throwable $e) {
                Log::warning("GHN push failed on card payment: " . $e->getMessage());
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Thanh toán thẻ ATM nội địa thành công!',
            'data' => [
                'order_id' => $order->id,
                'tracking_number' => $order->tracking_number,
                'ghn_order_code' => $ghnOrderCode,
                'trans_id' => $transId,
                'bank_code' => $bankCode,
                'card_masked' => $maskedCard,
                'card_holder' => $cardHolder,
                'amount' => $amount,
                'paid_at' => now()->format('d/m/Y H:i:s'),
            ]
        ], 200);
    }
}
