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
retouche "$ORIG"/Generated*1_35PM-3.png  syf-planteur-1      # pochette seule, plage
retouche "$ORIG"/Generated*1_35PM-2.png  syf-planteur-2      # flat lay vu de dessus
retouche "$ORIG"/ChatGPT*09_58_39.png    syf-planteur-3      # duo pochette + verre
retouche "$ORIG"/ChatGPT*09_40_43.png    syf-planteur-verre  # verre seul

# ============================================================
# Photos officielles (lot 22, commit 01e8042) : déjà étalonnées par la
# marque — AUCUNE retouche couleur. Redimension 1600 max + double export
# JPEG q82 / WebP q80. Les photos « à la main » embarquent une interface
# d'application : recadrage 3:4 centré pour l'enlever.
# ============================================================
webp() {               # webp <fichier jpg dans images/produits> [crop34]
  local src="$OUT/$1" name="${1%.jpg}"
  [ -f "$src" ] || { echo "✗ introuvable : $src"; exit 1; }
  local CHAIN=(-resize '1600x1600>' -strip)
  if [ "${2:-}" = "crop34" ]; then
    local W H CW CH
    W=$(identify -format '%w' "$src"); H=$(identify -format '%h' "$src")
    if [ $((W * 4)) -gt $((H * 3)) ]; then CH=$H; CW=$((H * 3 / 4)); else CW=$W; CH=$((W * 4 / 3)); fi
    # resserre encore de 13 % : les coins de l'interface débordent du 3:4
    CHAIN=(-gravity center -crop "${CW}x${CH}+0+0" +repage -gravity center -crop 87%x87%+0+0 +repage "${CHAIN[@]}")
    convert "$src" "${CHAIN[@]}" -quality 82 "$OUT/$name.jpg"
  fi
  convert "$src" "${CHAIN[@]}" -quality 80 "$OUT/$name.webp"
  echo "webp OK: $name"
}

for f in syfir-bar-bois syfir-coral-fruits-rouges syfir-gamme-6-saveurs \
         syfir-laniere-blanc syfir-lanieres-orange-noir syfir-moodboard \
         syfir-planteur-marbre syfir-pub-duo syfir-pub-plage-1 syfir-pub-plage-2 \
         syfir-pub-plage-3 syfir-pub-verre syfir-sachet-fruits-blanc \
         syfir-sachet-or-vide syfir-studio-fruits syfir-tropical-ananas; do
  webp "$f.jpg"
done
webp syfir-main-plage.jpg  crop34
webp syfir-main-citron.jpg crop34

echo
ls -la "$OUT" | awk '$5 > 400*1024 { print "⚠ dépasse 400 Ko : " $NF }'
echo "Terminé — originaux intacts dans $ORIG/."
