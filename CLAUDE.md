# schemaSkill — Schema Markup Otomatik Üretim Aracı

Bu proje, web sayfaları için Schema.org JSON-LD yapılandırılmış veri üretir ve denetler.

## Kurulum
Skill ilk kullanımda otomatik kurulur. Manuel kurulum gerekirse:
```bash
cd /path/to/schema-skill && npm install && npx playwright install chromium
```

## Komutlar
- `/schema` — Tek URL için tüm uygun schema'ları üret
- `/schema-bulk` — CSV dosyasından toplu schema üretimi
- `/schema-audit` — Mevcut schema'ları denetle ve rapor oluştur

## Çıktı Yapısı
Her komut, proje dizininde domain adında klasör oluşturur:
```
{domain}/
├── schemas/           # JSON-LD dosyaları
│   ├── homepage-organization.json
│   ├── homepage-website.json
│   └── blog-post-article.json
├── rapor/
│   ├── rapor.csv      # URL, Schema Türü, Dosya, Test Sonucu
│   └── rapor.md       # Detaylı Markdown rapor
└── docs/
    ├── schema-dokumantasyonu.md    # Genel müşteri dokümantasyonu
    └── {schema-type}-detay.md      # Her schema türü için detay doküman
```

## Önemli Kurallar
- Her sayfa için birden fazla schema üretilebilir (Organization + BreadcrumbList + Product gibi)
- JSON-LD dosyalarında yorum satırı olmamalı
- Türkçe karakter kullan, ASCII dönüşümü yapma
- Çıktıda DİNAMİK ve STATİK alanları belirt
- Schema doğrulaması Google Rich Results Test standartlarına göre yapılır
