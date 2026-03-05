#!/bin/bash
# ============================================
# CODE AUDIT AGENT
# Scans JS/HTML/CSS for common bugs, bad patterns, and issues
# Usage: ./tools/code-audit.sh [directory]
# ============================================

DIR="${1:-.}"
RED='\033[0;31m'
YEL='\033[1;33m'
GRN='\033[0;32m'
CYN='\033[0;36m'
NC='\033[0m'
ISSUES=0
WARNINGS=0

echo ""
echo "=========================================="
echo "  CODE AUDIT AGENT"
echo "  Scanning: $DIR"
echo "=========================================="
echo ""

# --- 1. Undefined variable access patterns ---
echo -e "${CYN}[1/8] Checking for undefined/null access patterns...${NC}"
while IFS= read -r match; do
  echo -e "  ${RED}BUG${NC} $match"
  ((ISSUES++))
done < <(grep -rn --include="*.js" "\.auth\.\|\.from\.\|\.select\.\|\.insert\.\|\.update\.\|\.delete\." "$DIR" | grep -v "node_modules" | grep -v "if (!supabase\|if (!.*client\|if (supabase)" | grep -v "// " | head -20 2>/dev/null)

# --- 2. var overwrites window globals ---
echo -e "${CYN}[2/8] Checking for var declarations that shadow window globals...${NC}"
while IFS= read -r match; do
  echo -e "  ${RED}BUG${NC} var overwrites window global: $match"
  ((ISSUES++))
done < <(grep -rn --include="*.js" "^var supabase\b\|^var firebase\b\|^var Stripe\b\|^var google\b" "$DIR" | grep -v "node_modules" 2>/dev/null)

# --- 3. Missing null checks before chained access ---
echo -e "${CYN}[3/8] Checking for missing null checks on chained property access...${NC}"
while IFS= read -r match; do
  echo -e "  ${YEL}WARN${NC} Possible null chain: $match"
  ((WARNINGS++))
done < <(grep -rn --include="*.js" "data\.\(session\|user\|business\)\." "$DIR" | grep -v "if.*data\|data &&\|data ?\." | grep -v "node_modules" | head -15 2>/dev/null)

# --- 4. Console errors left in production code ---
echo -e "${CYN}[4/8] Checking for console.error/warn calls (potential error handlers)...${NC}"
CONSOLE_COUNT=$(grep -rc --include="*.js" "console\.\(error\|warn\)" "$DIR" 2>/dev/null | grep -v ":0$" | grep -v "node_modules" | wc -l | tr -d ' ')
echo -e "  ${CYN}INFO${NC} Found console.error/warn in $CONSOLE_COUNT files (review for production readiness)"

# --- 5. Hardcoded secrets / API keys ---
echo -e "${CYN}[5/8] Checking for hardcoded secrets and API keys...${NC}"
while IFS= read -r match; do
  echo -e "  ${RED}SECURITY${NC} Possible hardcoded secret: $match"
  ((ISSUES++))
done < <(grep -rn --include="*.js" --include="*.html" "sk_live_\|sk_test_\|AKIA\|password.*=.*['\"].\{8,\}" "$DIR" | grep -v "node_modules" | grep -v "placeholder\|example\|type=\"password\"" | head -10 2>/dev/null)

# Check for SSH keys accidentally committed
while IFS= read -r match; do
  echo -e "  ${RED}SECURITY${NC} SSH private key found: $match"
  ((ISSUES++))
done < <(find "$DIR" -maxdepth 2 -name "*.pub" -o -name "id_rsa" -o -name "id_ed25519" 2>/dev/null | grep -v node_modules)

# Check for files with no extension that look like keys
while IFS= read -r match; do
  if file "$match" 2>/dev/null | grep -q "PEM\|private key\|OpenSSH"; then
    echo -e "  ${RED}SECURITY${NC} Private key file: $match"
    ((ISSUES++))
  fi
done < <(find "$DIR" -maxdepth 2 -type f -size +100c -size -1k ! -name "*.*" ! -name "README" ! -name "LICENSE" ! -name "Makefile" 2>/dev/null | grep -v node_modules | head -10)

# --- 6. Async functions without try/catch ---
echo -e "${CYN}[6/8] Checking for async functions missing error handling...${NC}"
while IFS= read -r match; do
  # Check if the function body has try/catch
  FILE=$(echo "$match" | cut -d: -f1)
  LINE=$(echo "$match" | cut -d: -f2)
  NEXT_LINES=$(tail -n +$LINE "$FILE" 2>/dev/null | head -15)
  if ! echo "$NEXT_LINES" | grep -q "try\|catch\|\.catch"; then
    echo -e "  ${YEL}WARN${NC} No try/catch: $match"
    ((WARNINGS++))
  fi
done < <(grep -rn --include="*.js" "async function" "$DIR" | grep -v "node_modules" | head -30 2>/dev/null)

# --- 7. Script load order issues ---
echo -e "${CYN}[7/8] Checking HTML script load order...${NC}"
for htmlfile in $(find "$DIR" -maxdepth 2 -name "*.html" ! -path "*/node_modules/*" 2>/dev/null); do
  # Check if supabase CDN is loaded before supabase-client.js
  CDN_LINE=$(grep -n "supabase.*\.js\|supabase.*cdn\|supabase.*min" "$htmlfile" 2>/dev/null | grep -i "cdn\|jsdelivr\|unpkg" | head -1 | cut -d: -f1)
  CLIENT_LINE=$(grep -n "supabase-client\.js" "$htmlfile" 2>/dev/null | head -1 | cut -d: -f1)

  if [ -n "$CLIENT_LINE" ] && [ -z "$CDN_LINE" ]; then
    echo -e "  ${RED}BUG${NC} $htmlfile: supabase-client.js loaded but CDN script missing!"
    ((ISSUES++))
  elif [ -n "$CLIENT_LINE" ] && [ -n "$CDN_LINE" ] && [ "$CLIENT_LINE" -lt "$CDN_LINE" ]; then
    echo -e "  ${RED}BUG${NC} $htmlfile: supabase-client.js (line $CLIENT_LINE) loaded BEFORE CDN (line $CDN_LINE)!"
    ((ISSUES++))
  fi

  # Check if auth.js loads after supabase-client.js
  AUTH_LINE=$(grep -n "auth\.js" "$htmlfile" 2>/dev/null | head -1 | cut -d: -f1)
  if [ -n "$AUTH_LINE" ] && [ -n "$CLIENT_LINE" ] && [ "$AUTH_LINE" -lt "$CLIENT_LINE" ]; then
    echo -e "  ${RED}BUG${NC} $htmlfile: auth.js (line $AUTH_LINE) loaded BEFORE supabase-client.js (line $CLIENT_LINE)!"
    ((ISSUES++))
  fi
done

# --- 8. Missing files referenced in HTML ---
echo -e "${CYN}[8/8] Checking for missing referenced files...${NC}"
for htmlfile in $(find "$DIR" -maxdepth 2 -name "*.html" ! -path "*/node_modules/*" 2>/dev/null); do
  HTMLDIR=$(dirname "$htmlfile")
  # Check JS src references
  while IFS= read -r src; do
    src=$(echo "$src" | sed 's/?.*//')  # strip query params
    if [[ "$src" != http* ]] && [[ "$src" != //* ]] && [ ! -f "$HTMLDIR/$src" ]; then
      echo -e "  ${RED}BUG${NC} $htmlfile references missing file: $src"
      ((ISSUES++))
    fi
  done < <(grep -oE 'src="[^"]*\.js[^"]*"' "$htmlfile" 2>/dev/null | sed 's/src="//;s/"//')

  # Check CSS href references
  while IFS= read -r href; do
    href=$(echo "$href" | sed 's/?.*//')
    if [[ "$href" != http* ]] && [[ "$href" != //* ]] && [ ! -f "$HTMLDIR/$href" ]; then
      echo -e "  ${RED}BUG${NC} $htmlfile references missing CSS: $href"
      ((ISSUES++))
    fi
  done < <(grep -oE 'href="[^"]*\.css[^"]*"' "$htmlfile" 2>/dev/null | sed 's/href="//;s/"//')
done

# --- SUMMARY ---
echo ""
echo "=========================================="
echo -e "  RESULTS: ${RED}$ISSUES issues${NC} | ${YEL}$WARNINGS warnings${NC}"
echo "=========================================="

if [ $ISSUES -gt 0 ]; then
  echo -e "  ${RED}Fix the issues above before deploying!${NC}"
  exit 1
else
  echo -e "  ${GRN}No critical issues found.${NC}"
  exit 0
fi
