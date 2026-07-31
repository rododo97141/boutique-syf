# Journal du programme R93 → R95

Une ligne par point livré, avec ses **mesures réelles**. Les corrections
faites hors du mandat du lot en cours sont regroupées en fin de document.

Règle de gouvernance appliquée à chaque ligne : **aucun défaut n'est déclaré
sur la foi d'un seul instrument**. Le second moyen de vérification est nommé.

Budgets de référence : LCP mobile < 2 500 ms (mesure R92 : 504 ms, CPU ×4) ·
or en détail — point ≤ 4 px, halo ≤ 12 px, croix ≤ 24 px, ampoule ≤ 6 px ·
éclat furtif ≤ 10 % du cycle.

---

## R93 — LE PORTAIL

| Point | Livré | Mesures réelles |
|---|---|---|
| **R93/1** | Harnais QA versionné dans `tools/qa/` (angle mort A levé) | 56 combinaisons (14 pages × 2 thèmes × 2 viewports), **0 erreur JS** · déterminisme prouvé : 2 dumps du même code → **0 différence** · LCP accueil **564 ms** / budget 2 500 (élément LCP = `div.hero-bg`, poster du film) |

### R93/1 — ce que la calibration a appris

Le harnais a été **calibré contre le réel avant d'être déclaré fiable**. Sa
première version annonçait 11 défauts sur l'accueil, dont 6 faux. Trois défauts
de l'instrument, trouvés et corrigés :

1. **Fonds en dégradé ignorés** → le crème du `body` remontait sous des sections
   à fond dégradé sombre (6 faux positifs sur 11).
2. **Le ciel de La Traversée est une couche `position: fixed`** qui peint
   par-dessus le fond du `body` sans jamais être un ancêtre. Une remontée
   d'ancêtres ne peut structurellement pas le voir : l'outil annonçait « crème
   sur crème » là où une capture montre « crème sur marine sombre ».
   → L'outil déclare désormais **indéterminé** au lieu de deviner, puis mesure
   les **pixels réellement peints** (couleur dominante de la boîte capturée).
3. **Dumps non déterministes** : ils échantillonnaient des animations en vol
   (`opacity .950207` vs `.950219`), et la preuve de confinement prenait ce
   bruit pour un changement. → `freezeAnimations()` + quantification.

> Leçon retenue pour tout le programme : un instrument non calibré ne prouve
> rien, et un instrument non déterministe prouve n'importe quoi.

---

## Corrections hors mandat

| # | Correction | Niveau | Second moyen de vérification | Mesures |
|---|---|---|---|---|
| 1 | **Pied de page illisible sur l'accueil au crépuscule** — au palier `dusk`, le verre du footer devient sombre mais deux de ses textes restaient sombres. Deux échappées à la bascule de texte §39.5 : `--gold-deep` (piège de cascade — l'alias est substitué au niveau `html`, donc figé puis hérité, hors de portée de la bascule) et `--ink-warm-rgb` (la bascule porte sur les tokens de couleur, pas sur leurs triplets `-rgb`) | VERT, commité isolément pour être annulable | Mesure des **couleurs calculées** au bas de page dans les deux thèmes, en plus de la mesure de pixels qui l'avait signalé ; puis capture | Avant : label **1.82:1**, liens de colonne **4.45:1** (seuil 4.5) · Après : or clair et crème dans les deux thèmes · confinement **0 différence** sur les 13 autres pages |

### Constats ouverts, non corrigés (à instruire, pas assez compris pour agir)

- **Signature de marque du pied de page** (`.brand-sign-mark`, « SYFIR » 104 px) :
  mesurée à **2,86:1** sur le ciel au crépuscule (seuil 3:1 pour un grand texte).
  Le verre sombre du footer ne semble pas peint derrière cet élément — le pixel
  échantillonné y est la couleur du ciel, pas celle du verre. Diagnostic non
  achevé ; aucune correction tentée à l'aveugle.
- Les **5 défauts de contraste préexistants** de l'accueil (`button.chip`, `em`,
  `h3`, `p.eyebrow.eyebrow-light`, `p.section-intro.intro-light`) restent hors
  périmètre par décision du superviseur : passage dédié à venir.
