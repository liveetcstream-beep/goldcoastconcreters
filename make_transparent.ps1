Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile("C:\Users\hp\AndroidStudioProjects\Rank&Rent\assets\gmb_logo.png")
$bmp = New-Object System.Drawing.Bitmap($img)
$img.Dispose()
$bg = $bmp.GetPixel(0,0)
$bmp.MakeTransparent($bg)
$bmp.Save("C:\Users\hp\AndroidStudioProjects\Rank&Rent\assets\gmb_logo_transparent.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
