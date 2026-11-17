Add-Type -AssemblyName System.Drawing

$imgPath = "D:\work\ross-atends\parent-app\public\play_store_feature_graphic_1024x500.png"
if (Test-Path $imgPath) {
    $img = [System.Drawing.Image]::FromFile($imgPath)
    Write-Host "Raw captured image dimensions: $($img.Width) x $($img.Height)"

    # Resize to exact 1024x500 if needed
    if ($img.Width -ne 1024 -or $img.Height -ne 500) {
        $exactBmp = New-Object System.Drawing.Bitmap(1024, 500, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
        $g = [System.Drawing.Graphics]::FromImage($exactBmp)
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $g.DrawImage($img, 0, 0, 1024, 500)
        $g.Dispose()
        $img.Dispose()
        $exactBmp.Save($imgPath, [System.Drawing.Imaging.ImageFormat]::Png)
        $exactBmp.Dispose()
        Write-Host "Resized to exact 1024 x 500 pixels!"
    } else {
        $img.Dispose()
        Write-Host "Image is already exact 1024 x 500 pixels!"
    }
}
