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
| **R93/2** | Voile : structure, rendu instantané, état résolu avant le premier pixel | **Point d'architecture 1 tranché.** LCP mobile CPU ×4, 3 passes par scénario : voile **504/576/520** → médiane **520 ms** ; sans voile **560/816/552** → médiane **560 ms**. Le voile **ne dégrade pas** le LCP et **n'en devient pas l'élément** (LCP reste `div.hero-bg` — Chromium ne décompte pas l'occlusion). 0 débordement à 390 px, cibles 52/44 px, 0 erreur JS |
| **R93/3** | Accessibilité : focus initial, piège de focus, `inert`, Échap | **Point d'architecture 2 tranché.** **0** élément focusable atteignable hors du voile (16 frères en `inert`) · Tab et Shift+Tab bouclent · Échap → mémorise `muet` · Entrer → rend le focus au skip-link |
| **R93/4** | Levée en fondu croisé, continuité, mémoire, film déclenché | **Point d'architecture 3 tranché.** Opacité échantillonnée **1 → 0.41 → 0.13 → 0.04 → 0.01 → 0** · palier du ciel **inchangé** avant/après (aucun palier forcé : le fondu suffit) · film **0** tentative avant la levée, **1** après · `prefers-reduced-motion` → levée immédiate |
| **R93/5** | Mouvement : reflet 5,5 s, pouls kompa, éclat furtif | Éclat visible **6,4 %** du cycle (seuil 10 %, 110 relevés sur un cycle complet) · halo du pouls **9,99 px** (seuil 12 px, max sur 40 relevés) · croix **20 px** (seuil 24 px) · pouls **517 ms** = 116 BPM exactement · reduced-motion **et** mode économe → `animation-name: none`, décor intact |
| **R93/6** | Ambiance procédurale Web Audio, zéro fichier | **0** contexte audio avant tout geste · **1** après « Entrer » · **0** après « entrer sans le son » · **0** après Échap · **0** sous `prefers-reduced-motion` · montée mesurée sur le gain maître réel : 0.0001 → 0.0003 → 0.0011 → 0.0037 → 0.012 → 0.0388 → 0.131 → **0.16** en ~2,5 s |
| **R93/7** | Réglage du son dans la nav : trois états | 1ʳᵉ visite → `off` · après Entrer → `on` · clic → `off` mémorisé · visite mémorisée avec préférence son → **`ready`, 0 contexte audio** · puis un geste quelconque → `on`, 1 contexte · préférence muette + geste → `off`, **0** contexte · absent des autres pages |
| **R93/8** | Vérification finale | **Confinement : 0 différence** sur les 52 combinaisons hors index · LCP **14 pages toutes dans le budget**, pire page `partenaires.html` **1 380 ms** / 2 500 · contraste du voile : **0 défaut AA** (ligne 11.29, bouton 16.45, lien discret 6.20) · parcours **au clavier seul** : Entrée sur le focus initial franchit la porte · 0 erreur JS sur les 56 combinaisons |

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

Deux défauts d'instrument supplémentaires trouvés **pendant** R93 et corrigés
dans `tools/qa/` :

4. **`transitionend` remonte depuis les enfants** (R93/4) — la transition du
   bouton perdant le survol terminait la levée dans la même frame ; le fondu
   ne se voyait jamais. L'écouteur filtre désormais sur la cible **et** la
   propriété.
5. **Un voile plein écran occulte la page** (R93/8) — mesurer le contraste des
   éléments situés derrière lui les mesurait *contre lui* : **36 faux défauts**
   sur du contenu que personne ne voit. L'outil ne mesure plus que le voile
   quand il est présent. Résultat après correction : **0 défaut**.

### Bugs réels trouvés par la mesure pendant l'écriture de R93

- **Zone morte temporelle ×2** (R93/6 et R93/7) : deux blocs lisaient des
  constantes déclarées plus bas dans le même module. Le premier cassait tout le
  son, le second tout le réglage. Aucun des deux n'aurait été vu par un test
  qui vérifie qu'une propriété est *déclarée*.
- **Le `™` invisible** (R93/5) : son opacité créait un contexte d'empilement qui
  coupait le `background-clip: text` du parent. Vu à la capture, pas au code.

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
