<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ShippingZone;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'required|string|max:20',
            'customer_email' => 'nullable|email|max:255',
            'shipping_address' => 'required|string',
            'shipping_zone_id' => 'required|string|exists:shipping_zones,id',
            'payment_method' => 'required|in:COD,BANK_TRANSFER,MOMO,VNPAY',
            'items' => 'required|array|min:1',
            'items.*.product_name' => 'required|string',
            'items.*.unit' => 'required|string',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $zone = ShippingZone::find($request->shipping_zone_id);
            $itemsTotal = 0;
            foreach ($request->items as $it) {
                $itemsTotal += ($it['price'] * $it['quantity']);
            }

            $shippingFee = ($zone && $itemsTotal >= $zone->free_ship_minimum) ? 0 : ($zone ? $zone->base_fee : 0);
            $totalAmount = $itemsTotal + $shippingFee;

            $trackingNumber = 'GF' . mt_rand(100000, 999999);

            $order = Order::create([
                'id' => (string) Str::uuid(),
                'tracking_number' => $trackingNumber,
                'customer_name' => $request->customer_name,
                'customer_phone' => $request->customer_phone,
                'customer_email' => $request->customer_email,
                'shipping_address' => $request->shipping_address,
                'shipping_zone_id' => $request->shipping_zone_id,
                'shipping_fee' => $shippingFee,
                'total_amount' => $totalAmount,
                'status' => 'PENDING',
                'payment_method' => $request->payment_method,
                'note' => $request->note,
                'shipper_name' => 'Trần Minh Đức',
                'shipper_phone' => '0912345678',
                'shipper_lat' => 10.7769,
                'shipper_lng' => 106.7009,
                'dest_lat' => 10.7766,
                'dest_lng' => 106.7019,
            ]);

            foreach ($request->items as $it) {
                OrderItem::create([
                    'id' => (string) Str::uuid(),
                    'order_id' => $order->id,
                    'product_name' => $it['product_name'],
                    'unit' => $it['unit'],
                    'quantity' => $it['quantity'],
                    'price_at_time' => $it['price'],
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Đặt hàng thành công!',
                'data' => [
                    'order_id' => $order->id,
                    'tracking_number' => $trackingNumber,
                    'total_amount' => $totalAmount,
                    'shipping_fee' => $shippingFee,
                    'status' => $order->status
                ]
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Có lỗi xảy ra khi tạo đơn hàng: ' . $e->getMessage()
            ], 500);
        }
    }

    public function track($trackingNumber)
    {
        $code = strtoupper(trim(str_replace('#', '', $trackingNumber)));

        $order = Order::where('tracking_number', $code)
            ->orWhere('tracking_number', 'like', "%{$code}%")
            ->with(['items', 'shippingZone'])
            ->first();

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => "Không tìm thấy đơn hàng #{$code}"
            ], 404);
        }

        // Timeline steps based on status
        $steps = [
            [
                'title' => 'Đặt hàng',
                'desc' => 'Đơn hàng đã được tạo thành công',
                'time' => $order->created_at->format('d/m H:i'),
                'completed' => true,
                'current' => $order->status === 'PENDING'
            ],
            [
                'title' => 'Xác nhận',
                'desc' => 'Nông hộ đã xác nhận và đóng gói sản phẩm',
                'time' => in_array($order->status, ['CONFIRMED', 'SHIPPING', 'DELIVERED']) ? $order->created_at->addMinutes(30)->format('d/m H:i') : '',
                'completed' => in_array($order->status, ['CONFIRMED', 'SHIPPING', 'DELIVERED']),
                'current' => $order->status === 'CONFIRMED'
            ],
            [
                'title' => 'Đang giao',
                'desc' => 'Shipper đang trên đường vận chuyển đơn hàng',
                'time' => in_array($order->status, ['SHIPPING', 'DELIVERED']) ? $order->created_at->addHours(2)->format('d/m H:i') : '',
                'completed' => $order->status === 'DELIVERED',
                'current' => $order->status === 'SHIPPING'
            ],
            [
                'title' => 'Đã giao',
                'desc' => 'Giao hàng thành công đến tay người nhận',
                'time' => $order->status === 'DELIVERED' ? $order->updated_at->format('d/m H:i') : '',
                'completed' => $order->status === 'DELIVERED',
                'current' => false
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $order->tracking_number,
                'customer' => $order->customer_name,
                'phone' => $order->customer_phone,
                'address' => $order->shipping_address,
                'date' => $order->created_at->format('Y-m-d H:i'),
                'total' => $order->total_amount - $order->shipping_fee,
                'shippingFee' => $order->shipping_fee,
                'paymentMethod' => $order->payment_method,
                'status' => strtolower($order->status),
                'shipperName' => $order->shipper_name,
                'shipperPhone' => $order->shipper_phone,
                'shipperLat' => $order->shipper_lat,
                'shipperLng' => $order->shipper_lng,
                'destLat' => $order->dest_lat,
                'destLng' => $order->dest_lng,
                'items' => $order->items->map(function ($it) {
                    return [
                        'name' => $it->product_name,
                        'unit' => $it->unit,
                        'quantity' => $it->quantity,
                        'price' => (float)$it->price_at_time
                    ];
                }),
                'steps' => $steps
            ]
        ]);
    }
}
