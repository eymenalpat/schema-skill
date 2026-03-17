---
description: "CSV dosyasından toplu schema üretimi"
---

$ARGUMENTS CSV dosya yolu olarak kullanılacak.

## Ön Kontrol
schemaSkill aracının dizini `$SKILL_DIR`. Eğer `$SKILL_DIR/node_modules` yoksa:
```bash
cd $SKILL_DIR && bash setup.sh
```

## CSV Formatı
Eğer kullanıcı CSV belirtmediyse, `$SKILL_DIR/templates/bulk-template.csv` şablonunu göster ve nasıl kullanılacağını açıkla.

Beklenen sütunlar:
- **url** (zorunlu): Sayfa URL'si
- **page_type** (opsiyonel): homepage, product, blog, category, faq, contact, about
- **schemas** (opsiyonel): Üretilecek schema türleri (virgülle ayrılmış)
- **priority** (opsiyonel): high / medium / low
- **notes** (opsiyonel): Notlar

## Görev
1. CSV dosyasını oku
2. Her URL için sırayla:
   a. schemaSkill CLI ile tara:
      ```bash
      cd $SKILL_DIR && npx tsx bin/schemaSkill.ts generate "<url>"
      ```
   b. CSV'deki `schemas` sütunu varsa o türleri üret, yoksa sayfa tipine göre otomatik belirle
   c. Sayfaya uygun TÜM schema'ları üret (tek değil, birden fazla)
3. Tüm sonuçları domain bazlı organize et
4. Toplu rapor ve doküman oluştur

## Çıktı Yapısı
Kullanıcının proje dizininde, her domain için ayrı klasör:
```
{domain}/
├── schemas/
│   ├── homepage-organization.json
│   ├── homepage-website.json
│   ├── blog-my-post-article.json
│   └── ...
├── rapor/
│   ├── rapor.csv
│   └── rapor.md
└── docs/
    ├── schema-dokumantasyonu.md
    └── {type}-detay.md
```

## Rapor CSV
```csv
URL,Sayfa Türü,Schema Türü,Dosya Adı,Test Sonucu,Notlar
```
Test Sonucu: `OK` veya `NOK` (hata detayı)

## Doküman Üretimi
`/schema` komutundaki doküman üretim kurallarının aynısını uygula (schema-dokumantasyonu.md + her tür için detay dokümanı).

## İlerleme
Her URL işlenirken kullanıcıya bildir:
```
[1/10] https://example.com — Organization, WebSite ✅
[2/10] https://example.com/blog/post — Article, BreadcrumbList ✅
```
