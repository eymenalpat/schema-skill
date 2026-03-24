# BreadcrumbList Schema — Detay Doküman

## Ne İşe Yarar?

BreadcrumbList schema'sı, sayfanın site hiyerarşisindeki konumunu arama motorlarına bildirir. Google arama sonuçlarında URL yerine okunabilir breadcrumb yolu gösterilmesini sağlar.

**Sağladığı zengin sonuçlar:**
- Arama sonuçlarında breadcrumb navigasyonu (ör: Boyner MAG > Erkek Dünyası)
- URL yerine anlaşılır sayfa yolu
- Kullanıcı deneyimini iyileştiren görsel zenginlik

## Hangi Sayfalara Eklenmeli?

- **Tüm iç sayfalara** eklenmelidir (ana sayfa hariç)
- Her sayfa için breadcrumb yolu o sayfaya özgü olacak şekilde dinamik üretilmelidir

## Alan Açıklamaları

```jsonc
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "@id": "https://www.boyner.com.tr/mag/category/erkek-dunyasi#breadcrumblist", // DİNAMİK: Sayfa URL + #breadcrumblist
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,                                      // DİNAMİK: Sıra numarası
      "name": "Boyner MAG",                               // STATİK: Üst sayfa adı
      "item": "https://www.boyner.com.tr/mag"             // STATİK: Üst sayfa URL
    },
    {
      "@type": "ListItem",
      "position": 2,                                      // DİNAMİK: Sıra numarası
      "name": "Erkek Dünyası",                            // DİNAMİK: Kategori adı
      "item": "https://www.boyner.com.tr/mag/category/erkek-dunyasi" // DİNAMİK: Kategori URL
    }
  ]
}
```

## Notlar
- Son öğe (mevcut sayfa) için `item` alanı opsiyoneldir ancak dahil edilmesi önerilir
- Alt kategoriler varsa (ör: Erkek Dünyası > Erkek Bakım) ara basamaklar da eklenmeli
- Position numaraları 1'den başlamalı ve ardışık olmalıdır
- Her sayfanın breadcrumb'ı o sayfanın hiyerarşisine göre **dinamik** üretilmelidir
