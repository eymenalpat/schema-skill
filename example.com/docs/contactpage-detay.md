# ContactPage Schema — Detay Doküman

## Ne İşe Yarar?
İletişim sayfasının yapısını tanımlar. Arama motorlarının iletişim bilgilerine ulaşmasını kolaylaştırır.

## Hangi Sayfalara Eklenmeli?
- İletişim sayfası

## Alan Açıklamaları
```jsonc
{
  "@type": "ContactPage",
  "name": "Contact Us",                                // STATİK: Sayfa başlığı
  "url": "...",                                        // STATİK: Sayfa URL
  "description": "...",                                // STATİK: Sayfa açıklaması
  "isPartOf": { "@id": ".../#website" },               // STATİK: WebSite referansı
  "breadcrumb": { "@id": "...#breadcrumblist" },       // STATİK: Breadcrumb referansı
  "publisher": { "@id": ".../#organization" }          // STATİK: Organization referansı
}
```

## Notlar
- LocalBusiness schema'sı ile birlikte kullanılması önerilir
- İletişim formu bilgileri bu schema'ya dahil edilmez
