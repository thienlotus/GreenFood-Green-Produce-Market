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
     * Lấy danh sách Quận/Huyện theo ID Tỉnh (chỉ lấy các quận/huyện đang hoạt động và nhận giao hàng)
     */
    public function getDistricts(int $provinceId): array
    {
        $response = $this->get('/master-data/district', [
            'province_id' => $provinceId,
        ]);

        if (!empty($response['data']) && is_array($response['data'])) {
            $response['data'] = array_values(array_filter($response['data'], function ($item) {
                $status = (int) ($item['Status'] ?? 1);
                $supportType = (int) ($item['SupportType'] ?? 1);
                return $status === 1 && $supportType > 0;
            }));
        }

        return $response;
    }

    /**
     * Lấy danh sách Phường/Xã theo ID Huyện (chỉ lấy các phường/xã đang hoạt động)
     */
    public function getWards(int $districtId): array
    {
        $response = $this->get('/master-data/ward', [
            'district_id' => $districtId,
        ]);

        if (!empty($response['data']) && is_array($response['data'])) {
            $response['data'] = array_values(array_filter($response['data'], function ($item) {
                $status = (int) ($item['Status'] ?? 1);
                $supportType = (int) ($item['SupportType'] ?? 1);
                return $status === 1 && $supportType > 0;
            }));
        }

        return $response;
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
     * Lấy các gói dịch vụ GHN khả dụng giữa 2 quận/huyện
     */
    public function getAvailableServices(int $fromDistrict, int $toDistrict): array
    {
        return $this->post('/v2/shipping-order/available-services', [
            'shop_id' => $this->shopId,
            'from_district' => $fromDistrict,
            'to_district' => $toDistrict,
        ]);
    }

    /**
     * Gọi API tính phí vận chuyển GHN theo thời gian thực
     * Tự động dò service_id và có cơ chế fallback thông minh khi tuyến đường chưa có trên sandbox
     */
    public function calculateFee(array $params): array
    {
        $fromDistrict = (int) ($params['from_district_id'] ?? config('services.ghn.from_district_id', 3440));
        $toDistrict = (int) ($params['to_district_id'] ?? 0);
        $weight = (int) ($params['weight'] ?? 200);

        // 1. Tự động lấy service_id nếu chưa được truyền
        if (empty($params['service_id']) && $toDistrict > 0) {
            $available = $this->getAvailableServices($fromDistrict, $toDistrict);
            if (!empty($available['data']) && is_array($available['data'])) {
                $standardService = collect($available['data'])->firstWhere('service_type_id', 2) ?? $available['data'][0];
                if (!empty($standardService['service_id'])) {
                    $params['service_id'] = (int) $standardService['service_id'];
                }
            }
        }

        // 2. Nếu có service_id, gọi cổng tính cước GHN chính thức
        if (!empty($params['service_id'])) {
            $res = $this->post('/v2/shipping-order/fee', array_merge([
                'shop_id' => $this->shopId,
            ], $params));

            if (($res['code'] ?? 0) === 200 && isset($res['data']['total'])) {
                return $res;
            }
        }

        // 3. Fallback thông minh: Tính cước giao hàng chuẩn theo khu vực địa lý
        // - Cùng quận/huyện kho gửi (3440 Nam Từ Liêm): 20.000đ
        // - Nội thành Hà Nội: 22.000đ
        // - Tỉnh lân cận (Hưng Yên, Bắc Ninh, Hà Nam, Hải Dương...): 28.000đ
        // - Các tỉnh thành khác toàn quốc: 35.000đ
        $fallbackFee = 28000;
        if ($toDistrict === $fromDistrict) {
            $fallbackFee = 20000;
        } elseif ($toDistrict >= 1480 && $toDistrict <= 1500) {
            $fallbackFee = 22000;
        } elseif ($toDistrict > 0 && $toDistrict <= 200) {
            $fallbackFee = 35000;
        }

        if ($weight > 1000) {
            $extraWeight = $weight - 1000;
            $fallbackFee += (int)(ceil($extraWeight / 500) * 5000);
        }

        return [
            'code' => 200,
            'message' => 'Success',
            'data' => [
                'total' => $fallbackFee,
                'service_fee' => $fallbackFee,
                'insurance_fee' => 0,
                'is_estimated' => true,
            ],
        ];
    }

    /**
     * Gọi API tạo đơn giao hàng mới sang hệ thống GHN
     */
    public function createOrder(array $orderData): array
    {
        $fromDistrict = (int) ($orderData['from_district_id'] ?? config('services.ghn.from_district_id', 3440));
        $toDistrict = (int) ($orderData['to_district_id'] ?? 0);

        // Tự động gán service_id nếu chưa có
        if (empty($orderData['service_id']) && $toDistrict > 0) {
            $available = $this->getAvailableServices($fromDistrict, $toDistrict);
            if (!empty($available['data']) && is_array($available['data'])) {
                $standardService = collect($available['data'])->firstWhere('service_type_id', 2) ?? $available['data'][0];
                if (!empty($standardService['service_id'])) {
                    $orderData['service_id'] = (int) $standardService['service_id'];
                }
            }
        }

        if (empty($orderData['service_id']) && empty($orderData['service_type_id'])) {
            $orderData['service_type_id'] = 2;
        }

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
                $body = $response->json();
                Log::warning('Lỗi gọi GHN GET API', [
                    'uri' => $uri,
                    'status' => $response->status(),
                    'body' => $body,
                ]);
                return [
                    'code' => $response->status(),
                    'message' => $body['message'] ?? $body['code_message_value'] ?? 'Lỗi kết nối tới cổng GHN.',
                    'data' => $body['data'] ?? null
                ];
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
                $body = $response->json();
                Log::warning('Lỗi gọi GHN POST API', [
                    'uri' => $uri,
                    'status' => $response->status(),
                    'body' => $body,
                ]);
                return [
                    'code' => $response->status(),
                    'message' => $body['message'] ?? $body['code_message_value'] ?? 'Lỗi kết nối tới cổng GHN.',
                    'data' => $body['data'] ?? null
                ];
            }

            return $response->json() ?? ['code' => -1, 'message' => 'GHN trả về phản hồi rỗng.'];
        } catch (ConnectionException $exception) {
            Log::error('Không thể kết nối đến máy chủ GHN', ['uri' => $uri, 'error' => $exception->getMessage()]);
            return ['code' => -1, 'message' => 'Không thể kết nối tới máy chủ GHN.'];
        }
    }
}
