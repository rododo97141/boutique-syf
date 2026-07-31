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

### ⚠ À TRAITER EN PRIORITÉ — pied de page illisible au crépuscule (thème clair)

Trouvé en vérification finale de R95, **après** correction d'un sixième défaut
de l'instrument (il lisait la couleur du texte en haut de page et le fond en bas
— deux instants différents sur une page dont l'encre bascule au défilement ;
22 défauts annoncés, **8 réels**).

Les 8 réels sont tous du **crème sur le ciel saumon clair du palier `dusk`**,
et l'un d'eux compte plus que les autres :

| Élément | Mesuré | Seuil |
|---|---|---|
| **`p.footer-sante` — la mention loi Évin** | **2,86:1** | 4,5 |
| `p` — © 2026 SYFIR | 2,95:1 | 4,5 |
| `span.form-demo-note` | 2,99:1 | 4,5 |
| `a` — « Notre marque » | 3,63:1 | 4,5 |
| `label` — newsletter | 2,10:1 | 4,5 |
| `button.chip` / `.chip.active` | 1,81 / 1,99 | 4,5 |

**La mention sanitaire doit être lisible** : c'est une obligation, pas une
préférence esthétique. La correction R93 (bascule des tokens) a bien fait passer
ces textes en crème, mais le vrai problème est ailleurs : **au crépuscule, le
verre du pied de page est trop transparent** pour du crème sur un ciel devenu
clair. La piste — opacifier le verre du footer au palier `dusk`, ou faire
basculer ces textes en encre sombre plutôt qu'en crème quand le ciel est clair —
n'a **pas** été tentée : la trancher en fin de session, sans pouvoir la vérifier
sur les deux thèmes et les quatre paliers, aurait été un pari.

### Constats ouverts, non corrigés (à instruire, pas assez compris pour agir)

- **Signature de marque du pied de page** (`.brand-sign-mark`, « SYFIR » 104 px) :
  mesurée à **2,86:1** sur le ciel au crépuscule (seuil 3:1 pour un grand texte).
  Le verre sombre du footer ne semble pas peint derrière cet élément — le pixel
  échantillonné y est la couleur du ciel, pas celle du verre. Diagnostic non
  achevé ; aucune correction tentée à l'aveugle.
- Les **5 défauts de contraste préexistants** de l'accueil (`button.chip`, `em`,
  `h3`, `p.eyebrow.eyebrow-light`, `p.section-intro.intro-light`) restent hors
  périmètre par décision du superviseur : passage dédié à venir.

---

## R94 — LE POULS ET LA TYPOGRAPHIE CINÉTIQUE

| Point | Livré | Mesures réelles |
|---|---|---|
| **R94/1** | Pouls kompa partagé à 116 BPM sur les éléments d'appel | 6 battants sur l'accueil, 2 sur la billetterie · `startTime` **0** partout, écart de phase **0 ms** · trois battants distincts relevés au même instant : **flou de halo identique au millième de pixel** · halo max **11,93 px** (seuil 12) |
| **R94/2** | Titres qui respirent au défilement (`font-variation-settings`) | Passage à la police **variable** : **1 fichier latin** à télécharger au lieu de 2, pour toute la plage 200-900 · respiration mesurée en descente progressive : **wght 800 → 675 → 800**, **50 valeurs distinctes** · **CLS 0.0000** · reduced-motion → wght 800 nominal |
| **R94/3** | Refonte : une seule horloge, des consommateurs | Empreinte hors accueil réduite à **`opacity` seule** (12 relevés, les badges) — contre 4 propriétés structurelles abîmées avant · LCP accueil **564/572/512 ms**, inchangé malgré la police variable |

### Ce que la mesure a imposé à R94

Trois dégâts, tous causés par le fait de poser une **animation** sur chaque
élément d'appel — et tous invisibles à la lecture du code :

1. `animation-name` sur un CTA **écrase son animation d'entrée** (les boutons de
   `partenaire-avyr.html` perdaient le `transform` de leur reveal) ;
2. animer `box-shadow` **écrase l'ombre propre** de l'élément (les boutons de
   `compte.html` perdaient leur élévation) ;
3. une base commune d'interlettrage **écrase celle de chaque titre** (le h1 de
   la billetterie passait de -.01em à -.02em et perdait 15 px de large).

La forme retenue — **une horloge sur `:root`, des consommateurs qui lisent une
variable** — n'écrase rien, et rend la mise en phase inutile : il n'y a qu'une
horloge. Les 30 lignes de synchronisation JS de R94/1 ont été supprimées.

Deux faits vérifiés **avant** d'écrire, qui ont changé l'implémentation :
Unbounded **n'a pas d'axe de largeur** (l'API Google Fonts répond HTTP 400 à
`wdth`) — la largeur passe donc par l'interlettrage, et on ne prétend pas animer
un axe qui n'existe pas ; et l'animation ne pouvait pas vivre sur le titre, car
`.reveal.in { animation: … }` est un raccourci qui l'aurait écrasée.

> **Limite d'environnement** : ce bac à sable n'émet **aucune requête vers Google
> Fonts** (`document.fonts` vide) — le site y rend toujours en police de repli, et
> une police de repli n'a pas d'axe variable. Le mécanisme est vérifié ; le rendu
> visuel de l'axe de graisse reste à juger dans un vrai navigateur.

---

## R95 — LA CONFIANCE

| Point | Livré | Mesures réelles |
|---|---|---|
| **R95/1** | Ajout au calendrier — **la fonction existait déjà**, vérifiée et mise aux normes | Téléchargement réel capturé et fichier relu : CRLF partout, `;` et `,` échappés, DTSTART/DTEND corrects, UID stable · **RFC 5545 §3.1** : ligne `DESCRIPTION` à **108 octets** → repli sur les **octets** (jamais au milieu d'un caractère UTF-8) → plus longue ligne **75 octets**, dépliage identique à l'original, **aucun accent cassé** |
| **R95/2** | Billet consultable hors ligne | **Défaut mesuré** : cache du service worker **vide** après la 1ʳᵉ visite (il ne contrôle pas la page qui l'installe), 12 entrées seulement à la 2ᵉ → préchargement de la coquille : **9 entrées dès la 1ʳᵉ visite** · hors ligne, page jamais visitée : rendue avec son CSS · **numéro du billet à l'écran** dans Mon profil |
| **R95/3** | Liste d'attente sur événement complet | Branchée sur le champ **réel** `stock === 'complet'` (aucun état inventé) · email invalide → refus · valide → enregistré et reconnu au retour · non complet → **aucun bloc** · **aucun chiffre fabriqué** (test cherchant « n personnes / inscrits / en attente » : rien) |

### La promesse que j'ai dû corriger dans mon propre texte

La première version de la liste d'attente annonçait « **Tu seras prévenu·e si une
place se libère** ». Aucun service d'envoi n'est branché (`FORM_ENDPOINT` vide) :
c'était exactement la *fonction annoncée mais absente* que R95 interdit. Le
message dit maintenant ce qui se passe vraiment, et porte la même note
« démo — transmission bientôt active » que tous les autres formulaires du site.

---

## Vérification finale du programme

- **Confinement** : R93 prouvé à **0 différence** sur les 52 combinaisons hors
  accueil. R94 est volontairement site-wide ; son empreinte hors accueil se
  limite à **`opacity`** (les badges qui respirent) — vérifié propriété par
  propriété sur la totalité du diff, pas sur son extrait.
- **LCP** : les 14 pages dans le budget de 2 500 ms, pire page `partenaires.html`
  à **1 368 ms**, accueil à **576 ms**.
- **Zéro erreur JS** sur les 56 combinaisons, à chaque dump du programme.

---

## R96 — LA LISIBILITÉ

| Point | Livré | Mesures réelles |
|---|---|---|
| **R96/1** | Le sol sous le ciel — le pied de page n'était pas peu lisible, **il était invisible** | loi Évin **2,42 → 8,75** · © **3,03 → 12,36** · liens **2,95 → 6,70** · label **2,69 → 8,83** · signature **6,46 → 14,81** · sombre : 6,92 à 18,79 · confinement **0 différence** |
| **R96/2** | Diagnostic de la signature **clos** + instrument immunisé contre le désynchronisme | La signature n'a **jamais** eu de défaut : 6,46 avant même R96/1. Le 2,86 de R95 était un artefact |
| **R96/3** | Les surfaces suivent l'encre : 7 cartes fantômes | avant **7** surfaces à fond clair portant du texte clair · après **0** · thème sombre : **0 défaut AA** sur tout l'accueil · confinement **0 différence** |

### Le diagnostic qui change tout : ce n'était pas un problème de contraste

Le ciel de La Traversée est une couche `position: fixed; z-index: 0`. Dans
l'ordre de peinture CSS, les éléments **positionnés** passent après le fond **et
le texte** des éléments non positionnés. Le ciel se peignait donc par-dessus tout
bloc de premier niveau resté statique.

Les sections y échappaient **par accident heureux** — `.section` porte déjà
`position: relative`. Quatre blocs ne l'avaient pas : le manifeste, le bandeau
défilant, les prochaines dates et **le pied de page**.

Capture à l'appui : au crépuscule en thème clair, le pied de page était
**intégralement invisible**, mention loi Évin comprise. Ce que l'audit lisait
comme « 2,42:1 » n'était pas du texte peu lisible — c'était **du ciel, mesuré à
la place d'un texte que personne ne voyait**.

Deux conséquences pour la décision du superviseur :

- **la piste « opacifier le verre » n'aurait rien résolu** : le verre était déjà
  sombre et correct, il n'était simplement pas peint. Le raisonnement structurel
  qui l'a fait préférer reste juste — et le remède retenu va plus loin dans le
  même sens : il **découple** en rendant le sol indépendant du ciel ;
- **la signature de marque n'avait aucun défaut** — la corriger aurait abîmé
  quelque chose de sain.

Le remède est celui que `.section` applique déjà : **`position: relative` seul**.
Pas de `z-index`, donc aucun contexte d'empilement créé, aucun effet de bord.
Vérifié : rendu identique à `position: relative; z-index: 1`.

### Quatrième désynchronisme d'instrument, et le dernier de sa famille

Faire défiler jusqu'à **chaque** élément avant de le capturer change le palier du
ciel entre deux mesures. Le signe qui a mis sur la voie : **un enfant relevait
« crème » quand son propre parent relevait « saumon »** — géométriquement
impossible. L'outil descend désormais par écrans et découpe toutes les boîtes
d'**une seule capture** : un instant, une image, une vérité.

Les quatre désynchronismes ont tous la même forme : comparer deux choses prises à
deux moments, ou dans deux référentiels différents.

### Ce qui reste ouvert en thème clair — deux horloges qui divergent

Le thème sombre est à **0 défaut**. Le clair conserve des cas d'une **autre
nature**, et je ne les ai pas traités faute de pouvoir les vérifier correctement
avec le contexte restant :

| Élément | Mesuré | Nature |
|---|---|---|
| `h3` « Prendre mes billets » | 1,06 | texte crème sur ciel encore doré |
| `p` « Accède à la billetterie » | 1,04 | idem |
| `span.event-door-cta` / `-tag` | 1,43 / 1,38 | idem |
| `a.nav-logo` | 1,00 | nav sur hero clair |
| `a.nav-link` | 4,09 / 4,47 | à la limite du seuil |

**Cause probable, à instruire :** §39 fait tourner **deux horloges découplées** —
le ciel s'interpole en **continu** au défilement, tandis que la bascule d'encre
suit des **paliers discrets**. Il existe donc une zone où le palier a déjà basculé
en `dusk` (encre crème) alors que le ciel peint est encore doré. Ce n'est pas un
réglage de couleur : c'est la jointure entre les deux horloges. La trancher
demande de décider laquelle fait autorité — un arbitrage d'architecture, pas une
correction de contraste.

---

## R97 — LA JOINTURE DES DEUX HORLOGES

| Point | Livré | Mesures réelles |
|---|---|---|
| **R97/1** | `tools/qa/lisibilite.mjs` — balayage **continu** de la lisibilité | pas de 25 % d'écran, une capture par pas · garde le **pire** rapport de chaque élément **et la progression où il survient** · option `--attente` : à 120 ms **84** défauts, à 600 ms **49** — **35 étaient des transitoires** de la transition de 300 ms du verre |

### ⚠ CE QUE LA MESURE A TROUVÉ, ET QUI DÉPASSE LE MANDAT DE R97

**La Traversée n'interpole pas. Elle avance par trois paliers.**

Vérifié par deux moyens indépendants et concordants :

1. **Luminance peinte du ciel**, balayée finement de 60 % à 90 % du défilement :
   constante à **L = 0,753** de 62 % à 74 %, puis **saut** à **L = 0,145** à 75 %,
   puis constante à nouveau. Aucune valeur intermédiaire sur 30 relevés.
2. **`background-image` calculé** de la couche de ciel, relevé à 10 positions :
   **trois valeurs distinctes en tout** — jour (0→32 %), doré (48→76 %),
   crépuscule (90→100 %). Les transitions sont des sauts, pas des rampes.

**La cause tient en un mot, et c'est un piège que §39 nomme lui-même.** Les
keyframes du ciel animent le **raccourci `background`** :

```css
@keyframes sky-traverse {
  0%   { background: linear-gradient(...); }   /* raccourci */
```

R92 avait identifié ce piège pour `animation` (deux bugs), et son propre
commentaire prévient : « Vaut aussi pour **`background`**, `transition`, `mask`,
`grid`. » La règle était écrite ; elle n'a pas été appliquée ici. Le composant
image d'un `background` animé en raccourci est traité en **discret**.

### Pourquoi cette découverte décide du lot, et pourquoi je ne tranche pas seule

Les trois hypothèses du superviseur ne sont **pas** indépendantes de ce fait —
elles en dépendent entièrement :

| Si le ciel… | H1 (une horloge) | H2 (un sol sous le texte) | H3 (encre continue) |
|---|---|---|---|
| **reste à paliers** (état actuel) | ✅ suffit — il suffit d'aligner la bascule d'encre sur les sauts réels du ciel | ✅ marche aussi | ❌ inutile et risqué |
| **devient continu** (raccourci corrigé) | ❌ **impossible** | ✅ **seule solution** | ❌ pire |

La raison du ❌ : avec un ciel réellement continu, sa luminance traverse la bande
**L ∈ [0,168 ; 0,243]** où **aucune encre** ne tient 4,5:1 — ni sombre
(`--ink-warm`, il faudrait L ≥ 0,243), ni crème (il faudrait L ≤ 0,168). Le
superviseur avait raison sur H3, et pour la raison exacte qu'il donnait ; mais le
même calcul condamne **aussi** H1 dès que le ciel devient continu. Aujourd'hui H1
fonctionne **uniquement parce que le ciel saute par-dessus cette bande** —
vérifié : **0 relevé sur 61** dans la bande morte.

**Ce n'est donc pas à moi de choisir.** « La Traversée reste continue » a été posé
comme non négociable et validé par Kily sur une maquette — or la mesure dit
qu'elle ne l'est pas aujourd'hui dans le code. Rendre le ciel réellement continu
est un **changement visuel** de ce que Kily a vu, et il **invalide** la piste que
le superviseur juge la plus solide. Les deux décisions sont couplées et
appartiennent au superviseur :

- **Option A — le ciel garde ses paliers** (aucun changement visuel) : on aligne
  la bascule d'encre et le verre sur les sauts réels du ciel (~40 % et ~83 % du
  défilement). C'est H1, exécuté sur l'horloge réelle. Corrige les 49 défauts
  structurels sans toucher à l'apparence.
- **Option B — le ciel devient vraiment continu** (`background-image` en propriété
  longue) : la Traversée gagne la douceur promise, mais **H1 devient impossible**
  et il faut H2 — un sol opaque sous le texte, ce qui réduit la visibilité du ciel
  à travers les sections. Deux gains qui se paient l'un l'autre.

### Les 49 défauts structurels, pour mémoire

Tous du même motif : **encre crème ou or sur fond clair**, entre 28 % et 86 % du
défilement. L'encre bascule aux **paliers de section** (IntersectionObserver, dès
28 %) alors que le ciel ne s'assombrit qu'à **75 %**. Les deux horloges ne sont pas
légèrement déphasées : elles sont à près de 50 points de défilement l'une de
l'autre.

### R97 — les deux variantes construites, à départager en regardant

| | **Variante A** — le ciel garde ses paliers | **Variante B** — ciel vraiment continu + sol constant |
|---|---|---|
| Mécanisme | une seule horloge : l'encre et le verre se déduisent de la **même progression** que le ciel, aux midpoints de ses keyframes (16 / 48 / 82 %) | 4 couches de ciel empilées dont on interpole l'**opacité** (mécanisme de la maquette) ; le verre garde un **composite constant** par thème, la bascule d'encre est **supprimée** |
| Défauts AA, thème **clair** (balayage continu, 600 ms) | **35** (contre 49 avant) | **24** (contre 49 avant) |
| Défauts AA, thème **sombre** | **0** | **0** |
| Ciel réellement continu ? | non — 3 paliers, inchangé | **oui** : 11 valeurs de luminance distinctes sur 12 relevés, de L=0,925 à 0,171 |
| Confinement | 0 différence sur les 13 autres pages | idem (derrière son attribut) |
| LCP accueil | 596 / 688 ms, budget 2 500 | idem |
| **Ce que ça enlève, honnêtement** | rien visuellement — mais la Traversée **reste saccadée**, ce que Kily croyait déjà continu | les sections **cessent de suivre le ciel** : la Traversée se voit dans les interstices et derrière, plus *à travers* le verre. En thème clair les sections restent claires jusqu'au bout |

**Le coût de B n'est PAS la transparence** — c'était la question du superviseur, et la
mesure y répond : un verre crème à 72 % au-dessus d'un ciel allant de L=0,93 à 0,01
donne un composite entre 0,93 et 0,46, soit **15:1 à 7,8:1** avec l'encre sombre. Il
n'a pas fallu opacifier davantage. Le coût est ailleurs : la perte du lien visuel
entre le verre et le ciel.

**Aucune des deux n'atteint 0 défaut en thème clair.** Les restants ne relèvent plus
de la jointure : ce sont des textes posés là où aucun verre ne les porte (nav sur
hero clair, portes d'événement à verre 5 %). C'est le prolongement de H2, et il
reste à faire quelle que soit la variante retenue.
