$ErrorActionPreference = 'Stop'
Set-Location "$PSScriptRoot\.."

New-Item -ItemType Directory -Path "assets\motos" -Force | Out-Null

function Get-ModelTokens([string]$name) {
  $base = $name.ToLower()
  $base = $base -replace '[^a-z0-9\s-]', ' '
  return ($base -split '\s+' | Where-Object { $_ -and $_.Length -ge 2 })
}

function Get-BestCommonsImage([string]$modelName) {
  $queries = @(
    "$modelName motorcycle",
    "$modelName moto",
    "$modelName"
  )

  $tokens = Get-ModelTokens $modelName

  foreach ($qRaw in $queries) {
    $q = [Uri]::EscapeDataString($qRaw)
    $url = "https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=$q&gsrnamespace=6&gsrlimit=12&prop=imageinfo&iiprop=url&iiurlwidth=1600&format=json"

    try {
      $res = Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 35
    } catch {
      continue
    }

    if (-not $res.query.pages) {
      continue
    }

    $pages = $res.query.pages.PSObject.Properties.Value
    $best = $null
    $bestScore = -1

    foreach ($p in $pages) {
      if (-not $p.imageinfo -or -not $p.imageinfo[0].thumburl) {
        continue
      }

      $title = ($p.title -replace '^File:', '').ToLower()
      $score = 0

      foreach ($t in $tokens) {
        if ($title -match [Regex]::Escape($t)) {
          $score += 1
        }
      }

      if ($title -match 'motorcycle|moto|bike|honda|yamaha|dafra|haojue|shineray|sundown|traxx') {
        $score += 1
      }

      if ($score -gt $bestScore) {
        $bestScore = $score
        $best = $p
      }
    }

    if ($best -and $bestScore -ge 2) {
      return [PSCustomObject]@{
        title = $best.title
        image = $best.imageinfo[0].thumburl
        score = $bestScore
      }
    }
  }

  return $null
}

$rows = @()
$htmlFiles = Get-ChildItem "motos\*.html"

foreach ($f in $htmlFiles) {
  $content = Get-Content $f.FullName -Raw
  $altMatch = [regex]::Match($content, 'alt="([^"]+)"')

  if (-not $altMatch.Success) {
    $rows += [pscustomobject]@{
      arquivo = $f.Name
      moto = ''
      status = 'sem-marcacao'
      origem = ''
      local = ''
    }
    continue
  }

  $model = $altMatch.Groups[1].Value.Trim()
  $slug = [IO.Path]::GetFileNameWithoutExtension($f.Name)
  $localRel = "../assets/motos/$slug.jpg"
  $localAbs = Join-Path (Get-Location) "assets\motos\$slug.jpg"

  $hit = Get-BestCommonsImage $model
  if ($hit) {
    try {
      Invoke-WebRequest -Uri $hit.image -OutFile $localAbs -TimeoutSec 40
      $newContent = [regex]::Replace($content, '<img src="([^"]+)" alt="', '<img src="' + $localRel + '" alt="', 1)
      Set-Content -Path $f.FullName -Value $newContent -Encoding UTF8

      $rows += [pscustomobject]@{
        arquivo = $f.Name
        moto = $model
        status = 'baixada'
        origem = $hit.image
        local = $localRel
      }
      continue
    } catch {
      $rows += [pscustomobject]@{
        arquivo = $f.Name
        moto = $model
        status = 'falha-download'
        origem = $hit.image
        local = ''
      }
      continue
    }
  }

  $rows += [pscustomobject]@{
    arquivo = $f.Name
    moto = $model
    status = 'sem-match'
    origem = ''
    local = ''
  }
}

$rows | Export-Csv -Path "assets\motos\download-report.csv" -NoTypeInformation -Encoding UTF8

Write-Output "Paginas processadas: $($rows.Count)"
Write-Output "Baixadas: $(( $rows | Where-Object { $_.status -eq 'baixada' }).Count)"
Write-Output "Sem match: $(( $rows | Where-Object { $_.status -eq 'sem-match' }).Count)"
Write-Output "Falha download: $(( $rows | Where-Object { $_.status -eq 'falha-download' }).Count)"