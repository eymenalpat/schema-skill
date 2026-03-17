---
description: "Tek URL için tüm uygun Schema.org JSON-LD markup'larını üret"
---

$ARGUMENTS URL olarak kullanılacak.

## Ön Kontrol
Önce schemaSkill aracının kurulu olup olmadığını kontrol et. Aracın dizini `$SKILL_DIR` (bu komut dosyasının bulunduğu repo kök dizini). Eğer `$SKILL_DIR/node_modules` yoksa:
```bash
cd $SKILL_DIR && bash setup.sh
```

## Görev
1. Kullanıcının verdiği URL'yi schemaSkill CLI ile tara:
   ```bash
   cd $SKILL_DIR && npx tsx bin/schemaSkill.ts generate "$ARGUMENTS"
   ```
2. CLI çıktısındaki JSON-LD'leri al. Araç artık birden fazla schema üretir.
3. Eğer CLI yeterli schema üretmediyse, sayfa tipine göre eksik olanları da üret:
   - Ana sayfa → Organization + WebSite + SearchAction + (varsa LocalBusiness)
   - Ürün sayfası → Product + Offer + BreadcrumbList + Organization
   - Blog yazısı → BlogPosting/Article + BreadcrumbList + Organization
   - Kategori sayfası → ItemList + BreadcrumbList + Organization
   - SSS sayfası → FAQPage + BreadcrumbList + Organization
   - İletişim → ContactPage + Organization + LocalBusiness
   - Tüm iç sayfalar → BreadcrumbList dahil et
4. Her schema'yı Google Rich Results Test standartlarına göre doğrula
5. Çıktıyı aşağıdaki yapıya göre organize et

## Çıktı Yapısı
KULLANICININ PROJE DİZİNİNDE (şu anki çalışma dizini) domain adında klasör oluştur:
```
{domain}/
├── schemas/
│   ├── {sayfa-slug}-{schema-type-lowercase}.json
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

## Rapor CSV Formatı
rapor/ klasöründe `rapor.csv` oluştur:
```csv
URL,Sayfa Türü,Schema Türü,Dosya Adı,Test Sonucu,Notlar
https://example.com,Ana Sayfa,Organization,homepage-organization.json,OK,
https://example.com,Ana Sayfa,WebSite,homepage-website.json,OK,
```
Test Sonucu: `OK` (geçerli JSON-LD + gerekli alanlar mevcut) veya `NOK` (hata açıklaması)

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
