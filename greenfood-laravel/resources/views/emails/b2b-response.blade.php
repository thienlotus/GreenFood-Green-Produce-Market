<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Phản hồi tư vấn B2B từ GreenFood</title>
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
            max-width: 620px;
            margin: 30px auto;
            background: #ffffff;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.06);
            border: 1px solid #e5e7eb;
        }
        .header {
            background: linear-gradient(135deg, #064e3b 0%, #065f46 50%, #0d9488 100%);
            padding: 36px 28px;
            text-align: center;
            color: #ffffff;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 800;
            letter-spacing: -0.5px;
        }
        .header p {
            margin: 8px 0 0;
            font-size: 14px;
            opacity: 0.9;
        }
        .content {
            padding: 32px 28px;
        }
        .badge-code {
            display: inline-block;
            background: #ecfdf5;
            color: #065f46;
            font-weight: 700;
            font-family: monospace;
            font-size: 14px;
            padding: 6px 16px;
            border-radius: 12px;
            border: 1px solid #a7f3d0;
            margin: 12px 0 20px;
        }
        .response-box {
            background: #f8fafc;
            border-left: 4px solid #059669;
            padding: 20px;
            border-radius: 12px;
            margin: 20px 0;
            font-size: 14px;
            color: #1e293b;
            line-height: 1.7;
        }
        .request-summary {
            background: #fafaf9;
            border: 1px solid #e7e5e4;
            border-radius: 14px;
            padding: 18px;
            margin: 20px 0;
            font-size: 13px;
        }
        .request-summary table {
            width: 100%;
            border-collapse: collapse;
        }
        .request-summary td {
            padding: 6px 0;
            vertical-align: top;
        }
        .request-summary td.label {
            color: #78716c;
            width: 40%;
        }
        .request-summary td.value {
            color: #1c1917;
            font-weight: 600;
        }
        .commitments {
            display: table;
            width: 100%;
            margin: 24px 0;
        }
        .commitment-item {
            display: table-cell;
            width: 50%;
            padding: 10px;
            vertical-align: top;
        }
        .commit-card {
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 12px;
            padding: 14px;
            font-size: 12px;
            color: #166534;
        }
        .commit-card strong {
            display: block;
            margin-bottom: 4px;
            font-size: 13px;
        }
        .btn-action {
            display: inline-block;
            background: linear-gradient(135deg, #059669 0%, #047857 100%);
            color: #ffffff !important;
            text-decoration: none;
            font-weight: 700;
            font-size: 14px;
            padding: 14px 28px;
            border-radius: 12px;
            margin: 20px 0 10px;
            box-shadow: 0 4px 14px rgba(5, 150, 105, 0.3);
        }
        .footer {
            background: #f9fafb;
            padding: 24px 28px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>GREENFOOD B2B PARTNERSHIP</h1>
            <p>Hệ Thống Phản Hồi & Báo Giá Sỉ Khách Hàng Doanh Nghiệp</p>
        </div>

        <!-- Content -->
        <div class="content">
            <p style="font-size: 15px; margin: 0;">
                Kính gửi: <strong>{{ $inquiry->contact_name }}</strong> (Đại diện <strong>{{ $inquiry->company_name }}</strong>),
            </p>

            <p style="font-size: 14px; color: #4b5563; margin-top: 10px;">
                Ban Quản Trị và Bộ phận Khách sỉ Doanh nghiệp GreenFood trân trọng cảm ơn quý đơn vị đã quan tâm và gửi hồ sơ đăng ký hợp tác. Dưới đây là thông tin phản hồi và tư vấn chính thức từ chuyên viên phụ trách:
            </p>

            <div style="text-align: center;">
                <div class="badge-code">
                    Mã hồ sơ: {{ $inquiry->inquiry_code }}
                </div>
            </div>

            <!-- Response Content -->
            <div class="response-box">
                <div style="font-weight: 700; color: #065f46; margin-bottom: 6px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">
                    💬 Lời nhắn & Phản hồi từ {{ $specialistName }}:
                </div>
                <div style="white-space: pre-line;">{!! nl2br(e($responseMessage)) !!}</div>
            </div>

            <!-- Request Details Summary -->
            <div class="request-summary">
                <div style="font-weight: 700; color: #44403c; margin-bottom: 8px; font-size: 13px;">
                    📋 Tóm tắt nhu cầu cung ứng:
                </div>
                <table>
                    <tr>
                        <td class="label">Mô hình kinh doanh:</td>
                        <td class="value">{{ $inquiry->business_type }}</td>
                    </tr>
                    <tr>
                        <td class="label">Sản lượng dự kiến:</td>
                        <td class="value">{{ $inquiry->estimated_volume ?? 'Theo thỏa thuận' }}</td>
                    </tr>
                    <tr>
                        <td class="label">Khung giờ giao hàng:</td>
                        <td class="value">{{ $inquiry->delivery_time ?? 'Trước 06:00 sáng' }}</td>
                    </tr>
                    @if(!empty($inquiry->categories))
                    <tr>
                        <td class="label">Nhóm nông sản quan tâm:</td>
                        <td class="value">{{ implode(', ', $inquiry->categories) }}</td>
                    </tr>
                    @endif
                </table>
            </div>

            <!-- 4 Commitments -->
            <div class="commitments">
                <div class="commitment-item">
                    <div class="commit-card">
                        <strong>🚛 Xe lạnh trước 6h sáng</strong>
                        Giao tận cửa bếp bằng xe chuyên dụng giữ trọn độ tươi giòn.
                    </div>
                </div>
                <div class="commitment-item">
                    <div class="commit-card">
                        <strong>📑 Đầy đủ VAT & ATVSTP</strong>
                        100% kiểm định chất lượng, hồ sơ nguồn gốc rõ ràng.
                    </div>
                </div>
            </div>

            <!-- CTA Online Tracking -->
            <div style="text-align: center; margin-top: 25px;">
                <a href="{{ config('app.frontend_url', 'http://localhost:3000') }}/b2b" class="btn-action">
                    🔍 Tra Cứu Tiến Độ & Hợp Đồng B2B Trực Tuyến
                </a>
                <p style="font-size: 12px; color: #64748b; margin-top: 8px;">
                    Quý khách có thể truy cập cổng <strong>/b2b</strong> và nhập mã <strong>{{ $inquiry->inquiry_code }}</strong> để xem cập nhật mới nhất.
                </p>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p style="margin: 0 0 6px 0;"><strong>Sàn Thương Mại Điện Tử Nông Sản Sạch GreenFood</strong></p>
            <p style="margin: 0 0 4px 0;">Hotline khối Doanh nghiệp: <strong>028 7770 2614</strong> (Hỗ trợ 24/7)</p>
            <p style="margin: 0 0 4px 0;">Email: b2b@greenfood.vn | Website: greenfood.vn</p>
            <p style="margin: 12px 0 0 0; font-size: 11px; color: #9ca3af;">
                Email này được gửi tự động từ Trung tâm Điều hành B2B GreenFood tới đại diện {{ $inquiry->company_name }}.
            </p>
        </div>
    </div>
</body>
</html>
