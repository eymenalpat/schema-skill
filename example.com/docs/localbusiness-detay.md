# LocalBusiness Schema — Detay Doküman

## Ne İşe Yarar?
Fiziksel mağaza/ofis bilgilerini arama motorlarına aktarır. Google Maps ve yerel arama sonuçlarında işletme bilgilerinin gösterilmesini sağlar.

## Hangi Sayfalara Eklenmeli?
- İletişim sayfası
- Mağaza sayfaları
- Şube detay sayfaları

## Alan Açıklamaları
```jsonc
{
  "@type": "LocalBusiness",
  "name": "Example Domain",                            // STATİK: İşletme adı
  "url": "...",                                        // STATİK: Web sitesi
  "telephone": "+1-555-000-0000",                      // STATİK: Telefon
  "email": "info@example.com",                         // STATİK: E-posta
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Example Street",             // STATİK: Adres (tek lokasyon) / DİNAMİK: (çoklu şube)
    "addressLocality": "Example City",                 // STATİK/DİNAMİK
    "addressRegion": "EX",                             // STATİK/DİNAMİK
    "postalCode": "12345",                             // STATİK/DİNAMİK
    "addressCountry": "US"                             // STATİK
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "40.7128",                             // STATİK/DİNAMİK
    "longitude": "-74.0060"                            // STATİK/DİNAMİK
  },
  "openingHoursSpecification": [{                      // STATİK: Çalışma saatleri
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    "opens": "09:00",
    "closes": "18:00"
  }],
  "priceRange": "$$"                                   // STATİK: Fiyat aralığı
}
```

## Notlar
- Birden fazla şube varsa her şube için ayrı LocalBusiness oluşturulmalıdır
- `geo` alanı Google Maps entegrasyonu için önemlidir
- `openingHoursSpecification` tatil günleri için ayrı tanım yapılabilir
