<?php

namespace App\Modules\Cart\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Cart\Requests\CalculateCartRequest;
use App\Modules\Cart\Services\CartService;

class CartController extends Controller
{
    public function __construct(
        protected CartService $cartService
    ) {}

    public function calculate(CalculateCartRequest $request)
    {
        $result = $this->cartService->calculateCart(
            $request->input('items', []),
            $request->input('shipping_zone_id'),
            $request->input('voucher_code')
        );

        return response()->json([
            'success' => true,
            'data' => $result
        ]);
    }
}
