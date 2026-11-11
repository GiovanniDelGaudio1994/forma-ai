#!/usr/bin/env bash
# Meteo Bash 2D — modern terminal edition. Uses Open-Meteo (no API token).
set -euo pipefail
CITY="${1:-Salerno}"
case "${CITY,,}" in
  salerno) LAT="40.6824"; LON="14.7681";;
  roma|rome) LAT="41.9028"; LON="12.4964";;
  milano|milan) LAT="45.4642"; LON="9.1900";;
  napoli|naples) LAT="40.8518"; LON="14.2681";;
  pisa) LAT="43.7228"; LON="10.4017";;
  *) printf 'Città non disponibile: %s\nDisponibili: Salerno, Roma, Milano, Napoli, Pisa\n' "$CITY" >&2; exit 2;;
esac
command -v curl >/dev/null || { echo 'curl richiesto' >&2; exit 1; }
command -v python3 >/dev/null || { echo 'python3 richiesto' >&2; exit 1; }
URL="https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=3"
# Minimal outbound call; no token, no IP geolocation and no persisted location.
curl --fail --silent --show-error --location --max-time 20 "$URL" | python3 -c '
import datetime
import json
import sys
try:
    data=json.load(sys.stdin)
    current=data["current"]; daily=data["daily"]
except (ValueError, KeyError) as exc:
    sys.exit("Dati meteo non disponibili: "+str(exc))
def symbol(code):
    if code==0: return "☀ Sole"
    if code<=3: return "☁ Nuvole"
    if code<=48: return "≋ Nebbia"
    if code<=67: return "☂ Pioggia"
    if code<=77: return "❄ Neve"
    if code<=82: return "☂ Rovesci"
    if code<=86: return "❄ Neve"
    return "⚡ Temporale"
name=sys.argv[1]
print("╭"+"─"*54+"╮")
print("│  ☁ METEO BASH 2D — TERMINAL EDITION".ljust(55)+"│")
print("├"+"─"*54+"┤")
print(("│  "+name.upper()).ljust(55)+"│")
print(("│  "+symbol(current["weather_code"])).ljust(55)+"│")
print(("│  Temperatura: "+str(current["temperature_2m"])+" °C").ljust(55)+"│")
print(("│  Vento: "+str(current["wind_speed_10m"])+" km/h").ljust(55)+"│")
print(("│  Umidità: "+str(current["relative_humidity_2m"])+"%").ljust(55)+"│")
print("├"+"─"*54+"┤")
print("│  PREVISIONI — PROSSIMI TRE GIORNI".ljust(55)+"│")
for i,day in enumerate(daily["time"][:3]):
    line="│  "+day+" "+symbol(daily["weather_code"][i])+"  "+str(round(daily["temperature_2m_max"][i]))+"/"+str(round(daily["temperature_2m_min"][i]))+" °C"
    print(line.ljust(55)+"│")
print("╰"+"─"*54+"╯")
' "$CITY"
