<?php

namespace App\Modules\Product\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Product\Services\ProductService;
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

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'category_id' => 'required|integer|exists:categories,id',
            'farmer_id' => 'nullable|string|exists:farmers,id',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'unit' => 'nullable|string|max:50',
            'image_url' => 'nullable|string',
        ], [
            'name.required' => 'Tên sản phẩm không được để trống!',
            'price.required' => 'Giá sản phẩm không được để trống!',
            'price.min' => 'Giá sản phẩm không được âm!',
            'category_id.required' => 'Danh mục không được để trống!',
            'category_id.exists' => 'Danh mục không tồn tại!',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'status' => 400,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors()
            ], 400);
        }

        $result = $this->productService->createProduct($request->all());

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
            'description' => 'nullable|string',
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
