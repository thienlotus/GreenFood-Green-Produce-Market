<?php

declare(strict_types=1);

namespace App\Modules\Chat\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Chat\Services\ChatService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ChatController extends Controller
{
    public function __construct(
        protected ChatService $chatService
    ) {}

    /**
     * GET /api/chat/conversations
     * List all conversations with filters (Admin, Customer, or Farmer)
     */
    public function index(Request $request): JsonResponse
    {
        $customerId = $request->get('customer_id');
        $farmerId = $request->get('farmer_id');

        if ($customerId) {
            $customerId = $this->resolveCustomerId((string) $customerId);
        }
        if ($farmerId) {
            $farmerId = $this->resolveFarmerId((string) $farmerId);
        }

        $filters = [
            'status' => $request->get('status'),
            'customer_id' => $customerId,
            'farmer_id' => $farmerId,
            'type' => $request->get('type'),
        ];

        $conversations = $this->chatService->getConversations($filters);

        return response()->json([
            'success' => true,
            'count' => $conversations->count(),
            'data' => $conversations,
        ]);
    }

    /**
     * POST /api/chat/conversations
     * Create a new conversation between Customer and Admin/AI Bot
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'customer_id' => 'required|string',
            'subject' => 'nullable|string|max:255',
            'message' => 'nullable|string|max:2000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
            ], 422);
        }

        $customerId = $this->resolveCustomerId((string) $request->customer_id);

        $result = $this->chatService->createConversation(
            $customerId,
            (string) ($request->subject ?? 'Hỗ trợ khách hàng'),
            $request->message ? (string) $request->message : null
        );

        return response()->json([
            'success' => true,
            'message' => 'Đã tạo cuộc hội thoại!',
            'data' => $result,
        ], 201);
    }

    /**
     * POST /api/chat/customer/conversations/farmer
     * Create or retrieve conversation between Customer and Farmer Shop (Shopee style)
     */
    public function startCustomerFarmerChat(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'customer_id' => 'required|string',
            'farmer_id' => 'required|string',
            'product_id' => 'nullable|string',
            'message' => 'nullable|string|max:2000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
            ], 422);
        }

        $customerId = $this->resolveCustomerId((string) $request->customer_id);
        $farmerId = $this->resolveFarmerId((string) $request->farmer_id);
        $productId = $this->resolveProductId($request->product_id ? (string) $request->product_id : null);

        $result = $this->chatService->createCustomerFarmerConversation(
            $customerId,
            $farmerId,
            $productId,
            $request->message ? (string) $request->message : null
        );

        return response()->json([
            'success' => true,
            'message' => 'Đã kết nối với gian hàng nông hộ!',
            'data' => $result,
        ], 200);
    }

    /**
     * POST /api/chat/farmer/conversations/admin
     * Create or retrieve conversation between Farmer and Marketplace Admin
     */
    public function startFarmerAdminChat(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'farmer_id' => 'required|string',
            'message' => 'nullable|string|max:2000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
            ], 422);
        }

        $farmerId = $this->resolveFarmerId((string) $request->farmer_id);

        $result = $this->chatService->createFarmerAdminConversation(
            $farmerId,
            $request->message ? (string) $request->message : null
        );

        return response()->json([
            'success' => true,
            'message' => 'Đã kết nối với Ban Quản Trị Sàn GreenFood!',
            'data' => $result,
        ], 200);
    }

    /**
     * POST /api/chat/farmer/conversations/customer
     * Nông hộ chủ động mở chat với Khách mua hàng
     */
    public function startFarmerCustomerChat(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'farmer_id' => 'required|string',
            'customer_id' => 'required|string',
            'product_id' => 'nullable|string',
            'message' => 'nullable|string|max:2000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
            ], 422);
        }

        $farmerId = $this->resolveFarmerId((string) $request->farmer_id);
        $customerId = $this->resolveCustomerId((string) $request->customer_id);
        $productId = $this->resolveProductId($request->product_id ? (string) $request->product_id : null);

        $result = $this->chatService->createFarmerCustomerConversation(
            $farmerId,
            $customerId,
            $productId,
            $request->message ? (string) $request->message : null
        );

        return response()->json([
            'success' => true,
            'message' => 'Đã kết nối với khách hàng!',
            'data' => $result,
        ], 200);
    }

    /**
     * GET /api/chat/conversations/{id}
     * Get conversation detail with messages
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $viewerRole = $request->get('viewer_role', 'admin');
        $result = $this->chatService->getConversationMessages($id, $viewerRole);

        if (!$result) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy cuộc hội thoại',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $result,
        ]);
    }

    /**
     * GET /api/chat/conversations/{id}/customer
     * Get conversation messages for customer view
     */
    public function customerMessages(Request $request, string $id): JsonResponse
    {
        $customerId = $request->get('customer_id');
        if (!$customerId) {
            return response()->json([
                'success' => false,
                'message' => 'Thiếu customer_id',
            ], 400);
        }

        $resolvedCustomerId = $this->resolveCustomerId((string) $customerId);
        $result = $this->chatService->getCustomerMessages($resolvedCustomerId, $id);

        if (!$result) {
            // Thử lấy tin nhắn trực tiếp nếu hội thoại tồn tại
            $result = $this->chatService->getConversationMessages($id, 'customer');
            if (!$result) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy cuộc hội thoại',
                ], 404);
            }
        }

        return response()->json([
            'success' => true,
            'data' => $result,
        ]);
    }

    /**
     * POST /api/chat/conversations/{id}/messages
     * Send a message (Roles: customer, farmer, admin)
     */
    public function sendMessage(Request $request, string $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'sender_id' => 'required|string',
            'sender_role' => 'required|in:customer,admin,farmer',
            'message' => 'required|string|max:2000',
            'message_type' => 'nullable|in:text,image,system',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
            ], 422);
        }

        $rawSenderId = (string) $request->sender_id;
        $senderRole = (string) $request->sender_role;

        // Tự động map sender_id sang user_id hợp lệ trong bảng users theo Role
        if ($senderRole === 'farmer') {
            $farmer = \App\Models\Farmer::find($rawSenderId);
            if ($farmer && $farmer->user_id) {
                $senderId = (string) $farmer->user_id;
            } else {
                $userCheck = \App\Models\User::find($rawSenderId);
                if ($userCheck) {
                    $senderId = (string) $userCheck->id;
                } else {
                    $conv = \App\Models\ChatConversation::find($id);
                    if ($conv && $conv->farmer && $conv->farmer->user_id) {
                        $senderId = (string) $conv->farmer->user_id;
                    } else {
                        $vendorUser = \App\Models\User::where('email', 'nongdan@greenfood.vn')->first()
                            ?? \App\Models\User::where('role', 'VENDOR')->first()
                            ?? \App\Models\User::first();
                        $senderId = $vendorUser ? (string) $vendorUser->id : $rawSenderId;
                    }
                }
            }
        } elseif ($senderRole === 'admin') {
            $senderId = $this->resolveAdminId($rawSenderId);
        } else {
            // customer
            $senderId = $this->resolveCustomerId($rawSenderId);
        }

        $result = $this->chatService->sendMessage(
            $id,
            $senderId,
            $senderRole,
            (string) $request->message,
            (string) ($request->message_type ?? 'text')
        );

        if (!$result) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy cuộc hội thoại',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Đã gửi tin nhắn!',
            'data' => $result,
        ], 201);
    }

    /**
     * PUT /api/chat/conversations/{id}/assign
     * Admin assigns themselves to a conversation
     */
    public function assign(Request $request, string $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'admin_id' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
            ], 422);
        }

        $adminId = $this->resolveAdminId((string) $request->admin_id);
        $success = $this->chatService->assignAdmin($id, $adminId);

        if (!$success) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy cuộc hội thoại',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Đã nhận xử lý cuộc hội thoại!',
        ]);
    }

    /**
     * PUT /api/chat/conversations/{id}/close
     * Close a conversation
     */
    public function close(string $id): JsonResponse
    {
        $success = $this->chatService->closeConversation($id);

        if (!$success) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy cuộc hội thoại',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Đã đóng cuộc hội thoại!',
        ]);
    }

    /**
     * GET /api/chat/unread-count
     * Get unread messages count for Admin, Customer, or Farmer
     */
    public function unreadCount(Request $request): JsonResponse
    {
        $userId = $request->get('user_id');
        $role = (string) $request->get('role', 'admin');
        $farmerId = $request->get('farmer_id');

        if (!$userId && !$farmerId) {
            return response()->json([
                'success' => true,
                'data' => ['count' => 0],
            ]);
        }

        $resolvedUserId = $userId ? $this->resolveCustomerId((string) $userId) : '';
        $resolvedFarmerId = $farmerId ? $this->resolveFarmerId((string) $farmerId) : null;

        $count = $this->chatService->getUnreadCount(
            $resolvedUserId,
            $role,
            $resolvedFarmerId
        );

        return response()->json([
            'success' => true,
            'data' => ['count' => $count],
        ]);
    }

    /**
     * Resolve Customer ID từ chuỗi bất kỳ (UUID, demo id 'usr-cust-02', guest id, email) sang User ID hợp lệ trong DB
     */
    private function resolveCustomerId(?string $rawId, ?string $email = null): string
    {
        if (!empty($rawId)) {
            $user = \App\Models\User::find($rawId);
            if ($user) {
                return (string) $user->id;
            }
        }

        if (!empty($email)) {
            $user = \App\Models\User::where('email', $email)->first();
            if ($user) {
                return (string) $user->id;
            }
        }

        // Demo account: usr-cust-02 hoặc email khachhang@greenfood.vn
        if ($rawId === 'usr-cust-02' || $rawId === 'khachhang@greenfood.vn') {
            $user = \App\Models\User::where('email', 'khachhang@greenfood.vn')->first();
            if ($user) {
                return (string) $user->id;
            }
        }

        // Guest account: guest@greenfood.vn
        $guest = \App\Models\User::where('email', 'guest@greenfood.vn')->first();
        if ($guest) {
            return (string) $guest->id;
        }

        // Fallback: Tìm user role CUSTOMER bất kỳ hoặc User đầu tiên
        $firstCustomer = \App\Models\User::where('role', 'CUSTOMER')->first() ?? \App\Models\User::first();
        return $firstCustomer ? (string) $firstCustomer->id : (string) \Illuminate\Support\Str::uuid();
    }

    /**
     * Resolve Farmer ID từ chuỗi bất kỳ (UUID bảng farmers, user_id, demo id 'usr-farm-03', farm_name) sang Farmer ID hợp lệ trong DB
     */
    private function resolveFarmerId(?string $rawId): string
    {
        if (!empty($rawId)) {
            $farmer = \App\Models\Farmer::find($rawId);
            if ($farmer) {
                return (string) $farmer->id;
            }

            // Thử tìm theo user_id
            $farmerByUser = \App\Models\Farmer::where('user_id', $rawId)->first();
            if ($farmerByUser) {
                return (string) $farmerByUser->id;
            }
        }

        // Demo account: usr-farm-03 hoặc nông dân đà lạt
        if ($rawId === 'usr-farm-03' || $rawId === 'nongdan@greenfood.vn') {
            $farmerUser = \App\Models\User::where('email', 'nongdan@greenfood.vn')->first();
            if ($farmerUser) {
                $farmer = \App\Models\Farmer::where('user_id', $farmerUser->id)->first();
                if ($farmer) {
                    return (string) $farmer->id;
                }
            }
            $farmerByFarmName = \App\Models\Farmer::where('farm_name', 'like', '%Đà Lạt%')->first();
            if ($farmerByFarmName) {
                return (string) $farmerByFarmName->id;
            }
        }

        $firstFarmer = \App\Models\Farmer::first();
        return $firstFarmer ? (string) $firstFarmer->id : (string) $rawId;
    }

    /**
     * Resolve Admin ID từ chuỗi bất kỳ (UUID bảng users, demo id 'usr-admin-01', email) sang User ID hợp lệ trong DB
     */
    private function resolveAdminId(?string $rawId): string
    {
        if (!empty($rawId)) {
            $admin = \App\Models\User::find($rawId);
            if ($admin && ($admin->role === 'ADMIN' || $admin->role === 'admin')) {
                return (string) $admin->id;
            }
        }

        $adminUser = \App\Models\User::where('email', 'admin@greenfood.vn')->first()
            ?? \App\Models\User::where('role', 'ADMIN')->first()
            ?? \App\Models\User::first();

        return $adminUser ? (string) $adminUser->id : (string) $rawId;
    }

    /**
     * Resolve Product ID (UUID bảng products hoặc slug)
     */
    private function resolveProductId(?string $rawId): ?string
    {
        if (empty($rawId)) {
            return null;
        }

        $product = \App\Models\Product::find($rawId);
        if ($product) {
            return (string) $product->id;
        }

        $productBySlug = \App\Models\Product::where('slug', $rawId)->first();
        if ($productBySlug) {
            return (string) $productBySlug->id;
        }

        return null;
    }
}
