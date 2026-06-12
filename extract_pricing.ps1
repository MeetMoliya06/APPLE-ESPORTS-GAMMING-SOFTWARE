$content = Get-Content -Path asset.js -Raw
$index = $content.IndexOf("VIP ELITE HUB")
if ($index -ge 0) {
    $start = $index
    $length = [Math]::Min(1200, $content.Length - $start)
    Write-Output "=== Found Varachha/Branches Context ==="
    Write-Output $content.Substring($start, $length)
} else {
    Write-Output "VIP ELITE HUB not found"
}
