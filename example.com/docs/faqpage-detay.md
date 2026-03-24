# FAQPage Schema — Detay Doküman

## Ne İşe Yarar?
SSS sayfalarındaki soru-cevap çiftlerini arama motorlarına tanımlar. Google arama sonuçlarında genişletilmiş FAQ zengin sonuçları gösterilmesini sağlar.

## Hangi Sayfalara Eklenmeli?
- SSS sayfaları
- Soru-cevap içeren herhangi bir sayfa

## Alan Açıklamaları
```jsonc
{
  "@type": "FAQPage",
  "name": "Frequently Asked Questions",                // DİNAMİK: Sayfa başlığı
  "url": "...",                                        // DİNAMİK: Sayfa URL
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is Example Domain?",               // DİNAMİK: Soru metni
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Example Domain is..."                 // DİNAMİK: Cevap metni
      }
    }
  ]
}
```

## Notlar
- Her soru-cevap çifti `Question` + `Answer` olarak tanımlanır
- Google en fazla 2-3 soru gösterir, ancak tüm sorular eklenmelidir
- Cevap metni HTML içerebilir (link, liste vs.)
- Sorular sayfada görünür olmalıdır (gizli SSS geçersiz sayılır)
