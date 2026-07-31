# tools/qa — le harnais de mesure SYFIR

Outillage de vérification versionné avec le site. Il ne fait **pas** partie du
site déployé : rien ici n'est chargé par une page, et le dossier est exclu de
la publication (voir « Déploiement » plus bas).

> **Pourquoi c'est dans le dépôt.** En R91 et R92 ce harnais vivait dans un
> répertoire temporaire, détruit avec la session : à la passation R93, outils
> **et** dump de référence avaient disparu, et la preuve de confinement était
> à refaire de zéro. Décision du superviseur (R93) : c'est un actif du projet.

## Prérequis

Aucune dépendance installée, aucune étape de build. Playwright et Chromium sont
fournis par l'environnement :

```bash
NODE_PATH=/opt/node22/lib/node_modules node tools/qa/<script>.mjs
```

Le serveur statique (`python3 -m http.server 8099`) est démarré et attendu
automatiquement par `lib.mjs`. **Il meurt régulièrement** — les scripts le
relancent seuls ; ne pas s'étonner de le voir réapparaître.

## Les outils

| Script | Rôle |
|---|---|
| `ui-dump.mjs <label>` | Empreinte des styles **calculés** : 14 pages × 2 thèmes × 2 viewports = **56 combinaisons** → `out/<label>.json` |
| `ui-diff-hors-index.mjs <a> <b>` | **Preuve de confinement** : compare deux dumps en excluant `index.html`. Un lot confiné doit produire **0 différence** sur les 13 autres pages. Sort en code 1 sinon |
| `lcp.mjs [page\|--sweep] [--portal-first]` | **LCP mobile réel** au `PerformanceObserver`, CPU bridé ×4, budget 2 500 ms. Rapporte **quel élément** est le LCP |
| `contraste.mjs [page] [--theme …]` | Contraste **AA sur le rendu**, en deux étages (voir ci-dessous) |

### `contraste.mjs` — pourquoi deux étages

**Étage 1, composition.** Le fond effectif est composé en alpha réelle sur la
chaîne d'ancêtres. Deux pièges mesurés en R93/1, tous deux producteurs de faux
positifs :

- s'arrêter au premier fond « assez opaque » et **ignorer les dégradés** faisait
  remonter le crème du `body` sous des sections à fond dégradé sombre —
  6 faux positifs sur 11 ;
- surtout, **le ciel de La Traversée est une couche `position: fixed`** qui peint
  par-dessus le fond du `body` sans jamais être un ancêtre. Une remontée
  d'ancêtres ne peut structurellement pas le voir : elle annonçait « crème sur
  crème » là où l'œil voit « crème sur marine sombre ».

Quand le fond n'est pas composable (dégradé, ou couche fixe recouvrante), l'outil
ne devine pas : il déclare **indéterminé**.

**Étage 2, pixels réellement peints.** Chaque fond indéterminé est mesuré dans
l'image : capture de la boîte de l'élément, puis couleur **dominante** (bacs de 8
pour absorber anticrénelage et grain) — le texte y est toujours minoritaire.
C'est la seule mesure qui voit ce que voit l'œil.

> Cet étage a immédiatement trouvé un défaut réel que l'étage 1 ne pouvait pas
> voir : sur l'accueil en thème clair, au palier `dusk`, le verre du pied de page
> devient sombre alors que son texte reste sombre (§39.5 non appliqué au footer)
> — pied de page illisible. Confirmé par capture avant correction.

Les 14 pages mesurées excluent volontairement les stubs de redirection
(`actualite`, `communaute`, `medias`) et `apercu-syfir.html` (non maintenu).

## Deux règles apprises à la dure

1. **Mesurer le résultat, jamais le câblage.** Un test qui vérifie qu'une
   propriété est *déclarée* ne prouve rien : en R92/1 le test lisait
   `animationName` / `animationTimeline`, passait au vert, et la traversée
   était cassée. On mesure la couleur d'arrivée, le retard réel, l'opacité
   échantillonnée.
2. **Un dump doit être DÉTERMINISTE.** La première version échantillonnait des
   animations en vol : deux passes du même dépôt différaient sur des décimales
   (`opacity .950207` vs `.950219`) et la preuve de confinement se noyait dans un
   bruit qu'elle prenait pour un changement. `freezeAnimations()` fige toutes les
   animations à `t=0` et les valeurs sont quantifiées à 2 décimales. Contrôle à
   refaire après toute évolution du harnais : deux dumps consécutifs du même code
   doivent donner **0 différence**.
3. **L'accueil grandit pendant qu'on le mesure.** Les sections
   `content-visibility: auto` ne déclarent leur hauteur qu'en approchant du
   viewport ; « hauteur stable sur 3 tours » ne suffit pas. `scrollToBottom()`
   de `lib.mjs` applique le seul motif qui tient : descente progressive +
   hauteur stable, **puis** réancrage jusqu'à `scrollY / max >= 0.995`.

Corollaire de gouvernance (R93) : **aucun défaut n'est déclaré sur la foi d'un
seul instrument.** Tout défaut est confirmé par un second moyen indépendant
avant correction, et le moyen employé est nommé dans le rapport.

## Cycle type

```bash
node tools/qa/ui-dump.mjs r93-00-baseline      # avant le lot
# … écriture du lot …
node tools/qa/ui-dump.mjs r93-08-final
node tools/qa/ui-diff-hors-index.mjs r93-00-baseline r93-08-final
node tools/qa/lcp.mjs --portal-first
node tools/qa/contraste.mjs index.html --theme light
```

⚠ **Ne jamais éditer un fichier pendant qu'un dump tourne** (erreur commise en
R92/7) : le dump mélangerait deux états du dépôt.

## Déploiement

`out/` est ignoré par git (`out/.gitignore`) : les dumps sont volumineux et
propres à une machine. Seuls les scripts sont versionnés.

Le site est publié par GitHub Pages depuis la racine ; `tools/` n'étant
référencé par aucune page, il n'est jamais servi au visiteur. Si un jour un
workflow de publication est ajouté, exclure explicitement `tools/`.
