#!/bin/bash
# schemaSkill — Otomatik Güncelleme Kontrolü
# Kullanım: bash update-check.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

# Git repo değilse çık
if [ ! -d ".git" ]; then
  exit 0
fi

# Remote'dan son durumu al (sessiz)
git fetch origin main --quiet 2>/dev/null || exit 0

LOCAL=$(git rev-parse HEAD 2>/dev/null)
REMOTE=$(git rev-parse origin/main 2>/dev/null)

if [ "$LOCAL" = "$REMOTE" ]; then
  echo "✅ schemaSkill güncel."
  exit 0
fi

# Güncelleme var
echo "🔄 schemaSkill güncellemesi bulundu, güncelleniyor..."
git pull origin main --quiet 2>/dev/null

# package.json değiştiyse npm install çalıştır
if git diff "$LOCAL" "$REMOTE" --name-only | grep -q "package.json"; then
  echo "📦 Bağımlılıklar güncelleniyor..."
  npm install --silent 2>/dev/null
fi

echo "✅ schemaSkill güncellendi."
