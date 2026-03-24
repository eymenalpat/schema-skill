/**
 * SEO-relevant Schema.org types reference.
 * AI uses this list to identify which schema types are appropriate for a page.
 * Each type has a short description and example use cases.
 */

export interface SeoSchemaTypeRef {
  type: string;
  category: string;
  description: string;
  examples: string;
}

export const SEO_SCHEMA_TYPES: SeoSchemaTypeRef[] = [
  // ── İçerik & Makale ──────────────────────────────────────────────────
  { type: 'Article', category: 'İçerik', description: 'Genel web makaleleri', examples: 'Blog, haber, editoryal içerik' },
  { type: 'NewsArticle', category: 'İçerik', description: 'Haber ve güncel olaylar', examples: 'Haber siteleri, basın bültenleri' },
  { type: 'BlogPosting', category: 'İçerik', description: 'Blog yazıları', examples: 'Kurumsal blog, kişisel blog' },
  { type: 'ScholarlyArticle', category: 'İçerik', description: 'Akademik ve araştırma makaleleri', examples: 'Araştırma makaleleri, akademik yayınlar' },
  { type: 'Report', category: 'İçerik', description: 'Resmi raporlar ve white paper', examples: 'Sektör raporları, araştırma özeti' },
  { type: 'Book', category: 'İçerik', description: 'Kitaplar', examples: 'Kitap tanıtım sayfaları, e-kitap satış' },
  { type: 'WebPage', category: 'İçerik', description: 'Genel web sayfası', examples: 'Landing page, bilgi sayfası' },
  { type: 'CollectionPage', category: 'İçerik', description: 'Koleksiyon/katalog sayfaları', examples: 'Kategori listeleme, koleksiyon sayfası' },
  { type: 'AboutPage', category: 'İçerik', description: 'Hakkımızda sayfaları', examples: 'Firma tanıtım, şirket hikayesi' },
  { type: 'ContactPage', category: 'İçerik', description: 'İletişim sayfaları', examples: 'İletişim formu, adres bilgileri' },
  { type: 'ProfilePage', category: 'İçerik', description: 'Profil sayfaları', examples: 'Yazar profili, uzman biyografisi' },

  // ── E-Ticaret & Ürün ─────────────────────────────────────────────────
  { type: 'Product', category: 'E-Ticaret', description: 'Fiziksel veya dijital ürünler', examples: 'Ürün detay sayfası, mağaza ürünleri' },
  { type: 'Offer', category: 'E-Ticaret', description: 'Ürün fiyatı ve satış koşulları', examples: 'Fiyat, stok durumu, kargo' },
  { type: 'AggregateOffer', category: 'E-Ticaret', description: 'Birden fazla satıcıdan teklifler', examples: 'Marketplace, fiyat karşılaştırma' },
  { type: 'ItemList', category: 'E-Ticaret', description: 'Ürün/içerik listeleri', examples: 'Kategori sayfası, arama sonuçları, top 10 listesi' },
  { type: 'BreadcrumbList', category: 'E-Ticaret', description: 'Sayfa navigasyon hiyerarşisi', examples: 'Tüm iç sayfalarda breadcrumb' },

  // ── Yerel İşletme ────────────────────────────────────────────────────
  { type: 'LocalBusiness', category: 'Yerel İşletme', description: 'Genel yerel işletme', examples: 'Mağaza, ofis, hizmet noktası' },
  { type: 'Restaurant', category: 'Yerel İşletme', description: 'Restoranlar', examples: 'Restoran, kafe, bar' },
  { type: 'CafeOrCoffeeShop', category: 'Yerel İşletme', description: 'Kafeler ve kahveciler', examples: 'Kahve dükkanı, çay bahçesi' },
  { type: 'FastFoodRestaurant', category: 'Yerel İşletme', description: 'Fast food restoranları', examples: 'Hızlı servis restoranları' },
  { type: 'Bakery', category: 'Yerel İşletme', description: 'Fırın ve pastaneler', examples: 'Ekmek fırını, pastane' },
  { type: 'BarOrPub', category: 'Yerel İşletme', description: 'Bar ve publar', examples: 'Bar, bira evi, pub' },
  { type: 'Hospital', category: 'Yerel İşletme', description: 'Hastaneler', examples: 'Hastane, klinik, tıp merkezi' },
  { type: 'Pharmacy', category: 'Yerel İşletme', description: 'Eczaneler', examples: 'Eczane, ilaç satışı' },
  { type: 'Dentist', category: 'Yerel İşletme', description: 'Diş hekimlikleri', examples: 'Diş kliniği, ortodonti' },
  { type: 'VeterinaryCare', category: 'Yerel İşletme', description: 'Veteriner klinikleri', examples: 'Veteriner, evcil hayvan bakımı' },
  { type: 'BeautySalon', category: 'Yerel İşletme', description: 'Güzellik salonları', examples: 'Kuaför, güzellik merkezi' },
  { type: 'HealthClub', category: 'Yerel İşletme', description: 'Spor salonları', examples: 'Fitness merkezi, spor salonu' },
  { type: 'AutoRepair', category: 'Yerel İşletme', description: 'Oto tamir servisleri', examples: 'Oto servis, tamirci' },
  { type: 'GasStation', category: 'Yerel İşletme', description: 'Benzin istasyonları', examples: 'Akaryakıt istasyonu' },
  { type: 'Hotel', category: 'Yerel İşletme', description: 'Oteller ve konaklama', examples: 'Otel, hostel, pansiyon' },
  { type: 'Store', category: 'Yerel İşletme', description: 'Mağazalar', examples: 'Perakende mağaza, dükkan' },
  { type: 'ShoppingCenter', category: 'Yerel İşletme', description: 'Alışveriş merkezleri', examples: 'AVM, ticaret merkezi' },

  // ── Profesyonel Hizmetler ─────────────────────────────────────────────
  { type: 'ProfessionalService', category: 'Hizmetler', description: 'Profesyonel hizmetler', examples: 'Danışmanlık, muhasebe, hukuk' },
  { type: 'Attorney', category: 'Hizmetler', description: 'Avukatlar ve hukuk büroları', examples: 'Hukuk bürosu, avukat' },
  { type: 'LegalService', category: 'Hizmetler', description: 'Hukuk hizmetleri', examples: 'Hukuki danışmanlık, noter' },
  { type: 'FinancialService', category: 'Hizmetler', description: 'Mali hizmetler', examples: 'Banka, sigorta, yatırım danışmanlığı' },
  { type: 'InsuranceAgency', category: 'Hizmetler', description: 'Sigorta acenteleri', examples: 'Sigorta şirketi, aracılık' },
  { type: 'RealEstateAgent', category: 'Hizmetler', description: 'Gayrimenkul danışmanları', examples: 'Emlakçı, gayrimenkul ofisi' },
  { type: 'TravelAgency', category: 'Hizmetler', description: 'Seyahat acenteleri', examples: 'Tur operatörü, tatil planlama' },
  { type: 'EmploymentAgency', category: 'Hizmetler', description: 'İş bulma kurumları', examples: 'İşe alım ajansı, kariyer danışmanlığı' },

  // ── Eğitim ────────────────────────────────────────────────────────────
  { type: 'Course', category: 'Eğitim', description: 'Kurslar ve eğitim programları', examples: 'Online kurs, eğitim programı' },
  { type: 'CourseInstance', category: 'Eğitim', description: 'Kurs oturumları', examples: 'Kurs dönemleri, açılan sınıflar' },
  { type: 'EducationalOrganization', category: 'Eğitim', description: 'Eğitim kuruluşları', examples: 'Okul, üniversite, eğitim merkezi' },
  { type: 'LearningResource', category: 'Eğitim', description: 'Öğrenme kaynakları', examples: 'Eğitim materyali, ders notu' },

  // ── Etkinlikler ───────────────────────────────────────────────────────
  { type: 'Event', category: 'Etkinlik', description: 'Genel etkinlikler', examples: 'Konferans, konser, festival' },
  { type: 'MusicEvent', category: 'Etkinlik', description: 'Müzik etkinlikleri', examples: 'Konser, müzik festivali' },
  { type: 'SportsEvent', category: 'Etkinlik', description: 'Spor etkinlikleri', examples: 'Maç, turnuva, yarış' },
  { type: 'ExhibitionEvent', category: 'Etkinlik', description: 'Sergi etkinlikleri', examples: 'Sanat sergisi, fuar' },
  { type: 'Festival', category: 'Etkinlik', description: 'Festivaller', examples: 'Kültür festivali, yemek festivali' },
  { type: 'BusinessEvent', category: 'Etkinlik', description: 'İş etkinlikleri', examples: 'Konferans, seminer, iş toplantısı' },

  // ── Yemek Tarifleri ───────────────────────────────────────────────────
  { type: 'Recipe', category: 'Yemek', description: 'Yemek tarifleri', examples: 'Tarif sayfası, yemek blogu' },
  { type: 'NutritionInformation', category: 'Yemek', description: 'Beslenme bilgileri', examples: 'Kalori, besin değerleri' },

  // ── İş İlanları ───────────────────────────────────────────────────────
  { type: 'JobPosting', category: 'İş İlanı', description: 'İş ilanları', examples: 'Kariyer sayfası, iş ilanı' },
  { type: 'Occupation', category: 'İş İlanı', description: 'Meslek tanımları', examples: 'Meslek rehberi, kariyer bilgisi' },

  // ── Medya & Eğlence ──────────────────────────────────────────────────
  { type: 'VideoObject', category: 'Medya', description: 'Video içerik', examples: 'Eğitim videosu, ürün tanıtımı' },
  { type: 'ImageObject', category: 'Medya', description: 'Görsel içerik', examples: 'Ürün görseli, galeri' },
  { type: 'AudioObject', category: 'Medya', description: 'Ses ve podcast', examples: 'Podcast bölümü, müzik kaydı' },
  { type: 'Movie', category: 'Medya', description: 'Filmler', examples: 'Film tanıtım, inceleme sayfası' },
  { type: 'TVSeries', category: 'Medya', description: 'TV dizileri', examples: 'Dizi tanıtım, bölüm listesi' },
  { type: 'MusicRecording', category: 'Medya', description: 'Müzik kayıtları', examples: 'Şarkı, albüm sayfası' },
  { type: 'MusicAlbum', category: 'Medya', description: 'Müzik albümleri', examples: 'Albüm tanıtım, diskografi' },
  { type: 'Podcast', category: 'Medya', description: 'Podcast programları', examples: 'Podcast serisi, bölüm listesi' },
  { type: 'PodcastEpisode', category: 'Medya', description: 'Podcast bölümleri', examples: 'Tekil podcast bölümü' },

  // ── Sağlık & Tıp ─────────────────────────────────────────────────────
  { type: 'MedicalCondition', category: 'Sağlık', description: 'Tıbbi durumlar ve hastalıklar', examples: 'Hastalık bilgi sayfası, sağlık rehberi' },
  { type: 'MedicalProcedure', category: 'Sağlık', description: 'Tıbbi prosedürler', examples: 'Tedavi bilgisi, ameliyat açıklaması' },
  { type: 'Drug', category: 'Sağlık', description: 'İlaçlar ve farmasötikler', examples: 'İlaç bilgi sayfası, prospektüs' },
  { type: 'MedicalClinic', category: 'Sağlık', description: 'Tıbbi klinikler', examples: 'Özel klinik, poliklinik' },

  // ── Kuruluşlar ────────────────────────────────────────────────────────
  { type: 'Organization', category: 'Kuruluş', description: 'Genel kuruluşlar', examples: 'Şirket, dernek, vakıf' },
  { type: 'Corporation', category: 'Kuruluş', description: 'Şirketler', examples: 'A.Ş., büyük işletme' },
  { type: 'NGO', category: 'Kuruluş', description: 'Sivil toplum kuruluşları', examples: 'Dernek, vakıf, STK' },
  { type: 'GovernmentOrganization', category: 'Kuruluş', description: 'Devlet kuruluşları', examples: 'Bakanlık, belediye, kamu kurumu' },
  { type: 'SportsOrganization', category: 'Kuruluş', description: 'Spor kuruluşları', examples: 'Spor kulübü, federasyon' },

  // ── Kişiler & İletişim ────────────────────────────────────────────────
  { type: 'Person', category: 'Kişi', description: 'Kişi bilgileri', examples: 'Yazar, uzman, ekip üyesi profili' },
  { type: 'ContactPoint', category: 'Kişi', description: 'İletişim noktası', examples: 'Müşteri hizmetleri, destek hattı' },
  { type: 'PostalAddress', category: 'Kişi', description: 'Adres bilgileri', examples: 'İşletme adresi, teslimat adresi' },
  { type: 'GeoCoordinates', category: 'Kişi', description: 'Coğrafi koordinatlar', examples: 'Harita konumu, GPS bilgisi' },

  // ── Değerlendirme & Yorum ─────────────────────────────────────────────
  { type: 'Review', category: 'Değerlendirme', description: 'Ürün/hizmet yorumları', examples: 'Müşteri yorumu, inceleme' },
  { type: 'AggregateRating', category: 'Değerlendirme', description: 'Toplu derecelendirme', examples: 'Ortalama puan, yıldız sayısı' },
  { type: 'ClaimReview', category: 'Değerlendirme', description: 'İddia doğrulama (fact-check)', examples: 'Doğruluk kontrolü, yanlış bilgi analizi' },

  // ── Nasıl Yapılır & Rehber ────────────────────────────────────────────
  { type: 'HowTo', category: 'Rehber', description: 'Adım adım rehberler', examples: 'DIY rehberi, kurulum kılavuzu' },
  { type: 'HowToStep', category: 'Rehber', description: 'Rehber adımları', examples: 'Talimat adımı, prosedür basamağı' },

  // ── SSS & Soru-Cevap ─────────────────────────────────────────────────
  { type: 'FAQPage', category: 'SSS', description: 'Sık sorulan sorular sayfası', examples: 'SSS, yardım merkezi' },
  { type: 'Question', category: 'SSS', description: 'Soru', examples: 'Soru başlığı, müşteri sorusu' },
  { type: 'Answer', category: 'SSS', description: 'Cevap', examples: 'Soru cevabı, çözüm' },

  // ── Web & Arama ───────────────────────────────────────────────────────
  { type: 'WebSite', category: 'Web', description: 'Web sitesi tanımı', examples: 'Ana sayfa, site geneli' },
  { type: 'SearchAction', category: 'Web', description: 'Site içi arama', examples: 'Sitelinks arama kutusu' },

  // ── Yazılım & Uygulama ────────────────────────────────────────────────
  { type: 'SoftwareApplication', category: 'Yazılım', description: 'Yazılım uygulamaları', examples: 'SaaS ürünü, masaüstü yazılım' },
  { type: 'MobileApplication', category: 'Yazılım', description: 'Mobil uygulamalar', examples: 'iOS/Android uygulama' },
  { type: 'WebApplication', category: 'Yazılım', description: 'Web uygulamaları', examples: 'Online araç, web tabanlı uygulama' },
  { type: 'VideoGame', category: 'Yazılım', description: 'Video oyunları', examples: 'Oyun tanıtım, inceleme sayfası' },

  // ── Gayrimenkul & Araç ────────────────────────────────────────────────
  { type: 'RealEstateListing', category: 'Gayrimenkul', description: 'Gayrimenkul ilanları', examples: 'Satılık/kiralık ilan' },
  { type: 'Accommodation', category: 'Gayrimenkul', description: 'Konaklama yerleri', examples: 'Kiralık ev, apart otel' },
  { type: 'Vehicle', category: 'Araç', description: 'Araçlar', examples: '2. el araç ilanı, araç tanıtım' },
  { type: 'Car', category: 'Araç', description: 'Otomobiller', examples: 'Araba satış, model tanıtım' },
];

/**
 * Returns a formatted string of all SEO schema types grouped by category.
 * Used in AI prompts to help the model select appropriate types.
 */
export function formatSeoSchemaTypesForPrompt(): string {
  const grouped = new Map<string, SeoSchemaTypeRef[]>();
  for (const entry of SEO_SCHEMA_TYPES) {
    const list = grouped.get(entry.category) ?? [];
    list.push(entry);
    grouped.set(entry.category, list);
  }

  const parts: string[] = [];
  for (const [category, types] of grouped) {
    parts.push(`### ${category}`);
    for (const t of types) {
      parts.push(`- **${t.type}**: ${t.description} (ör: ${t.examples})`);
    }
  }
  return parts.join('\n');
}
