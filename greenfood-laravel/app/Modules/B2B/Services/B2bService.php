<?php

declare(strict_types=1);

namespace App\Modules\B2B\Services;

use App\Modules\B2B\Models\B2bInquiry;
use App\Modules\B2B\Repositories\B2bRepository;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class B2bService
{
    public function __construct(
        protected B2bRepository $b2bRepository
    ) {}

    public function listInquiries(array $filters = []): Collection
    {
        return $this->b2bRepository->getInquiries($filters);
    }

    public function getInquiry(string $id): ?B2bInquiry
    {
        return $this->b2bRepository->findById($id);
    }

    public function createInquiry(array $data): B2bInquiry
    {
        return DB::transaction(function () use ($data) {
            $code = B2bInquiry::generateInquiryCode();
            $data['inquiry_code'] = $code;
            $data['status'] = 'PENDING';

            $inquiry = $this->b2bRepository->create($data);

            Log::info("Đã tiếp nhận phiếu đăng ký Khách sỉ & B2B mới [{$code}]", [
                'company' => $inquiry->company_name,
                'phone' => $inquiry->phone,
                'contact' => $inquiry->contact_name,
                'business_type' => $inquiry->business_type,
            ]);

            return $inquiry;
        });
    }

    public function updateStatus(string $id, string $status, ?string $adminNotes = null): ?B2bInquiry
    {
        $inquiry = $this->b2bRepository->findById($id);
        if (!$inquiry) {
            return null;
        }

        return DB::transaction(function () use ($inquiry, $status, $adminNotes) {
            $updateData = [
                'status' => strtoupper($status),
            ];

            if ($adminNotes !== null) {
                $updateData['admin_notes'] = $adminNotes;
            }

            if (strtoupper($status) === 'CONTACTED' && !$inquiry->contacted_at) {
                $updateData['contacted_at'] = now();
            }

            $updated = $this->b2bRepository->update($inquiry, $updateData);

            Log::info("Cập nhật trạng thái phiếu B2B [{$inquiry->inquiry_code}] thành [{$status}]", [
                'id' => $inquiry->id,
                'admin_notes' => $adminNotes,
            ]);

            return $updated;
        });
    }

    public function deleteInquiry(string $id): bool
    {
        $inquiry = $this->b2bRepository->findById($id);
        if (!$inquiry) {
            return false;
        }

        return $this->b2bRepository->delete($inquiry);
    }

    public function getPendingCount(): int
    {
        return $this->b2bRepository->countPending();
    }
}
