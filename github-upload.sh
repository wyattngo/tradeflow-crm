#!/bin/bash

# ============================================================
# TradeFlow CRM — Upload lên GitHub
# Usage: bash github-upload.sh
# ============================================================

set -e

# --- CONFIG: sửa 2 dòng này ---
GITHUB_USERNAME="wyattngo"
REPO_NAME="tradeflow-crm"
# --------------------------------

REPO_URL="https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"
PROJECT_DIR="$(pwd)"

echo ""
echo "================================================"
echo " TradeFlow CRM — GitHub Upload"
echo "================================================"
echo " Project : $PROJECT_DIR"
echo " Repo URL: $REPO_URL"
echo "================================================"
echo ""

# Kiểm tra đang đứng đúng thư mục
if [ ! -f "package.json" ]; then
  echo "❌ Lỗi: Không tìm thấy package.json"
  echo "   Hãy cd vào thư mục tradeflow-crm trước khi chạy script"
  exit 1
fi

# --- BƯỚC 1: Kiểm tra file nhạy cảm ---
echo "🔍 Kiểm tra file nhạy cảm..."

SENSITIVE_FILES=(".env" ".env.docker" ".env.prod" "deploy_key" "deploy_key.pub" "authorized_keys")
FOUND_SENSITIVE=false

for f in "${SENSITIVE_FILES[@]}"; do
  if [ -f "$f" ]; then
    # Kiểm tra xem file có bị gitignore chưa
    if git check-ignore -q "$f" 2>/dev/null; then
      echo "   ✅ $f — đã ignore"
    else
      echo "   ⚠️  $f — CHƯA bị ignore!"
      FOUND_SENSITIVE=true
    fi
  fi
done

if [ "$FOUND_SENSITIVE" = true ]; then
  echo ""
  echo "❌ Dừng lại: Có file nhạy cảm chưa được gitignore."
  echo "   Hãy kiểm tra .gitignore và chạy lại."
  exit 1
fi

echo ""

# --- BƯỚC 2: Init git nếu chưa có ---
if [ ! -d ".git" ]; then
  echo "📁 Khởi tạo git repository..."
  git init
  git branch -M main
  echo ""
fi

# --- BƯỚC 3: Kiểm tra remote ---
if git remote get-url origin &>/dev/null; then
  CURRENT_REMOTE=$(git remote get-url origin)
  echo "🔗 Remote hiện tại: $CURRENT_REMOTE"
  if [ "$CURRENT_REMOTE" != "$REPO_URL" ]; then
    echo "   Cập nhật remote URL..."
    git remote set-url origin "$REPO_URL"
  fi
else
  echo "🔗 Thêm remote origin: $REPO_URL"
  git remote add origin "$REPO_URL"
fi
echo ""

# --- BƯỚC 4: Stage và commit ---
echo "📦 Stage toàn bộ files..."
git add .

# Kiểm tra có gì để commit không
if git diff --cached --quiet; then
  echo "ℹ️  Không có thay đổi mới để commit."
else
  echo "💬 Nhập commit message (Enter để dùng mặc định):"
  read -r COMMIT_MSG
  if [ -z "$COMMIT_MSG" ]; then
    COMMIT_MSG="feat: update TradeFlow CRM — $(date '+%Y-%m-%d %H:%M')"
  fi

  git commit -m "$COMMIT_MSG"
  echo ""
fi

# --- BƯỚC 5: Push ---
echo "🚀 Pushing lên GitHub..."
echo ""

# Lần đầu push (set upstream)
if git rev-parse --abbrev-ref --symbolic-full-name @{u} &>/dev/null; then
  git push
else
  git push -u origin main
fi

echo ""
echo "================================================"
echo " ✅ Upload thành công!"
echo " 🌐 https://github.com/${GITHUB_USERNAME}/${REPO_NAME}"
echo "================================================"
echo ""

# --- BƯỚC 6: Verify ---
echo "🔍 Verify — các file nhạy cảm KHÔNG có trên remote:"
TRACKED=$(git ls-files | grep -E "^\.env$|^\.env\.docker$|^\.env\.prod$|^deploy_key$|^authorized_keys$" || true)
if [ -z "$TRACKED" ]; then
  echo "   ✅ Không có file nhạy cảm nào được track"
else
  echo "   ❌ CẢNH BÁO — Các file sau đang bị track:"
  echo "$TRACKED"
  echo ""
  echo "   Chạy lệnh sau để fix:"
  echo "   git rm --cached $TRACKED"
  echo "   git commit -m 'fix: remove sensitive files'"
  echo "   git push"
fi

echo ""
