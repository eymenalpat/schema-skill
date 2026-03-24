# Example Domain — Schema Markup Dokümantasyonu

**Tarih:** 24 Mart 2026
**Toplam URL:** 7 sayfa
**Toplam Schema:** 10 farklı tür, 24 dosya

---

## Schema Markup Nedir?

Schema Markup (Yapılandırılmış Veri), web sayfalarının içeriğini arama motorlarına ve yapay zeka sistemlerine standart bir dilde açıklayan kod parçacıklarıdır. Schema.org tarafından tanımlanan bu standart, Google, Bing, Yandex ve diğer arama motorları tarafından desteklenir.

JSON-LD (JavaScript Object Notation for Linked Data) formatında `<script type="application/ld+json">` etiketi içinde sayfanın `<head>` bölümüne eklenir.

---

## Ne İşe Yarar?

### SEO Faydaları
- **Zengin Sonuçlar (Rich Results):** Arama sonuçlarında yıldız derecelendirmesi, fiyat, SSS, breadcrumb gibi görsel zenginlikler
- **Knowledge Panel:** Marka aramalarda bilgi paneli
- **Sitelinks Searchbox:** Arama sonuçlarında site içi arama kutusu
- **Breadcrumb Navigasyonu:** URL yerine okunabilir sayfa yolu
- **FAQ Zengin Sonuçları:** SSS sayfalarında genişletilmiş soru-cevap görünümü
- **Ürün Zengin Sonuçları:** Fiyat, stok durumu, değerlendirme bilgileri

### AI / LLM Faydaları
- **AI Yanıtlarında Referans:** ChatGPT, Google AI Overviews ve Perplexity gibi araçlarda kaynak olarak gösterilme
- **Doğru Bilgi Aktarımı:** Yapay zeka sistemlerinin sayfa içeriğini doğru yorumlaması
- **Marka Görünürlüğü:** AI destekli arama deneyimlerinde markanın öne çıkması

---

## Eklenen Schema Markup Türleri

| # | Schema Türü | Kullanıldığı Sayfalar | Detay Doküman |
|---|-------------|----------------------|---------------|
| 1 | Organization | Ana Sayfa, Hakkımızda | [organization-detay.md](organization-detay.md) |
| 2 | WebSite | Ana Sayfa | [website-detay.md](website-detay.md) |
| 3 | Product | Ürün Sayfası | [product-detay.md](product-detay.md) |
| 4 | BlogPosting | Blog Yazısı | [blogposting-detay.md](blogposting-detay.md) |
| 5 | CollectionPage | Kategori Sayfası | [collectionpage-detay.md](collectionpage-detay.md) |
| 6 | ItemList | Kategori Sayfası | [itemlist-detay.md](itemlist-detay.md) |
| 7 | FAQPage | SSS Sayfası | [faqpage-detay.md](faqpage-detay.md) |
| 8 | ContactPage | İletişim Sayfası | [contactpage-detay.md](contactpage-detay.md) |
| 9 | LocalBusiness | İletişim Sayfası | [localbusiness-detay.md](localbusiness-detay.md) |
| 10 | AboutPage | Hakkımızda Sayfası | [aboutpage-detay.md](aboutpage-detay.md) |
| - | BreadcrumbList | Tüm iç sayfalar | [breadcrumblist-detay.md](breadcrumblist-detay.md) |

---

## Teknik Notlar

### JSON Dosyaları Hakkında
- JSON-LD dosyalarında **yorum satırı bulunmaz** (JSON standardı gereği)
- Her dosya doğrudan `<script type="application/ld+json">` etiketi içine yapıştırılabilir
- Birden fazla schema kullanılacaksa **merged dosya** tercih edilmelidir (tek `<script>` etiketi)

### STATİK ve DİNAMİK Alanlar
- **STATİK alanlar:** Firma adı, logo URL, telefon gibi sabit bilgiler
- **DİNAMİK alanlar:** Sayfa başlığı, URL, fiyat, tarih gibi değişen bilgiler
- Detay dokümanlarında her alan için STATİK/DİNAMİK bilgisi verilmiştir

### Sayfa Türü — Schema Eşleştirmesi
| Sayfa Türü | Zorunlu Schemalar | Opsiyonel |
|-----------|-------------------|-----------|
| Ana Sayfa | Organization, WebSite | SearchAction |
| Ürün | Product (+ Offer), BreadcrumbList | AggregateRating, Review |
| Blog | BlogPosting, BreadcrumbList | Organization |
| Kategori | CollectionPage, ItemList, BreadcrumbList | Organization |
| SSS | FAQPage, BreadcrumbList | Organization |
| İletişim | ContactPage, BreadcrumbList | LocalBusiness |
| Hakkımızda | AboutPage, Organization, BreadcrumbList | — |

---

## Doğrulama Araçları

1. **Google Rich Results Test:** https://search.google.com/test/rich-results
2. **Schema.org Validator:** https://validator.schema.org/
3. **Google Yapılandırılmış Veri Markup Yardımcısı:** https://www.google.com/webmasters/markup-helper/
