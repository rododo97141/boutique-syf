#!/usr/bin/env bash
# ============================================================
# Retouche appétit des visuels produit SYFIR (reproductible).
# Recherche : les tons chauds augmentent l'intention d'achat —
# on réchauffe LÉGÈREMENT, on ne maquille pas le produit.
#
# Source : images/originaux/ (JAMAIS modifiés)
# Sortie  : images/produits/syf-*.jpg (fallback) + syf-*.webp
#
# Traitement, dans l'ordre :
#   1. recadrage 3:4 centré — même ratio pour les 3 visuels Planteur
#   2. luminosité homogène — chaque image ramenée vers une moyenne
#      commune (0.52), facteur borné [0.92 ; 1.10] pour ne rien cramer
#   3. balance chaude légère (+4 % rouge, −4 % bleu)
#      + saturation +12 % (les oranges dominent ces visuels)
#   4. redimension 1600 px max, export JPEG q82 + WebP q80 (strip)
#
# Usage : bash tools/retouche-images.sh   (depuis la racine du dépôt)
# Dépendance : ImageMagick 6+ (convert / identify)
# ============================================================
set -euo pipefail
cd "$(dirname "$0")/.."

ORIG="images/originaux"
OUT="images/produits"
TARGET_MEAN=0.52   # luminance moyenne commune (0..1)

command -v convert >/dev/null || { echo "ImageMagick requis (apt-get install imagemagick)"; exit 1; }

retouche() {           # retouche <fichier source> <nom de sortie sans extension>
  local src="$1" name="$2"
  [ -f "$src" ] || { echo "✗ introuvable : $src"; exit 1; }

  # -- 1. recadrage 3:4 centré
  local W H CW CH
  W=$(identify -format '%w' "$src"); H=$(identify -format '%h' "$src")
  if [ $((W * 4)) -gt $((H * 3)) ]; then CH=$H; CW=$((H * 3 / 4)); else CW=$W; CH=$((W * 4 / 3)); fi

  # -- 2. facteur de luminosité vers la moyenne commune, borné
  local MEAN FACTOR
  MEAN=$(convert "$src" -colorspace gray -format '%[fx:mean]' info:)
  FACTOR=$(awk -v m="$MEAN" -v t="$TARGET_MEAN" 'BEGIN {
    f = t / m; if (f < 0.92) f = 0.92; if (f > 1.10) f = 1.10; printf "%.4f", f }')

  # -- 3+4. chaîne complète
  local CHAIN=(
    -gravity center -crop "${CW}x${CH}+0+0" +repage
    -evaluate multiply "$FACTOR"
    -modulate 100,112,100
    -channel R -evaluate multiply 1.04 -channel B -evaluate multiply 0.96 +channel
    -resize '1600x1600>' -strip
  )
  convert "$src" "${CHAIN[@]}" -quality 82 "$OUT/$name.jpg"
  convert "$src" "${CHAIN[@]}" -quality 80 "$OUT/$name.webp"
  printf '✓ %-22s %s×%s → %s (moyenne %.2f, facteur %s)\n' "$name" "$W" "$H" "${CW}x${CH}" "$MEAN" "$FACTOR"
}

# Correspondances originaux → produits (identifiées visuellement, cf. HANDOFF)
retouche "$ORIG"/Generated*1_35PM-3.png  syf-planteur-1      # sachet seul, plage
retouche "$ORIG"/Generated*1_35PM-2.png  syf-planteur-2      # flat lay vu de dessus
retouche "$ORIG"/ChatGPT*09_58_39.png    syf-planteur-3      # duo sachet + verre
retouche "$ORIG"/ChatGPT*09_40_43.png    syf-planteur-verre  # verre seul

echo
ls -la "$OUT" | awk '$5 > 400*1024 { print "⚠ dépasse 400 Ko : " $NF }'
echo "Terminé — originaux intacts dans $ORIG/."
