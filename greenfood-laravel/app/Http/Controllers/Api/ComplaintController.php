<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CustomerComplaint;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ComplaintController extends Controller
{
    /**
     * Khách hàng gửi yêu cầu khiếu nại dịch vụ từ trang /complaints
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order_code' => 'required|string|max:100',
            'customer_name' => 'nullable|string|max:255',
            'phone' => 'required|string|max:50',
            'reason' => 'required|string|max:255',
            'description' => 'required|string',
            'resolution_type' => 'nullable|string|max:50',
        ]);

        $code = 'KN-' . random_int(100000, 999999);

        $complaint = CustomerComplaint::create([
            'complaint_code' => $code,
            'order_code' => $validated['order_code'],
            'customer_name' => $validated['customer_name'] ?: 'Khách hàng GreenFood',
            'phone' => $validated['phone'],
            'reason' => $validated['reason'],
            'description' => $validated['description'],
            'resolution_type' => $validated['resolution_type'] ?? 'refund',
            'status' => 'PENDING',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Đã tiếp nhận khiếu nại! Mã số giải quyết: #' . $complaint->complaint_code . '. Chuyên viên CSKH GreenFood sẽ liên hệ lại qua số ' . $complaint->phone . ' trong vòng 15-30 phút.',
            'data' => $complaint,
        ], 201);
    }

    /**
     * Admin xem danh sách khiếu nại dịch vụ
     */
    public function index(Request $request): JsonResponse
    {
        $query = CustomerComplaint::query()->orderBy('created_at', 'desc');

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', strtoupper($request->status));
        }

        if ($request->filled('search')) {
            $search = '%' . trim($request->search) . '%';
            $query->where(function ($q) use ($search) {
                $q->where('complaint_code', 'like', $search)
                  ->orWhere('order_code', 'like', $search)
                  ->orWhere('customer_name', 'like', $search)
                  ->orWhere('phone', 'like', $search)
                  ->orWhere('reason', 'like', $search)
                  ->orWhere('description', 'like', $search);
            });
        }

        $complaints = $query->get();
        $pendingCount = CustomerComplaint::where('status', 'PENDING')->count();

        return response()->json([
            'success' => true,
            'total' => $complaints->count(),
            'pending_count' => $pendingCount,
            'data' => $complaints,
        ]);
    }

    /**
     * Admin cập nhật trạng thái khiếu nại & phương án bồi thường / xử lý
     */
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $complaint = CustomerComplaint::find($id);
        if (!$complaint) {
            return response()->json([
                'success' => false,
                'message' => 'Phiếu khiếu nại không tồn tại.',
            ], 404);
        }

        $validated = $request->validate([
            'status' => 'required|string|in:PENDING,INVESTIGATING,RESOLVED,REJECTED',
            'resolution_type' => 'nullable|string|max:50',
            'admin_notes' => 'nullable|string',
        ]);

        $isResolved = ($validated['status'] === 'RESOLVED');

        $complaint->update([
            'status' => $validated['status'],
            'resolution_type' => $validated['resolution_type'] ?? $complaint->resolution_type,
            'admin_notes' => $validated['admin_notes'] ?? $complaint->admin_notes,
            'resolved_at' => $isResolved ? now() : $complaint->resolved_at,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật hướng xử lý khiếu nại thành công!',
            'data' => $complaint,
        ]);
    }

    /**
     * Xóa phiếu khiếu nại
     */
    public function destroy(string $id): JsonResponse
    {
        $complaint = CustomerComplaint::find($id);
        if (!$complaint) {
            return response()->json([
                'success' => false,
                'message' => 'Phiếu khiếu nại không tồn tại.',
            ], 404);
        }

        $complaint->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa phiếu khiếu nại thành công.',
        ]);
    }
}
