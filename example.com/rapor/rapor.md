# Example Domain — Toplu Schema Markup Raporu

**Tarih:** 24 Mart 2026
**Kaynak CSV:** bulk-template.csv
**Toplam URL:** 7
**Toplam Schema Dosyası:** 24 (17 tekil + 7 merged)
**Doğrulama:** 24/24 OK

---

## Özet

| # | URL | Sayfa Türü | Üretilen Schemalar | Durum |
|---|-----|------------|-------------------|-------|
| 1 | example.com | Ana Sayfa | Organization, WebSite | OK |
| 2 | example.com/products/item | Ürün | Product (+ Offer), BreadcrumbList | OK |
| 3 | example.com/blog/post | Blog | BlogPosting, BreadcrumbList | OK |
| 4 | example.com/category | Kategori | CollectionPage, ItemList, BreadcrumbList | OK |
| 5 | example.com/faq | SSS | FAQPage, BreadcrumbList | OK |
| 6 | example.com/contact | İletişim | ContactPage, LocalBusiness, BreadcrumbList | OK |
| 7 | example.com/about | Hakkımızda | AboutPage, Organization, BreadcrumbList | OK |

---

## Sayfa Bazlı Detay

### 1. Ana Sayfa (homepage)
- **Organization:** Firma adı, logo, iletişim, sosyal medya profilleri
- **WebSite:** Site bilgileri + SearchAction (Sitelinks Searchbox)

### 2. Ürün Sayfası (products/item)
- **Product:** Ürün bilgileri, Offer (fiyat, stok durumu), AggregateRating
- **BreadcrumbList:** Home > Products > Item

### 3. Blog Yazısı (blog/post)
- **BlogPosting:** Başlık, yazar, tarih, publisher, kelime sayısı
- **BreadcrumbList:** Home > Blog > Post

### 4. Kategori Sayfası (category)
- **CollectionPage:** Kategori tanımı, ItemList referansı
- **ItemList:** 5 öğe URL'li ListItem olarak
- **BreadcrumbList:** Home > Category

### 5. SSS Sayfası (faq)
- **FAQPage:** 3 soru-cevap çifti (Google Rich Results uyumlu)
- **BreadcrumbList:** Home > FAQ

### 6. İletişim Sayfası (contact)
- **ContactPage:** Sayfa bilgileri
- **LocalBusiness:** Adres, telefon, e-posta, GeoCoordinates, çalışma saatleri
- **BreadcrumbList:** Home > Contact

### 7. Hakkımızda Sayfası (about)
- **AboutPage:** Sayfa bilgileri, Organization referansı
- **Organization:** Detaylı firma bilgileri (kuruluş tarihi dahil)
- **BreadcrumbList:** Home > About

---

## Notlar
- Tüm merged dosyalar `@graph` formatında tek `<script>` etiketi için hazır
- Template URL'ler (example.com) kullanıldığından içerikler örnek verilerdir
- Gerçek site URL'leri ile kullanıldığında CLI otomatik sayfa taraması yapar
- DİNAMİK alanlar CMS entegrasyonu ile otomatik doldurulmalıdır
