# SEO Automation (White-label)

Bu script her yeni musteri icin SEO dosyalarini tek komutla hazirlar:

- `frontend/public/robots.txt`
- `frontend/public/sitemap.xml`
- `frontend/src/config/seo.generated.ts`

## Komut

Proje root'unda:

```bash
node ops/generate-seo-assets.mjs --domain www.ornek-domain.at --city Linz --region Oberoesterreich --nearbyCities "Wels,Steyr,Gmunden" --sports "Fussball,Bubble Soccer" --pitches 2
```

## Parametreler

- `--domain`: Musteri domain'i (zorunluya yakin, brand.config'den de okunur)
- `--city`: Hedef sehir (ornek: Linz)
- `--region`: Hedef bolge (ornek: Oberoesterreich)
- `--sports`: Virgulle ayrilmis spor listesi
- `--pitches`: Toplam saha sayisi
- `--nearbyCities`: Yakindaki sehirler (virgulle)
- `--adminPath`: Admin portal path (default: brand.config.json)

## Build entegrasyonu

`frontend/package.json` icinde `prebuild` adimina baglandi:

```json
"prebuild": "npm run seo:generate"
```

Yani `npm run build` oncesi SEO dosyalari otomatik guncellenir.
