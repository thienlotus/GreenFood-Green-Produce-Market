<?php

declare(strict_types=1);

namespace App\Modules\B2B\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class B2bInquiryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'inquiry_code' => $this->inquiry_code,
            'company_name' => $this->company_name,
            'contact_name' => $this->contact_name,
            'phone' => $this->phone,
            'email' => $this->email,
            'tax_id' => $this->tax_id,
            'business_type' => $this->business_type,
            'categories' => $this->categories ?? [],
            'estimated_volume' => $this->estimated_volume,
            'delivery_time' => $this->delivery_time,
            'address' => $this->address,
            'note' => $this->note,
            'status' => $this->status,
            'admin_notes' => $this->admin_notes,
            'contacted_at' => $this->contacted_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'created_at_human' => $this->created_at?->diffForHumans(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
