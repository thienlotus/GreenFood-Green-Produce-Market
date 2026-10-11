<?php

declare(strict_types=1);

namespace App\Modules\B2B\Repositories;

use App\Modules\B2B\Models\B2bInquiry;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class B2bRepository
{
    /**
     * Lấy danh sách phiếu B2B có lọc theo trạng thái và tìm kiếm
     */
    public function getInquiries(array $filters = []): Collection
    {
        $query = B2bInquiry::query()->latest('created_at');

        if (!empty($filters['status']) && strtoupper($filters['status']) !== 'ALL') {
            $query->where('status', strtoupper($filters['status']));
        }

        if (!empty($filters['search'])) {
            $search = '%' . trim($filters['search']) . '%';
            $query->where(function ($q) use ($search) {
                $q->where('company_name', 'like', $search)
                  ->orWhere('contact_name', 'like', $search)
                  ->orWhere('phone', 'like', $search)
                  ->orWhere('inquiry_code', 'like', $search);
            });
        }

        return $query->get();
    }

    public function findById(string $id): ?B2bInquiry
    {
        return B2bInquiry::where('id', $id)
            ->orWhere('inquiry_code', $id)
            ->first();
    }

    public function create(array $data): B2bInquiry
    {
        return B2bInquiry::create($data);
    }

    public function update(B2bInquiry $inquiry, array $data): B2bInquiry
    {
        $inquiry->update($data);
        return $inquiry->fresh();
    }

    public function delete(B2bInquiry $inquiry): bool
    {
        return (bool) $inquiry->delete();
    }

    public function countPending(): int
    {
        return B2bInquiry::where('status', 'PENDING')->count();
    }
}
