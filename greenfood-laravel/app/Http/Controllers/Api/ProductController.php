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

    public function show($slug)
    {
        $product = Product::where('slug', $slug)
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
}
