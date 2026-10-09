<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class NotificationController extends Controller
{
    /**
     * Cache key cho danh sách thông báo
     */
    protected string $cacheKey = 'greenfood_customer_notifications';

    /**
     * Danh sách thông báo mặc định chuẩn Shopee
     */
    protected function getDefaultNotifications(): array
    {
        return [
            [
                'id' => 'notif-1',
                'type' => 'order',
                'title' => 'Giao hàng thành công: Đơn #GF-883921',
                'message' => 'Kiện hàng 2kg Bưởi da xanh Bến Tre & 1kg Dâu tây Đà Lạt đã được giao đến bạn. Hãy chia sẻ đánh giá để nhận 50 xu nhé!',
                'timestamp' => now()->subMinutes(25)->toIso8601String(),
                'is_read' => false,
                'link' => '/tracking?order=GF-883921',
                'order_code' => 'GF-883921',
                'tag' => 'Giao thành công',
            ],
            [
                'id' => 'notif-2',
                'type' => 'promotion',
                'title' => 'VOUCHER KHỦNG 30K ĐÃ VÀO VÍ 🎁',
                'message' => 'Mã GREEN30 giảm 30.000đ cho đơn nông sản từ 200.000đ đã sẵn sàng. Áp dụng cho mọi loại trái cây & rau củ hữu cơ.',
                'timestamp' => now()->subHours(2)->toIso8601String(),
                'is_read' => false,
                'link' => '/products',
                'tag' => 'Voucher HOT',
            ],
            [
                'id' => 'notif-3',
                'type' => 'order',
                'title' => 'Đang vận chuyển: Đơn hàng #GF-720194',
                'message' => 'Tài xế GHN đang giao rau củ quả chuẩn VietGAP từ nông hộ Bến Tre đến địa chỉ của bạn. Dự kiến giao hôm nay.',
                'timestamp' => now()->subHours(5)->toIso8601String(),
                'is_read' => false,
                'link' => '/tracking?order=GF-720194',
                'order_code' => 'GF-720194',
                'tag' => 'Đang vận chuyển',
            ],
            [
                'id' => 'notif-4',
                'type' => 'payment',
                'title' => 'Thanh toán thẻ ATM Napas thành công',
                'message' => 'Giao dịch thanh toán 185.000đ cho đơn hàng #GF-662910 đã được ngân hàng xác nhận thành công.',
                'timestamp' => now()->subHours(24)->toIso8601String(),
                'is_read' => true,
                'link' => '/tracking?order=GF-662910',
                'order_code' => 'GF-662910',
                'tag' => 'Thẻ ATM Napas',
            ],
            [
                'id' => 'notif-5',
                'type' => 'promotion',
                'title' => 'Flash Sale 12:00: Nông sản giảm sốc 35%',
                'message' => 'Sầu riêng Ri6 Tây Nguyên & Dưa lưới chuẩn VietGAP ưu đãi cực lớn. Số lượng có hạn trong ngày!',
                'timestamp' => now()->subHours(28)->toIso8601String(),
                'is_read' => true,
                'link' => '/products',
                'tag' => 'Flash Sale',
            ],
            [
                'id' => 'notif-6',
                'type' => 'system',
                'title' => 'Chào mừng bạn đến với GreenFood Market! 🌱',
                'message' => 'Tặng ngay 100 Điểm VIP cho tài khoản mới. Chúc bạn có trải nghiệm mua sắm nông sản sạch tươi ngon!',
                'timestamp' => now()->subHours(48)->toIso8601String(),
                'is_read' => true,
                'link' => '/profile',
                'tag' => 'Hệ thống',
            ],
        ];
    }

    /**
     * GET /api/v1/notifications
     * Lấy danh sách thông báo
     */
    public function index(Request $request)
    {
        $notifications = Cache::get($this->cacheKey, $this->getDefaultNotifications());

        $type = $request->query('type');
        if (!empty($type) && $type !== 'all') {
            $notifications = array_values(array_filter($notifications, function ($n) use ($type) {
                return ($n['type'] ?? '') === $type;
            }));
        }

        $unreadCount = count(array_filter($notifications, fn($n) => empty($n['is_read'])));

        return response()->json([
            'success' => true,
            'unread_count' => $unreadCount,
            'count' => count($notifications),
            'data' => $notifications
        ], 200);
    }

    /**
     * POST /api/v1/notifications
     * Tạo thông báo mới
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'type' => 'nullable|string|in:order,promotion,payment,system',
        ]);

        $notifications = Cache::get($this->cacheKey, $this->getDefaultNotifications());

        $newNotif = [
            'id' => 'notif-' . time() . '-' . Str::random(4),
            'type' => $request->input('type', 'system'),
            'title' => $request->input('title'),
            'message' => $request->input('message'),
            'timestamp' => now()->toIso8601String(),
            'is_read' => false,
            'link' => $request->input('link', '/notifications'),
            'order_code' => $request->input('order_code'),
            'tag' => $request->input('tag', 'Mới'),
        ];

        array_unshift($notifications, $newNotif);
        Cache::put($this->cacheKey, $notifications, now()->addDays(7));

        return response()->json([
            'success' => true,
            'message' => 'Tạo thông báo thành công',
            'data' => $newNotif
        ], 201);
    }

    /**
     * PUT /api/v1/notifications/mark-all-read
     * Đánh dấu tất cả là đã đọc
     */
    public function markAllRead()
    {
        $notifications = Cache::get($this->cacheKey, $this->getDefaultNotifications());
        foreach ($notifications as &$n) {
            $n['is_read'] = true;
        }
        Cache::put($this->cacheKey, $notifications, now()->addDays(7));

        return response()->json([
            'success' => true,
            'message' => 'Đã đánh dấu đã đọc tất cả thông báo',
            'unread_count' => 0
        ], 200);
    }

    /**
     * PUT /api/v1/notifications/{id}/read
     * Đánh dấu đã đọc một thông báo
     */
    public function markAsRead(string $id)
    {
        $notifications = Cache::get($this->cacheKey, $this->getDefaultNotifications());
        $found = false;
        foreach ($notifications as &$n) {
            if ($n['id'] === $id) {
                $n['is_read'] = true;
                $found = true;
                break;
            }
        }
        if ($found) {
            Cache::put($this->cacheKey, $notifications, now()->addDays(7));
        }

        return response()->json([
            'success' => true,
            'message' => $found ? 'Đã đánh dấu đã đọc thông báo' : 'Không tìm thấy thông báo',
        ], 200);
    }
}
