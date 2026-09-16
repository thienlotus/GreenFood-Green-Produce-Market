<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Service giao tiếp trực tiếp với cổng API của Giao Hàng Nhanh (GHN)
 * Chịu trách nhiệm gửi request HTTP (GET, POST), xác thực Header và xử lý lỗi mạng
 */
class GHNService
{
    protected string $baseUrl; // Địa chỉ máy chủ GHN (Production: https://online-gateway.ghn.vn/shiip/public-api)
    protected string $token;   // Token xác thực tài khoản chủ shop
    protected int $shopId;     // ID cửa hàng trên GHN

    public function __construct()
    {
        // Nạp các thông số kết nối từ file config/services.php
        $this->baseUrl = config('services.ghn.base_url', 'https://online-gateway.ghn.vn/shiip/public-api');
        $this->token = config('services.ghn.token', '');
        $this->shopId = (int) config('services.ghn.shop_id', 0);
    }

    /**
     * Khởi tạo đối tượng HTTP Client kèm các Header bắt buộc của GHN
     */
    protected function client()
    {
        return Http::baseUrl($this->baseUrl)
            ->withOptions([
                'verify' => filter_var(config('services.ghn.verify_ssl', true), FILTER_VALIDATE_BOOLEAN),
            ])
            ->acceptJson()
            ->timeout(15) // Hết thời gian chờ sau 15 giây
            ->withHeaders([
                'Token' => $this->token,          // Token chứng thực của shop
                'ShopId' => $this->shopId,        // Mã cửa hàng GHN
                'Content-Type' => 'application/json',
            ]);
    }

    /**
     * Lấy danh sách 63 Tỉnh/Thành phố từ GHN
     */
    public function getProvinces(): array
    {
        return $this->get('/master-data/province');
    }

    /**
     * Lấy danh sách Quận/Huyện theo ID Tỉnh
     */
    public function getDistricts(int $provinceId): array
    {
        return $this->get('/master-data/district', [
            'province_id' => $provinceId,
        ]);
    }

    /**
     * Lấy danh sách Phường/Xã theo ID Huyện
     */
    public function getWards(int $districtId): array
    {
        return $this->get('/master-data/ward', [
            'district_id' => $districtId,
        ]);
    }

    /**
     * Cấu hình kích thước và quy cách đóng gói mặc định cho gói hàng
     */
    public function packageParameters(int $weight): array
    {
        return [
            'service_type_id' => 2, // Gói cước Chuẩn (Standard)
            'insurance_value' => 0, // Giá trị bảo hiểm
            'coupon' => null,       // Mã giảm giá phí ship nếu có
            'weight' => $weight > 0 ? $weight : 200, // Cân nặng (gram)
            'length' => 15,         // Chiều dài (cm)
            'width' => 15,          // Chiều rộng (cm)
            'height' => 10,         // Chiều cao (cm)
        ];
    }

    /**
     * Gọi API tính phí vận chuyển GHN theo thời gian thực
     */
    public function calculateFee(array $params): array
    {
        return $this->post('/v2/shipping-order/fee', array_merge([
            'shop_id' => $this->shopId,
        ], $params));
    }

    /**
     * Gọi API tạo đơn giao hàng mới sang hệ thống GHN
     */
    public function createOrder(array $orderData): array
    {
        return $this->post('/v2/shipping-order/create', array_merge([
            'shop_id' => $this->shopId,
        ], $orderData));
    }

    /**
     * Gọi API yêu cầu hủy đơn hàng trên GHN
     */
    public function cancelOrder(array $orderCodes): array
    {
        return $this->post('/v2/switch-status/cancel', [
            'order_codes' => $orderCodes,
            'shop_id' => $this->shopId,
        ]);
    }

    /**
     * Hàm dùng chung để thực hiện các yêu cầu HTTP GET tới GHN
     */
    protected function get(string $uri, array $query = []): array
    {
        try {
            $response = $this->client()->get($uri, $query);

            if (!$response->successful()) {
                Log::warning('Lỗi gọi GHN GET API', [
                    'uri' => $uri,
                    'status' => $response->status(),
                    'body' => $response->json(),
                ]);
                return ['code' => $response->status(), 'message' => 'Lỗi kết nối tới cổng GHN.'];
            }

            return $response->json() ?? ['code' => -1, 'message' => 'GHN trả về phản hồi rỗng.'];
        } catch (ConnectionException $exception) {
            Log::error('Không thể kết nối đến máy chủ GHN', ['uri' => $uri, 'error' => $exception->getMessage()]);
            return ['code' => -1, 'message' => 'Không thể kết nối tới máy chủ GHN.'];
        }
    }

    /**
     * Hàm dùng chung để thực hiện các yêu cầu HTTP POST tới GHN
     */
    protected function post(string $uri, array $payload): array
    {
        try {
            $response = $this->client()->post($uri, $payload);

            if (!$response->successful()) {
                Log::warning('Lỗi gọi GHN POST API', [
                    'uri' => $uri,
                    'status' => $response->status(),
                    'body' => $response->json(),
                ]);
                return ['code' => $response->status(), 'message' => 'Lỗi kết nối tới cổng GHN.'];
            }

            return $response->json() ?? ['code' => -1, 'message' => 'GHN trả về phản hồi rỗng.'];
        } catch (ConnectionException $exception) {
            Log::error('Không thể kết nối đến máy chủ GHN', ['uri' => $uri, 'error' => $exception->getMessage()]);
            return ['code' => -1, 'message' => 'Không thể kết nối tới máy chủ GHN.'];
        }
    }
}
