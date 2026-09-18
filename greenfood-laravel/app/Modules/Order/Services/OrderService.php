<?php

namespace App\Modules\Order\Services;

use App\Modules\Order\Repositories\OrderRepository;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderService
{
    public function __construct(
        protected OrderRepository $orderRepository
    ) {}

    public function placeOrder(array $data): array
    {
        try {
            DB::beginTransaction();

            $zone = $this->orderRepository->getShippingZone($data['shipping_zone_id']);
            $itemsTotal = 0;
            foreach ($data['items'] as $it) {
                $itemsTotal += ($it['price'] * $it['quantity']);
            }

            $shippingFee = ($zone && $itemsTotal >= $zone->free_ship_minimum) ? 0 : ($zone ? (float)$zone->base_fee : 0);
            $totalAmount = $itemsTotal + $shippingFee;
            $trackingNumber = 'GF' . mt_rand(100000, 999999);

            $order = $this->orderRepository->createOrder([
                'id' => (string) Str::uuid(),
                'tracking_number' => $trackingNumber,
                'customer_name' => $data['customer_name'],
                'customer_phone' => $data['customer_phone'],
                'customer_email' => $data['customer_email'] ?? null,
                'shipping_address' => $data['shipping_address'],
                'shipping_zone_id' => $data['shipping_zone_id'],
                'shipping_fee' => $shippingFee,
                'total_amount' => $totalAmount,
                'status' => 'PENDING',
                'payment_method' => $data['payment_method'],
                'note' => $data['note'] ?? null,
                'shipper_name' => 'Trần Minh Đức',
                'shipper_phone' => '0912345678',
                'shipper_lat' => 10.7769,
                'shipper_lng' => 106.7009,
                'dest_lat' => 10.7766,
                'dest_lng' => 106.7019,
            ]);

            foreach ($data['items'] as $it) {
                $productId = $this->orderRepository->resolveProductId($it['product_id'] ?? null, $it['product_name']);
                $variantId = $this->orderRepository->resolveVariantId($it['variant_id'] ?? null);

                $this->orderRepository->createOrderItem([
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

            DB::commit();

            return [
                'success' => true,
                'data' => [
                    'order_id' => $order->id,
                    'tracking_number' => $trackingNumber,
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
    }

    public function getMyOrders(string $phone)
    {
        $orders = $this->orderRepository->getByPhone($phone);

        return $orders->map(function ($order) {
            return [
                'code' => $order->tracking_number,
                'date' => $order->created_at->toIso8601String(),
                'total' => (float)$order->total_amount,
                'status' => $order->status
            ];
        });
    }

    public function getOrderDetail(string $id)
    {
        return $this->orderRepository->findByIdOrTracking($id);
    }

    public function updateOrderStatus(string $id, string $status): ?array
    {
        $order = $this->orderRepository->findByIdOrTracking($id);
        if (!$order) {
            return null;
        }

        $inputStatus = strtolower($status);
        $dbStatus = match ($inputStatus) {
            'pending' => 'PENDING',
            'processing' => 'SHIPPING',
            'shipping' => 'SHIPPING',
            'confirmed' => 'CONFIRMED',
            'completed' => 'DELIVERED',
            'delivered' => 'DELIVERED',
            'cancelled' => 'CANCELLED',
            default => strtoupper($status)
        };

        $updated = $this->orderRepository->updateStatus($order, $dbStatus);

        return [
            'id' => '#' . $updated->tracking_number,
            'status' => strtolower($dbStatus),
            'raw_status' => $dbStatus
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
}
