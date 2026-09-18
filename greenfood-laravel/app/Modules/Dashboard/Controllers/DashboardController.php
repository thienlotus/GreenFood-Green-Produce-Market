<?php

namespace App\Modules\Dashboard\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Dashboard\Services\DashboardService;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(
        protected DashboardService $dashboardService
    ) {}

    public function stats()
    {
        $data = $this->dashboardService->getStats();
        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }
}
