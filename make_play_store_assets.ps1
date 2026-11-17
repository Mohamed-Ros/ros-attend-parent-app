[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
Add-Type -AssemblyName System.Drawing

$publicDir = "D:\work\ross-atends\parent-app\public"
$logoPath = Join-Path $publicDir "logo.png"

if (-not (Test-Path $logoPath)) {
    Write-Host "logo.png not found at $logoPath"
    exit 1
}

$logoImg = [System.Drawing.Image]::FromFile($logoPath)
Write-Host "Loaded source logo: $($logoImg.Width) x $($logoImg.Height)"

# Helper function to convert hex color to System.Drawing.Color
function Get-Color ([string]$hex) {
    return [System.Drawing.ColorTranslator]::FromHtml($hex)
}

# 1. APP ICON (512x512)
$iconSize = 512
$iconBmp = New-Object System.Drawing.Bitmap($iconSize, $iconSize, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$gIcon = [System.Drawing.Graphics]::FromImage($iconBmp)

$gIcon.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$gIcon.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gIcon.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$gIcon.Clear([System.Drawing.Color]::Transparent)

$margin = [int]($iconSize * 0.08)
$avail = $iconSize - ($margin * 2)
$scale = [Math]::Min($avail / $logoImg.Width, $avail / $logoImg.Height)
$w = [int]($logoImg.Width * $scale)
$h = [int]($logoImg.Height * $scale)
$x = [int]($margin + ($avail - $w) / 2)
$y = [int]($margin + ($avail - $h) / 2)

$gIcon.DrawImage($logoImg, $x, $y, $w, $h)
$gIcon.Dispose()

$iconFile = Join-Path $publicDir "play_store_icon_512x512.png"
$iconBmp.Save($iconFile, [System.Drawing.Imaging.ImageFormat]::Png)
$iconBmp.Dispose()
Write-Host "Generated: $iconFile (512 x 512)"


# 2. FEATURE GRAPHIC (1024x500)
$fgW = 1024
$fgH = 500
$fgBmp = New-Object System.Drawing.Bitmap($fgW, $fgH, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$gFg = [System.Drawing.Graphics]::FromImage($fgBmp)

$gFg.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$gFg.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gFg.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

$rectFg = New-Object System.Drawing.Rectangle(0, 0, $fgW, $fgH)
$c1 = Get-Color "#16423C"
$c2 = Get-Color "#0D2824"
$brushBg = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rectFg, $c1, $c2, [System.Drawing.Drawing2D.LinearGradientMode]::ForwardDiagonal)
$gFg.FillRectangle($brushBg, $rectFg)
$brushBg.Dispose()

# Decorative Glow Circle
$brushGlow = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(35, 16, 185, 129))
$gFg.FillEllipse($brushGlow, -80, -80, 480, 480)
$gFg.FillEllipse($brushGlow, 680, 180, 460, 460)
$brushGlow.Dispose()

# Center/Right Logo
$logoTargetH = 340
$logoScale = $logoTargetH / $logoImg.Height
$logoW = [int]($logoImg.Width * $logoScale)
$logoH = [int]($logoImg.Height * $logoScale)
$logoX = [int]($fgW - $logoW - 70)
$logoY = [int](($fgH - $logoH) / 2)

$gFg.DrawImage($logoImg, $logoX, $logoY, $logoW, $logoH)

# English & Clean Text overlay for high compatibility
$fontTitle = New-Object System.Drawing.Font("Arial", 38, [System.Drawing.FontStyle]::Bold)
$fontSub = New-Object System.Drawing.Font("Arial", 20, [System.Drawing.FontStyle]::Bold)
$brushWhite = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$brushEmerald = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 16, 185, 129))

$gFg.DrawString("ROS Parent Portal", $fontTitle, $brushWhite, 65, 160)
$gFg.DrawString("Attendance • Grades • Billing", $fontSub, $brushEmerald, 70, 240)

$fontTitle.Dispose()
$fontSub.Dispose()
$brushWhite.Dispose()
$brushEmerald.Dispose()
$gFg.Dispose()

$fgFile = Join-Path $publicDir "play_store_feature_graphic_1024x500.png"
$fgBmp.Save($fgFile, [System.Drawing.Imaging.ImageFormat]::Png)
$fgBmp.Dispose()
Write-Host "Generated: $fgFile (1024 x 500)"


# 3. SCREENSHOT MOCKUP (1080x1920)
$ssW = 1080
$ssH = 1920
$ssBmp = New-Object System.Drawing.Bitmap($ssW, $ssH, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$gSs = [System.Drawing.Graphics]::FromImage($ssBmp)
$gSs.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$gSs.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gSs.Clear((Get-Color "#F8FAFC"))

# Top Banner
$rectHead = New-Object System.Drawing.Rectangle(0, 0, $ssW, 450)
$brushHead = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rectHead, (Get-Color "#16423C"), (Get-Color "#0D2824"), [System.Drawing.Drawing2D.LinearGradientMode]::Vertical)
$gSs.FillRectangle($brushHead, $rectHead)
$brushHead.Dispose()

# Logo in Mockup
$ssLogoScale = 240 / $logoImg.Height
$ssLogoW = [int]($logoImg.Width * $ssLogoScale)
$ssLogoH = [int]($logoImg.Height * $ssLogoScale)
$gSs.DrawImage($logoImg, [int](($ssW - $ssLogoW) / 2), 70, $ssLogoW, $ssLogoH)

$fontSsTitle = New-Object System.Drawing.Font("Arial", 32, [System.Drawing.FontStyle]::Bold)
$fontSsSub = New-Object System.Drawing.Font("Arial", 22, [System.Drawing.FontStyle]::Bold)
$brushWhite = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$brushDark = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 30, 41, 59))
$brushMuted = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 100, 116, 139))
$brushEmerald = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 22, 66, 60))

$gSs.DrawString("ROS Parent Portal", $fontSsTitle, $brushWhite, 360, 340)

# Card 1
$rectCard1 = New-Object System.Drawing.Rectangle(70, 520, 940, 360)
$brushCard = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
$gSs.FillRectangle($brushCard, $rectCard1)
$gSs.DrawRectangle((New-Object System.Drawing.Pen((Get-Color "#E2E8F0"), 3)), $rectCard1)
$gSs.DrawString("Attendance & Records", $fontSsSub, $brushEmerald, 110, 570)
$gSs.DrawString("Real-time student check-in & absence alerts", $fontSsSub, $brushMuted, 110, 650)
$gSs.DrawString("Attendance Rate: 96%", $fontSsSub, $brushDark, 110, 730)

# Card 2
$rectCard2 = New-Object System.Drawing.Rectangle(70, 930, 940, 360)
$gSs.FillRectangle($brushCard, $rectCard2)
$gSs.DrawRectangle((New-Object System.Drawing.Pen((Get-Color "#E2E8F0"), 3)), $rectCard2)
$gSs.DrawString("Exams & Performance", $fontSsSub, $brushEmerald, 110, 980)
$gSs.DrawString("Instant access to monthly exam scores & evaluation", $fontSsSub, $brushMuted, 110, 1060)
$gSs.DrawString("Math: 48/50  •  Physics: 50/50", $fontSsSub, $brushDark, 110, 1140)

# Card 3
$rectCard3 = New-Object System.Drawing.Rectangle(70, 1340, 940, 360)
$gSs.FillRectangle($brushCard, $rectCard3)
$gSs.DrawRectangle((New-Object System.Drawing.Pen((Get-Color "#E2E8F0"), 3)), $rectCard3)
$gSs.DrawString("Financial & Tuition Fees", $fontSsSub, $brushEmerald, 110, 1390)
$gSs.DrawString("Track tuition fee payments and receipts", $fontSsSub, $brushMuted, 110, 1470)
$gSs.DrawString("Account Status: Fully Settled", $fontSsSub, $brushDark, 110, 1550)

$fontSsTitle.Dispose()
$fontSsSub.Dispose()
$brushWhite.Dispose()
$brushDark.Dispose()
$brushMuted.Dispose()
$brushEmerald.Dispose()
$brushCard.Dispose()
$gSs.Dispose()

$ssFile1 = Join-Path $publicDir "play_store_screenshot_1080x1920.png"
$ssBmp.Save($ssFile1, [System.Drawing.Imaging.ImageFormat]::Png)
$ssBmp.Dispose()
Write-Host "Generated: $ssFile1 (1080 x 1920)"

$logoImg.Dispose()
Write-Host "All Play Store assets generated successfully!"
