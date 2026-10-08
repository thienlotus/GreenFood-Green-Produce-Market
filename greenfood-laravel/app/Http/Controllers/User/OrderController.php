<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\PaymentTransaction;
use App\Services\GHNService;
use App\Services\GHNOrderService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    /**
     * Hiển thị trang đặt hàng / thanh toán
     */
    public function index(GHNService $ghn)
    {
        $cart = session('cart', []);
        
        // Tạo giỏ hàng mẫu nếu giỏ hàng hiện tại đang trống để người dùng test tiện lợi
        if (empty($cart)) {
            $cart = [
                [
                    'id' => 'sample-item-1',
                    'name' => 'Táo Envy New Zealand Organic',
                    'unit' => 'Hộp 1kg',
                    'price' => 50000,
                    'quantity' => 1,
                ]
            ];
            session(['cart' => $cart]);
        }

        $provinces = $ghn->getProvinces();
        $provincesList = $provinces['data'] ?? [];

        return view('user.payment.index', compact('cart', 'provincesList'));
    }

    /**
     * Hiển thị danh sách lịch sử đơn hàng của người dùng
     */
    public function ordersList()
    {
        $orders = Order::when(Auth::check(), function ($query) {
                return $query->where('user_id', Auth::id());
            })
            ->with(['items.product', 'paymentTransactions'])
            ->latest()
            ->paginate(10);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'data' => $orders,
            ]);
        }

        return redirect('http://localhost:3000/tracking');
    }

    /**
     * Xử lý đặt hàng (Process Payment) theo đúng hướng dẫn Lab
     */
    public function processPayment(Request $request, GHNService $ghn, GHNOrderService $ghnOrders)
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'phone' => ['required', 'regex:/^0\d{9}$/'],
            'address' => 'required|string|max:255',
            'to_district_id' => 'required|integer',
            'to_ward_code' => 'required|string',
            'payment_method' => 'required|in:cod,momo',
        ]);

        $cart = session('cart', []);
        if (empty($cart)) {
            return redirect()->route('user.payment.index')->with('error', 'Không thể thanh toán vì giỏ hàng trống.');
        }

        // 1. Tính tổng tiền hàng và tổng khối lượng sản phẩm
        $subtotal = collect($cart)->sum(fn($item) => $item['price'] * $item['quantity']);
        $totalWeight = collect($cart)->sum(
            fn($item) => $ghn->productWeight() * (int) $item['quantity']
        );

        // 2. Tính lại phí ship chuẩn xác từ GHN trên server
        $feeResponse = $ghn->calculateFee(array_merge([
            'from_district_id' => (int) config('services.ghn.from_district_id', 3440),
            'to_district_id' => (int) $request->to_district_id,
            'to_ward_code' => (string) $request->to_ward_code,
        ], $ghn->packageParameters($totalWeight)));

        $shippingFee = (isset($feeResponse['code']) && $feeResponse['code'] == 200)
            ? (int) $feeResponse['data']['total']
            : 0;

        // Tổng thanh toán = Tiền hàng + Phí ship
        $finalTotal = $subtotal + $shippingFee;

        // 3. Tạo đơn hàng và chi tiết đơn hàng trong Database
        $order = DB::transaction(function () use ($request, $shippingFee, $finalTotal, $cart) {
            $trackingCode = 'GF' . strtoupper(substr(uniqid(), -8));
            $order = Order::create([
                'tracking_number' => $trackingCode,
                'user_id' => Auth::id(),
                'name' => $request->name,
                'customer_name' => $request->name,
                'address' => $request->address,
                'shipping_address' => $request->address,
                'phone' => $request->phone,
                'customer_phone' => $request->phone,
                'total_price' => $finalTotal,
                'total_amount' => $finalTotal,
                'status' => 'pending',
                'to_district_id' => (int) $request->to_district_id,
                'to_ward_code' => (string) $request->to_ward_code,
                'ghn_total_fee' => $shippingFee,
                'shipping_fee' => $shippingFee,
                'shipping_status' => 'pending',
                'payment_method' => strtoupper($request->payment_method),
                'payment_status' => 'unpaid',
            ]);

            foreach ($cart as $item) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => (isset($item['id']) && strlen((string)$item['id']) > 15) ? $item['id'] : null,
                    'product_name' => $item['name'] ?? 'Sản phẩm GreenFood',
                    'unit' => $item['unit'] ?? 'kg',
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'price_at_time' => $item['price'],
                ]);
            }

            return $order;
        });

        // Xóa session giỏ hàng
        session()->forget('cart');

        // 4. Phân luồng thanh toán
        if ($request->payment_method === 'momo') {
            PaymentTransaction::create([
                'order_id' => $order->id,
                'gateway' => 'momo',
                'amount' => $order->total_price,
                'status' => 'pending',
            ]);

            return redirect()->route('user.orders.momo.start', $order);
        }

        // Nhánh COD
        PaymentTransaction::create([
            'order_id' => $order->id,
            'gateway' => 'cod',
            'amount' => $order->total_price,
            'status' => 'pending',
            'message' => 'Thanh toán khi nhận hàng',
        ]);

        // --- NHÁNH COD: TẠO VẬN ĐƠN GHN NGAY LẬP TỨC ---
        $order->load('items.product');
        $ghnOrderResponse = $ghnOrders->create($order);

        if (($ghnOrderResponse['code'] ?? null) == 200 && !empty($ghnOrderResponse['data']['order_code'])) {
            $order->update([
                'status' => 'cod_ordered',
                'ghn_order_code' => $ghnOrderResponse['data']['order_code'],
                'shipping_status' => 'ready_to_pick',
            ]);

            $orderCode = $ghnOrderResponse['data']['order_code'];
            return redirect('http://localhost:3000/tracking?order_code=' . urlencode($orderCode) . '&success=1');
        }

        Log::error('GHN COD Order Failed: ', $ghnOrderResponse ?? []);
        $order->update(['status' => 'cod_ordered']);

        return redirect('http://localhost:3000/tracking?warning=1');
    }
}
