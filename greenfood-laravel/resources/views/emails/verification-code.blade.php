<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Xác thực tài khoản GreenFood</title>
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
            max-width: 560px;
            margin: 30px auto;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0,0,0,0.05);
            border: 1px solid #e5e7eb;
        }
        .header {
            background: linear-gradient(135deg, #059669 0%, #10b981 100%);
            padding: 32px 24px;
            text-align: center;
            color: #ffffff;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
            letter-spacing: -0.5px;
        }
        .header p {
            margin: 6px 0 0;
            font-size: 15px;
            opacity: 0.9;
        }
        .content {
            padding: 36px 32px;
        }
        .greeting {
            font-size: 18px;
            font-weight: 600;
            color: #111827;
            margin-bottom: 16px;
        }
        .intro {
            font-size: 15px;
            color: #4b5563;
            margin-bottom: 24px;
        }
        .otp-box {
            background: #ecfdf5;
            border: 2px dashed #059669;
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            margin: 28px 0;
        }
        .otp-label {
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #047857;
            font-weight: 600;
            margin-bottom: 8px;
        }
        .otp-code {
            font-size: 38px;
            font-weight: 800;
            letter-spacing: 10px;
            color: #065f46;
            font-family: 'Courier New', Courier, monospace;
        }
        .meta-info {
            background: #f9fafb;
            border-left: 4px solid #f59e0b;
            padding: 12px 16px;
            border-radius: 6px;
            margin-bottom: 24px;
            font-size: 14px;
            color: #92400e;
        }
        .footer {
            background-color: #f9fafb;
            padding: 20px 32px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
            font-size: 13px;
            color: #6b7280;
        }
        .footer a {
            color: #059669;
            text-decoration: none;
            font-weight: 500;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌿 GreenFood</h1>
            <p>Sàn Thương Mại Điện Tử Nông Sản Sạch</p>
        </div>

        <div class="content">
            <div class="greeting">Kính chào {{ $recipientName }},</div>
            <p class="intro">
                Cảm ơn bạn đã lựa chọn tham gia hệ thống sàn nông sản sạch GreenFood. Để hoàn tất quy trình kích hoạt và bảo mật tài khoản, vui lòng nhập mã xác thực OTP dưới đây:
            </p>

            <div class="otp-box">
                <div class="otp-label">MÃ XÁC THỰC CỦA BẠN</div>
                <div class="otp-code">{{ $otpCode }}</div>
            </div>

            <div class="meta-info">
                ⏱️ Mã xác thực này có hiệu lực trong vòng <strong>{{ $expiresInMinutes }} phút</strong>. Tuyệt đối không chia sẻ mã này cho bất kỳ ai để bảo vệ tài khoản của bạn.
            </div>

            <p style="font-size: 14px; color: #6b7280; margin-top: 24px;">
                Nếu bạn không thực hiện yêu cầu đăng ký này, vui lòng bỏ qua email hoặc liên hệ với đội ngũ CSKH GreenFood để được hỗ trợ.
            </p>
        </div>

        <div class="footer">
            <p style="margin: 0 0 6px;">© 2026 GreenFood — Vì Sức Khỏe Gia Đình Bạn.</p>
            <p style="margin: 0;">Website: <a href="https://greenfood.market">greenfood.market</a> | Hotline: 1900 6868</p>
        </div>
    </div>
</body>
</html>
