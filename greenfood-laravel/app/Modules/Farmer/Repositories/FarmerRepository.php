<?php

namespace App\Modules\Farmer\Repositories;

use App\Models\Farmer;
use Illuminate\Database\Eloquent\Collection;

class FarmerRepository
{
    public function getFiltered(array $filters): Collection
    {
        $query = Farmer::with(['region', 'products.variants']);

        if (!empty($filters['zone']) && $filters['zone'] !== 'all') {
            $zone = $filters['zone'];
            $query->whereHas('region', function ($q) use ($zone) {
                $q->where('zone', $zone);
            });
        }

        if (!empty($filters['search'])) {
            $search = trim($filters['search']);
            $query->where(function ($q) use ($search) {
                $q->where('farm_name', 'like', "%{$search}%")
                  ->orWhere('address', 'like', "%{$search}%")
                  ->orWhere('specialty', 'like', "%{$search}%");
            });
        }

        return $query->get();
    }

    public function findById(string|int $id): ?Farmer
    {
        return Farmer::with(['region', 'products.variants'])->find($id);
    }

    public function findByUserId(string $userId): ?Farmer
    {
        return Farmer::with(['region', 'products.variants'])->where('user_id', $userId)->first();
    }

    public function getAllForAdmin(): Collection
    {
        return Farmer::with(['region', 'user', 'products'])->latest()->get();
    }

    public function create(array $data): Farmer
    {
        return Farmer::create($data);
    }

    public function update(Farmer $farmer, array $data): Farmer
    {
        $farmer->update($data);
        return $farmer->fresh(['region', 'products.variants']);
    }

    public function delete(Farmer $farmer): bool
    {
        return (bool) $farmer->delete();
    }
}
