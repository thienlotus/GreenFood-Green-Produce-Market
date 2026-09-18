<?php

namespace App\Modules\Product\Repositories;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Category;
use App\Models\OrderItem;
use Illuminate\Database\Eloquent\Collection;

class ProductRepository
{
    public function getFiltered(array $filters, int $limit = 50)
    {
        $query = Product::with(['category', 'farmer.region', 'variants']);

        if (!empty($filters['category']) && $filters['category'] !== 'di-cho-online') {
            $categorySlug = $filters['category'];
            $query->whereHas('category', function ($q) use ($categorySlug) {
                $q->where('slug', $categorySlug);
            });
        }

        if (!empty($filters['search'])) {
            $search = trim($filters['search']);
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhereHas('farmer', function ($fq) use ($search) {
                      $fq->where('farm_name', 'like', "%{$search}%")
                         ->orWhere('address', 'like', "%{$search}%");
                  });
            });
        }

        if (!empty($filters['region']) && $filters['region'] !== 'all') {
            $region = $filters['region'];
            $query->whereHas('farmer.region', function ($q) use ($region) {
                $q->where('name', $region)->orWhere('slug', $region);
            });
        }

        $sort = $filters['sort'] ?? 'default';
        if ($sort === 'popular') {
            $query->orderBy('sold_count', 'desc');
        } elseif ($sort === 'price-asc') {
            $query->join('product_variants', 'products.id', '=', 'product_variants.product_id')
                  ->select('products.*')
                  ->orderBy('product_variants.price', 'asc');
        } elseif ($sort === 'price-desc') {
            $query->join('product_variants', 'products.id', '=', 'product_variants.product_id')
                  ->select('products.*')
                  ->orderBy('product_variants.price', 'desc');
        } else {
            $query->latest();
        }

        return $query->distinct()->take($limit)->get();
    }

    public function findByIdOrSlug(string|int $id)
    {
        return Product::where('id', $id)
            ->orWhere('slug', $id)
            ->with(['category', 'farmer.region', 'variants'])
            ->first();
    }

    public function create(array $data): Product
    {
        return Product::create($data);
    }

    public function createVariant(array $data): ProductVariant
    {
        return ProductVariant::create($data);
    }

    public function update(Product $product, array $data): Product
    {
        $product->update($data);
        return $product;
    }

    public function isReferencedInOrders(string|int $productId): bool
    {
        return OrderItem::where('product_id', $productId)->exists();
    }

    public function delete(Product $product): bool
    {
        $product->variants()->delete();
        return $product->delete();
    }

    public function getAllCategories(): Collection
    {
        return Category::withCount('products')->get();
    }

    public function findCategoryBySlug(string $slug): ?Category
    {
        return Category::where('slug', $slug)
            ->withCount('products')
            ->first();
    }
}
