---
description: "Tek URL için tüm uygun Schema.org JSON-LD markup'larını üret"
---

$ARGUMENTS URL ve opsiyonel `validate` flag'i olarak kullanılacak.

Argüman parse:
- `$ARGUMENTS` = `https://example.com` → URL: `https://example.com`, doğrulama: **kapalı**
- `$ARGUMENTS` = `https://example.com validate` → URL: `https://example.com`, doğrulama: **açık** (Playwright MCP ile Google Rich Results Test)
- `$ARGUMENTS` = `https://example.com | validate` → Aynı şekilde doğrulama **açık**

## Ön Kontrol
Aracın dizini `$SKILL_DIR` (bu komut dosyasının bulunduğu repo kök dizini).

1. Güncelleme kontrolü yap:
```bash
cd $SKILL_DIR && bash update-check.sh
```

2. Eğer `$SKILL_DIR/node_modules` yoksa ilk kurulumu yap:
```bash
cd $SKILL_DIR && bash setup.sh
```

## Görev
1. Kullanıcının verdiği URL'yi schemaSkill CLI ile tara:
   ```bash
   cd $SKILL_DIR && npx tsx bin/schemaSkill.ts generate "$ARGUMENTS"
   ```
2. CLI çıktısındaki JSON-LD'leri al. Araç artık birden fazla schema üretir.
3. Sayfada zaten mevcut olan schema'ları kontrol et:
   - Mevcut ve SORUNSUZ schema varsa → tekrar üretme, sadece raporda "Mevcut — Geçerli" olarak göster
   - Mevcut ama HATALI schema varsa → düzeltilmiş versiyonunu üret, raporda "Mevcut — Düzeltildi" olarak göster
   - EKSİK schema varsa → yeni üret, raporda "Yeni" olarak göster
4. Eksik schema'ları sayfa içeriğine göre belirle. Yaygın eşleştirmeler:
   - Ana sayfa → Organization + WebSite + SearchAction + (varsa LocalBusiness)
   - Ürün sayfası → Product + Offer + BreadcrumbList + Organization
   - Blog yazısı → BlogPosting/Article + BreadcrumbList + Organization
   - Kategori sayfası → ItemList + BreadcrumbList + Organization
   - SSS sayfası → FAQPage + BreadcrumbList + Organization
   - İletişim → ContactPage + Organization + LocalBusiness
   - Tüm iç sayfalar → BreadcrumbList dahil et
   - Bunların ötesinde: sayfa içeriğini analiz et ve schema.org'daki 800+ tipten uygun olanları kullan (ör: MedicalCondition, FinancialProduct, LegalService, EducationalOrganization, SportsEvent, RealEstateListing, Vehicle, Restaurant, MusicEvent, SoftwareApplication, Course, JobPosting vb.)
5. Her schema'yı Google Rich Results Test standartlarına göre doğrula
5. Çıktıyı aşağıdaki yapıya göre organize et

## Çıktı Yapısı
KULLANICININ PROJE DİZİNİNDE (şu anki çalışma dizini) domain adında klasör oluştur:
```
{domain}/
├── schemas/
│   ├── {sayfa-slug}-{schema-type-lowercase}.json   # Her schema ayrı dosya
│   ├── {sayfa-slug}-merged.json                     # Tek script tag için @graph birleşik versiyon
│   └── ...
├── rapor/
│   └── rapor.csv
└── docs/
    ├── schema-dokumantasyonu.md
    └── {schema-type}-detay.md
```

Domain adı URL'den çıkarılır (www. olmadan). Örnek: `www.example.com` → `example.com`

Sayfa slug'ı URL path'inden türetilir. Örnek:
- `https://example.com` → `homepage`
- `https://example.com/blog/my-post` → `blog-my-post`
- `https://example.com/products/item` → `products-item`
- `https://example.com/faq` → `faq`

## JSON-LD Kuralları
- @context her zaman "https://schema.org"
- Yorum satırı OLMAMALI (geçerli JSON)
- Her JSON-LD dosyası `<script type="application/ld+json">` içine koyulmaya hazır olmalı
- Dosya adı formatı: `{sayfa-slug}-{schema-type-lowercase}.json`
- Bir sayfa için birden fazla schema varsa `{sayfa-slug}-merged.json` dosyası da oluştur
- Merged dosya `@graph` formatında olmalı:
  ```json
  {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", ... },
      { "@type": "WebSite", ... }
    ]
  }
  ```
- Merged dosya da validate edilmeli ve raporda ayrı satır olarak gösterilmeli

## Rapor CSV Formatı
rapor/ klasöründe `rapor.csv` oluştur:
```csv
URL,Sayfa Türü,Schema Türü,Dosya Adı,Test Sonucu,Notlar
https://example.com,Ana Sayfa,Organization,homepage-organization.json,OK,
https://example.com,Ana Sayfa,WebSite,homepage-website.json,OK,
```
Test Sonucu: `OK` (geçerli JSON-LD + gerekli alanlar mevcut) veya `NOK` (hata açıklaması)

## Mevcut Schema Durumu
Rapor CSV'sinde ek bir `Durum` sütunu olmalı:
```csv
URL,Sayfa Türü,Schema Türü,Dosya Adı,Test Sonucu,Durum,Notlar
https://example.com,Ana Sayfa,BreadcrumbList,,OK,Mevcut — Geçerli,Sayfada zaten var
https://example.com,Ana Sayfa,Organization,homepage-organization.json,OK,Yeni,Eksikti — üretildi
```
Durum değerleri:
- `Mevcut — Geçerli`: Sayfada var ve sorunsuz, dosya üretilmedi
- `Mevcut — Düzeltildi`: Sayfada var ama hatalıydı, düzeltilmiş versiyon üretildi
- `Yeni`: Sayfada yoktu, sıfırdan üretildi

## Doküman Üretim Kuralları
docs/ klasöründe müşteriye gönderilecek Türkçe dokümantasyon üret:

### schema-dokumantasyonu.md
Ana doküman. Aşağıdaki yapıda yaz (müşteri firmanın adını ve domain'ini kullan):
1. **{Firma} — Schema Markup Dokümantasyonu** (başlık)
2. **Schema Markup Nedir?** — Yapılandırılmış verinin ne olduğunu açıkla
3. **Ne İşe Yarar?** — SEO faydaları (Zengin Sonuçlar, Knowledge Panel, Sitelinks Searchbox, Yerel Arama) ve AI/LLM faydaları (AI Yanıtlarında Referans, Doğru Bilgi Aktarımı, Marka Görünürlüğü)
4. **Eklenen Schema Markup Türleri** — Her üretilen schema türünün kısa açıklaması ve ilgili detay dokümanına referans
5. **Teknik Notlar** — JSON yorum satırları, STATİK/DİNAMİK alan ayrımı, script tag kullanımı
6. **Doğrulama Araçları** — Google Rich Results Test, Schema.org Validator

### {type}-detay.md (her schema türü için)
- O schema'nın ne işe yaradığı
- Hangi sayfalara eklenmeli
- Hangi alanlar DİNAMİK (sayfaya göre değişen), hangileri STATİK (sabit)
- Örnek JSON-LD (DİNAMİK ve STATİK alanlar `// DİNAMİK:` ve `// STATİK:` yorumlarıyla açıklanmış — bu sadece dokümantasyon içindir, gerçek schema dosyasında yorum olmaz)

## Playwright MCP ile Harici Doğrulama (validate modu)
Eğer kullanıcı `validate` flag'i verdiyse, schema üretimi tamamlandıktan sonra iki aşamalı harici doğrulama yap:

### Aşama 1: Schema.org Validator
1. `mcp__playwright__browser_navigate` ile `https://validator.schema.org/` adresine git
2. "Fetch URL" sekmesine tıkla, URL'yi gir, "Run" butonuna bas
3. Sonuçları oku — schema.org spesifikasyonuna uygunluk (property doğruluğu, değer tipleri, yapısal hatalar)

### Aşama 2: Google Rich Results Test
1. `mcp__playwright__browser_navigate` ile `https://search.google.com/test/rich-results` adresine git
2. URL'yi gir, "Test URL" butonuna bas
3. Sonuçları oku — Google zengin sonuç uygunluğu (desteklenen zengin sonuçlar, zorunlu alanlar)

### Çıktı
Rapor klasörüne `dogrulama-raporu.md` oluştur. İki aracın sonuçları ayrı ayrı raporlanır.

Bu adım sadece `validate` flag'i verildiğinde çalışır. Schema'ların sayfaya zaten eklenmiş olması gerekir — henüz eklenmemişse kullanıcıya bildir.
