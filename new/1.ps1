# Collect all files except node_modules
$files = Get-ChildItem -Recurse -File -Include *.ts, *.tsx, *.css, *.toml, *.txt |
    Where-Object { $_.FullName -notmatch '\\node_modules\\' }

# Split into 3 roughly equal groups
$chunkSize = [math]::Ceiling($files.Count / 3)

for ($i = 0; $i -lt 3; $i++) {
    $start = $i * $chunkSize
    $end   = [math]::Min(($start + $chunkSize - 1), $files.Count - 1)

    $chunkFiles = $files[$start..$end]
    $outFile = "combined_part_$($i+1).txt"

    foreach ($f in $chunkFiles) {
        "===== $($f.FullName) =====" | Out-File $outFile -Append
        Get-Content $f | Out-File $outFile -Append
    }
}
