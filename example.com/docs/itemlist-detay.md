# ItemList Schema — Detay Doküman

## Ne İşe Yarar?
Sayfadaki öğe listesini yapılandırılmış olarak sunar. Carousel zengin sonuçları ve içerik keşfedilebilirliği sağlar.

## Hangi Sayfalara Eklenmeli?
- Kategori sayfaları
- Listeleme yazıları ("Top 10", "En İyi X")
- Arama sonuç sayfaları

## Alan Açıklamaları
```jsonc
{
  "@type": "ItemList",
  "name": "Category Items",                            // DİNAMİK: Liste adı
  "numberOfItems": 5,                                  // DİNAMİK: Toplam öğe sayısı
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,                                   // DİNAMİK: Sıra numarası
      "name": "Item One",                              // DİNAMİK: Öğe adı
      "url": "..."                                     // DİNAMİK: Öğe URL
    }
  ]
}
```

## Notlar
- `numberOfItems` gerçek sayıyla eşleşmelidir
- `position` 1'den başlayıp ardışık olmalıdır
- CMS'den dinamik üretilmelidir
