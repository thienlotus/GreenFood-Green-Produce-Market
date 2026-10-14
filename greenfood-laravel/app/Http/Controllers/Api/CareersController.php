<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JobApplication;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CareersController extends Controller
{
    /**
     * Khách hàng / Ứng viên nộp hồ sơ ứng tuyển từ trang /careers
     */
    public function apply(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'job_title' => 'required|string|max:255',
            'candidate_name' => 'required|string|max:255',
            'phone' => 'required|string|max:50',
            'email' => 'required|email|max:255',
            'experience' => 'nullable|string|max:255',
            'cv_url' => 'nullable|string',
            'intro' => 'nullable|string',
        ]);

        $application = JobApplication::create([
            'job_title' => $validated['job_title'],
            'candidate_name' => $validated['candidate_name'],
            'phone' => $validated['phone'],
            'email' => $validated['email'],
            'experience' => $validated['experience'] ?? null,
            'cv_url' => $validated['cv_url'] ?? null,
            'intro' => $validated['intro'] ?? null,
            'status' => 'PENDING',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Nộp hồ sơ ứng tuyển thành công! Bộ phận Nhân sự GreenFood sẽ liên hệ phỏng vấn qua số ' . $application->phone . '.',
            'data' => $application,
        ], 201);
    }

    /**
     * Admin xem danh sách hồ sơ tuyển dụng
     */
    public function index(Request $request): JsonResponse
    {
        $query = JobApplication::query()->orderBy('created_at', 'desc');

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', strtoupper($request->status));
        }

        if ($request->filled('search')) {
            $search = '%' . trim($request->search) . '%';
            $query->where(function ($q) use ($search) {
                $q->where('candidate_name', 'like', $search)
                  ->orWhere('phone', 'like', $search)
                  ->orWhere('email', 'like', $search)
                  ->orWhere('job_title', 'like', $search);
            });
        }

        $applications = $query->get();
        $pendingCount = JobApplication::where('status', 'PENDING')->count();

        return response()->json([
            'success' => true,
            'total' => $applications->count(),
            'pending_count' => $pendingCount,
            'data' => $applications,
        ]);
    }

    /**
     * Admin cập nhật trạng thái tuyển dụng (Chờ duyệt, Hẹn phỏng vấn, Đạt, Từ chối)
     */
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $application = JobApplication::find($id);
        if (!$application) {
            return response()->json([
                'success' => false,
                'message' => 'Hồ sơ tuyển dụng không tồn tại.',
            ], 404);
        }

        $validated = $request->validate([
            'status' => 'required|string|in:PENDING,INTERVIEWING,ACCEPTED,REJECTED',
            'admin_notes' => 'nullable|string',
        ]);

        $application->update([
            'status' => $validated['status'],
            'admin_notes' => $validated['admin_notes'] ?? $application->admin_notes,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật trạng thái hồ sơ tuyển dụng thành công!',
            'data' => $application,
        ]);
    }

    /**
     * Xóa hồ sơ tuyển dụng
     */
    public function destroy(string $id): JsonResponse
    {
        $application = JobApplication::find($id);
        if (!$application) {
            return response()->json([
                'success' => false,
                'message' => 'Hồ sơ không tồn tại.',
            ], 404);
        }

        $application->delete();

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa hồ sơ tuyển dụng thành công.',
        ]);
    }
}
