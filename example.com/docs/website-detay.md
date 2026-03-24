# WebSite Schema — Detay Doküman

## Ne İşe Yarar?
Sitenin genel yapısını tanımlar. Sitelinks Searchbox (arama sonuçlarında site içi arama kutusu) için gereklidir.

## Hangi Sayfalara Eklenmeli?
- Ana sayfa (zorunlu)
- İsteğe bağlı olarak diğer sayfalara da eklenebilir

## Alan Açıklamaları
```jsonc
{
  "@type": "WebSite",
  "@id": "https://www.example.com/#website",          // STATİK: Benzersiz ID
  "name": "Example Domain",                            // STATİK: Site adı
  "url": "https://www.example.com",                    // STATİK: Ana URL
  "inLanguage": "en",                                  // STATİK: Site dili
  "publisher": { "@id": ".../#organization" },         // STATİK: Organization referansı
  "potentialAction": {                                 // STATİK: Arama URL şablonu
    "@type": "SearchAction",
    "target": { "urlTemplate": ".../search?q={search_term_string}" },
    "query-input": "required name=search_term_string"
  }
}
```

## Notlar
- `potentialAction` alanındaki URL sitenin gerçek arama URL yapısıyla eşleşmeli
