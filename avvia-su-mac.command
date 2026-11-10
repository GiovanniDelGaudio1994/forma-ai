#!/bin/zsh
cd "$(dirname "$0")" || exit 1
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js 22 o superiore non trovato. Installa Node.js da https://nodejs.org/";
  read "?Premi Invio per uscire...";exit 1
fi
echo "FORMA AI | Avvio server locale..."
node server/index.mjs &
PID=$!
sleep 1
open "http://127.0.0.1:8787/"
wait $PID
