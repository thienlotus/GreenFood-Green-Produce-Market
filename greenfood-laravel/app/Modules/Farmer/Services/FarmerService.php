<?php

namespace App\Modules\Farmer\Services;

use App\Modules\Farmer\Repositories\FarmerRepository;

class FarmerService
{
    public function __construct(
        protected FarmerRepository $farmerRepository
    ) {}

    public function getFarmers(array $filters)
    {
        return $this->farmerRepository->getFiltered($filters);
    }

    public function getFarmer(string|int $id)
    {
        return $this->farmerRepository->findById($id);
    }
}
