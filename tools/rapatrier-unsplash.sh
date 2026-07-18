#!/usr/bin/env bash
# ============================================================
# Rapatriement des images Unsplash restantes (R20-1).
# Objectif : ZÉRO dépendance externe d'images. On télécharge chaque photo
# Unsplash encore référencée, on la passe en local (JPEG + WebP), puis on
# réécrit toutes les URLs du dépôt vers le fichier local.
#
# ⚠️ NÉCESSITE un accès réseau à images.unsplash.com. Dans l'environnement
#    CI/sandbox de développement, cet hôte est bloqué par la politique
#    d'egress (HTTP 403) : lancer ce script depuis une machine au réseau
#    ouvert, puis committer images/ext/ + les fichiers modifiés.
#
# Usage : bash tools/rapatrier-unsplash.sh
# Dépendances : curl + ImageMagick (magick ou convert).
# ============================================================
set -euo pipefail
cd "$(dirname "$0")/.."

# ImageMagick 7 = « magick », 6 = « convert »
if command -v magick >/dev/null; then IM="magick";
elif command -v convert >/dev/null; then IM="convert";
else echo "ImageMagick requis (magick ou convert)"; exit 1; fi
command -v curl >/dev/null || { echo "curl requis"; exit 1; }

OUT="images/ext"
mkdir -p "$OUT"

# Fichiers susceptibles de contenir des URLs Unsplash (le stub d'aperçu exclu)
FILES=(index.html saveurs.html syf-tv.html evenements.html evenement.html \
       espace-pro.html partenaires.html compte.html script.js events-data.js)

# 1. IDs de photos uniques encore référencés
mapfile -t IDS < <(grep -rho "images\.unsplash\.com/photo-[0-9a-f]*" "${FILES[@]}" 2>/dev/null \
                   | sed 's#.*/##' | sort -u)
echo "→ ${#IDS[@]} photos Unsplash uniques à rapatrier."

# 2. Téléchargement + double export local (JPEG q82 + WebP q80, 1600px max)
for id in "${IDS[@]}"; do
  base="$OUT/unsplash-$id"
  if [ -f "$base.jpg" ] && [ -f "$base.webp" ]; then echo "· déjà là : $id"; continue; fi
  url="https://images.unsplash.com/$id?w=1600&q=80&fm=jpg&fit=max"
  tmp="$(mktemp)"
  if ! curl -fsSL -m 60 -o "$tmp" "$url"; then
    echo "✗ échec téléchargement (réseau bloqué ?) : $id"; rm -f "$tmp"; continue
  fi
  $IM "$tmp" -resize '1600x1600>' -strip -quality 82 "$base.jpg"
  $IM "$tmp" -resize '1600x1600>' -strip -quality 80 "$base.webp"
  rm -f "$tmp"
  echo "✓ $id → $base.{jpg,webp}"
done

# 3. Réécriture des URLs → chemin local (le .jpg, universel ; le .webp est
#    dispo à côté pour un passage manuel en <picture> si souhaité).
echo "→ réécriture des URLs dans le code…"
for id in "${IDS[@]}"; do
  # remplace l'URL complète (avec sa query string) par le chemin local
  perl -0777 -pi -e "s#https://images\\.unsplash\\.com/$id\\?[^\"')\\s]*#images/ext/unsplash-$id.jpg#g" "${FILES[@]}"
done

# 4. Contrôle : plus aucune URL Unsplash ne doit subsister
rest="$(grep -rho 'images\.unsplash\.com/[^"'"'"')]*' "${FILES[@]}" 2>/dev/null | sort -u || true)"
if [ -n "$rest" ]; then
  echo "⚠ URLs Unsplash restantes (téléchargement échoué ?) :"; echo "$rest"
  echo "  Relancer avec réseau ouvert, ou remplacer ces cas à la main."
else
  echo "✓ Zéro dépendance Unsplash restante."
fi
echo "Terminé. Vérifier images/ext/, puis committer."
