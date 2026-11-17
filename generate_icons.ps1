Add-Type -AssemblyName System.Drawing

$srcPath = "D:\work\ross-atends\parent-app\public\logo.png"
if (-not (Test-Path $srcPath)) {
    Write-Host "Source logo not found at $srcPath"
    exit 1
}

$srcImg = [System.Drawing.Image]::FromFile($srcPath)
Write-Host "Loaded logo ($($srcImg.Width) x $($srcImg.Height))"

function Create-SquareIcon {
    param (
        [System.Drawing.Image]$source,
        [int]$targetSize,
        [string]$outputPath,
        [bool]$isRound = $false
    )

    $bmp = New-Object System.Drawing.Bitmap($targetSize, $targetSize, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)

    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)

    if ($isRound) {
        $path = New-Object System.Drawing.Drawing2D.GraphicsPath
        $path.AddEllipse(0, 0, $targetSize, $targetSize)
        $g.SetClip($path)
    }

    # Calculate aspect ratio to fit inside canvas (with margin)
    $margin = [int]($targetSize * 0.1) # 10% padding
    $availSize = $targetSize - ($margin * 2)

    $scale = [Math]::Min($availSize / $source.Width, $availSize / $source.Height)
    $drawW = [int]($source.Width * $scale)
    $drawH = [int]($source.Height * $scale)
    $drawX = [int]($margin + ($availSize - $drawW) / 2)
    $drawY = [int]($margin + ($availSize - $drawH) / 2)

    $g.DrawImage($source, $drawX, $drawY, $drawW, $drawH)

    $g.Dispose()
    $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Host "Generated: $outputPath ($targetSize x $targetSize)"
}

$resBase = "D:\work\ross-atends\parent-app\android\app\src\main\res"

$densities = @(
    @{ Folder = "mipmap-mdpi";    Square = 48;  Fore = 108 },
    @{ Folder = "mipmap-hdpi";    Square = 72;  Fore = 162 },
    @{ Folder = "mipmap-xhdpi";   Square = 96;  Fore = 216 },
    @{ Folder = "mipmap-xxhdpi";  Square = 144; Fore = 324 },
    @{ Folder = "mipmap-xxxhdpi"; Square = 192; Fore = 432 }
)

foreach ($d in $densities) {
    $dir = Join-Path $resBase $d.Folder
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir | Out-Null
    }

    Create-SquareIcon -source $srcImg -targetSize $d.Square -outputPath (Join-Path $dir "ic_launcher.png") -isRound $false
    Create-SquareIcon -source $srcImg -targetSize $d.Square -outputPath (Join-Path $dir "ic_launcher_round.png") -isRound $true
    Create-SquareIcon -source $srcImg -targetSize $d.Fore -outputPath (Join-Path $dir "ic_launcher_foreground.png") -isRound $false
}

# Play Store High Res Icon (512x512)
$playStoreIconPath = "D:\work\ross-atends\parent-app\public\play_store_icon.png"
Create-SquareIcon -source $srcImg -targetSize 512 -outputPath $playStoreIconPath -isRound $false

$srcImg.Dispose()
Write-Host "All Android icons and Play Store icon generated successfully!"
