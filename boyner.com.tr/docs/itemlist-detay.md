# ItemList Schema — Detay Doküman

## Ne İşe Yarar?

ItemList schema'sı, bir sayfadaki sıralı veya sırasız öğe listesini tanımlar. Kategori sayfalarında listelenen yazıları, ürünleri veya diğer içerikleri arama motorlarına yapılandırılmış olarak sunar.

**Sağladığı faydalar:**
- Arama sonuçlarında liste biçiminde zengin sonuçlar (Carousel)
- İçerik keşfedilebilirliğinin artması
- AI sistemlerinin sayfa içindeki öğeleri ayrı ayrı tanıması

## Hangi Sayfalara Eklenmeli?

- Kategori / koleksiyon sayfaları
- Arama sonuç sayfaları
- "En İyi X" / "Top 10" gibi listeleme yazıları
- Ürün listeleme sayfaları

## Alan Açıklamaları

```jsonc
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "@id": "https://www.boyner.com.tr/mag/category/erkek-dunyasi#itemlist", // DİNAMİK: Sayfa URL + #itemlist
  "name": "Erkek Dünyası Yazıları",                        // DİNAMİK: Liste başlığı
  "description": "Boyner MAG Erkek Dünyası kategorisindeki tüm içerikler", // DİNAMİK: Liste açıklaması
  "numberOfItems": 12,                                     // DİNAMİK: Toplam öğe sayısı
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,                                       // DİNAMİK: Sıra numarası
      "name": "En İyi 10 Kalıcı Erkek Parfüm Önerileri",  // DİNAMİK: Yazı başlığı
      "url": "https://www.boyner.com.tr/mag/en-iyi-10-kalici-erkek-parfum-onerileri" // DİNAMİK: Yazı URL
    }
    // ... diğer öğeler
  ]
}
```

## Notlar
- `numberOfItems` gerçek öğe sayısıyla eşleşmelidir
- Her `ListItem` için `position` 1'den başlayarak ardışık olmalıdır
- `url` alanı yazının tam URL'sini içermelidir (göreli değil, mutlak URL)
- Sayfalama (pagination) varsa, her sayfadaki yazılar kendi position sırasına sahip olmalıdır
- Yeni yazı eklendiğinde veya kaldırıldığında bu liste CMS tarafından otomatik güncellenmelidir
- Position sıralaması sayfadaki görüntüleme sırasıyla uyumlu olmalıdır
