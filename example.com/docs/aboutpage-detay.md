# AboutPage Schema — Detay Doküman

## Ne İşe Yarar?
Hakkımızda sayfasının yapısını tanımlar. Organization schema'sı ile birlikte kullanılarak firmanın hikayesi, misyonu ve ekibi hakkında bilgi sağlar.

## Hangi Sayfalara Eklenmeli?
- Hakkımızda sayfası
- Kurumsal tanıtım sayfaları

## Alan Açıklamaları
```jsonc
{
  "@type": "AboutPage",
  "name": "About Us",                                  // STATİK: Sayfa başlığı
  "url": "...",                                        // STATİK: Sayfa URL
  "description": "...",                                // STATİK: Sayfa açıklaması
  "isPartOf": { "@id": ".../#website" },               // STATİK: WebSite referansı
  "breadcrumb": { "@id": "...#breadcrumblist" },       // STATİK: Breadcrumb referansı
  "mainEntity": { "@id": ".../#organization" },        // STATİK: Organization referansı
  "publisher": { "@id": ".../#organization" }          // STATİK: Organization referansı
}
```

## Notlar
- `mainEntity` Organization schema'sına bağlanmalıdır
- Bu sayfadaki Organization schema'sı `foundingDate`, `description` gibi ek bilgiler içerebilir
