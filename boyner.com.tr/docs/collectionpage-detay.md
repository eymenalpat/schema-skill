# CollectionPage Schema — Detay Doküman

## Ne İşe Yarar?

CollectionPage schema'sı, bir kategori veya koleksiyon sayfasının yapısını arama motorlarına tanımlar. Bu sayfa türü, birden fazla içeriği (yazı, ürün, medya) bir tema altında gruplandıran sayfalar için kullanılır.

**Sağladığı faydalar:**
- Arama motorlarının sayfanın bir içerik listesi olduğunu anlaması
- Kategoriler arası hiyerarşi ve ilişki tanımı
- AI sistemlerinin sayfa amacını doğru yorumlaması

## Hangi Sayfalara Eklenmeli?

- Blog/MAG kategori sayfaları
- İçerik koleksiyonu sayfaları
- Ürün kategori listeleme sayfaları

## Alan Açıklamaları

```jsonc
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": "https://www.boyner.com.tr/mag/category/erkek-dunyasi#collectionpage", // DİNAMİK: Sayfa URL + #collectionpage
  "name": "Erkek Dünyası",                                // DİNAMİK: Kategori adı
  "url": "https://www.boyner.com.tr/mag/category/erkek-dunyasi", // DİNAMİK: Sayfa URL
  "description": "Boyner MAG Erkek Dünyası kategorisindeki moda, bakım ve stil yazıları", // DİNAMİK: Kategori açıklaması
  "inLanguage": "tr-TR",                                  // STATİK: İçerik dili
  "isPartOf": {
    "@id": "https://www.boyner.com.tr/#website"            // STATİK: WebSite referansı
  },
  "breadcrumb": {
    "@id": "...#breadcrumblist"                            // DİNAMİK: BreadcrumbList referansı
  },
  "about": {
    "@type": "Thing",
    "name": "Erkek Moda ve Bakım"                         // DİNAMİK: Kategorinin konusu
  },
  "publisher": {
    "@id": "https://www.boyner.com.tr/#organization"       // STATİK: Organization referansı
  },
  "mainEntity": {
    "@id": "...#itemlist"                                  // DİNAMİK: ItemList referansı
  }
}
```

## Notlar
- `mainEntity` alanı ItemList schema'sına `@id` ile referans verir
- Her kategori sayfası için ayrı CollectionPage schema'sı oluşturulmalıdır
- `description` alanı meta description ile uyumlu olmalıdır
- `about` alanı kategorinin genel konusunu özetlemelidir
