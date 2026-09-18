<?php

namespace App\Modules\Product\Services;

use App\Modules\Product\Repositories\ProductRepository;
use App\Models\Farmer;
use Illuminate\Support\Str;

class ProductService
{
    public function __construct(
        protected ProductRepository $productRepository
    ) {}

    public function getProducts(array $filters, int $limit = 50)
    {
        return $this->productRepository->getFiltered($filters, $limit);
    }

    public function getProduct(string|int $id)
    {
        return $this->productRepository->findByIdOrSlug($id);
    }

    public function createProduct(array $data): array
    {
        $slug = Str::slug($data['name']) . '-' . time();
        $farmerId = $data['farmer_id'] ?? null;
        if (!$farmerId) {
            $firstFarmer = Farmer::first();
            $farmerId = $firstFarmer ? $firstFarmer->id : null;
        }

        $product = $this->productRepository->create([
            'name' => $data['name'],
            'slug' => $slug,
            'category_id' => $data['category_id'],
            'farmer_id' => $farmerId,
            'description' => $data['description'] ?? '',
            'image_url' => $data['image_url'] ?? 'https://images.unsplash.com/photo-1542838132-92c53300491e',
            'badge' => $data['badge'] ?? 'Mới',
            'sold_count' => 0,
            'rating' => 5.0,
            'is_seasonal' => false
        ]);

        $variant = $this->productRepository->createVariant([
            'product_id' => $product->id,
            'unit' => $data['unit'] ?? 'Hộp / Kg',
            'price' => $data['price'],
            'original_price' => $data['original_price'] ?? $data['price'],
            'stock' => $data['stock'] ?? 100,
            'is_default' => true
        ]);

        return [
            'id' => $product->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'category_id' => $product->category_id,
            'price' => (float)$variant->price,
            'unit' => $variant->unit,
            'description' => $product->description,
            'image_url' => $product->image_url
        ];
    }

    public function updateProduct(string|int $id, array $data): ?array
    {
        $product = $this->productRepository->findByIdOrSlug($id);
        if (!$product) {
            return null;
        }

        $updateData = [];
        if (array_key_exists('name', $data)) {
            $updateData['name'] = $data['name'];
        }
        if (array_key_exists('description', $data)) {
            $updateData['description'] = $data['description'];
        }

        if (!empty($updateData)) {
            $this->productRepository->update($product, $updateData);
        }

        if (array_key_exists('price', $data)) {
            $defaultVariant = $product->variants()->first();
            if ($defaultVariant) {
                $defaultVariant->price = $data['price'];
                $defaultVariant->save();
            }
        }

        return [
            'id' => $product->id,
            'name' => $product->name,
            'description' => $product->description,
            'price' => (float)($product->variants()->first()?->price ?? 0)
        ];
    }

    public function deleteProduct(string|int $id): array
    {
        $product = $this->productRepository->findByIdOrSlug($id);
        if (!$product) {
            return [
                'success' => false,
                'status' => 404,
                'message' => "Sản phẩm {$id} không tồn tại!"
            ];
        }

        if ($this->productRepository->isReferencedInOrders($product->id)) {
            return [
                'success' => false,
                'status' => 409,
                'message' => 'Sản phẩm đang được tham chiếu trong đơn hàng, không thể xóa!'
            ];
        }

        $this->productRepository->delete($product);

        return [
            'success' => true,
            'status' => 200,
            'message' => 'Đã xóa sản phẩm thành công!',
            'id' => $id
        ];
    }

    public function getCategories()
    {
        return $this->productRepository->getAllCategories();
    }

    public function getCategory(string $slug)
    {
        return $this->productRepository->findCategoryBySlug($slug);
    }
}
