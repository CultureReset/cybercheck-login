#!/bin/bash
# ============================================
# LINK CHECKER AGENT
# Finds broken file references, missing imports, dead links
# Usage: ./tools/link-checker.sh [directory]
# ============================================

DIR="${1:-.}"
RED='\033[0;31m'
YEL='\033[1;33m'
GRN='\033[0;32m'
CYN='\033[0;36m'
NC='\033[0m'
BROKEN=0
TOTAL=0

echo ""
echo "=========================================="
echo "  LINK CHECKER AGENT"
echo "  Scanning: $DIR"
echo "=========================================="
echo ""

# --- 1. Check all <script src="..."> references ---
echo -e "${CYN}[1/5] Checking <script src> references...${NC}"
for htmlfile in $(find "$DIR" -maxdepth 3 -name "*.html" ! -path "*/node_modules/*" 2>/dev/null); do
  HTMLDIR=$(dirname "$htmlfile")
  while IFS= read -r src; do
    ((TOTAL++))
    clean=$(echo "$src" | sed 's/?.*//')
    if [[ "$clean" == http* ]] || [[ "$clean" == //* ]]; then
      continue
    fi
    if [ ! -f "$HTMLDIR/$clean" ]; then
      echo -e "  ${RED}BROKEN${NC} $htmlfile → $src"
      ((BROKEN++))
    fi
  done < <(grep -oE 'src="([^"]*\.js[^"]*)"' "$htmlfile" 2>/dev/null | sed 's/src="//;s/"//')
done

# --- 2. Check all <link href="..."> CSS references ---
echo -e "${CYN}[2/5] Checking <link href> CSS references...${NC}"
for htmlfile in $(find "$DIR" -maxdepth 3 -name "*.html" ! -path "*/node_modules/*" 2>/dev/null); do
  HTMLDIR=$(dirname "$htmlfile")
  while IFS= read -r href; do
    ((TOTAL++))
    clean=$(echo "$href" | sed 's/?.*//')
    if [[ "$clean" == http* ]] || [[ "$clean" == //* ]]; then
      continue
    fi
    if [ ! -f "$HTMLDIR/$clean" ]; then
      echo -e "  ${RED}BROKEN${NC} $htmlfile → $href"
      ((BROKEN++))
    fi
  done < <(grep -oE 'href="([^"]*\.css[^"]*)"' "$htmlfile" 2>/dev/null | sed 's/href="//;s/"//')
done

# --- 3. Check all <a href="..."> internal page links ---
echo -e "${CYN}[3/5] Checking <a href> internal links...${NC}"
for htmlfile in $(find "$DIR" -maxdepth 3 -name "*.html" ! -path "*/node_modules/*" 2>/dev/null); do
  HTMLDIR=$(dirname "$htmlfile")
  while IFS= read -r href; do
    ((TOTAL++))
    clean=$(echo "$href" | sed 's/#.*//' | sed 's/?.*//')
    # Skip empty, external, mailto, tel, javascript
    if [ -z "$clean" ] || [[ "$clean" == http* ]] || [[ "$clean" == //* ]] || [[ "$clean" == mailto:* ]] || [[ "$clean" == tel:* ]] || [[ "$clean" == javascript:* ]]; then
      continue
    fi
    if [ ! -f "$HTMLDIR/$clean" ]; then
      echo -e "  ${YEL}WARN${NC} $htmlfile → $href (page not found)"
      ((BROKEN++))
    fi
  done < <(grep -oE 'href="([^"]*)"' "$htmlfile" 2>/dev/null | sed 's/href="//;s/"//' | grep -v "\.css\|\.ico\|\.png\|\.jpg\|^#")
done

# --- 4. Check JS window.location / redirect targets ---
echo -e "${CYN}[4/5] Checking JS redirect targets...${NC}"
for jsfile in $(find "$DIR" -maxdepth 3 -name "*.js" ! -path "*/node_modules/*" 2>/dev/null); do
  JSDIR=$(dirname "$jsfile")
  while IFS= read -r target; do
    ((TOTAL++))
    clean=$(echo "$target" | sed "s/['\"]//g" | sed 's/?.*//' | sed 's/#.*//')
    if [[ "$clean" == http* ]] || [[ "$clean" == //* ]] || [ -z "$clean" ]; then
      continue
    fi
    if [ ! -f "$JSDIR/$clean" ] && [ ! -f "$DIR/$clean" ]; then
      echo -e "  ${RED}BROKEN${NC} $jsfile redirects to missing: $clean"
      ((BROKEN++))
    fi
  done < <(grep -oE "location\.href\s*=\s*['\"][^'\"]*['\"]" "$jsfile" 2>/dev/null | grep -oE "['\"][^'\"]*['\"]" | head -10)
done

# --- 5. Check image/media references ---
echo -e "${CYN}[5/5] Checking image references...${NC}"
for htmlfile in $(find "$DIR" -maxdepth 3 -name "*.html" ! -path "*/node_modules/*" 2>/dev/null); do
  HTMLDIR=$(dirname "$htmlfile")
  while IFS= read -r src; do
    ((TOTAL++))
    if [[ "$src" == http* ]] || [[ "$src" == //* ]] || [[ "$src" == data:* ]]; then
      continue
    fi
    if [ ! -f "$HTMLDIR/$src" ]; then
      echo -e "  ${YEL}WARN${NC} $htmlfile → missing image: $src"
      ((BROKEN++))
    fi
  done < <(grep -oE 'src="([^"]*\.(png|jpg|jpeg|gif|svg|webp|mp4)[^"]*)"' "$htmlfile" 2>/dev/null | sed 's/src="//;s/"//' | head -20)
done

# --- SUMMARY ---
echo ""
echo "=========================================="
echo -e "  RESULTS: Checked ${CYN}$TOTAL${NC} references | ${RED}$BROKEN broken${NC}"
echo "=========================================="

if [ $BROKEN -gt 0 ]; then
  exit 1
else
  echo -e "  ${GRN}All links valid!${NC}"
  exit 0
fi
