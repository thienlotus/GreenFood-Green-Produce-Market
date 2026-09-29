<?php

namespace App\Modules\Chat\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Chat\Services\ChatService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ChatController extends Controller
{
    public function __construct(
        protected ChatService $chatService
    ) {}

    /**
     * GET /api/chat/conversations
     * List all conversations (Admin) or customer's conversations
     */
    public function index(Request $request)
    {
        $filters = [
            'status' => $request->get('status'),
            'customer_id' => $request->get('customer_id'),
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
     * Create a new conversation (Customer)
     */
    public function store(Request $request)
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
            $request->customer_id,
            $request->subject ?? 'Hỗ trợ khách hàng',
            $request->message
        );

        return response()->json([
            'success' => true,
            'message' => 'Đã tạo cuộc hội thoại!',
            'data' => $result,
        ], 201);
    }

    /**
     * GET /api/chat/conversations/{id}
     * Get conversation detail with messages (Admin view)
     */
    public function show(string $id)
    {
        $result = $this->chatService->getConversationMessages($id);

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
    public function customerMessages(Request $request, string $id)
    {
        $customerId = $request->get('customer_id');
        if (!$customerId) {
            return response()->json([
                'success' => false,
                'message' => 'Thiếu customer_id',
            ], 400);
        }

        $result = $this->chatService->getCustomerMessages($customerId, $id);

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
     * Send a message
     */
    public function sendMessage(Request $request, string $id)
    {
        $validator = Validator::make($request->all(), [
            'sender_id' => 'required|uuid|exists:users,id',
            'sender_role' => 'required|in:customer,admin',
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
            $request->sender_id,
            $request->sender_role,
            $request->message,
            $request->message_type ?? 'text'
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
    public function assign(Request $request, string $id)
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

        $success = $this->chatService->assignAdmin($id, $request->admin_id);

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
    public function close(string $id)
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
     * Get unread messages count
     */
    public function unreadCount(Request $request)
    {
        $userId = $request->get('user_id');
        $role = $request->get('role', 'admin');

        if (!$userId) {
            return response()->json([
                'success' => true,
                'data' => ['count' => 0],
            ]);
        }

        $count = $this->chatService->getUnreadCount($userId, $role);

        return response()->json([
            'success' => true,
            'data' => ['count' => $count],
        ]);
    }
}
