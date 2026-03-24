# Organization Schema — Detay Doküman

## Ne İşe Yarar?

Organization schema'sı, arama motorlarına ve yapay zeka sistemlerine firma/marka hakkında temel bilgileri aktarır. Google Knowledge Panel'de görünen firma bilgileri büyük ölçüde bu schema'dan beslenir.

**Sağladığı zengin sonuçlar:**
- Google Knowledge Panel (marka arama sonuçları)
- Sosyal medya profil bağlantıları
- İletişim bilgileri
- Logo görünürlüğü

## Hangi Sayfalara Eklenmeli?

- Tüm sayfalara eklenebilir (site genelinde)
- Özellikle ana sayfa ve kurumsal sayfalarda bulunması önerilir
- `@id` referansı ile diğer schema'lardan bağlanılır, bu nedenle her sayfada olması faydalıdır

## Alan Açıklamaları

```jsonc
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://www.boyner.com.tr/#organization",   // STATİK: Benzersiz tanımlayıcı
  "name": "Boyner",                                     // STATİK: Firma adı
  "legalName": "Boyner Büyük Mağazacılık A.Ş.",        // STATİK: Tescilli unvan
  "url": "https://www.boyner.com.tr",                   // STATİK: Ana site URL
  "logo": {
    "@type": "ImageObject",
    "url": "https://www.boyner.com.tr/mag/images/boyner-mag.png", // STATİK: Logo URL
    "width": 250,                                        // STATİK: Logo genişlik (px)
    "height": 60                                         // STATİK: Logo yükseklik (px)
  },
  "contactPoint": [
    {
      "@type": "ContactPoint",
      "telephone": "+90-444-29-67",                      // STATİK: Müşteri hizmetleri tel
      "contactType": "customer service",                 // STATİK: İletişim türü
      "availableLanguage": "Turkish"                     // STATİK: Dil
    }
  ],
  "sameAs": [
    "https://www.facebook.com/boyneronline/",            // STATİK: Sosyal medya profilleri
    "https://www.instagram.com/boyner/",
    "https://www.youtube.com/user/BoynerMagazalari",
    "https://x.com/boyneronline"
  ]
}
```

## Notlar
- `@id` alanı diğer schema'lar tarafından referans olarak kullanılır
- Logo URL'si değişirse bu schema güncellenmeli
- Yeni sosyal medya profilleri açıldığında `sameAs` dizisine eklenmelidir
