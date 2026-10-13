<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContactInquiry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContactInquiryController extends Controller
{
    /**
     * Khách hàng gửi liên hệ, góp ý dịch vụ từ trang /contact
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:50',
            'email' => 'nullable|email|max:255',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        $inquiry = ContactInquiry::create([
            'name' => $validated['name'],
            'phone' => $validated['phone'],
            'email' => $validated['email'] ?? null,
            'subject' => $validated['subject'],
            'message' => $validated['message'],
            'status' => 'PENDING',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Cảm ơn bạn! GreenFood đã tiếp nhận ý kiến đóng góp và sẽ liên hệ hỗ trợ bạn qua số ' . $inquiry->phone . '.',
            'data' => $inquiry,
        ], 201);
    }

    /**
     * Admin xem danh sách liên hệ & góp ý khách hàng
     */
    public function index(Request $request): JsonResponse
    {
        $query = ContactInquiry::query()->orderBy('created_at', 'desc');

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', strtoupper($request->status));
        }

        if ($request->filled('search')) {
            $search = '%' . trim($request->search) . '%';
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', $search)
                  ->orWhere('phone', 'like', $search)
                  ->orWhere('email', 'like', $search)
                  ->orWhere('subject', 'like', $search)
                  ->orWhere('message', 'like', $search);
            });
        }

        $inquiries = $query->get();
        $pendingCount = ContactInquiry::where('status', 'PENDING')->count();

        return response()->json([
            'success' => true,
            'total' => $inquiries->count(),
            'pending_count' => $pendingCount,
            'data' => $inquiries,
        ]);
    }

    /**
     * Admin cập nhật trạng thái & nội dung phản hồi khách hàng
     */
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $inquiry = ContactInquiry::find($id);
        if (!$inquiry) {
            return response()->json([
                'success' => false,
                'message' => 'Ý kiến liên hệ không tồn tại.',
            ], 404);
        }

        $validated = $request->validate([
            'status' => 'required|string|in:PENDING,PROCESSING,RESOLVED',
            'reply_content' => 'nullable|string',
        ]);

        $inquiry->update([
            'status' => $validated['status'],
            'reply_content' => $validated['reply_content'] ?? $inquiry->reply_content,
            'responded_at' => !empty($validated['reply_content']) ? now() : $inquiry->responded_at,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật trạng thái liên hệ & góp ý thành công!',
            'data' => $inquiry,
        ]);
    }

    /**
     * Xóa liên hệ
     */
    public function destroy(string $id): JsonResponse
    {
        $inquiry = ContactInquiry::find($id);
        if (!$inquiry) {
            return response()->json([
                'success' => false,
                'message' => 'Ý kiến liên hệ không tồn tại.',
            ], 404);
        }

        $inquiry->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa ý kiến liên hệ thành công.',
        ]);
    }
}
