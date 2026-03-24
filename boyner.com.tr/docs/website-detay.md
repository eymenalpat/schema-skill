# WebSite Schema — Detay Doküman

## Ne İşe Yarar?

WebSite schema'sı, arama motorlarına sitenin genel yapısı hakkında bilgi verir. En önemli özelliği **Sitelinks Searchbox** desteğidir — Google arama sonuçlarında sitenin altında doğrudan arama kutusu gösterilmesini sağlar.

**Sağladığı zengin sonuçlar:**
- Sitelinks Searchbox (site altında arama kutusu)
- Site adı görünürlüğü
- Yayıncı bilgisi bağlantısı

## Hangi Sayfalara Eklenmeli?

- Genellikle **ana sayfada** bulunması yeterlidir
- Kategori ve iç sayfalara da eklenebilir (zarar vermez)
- Site genelinde tek bir `@id` ile referans verilir

## Alan Açıklamaları

```jsonc
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://www.boyner.com.tr/#website",           // STATİK: Benzersiz tanımlayıcı
  "name": "Boyner",                                       // STATİK: Site adı
  "alternateName": "Boyner MAG",                           // STATİK: Alternatif site adı
  "url": "https://www.boyner.com.tr",                      // STATİK: Ana URL
  "inLanguage": "tr-TR",                                   // STATİK: Site dili
  "publisher": {
    "@id": "https://www.boyner.com.tr/#organization"       // STATİK: Organization referansı
  },
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://www.boyner.com.tr/arama?q={search_term_string}" // STATİK: Arama URL şablonu
    },
    "query-input": "required name=search_term_string"      // STATİK: Arama parametresi
  }
}
```

## Notlar
- `potentialAction` alanındaki URL şablonu, sitenin gerçek arama URL yapısıyla eşleşmelidir
- Arama URL'si değişirse bu alan güncellenmelidir
- `publisher` alanı Organization schema'sına `@id` ile referans verir
