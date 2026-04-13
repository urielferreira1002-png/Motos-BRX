$ErrorActionPreference = 'Continue'
Set-Location "c:\Users\aprendiz.sistemas01\Downloads\MOTOS BRX"

# Cada entrada tem o arquivo HTML, artigo Wikipedia (EN) e termos Unsplash de fallback
$motos = @(
  @{ arquivo='honda-cg-160-titan.html';   wiki='Honda_CG125';            unsplash='honda+cg+motorcycle+street' },
  @{ arquivo='honda-cg-160-fan.html';     wiki='Honda_CG125';            unsplash='honda+cg+commuter+motorcycle' },
  @{ arquivo='honda-cg-160-start.html';   wiki='Honda_CG125';            unsplash='honda+125+street+motorcycle' },
  @{ arquivo='honda-cg-125.html';         wiki='Honda_CG125';            unsplash='honda+cg125+motorcycle' },
  @{ arquivo='honda-biz-125.html';        wiki='Honda_Biz';              unsplash='honda+biz+scooter+urban' },
  @{ arquivo='honda-pop-110i.html';       wiki='Honda_Pop_100';          unsplash='honda+110+moped+street' },
  @{ arquivo='honda-xre-300.html';        wiki='Honda_XRE300';           unsplash='honda+trail+adventure+motorcycle' },
  @{ arquivo='honda-bros-160.html';       wiki='Honda_NXR150_Bros';      unsplash='honda+bros+enduro+motorcycle' },
  @{ arquivo='honda-cb-300f.html';        wiki='Honda_CB_series';        unsplash='honda+cb300+naked+motorcycle' },
  @{ arquivo='honda-twister-250.html';    wiki='Honda_CBX_250_Twister';  unsplash='honda+250+street+motorcycle' },
  @{ arquivo='yamaha-fazer-250.html';     wiki='Yamaha_Fazer';           unsplash='yamaha+fazer+sport+motorcycle' },
  @{ arquivo='yamaha-lander-250.html';    wiki='Yamaha_XTZ_250';         unsplash='yamaha+adventure+250+motorcycle' },
  @{ arquivo='yamaha-xtz-150.html';       wiki='Yamaha_XT_series';       unsplash='yamaha+xtz+trail+motorcycle' },
  @{ arquivo='yamaha-factor-150.html';    wiki='Yamaha_YBR125';          unsplash='yamaha+150+street+motorcycle' },
  @{ arquivo='yamaha-mt-03.html';         wiki='Yamaha_MT-03';           unsplash='yamaha+mt03+naked+sport' },
  @{ arquivo='yamaha-r3.html';            wiki='Yamaha_YZF-R3';          unsplash='yamaha+r3+sport+race+motorcycle' },
  @{ arquivo='yamaha-xt-660.html';        wiki='Yamaha_XT660R_and_XT660X'; unsplash='yamaha+xt+660+adventure' },
  @{ arquivo='yamaha-nmax-160.html';      wiki='Yamaha_NMAX';            unsplash='yamaha+nmax+scooter+urban' },
  @{ arquivo='yamaha-neo-125.html';       wiki='Yamaha_Neo_s';           unsplash='yamaha+scooter+125+urban' },
  @{ arquivo='yamaha-crosser-150.html';   wiki='Yamaha_XTZ_150';         unsplash='yamaha+crosser+enduro+motorcycle' },
  @{ arquivo='dafra-nh-190.html';         wiki='Benelli_BN600i';         unsplash='naked+190+street+motorcycle' },
  @{ arquivo='dafra-apache-rtr-200.html'; wiki='TVS_Apache';             unsplash='tvs+apache+rtr+200+motorcycle' },
  @{ arquivo='dafra-next-250.html';       wiki='Bajaj_Pulsar_220';       unsplash='naked+250+sport+motorcycle' },
  @{ arquivo='haojue-dk-150.html';        wiki='Haojue';                 unsplash='suzuki+gn125+street+motorcycle' },
  @{ arquivo='haojue-dr-160.html';        wiki='Honda_XRE300';           unsplash='enduro+160+adventure+motorcycle' },
  @{ arquivo='haojue-nk-150.html';        wiki='Honda_CB_series';        unsplash='naked+150+street+motorcycle' },
  @{ arquivo='shineray-xy-150.html';      wiki='Honda_CG125';            unsplash='trail+150+dirt+motorcycle' },
  @{ arquivo='shineray-jet-125.html';     wiki='Yamaha_NMAX';            unsplash='scooter+125+chinese+moped' },
  @{ arquivo='sundown-max-125.html';      wiki='Honda_CG125';            unsplash='125+commuter+street+motorcycle' },
  @{ arquivo='traxx-star-50.html';        wiki='Honda_Cub';              unsplash='50cc+moped+mini+street' }
)

function Get-WikiImgUrl([string]$title) {
  if (!$title) { return $null }
  $apiUrl = "https://en.wikipedia.org/w/api.php?action=query&titles=$title&prop=pageimages&pithumbsize=1400&format=json&piprop=thumbnail"
  $resp = (curl.exe -s --max-time 20 -A "Mozilla/5.0" $apiUrl) | ConvertFrom-Json
  return ($resp.query.pages.PSObject.Properties.Value | Select-Object -First 1).thumbnail.source
}

function Save-Curl([string]$url, [string]$dest) {
  curl.exe -s -L --max-time 40 -A "Mozilla/5.0" -e "https://en.wikipedia.org/" -o $dest $url 2>$null
  return (Test-Path $dest) -and (Get-Item $dest).Length -gt 12000
}

$imgDir = "motos\imgs"
New-Item -ItemType Directory -Force -Path $imgDir | Out-Null

$log = @()
$done = 0

foreach ($m in $motos) {
  $slug     = [IO.Path]::GetFileNameWithoutExtension($m.arquivo)
  $htmlPath = "motos\$($m.arquivo)"
  $dest     = "$imgDir\$slug.jpg"

  if (!(Test-Path $htmlPath)) { continue }

  # Ja existe local
  if ((Test-Path $dest) -and (Get-Item $dest).Length -gt 12000) {
    $log += [pscustomobject]@{moto=$slug; ok='sim'; fonte='cache'}
    $done++
  } else {
    # 1) Tenta Wikipedia API
    $imgUrl = $null
    try { $imgUrl = Get-WikiImgUrl $m.wiki } catch {}

    # 2) Fallback Unsplash
    if (!$imgUrl) {
      $imgUrl = "https://source.unsplash.com/1400x900/?$($m.unsplash)"
    }

    $ok = Save-Curl $imgUrl $dest
    if ($ok) {
      $log += [pscustomobject]@{moto=$slug; ok='sim'; fonte=if($imgUrl -match 'wikipedia|wikimedia'){'wikipedia'}else{'unsplash'}}
      $done++
    } else {
      $log += [pscustomobject]@{moto=$slug; ok='nao'; fonte=$imgUrl}
    }
  }

  # Atualiza src no HTML => caminho local
  $content = Get-Content $htmlPath -Raw
  $updated = [regex]::Replace($content, '(<img src=")[^"]+(" alt=)', "`${1}imgs/$slug.jpg`${2}", 1)
  Set-Content -Path $htmlPath -Value $updated -Encoding UTF8
}

"TOTAL COM FOTO: $done / $($motos.Count)"
$log | Format-Table -AutoSize | Out-String
  @{ arquivo='honda-cg-160-titan.html';   wiki='Honda_CG125';                  unsplash='honda,cg,motorcycle' },
  @{ arquivo='honda-cg-160-fan.html';     wiki='Honda_CG125';                  unsplash='honda,cg,street,motorcycle' },
  @{ arquivo='honda-cg-160-start.html';   wiki='Honda_CG125';                  unsplash='honda,125,commuter,motorcycle' },
  @{ arquivo='honda-cg-125.html';         wiki='Honda_CG125';                  unsplash='honda,cg125,motorcycle' },
  @{ arquivo='honda-biz-125.html';        wiki='Honda_Biz';                    unsplash='honda,biz,scooter' },
  @{ arquivo='honda-pop-110i.html';       wiki='Honda_Pop_100';                unsplash='honda,110,moped,motorcycle' },
  @{ arquivo='honda-xre-300.html';        wiki='Honda_XRE300';                 unsplash='honda,trail,off-road,motorcycle' },
  @{ arquivo='honda-bros-160.html';       wiki='Honda_NXR150_Bros';            unsplash='honda,bros,adventure,motorcycle' },
  @{ arquivo='honda-cb-300f.html';        wiki='Honda_CB_series';              unsplash='honda,cb300,naked,motorcycle' },
  @{ arquivo='honda-twister-250.html';    wiki='Honda_CBX_250_Twister';        unsplash='honda,twister,250,motorcycle' },
  @{ arquivo='yamaha-fazer-250.html';     wiki='Yamaha_FZS600_Fazer';          unsplash='yamaha,fazer,street,motorcycle' },
  @{ arquivo='yamaha-lander-250.html';    wiki='Yamaha_XTZ_250';               unsplash='yamaha,lander,adventure,motorcycle' },
  @{ arquivo='yamaha-xtz-150.html';       wiki='Yamaha_XT_series';             unsplash='yamaha,xtz,trail,motorcycle' },
  @{ arquivo='yamaha-factor-150.html';    wiki='Yamaha_YBR125';                unsplash='yamaha,factor,street,motorcycle' },
  @{ arquivo='yamaha-mt-03.html';         wiki='Yamaha_MT-03';                 unsplash='yamaha,mt03,naked,motorcycle' },
  @{ arquivo='yamaha-r3.html';            wiki='Yamaha_YZF-R3';                unsplash='yamaha,r3,sport,motorcycle' },
  @{ arquivo='yamaha-xt-660.html';        wiki='Yamaha_XT660R_and_XT660X';     unsplash='yamaha,xt,660,enduro,motorcycle' },
  @{ arquivo='yamaha-nmax-160.html';      wiki='Yamaha_NMAX';                  unsplash='yamaha,nmax,scooter' },
  @{ arquivo='yamaha-neo-125.html';       wiki='Yamaha_Neo_s';                 unsplash='yamaha,scooter,125,moped' },
  @{ arquivo='yamaha-crosser-150.html';   wiki='Yamaha_XTZ_150';               unsplash='yamaha,crosser,trail,motorcycle' },
  @{ arquivo='dafra-nh-190.html';         wiki='';                             unsplash='naked,190cc,street,motorcycle' },
  @{ arquivo='dafra-apache-rtr-200.html'; wiki='TVS_Apache';                   unsplash='tvs,apache,rtr,200,motorcycle' },
  @{ arquivo='dafra-next-250.html';       wiki='';                             unsplash='naked,250cc,street,motorcycle,sport' },
  @{ arquivo='haojue-dk-150.html';        wiki='Haojue';                       unsplash='chinese,150cc,street,motorcycle' },
  @{ arquivo='haojue-dr-160.html';        wiki='';                             unsplash='enduro,160cc,off-road,motorcycle' },
  @{ arquivo='haojue-nk-150.html';        wiki='';                             unsplash='naked,150cc,street,naked,motorcycle' },
  @{ arquivo='shineray-xy-150.html';      wiki='';                             unsplash='trail,150cc,motorcycle,dirt' },
  @{ arquivo='shineray-jet-125.html';     wiki='';                             unsplash='chinese,125cc,scooter,moped' },
  @{ arquivo='sundown-max-125.html';      wiki='';                             unsplash='125cc,commuter,urban,motorcycle' },
  @{ arquivo='traxx-star-50.html';        wiki='';                             unsplash='50cc,moped,mini,street,motorcycle' }
)

$headers = @{
  'User-Agent' = 'Mozilla/5.0 (MotosRPBot/2.0; brxrp@local) AppleWebKit/537.36'
  'Referer'    = 'https://commons.wikimedia.org/'
  'Accept'     = 'image/jpeg,image/png,image/*,*/*'
}

function Get-WikiPageImage([string]$title) {
  if (!$title) { return $null }
  foreach ($lang in @('en','pt')) {
    $url = "https://$lang.wikipedia.org/w/api.php?action=query&titles=$title&prop=pageimages&pithumbsize=1400&format=json&piprop=thumbnail"
    try {
      $res = Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 20 -Headers @{'User-Agent'='MotosRPBot/2.0'}
      $pages = $res.query.pages.PSObject.Properties.Value
      foreach ($p in $pages) {
        if ($p.thumbnail.source) { return $p.thumbnail.source }
      }
    } catch {}
  }
  return $null
}

function Save-Img([string]$url, [string]$dest) {
  try {
    Invoke-WebRequest -Uri $url -OutFile $dest -UseBasicParsing -Headers $headers -TimeoutSec 40
    if ((Test-Path $dest) -and (Get-Item $dest).Length -gt 8000) { return $true }
  } catch {}
  if (Test-Path $dest) { Remove-Item $dest -Force }
  return $false
}

$log = @()
$imgDir = "motos\imgs"
New-Item -ItemType Directory -Force -Path $imgDir | Out-Null

foreach ($m in $motos) {
  $slug     = [IO.Path]::GetFileNameWithoutExtension($m.arquivo)
  $htmlPath = "motos\$($m.arquivo)"

  if (!(Test-Path $htmlPath)) {
    $log += [pscustomobject]@{moto=$slug; status='sem_html'; src=''}
    continue
  }

  # Verifica se ja existe imagem local valida
  $existing = @("$imgDir\$slug.jpg","$imgDir\$slug.png") | Where-Object { (Test-Path $_) -and (Get-Item $_).Length -gt 8000 } | Select-Object -First 1
  if ($existing) {
    $localPath = "imgs/$slug.$([IO.Path]::GetExtension($existing).TrimStart('.'))"
    $content = Get-Content $htmlPath -Raw
    $updated = [regex]::Replace($content, '(<img src=")[^"]+(" alt=)', "`${1}$localPath`${2}", 1)
    Set-Content -Path $htmlPath -Value $updated -Encoding UTF8
    $log += [pscustomobject]@{moto=$slug; status='ja_existia'; src=$existing}
    continue
  }

  # 1. Tenta Wikipedia pageimages
  $imgUrl = Get-WikiPageImage $m.wiki

  # 2. Fallback Unsplash
  if (!$imgUrl) {
    $tags = $m.unsplash -replace ',','+'
    $imgUrl = "https://source.unsplash.com/1400x900/?$tags"
  }

  $dest = "$imgDir\$slug.jpg"
  $ok   = Save-Img $imgUrl $dest
  if (!$ok) { $dest = "$imgDir\$slug.png"; $ok = Save-Img $imgUrl $dest }

  if ($ok) {
    $ext2 = [IO.Path]::GetExtension($dest).TrimStart('.')
    $localPath = "imgs/$slug.$ext2"
    $content = Get-Content $htmlPath -Raw
    $updated = [regex]::Replace($content, '(<img src=")[^"]+(" alt=)', "`${1}$localPath`${2}", 1)
    Set-Content -Path $htmlPath -Value $updated -Encoding UTF8
    $status = if ($m.wiki -and $imgUrl -notmatch 'unsplash') { 'wikipedia' } else { 'unsplash' }
    $log += [pscustomobject]@{moto=$slug; status=$status; src=$dest}
  } else {
    $log += [pscustomobject]@{moto=$slug; status='falhou'; src=$imgUrl}
  }
}

$ok2 = ($log | Where-Object { $_.status -in 'wikipedia','unsplash','ja_existia' }).Count
"Resultado: $ok2 / $($motos.Count)"
$log | Format-Table -AutoSize | Out-String
