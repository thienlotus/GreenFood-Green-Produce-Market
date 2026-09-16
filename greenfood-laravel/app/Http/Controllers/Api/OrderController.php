<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\ShippingZone;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Services\GHNOrderService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
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
            'shipping_zone_id' => 'nullable|string|exists:shipping_zones,id',
            'shipping_fee' => 'nullable|numeric|min:0',
            'to_district_id' => 'required|integer',
            'to_ward_code' => 'required|string',
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

            $itemsTotal = 0;
            foreach ($request->items as $it) {
                $itemsTotal += ($it['price'] * $it['quantity']);
            }

            $shippingFee = 0;
            if ($request->has('shipping_fee') && $request->shipping_fee !== null) {
                $shippingFee = $request->shipping_fee;
            } elseif ($request->has('shipping_zone_id') && $request->shipping_zone_id) {
                $zone = ShippingZone::find($request->shipping_zone_id);
                $shippingFee = ($zone && $itemsTotal >= $zone->free_ship_minimum) ? 0 : ($zone ? $zone->base_fee : 0);
            }

            $totalAmount = $itemsTotal + $shippingFee;

            $trackingNumber = 'GF' . mt_rand(100000, 999999); // Temporary fallback

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
                $productId = null;
                $variantId = null;

                // Safe check if product_id exists in database
                if (!empty($it['product_id']) && is_string($it['product_id'])) {
                    if (Product::where('id', $it['product_id'])->exists()) {
                        $productId = $it['product_id'];
                    } else {
                        // Fallback matching by name
                        $matchedProduct = Product::where('name', 'like', '%' . trim($it['product_name']) . '%')->first();
                        if ($matchedProduct) {
                            $productId = $matchedProduct->id;
                        }
                    }
                } else {
                    $matchedProduct = Product::where('name', 'like', '%' . trim($it['product_name']) . '%')->first();
                    if ($matchedProduct) {
                        $productId = $matchedProduct->id;
                    }
                }

                // Safe check if variant_id exists in database
                if (!empty($it['variant_id']) && is_string($it['variant_id'])) {
                    if (ProductVariant::where('id', $it['variant_id'])->exists()) {
                        $variantId = $it['variant_id'];
                    }
                }

                OrderItem::create([
                    'id' => (string) Str::uuid(),
                    'order_id' => $order->id,
                    'product_id' => $productId,
                    'variant_id' => $variantId,
                    'product_name' => $it['product_name'],
                    'unit' => $it['unit'],
                    'quantity' => $it['quantity'],
                    'price_at_time' => $it['price'],
                ]);
            }

            // Create order in GHN
            try {
                $ghnService = app(GHNOrderService::class);
                $isPaid = in_array($request->payment_method, ['BANK_TRANSFER', 'MOMO', 'VNPAY']);
                $ghnResponse = $ghnService->create($order, $request->to_ward_code, $request->to_district_id, $isPaid);
                
                if ($ghnResponse['code'] === 200 && isset($ghnResponse['data']['order_code'])) {
                    $trackingNumber = $ghnResponse['data']['order_code'];
                    $order->tracking_number = $trackingNumber;
                    $order->save();
                } else {
                    Log::warning('GHN API order creation returned non-200 or missing order_code: ' . json_encode($ghnResponse));
                }
            } catch (\Exception $ghnEx) {
                // If GHN fails (e.g. sandbox map condition error), log and fallback to temporary tracking number
                Log::error('GHN order creation failed: ' . $ghnEx->getMessage());
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

    public function index(Request $request)
    {
        $query = Order::with(['items', 'shippingZone'])->latest();

        if ($request->has('status') && $request->status !== 'all' && $request->status !== '') {
            $status = strtoupper($request->status);
            if ($status === 'PROCESSING') $status = 'SHIPPING';
            if ($status === 'COMPLETED') $status = 'DELIVERED';
            $query->where('status', $status);
        }

        if ($request->has('customer_phone') && trim($request->customer_phone) !== '') {
            $phone = preg_replace('/\D/', '', (string) $request->customer_phone);
            $query->where(function ($q) use ($phone, $request) {
                $q->where('customer_phone', $request->customer_phone)
                  ->orWhere('customer_phone', $phone)
                  ->orWhere('customer_phone', 'like', "%{$phone}%");
            });
        }

        if ($request->has('customer_email') && trim($request->customer_email) !== '') {
            $query->where('customer_email', strtolower(trim($request->customer_email)));
        }

        if ($request->has('search') && trim($request->search) !== '') {
            $search = trim($request->search);
            $query->where(function ($q) use ($search) {
                $q->where('tracking_number', 'like', "%{$search}%")
                  ->orWhere('customer_name', 'like', "%{$search}%")
                  ->orWhere('customer_phone', 'like', "%{$search}%")
                  ->orWhere('created_at', 'like', "%{$search}%");
            });
        }

        $orders = $query->get();

        $data = $orders->map(function ($order) {
            $mappedStatus = match ($order->status) {
                'PENDING' => 'pending',
                'CONFIRMED' => 'pending',
                'SHIPPING' => 'processing',
                'DELIVERED' => 'completed',
                'CANCELLED' => 'cancelled',
                default => strtolower($order->status)
            };

            return [
                'id' => '#' . $order->tracking_number,
                'order_uuid' => $order->id,
                'tracking_number' => $order->tracking_number,
                'customer' => $order->customer_name,
                'phone' => $order->customer_phone,
                'email' => $order->customer_email,
                'address' => $order->shipping_address,
                'shipping_zone' => $order->shippingZone?->name ?? 'Mặc định',
                'shipping_fee' => (float)$order->shipping_fee,
                'date' => $order->created_at->format('Y-m-d H:i'),
                'total' => number_format($order->total_amount, 0, ',', '.') . 'đ',
                'total_raw' => (float)$order->total_amount,
                'status' => $mappedStatus,
                'raw_status' => $order->status,
                'payment_method' => $order->payment_method,
                'note' => $order->note,
                'items' => $order->items->sum('quantity'),
                'item_details' => $order->items->map(function ($it) {
                    return [
                        'id' => $it->id,
                        'product_id' => $it->product_id,
                        'variant_id' => $it->variant_id,
                        'product_name' => $it->product_name,
                        'unit' => $it->unit,
                        'quantity' => $it->quantity,
                        'price' => (float)$it->price_at_time,
                        'subtotal' => (float)($it->price_at_time * $it->quantity)
                    ];
                })
            ];
        });

        return response()->json([
            'success' => true,
            'count' => $data->count(),
            'data' => $data
        ]);
    }

    public function myOrders(Request $request)
    {
        $phone = $request->query('phone');
        
        if (!$phone) {
            return response()->json([
                'success' => false,
                'message' => 'Vui lòng cung cấp số điện thoại'
            ], 400);
        }

        $orders = Order::where('customer_phone', $phone)->latest()->get();

        $data = $orders->map(function ($order) {
            return [
                'code' => $order->tracking_number,
                'date' => $order->created_at->toIso8601String(),
                'total' => (float)$order->total_amount,
                'status' => $order->status
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    public function show($id)
    {
        $cleanId = strtoupper(trim(str_replace(['#', '{', '}', ' '], '', $id)));
        $order = Order::where('id', $id)
            ->orWhere('tracking_number', $cleanId)
            ->with(['items', 'shippingZone'])
            ->first();

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy đơn hàng'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $order
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $cleanId = strtoupper(trim(str_replace(['#', '{', '}', ' '], '', $id)));
        $order = Order::where('id', $id)
            ->orWhere('tracking_number', $cleanId)
            ->first();

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy đơn hàng'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|string|in:PENDING,CONFIRMED,SHIPPING,DELIVERED,CANCELLED,pending,processing,completed,cancelled'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Trạng thái không hợp lệ'
            ], 422);
        }

        $inputStatus = strtolower($request->status);
        $dbStatus = match ($inputStatus) {
            'pending' => 'PENDING',
            'processing' => 'SHIPPING',
            'shipping' => 'SHIPPING',
            'confirmed' => 'CONFIRMED',
            'completed' => 'DELIVERED',
            'delivered' => 'DELIVERED',
            'cancelled' => 'CANCELLED',
            default => strtoupper($request->status)
        };

        $order->status = $dbStatus;
        $order->save();

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật trạng thái thành công',
            'data' => [
                'id' => '#' . $order->tracking_number,
                'status' => strtolower($dbStatus),
                'raw_status' => $dbStatus
            ]
        ]);
    }

    public function track($trackingNumber)
    {
        $code = strtoupper(trim(str_replace(['#', '{', '}', ' '], '', $trackingNumber)));

        if (empty($code)) {
            return response()->json([
                'success' => false,
                'message' => 'Mã đơn hàng không hợp lệ'
            ], 422);
        }

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
