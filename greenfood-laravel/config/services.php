<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Resend, Postmark, AWS, and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    // Cấu hình kết nối API Giao Hàng Nhanh (GHN)
    'ghn' => [
        'base_url' => env('GHN_BASE_URL', 'https://dev-online-gateway.ghn.vn/shiip/public-api'), // Cổng API GHN Dev/Sandbox
        'token' => env('GHN_TOKEN', '6ca431c7-aa99-11f1-a973-aee5264794df'),                  // Token tài khoản GHN mới
        'shop_id' => env('GHN_SHOP_ID', 217561),         // Mã Shop GHN (đã gán địa chỉ kho)
        'verify_ssl' => env('GHN_VERIFY_SSL', false),      // Bỏ qua SSL khi chạy local
        'from_district_id' => env('GHN_FROM_DISTRICT_ID', 3440), // ID Quận/Huyện kho gửi (Nam Từ Liêm, HN)
        'default_weight' => env('GHN_DEFAULT_WEIGHT', 200),     // Trọng lượng ước tính mặc định
    ],

];
