<?php

namespace App\Modules\Cart\Repositories;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\ShippingZone;

class CartRepository
{
    public function getProductById(string|int $id): ?Product
    {
        return Product::find($id);
    }

    public function getVariantById(string|int $variantId): ?ProductVariant
    {
        return ProductVariant::find($variantId);
    }

    public function getShippingZone(string $zoneId): ?ShippingZone
    {
        return ShippingZone::find($zoneId);
    }
}
