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
        $filters = [
            'status' => $request->get('status'),
            'customer_id' => $request->get('customer_id'),
            'farmer_id' => $request->get('farmer_id'),
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
            'customer_id' => 'required|uuid|exists:users,id',
            'subject' => 'nullable|string|max:255',
            'message' => 'nullable|string|max:2000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
            ], 422);
        }

        $result = $this->chatService->createConversation(
            (string) $request->customer_id,
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
            'customer_id' => 'required|uuid|exists:users,id',
            'farmer_id' => 'required|uuid|exists:farmers,id',
            'product_id' => 'nullable|uuid|exists:products,id',
            'message' => 'nullable|string|max:2000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
            ], 422);
        }

        $result = $this->chatService->createCustomerFarmerConversation(
            (string) $request->customer_id,
            (string) $request->farmer_id,
            $request->product_id ? (string) $request->product_id : null,
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
            'farmer_id' => 'required|uuid|exists:farmers,id',
            'message' => 'nullable|string|max:2000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
            ], 422);
        }

        $result = $this->chatService->createFarmerAdminConversation(
            (string) $request->farmer_id,
            $request->message ? (string) $request->message : null
        );

        return response()->json([
            'success' => true,
            'message' => 'Đã kết nối với Ban Quản Trị Sàn GreenFood!',
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

        $result = $this->chatService->getCustomerMessages((string) $customerId, $id);

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
     * POST /api/chat/conversations/{id}/messages
     * Send a message (Roles: customer, farmer, admin)
     */
    public function sendMessage(Request $request, string $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'sender_id' => 'required|uuid|exists:users,id',
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

        $result = $this->chatService->sendMessage(
            $id,
            (string) $request->sender_id,
            (string) $request->sender_role,
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
            'admin_id' => 'required|uuid|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
            ], 422);
        }

        $success = $this->chatService->assignAdmin($id, (string) $request->admin_id);

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

        $count = $this->chatService->getUnreadCount(
            (string) ($userId ?? ''),
            $role,
            $farmerId ? (string) $farmerId : null
        );

        return response()->json([
            'success' => true,
            'data' => ['count' => $count],
        ]);
    }
}
