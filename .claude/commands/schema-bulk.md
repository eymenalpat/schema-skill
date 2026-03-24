---
description: "CSV dosyasından toplu schema üretimi"
---

$ARGUMENTS CSV dosya yolu ve opsiyonel `validate` flag'i olarak kullanılacak.

Argüman parse:
- `$ARGUMENTS` = `urls.csv` → CSV yolu: `urls.csv`, doğrulama: **kapalı**
- `$ARGUMENTS` = `urls.csv validate` → CSV yolu: `urls.csv`, doğrulama: **açık** (Playwright MCP ile Google Rich Results Test)
- `$ARGUMENTS` = `urls.csv | validate` → Aynı şekilde doğrulama **açık** (pipe karakteri opsiyonel)

## Ön Kontrol
Aracın dizini `$SKILL_DIR`.

1. Güncelleme kontrolü yap:
```bash
cd $SKILL_DIR && bash update-check.sh
```

2. Eğer `$SKILL_DIR/node_modules` yoksa ilk kurulumu yap:
```bash
cd $SKILL_DIR && bash setup.sh
```

## CSV Formatı
Eğer kullanıcı CSV belirtmediyse, `$SKILL_DIR/templates/bulk-template.csv` şablonunu göster ve nasıl kullanılacağını açıkla.

Beklenen sütunlar:
- **url** (zorunlu): Sayfa URL'si
- **page_type** (opsiyonel): homepage, product, blog, category, faq, contact, about — veya `auto` (sayfa taranarak otomatik algılanır)
- **schemas** (opsiyonel): Üretilecek schema türleri (virgülle ayrılmış) — veya `auto` (sayfa tipine göre otomatik belirlenir)
- **priority** (opsiyonel): high / medium / low
- **notes** (opsiyonel): Notlar

Sütun boş bırakılırsa veya `auto` yazılırsa aynı davranır: otomatik algılama devreye girer.

## Görev
1. CSV dosyasını oku
2. Her URL için sırayla:
   a. schemaSkill CLI ile tara:
      ```bash
      cd $SKILL_DIR && npx tsx bin/schemaSkill.ts generate "<url>"
      ```
   b. `page_type` sütunu `auto` veya boşsa: sayfa içeriğini analiz ederek tipi otomatik algıla
   c. `schemas` sütunu `auto` veya boşsa: algılanan sayfa tipine göre uygun schema türlerini otomatik belirle (aşağıdaki eşleştirme tablosuna göre)
   d. `schemas` sütununda spesifik türler varsa sadece onları üret
   e. Sayfada zaten mevcut olan schema'ları kontrol et:
      - Mevcut ve SORUNSUZ → tekrar üretme, raporda "Mevcut — Geçerli" göster
      - Mevcut ama HATALI → düzeltilmiş versiyon üret, raporda "Mevcut — Düzeltildi" göster
      - EKSİK → yeni üret, raporda "Yeni" göster

### Otomatik Schema Eşleştirme (auto modu)
Kurallar:
- **WebPage** → TÜM sayfalara eklenmeli
- **Organization + WebSite** → SADECE ana sayfa ve hakkımızda sayfasına. Diğer sayfalara EKLEME.
- Ana sayfa → Organization + WebSite + SearchAction + WebPage + (varsa LocalBusiness)
- Hakkımızda → Organization + WebPage + BreadcrumbList
- Ürün sayfası → Product + Offer + WebPage + BreadcrumbList
- Blog yazısı → BlogPosting/Article + WebPage + BreadcrumbList
- Kategori sayfası → ItemList + WebPage + BreadcrumbList
- SSS sayfası → FAQPage + WebPage + BreadcrumbList
- İletişim → ContactPage + WebPage + BreadcrumbList + (varsa LocalBusiness)
- Tüm diğer iç sayfalar → WebPage + BreadcrumbList
- **ItemList kuralı:** Paginated sayfalarda SADECE mevcut sayfada görünen ürünleri listele. Sonraki sayfalardaki ürünleri DAHİL ETME.
3. Tüm sonuçları domain bazlı organize et
4. Toplu rapor ve doküman oluştur

## Çıktı Yapısı
Kullanıcının proje dizininde, her domain için ayrı klasör:
```
{domain}/
├── schemas/
│   ├── homepage-organization.json
│   ├── homepage-website.json
│   ├── homepage-merged.json              # Tüm homepage schemaları tek @graph dosyasında
│   ├── blog-my-post-article.json
│   ├── blog-my-post-breadcrumblist.json
│   ├── blog-my-post-merged.json          # Tüm blog-my-post schemaları tek @graph dosyasında
│   └── ...
├── rapor/
│   ├── rapor.csv
│   └── rapor.md
└── docs/
    ├── schema-dokumantasyonu.md
    └── {type}-detay.md
```

## Merged (@graph) Dosyaları
Bir sayfa için birden fazla schema üretildiyse, ayrı dosyaların yanında `{sayfa-slug}-merged.json` oluştur:
```json
{
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", ... },
    { "@type": "WebSite", ... }
  ]
}
```
Bu dosya tek `<script type="application/ld+json">` tag'ı gerektiren CRM'ler içindir.

## Doğrulama ve Otomatik Düzeltme
Her üretilen schema otomatik olarak lokal doğrulanır (vocabulary + Google required properties). Hata varsa AI'a geri gönderilip düzeltilir (max 2 deneme). Çıktıda yalnızca doğrulanmış schemalar yer alır.

## Playwright MCP ile Harici Doğrulama (validate modu)
Eğer kullanıcı `validate` flag'i verdiyse, TÜM schema üretimi tamamlandıktan sonra final aşamada her URL için iki aşamalı harici doğrulama yap:

### Aşama 1: Schema.org Validator (validator.schema.org)
Her URL için önce Schema.org Validator ile yapısal doğrulama yap:

1. `mcp__playwright__browser_navigate` ile `https://validator.schema.org/` adresine git
2. "Fetch URL" sekmesine tıkla
3. URL giriş alanına test edilecek URL'yi yaz
4. "Run" butonuna tıkla
5. Sonuçların yüklenmesini bekle (max 30 saniye)
6. `mcp__playwright__browser_snapshot` ile sonuç sayfasını oku
7. Tespit edilen schema türleri, yapısal hatalar ve uyarıları parse et

Bu aşama schema'nın **schema.org spesifikasyonuna** uygunluğunu kontrol eder:
- Geçerli @type kullanımı
- Property isimlerinin doğruluğu
- Değer tiplerinin uygunluğu
- İç içe yapıların doğruluğu

### Aşama 2: Google Rich Results Test (search.google.com/test/rich-results)
Schema.org Validator'dan sonra Google Rich Results Test ile zengin sonuç uygunluğunu kontrol et:

1. `mcp__playwright__browser_navigate` ile `https://search.google.com/test/rich-results` adresine git
2. `mcp__playwright__browser_snapshot` ile sayfanın yüklendiğini doğrula
3. URL giriş alanına test edilecek URL'yi yaz
4. "URL'yi test et" / "Test URL" butonuna tıkla
5. Sonuçların yüklenmesini bekle (max 30 saniye)
6. `mcp__playwright__browser_snapshot` ile sonuç sayfasını oku
7. Zengin sonuç uygunluğu, hata ve uyarıları parse et

Bu aşama schema'nın **Google zengin sonuçlarına** uygunluğunu kontrol eder:
- Hangi zengin sonuç türleri destekleniyor
- Zorunlu alanlar eksik mi
- Google'a özel kurallar karşılanıyor mu

### Doğrulama Sırası
Her URL için sıra: **Schema.org Validator → Google Rich Results Test**
Her URL arası 3-5 saniye bekle (rate limit koruması).

### Doğrulama Raporu
Validate modu aktifse, rapor klasörüne `dogrulama-raporu.md` oluştur:

```markdown
# Schema Doğrulama Raporu

## Özet
- Toplam test edilen URL: X
- Schema.org Validator — Geçerli: Y / Hatalı: Z
- Google Rich Results — Geçerli: Y / Hatalı: Z

## Detaylı Sonuçlar

### https://example.com

#### Schema.org Validator
- **Durum:** ✅ Geçerli / ❌ Hatalı
- **Tespit edilen schema'lar:** Organization, WebSite
- **Hatalar:** (varsa)
- **Uyarılar:** (varsa)

#### Google Rich Results Test
- **Durum:** ✅ Geçerli / ❌ Hatalı
- **Desteklenen zengin sonuçlar:** Sitelinks Search Box, Logo
- **Hatalar:** (varsa)
- **Uyarılar:** (varsa)
```

### Rapor CSV'ye Ek Sütunlar
Validate modunda rapor.csv'ye iki ek sütun eklenir:
```csv
URL,Sayfa Türü,Schema Türü,Dosya Adı,Test Sonucu,Durum,Schema.org Validator,Google Rich Results,Notlar
https://example.com,Ana Sayfa,Organization,homepage-organization.json,OK,Yeni,✅ Geçerli,✅ Geçerli,
```

### Önemli Notlar
- Bu adım sadece `validate` flag'i verildiğinde çalışır
- Doğrulama, schema üretimi tamamlandıktan SONRA yapılır (üretimi yavaşlatmaz)
- Her iki test de URL tabanlı çalışır — schema'ların sayfaya zaten eklenmiş olması gerekir. Henüz eklenmemişse kullanıcıya bildir
- Eğer herhangi bir test aracı erişilemezse veya captcha çıkarsa, kullanıcıya bildir ve diğer aracın sonuçlarını kullan

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
