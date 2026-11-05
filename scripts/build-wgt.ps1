param([string]$OutputDirectory = (Join-Path $PSScriptRoot '..\dist'))
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$package = Get-Content -LiteralPath (Join-Path $projectRoot 'package.json') -Raw | ConvertFrom-Json
[xml]$config = Get-Content -LiteralPath (Join-Path $projectRoot 'config.xml') -Raw
if ($config.widget.application.package -ne 'StremPTB01') { throw 'Unexpected package identity' }
if ($config.widget.application.required_version -ne '3.0') { throw 'Unexpected required Tizen version' }
$targetDirectory = [IO.Path]::GetFullPath($OutputDirectory)
New-Item -ItemType Directory -Force -Path $targetDirectory | Out-Null
$archivePath = Join-Path $targetDirectory ('StremioK-PTBR-' + $package.version + '-unsigned.wgt')
# CreateNew fails if a file exists, avoiding accidental replacement of a signed package.
$file = [IO.File]::Open($archivePath, [IO.FileMode]::CreateNew)
try {
    $zip = New-Object IO.Compression.ZipArchive($file, [IO.Compression.ZipArchiveMode]::Create, $true)
    try {
        $runtimeFiles = @('index.html','config.xml','icon.png','LICENSE')
        foreach ($folder in @('css','js','service')) {
            $runtimeFiles += Get-ChildItem -LiteralPath (Join-Path $projectRoot $folder) -Recurse -File | ForEach-Object { $_.FullName.Substring($projectRoot.Length + 1) }
        }
        foreach ($relative in ($runtimeFiles | Sort-Object -Unique)) {
            $source = Join-Path $projectRoot $relative
            $entryName = $relative.Replace('\','/')
            $entry = $zip.CreateEntry($entryName, [IO.Compression.CompressionLevel]::Optimal)
            $entry.LastWriteTime = [DateTimeOffset]::new(2026,11,5,0,0,0,[TimeSpan]::Zero)
            $inputStream = [IO.File]::OpenRead($source)
            $entryStream = $entry.Open()
            try { $inputStream.CopyTo($entryStream) } finally { $entryStream.Dispose(); $inputStream.Dispose() }
        }
    } finally { $zip.Dispose() }
} finally { $file.Dispose() }
Write-Output $archivePath
Write-Output 'Unsigned archive: sign with your own Samsung TV certificate before installation. No TV was contacted.'
