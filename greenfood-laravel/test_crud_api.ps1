$base = 'http://127.0.0.1:8000/api/shipping-zones'
Write-Host "=== 1. TEST GET METHOD ===" -ForegroundColor Cyan
$getRes = Invoke-RestMethod -Uri $base -Method Get
Write-Host "Success: $($getRes.success), Total Zones: $($getRes.data.Count)"

Write-Host "`n=== 2. TEST POST METHOD ===" -ForegroundColor Yellow
$postBody = @{
    name = "Khu Vực Núi Cao Tây Bắc"
    provinces = "Lào Cai, Điện Biên, Sơn La"
    base_fee = 45000
    extra_fee_per_kg = 5000
    free_ship_minimum = 600000
    estimated_days = "2-3 ngày"
    is_active = $true
} | ConvertTo-Json -Depth 5

$postRes = Invoke-RestMethod -Uri $base -Method Post -Body $postBody -ContentType "application/json; charset=utf-8"
$newId = $postRes.data.id
Write-Host "Success: $($postRes.success), Message: $($postRes.message), Created ID: $newId"

Write-Host "`n=== 3. TEST PUT METHOD ===" -ForegroundColor Green
$putBody = @{
    name = "Khu Vực Núi Cao Tây Bắc (Đã Update)"
    base_fee = 35000
    estimated_days = "1-2 ngày"
} | ConvertTo-Json -Depth 5

$putRes = Invoke-RestMethod -Uri "$base/$newId" -Method Put -Body $putBody -ContentType "application/json; charset=utf-8"
Write-Host "Success: $($putRes.success), Message: $($putRes.message), New Fee: $($putRes.data.base_fee)"

Write-Host "`n=== 4. TEST DELETE METHOD ===" -ForegroundColor Red
$delRes = Invoke-RestMethod -Uri "$base/$newId" -Method Delete
Write-Host "Success: $($delRes.success), Message: $($delRes.message)"
