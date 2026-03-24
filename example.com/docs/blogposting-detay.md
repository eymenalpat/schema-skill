# BlogPosting Schema — Detay Doküman

## Ne İşe Yarar?
Blog yazılarının yapısını arama motorlarına tanımlar. Google arama sonuçlarında yazar bilgisi, yayın tarihi ve öne çıkan görsel gösterilmesini sağlar.

## Hangi Sayfalara Eklenmeli?
- Tüm blog yazısı/makale sayfaları

## Alan Açıklamaları
```jsonc
{
  "@type": "BlogPosting",
  "headline": "Example Blog Post Title",               // DİNAMİK: Yazı başlığı (max 110 karakter)
  "description": "...",                                 // DİNAMİK: Kısa açıklama
  "mainEntityOfPage": { "@id": "..." },                // DİNAMİK: Sayfa URL
  "image": { "url": "..." },                          // DİNAMİK: Öne çıkan görsel
  "author": {
    "@type": "Person",
    "name": "Example Author",                          // DİNAMİK: Yazar adı
    "url": "..."                                       // DİNAMİK: Yazar profil URL
  },
  "publisher": { "@id": ".../#organization" },         // STATİK: Yayıncı referansı
  "datePublished": "2026-01-15",                       // DİNAMİK: Yayın tarihi (ISO 8601)
  "dateModified": "2026-03-20",                        // DİNAMİK: Güncelleme tarihi
  "wordCount": 1500,                                   // DİNAMİK: Kelime sayısı
  "inLanguage": "en",                                  // STATİK: İçerik dili
  "keywords": ["..."]                                  // DİNAMİK: Anahtar kelimeler
}
```

## Notlar
- `headline` 110 karakteri geçmemelidir (Google önerisi)
- `datePublished` ve `dateModified` ISO 8601 formatında olmalıdır
- `author` kişi veya organizasyon olabilir
