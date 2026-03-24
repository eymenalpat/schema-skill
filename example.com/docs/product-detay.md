# Product Schema — Detay Doküman

## Ne İşe Yarar?
Ürün bilgilerini arama motorlarına aktarır. Google arama sonuçlarında fiyat, stok durumu, değerlendirme yıldızları gibi zengin sonuçlar gösterilmesini sağlar.

## Hangi Sayfalara Eklenmeli?
- Tüm ürün detay sayfaları

## Alan Açıklamaları
```jsonc
{
  "@type": "Product",
  "name": "Example Product",                           // DİNAMİK: Ürün adı
  "description": "...",                                 // DİNAMİK: Ürün açıklaması
  "image": ["..."],                                    // DİNAMİK: Ürün görselleri
  "sku": "EX-001",                                     // DİNAMİK: Stok kodu
  "brand": { "name": "Example Brand" },                // DİNAMİK: Marka adı
  "offers": {
    "@type": "Offer",
    "priceCurrency": "USD",                             // STATİK: Para birimi
    "price": "29.99",                                   // DİNAMİK: Fiyat
    "priceValidUntil": "2026-12-31",                    // DİNAMİK: Fiyat geçerlilik tarihi
    "availability": "https://schema.org/InStock",       // DİNAMİK: Stok durumu
    "itemCondition": "https://schema.org/NewCondition", // DİNAMİK: Ürün durumu
    "seller": { "@id": ".../#organization" }            // STATİK: Satıcı referansı
  },
  "aggregateRating": {
    "ratingValue": "4.5",                               // DİNAMİK: Ortalama puan
    "reviewCount": "24"                                 // DİNAMİK: Değerlendirme sayısı
  }
}
```

## Notlar
- `offers.price` ve `offers.availability` CMS'den dinamik çekilmeli
- `aggregateRating` yalnızca gerçek değerlendirme verisi varsa eklenmelidir
- `priceValidUntil` kampanya süresine göre güncellenmelidir
