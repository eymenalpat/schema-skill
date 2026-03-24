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
- Ana sayfa → Organization + WebSite + SearchAction + (varsa LocalBusiness)
- Ürün sayfası → Product + Offer + BreadcrumbList + Organization
- Blog yazısı → BlogPosting/Article + BreadcrumbList + Organization
- Kategori sayfası → ItemList + BreadcrumbList + Organization
- SSS sayfası → FAQPage + BreadcrumbList + Organization
- İletişim → ContactPage + Organization + LocalBusiness
- Tüm iç sayfalar → BreadcrumbList dahil et
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

## Playwright MCP ile Google Rich Results Test Doğrulaması (validate modu)
Eğer kullanıcı `validate` flag'i verdiyse, TÜM schema üretimi tamamlandıktan sonra final aşamada her URL için Google Rich Results Test doğrulaması yap:

### Doğrulama Adımları
1. Tüm schema'lar üretilip dosyalara yazıldıktan sonra bu aşamaya geç
2. Playwright MCP kullanarak her URL için şu adımları izle:
   a. `mcp__playwright__browser_navigate` ile `https://search.google.com/test/rich-results` adresine git
   b. `mcp__playwright__browser_snapshot` ile sayfanın yüklendiğini doğrula
   c. URL giriş alanına test edilecek URL'yi yaz (`mcp__playwright__browser_fill_form` veya `mcp__playwright__browser_click` + `mcp__playwright__browser_type`)
   d. "URL'yi test et" / "Test URL" butonuna tıkla
   e. Sonuçların yüklenmesini bekle (`mcp__playwright__browser_wait_for` — max 30 saniye)
   f. `mcp__playwright__browser_snapshot` ile sonuç sayfasını oku
   g. Tespit edilen schema türleri, hata ve uyarıları parse et
3. Her URL'nin doğrulama sonucunu kaydet

### Doğrulama Raporu
Eğer validate modu aktifse, rapor klasörüne ek bir `dogrulama-raporu.md` dosyası oluştur:

```markdown
# Google Rich Results Test Doğrulama Raporu

## Özet
- Toplam test edilen URL: X
- Geçerli: Y
- Hatalı: Z

## Detaylı Sonuçlar

### https://example.com
- **Durum:** ✅ Geçerli / ❌ Hatalı
- **Tespit edilen schema'lar:** Organization, WebSite
- **Hatalar:** (varsa)
- **Uyarılar:** (varsa)
```

### Rapor CSV'ye Ek Sütun
Validate modunda rapor.csv'ye `Google Test` sütunu eklenir:
```csv
URL,Sayfa Türü,Schema Türü,Dosya Adı,Test Sonucu,Durum,Google Test,Notlar
https://example.com,Ana Sayfa,Organization,homepage-organization.json,OK,Yeni,✅ Geçerli,
```

### Önemli Notlar
- Bu adım sadece `validate` flag'i verildiğinde çalışır
- Doğrulama, schema üretimi tamamlandıktan SONRA yapılır (üretimi yavaşlatmaz)
- Google Rich Results Test URL tabanlı çalışır — yani schema'ların sayfaya zaten eklenmiş olması gerekir. Eğer schema henüz eklenmemişse, kullanıcıya bunu bildir ve "Code Snippet" test modunu kullanmayı öner
- Her URL arası 3-5 saniye bekle (rate limit koruması)
- Eğer Google Rich Results Test erişilemezse veya captcha çıkarsa, kullanıcıya bildir ve lokal doğrulama sonuçlarını kullan

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
