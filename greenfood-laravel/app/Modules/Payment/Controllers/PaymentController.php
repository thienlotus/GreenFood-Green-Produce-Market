<?php

namespace App\Modules\Payment\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Payment\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PaymentController extends Controller
{
    public function __construct(
        protected PaymentService $paymentService
    ) {}

    public function methods()
    {
        $methods = $this->paymentService->getSupportedMethods();
        return response()->json([
            'success' => true,
            'data' => $methods
        ]);
    }

    public function process(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'order_id' => 'required|string',
            'payment_method' => 'required|in:COD,BANK_TRANSFER,MOMO,VNPAY',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors()
            ], 422);
        }

        $result = $this->paymentService->processPayment(
            $request->order_id,
            $request->payment_method
        );

        if (!$result['success']) {
            return response()->json($result, 404);
        }

        return response()->json($result, 200);
    }
}
