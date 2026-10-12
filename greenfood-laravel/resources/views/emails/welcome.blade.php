<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chào mừng bạn đến với GreenFood</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f3f4f6;
            margin: 0;
            padding: 0;
            color: #374151;
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            margin: 30px auto;
            background: #ffffff;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.06);
            border: 1px solid #e5e7eb;
        }
        .header {
            background: linear-gradient(135deg, #065f46 0%, #059669 50%, #10b981 100%);
            padding: 36px 28px;
            text-align: center;
            color: #ffffff;
        }
        .header h1 {
            margin: 0;
            font-size: 26px;
            font-weight: 800;
            letter-spacing: -0.5px;
        }
        .header p {
            margin: 8px 0 0;
            font-size: 15px;
            opacity: 0.95;
            color: #d1fae5;
        }
        .content {
            padding: 36px 32px;
        }
        .greeting {
            font-size: 18px;
            font-weight: 700;
            color: #111827;
            margin-bottom: 12px;
        }
        .lead-text {
            font-size: 15px;
            color: #4b5563;
            margin-bottom: 24px;
        }
        .voucher-card {
            background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%);
            border: 2px dashed #059669;
            border-radius: 16px;
            padding: 24px;
            text-align: center;
            margin: 24px 0;
        }
        .voucher-badge {
            display: inline-block;
            background: #059669;
            color: #ffffff;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            padding: 4px 12px;
            border-radius: 9999px;
            margin-bottom: 12px;
        }
        .voucher-value {
            font-size: 28px;
            font-weight: 800;
            color: #065f46;
            margin: 0 0 6px;
        }
        .voucher-code-box {
            background: #ffffff;
            border: 1px solid #a7f3d0;
            border-radius: 10px;
            padding: 10px 20px;
            display: inline-block;
            font-family: 'Courier New', Courier, monospace;
            font-size: 22px;
            font-weight: 800;
            color: #047857;
            letter-spacing: 3px;
            margin: 10px 0;
        }
        .voucher-note {
            font-size: 13px;
            color: #6b7280;
            margin-top: 8px;
        }
        .steps-box {
            background: #f9fafb;
            border-radius: 14px;
            padding: 20px 24px;
            margin: 24px 0;
            border: 1px solid #e5e7eb;
        }
        .steps-box h3 {
            margin: 0 0 14px;
            font-size: 15px;
            font-weight: 700;
            color: #111827;
        }
        .step-item {
            display: flex;
            align-items: flex-start;
            margin-bottom: 12px;
            font-size: 14px;
            color: #4b5563;
        }
        .step-number {
            width: 22px;
            height: 22px;
            background: #059669;
            color: #ffffff;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: 700;
            margin-right: 12px;
            flex-shrink: 0;
        }
        .cta-btn {
            display: block;
            width: 80%;
            max-width: 280px;
            margin: 28px auto 16px;
            padding: 14px 24px;
            background: #059669;
            color: #ffffff !important;
            text-align: center;
            font-size: 15px;
            font-weight: 700;
            text-decoration: none;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
        }
        .footer {
            background: #f9fafb;
            padding: 24px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
            font-size: 13px;
            color: #6b7280;
        }
        .commitments {
            display: flex;
            justify-content: center;
            gap: 16px;
            margin-bottom: 12px;
            font-size: 12px;
            font-weight: 600;
            color: #059669;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>🌿 GreenFood Market</h1>
            <p>Nông sản sạch từ vườn đến gian bếp gia đình</p>
        </div>

        <!-- Content -->
        <div class="content">
            <div class="greeting">Xin chào {{ $recipientName }},</div>
            <div class="lead-text">
                Chào mừng bạn đã gia nhập đại gia đình <strong>GreenFood</strong>! Tài khoản của bạn đã được xác thực email thành công. Từ hôm nay, bạn có thể an tâm đi chợ nông sản sạch VietGAP, thu hoạch tươi mới mỗi sớm mai với dịch vụ giao hỏa tốc 2H.
            </div>

            <!-- Voucher Card -->
            <div class="voucher-card">
                <span class="voucher-badge">Món quà tri ân thành viên mới</span>
                <div class="voucher-value">GIẢM {{ number_format($voucherDiscount, 0, ',', '.') }}đ</div>
                <div>Nhập mã ưu đãi khi thanh toán:</div>
                <div class="voucher-code-box">{{ $voucherCode }}</div>
                <div class="voucher-note">
                    * Áp dụng cho đơn hàng từ {{ number_format($minOrder, 0, ',', '.') }}đ. Hạn sử dụng: 30 ngày kể từ hôm nay.
                </div>
            </div>

            <!-- 3 Bước mua sắm -->
            <div class="steps-box">
                <h3>3 Bước Đi Chợ Nhanh Tại GreenFood:</h3>
                <div class="step-item">
                    <span class="step-number">1</span>
                    <span>Chọn rau củ, trái cây, trà & đặc sản vùng miền đạt chuẩn VietGAP vào giỏ hàng.</span>
                </div>
                <div class="step-item">
                    <span class="step-number">2</span>
                    <span>Nhập mã <strong>{{ $voucherCode }}</strong> tại trang thanh toán để được trừ ngay {{ number_format($voucherDiscount, 0, ',', '.') }}đ.</span>
                </div>
                <div class="step-item">
                    <span class="step-number">3</span>
                    <span>Nhận hàng tận cửa, kiểm tra độ tươi giòn và được bảo hành 100% miễn phí trong 24H.</span>
                </div>
            </div>

            <a href="http://localhost:3000" class="cta-btn">Đi Chợ Ngay Bây Giờ &rarr;</a>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="commitments">
                <span>✓ 100% Chuẩn VietGAP</span> &bull; 
                <span>✓ Bảo Hành Tươi Ngon 24H</span> &bull; 
                <span>✓ Giao Hỏa Tốc GHN</span>
            </div>
            <p style="margin: 6px 0;">Mọi thắc mắc vui lòng liên hệ hotline: <strong>1900 6868</strong> hoặc trả lời trực tiếp email này.</p>
            <p style="margin: 0; font-size: 12px; color: #9ca3af;">&copy; {{ date('Y') }} GreenFood. Bản quyền thuộc về Đội ngũ Phát triển GreenFood.</p>
        </div>
    </div>
</body>
</html>
