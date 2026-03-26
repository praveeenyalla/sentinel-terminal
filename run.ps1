$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$src = Join-Path $root "src"
$out = Join-Path $root "out"
$localJdk = Join-Path $root ".tools\jdk-17.0.18+8\bin"
$javac = "javac"
$java = "java"

if (Test-Path (Join-Path $localJdk "javac.exe")) {
  $javac = Join-Path $localJdk "javac.exe"
  $java = Join-Path $localJdk "java.exe"
}

if (Test-Path $out) {
  Remove-Item $out -Recurse -Force
}

New-Item -ItemType Directory -Path $out | Out-Null
$files = Get-ChildItem -Path $src -Recurse -Filter *.java | ForEach-Object { $_.FullName }

if (-not $files -or $files.Count -eq 0) {
  throw "No Java source files found in $src"
}

& $javac -encoding UTF-8 -d $out $files
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

& $java -cp $out com.anton.terminal.Main
