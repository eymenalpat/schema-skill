# BreadcrumbList Schema — Detay Doküman

## Ne İşe Yarar?
Sayfanın site hiyerarşisindeki konumunu tanımlar. Google arama sonuçlarında URL yerine okunabilir breadcrumb yolu gösterilmesini sağlar.

## Hangi Sayfalara Eklenmeli?
- **Tüm iç sayfalara** eklenmelidir (ana sayfa hariç)

## Alan Açıklamaları
```jsonc
{
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,                                   // DİNAMİK: Sıra numarası
      "name": "Home",                                  // STATİK: Ana sayfa adı
      "item": "https://www.example.com"                // STATİK: Ana sayfa URL
    },
    {
      "@type": "ListItem",
      "position": 2,                                   // DİNAMİK: Sıra numarası
      "name": "Category",                              // DİNAMİK: Sayfa/kategori adı
      "item": "https://www.example.com/category"       // DİNAMİK: Sayfa URL
    }
  ]
}
```

## Notlar
- `position` 1'den başlamalı ve ardışık olmalıdır
- Her sayfa için breadcrumb yolu dinamik üretilmelidir
- Alt kategori varsa ara basamaklar da eklenmeli
