<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    private function removeVietnameseAccents(string $str): string
    {
        $str = preg_replace("/(à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ)/iu", 'a', $str);
        $str = preg_replace("/(è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ)/iu", 'e', $str);
        $str = preg_replace("/(ì|í|ị|ỉ|ĩ)/iu", 'i', $str);
        $str = preg_replace("/(ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ)/iu", 'o', $str);
        $str = preg_replace("/(ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ)/iu", 'u', $str);
        $str = preg_replace("/(ỳ|ý|ỵ|ỷ|ỹ)/iu", 'y', $str);
        $str = preg_replace("/(đ)/iu", 'd', $str);
        return mb_strtolower($str, 'UTF-8');
    }

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

        // Region filter
        if ($request->has('region') && $request->region !== 'all' && $request->region !== '') {
            $region = $request->region;
            $query->whereHas('farmer.region', function ($q) use ($region) {
                $q->where('name', $region)->orWhere('slug', $region);
            });
        }

        $products = $query->distinct()->get();

        // Smart Hierarchical Search
        if ($request->has('search') && trim($request->search) !== '') {
            $cleanKey = trim($request->search);
            $cleanKeyLower = mb_strtolower($cleanKey, 'UTF-8');
            $cleanKeyNoAccent = $this->removeVietnameseAccents($cleanKey);

            // Cấp 1: Ưu tiên tuyệt đối Tên Sản Phẩm (Name Match)
            $nameMatches = $products->filter(function ($p) use ($cleanKeyLower, $cleanKeyNoAccent) {
                $nameLower = mb_strtolower($p->name, 'UTF-8');
                $nameNoAccent = $this->removeVietnameseAccents($p->name);
                return str_contains($nameLower, $cleanKeyLower) || str_contains($nameNoAccent, $cleanKeyNoAccent);
            });

            if ($nameMatches->isNotEmpty()) {
                $products = $nameMatches;
            } else {
                // Cấp 2: Nếu không có tên khớp, tìm theo Danh mục, Nhà vườn, Vùng miền
                $secondaryMatches = $products->filter(function ($p) use ($cleanKeyLower, $cleanKeyNoAccent) {
                    $cat = $p->category->name ?? '';
                    $farm = $p->farmer->farm_name ?? '';
                    $addr = ($p->farmer->region->name ?? '') . ' ' . ($p->farmer->address ?? '');
                    $combined = $cat . ' ' . $farm . ' ' . $addr;

                    $combinedLower = mb_strtolower($combined, 'UTF-8');
                    $combinedNoAccent = $this->removeVietnameseAccents($combined);
                    return str_contains($combinedLower, $cleanKeyLower) || str_contains($combinedNoAccent, $cleanKeyNoAccent);
                });

                if ($secondaryMatches->isNotEmpty()) {
                    $products = $secondaryMatches;
                } else {
                    // Cấp 3: Tìm trong mô tả (chỉ khi từ khóa dài > 3 ký tự để tránh từ như 'cam' dính 'cam kết')
                    if (mb_strlen($cleanKey) > 3) {
                        $descMatches = $products->filter(function ($p) use ($cleanKeyLower, $cleanKeyNoAccent) {
                            $descLower = mb_strtolower($p->description ?? '', 'UTF-8');
                            $descNoAccent = $this->removeVietnameseAccents($p->description ?? '');
                            return str_contains($descLower, $cleanKeyLower) || str_contains($descNoAccent, $cleanKeyNoAccent);
                        });
                        $products = $descMatches;
                    } else {
                        $products = collect();
                    }
                }
            }
        }

        // Sort on collection
        $sort = $request->get('sort', 'default');
        if ($sort === 'popular') {
            $products = $products->sortByDesc('sold_count')->values();
        } elseif ($sort === 'price-asc') {
            $products = $products->sortBy(function ($p) {
                return $p->variants->first()?->price ?? 0;
            })->values();
        } elseif ($sort === 'price-desc') {
            $products = $products->sortByDesc(function ($p) {
                return $p->variants->first()?->price ?? 0;
            })->values();
        } else {
            $products = $products->sortByDesc('created_at')->values();
        }

        $limit = (int) $request->get('limit', 50);
        $paged = $products->take($limit)->values();

        return response()->json([
            'success' => true,
            'count' => $paged->count(),
            'data' => $paged
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
