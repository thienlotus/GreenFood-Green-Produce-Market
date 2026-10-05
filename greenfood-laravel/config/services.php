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

    // Cấu hình Google Gemini AI Chatbot (Tối ưu token & hỗ trợ khách hàng tự động)
    'gemini' => [
        'api_key' => env('GEMINI_API_KEY', ''),
        'model' => env('GEMINI_MODEL', 'gemini-1.5-flash'),
        'auto_reply' => env('GEMINI_AUTO_REPLY', true),
        'max_tokens' => (int) env('GEMINI_MAX_TOKENS', 200),
    ],

    // Cổng thanh toán Ví MoMo API (Sprint 2 - Quý)
    'momo' => [
        'partner_code' => env('MOMO_PARTNER_CODE', 'MOMOBKUN20180529'),
        'access_key' => env('MOMO_ACCESS_KEY', 'klm05TvNBzhg7h7j'),
        'secret_key' => env('MOMO_SECRET_KEY', 'at67qH6mk8w5Y1nAyMoYKMWACiEi2Aca'),
        'api_url' => env('MOMO_API_URL', 'https://test-payment.momo.vn'),
        'return_url' => env('MOMO_RETURN_URL', 'http://localhost:3000/payment/momo/return'),
        'notify_url' => env('MOMO_NOTIFY_URL', 'http://localhost:8000/api/v1/payment/momo/callback'),
    ],

    // Cổng thanh toán SePay VietQR (Chuyển khoản ngân hàng tự động)
    'sepay' => [
        'api_token' => env('SEPAY_API_TOKEN', '96Z1XOTILFILNUUKPR1EVMVABR2EPETBZAYACPLH3QNP5YIO4GGRTK5XHIW92DMQ'),
        'webhook_api_key' => env('SEPAY_WEBHOOK_API_KEY', '96Z1XOTILFILNUUKPR1EVMVABR2EPETBZAYACPLH3QNP5YIO4GGRTK5XHIW92DMQ'),
        'account_number' => env('SEPAY_ACCOUNT_NUMBER', '0987654321'),
        'bank_name' => env('SEPAY_BANK_NAME', 'MBBank'),
        'account_name' => env('SEPAY_ACCOUNT_NAME', 'CONG TY GREENFOOD'),
    ],

];
