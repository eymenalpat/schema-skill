# CollectionPage Schema — Detay Doküman

## Ne İşe Yarar?
Kategori/koleksiyon sayfasının yapısını tanımlar. İçerik listesi barındıran sayfalar için kullanılır.

## Hangi Sayfalara Eklenmeli?
- Blog/kategori sayfaları
- Ürün listeleme sayfaları

## Alan Açıklamaları
```jsonc
{
  "@type": "CollectionPage",
  "name": "Category",                                  // DİNAMİK: Kategori adı
  "url": "...",                                        // DİNAMİK: Sayfa URL
  "description": "...",                                // DİNAMİK: Kategori açıklaması
  "isPartOf": { "@id": ".../#website" },               // STATİK: WebSite referansı
  "breadcrumb": { "@id": "...#breadcrumblist" },       // DİNAMİK: Breadcrumb referansı
  "publisher": { "@id": ".../#organization" },         // STATİK: Organization referansı
  "mainEntity": { "@id": "...#itemlist" }              // DİNAMİK: ItemList referansı
}
```
