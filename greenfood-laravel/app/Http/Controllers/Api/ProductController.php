<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['category', 'farmer.region', 'variants']);

        // Filter by category slug
        if ($request->has('category') && $request->category !== '' && $request->category !== 'di-cho-online') {
            $categorySlug = $request->category;
            $query->whereHas('category', function ($q) use ($categorySlug) {
                $q->where('slug', $categorySlug);
            });
        }

        // Search keyword
        if ($request->has('search') && trim($request->search) !== '') {
            $search = trim($request->search);
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhereHas('farmer', function ($fq) use ($search) {
                      $fq->where('farm_name', 'like', "%{$search}%")
                         ->orWhere('address', 'like', "%{$search}%");
                  });
            });
        }

        // Region filter
        if ($request->has('region') && $request->region !== 'all' && $request->region !== '') {
            $region = $request->region;
            $query->whereHas('farmer.region', function ($q) use ($region) {
                $q->where('name', $region)->orWhere('slug', $region);
            });
        }

        // Sort
        $sort = $request->get('sort', 'default');
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

        $limit = $request->get('limit', 50);
        $products = $query->distinct()->take($limit)->get();

        return response()->json([
            'success' => true,
            'count' => $products->count(),
            'data' => $products
        ]);
    }

    public function show($slugOrId)
    {
        $product = Product::where('id', $slugOrId)
            ->orWhere('slug', $slugOrId)
            ->with(['category', 'farmer.region', 'variants'])
            ->first();

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Sản phẩm không tồn tại'
            ], 404);
        }

        // Related products in same category
        $related = Product::where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->with(['category', 'farmer.region', 'variants'])
            ->take(4)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $product,
            'related' => $related
        ]);
    }

    public function store(Request $request)
    {
        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'stock' => 'nullable|integer|min:0',
            'stock_quantity' => 'nullable|integer|min:0',
            'category' => 'nullable|string',
            'category_id' => 'nullable',
            'unit' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'image_url' => 'nullable|string',
            'badge' => 'nullable|string'
        ], [
            'name.required' => 'Tên sản phẩm không được để trống!',
            'name.max' => 'Tên sản phẩm không vượt quá 255 ký tự!',
            'price.required' => 'Giá bán không được để trống!',
            'price.numeric' => 'Giá bán phải là số hợp lệ!',
            'price.min' => 'Giá bán không được là số âm!',
            'stock.min' => 'Số lượng tồn kho không được âm!',
            'stock_quantity.min' => 'Số lượng tồn kho không được âm!'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors()
            ], 422);
        }

        // Resolve category
        $categoryId = $request->category_id;
        if (!$categoryId && $request->has('category')) {
            $catName = $request->category;
            $category = Category::where('name', 'like', "%{$catName}%")
                ->orWhere('slug', 'like', "%{$catName}%")
                ->first();
            if ($category) {
                $categoryId = $category->id;
            }
        }
        if (!$categoryId) {
            $firstCategory = Category::first();
            $categoryId = $firstCategory ? $firstCategory->id : 1;
        }

        // Resolve farmer
        $farmer = \App\Models\Farmer::first();
        $farmerId = $farmer ? $farmer->id : (string) \Illuminate\Support\Str::uuid();

        // Generate slug
        $baseSlug = \Illuminate\Support\Str::slug($request->name);
        $slug = $baseSlug;
        $counter = 1;
        while (Product::where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }

        $stock = $request->stock_quantity ?? $request->stock ?? 100;
        $unit = $request->unit ?? 'kg';

        $product = Product::create([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'farmer_id' => $farmerId,
            'category_id' => $categoryId,
            'name' => trim($request->name),
            'slug' => $slug,
            'description' => $request->description ?? 'Sản phẩm nông sản sạch chất lượng cao của GreenFood.',
            'image_url' => $request->image_url ?? 'https://images.unsplash.com/photo-1550828520-4cb496926fc9?q=80&w=800&auto=format&fit=crop',
            'badge' => $request->badge ?? 'VietGAP',
            'sold_count' => 0,
            'rating' => 5.0,
            'is_seasonal' => (bool) $request->is_seasonal
        ]);

        $variant = \App\Models\ProductVariant::create([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'product_id' => $product->id,
            'unit' => $unit,
            'price' => $request->price,
            'compare_at_price' => $request->compare_at_price ?? null,
            'stock_quantity' => $stock,
            'sku' => 'GF-' . strtoupper(\Illuminate\Support\Str::random(6))
        ]);

        $product->load(['category', 'farmer.region', 'variants']);

        return response()->json([
            'success' => true,
            'message' => 'Thêm sản phẩm thành công!',
            'data' => $product
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $product = Product::where('id', $id)->orWhere('slug', $id)->first();

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Sản phẩm không tồn tại!'
            ], 404);
        }

        $validator = \Illuminate\Support\Facades\Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'price' => 'sometimes|required|numeric|min:0',
            'stock' => 'nullable|integer|min:0',
            'stock_quantity' => 'nullable|integer|min:0',
            'unit' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'image_url' => 'nullable|string',
            'badge' => 'nullable|string'
        ], [
            'name.required' => 'Tên sản phẩm không được để trống!',
            'price.required' => 'Giá bán không được để trống!',
            'price.numeric' => 'Giá bán phải là số hợp lệ!',
            'price.min' => 'Giá bán không được là số âm!',
            'stock.min' => 'Số lượng tồn kho không được âm!',
            'stock_quantity.min' => 'Số lượng tồn kho không được âm!'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors()
            ], 422);
        }

        // Update product fields
        $dataToUpdate = [];
        if ($request->has('name')) {
            $dataToUpdate['name'] = trim($request->name);
        }
        if ($request->has('description')) {
            $dataToUpdate['description'] = $request->description;
        }
        if ($request->has('image_url')) {
            $dataToUpdate['image_url'] = $request->image_url;
        }
        if ($request->has('badge')) {
            $dataToUpdate['badge'] = $request->badge;
        }

        if ($request->has('category') || $request->has('category_id')) {
            if ($request->has('category_id')) {
                $dataToUpdate['category_id'] = $request->category_id;
            } else {
                $cat = Category::where('name', 'like', "%{$request->category}%")
                    ->orWhere('slug', 'like', "%{$request->category}%")
                    ->first();
                if ($cat) {
                    $dataToUpdate['category_id'] = $cat->id;
                }
            }
        }

        if (!empty($dataToUpdate)) {
            $product->update($dataToUpdate);
        }

        // Update variant (price, stock, unit)
        $variant = $product->variants()->first();
        if ($variant) {
            $variantData = [];
            if ($request->has('price')) {
                $variantData['price'] = $request->price;
            }
            if ($request->has('stock') || $request->has('stock_quantity')) {
                $variantData['stock_quantity'] = $request->stock_quantity ?? $request->stock;
            }
            if ($request->has('unit')) {
                $variantData['unit'] = $request->unit;
            }
            if (!empty($variantData)) {
                $variant->update($variantData);
            }
        }

        $product->load(['category', 'farmer.region', 'variants']);

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật sản phẩm thành công!',
            'data' => $product
        ]);
    }

    public function destroy($id)
    {
        $product = Product::where('id', $id)->orWhere('slug', $id)->first();

        if (!$product) {
            return response()->json([
                'success' => false,
                'message' => 'Sản phẩm không tồn tại!'
            ], 404);
        }

        $productName = $product->name;
        // Delete variants
        $product->variants()->delete();
        // Delete product
        $product->delete();

        return response()->json([
            'success' => true,
            'message' => "Đã xóa sản phẩm \"{$productName}\" thành công!"
        ]);
    }
}
