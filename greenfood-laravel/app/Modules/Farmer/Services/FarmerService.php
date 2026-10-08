<?php

namespace App\Modules\Farmer\Services;

use App\Modules\Farmer\Repositories\FarmerRepository;

class FarmerService
{
    public function __construct(
        protected FarmerRepository $farmerRepository
    ) {}

    public function getFarmers(array $filters)
    {
        return $this->farmerRepository->getFiltered($filters);
    }

    public function getFarmer(string|int $id)
    {
        return $this->farmerRepository->findById($id);
    }

    public function getAllForAdmin()
    {
        return $this->farmerRepository->getAllForAdmin();
    }

    public function getFarmerByUserId(string $userId)
    {
        return $this->farmerRepository->findByUserId($userId);
    }

    public function registerFarmer(array $data)
    {
        // 1. Kiểm tra hoặc tạo User tài khoản nông hộ
        $phone = $data['phone'] ?? null;
        $email = $data['email'] ?? null;
        $name = $data['name'] ?? $data['farm_name'];

        $user = null;
        if ($phone) {
            $user = \App\Models\User::where('phone', $phone)->first();
        }
        if (!$user && $email) {
            $user = \App\Models\User::where('email', $email)->first();
        }

        if (!$user) {
            $user = \App\Models\User::create([
                'name' => $name,
                'full_name' => $name,
                'phone' => $phone ?? ('09' . random_int(10000000, 99999999)),
                'email' => $email ?? ('farmer_' . time() . '@greenfood.asia'),
                'password' => bcrypt('GreenFood@123'),
                'role' => 'VENDOR',
                'email_verified' => true,
            ]);
        } else {
            // Cập nhật role nếu chưa có
            if ($user->role !== 'ADMIN') {
                $user->update(['role' => 'VENDOR']);
            }
        }

        // 2. Tự động phân giải Tọa độ GPS & Region ID dựa trên địa chỉ thực tế
        $address = $data['address'] ?? $data['location'] ?? 'Việt Nam';
        $geo = \App\Services\VietnamGeoService::resolve(
            $address,
            isset($data['latitude']) ? (float) $data['latitude'] : null,
            isset($data['longitude']) ? (float) $data['longitude'] : null,
            isset($data['region_id']) ? (int) $data['region_id'] : null
        );

        // 3. Tổng hợp thông tin chứng minh uy tín và năng lực canh tác
        $storyDetails = [];
        if (!empty($data['certifications'])) {
            $certs = is_array($data['certifications']) ? implode(', ', $data['certifications']) : $data['certifications'];
            $storyDetails[] = "Chứng nhận chất lượng: " . $certs;
        }
        if (!empty($data['cert_code'])) {
            $storyDetails[] = "Mã số chứng nhận/Cơ quan cấp: " . $data['cert_code'];
        }
        if (!empty($data['tax_id'])) {
            $storyDetails[] = "Mã số thuế/CCCD đại diện: " . $data['tax_id'];
        }
        if (!empty($data['farm_area'])) {
            $storyDetails[] = "Diện tích canh tác: " . $data['farm_area'];
        }
        if (!empty($data['farming_method'])) {
            $storyDetails[] = "Phương thức canh tác: " . $data['farming_method'];
        }
        if (!empty($data['experience_years'])) {
            $storyDetails[] = "Kinh nghiệm canh tác: " . $data['experience_years'];
        }
        if (!empty($data['scale'])) {
            $storyDetails[] = "Quy mô sản lượng: " . $data['scale'];
        }
        if (!empty($data['note'])) {
            $storyDetails[] = "Ghi chú: " . $data['note'];
        }

        $fullStory = !empty($storyDetails) ? implode("\n", $storyDetails) : ($data['note'] ?? $data['story'] ?? 'Nông trại cam kết canh tác sạch, đạt tiêu chuẩn an toàn thực phẩm.');

        // 4. Tạo hồ sơ Farmer với đầy đủ tọa độ chính xác
        return $this->farmerRepository->create([
            'user_id' => $user->id,
            'farm_name' => $data['farm_name'],
            'story' => $fullStory,
            'address' => $address,
            'region_id' => $geo['region_id'],
            'latitude' => $geo['latitude'],
            'longitude' => $geo['longitude'],
            'specialty' => $data['specialty'] ?? (!empty($data['certifications']) ? 'Chuẩn ' . (is_array($data['certifications']) ? $data['certifications'][0] : $data['certifications']) : 'Nông sản hữu cơ'),
            'rating' => 5.0,
            'is_verified' => false, // Chờ admin duyệt
            'image_url' => $data['image_url'] ?? 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600',
        ]);
    }

    public function updateFarmer(string|int $id, array $data): ?\App\Models\Farmer
    {
        $farmer = $this->farmerRepository->findById($id);
        if (!$farmer) {
            return null;
        }

        $address = $data['address'] ?? $farmer->address;
        $lat = isset($data['latitude']) ? (float) $data['latitude'] : $farmer->latitude;
        $lng = isset($data['longitude']) ? (float) $data['longitude'] : $farmer->longitude;
        $regionId = isset($data['region_id']) ? (int) $data['region_id'] : $farmer->region_id;

        // Nếu địa chỉ thay đổi mà không truyền tọa độ mới, hoặc tọa độ đang trống => Tự động phân giải lại
        if ((empty($lat) || empty($lng) || (isset($data['address']) && $data['address'] !== $farmer->address && !isset($data['latitude'])))) {
            $geo = \App\Services\VietnamGeoService::resolve($address, $lat, $lng, $regionId);
            $lat = $geo['latitude'];
            $lng = $geo['longitude'];
            $regionId = $geo['region_id'];
        }

        $updateData = [];
        if (isset($data['farm_name'])) $updateData['farm_name'] = $data['farm_name'];
        if (isset($data['story'])) $updateData['story'] = $data['story'];
        if (isset($data['address'])) $updateData['address'] = $address;
        if (isset($data['specialty'])) $updateData['specialty'] = $data['specialty'];
        if (isset($data['image_url'])) $updateData['image_url'] = $data['image_url'];
        if (isset($data['is_verified'])) $updateData['is_verified'] = (bool) $data['is_verified'];
        $updateData['latitude'] = $lat;
        $updateData['longitude'] = $lng;
        $updateData['region_id'] = $regionId;

        $this->farmerRepository->update($farmer, $updateData);

        return $this->farmerRepository->findById($id);
    }

    public function updateVerification(string|int $id, bool $isVerified): bool
    {
        return $this->farmerRepository->update($id, [
            'is_verified' => $isVerified,
        ]);
    }

    public function deleteFarmer(string|int $id): bool
    {
        return $this->farmerRepository->delete($id);
    }

    public function getFarmerOrders(string $farmerId, array $filters = [])
    {
        $query = \App\Models\VendorOrder::with(['order', 'items.product', 'items.variant'])
            ->where('farmer_id', $farmerId)
            ->latest();

        if (!empty($filters['status']) && $filters['status'] !== 'all') {
            $query->where('status', strtoupper($filters['status']));
        }

        if (!empty($filters['search'])) {
            $search = trim($filters['search']);
            $query->where(function ($q) use ($search) {
                $q->where('sub_order_number', 'like', "%{$search}%")
                  ->orWhereHas('order', function ($oq) use ($search) {
                      $oq->where('customer_name', 'like', "%{$search}%")
                         ->orWhere('customer_phone', 'like', "%{$search}%")
                         ->orWhere('tracking_number', 'like', "%{$search}%");
                  });
            });
        }

        return $query->get()->map(function ($vo) {
            return [
                'id' => $vo->id,
                'sub_order_number' => $vo->sub_order_number,
                'order_id' => $vo->order_id,
                'master_tracking' => $vo->order?->tracking_number,
                'customer_name' => $vo->order?->customer_name,
                'customer_phone' => $vo->order?->customer_phone,
                'shipping_address' => $vo->order?->shipping_address,
                'payment_method' => $vo->order?->payment_method,
                'payment_status' => $vo->order?->payment_status,
                'sub_total' => (float)$vo->sub_total,
                'shipping_fee' => (float)$vo->shipping_fee,
                'platform_commission' => (float)$vo->platform_commission,
                'net_earnings' => (float)$vo->net_earnings,
                'status' => $vo->status,
                'ghn_order_code' => $vo->ghn_order_code,
                'note' => $vo->note,
                'created_at' => $vo->created_at->format('Y-m-d H:i:s'),
                'items_count' => $vo->items->sum('quantity'),
                'items' => $vo->items->map(function ($it) {
                    return [
                        'id' => $it->id,
                        'product_id' => $it->product_id,
                        'product_name' => $it->product_name,
                        'unit' => $it->unit,
                        'quantity' => $it->quantity,
                        'price' => (float)$it->price_at_time,
                        'subtotal' => (float)($it->price_at_time * $it->quantity),
                        'image_url' => $it->product?->image_url,
                    ];
                })
            ];
        });
    }

    public function updateVendorOrderStatus(string $vendorOrderId, string $status, ?string $farmerId = null): array
    {
        $query = \App\Models\VendorOrder::where('id', $vendorOrderId);
        if ($farmerId) {
            $query->where('farmer_id', $farmerId);
        }
        $vendorOrder = $query->first();

        if (!$vendorOrder) {
            return ['success' => false, 'message' => 'Không tìm thấy đơn hàng nông hộ', 'code' => 404];
        }

        $targetStatus = strtoupper($status);
        $allowedStatuses = ['PENDING', 'CONFIRMED', 'PACKING', 'SHIPPING', 'DELIVERED', 'CANCELLED'];
        if (!in_array($targetStatus, $allowedStatuses)) {
            return ['success' => false, 'message' => 'Trạng thái đơn hàng không hợp lệ', 'code' => 400];
        }

        $prevStatus = $vendorOrder->status;
        $vendorOrder->update(['status' => $targetStatus]);

        // Nếu chuyển sang DELIVERED và trước đó chưa hoàn tất, cộng tiền ví cho nông hộ
        if ($targetStatus === 'DELIVERED' && $prevStatus !== 'DELIVERED') {
            $farmer = \App\Models\Farmer::find($vendorOrder->farmer_id);
            if ($farmer && $vendorOrder->net_earnings > 0) {
                $farmer->increment('balance_available', (float)$vendorOrder->net_earnings);
            }
        }

        // Kiểm tra xem tất cả các Vendor Orders của Master Order đã DELIVERED chưa
        $masterOrder = \App\Models\Order::find($vendorOrder->order_id);
        if ($masterOrder) {
            $allDelivered = !\App\Models\VendorOrder::where('order_id', $masterOrder->id)
                ->where('status', '!=', 'DELIVERED')
                ->where('status', '!=', 'CANCELLED')
                ->exists();

            if ($allDelivered && $targetStatus === 'DELIVERED' && $masterOrder->status !== 'DELIVERED') {
                $masterOrder->update(['status' => 'DELIVERED']);
            }
        }

        return [
            'success' => true,
            'message' => 'Cập nhật trạng thái kiện hàng thành công',
            'data' => [
                'id' => $vendorOrder->id,
                'status' => $targetStatus,
                'sub_order_number' => $vendorOrder->sub_order_number,
            ]
        ];
    }

    public function getFarmerWallet(string $farmerId): ?array
    {
        $farmer = $this->farmerRepository->findById($farmerId);
        if (!$farmer) {
            return null;
        }

        $vendorOrders = \App\Models\VendorOrder::where('farmer_id', $farmerId)->get();
        $totalGrossRevenue = (float)$vendorOrders->where('status', 'DELIVERED')->sum('sub_total');
        $totalCommissionPaid = (float)$vendorOrders->where('status', 'DELIVERED')->sum('platform_commission');
        $totalNetEarnings = (float)$vendorOrders->where('status', 'DELIVERED')->sum('net_earnings');
        $pendingPayout = (float)$vendorOrders->whereIn('status', ['PENDING', 'CONFIRMED', 'PACKING', 'SHIPPING'])->sum('net_earnings');

        return [
            'farmer_id' => $farmer->id,
            'farm_name' => $farmer->farm_name,
            'balance_available' => (float)$farmer->balance_available,
            'pending_payout' => $pendingPayout,
            'total_gross_revenue' => $totalGrossRevenue,
            'total_commission_paid' => $totalCommissionPaid,
            'total_net_earnings' => $totalNetEarnings,
            'commission_rate' => (float)$farmer->commission_rate,
            'total_orders' => $vendorOrders->count(),
            'delivered_orders_count' => $vendorOrders->where('status', 'DELIVERED')->count(),
            'bank_info' => [
                'bank_name' => $farmer->bank_name,
                'bank_account_number' => $farmer->bank_account_number,
                'bank_account_name' => $farmer->bank_account_name,
            ]
        ];
    }

    public function updateBankInfo(string $farmerId, array $bankData): bool
    {
        $farmer = $this->farmerRepository->findById($farmerId);
        if (!$farmer) {
            return false;
        }

        return $this->farmerRepository->update($farmer, [
            'bank_name' => $bankData['bank_name'] ?? $farmer->bank_name,
            'bank_account_number' => $bankData['bank_account_number'] ?? $farmer->bank_account_number,
            'bank_account_name' => $bankData['bank_account_name'] ?? $farmer->bank_account_name,
        ]);
    }
}
