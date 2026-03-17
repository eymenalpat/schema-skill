---
description: "Mevcut schema markup'ları denetle ve eksikleri raporla"
---

$ARGUMENTS URL veya CSV dosya yolu olarak kullanılacak.

## Ön Kontrol
schemaSkill aracının dizini `$SKILL_DIR`. Eğer `$SKILL_DIR/node_modules` yoksa:
```bash
cd $SKILL_DIR && bash setup.sh
```

## Görev
1. Eğer $ARGUMENTS tek bir URL ise, o URL'yi denetle. CSV dosyası ise tüm URL'leri denetle.
2. Her URL için:
   ```bash
   cd $SKILL_DIR && npx tsx bin/schemaSkill.ts generate "<url>"
   ```
   komutuyla sayfayı tara ve mevcut schema'ları tespit et.
3. Mevcut schema'ları doğrula (geçerli JSON-LD mi, gerekli alanlar var mı)
4. Eksik schema'ları belirle (sayfa tipine göre olması gerekenler vs mevcut olanlar)
5. Eksik schema'lar için önerilen JSON-LD'leri üret
6. Detaylı rapor oluştur

## Çıktı Yapısı
Kullanıcının proje dizininde:
```
{domain}/
├── rapor/
│   ├── audit-rapor.csv
│   └── audit-rapor.md
└── schemas/
    ├── onerilen-{slug}-{type}.json        # Her eksik schema ayrı dosya
    └── onerilen-{slug}-merged.json         # Eksik schemalar tek @graph dosyasında
```

## Doğrulama ve Otomatik Düzeltme
Önerilen her schema otomatik doğrulanır. Hata varsa AI'a geri gönderilip düzeltilir (max 2 deneme). Çıktıda yalnızca doğrulanmış schemalar yer alır. Merged dosya da validate edilir.

## Audit CSV Formatı
```csv
URL,Sayfa Türü,Mevcut Schemalar,Eksik Schemalar,Puan,Öncelik,Aksiyon
https://example.com,Ana Sayfa,"Organization,WebSite","LocalBusiness",75,medium,LocalBusiness ekle
```

## Audit Raporu (Markdown)
Türkçe detaylı rapor:
- Genel özet (toplam URL, taranan, hatalı, schema mevcut/eksik, ortalama puan)
- Öncelik dağılımı
- Her URL için detay: mevcut schemalar, eksikler, sorunlar, öneriler
- Aksiyon önerileri

## Puan Hesaplama
- 90-100: Mükemmel (tüm gerekli schema'lar mevcut ve geçerli)
- 70-89: İyi (küçük eksikler var)
- 50-69: Orta (önemli eksikler)
- 30-49: Zayıf (ciddi eksikler)
- 0-29: Kritik (schema yok veya tamamen hatalı)
