# Organization Schema — Detay Doküman

## Ne İşe Yarar?
Firma/marka hakkında temel bilgileri arama motorlarına ve AI sistemlerine aktarır. Google Knowledge Panel'deki firma bilgileri bu schema'dan beslenir.

## Hangi Sayfalara Eklenmeli?
- Ana sayfa (zorunlu)
- Hakkımızda sayfası
- Tüm sayfalara `@id` referansı ile bağlanabilir

## Alan Açıklamaları
```jsonc
{
  "@type": "Organization",
  "@id": "https://www.example.com/#organization",   // STATİK: Benzersiz ID
  "name": "Example Domain",                          // STATİK: Firma adı
  "url": "https://www.example.com",                  // STATİK: Ana URL
  "logo": { "url": "..." },                          // STATİK: Logo URL
  "contactPoint": { "telephone": "..." },            // STATİK: İletişim
  "sameAs": ["..."]                                   // STATİK: Sosyal medya profilleri
}
```
