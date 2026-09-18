<?php

namespace App\Modules\Promotion\Repositories;

use App\Models\ShippingZone;
use Illuminate\Database\Eloquent\Collection;

class PromotionRepository
{
    public function getShippingZones(array $filters): Collection
    {
        $query = ShippingZone::query();

        if (!empty($filters['search'])) {
            $search = trim($filters['search']);
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('provinces', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['only_active'])) {
            $query->where('is_active', true);
        }

        return $query->orderBy('id', 'asc')->get();
    }

    public function findShippingZone(string $id): ?ShippingZone
    {
        return ShippingZone::find($id);
    }

    public function createShippingZone(array $data): ShippingZone
    {
        return ShippingZone::create($data);
    }

    public function updateShippingZone(ShippingZone $zone, array $data): ShippingZone
    {
        $zone->update($data);
        return $zone;
    }

    public function deleteShippingZone(ShippingZone $zone): bool
    {
        return $zone->delete();
    }

    public function getNextShippingZoneId(): string
    {
        $count = ShippingZone::count() + 1;
        return 'SZ' . str_pad((string)$count, 3, '0', STR_PAD_LEFT);
    }
}
