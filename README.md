# schemaSkill — Schema Markup Otomatik Üretim Aracı

Web sayfaları için **Schema.org JSON-LD yapılandırılmış veri** üreten, doğrulayan ve raporlayan bir araç. Claude Code skill olarak kullanılabilir.

## Ne Yapar?

- Verilen URL'yi Playwright ile tarar (JS-rendered sayfalar dahil)
- Sayfa tipini otomatik algılar (Product, Article, FAQPage, LocalBusiness vb.)
- Azure OpenAI ile **birden fazla** JSON-LD schema üretir (Organization + WebSite + BreadcrumbList gibi)
- Google Rich Results standartlarına göre doğrular
- Müşteriye atmalık Türkçe dokümantasyon oluşturur
- Toplu denetim ile CSV'den yüzlerce URL'yi analiz eder

## Kurulum

```bash
git clone https://github.com/eymenalpat/schema-skill.git
cd schema-skill
SCHEMA_API_KEY="api-key-buraya" bash setup.sh
```

Setup scripti şunları otomatik yapar:
- `npm install` (tüm bağımlılıklar)
- Playwright Chromium kurulumu
- `.env` dosyası oluşturma

## Claude Code Skill Olarak Kullanım

Repo klonlandıktan ve kurulum yapıldıktan sonra, herhangi bir projede şu komutları kullanabilirsiniz:

### `/schema <url>`
Tek URL için tüm uygun schema'ları üretir.

```
/schema https://www.example.com
```

Çıktı:
```
example.com/
├── schemas/
│   ├── homepage-organization.json
│   ├── homepage-website.json
│   └── homepage-webpage.json
├── rapor/
│   └── rapor.csv
└── docs/
    ├── schema-dokumantasyonu.md
    ├── organization-detay.md
    └── website-detay.md
```

### `/schema-bulk <csv>`
CSV dosyasından toplu schema üretimi yapar.

```
/schema-bulk urls.csv
```

CSV şablonu `templates/bulk-template.csv` içinde:

| url | page_type | schemas | priority | notes |
|-----|-----------|---------|----------|-------|
| https://example.com | homepage | Organization,WebSite | high | Ana sayfa |
| https://example.com/products/item | product | Product,Offer,BreadcrumbList | high | Ürün |
| https://example.com/blog/post | blog | BlogPosting,BreadcrumbList | medium | Blog |
| https://example.com/faq | faq | FAQPage,BreadcrumbList | medium | SSS |

### `/schema-audit <url|csv>`
Mevcut schema markup'ları denetler, eksikleri tespit eder, puan verir.

```
/schema-audit https://www.example.com
```

## CLI Kullanımı

Skill dışında doğrudan CLI olarak da kullanılabilir:

```bash
# Tek URL — çoklu schema üretimi
npx tsx bin/schemaSkill.ts generate https://www.example.com

# Dosyaya yaz (birden fazla schema → ayrı dosyalara)
npx tsx bin/schemaSkill.ts generate https://www.example.com --output schema.json

# Tip belirterek
npx tsx bin/schemaSkill.ts generate https://www.example.com --type Product

# CSV'den toplu denetim
npx tsx bin/schemaSkill.ts audit urls.csv --output-dir ./reports --concurrency 2
```

## Web Arayüzü

Tarayıcı tabanlı arayüz ile de kullanılabilir:

```bash
npm run web
# http://localhost:3456
```

Özellikler:
- URL girip tüm pipeline adımlarını görsel olarak takip etme
- Toplu denetim sonuçlarını tablo ve grafik olarak görme
- Markdown rapor ve CSV özet indirme
- Tam Türkçe dokümantasyon

## Çıktı Yapısı

Her domain için ayrı klasör oluşturulur:

```
example.com/
├── schemas/                          # JSON-LD dosyaları
│   ├── homepage-organization.json
│   ├── homepage-website.json
│   ├── blog-post-article.json
│   ├── blog-post-breadcrumblist.json
│   ├── products-item-product.json
│   └── faq-faqpage.json
├── rapor/
│   ├── rapor.csv                     # URL, Schema Türü, Dosya, Test Sonucu
│   └── rapor.md                      # Detaylı Markdown rapor
└── docs/
    ├── schema-dokumantasyonu.md       # Müşteriye atmalık genel doküman
    ├── organization-detay.md          # Her schema türü için
    ├── website-detay.md               # uygulama detayları
    ├── product-detay.md
    └── faqpage-detay.md
```

### Rapor CSV Örneği

```csv
URL,Sayfa Türü,Schema Türü,Dosya Adı,Test Sonucu,Notlar
https://example.com,Ana Sayfa,Organization,homepage-organization.json,OK,
https://example.com,Ana Sayfa,WebSite,homepage-website.json,OK,
https://example.com/blog/post,Blog,Article,blog-post-article.json,OK,
https://example.com/faq,SSS,FAQPage,faq-faqpage.json,NOK,mainEntity eksik
```

## Desteklenen Schema Tipleri

Araç 800+ schema.org tipini dinamik olarak destekler. Özellikle optimize edilmiş tipler:

| Tip | Kullanım Alanı |
|-----|----------------|
| Organization | Firma/kuruluş bilgileri (tüm sayfalar) |
| WebSite + SearchAction | Site tanımı ve arama kutusu (ana sayfa) |
| LocalBusiness | Fiziksel mağaza/işletme bilgileri |
| Product + Offer | Ürün detay sayfaları |
| Article / BlogPosting | Blog yazıları ve haberler |
| FAQPage | Sıkça sorulan sorular |
| BreadcrumbList | Breadcrumb navigasyonu (tüm iç sayfalar) |
| ItemList | Kategori/koleksiyon sayfaları |
| Event | Etkinlik sayfaları |
| Recipe | Yemek tarifleri |
| JobPosting | İş ilanları |
| Course | Eğitim/kurs sayfaları |
| HowTo | Nasıl yapılır kılavuzları |
| Review / AggregateRating | Değerlendirmeler |
| VideoObject | Video sayfaları |
| SoftwareApplication | Yazılım ürünleri |

## Yapılandırma

| Değişken | Açıklama | Varsayılan |
|----------|----------|------------|
| `AZURE_OPENAI_ENDPOINT` | Azure OpenAI resource URL | — |
| `AZURE_OPENAI_API_KEY` | API anahtarı | — |
| `AZURE_OPENAI_DEPLOYMENT` | Model deployment adı | gpt-4o |
| `AZURE_OPENAI_API_VERSION` | API versiyonu | 2024-10-21 |

## Teknoloji

- **Runtime**: Node.js + TypeScript (ESM)
- **Crawling**: Playwright (headless Chromium)
- **AI**: Azure OpenAI (JSON mode)
- **Schema Referansı**: schema.org vocabulary (dinamik indirme, 7 gün cache)
- **CLI**: Commander.js
- **Web UI**: Express + vanilla HTML/JS
- **Test**: Vitest (20 test)

## Lisans

Internal tool — sadece ekip kullanımı içindir.
