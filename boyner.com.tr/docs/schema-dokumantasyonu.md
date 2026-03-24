# Boyner — Schema Markup Dokümantasyonu

**Tarih:** 24 Mart 2026
**URL:** https://www.boyner.com.tr/mag/category/erkek-dunyasi
**Sayfa Türü:** Kategori Sayfası (Erkek Dünyası)

---

## Schema Markup Nedir?

Schema Markup (Yapılandırılmış Veri), web sayfalarının içeriğini arama motorlarına ve yapay zeka sistemlerine standart bir dilde açıklayan kod parçacıklarıdır. Schema.org tarafından tanımlanan bu standart, Google, Bing, Yandex ve diğer arama motorları tarafından desteklenir.

JSON-LD (JavaScript Object Notation for Linked Data) formatında `<script type="application/ld+json">` etiketi içinde sayfanın `<head>` bölümüne eklenir.

---

## Ne İşe Yarar?

### SEO Faydaları
- **Zengin Sonuçlar (Rich Results):** Arama sonuçlarında yıldız derecelendirmesi, fiyat, breadcrumb navigasyonu gibi görsel zenginlikler
- **Knowledge Panel:** Marka aramalarda sağ tarafta çıkan bilgi paneli
- **Sitelinks Searchbox:** Arama sonuçlarında doğrudan site içi arama kutusu
- **Breadcrumb Navigasyonu:** Arama sonuçlarında URL yerine okunabilir sayfa yolu

### AI / LLM Faydaları
- **AI Yanıtlarında Referans:** ChatGPT, Google AI Overviews ve Perplexity gibi araçlarda kaynak olarak gösterilme
- **Doğru Bilgi Aktarımı:** Yapay zeka sistemlerinin sayfa içeriğini doğru yorumlaması
- **Marka Görünürlüğü:** AI destekli arama deneyimlerinde markanın öne çıkması

---

## Eklenen Schema Markup Türleri

Bu sayfa için toplam **5 farklı schema** üretilmiştir:

| # | Schema Türü | Dosya | Detay Doküman |
|---|-------------|-------|---------------|
| 1 | Organization | `mag-category-erkek-dunyasi-organization.json` | [organization-detay.md](organization-detay.md) |
| 2 | WebSite | `mag-category-erkek-dunyasi-website.json` | [website-detay.md](website-detay.md) |
| 3 | BreadcrumbList | `mag-category-erkek-dunyasi-breadcrumblist.json` | [breadcrumblist-detay.md](breadcrumblist-detay.md) |
| 4 | CollectionPage | `mag-category-erkek-dunyasi-collectionpage.json` | [collectionpage-detay.md](collectionpage-detay.md) |
| 5 | ItemList | `mag-category-erkek-dunyasi-itemlist.json` | [itemlist-detay.md](itemlist-detay.md) |

Ayrıca tüm schemaları tek bir `<script>` etiketi içinde kullanmak için **birleşik (merged) dosya** mevcuttur:
- `mag-category-erkek-dunyasi-merged.json` — `@graph` formatında 5 schema birleşik

---

## Teknik Notlar

### JSON Dosyaları Hakkında
- JSON-LD dosyalarında **yorum satırı bulunmaz** (JSON standardı gereği)
- Her dosya doğrudan `<script type="application/ld+json">` etiketi içine yapıştırılabilir
- Birden fazla schema kullanılacaksa **merged dosya** tercih edilmelidir (tek `<script>` etiketi)

### STATİK ve DİNAMİK Alanlar
- **STATİK alanlar:** Firma adı, logo URL, telefon numarası gibi tüm sayfalarda sabit kalan bilgiler
- **DİNAMİK alanlar:** Sayfa başlığı, URL, açıklama, liste öğeleri gibi her sayfada değişen bilgiler
- Detay dokümanlarında her alan için STATİK/DİNAMİK bilgisi verilmiştir

### CMS Entegrasyonu
- Kategori sayfaları için ItemList içindeki yazı listesi CMS'den dinamik olarak çekilmelidir
- Yeni yazı eklendiğinde veya kaldırıldığında ItemList otomatik güncellenmelidir

---

## Doğrulama Araçları

Üretilen schemaları test etmek için:

1. **Google Rich Results Test:** https://search.google.com/test/rich-results
2. **Schema.org Validator:** https://validator.schema.org/
3. **Google Yapılandırılmış Veri Markup Yardımcısı:** https://www.google.com/webmasters/markup-helper/

Her schema dosyasını bu araçlara yapıştırarak doğrulayabilirsiniz.
