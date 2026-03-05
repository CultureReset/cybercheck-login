#!/bin/bash
# ============================================
# JS ERROR FINDER AGENT
# Deep scan for JavaScript runtime errors, type issues, and common bugs
# Usage: ./tools/js-error-finder.sh [directory]
# ============================================

DIR="${1:-.}"
RED='\033[0;31m'
YEL='\033[1;33m'
GRN='\033[0;32m'
CYN='\033[0;36m'
MAG='\033[0;35m'
NC='\033[0m'
ERRORS=0
WARNINGS=0

echo ""
echo "=========================================="
echo "  JS ERROR FINDER AGENT"
echo "  Scanning: $DIR"
echo "=========================================="
echo ""

# --- 1. Undefined function calls ---
echo -e "${CYN}[1/10] Finding function definitions and checking calls...${NC}"

# Build a list of defined functions
DEFINED=$(grep -rohE "function\s+(\w+)" "$DIR" --include="*.js" 2>/dev/null | grep -v node_modules | sed 's/function //' | sort -u)
# Also get IIFE-returned functions (like CC.login)
DEFINED="$DEFINED
$(grep -rohE "(\w+):\s*function" "$DIR" --include="*.js" 2>/dev/null | grep -v node_modules | sed 's/:.*//' | sort -u)"
# Also get arrow/const functions
DEFINED="$DEFINED
$(grep -rohE "(const|let|var)\s+(\w+)\s*=\s*(async\s+)?function" "$DIR" --include="*.js" 2>/dev/null | grep -v node_modules | sed 's/.*\s\(\w\+\)\s*=.*/\1/' | sort -u)"

# Check for common function calls that might not be defined
for func in initRouter toast navigateTo openModal closeModal toggleSidebar clearCache clearSupabaseCache getSupabaseSession getSupabaseBusiness getSiteId requireSupabaseAuth; do
  CALLS=$(grep -rn --include="*.js" --include="*.html" "\b${func}\b" "$DIR" 2>/dev/null | grep -v "node_modules" | grep -v "function ${func}" | grep -v "//${func}" | wc -l | tr -d ' ')
  DEFS=$(grep -rn --include="*.js" "function ${func}\b" "$DIR" 2>/dev/null | grep -v "node_modules" | wc -l | tr -d ' ')

  if [ "$CALLS" -gt 0 ] && [ "$DEFS" -eq 0 ]; then
    # Also check if defined as property
    PROP_DEFS=$(grep -rn --include="*.js" "${func}\s*[:=]\s*\(async\s\+\)\?function\|${func}\s*=\s*(" "$DIR" 2>/dev/null | grep -v "node_modules" | wc -l | tr -d ' ')
    if [ "$PROP_DEFS" -eq 0 ]; then
      echo -e "  ${RED}ERROR${NC} Function '${func}' called $CALLS times but never defined"
      ((ERRORS++))
    fi
  fi
done

# --- 2. Duplicate function definitions ---
echo -e "${CYN}[2/10] Checking for duplicate function definitions...${NC}"
grep -rn --include="*.js" "^function \w\+\|^async function \w\+" "$DIR" 2>/dev/null | grep -v node_modules | \
  sed 's/.*function \(\w\+\).*/\1/' | sort | uniq -d | while read -r func; do
  echo -e "  ${YEL}WARN${NC} Function '${func}' defined multiple times:"
  grep -rn --include="*.js" "function ${func}\b" "$DIR" 2>/dev/null | grep -v node_modules | sed 's/^/    /'
  ((WARNINGS++))
done

# --- 3. Accessing properties of potentially null variables ---
echo -e "${CYN}[3/10] Checking for unguarded null property access...${NC}"
while IFS= read -r match; do
  echo -e "  ${YEL}WARN${NC} $match"
  ((WARNINGS++))
done < <(grep -rn --include="*.js" "await.*)\.\w" "$DIR" 2>/dev/null | grep -v "node_modules\|try\|if\|catch\|&&" | head -15)

# --- 4. Missing await on async calls ---
echo -e "${CYN}[4/10] Checking for missing await on async function calls...${NC}"
# Get list of async functions
ASYNC_FUNCS=$(grep -rohE "async\s+function\s+(\w+)" "$DIR" --include="*.js" 2>/dev/null | grep -v node_modules | sed 's/async function //' | sort -u)
for func in $ASYNC_FUNCS; do
  while IFS= read -r match; do
    LINE_CONTENT=$(echo "$match" | cut -d: -f3-)
    if ! echo "$LINE_CONTENT" | grep -qE "await\s+.*${func}|\.then|Promise|async"; then
      echo -e "  ${YEL}WARN${NC} Possibly missing await: $match"
      ((WARNINGS++))
    fi
  done < <(grep -rn --include="*.js" "\b${func}\s*(" "$DIR" 2>/dev/null | grep -v "node_modules\|function ${func}\|async function" | head -5)
done

# --- 5. DOM queries that might return null ---
echo -e "${CYN}[5/10] Checking for unguarded DOM queries...${NC}"
while IFS= read -r match; do
  FILE=$(echo "$match" | cut -d: -f1)
  LINE_NUM=$(echo "$match" | cut -d: -f2)
  NEXT_LINE=$((LINE_NUM + 1))
  NEXT=$(sed -n "${LINE_NUM}p;${NEXT_LINE}p" "$FILE" 2>/dev/null)
  if ! echo "$NEXT" | grep -q "if\|&&\|?\.\|!"; then
    echo -e "  ${YEL}WARN${NC} $match"
    ((WARNINGS++))
  fi
done < <(grep -rn --include="*.js" "querySelector\|getElementById\|getElementsBy" "$DIR" 2>/dev/null | grep -v "node_modules" | grep "\.\(textContent\|innerHTML\|value\|style\|classList\|addEventListener\)" | head -15)

# --- 6. Syntax issues: unclosed brackets, quotes ---
echo -e "${CYN}[6/10] Checking for basic syntax issues...${NC}"
for jsfile in $(find "$DIR" -maxdepth 3 -name "*.js" ! -path "*/node_modules/*" 2>/dev/null); do
  # Count brackets
  OPEN_BRACE=$(grep -o '{' "$jsfile" 2>/dev/null | wc -l | tr -d ' ')
  CLOSE_BRACE=$(grep -o '}' "$jsfile" 2>/dev/null | wc -l | tr -d ' ')
  OPEN_PAREN=$(grep -o '(' "$jsfile" 2>/dev/null | wc -l | tr -d ' ')
  CLOSE_PAREN=$(grep -o ')' "$jsfile" 2>/dev/null | wc -l | tr -d ' ')

  if [ "$OPEN_BRACE" -ne "$CLOSE_BRACE" ]; then
    DIFF=$((OPEN_BRACE - CLOSE_BRACE))
    echo -e "  ${RED}ERROR${NC} $jsfile: Mismatched braces { } (off by $DIFF)"
    ((ERRORS++))
  fi
  if [ "$OPEN_PAREN" -ne "$CLOSE_PAREN" ]; then
    DIFF=$((OPEN_PAREN - CLOSE_PAREN))
    echo -e "  ${RED}ERROR${NC} $jsfile: Mismatched parens ( ) (off by $DIFF)"
    ((ERRORS++))
  fi
done

# --- 7. Event listeners on elements that might not exist ---
echo -e "${CYN}[7/10] Checking event listener safety...${NC}"
while IFS= read -r match; do
  LINE_CONTENT=$(echo "$match" | cut -d: -f3-)
  # Check if there's a null check
  if ! echo "$LINE_CONTENT" | grep -q "if\|&&\|?\."; then
    echo -e "  ${YEL}WARN${NC} addEventListener without null check: $(echo "$match" | cut -c1-120)"
    ((WARNINGS++))
  fi
done < <(grep -rn --include="*.js" "\.addEventListener" "$DIR" 2>/dev/null | grep -v "node_modules\|document\.addEventListener\|window\.addEventListener" | head -15)

# --- 8. Mixed var/let/const issues ---
echo -e "${CYN}[8/10] Checking for var in modern code (should use let/const)...${NC}"
VAR_COUNT=$(grep -rc --include="*.js" "^var \|[^a-z]var " "$DIR" 2>/dev/null | grep -v "node_modules\|:0$" | awk -F: '{s+=$2} END {print s}')
LET_COUNT=$(grep -rc --include="*.js" "\blet \|const " "$DIR" 2>/dev/null | grep -v "node_modules\|:0$" | awk -F: '{s+=$2} END {print s}')
echo -e "  ${CYN}INFO${NC} var: ${VAR_COUNT:-0} | let/const: ${LET_COUNT:-0}"
if [ "${VAR_COUNT:-0}" -gt 50 ]; then
  echo -e "  ${YEL}NOTE${NC} Heavy use of 'var' — consider migrating to let/const for block scoping"
fi

# --- 9. Fetch calls without error handling ---
echo -e "${CYN}[9/10] Checking for fetch() calls without error handling...${NC}"
while IFS= read -r match; do
  FILE=$(echo "$match" | cut -d: -f1)
  LINE_NUM=$(echo "$match" | cut -d: -f2)
  # Check surrounding 10 lines for try/catch/.catch
  START=$((LINE_NUM - 2))
  END=$((LINE_NUM + 8))
  CONTEXT=$(sed -n "${START},${END}p" "$FILE" 2>/dev/null)
  if ! echo "$CONTEXT" | grep -q "try\|\.catch\|catch ("; then
    echo -e "  ${YEL}WARN${NC} fetch() without error handling: $match"
    ((WARNINGS++))
  fi
done < <(grep -rn --include="*.js" "\bfetch(" "$DIR" 2>/dev/null | grep -v "node_modules" | head -15)

# --- 10. Circular dependency check ---
echo -e "${CYN}[10/10] Checking for potential load-order issues...${NC}"
# Check if files reference globals from files that load after them
for htmlfile in $(find "$DIR" -maxdepth 2 -name "*.html" ! -path "*/node_modules/*" 2>/dev/null); do
  SCRIPTS=()
  while IFS= read -r src; do
    clean=$(echo "$src" | sed 's/?.*//')
    if [[ "$clean" != http* ]] && [[ "$clean" != //* ]]; then
      SCRIPTS+=("$clean")
    fi
  done < <(grep -oE 'src="([^"]*\.js[^"]*)"' "$htmlfile" 2>/dev/null | sed 's/src="//;s/"//')

  if [ ${#SCRIPTS[@]} -gt 1 ]; then
    echo -e "  ${CYN}INFO${NC} $htmlfile load order: ${SCRIPTS[*]}"
  fi
done

# --- SUMMARY ---
echo ""
echo "=========================================="
echo -e "  RESULTS: ${RED}$ERRORS errors${NC} | ${YEL}$WARNINGS warnings${NC}"
echo "=========================================="

if [ $ERRORS -gt 0 ]; then
  echo -e "  ${RED}Errors found — fix before deploying!${NC}"
  exit 1
elif [ $WARNINGS -gt 5 ]; then
  echo -e "  ${YEL}Multiple warnings — review recommended${NC}"
  exit 0
else
  echo -e "  ${GRN}Looking good!${NC}"
  exit 0
fi
