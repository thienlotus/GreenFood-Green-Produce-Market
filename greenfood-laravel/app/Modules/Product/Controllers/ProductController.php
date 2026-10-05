<?php

namespace App\Modules\Product\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Product\Services\ProductService;
use App\Modules\Product\Requests\StoreProductRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ProductController extends Controller
{
    public function __construct(
        protected ProductService $productService
    ) {}

    public function index(Request $request)
    {
        $filters = [
            'category' => $request->get('category'),
            'search' => $request->get('search'),
            'region' => $request->get('region'),
            'sort' => $request->get('sort', 'default'),
        ];
        $limit = (int)$request->get('limit', 50);

        $products = $this->productService->getProducts($filters, $limit);

        return response()->json([
            'success' => true,
            'count' => $products->count(),
            'data' => $products
        ]);
    }

    public function show($slug)
    {
        $product = $this->productService->getProduct($slug);

        if (!$product) {
            return response()->json([
                'success' => false,
                'status' => 404,
                'message' => "Sản phẩm không tồn tại!"
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $product
        ]);
    }

    public function store(StoreProductRequest $request)
    {
        $result = $this->productService->createProduct($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Tạo sản phẩm thành công!',
            'data' => $result
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'price' => 'nullable|numeric|min:0',
            'stock' => 'nullable|integer|min:0',
            'unit' => 'nullable|string|max:50',
            'category_id' => 'nullable|integer|exists:categories,id',
            'description' => 'nullable|string',
            'image_url' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'status' => 400,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors()
            ], 400);
        }

        $result = $this->productService->updateProduct($id, $request->all());

        if (!$result) {
            return response()->json([
                'success' => false,
                'status' => 404,
                'message' => "Sản phẩm {$id} không tồn tại!"
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật sản phẩm thành công!',
            'data' => $result
        ], 200);
    }

    public function destroy($id)
    {
        $result = $this->productService->deleteProduct($id);

        return response()->json($result, $result['status'] ?? 200);
    }
}
