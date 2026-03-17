#!/bin/bash
# schemaSkill — Otomatik Kurulum Scripti
# Kullanım: SCHEMA_API_KEY="your-key" bash setup.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "🔧 schemaSkill kurulumu başlatılıyor..."
echo ""

# 1. npm paketlerini kur
echo "📦 npm paketleri kuruluyor..."
npm install --silent 2>/dev/null
echo "✅ npm paketleri kuruldu."

# 2. Playwright Chromium kur
echo "🌐 Playwright Chromium kuruluyor..."
npx playwright install chromium 2>/dev/null
echo "✅ Playwright Chromium kuruldu."

# 3. .env dosyasını oluştur
if [ -z "$SCHEMA_API_KEY" ]; then
  echo ""
  echo "⚠️  SCHEMA_API_KEY ortam değişkeni ayarlanmamış."
  echo "   Kurulumu şu şekilde çalıştırın:"
  echo '   SCHEMA_API_KEY="api-key-buraya" bash setup.sh'
  echo ""
  echo "   Veya .env dosyasını manuel oluşturun (.env.example'ı referans alın)."
  exit 1
fi

echo "⚙️  .env dosyası oluşturuluyor..."
cat > .env << ENVEOF
AZURE_OPENAI_ENDPOINT=https://seoo-m8rf4836-eastus2.cognitiveservices.azure.com/
AZURE_OPENAI_API_KEY=${SCHEMA_API_KEY}
AZURE_OPENAI_DEPLOYMENT=gpt-5.3-chat
AZURE_OPENAI_API_VERSION=2024-12-01-preview
ENVEOF
echo "✅ .env dosyası oluşturuldu."

echo ""
echo "🎉 Kurulum tamamlandı!"
echo ""
echo "Kullanım:"
echo "  Claude Code'da /schema, /schema-bulk, /schema-audit komutlarını kullanın."
echo ""
