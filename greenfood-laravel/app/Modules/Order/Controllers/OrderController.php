<?php

namespace App\Modules\Order\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Order\Services\OrderService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
{
    public function __construct(
        protected OrderService $orderService
    ) {}

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'required|string|max:20',
            'customer_email' => 'nullable|email|max:255',
            'shipping_address' => 'required|string',
            'shipping_zone_id' => 'required|string|exists:shipping_zones,id',
            'payment_method' => 'required|in:COD,BANK_TRANSFER,MOMO,VNPAY',
            'items' => 'required|array|min:1',
            'items.*.product_name' => 'required|string',
            'items.*.unit' => 'required|string',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors()
            ], 422);
        }

        $result = $this->orderService->placeOrder($request->all());

        if (!$result['success']) {
            return response()->json($result, 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Đặt hàng thành công!',
            'data' => $result['data']
        ], 201);
    }

    public function index(Request $request)
    {
        $filters = [
            'status' => $request->get('status'),
            'search' => $request->get('search'),
        ];

        $orders = $this->orderService->getOrders($filters);

        return response()->json([
            'success' => true,
            'count' => $orders->count(),
            'data' => $orders
        ]);
    }

    public function myOrders(Request $request)
    {
        $phone = $request->query('phone');
        if (!$phone) {
            return response()->json([
                'success' => false,
                'message' => 'Vui lòng cung cấp số điện thoại'
            ], 400);
        }

        $data = $this->orderService->getMyOrders($phone);

        return response()->json([
            'success' => true,
            'data' => $data
        ]);
    }

    public function show($id)
    {
        $cleanId = strtoupper(trim(str_replace(['#', '{', '}', ' '], '', $id)));
        $order = $this->orderService->getOrderDetail($cleanId);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy đơn hàng'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $order
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $cleanId = strtoupper(trim(str_replace(['#', '{', '}', ' '], '', $id)));

        $validator = Validator::make($request->all(), [
            'status' => 'required|string|in:PENDING,CONFIRMED,SHIPPING,DELIVERED,CANCELLED,pending,processing,completed,cancelled'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Trạng thái không hợp lệ'
            ], 422);
        }

        $result = $this->orderService->updateOrderStatus($cleanId, $request->status);

        if (!$result) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy đơn hàng'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Cập nhật trạng thái thành công',
            'data' => $result
        ]);
    }

    public function track($trackingNumber)
    {
        $result = $this->orderService->trackOrder($trackingNumber);

        if (!$result) {
            $code = strtoupper(trim(str_replace(['#', '{', '}', ' '], '', $trackingNumber)));
            return response()->json([
                'success' => false,
                'message' => "Không tìm thấy đơn hàng #{$code}"
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $result
        ]);
    }

    public function destroy($id)
    {
        $deleted = $this->orderService->deleteOrder($id);

        if (!$deleted) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy đơn hàng để xóa'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Đã xóa đơn hàng thành công!'
        ]);
    }
}
