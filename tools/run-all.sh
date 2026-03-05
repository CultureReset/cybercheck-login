#!/bin/bash
# ============================================
# MASTER DIAGNOSTIC RUNNER
# Runs all diagnostic agents and produces a combined report
# Usage: ./tools/run-all.sh [directory]
# ============================================

DIR="${1:-$(dirname "$0")/..}"
TOOLS_DIR="$(dirname "$0")"

RED='\033[0;31m'
GRN='\033[0;32m'
CYN='\033[0;36m'
MAG='\033[0;35m'
NC='\033[0m'

echo ""
echo -e "${MAG}╔══════════════════════════════════════════╗${NC}"
echo -e "${MAG}║     CYBERCHECK DIAGNOSTIC SUITE          ║${NC}"
echo -e "${MAG}║     Running all agents...                 ║${NC}"
echo -e "${MAG}╚══════════════════════════════════════════╝${NC}"
echo ""
echo "  Target: $DIR"
echo "  Date:   $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

PASS=0
FAIL=0

# Agent 1: Code Audit
echo -e "${MAG}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAG}  AGENT 1: CODE AUDIT${NC}"
echo -e "${MAG}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
bash "$TOOLS_DIR/code-audit.sh" "$DIR"
if [ $? -eq 0 ]; then ((PASS++)); else ((FAIL++)); fi
echo ""

# Agent 2: Link Checker
echo -e "${MAG}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAG}  AGENT 2: LINK CHECKER${NC}"
echo -e "${MAG}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
bash "$TOOLS_DIR/link-checker.sh" "$DIR"
if [ $? -eq 0 ]; then ((PASS++)); else ((FAIL++)); fi
echo ""

# Agent 3: JS Error Finder
echo -e "${MAG}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAG}  AGENT 3: JS ERROR FINDER${NC}"
echo -e "${MAG}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
bash "$TOOLS_DIR/js-error-finder.sh" "$DIR"
if [ $? -eq 0 ]; then ((PASS++)); else ((FAIL++)); fi
echo ""

# Final Summary
echo -e "${MAG}╔══════════════════════════════════════════╗${NC}"
echo -e "${MAG}║     FINAL REPORT                         ║${NC}"
echo -e "${MAG}╚══════════════════════════════════════════╝${NC}"
echo ""
echo -e "  Agents passed: ${GRN}$PASS${NC}"
echo -e "  Agents failed: ${RED}$FAIL${NC}"
echo ""

if [ $FAIL -gt 0 ]; then
  echo -e "  ${RED}Issues found — review the output above${NC}"
  exit 1
else
  echo -e "  ${GRN}All agents passed! Ready to deploy.${NC}"
  exit 0
fi
