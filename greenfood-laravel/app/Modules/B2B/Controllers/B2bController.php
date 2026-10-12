<?php

declare(strict_types=1);

namespace App\Modules\B2B\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\B2B\Requests\StoreB2bInquiryRequest;
use App\Modules\B2B\Requests\UpdateB2bInquiryStatusRequest;
use App\Modules\B2B\Resources\B2bInquiryResource;
use App\Modules\B2B\Services\B2bService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class B2bController extends Controller
{
    public function __construct(
        protected B2bService $b2bService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = [
            'status' => $request->query('status'),
            'search' => $request->query('search'),
        ];

        $inquiries = $this->b2bService->listInquiries($filters);

        return response()->json([
            'success' => true,
            'total' => $inquiries->count(),
            'pending_count' => $this->b2bService->getPendingCount(),
            'data' => B2bInquiryResource::collection($inquiries),
        ]);
    }

    public function store(StoreB2bInquiryRequest $request): JsonResponse
    {
        $inquiry = $this->b2bService->createInquiry($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Gửi hồ sơ đăng ký đối tác B2B thành công! Chuyên viên GreenFood sẽ liên hệ lại trong vòng 2 giờ.',
            'data' => new B2bInquiryResource($inquiry),
        ], 201);
    }

    public function show(string $id): JsonResponse
    {
        $inquiry = $this->b2bService->getInquiry($id);
        if (!$inquiry) {
            return response()->json([
                'success' => false,
                'message' => 'Phiếu yêu cầu B2B không tồn tại.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new B2bInquiryResource($inquiry),
        ]);
    }

    public function updateStatus(UpdateB2bInquiryStatusRequest $request, string $id): JsonResponse
    {
        $updated = $this->b2bService->updateStatus(
            $id,
            $request->validated('status'),
            $request->validated('admin_notes')
        );

        if (!$updated) {
            return response()->json([
                'success' => false,
                'message' => 'Phiếu yêu cầu B2B không tồn tại.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật trạng thái phiếu B2B thành công!',
            'data' => new B2bInquiryResource($updated),
        ]);
    }

    public function track(Request $request): JsonResponse
    {
        $keyword = $request->query('keyword') ?? $request->query('code') ?? $request->query('phone') ?? '';
        if (empty(trim((string)$keyword))) {
            return response()->json([
                'success' => false,
                'message' => 'Vui lòng cung cấp mã phiếu hoặc số điện thoại để tra cứu.',
            ], 400);
        }

        $results = $this->b2bService->trackInquiries((string)$keyword);

        return response()->json([
            'success' => true,
            'total' => $results->count(),
            'data' => B2bInquiryResource::collection($results),
        ]);
    }

    public function respond(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'client_response' => 'required|string|max:5000',
            'assigned_staff' => 'nullable|string|max:150',
            'status' => 'nullable|string|in:PENDING,CONTACTED,CONTRACTED,CANCELLED',
            'send_email' => 'nullable|boolean',
            'admin_notes' => 'nullable|string|max:2000',
        ]);

        $updated = $this->b2bService->respondToInquiry($id, $request->all());

        if (!$updated) {
            return response()->json([
                'success' => false,
                'message' => 'Phiếu yêu cầu B2B không tồn tại.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Đã lưu và gửi phản hồi tới doanh nghiệp thành công!',
            'data' => new B2bInquiryResource($updated),
        ]);
    }

    public function destroy(string $id): JsonResponse
    {
        $deleted = $this->b2bService->deleteInquiry($id);
        if (!$deleted) {
            return response()->json([
                'success' => false,
                'message' => 'Phiếu yêu cầu B2B không tồn tại.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa phiếu yêu cầu B2B thành công!',
        ]);
    }
}
