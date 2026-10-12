<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Xác nhận tiếp nhận hồ sơ Khách sỉ & B2B GreenFood</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #334155;
            background-color: #f1f5f9;
            margin: 0;
            padding: 24px 12px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
            border: 1px solid #e2e8f0;
        }
        .header {
            background: linear-gradient(135deg, #064e3b 0%, #047857 100%);
            color: #ffffff;
            padding: 32px 24px;
            text-align: center;
        }
        .header h1 {
            margin: 0 0 6px 0;
            font-size: 22px;
            letter-spacing: 0.5px;
            font-weight: 800;
        }
        .header p {
            margin: 0;
            font-size: 13px;
            color: #a7f3d0;
        }
        .content {
            padding: 28px 24px;
        }
        .code-box {
            background-color: #ecfdf5;
            border: 1px dashed #059669;
            padding: 12px 16px;
            border-radius: 10px;
            text-align: center;
            margin: 18px 0;
        }
        .code-label {
            font-size: 11px;
            color: #047857;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 700;
        }
        .code-val {
            font-size: 18px;
            font-weight: 800;
            color: #064e3b;
            font-family: monospace;
            margin-top: 4px;
        }
        .info-card {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 16px;
            margin: 20px 0;
            font-size: 13px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            border-bottom: 1px dashed #e2e8f0;
            padding-bottom: 6px;
        }
        .info-row:last-child {
            margin-bottom: 0;
            border-bottom: none;
            padding-bottom: 0;
        }
        .info-label {
            color: #64748b;
        }
        .info-value {
            color: #0f172a;
            font-weight: 600;
            text-align: right;
        }
        .btn-track {
            display: block;
            width: fit-content;
            margin: 24px auto 8px auto;
            background-color: #047857;
            color: #ffffff !important;
            text-decoration: none;
            padding: 12px 28px;
            border-radius: 10px;
            font-weight: 700;
            font-size: 13px;
            text-align: center;
        }
        .footer {
            background-color: #f8fafc;
            padding: 20px 24px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
            font-size: 12px;
            color: #64748b;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- HEADER -->
        <div class="header">
            <h1>GREENFOOD B2B PARTNERSHIP</h1>
            <p>Hệ Thống Phân Phối Nông Sản Sạch Chuỗi Cung Ứng Khách Sỉ</p>
        </div>

        <!-- CONTENT -->
        <div class="content">
            <p>Kính gửi: <strong>{{ $inquiry->contact_name }}</strong> (Đại diện <strong>{{ $inquiry->company_name }}</strong>),</p>
            
            <p>Hệ thống Quản Trị GreenFood đã tiếp nhận thành công hồ sơ đăng ký hợp tác của quý đơn vị. Chuyên viên khối Khách sỉ & B2B đang tiến hành khảo sát danh mục sản phẩm và lập phương án chiết khấu ưu đãi.</p>

            <!-- CODE BOX -->
            <div class="code-box">
                <div class="code-label">Mã phiếu đối soát trực tuyến:</div>
                <div class="code-val">{{ $inquiry->inquiry_code }}</div>
            </div>

            <!-- SUMMARY INFO -->
            <div class="info-card">
                <div class="info-row">
                    <span class="info-label">Doanh nghiệp:</span>
                    <span class="info-value">{{ $inquiry->company_name }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Người liên hệ:</span>
                    <span class="info-value">{{ $inquiry->contact_name }} ({{ $inquiry->phone }})</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Mô hình hoạt động:</span>
                    <span class="info-value">{{ $inquiry->business_type }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Sản lượng dự kiến:</span>
                    <span class="info-value">{{ $inquiry->estimated_volume ?? 'Theo thỏa thuận' }}</span>
                </div>
                @if(!empty($inquiry->categories))
                <div class="info-row">
                    <span class="info-label">Nhóm hàng quan tâm:</span>
                    <span class="info-value">{{ implode(', ', (array)$inquiry->categories) }}</span>
                </div>
                @endif
            </div>

            <p style="font-size: 13px; color: #334155;">
                ⏱️ <strong>Cam kết thời gian phản hồi:</strong> Chuyên viên B2B của GreenFood sẽ liên hệ lại qua số điện thoại <strong>{{ $inquiry->phone }}</strong> trong vòng <strong>2 giờ làm việc</strong> để gửi bảng giá chiết khấu mới nhất và chuẩn bị mẫu thử nông sản tươi tận nơi.
            </p>

            <a href="{{ $trackingUrl }}" class="btn-track">
                Tra Cứu Tiến Độ Hồ Sơ Trực Tuyến
            </a>
        </div>

        <!-- FOOTER -->
        <div class="footer">
            <p style="margin: 0 0 6px 0; font-weight: 700; color: #047857;">GreenFood - Nông Sản Sạch Từ Tâm</p>
            <p style="margin: 0 0 4px 0;">Hotline Khối B2B: <strong>028 7770 2614</strong> • Email: b2b@greenfood.vn</p>
            <p style="margin: 0;">Trụ sở: TP. Hồ Chí Minh, Việt Nam</p>
        </div>
    </div>
</body>
</html>
