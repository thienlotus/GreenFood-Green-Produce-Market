<?php

namespace App\Modules\Order\Services;

use App\Modules\Order\Repositories\OrderRepository;
use App\Services\GHNOrderService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class OrderService
{
    public function __construct(
        protected OrderRepository $orderRepository,
        protected GHNOrderService $ghnOrderService
    ) {}

    public function placeOrder(array $data): array
    {
        try {
            DB::beginTransaction();

            // 1. Chống Client Price Tampering & Kiểm tra hợp lệ từng sản phẩm
            $validatedItems = [];
            $itemsTotal = 0;

            foreach ($data['items'] as $it) {
                $productId = $this->orderRepository->resolveProductId($it['product_id'] ?? null, $it['product_name']);
                $variantId = $this->orderRepository->resolveVariantId($it['variant_id'] ?? null);

                // Lấy giá chuẩn từ Database nếu có variant hoặc product
                $realPrice = 0;
                $variant = null;
                if ($variantId) {
                    $variant = \App\Models\ProductVariant::where('id', $variantId)->lockForUpdate()->first();
                    if ($variant) {
                        $realPrice = (float)$variant->price;
                    }
                }

                if ($realPrice <= 0 && $productId) {
                    $firstVariant = \App\Models\ProductVariant::where('product_id', $productId)->first();
                    if ($firstVariant) {
                        $realPrice = (float)$firstVariant->price;
                        if (!$variantId) $variantId = $firstVariant->id;
                        $variant = $firstVariant;
                    }
                }

                // Fallback an toàn nếu sản phẩm chưa có trong DB (ví dụ test/mock)
                if ($realPrice <= 0) {
                    $realPrice = (float)($it['price'] ?? 0);
                }

                $qty = max(1, (int)($it['quantity'] ?? 1));

                // 2. Trừ tồn kho và chống Race Condition (Bán âm kho / Overselling)
                if ($variant && $variant->stock_quantity !== null) {
                    if ($variant->stock_quantity < $qty) {
                        throw new \Exception("Sản phẩm '{$it['product_name']}' ({$it['unit']}) hiện chỉ còn {$variant->stock_quantity} trong kho, không đủ số lượng bạn đặt ({$qty})!");
                    }
                    $variant->decrement('stock_quantity', $qty);
                }

                $itemsTotal += ($realPrice * $qty);

                $farmerId = null;
                if ($productId) {
                    $prod = \App\Models\Product::find($productId);
                    if ($prod) {
                        $farmerId = $prod->farmer_id;
                    }
                }
                if (!$farmerId) {
                    $farmerId = \App\Models\Farmer::value('id');
                }

                $validatedItems[] = [
                    'product_id' => $productId,
                    'variant_id' => $variantId,
                    'farmer_id' => $farmerId,
                    'product_name' => $it['product_name'],
                    'unit' => $it['unit'],
                    'quantity' => $qty,
                    'price' => $realPrice,
                ];
            }

            $zoneId = $data['shipping_zone_id'] ?? null;
            $zone = $zoneId ? $this->orderRepository->getShippingZone($zoneId) : null;

            if (isset($data['shipping_fee'])) {
                $shippingFee = (float)$data['shipping_fee'];
            } else {
                $shippingFee = ($zone && $itemsTotal >= $zone->free_ship_minimum) ? 0 : ($zone ? (float)$zone->base_fee : 0);
            }
            $discountAmount = isset($data['discount_amount']) ? (float)$data['discount_amount'] : 0;
            $voucherCode = $data['voucher_code'] ?? null;
            $totalAmount = max(0, $itemsTotal + $shippingFee - $discountAmount);

            $rawTracking = !empty($data['tracking_number']) ? trim($data['tracking_number']) : null;
            if (!empty($rawTracking)) {
                $exists = $this->orderRepository->findByIdOrTracking($rawTracking);
                $trackingNumber = $exists ? ('GF' . mt_rand(100000, 999999)) : $rawTracking;
            } else {
                $trackingNumber = 'GF' . mt_rand(100000, 999999);
            }

            $orderNote = $data['note'] ?? null;
            if ($voucherCode && $discountAmount > 0) {
                $voucherPrefix = "[Voucher: {$voucherCode} - Giảm " . number_format($discountAmount, 0, ',', '.') . "đ]";
                $orderNote = $orderNote ? ($voucherPrefix . " | " . $orderNote) : $voucherPrefix;
            }

            $order = $this->orderRepository->createOrder([
                'id' => (string) Str::uuid(),
                'tracking_number' => $trackingNumber,
                'customer_name' => $data['customer_name'],
                'customer_phone' => $data['customer_phone'],
                'customer_email' => $data['customer_email'] ?? null,
                'shipping_address' => $data['shipping_address'],
                'to_district_id' => $data['to_district_id'] ?? null,
                'to_ward_code' => !empty($data['to_ward_code']) ? (string)$data['to_ward_code'] : null,
                'shipping_zone_id' => $zoneId,
                'shipping_fee' => $shippingFee,
                'total_amount' => $totalAmount,
                'status' => !empty($data['status']) ? $data['status'] : 'PENDING',
                'payment_method' => $data['payment_method'],
                'payment_status' => $data['payment_status'] ?? 'unpaid',
                'note' => $orderNote,
                'shipper_name' => 'Trần Minh Đức',
                'shipper_phone' => '0912345678',
                'shipper_lat' => 10.7769,
                'shipper_lng' => 106.7009,
                'dest_lat' => 10.7766,
                'dest_lng' => 106.7019,
            ]);

            // ── Tách đơn hàng theo từng Nông Hộ Cung Cấp (Vendor Sub-orders) ──
            $itemsByFarmer = [];
            foreach ($validatedItems as $it) {
                $fId = $it['farmer_id'] ?: (\App\Models\Farmer::value('id') ?? 'default_farmer');
                $itemsByFarmer[$fId][] = $it;
            }

            $vendorIndex = 1;
            $vendorCount = count($itemsByFarmer);
            $allocatedShippingFee = $vendorCount > 0 ? round($shippingFee / $vendorCount, 2) : 0;

            foreach ($itemsByFarmer as $farmerId => $fItems) {
                $farmer = \App\Models\Farmer::find($farmerId);
                $farmerSubtotal = 0;
                foreach ($fItems as $fi) {
                    $farmerSubtotal += ($fi['price'] * $fi['quantity']);
                }

                $commissionRate = $farmer ? (float)$farmer->commission_rate : 8.0;
                $platformCommission = round(($farmerSubtotal * $commissionRate) / 100, 2);
                $netEarnings = max(0, $farmerSubtotal - $platformCommission);
                $subOrderNumber = $order->tracking_number . '-VN' . str_pad((string)$vendorIndex, 2, '0', STR_PAD_LEFT);

                $vendorOrder = \App\Models\VendorOrder::create([
                    'id' => (string) Str::uuid(),
                    'order_id' => $order->id,
                    'farmer_id' => $farmer ? $farmer->id : (\App\Models\Farmer::value('id') ?? $farmerId),
                    'sub_order_number' => $subOrderNumber,
                    'sub_total' => $farmerSubtotal,
                    'shipping_fee' => $allocatedShippingFee,
                    'platform_commission' => $platformCommission,
                    'net_earnings' => $netEarnings,
                    'status' => 'PENDING',
                    'note' => $farmer ? "Kiện hàng nông sản từ {$farmer->farm_name}" : null,
                ]);

                if ($farmer) {
                    $farmer->increment('total_sales_count');
                }

                foreach ($fItems as $it) {
                    $this->orderRepository->createOrderItem([
                        'id' => (string) Str::uuid(),
                        'order_id' => $order->id,
                        'vendor_order_id' => $vendorOrder->id,
                        'product_id' => $it['product_id'],
                        'variant_id' => $it['variant_id'],
                        'product_name' => $it['product_name'],
                        'unit' => $it['unit'],
                        'quantity' => $it['quantity'],
                        'price_at_time' => $it['price'],
                    ]);
                }

                $vendorIndex++;
            }

            DB::commit();

            // Tự động đẩy đơn hàng sang Giao Hàng Nhanh (GHN) cho TẤT CẢ các phương thức thanh toán
            $ghnOrderCodes = [];
            $toDistrictId = !empty($data['to_district_id']) ? (int)$data['to_district_id'] : (int)config('services.ghn.from_district_id', 3440);
            $toWardCode = !empty($data['to_ward_code']) ? (string)$data['to_ward_code'] : '20101';
            $isPaid = ($order->payment_status === 'paid' || in_array($data['payment_method'], ['BANK_TRANSFER', 'MOMO', 'VNPAY', 'ATM_CARD']));

            // 1. Tạo vận đơn GHN riêng biệt cho từng kiện hàng nông hộ (Multi-vendor GHN Sub-orders)
            $vendorOrders = \App\Models\VendorOrder::where('order_id', $order->id)->get();
            foreach ($vendorOrders as $vo) {
                try {
                    $voRes = $this->ghnOrderService->createForVendorOrder($vo, $order, $toWardCode, $toDistrictId, $isPaid);
                    if (!empty($voRes['data']['order_code'])) {
                        $ghnOrderCodes[] = $voRes['data']['order_code'];
                        Log::info("GHN Push Success cho kiện #{$vo->sub_order_number}: Mã vận đơn {$voRes['data']['order_code']}");
                    }
                } catch (\Throwable $e) {
                    Log::error("GHN Vendor Order Push Exception cho kiện #{$vo->id}: " . $e->getMessage());
                }
            }

            // 2. Đồng bộ mã vận đơn GHN chính cho đơn hàng
            $ghnOrderCode = !empty($ghnOrderCodes) ? implode(', ', $ghnOrderCodes) : null;
            if ($ghnOrderCode) {
                $order->ghn_order_code = $ghnOrderCode;
                $order->to_district_id = $toDistrictId;
                $order->to_ward_code = $toWardCode;

                $originalCode = $order->tracking_number;
                $firstGhnCode = $ghnOrderCodes[0] ?? $ghnOrderCode;
                $order->tracking_number = $firstGhnCode;
                $trackingNumber = $firstGhnCode;

                if (!empty($originalCode) && $originalCode !== $firstGhnCode) {
                    $order->note = trim(($order->note ? $order->note . ' | ' : '') . "Mã ref: {$originalCode}");
                }
                $order->save();
            }

            return [
                'success' => true,
                'data' => [
                    'order_id' => $order->id,
                    'tracking_number' => $trackingNumber,
                    'ghn_order_code' => $ghnOrderCode,
                    'total_amount' => $totalAmount,
                    'shipping_fee' => $shippingFee,
                    'status' => $order->status
                ]
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            return [
                'success' => false,
                'message' => 'Có lỗi xảy ra khi tạo đơn hàng: ' . $e->getMessage()
            ];
        }
    }

    public function getOrders(array $filters)
    {
        $orders = $this->orderRepository->getFiltered($filters);

        return $orders->map(function ($order) {
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
                'ghn_order_code' => $order->ghn_order_code,
                'customer' => $order->customer_name,
                'phone' => $order->customer_phone,
                'email' => $order->customer_email,
                'address' => $order->shipping_address,
                'to_district_id' => $order->to_district_id,
                'to_ward_code' => $order->to_ward_code,
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
    }

    public function getMyOrders(string $phone)
    {
        $orders = $this->orderRepository->getByPhone($phone);

        return $orders->map(function ($order) {
            return [
                'code' => $order->tracking_number,
                'ghn_order_code' => $order->ghn_order_code,
                'customer_name' => $order->customer_name,
                'customer_phone' => $order->customer_phone,
                'shipping_address' => $order->shipping_address,
                'date' => $order->created_at->format('Y-m-d H:i'),
                'total' => (float)$order->total_amount,
                'status' => strtolower($order->status),
                'items_count' => $order->items ? $order->items->count() : 0,
            ];
        });
    }

    public function getOrderDetail(string $id)
    {
        return $this->orderRepository->findByIdOrTracking($id);
    }

    public function updateOrderStatus(string $id, string $status): array
    {
        $order = $this->orderRepository->findByIdOrTracking($id);
        if (!$order) {
            return ['success' => false, 'message' => 'Không tìm thấy đơn hàng', 'code' => 404];
        }

        $inputStatus = strtolower($status);
        $dbStatus = match ($inputStatus) {
            'pending' => 'PENDING',
            'processing' => 'CONFIRMED',
            'confirmed' => 'CONFIRMED',
            'shipping' => 'SHIPPING',
            'completed' => 'DELIVERED',
            'delivered' => 'DELIVERED',
            'cancelled' => 'CANCELLED',
            default => strtoupper($status)
        };

        // ── Strict State Machine: Order Status Transitions ──
        // PENDING → CONFIRMED or CANCELLED
        // CONFIRMED → SHIPPING or CANCELLED
        // SHIPPING → DELIVERED only (NO CANCEL allowed!)
        // DELIVERED → final state
        // CANCELLED → final state
        $allowedTransitions = [
            'PENDING'   => ['CONFIRMED', 'CANCELLED'],
            'CONFIRMED' => ['SHIPPING', 'CANCELLED'],
            'SHIPPING'  => ['DELIVERED'],
            'DELIVERED' => [],
            'CANCELLED' => [],
        ];

        $currentStatus = $order->status;
        $allowed = $allowedTransitions[$currentStatus] ?? [];

        if (!in_array($dbStatus, $allowed)) {
            $statusLabels = [
                'PENDING' => 'Chờ xử lý',
                'CONFIRMED' => 'Đã xác nhận',
                'SHIPPING' => 'Đang giao',
                'DELIVERED' => 'Đã giao',
                'CANCELLED' => 'Đã hủy',
            ];
            $currentLabel = $statusLabels[$currentStatus] ?? $currentStatus;
            $targetLabel = $statusLabels[$dbStatus] ?? $dbStatus;

            if ($currentStatus === 'SHIPPING' && $dbStatus === 'CANCELLED') {
                $message = "Không thể hủy đơn hàng đang giao! Đơn hàng ở trạng thái \"{$currentLabel}\" chỉ có thể chuyển sang \"Đã giao\".";
            } elseif (in_array($currentStatus, ['DELIVERED', 'CANCELLED'])) {
                $message = "Đơn hàng đã ở trạng thái cuối cùng \"{$currentLabel}\", không thể thay đổi.";
            } else {
                $message = "Không thể chuyển từ \"{$currentLabel}\" sang \"{$targetLabel}\".";
            }

            return ['success' => false, 'message' => $message, 'code' => 400];
        }

        $updated = $this->orderRepository->updateStatus($order, $dbStatus);

        // ── Đồng bộ trạng thái Vendor Orders & Quyết toán dòng tiền (Payout) ──
        if ($dbStatus === 'DELIVERED' && $currentStatus !== 'DELIVERED') {
            try {
                $vendorOrders = \App\Models\VendorOrder::where('order_id', $order->id)->get();
                foreach ($vendorOrders as $vo) {
                    if ($vo->status !== 'DELIVERED') {
                        $vo->update(['status' => 'DELIVERED']);
                        $farmer = \App\Models\Farmer::find($vo->farmer_id);
                        if ($farmer && $vo->net_earnings > 0) {
                            $farmer->increment('balance_available', (float)$vo->net_earnings);
                            Log::info("Quyết toán ví nông hộ: +{$vo->net_earnings}đ cho {$farmer->farm_name} (#{$farmer->id}) từ Sub-Order {$vo->sub_order_number}");
                        }
                    }
                }
            } catch (\Throwable $e) {
                Log::error("Lỗi quyết toán ví nông hộ khi hoàn tất đơn #{$order->id}: " . $e->getMessage());
            }
        } elseif ($dbStatus === 'CANCELLED' && $currentStatus !== 'CANCELLED') {
            try {
                \App\Models\VendorOrder::where('order_id', $order->id)->update(['status' => 'CANCELLED']);
            } catch (\Throwable $e) {
                Log::warning("Lỗi cập nhật hủy vendor orders cho đơn #{$order->id}: " . $e->getMessage());
            }
        }

        // Khôi phục số lượng tồn kho khi đơn hàng bị HỦY
        if ($dbStatus === 'CANCELLED' && $currentStatus !== 'CANCELLED') {
            try {
                foreach ($order->items as $it) {
                    if (!empty($it->variant_id)) {
                        $variant = \App\Models\ProductVariant::find($it->variant_id);
                        if ($variant && $variant->stock_quantity !== null) {
                            $variant->increment('stock_quantity', (int)$it->quantity);
                        }
                    }
                }
            } catch (\Throwable $e) {
                Log::warning("Lỗi khôi phục tồn kho khi hủy đơn #{$order->id}: " . $e->getMessage());
            }
        }

        return [
            'success' => true,
            'message' => 'Cập nhật trạng thái thành công',
            'data' => [
                'id' => '#' . $updated->tracking_number,
                'status' => strtolower($dbStatus),
                'raw_status' => $dbStatus,
            ]
        ];
    }

    public function trackOrder(string $trackingNumber): ?array
    {
        $code = strtoupper(trim(str_replace(['#', '{', '}', ' '], '', $trackingNumber)));
        if (empty($code)) {
            return null;
        }

        $order = $this->orderRepository->findByIdOrTracking($code);
        if (!$order) {
            return null;
        }

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

        return [
            'id' => $order->tracking_number,
            'ghn_order_code' => $order->ghn_order_code,
            'customer' => $order->customer_name,
            'phone' => $order->customer_phone,
            'address' => $order->shipping_address,
            'date' => $order->created_at->format('Y-m-d H:i'),
            'total' => $order->total_amount - $order->shipping_fee,
            'shippingFee' => (float)$order->shipping_fee,
            'paymentMethod' => $order->payment_method,
            'status' => strtolower($order->status),
            'shipperName' => $order->shipper_name,
            'shipperPhone' => $order->shipper_phone,
            'shipperLat' => (float)$order->shipper_lat,
            'shipperLng' => (float)$order->shipper_lng,
            'destLat' => (float)$order->dest_lat,
            'destLng' => (float)$order->dest_lng,
            'items' => $order->items->map(function ($it) {
                return [
                    'name' => $it->product_name,
                    'unit' => $it->unit,
                    'quantity' => $it->quantity,
                    'price' => (float)$it->price_at_time
                ];
            }),
            'steps' => $steps
        ];
    }

    public function deleteOrder(string $id): bool
    {
        $order = $this->orderRepository->findByIdOrTracking($id);
        if (!$order) {
            return false;
        }
        return $this->orderRepository->delete($order);
    }

    public function retryPushGhn(string $id, ?int $toDistrictId = null, ?string $toWardCode = null): array
    {
        $order = $this->orderRepository->findByIdOrTracking($id);
        if (!$order) {
            return ['success' => false, 'message' => 'Không tìm thấy đơn hàng'];
        }

        if (!empty($order->ghn_order_code)) {
            return [
                'success' => true,
                'message' => 'Đơn hàng đã được đẩy sang GHN với mã: ' . $order->ghn_order_code,
                'data' => [
                    'ghn_order_code' => $order->ghn_order_code,
                    'tracking_number' => $order->tracking_number,
                ]
            ];
        }

        $districtId = $toDistrictId ?: ((int)$order->to_district_id ?: (int)config('services.ghn.from_district_id', 3440));
        $wardCode = $toWardCode ?: ((string)$order->to_ward_code ?: '13010');

        $isPaid = ($order->payment_status === 'paid' || in_array($order->payment_method, ['BANK_TRANSFER', 'MOMO', 'VNPAY']));
        $ghnRes = $this->ghnOrderService->create(
            $order,
            (string)$wardCode,
            (int)$districtId,
            $isPaid
        );

        if (($ghnRes['code'] ?? 0) === 200 && !empty($ghnRes['data']['order_code'])) {
            $ghnOrderCode = $ghnRes['data']['order_code'];
            $order->ghn_order_code = $ghnOrderCode;
            $order->to_district_id = $districtId;
            $order->to_ward_code = $wardCode;
            $order->tracking_number = $ghnOrderCode;
            $order->save();

            Log::info("Admin Push GHN Thành Công: Đơn #{$order->id} -> {$ghnOrderCode}");

            return [
                'success' => true,
                'message' => 'Đã đẩy đơn sang GHN thành công! Mã vận đơn: ' . $ghnOrderCode,
                'data' => [
                    'ghn_order_code' => $ghnOrderCode,
                    'tracking_number' => $ghnOrderCode,
                ]
            ];
        }

        $errMsg = $ghnRes['message'] ?? $ghnRes['code_message_value'] ?? 'GHN từ chối tạo đơn';
        return [
            'success' => false,
            'message' => 'Lỗi từ GHN: ' . $errMsg,
            'raw' => $ghnRes
        ];
    }
}
