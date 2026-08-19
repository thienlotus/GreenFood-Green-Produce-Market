<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>GreenFood Backend API</title>
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700" rel="stylesheet" />
    <style>
        body {
            font-family: 'Instrument Sans', sans-serif;
            background: linear-gradient(135deg, #065f46 0%, #047857 50%, #059669 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0;
            padding: 20px;
            box-sizing: border-box;
        }
        .card {
            background: rgba(255, 255, 255, 0.95);
            color: #1f2937;
            padding: 40px;
            border-radius: 24px;
            max-width: 540px;
            width: 100%;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }
        .badge {
            background: #d1fae5;
            color: #065f46;
            padding: 6px 16px;
            border-radius: 9999px;
            font-weight: 700;
            font-size: 13px;
            display: inline-block;
            margin-bottom: 16px;
        }
        h1 {
            font-size: 28px;
            margin: 0 0 10px;
            color: #065f46;
        }
        p {
            color: #4b5563;
            font-size: 15px;
            line-height: 1.6;
            margin: 0 0 24px;
        }
        .btn {
            display: inline-block;
            background: #059669;
            color: white;
            padding: 12px 28px;
            border-radius: 12px;
            text-decoration: none;
            font-weight: 700;
            font-size: 15px;
            transition: all 0.2s;
        }
        .btn:hover {
            background: #047857;
            transform: translateY(-1px);
        }
        .info-box {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 16px;
            margin-top: 24px;
            text-align: left;
            font-size: 13px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
        }
        .info-row:last-child {
            margin-bottom: 0;
        }
        .status-dot {
            height: 8px;
            width: 8px;
            background-color: #10b981;
            border-radius: 50%;
            display: inline-block;
            margin-right: 6px;
        }
    </style>
</head>
<body>
    <div class="card">
        <span class="badge">🌿 GREENFOOD PLATFORM</span>
        <h1>GreenFood API Backend</h1>
        <p>Hệ thống máy chủ dịch vụ quản trị và cơ sở dữ liệu nông sản sạch GreenFood Việt Nam đang hoạt động.</p>
        <a href="http://localhost:3000" class="btn">👉 Mở Web GreenFood (Cửa hàng)</a>

        <div class="info-box">
            <div class="info-row">
                <span style="color: #6b7280;">Trạng thái hệ thống:</span>
                <strong style="color: #059669;"><span class="status-dot"></span>Đang hoạt động</strong>
            </div>
            <div class="info-row">
                <span style="color: #6b7280;">Cơ sở dữ liệu (MySQL):</span>
                <strong>GREEN_FOOB</strong>
            </div>
            <div class="info-row">
                <span style="color: #6b7280;">Frontend UI:</span>
                <a href="http://localhost:3000" style="color: #059669; text-decoration: none; font-weight: 600;">http://localhost:3000</a>
            </div>
        </div>
    </div>
</body>
</html>
