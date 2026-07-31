# Passation — après R93, R94 et R95

> **Ce document a servi au relais R93. Les trois lots sont livrés.**
> Ce qui suit en tête est l'état à la fin de R95 ; le corps d'origine
> (contexte, pièges, doctrine) reste valable et suit plus bas.

## Où en est le programme

R93 (Le Portail), R94 (le pouls et la typographie cinétique) et R95 (la
confiance) sont **livrés et poussés** sur `claude/r73-loi-evin`. Le détail des
mesures point par point est dans **`JOURNAL-R93-R95.md`**, qui est le document
à lire en premier.

**Les trois angles morts du relais sont levés :**

- **A — la chaîne de mesure** est désormais **dans le dépôt**, en `tools/qa/`
  (décision du superviseur en R93). Elle a été **calibrée contre le réel** :
  six défauts de l'instrument ont été trouvés et corrigés, tous documentés dans
  `tools/qa/README.md`. Un instrument non calibré ne prouve rien.
- **B — la description de PR #13** reste **périmée** : elle couvre R73 → R82.1.2
  et ignore désormais R83 → R95. Le superviseur a demandé de la réécrire **en fin
  de programme, sans passer Ready**. **C'est le premier travail à faire.**
- **C — l'écart de branche** : réglé. La bonne branche est `claude/r73-loi-evin`.

## ⚠ ÉTAT APRÈS R97 — LES DEUX VARIANTES SONT CONSTRUITES, KILY DOIT CHOISIR

Les deux variantes sont implémentées, **un commit chacune, séparables** :
`R97/A` (actif par défaut) et `R97/B` (derrière `data-r97="B"`, posé depuis
`localStorage.syfir-r97`). Captures de comparaison dans
**`tools/qa/comparaison-r97/`** — temporaires, à supprimer dès la décision.

| | A — paliers conservés | B — ciel continu + sol constant |
|---|---|---|
| Défauts AA clair | 35 | **24** |
| Défauts AA sombre | 0 | 0 |
| Ciel continu | non | **oui** (11 valeurs sur 12) |
| Coût | la Traversée reste saccadée | les sections ne suivent plus le ciel |

**Reste à faire quelle que soit la variante** : les défauts restants ne relèvent
plus de la jointure mais de textes sans verre sous eux (nav sur hero clair, portes
d'événement à verre 5 %) — c'est H2, à mener après la décision.

## (archive) ⚠ ÉTAT APRÈS R97 — UNE DÉCISION ATTEND LE SUPERVISEUR

**R97 n'est pas terminé, et c'est délibéré.** L'instrument demandé est livré
(`tools/qa/lisibilite.mjs`, balayage continu) ; il a trouvé un fait qui **dépasse
le mandat du lot** et qui conditionne la solution. Aucune des trois hypothèses
n'a été appliquée : les appliquer sans trancher ce fait aurait été un pari.

### Le fait

**La Traversée n'interpole pas. Elle avance par trois paliers.** Vérifié par deux
moyens indépendants : la luminance peinte du ciel est constante puis **saute**
(0 valeur intermédiaire sur 30 relevés), et le `background-image` **calculé** ne
prend que **trois valeurs** sur tout le parcours.

**Cause, en une ligne :** les keyframes du ciel animent le **raccourci
`background`** (`style.css`, `@keyframes sky-traverse`). C'est le piège que R92 a
identifié pour `animation` — et son propre commentaire prévient qu'il vaut aussi
pour `background`. La règle était écrite, elle n'a pas été appliquée là.

### Pourquoi ça décide de tout

| Si le ciel… | H1 (une horloge) | H2 (un sol) | H3 (encre continue) |
|---|---|---|---|
| **reste à paliers** (état actuel) | ✅ suffit | ✅ marche | ❌ |
| **devient continu** | ❌ **impossible** | ✅ **seule solution** | ❌ |

Un ciel réellement continu traverse la bande **L ∈ [0,168 ; 0,243]** où **aucune
encre** ne tient 4,5:1. H1 ne fonctionne aujourd'hui **que parce que le ciel saute
par-dessus cette bande** — vérifié, 0 relevé sur 61 dedans.

### Les deux options, couplées, à trancher par le superviseur

- **A — garder les paliers** (aucun changement visuel) : aligner la bascule
  d'encre et le verre sur les sauts réels du ciel (~40 % et ~83 % du défilement).
  C'est H1 sur l'horloge réelle. Corrige les 49 défauts structurels.
- **B — rendre le ciel vraiment continu** (`background-image` en propriété
  longue) : la Traversée gagne la douceur que Kily croit avoir validée, mais H1
  devient impossible et il faut H2 — un sol opaque sous le texte, donc moins de
  ciel visible à travers les sections.

Le superviseur a posé « la Traversée reste continue » comme non négociable en
croyant décrire l'existant. La mesure dit le contraire. **C'est sa décision, pas
la mienne.**

### Ce qui est mesuré et prêt à servir, quelle que soit l'option

- **49 défauts structurels** (thème clair), tous du même motif : encre crème ou or
  sur fond clair, entre 28 % et 86 % du défilement. L'encre bascule aux paliers de
  **section** dès 28 %, le ciel ne s'assombrit qu'à **75 %** — près de 50 points
  d'écart.
- **35 défauts transitoires** en plus, dus à la transition de 300 ms du verre
  pendant laquelle l'encre a déjà basculé. Ils disparaissent en mesurant à
  600 ms. Les corriger demande de faire transiter l'encre comme le verre — non
  fait : la seule façon propre passe par des propriétés de transition qui
  écraseraient celles des liens au survol (encore le piège du raccourci).
- Le thème **sombre est à 0 défaut** et le reste dans les deux options.

## Mise à jour après R96 (LA LISIBILITÉ)

**R96 est livré.** Les trois points du mandat sont traités et l'angle mort B est
levé : la description de PR #13 a été réécrite pour couvrir R73 → R96 (titre et
corps uniquement ; **la PR reste en Draft**).

Le diagnostic de R96 a corrigé deux conclusions de R95 :

- le pied de page **n'avait pas un problème de contraste** : le ciel, couche
  `position: fixed`, se peignait **par-dessus** tout bloc non positionné. Le pied
  de page était **intégralement invisible**. La piste « opacifier le verre »
  n'aurait rien résolu — le verre était déjà sombre, il n'était pas peint ;
- **la signature de marque n'a jamais eu de défaut** (6,46:1 avant même la
  correction). Le 2,86 était un artefact d'instrument.

État mesuré à la fin de R96 : thème **sombre à 0 défaut AA** sur l'accueil,
confinement **0 différence** sur les 13 autres pages, 0 erreur JS sur les 56
combinaisons, LCP des 14 pages dans le budget.

### Le seul chantier prioritaire restant : la jointure des deux horloges

En thème clair subsistent 5 éléments entre 1,00 et 4,47 — et ils ne sont **pas**
de même nature que ceux corrigés. §39 fait tourner deux horloges découplées : le
ciel s'interpole en **continu** au défilement, la bascule d'encre suit des
**paliers discrets**. Il existe donc une zone où le palier a basculé en `dusk`
(encre crème) alors que le ciel peint est encore doré.

**Ce n'est pas un réglage de couleur : c'est un arbitrage d'architecture** —
décider quelle horloge fait autorité, ou faire suivre l'encre en continu comme le
ciel. Ne pas traiter ça comme une correction de contraste ponctuelle : ce serait
recréer la matrice que R96 a précisément évitée.

Le détail est en fin de `JOURNAL-R93-R95.md`.

## Ce qui attend la prochaine session, par ordre de priorité

1. **La jointure des deux horloges en thème clair** (voir ci-dessus) — le seul
   chantier de lisibilité restant, et c'est un arbitrage d'architecture.
2. ~~Réécrire la description de PR #13~~ — **fait en R96**.
3. ~~La signature de marque~~ — **aucun défaut, diagnostic clos en R96**.
4. ~~Les 5 défauts préexistants de l'accueil~~ — **traités en R96** : ils
   relevaient tous des deux mêmes causes structurelles (ciel peint par-dessus,
   surfaces qui ne suivaient pas l'encre).

## Le régime de gouvernance en vigueur

Le superviseur a délégué la validation : **on ne l'attend plus entre les lots**.
On ne s'arrête que dans trois cas — LISTE ROUGE, mesure qui révèle un problème
qu'on ne sait pas trancher seul, ou approche de la limite de contexte (auquel cas
on écrit la passation **avant** de manquer de place).

**VERT** (corriger et signaler) : défauts objectifs et mesurables.
**ORANGE** (corriger dans un commit préfixé `HORS-MANDAT —`, un par correction) :
tout ce qui touche un texte visible, un comportement d'interface, une ergonomie.
**ROUGE** (jamais seul) : PR en Ready ou fusionnée · `FORM_ENDPOINT`, Shotgun,
newsletter · `avyr-site/` · inventer équipe, artiste, témoignage ou logo · visuel
produit hors `partenaire-avyr.html` · mention d'alcool ou affirmation juridique ·
dépendance ou étape de build · supprimer une fonctionnalité existante.

> **La contrepartie de cette liberté, et elle a payé :** ne jamais déclarer un
> défaut sur la foi d'un seul instrument. Vérifier par un second moyen
> indépendant, et le nommer. Sur R93-R95, cette règle a évité **six** fausses
> corrections — et c'est elle qui a fait trouver les vrais défauts.

## Ce que ces trois lots ont appris, et qui resservira

- **Le raccourci `animation` écrase ce qu'on vient d'écrire.** Vrai en R92, encore
  vrai ici : il a tué la typographie cinétique sur les titres (`.reveal.in`), et
  poser une animation sur un CTA lui a fait perdre son entrée. **La forme qui ne
  casse rien : une horloge sur `:root` qui anime une VARIABLE, et des éléments
  qui la consomment.** Rien n'est écrasé, et la mise en phase devient une
  propriété de construction plutôt qu'un problème à résoudre.
- **Animer `box-shadow` détruit l'ombre propre d'un élément** ; `filter:
  drop-shadow` se compose par-dessus.
- **Imposer une valeur de base commune** (interlettrage) écrase celle de chaque
  élément : passer par un **delta**.
- **Une media query n'ajoute pas de spécificité** : une règle `:root` déclarée
  après un bloc `prefers-reduced-motion` l'emporte sur lui.
- **Zone morte temporelle** : un bloc qui lit une constante déclarée plus bas dans
  le même module casse tout, silencieusement. Deux fois sur R93.
- **`transitionend` remonte depuis les enfants** — filtrer sur la cible ET la
  propriété.
- Sur une timeline de défilement, **`animation-duration: auto`** ; une durée finie
  fige l'animation à son état de départ.

## Deux limites de cet environnement, à ne pas reprendre pour des bugs

- **Aucune requête vers Google Fonts** n'est émise ici (`document.fonts` vide) :
  le site rend toujours en police de repli, et une police de repli n'a pas d'axe
  variable. Le rendu de la graisse variable ne peut pas être jugé dans ce bac à
  sable.
- **Pas de codecs H.264** : le film de marque est injecté puis retiré par le repli
  poster documenté en R91. On vérifie la **tentative** d'injection, pas la lecture.

---

# Passation — R93 « Le Portail »

Document écrit à la clôture de R92, pour une **session neuve**. R93 demande
du Web Audio, un piège de focus et un arbitrage de LCP : trois sujets qui ne
pardonnent pas l'approximation. Tout ce qui suit est établi et validé — rien
ici n'est à redécouvrir.

---

## 1. Ce que R93 doit faire (réponses déjà données par le superviseur)

**LE PORTAIL est un ÉLÉMENT D'INTERFACE à l'arrivée sur l'accueil.** Pas une
transition entre pages. Les View Transitions cross-document sont hors
périmètre (peut-être R95, décision plus tard).

À la **première visite** de `index.html` : un voile d'accueil sobre — fond
nuit, marque SYFIR avec son reflet, invitation « Entrer dans la fête » qui
pulse, et un lien discret « entrer sans le son ».

- Clic sur **Entrer** → le voile se lève en fondu, le film démarre, le son monte.
- Lien discret → le voile se lève, **pas de son**.
- Le choix est **mémorisé en `localStorage`**. Aux visites suivantes : pas de
  voile, arrivée directe sur le site, avec le toggle son disponible dans la nav.

**LE SON.** Jamais d'autoplay — il ne démarre QUE sur le clic explicite.
Montée en fondu par rampe de gain Web Audio sur ~2,5 s ; descente en fondu à
la coupure. Toggle de coupure **visible et persistant** dans la nav, état
mémorisé.

**Contenu sonore v1 : AUCUN fichier audio.** L'ambiance est générée
procéduralement — percussion douce à 116 BPM type ka (oscillateur grave +
frappe filtrée) et houle d'océan en bruit filtré avec LFO lent. Zéro asset,
zéro question de droits, zéro poids réseau. **Prévoir le point d'insertion**
d'un vrai fichier d'ambiance, que Kily validera plus tard.

Volume maître modéré, jamais brutal.

**Garde-fous.** En `prefers-reduced-motion` ou Save-Data : le voile devient une
**image fixe avec le bouton**, sans animation ni pulsation, et rien ne démarre
côté son.

**HORS PÉRIMÈTRE, confirmé** : la Traversée n'est PAS étendue aux autres pages.
Elles gardent leur système à deux thèmes actuel. Pas d'état partagé entre
pages, pas de continuité narrative multi-pages.

---

## 2. Les trois points à instruire DANS le plan, avant d'écrire

Identifiés à la fin de R92, non résolus, et ils changent l'architecture :

1. **Le voile et le LCP.** Un voile plein écran au-dessus du hero devient
   l'élément LCP à la première visite. Le budget est LCP < 2,5 s mobile
   (R92 mesure aujourd'hui **504 ms** avec CPU bridé ×4 — il y a de la marge,
   mais elle est à protéger). Vérifier si le voile *améliore* le LCP (il est
   plus simple que le poster) ou le dégrade, et cadrer son rendu pour qu'il
   soit peint **sans attendre ni police ni image**.

2. **Le voile et le piège de l'accessibilité.** Un voile bloquant doit piéger
   le focus, être annoncé correctement, et rester **échappable au clavier** —
   sinon c'est une porte fermée pour un lecteur d'écran.

3. **Le voile et La Traversée.** À la levée du voile on arrive au palier
   `day` : la transition doit être **continue**, pas un saut de la nuit du
   voile au plein jour de l'accueil.

---

## 3. Où est la connaissance dans le dépôt

| Fichier | Ce qu'il porte |
|---|---|
| `CLAUDE.md` | La loi du dépôt : design system, règles impératives, lexique de marque |
| `DOCTRINE-SYFIR.md` | Identité, politique d'âge, rôle de SYFIR, sélection des partenaires |
| `style.css` **en-tête §39** | Architecture complète de La Traversée : les deux horloges découplées, la table d'intégration des thèmes, la règle du raccourci `animation`, la traçabilité des commits R92 |
| `syfir-ui/README.md` | Ordre de chargement, les 3 cas où une règle reste dans `style.css`, **§ Pièges de cascade appris à la dure** |
| `script.js` §46 | Paliers du ciel (IntersectionObserver, `resolveStage`) |
| `script.js` §47 | Repli requestAnimationFrame sans scroll-timeline |
| `script.js` §48 | Mode économe (`data-econome`) |

---

## 4. Deux pièges qui ont coûté cher sur R92

**A — Le raccourci `animation` réinitialise ce qu'on vient d'écrire.**
Deux bugs dans le lot (`animation-timeline` effacée en R92/1, `animation-delay`
en R92/6). Règle inscrite dans l'en-tête §39 et le README de `syfir-ui` :
**propriétés longues uniquement**. Vaut aussi pour `background`, `transition`,
`mask`, `grid`.

**B — L'accueil GRANDIT pendant qu'on le mesure.** Les sections
`content-visibility: auto` ne déclarent leur vraie hauteur qu'en approchant du
viewport. Conséquences constatées **quatre fois** sur des sondes différentes :
scroller vers une hauteur mesurée une seule fois n'atteint jamais le bas ; et
même « hauteur stable sur 3 tours » ne suffit pas — la stabilité est
transitoire. **Le motif qui marche** (dans `scratchpad/r92-econome-ciel.mjs`) :
descente progressive + hauteur stable, PUIS réancrage jusqu'à
`scrollY / max >= 0.995`.

> **Corollaire de méthode, le plus important :** un test qui vérifie qu'une
> propriété est *déclarée* ne prouve rien. Le test du socle R92/1 lisait
> `animationName` et `animationTimeline`, passait au vert, et la traversée
> était cassée. Mesurer le **résultat** — la couleur d'arrivée du ciel, le
> retard réel de chaque étoile, l'opacité échantillonnée sur un cycle —
> jamais le câblage.

---

## 5. Les outils de mesure (hors dépôt, `scratchpad/`)

| Script | Rôle |
|---|---|
| `ui-dump.mjs <label>` | Styles calculés, 14 pages × 2 thèmes × 2 viewports = 56 combinaisons |
| `ui-diff-hors-index.mjs <a> <b>` | **Preuve de confinement** : index exclu, 0 différence exigée sur les 13 autres pages |
| `r92-contraste.mjs` | Contraste AA — compose ciel + verre + cartes, mesure les fonds photo au 90ᵉ centile |
| `r92-lcp.mjs` | LCP mobile au `PerformanceObserver` + sweep 14 pages |
| `r92-{socle,repli,etoiles,brillantes,filantes,guirlandes,eclat,econome}.mjs` | Un par point de R92 |

Référence de comparaison actuelle : dump **`r92-10-final`**.

⚠ **Le serveur local (`python3 -m http.server 8099`) meurt régulièrement** —
le vérifier avant chaque cycle. Et **ne jamais éditer un fichier pendant qu'un
dump tourne** (erreur commise une fois en R92/7, signalée dans le commit).

---

## 6. Contraintes permanentes

- Un commit par point · diff strict · **PR #13 en Draft, jamais Ready, jamais mergée**
- Vanilla : zéro dépendance, zéro build
- L'or en détail, jamais en masse — **seuils mesurés** : point ≤ 4 px,
  halo ≤ 12 px, croix ≤ 24 px, ampoule ≤ 6 px
- Éclat furtif — **seuil mesuré** : visible ≤ 10 % du cycle (R92 : 2,5 %)
- `prefers-reduced-motion` respecté ; Save-Data allégé
- **On coupe le mouvement, pas le décor** (principe R92/10)
- Ne pas activer `FORM_ENDPOINT` · ne pas brancher Shotgun ni la newsletter ·
  ne pas toucher `avyr-site/` · ne pas créer de photos d'équipe ou d'artistes
  (**il n'y a pas d'équipe, Unity 141 est le seul artiste réel — cette absence
  est la configuration correcte**)

---

## 7 bis. ⚠ Ce que ce document NE PEUT PAS tenir — à lire en premier

Trois angles morts identifiés **après** la première rédaction. Ils sont ici
parce qu'ils ne vivaient jusque-là que dans une conversation, c'est-à-dire
nulle part.

### A. La chaîne de mesure est HORS DÉPÔT et va disparaître

La section 5 liste les outils comme s'ils existaient. **Ils vivent dans
`/tmp/…/scratchpad/`, un répertoire éphémère détruit avec la session.** Une
session neuve n'aura ni `ui-dump.mjs`, ni `ui-diff-hors-index.mjs`, ni
`r92-contraste.mjs`, ni `r92-lcp.mjs`, ni les huit tests par point — **ni le
dump de référence `r92-10-final`**, donc aucune base de comparaison.

C'est le risque le plus sérieux du relais : le harnais de confinement est la
preuve centrale de R91 et R92, et il repart de zéro.

**Recommandation, décision à prendre par le superviseur :** committer le
harnais dans le dépôt (par exemple `tools/qa/`, exclu du déploiement Pages).
Non fait unilatéralement — ajouter un répertoire d'outillage à un site vanilla
est une décision d'architecture, pas un détail d'intendance.

Si la décision est « non », la session neuve doit savoir qu'elle **reconstruit
le harnais avant de pouvoir prouver quoi que ce soit**, et que ses premières
mesures n'auront pas de référence antérieure. Le motif de chaque outil est
décrit en section 5 et les pièges en section 4 : c'est reconstructible, mais
ce n'est pas gratuit.

### B. La description de PR #13 est périmée d'une trentaine de commits

Elle couvre R73 → R82.1.2 et annonce « QA finale SHA `b6d35e9` ». **Elle ne
dit rien de R83 à R92** — signature de marque, doctrine, rôle de SYFIR,
sélection des partenaires, retrait des visuels AVYR, film de marque,
bibliothèque `syfir-ui/`, et toute La Traversée.

Quelqu'un qui lit la PR aujourd'hui se trompe sur ce qu'elle contient. Une
proposition de nouveau titre et de nouvelle description avait été demandée en
début de parcours, sans jamais être rédigée. **À faire avant toute revue
sérieuse** — et sans marquer la PR Ready pour autant.

### C. L'écart de branche

L'environnement d'exécution a désigné `claude/syfir-pr-conflicts-nd6opg` comme
branche de travail, alors que **tout le travail vit sur
`claude/r73-loi-evin`**, qui est la branche suivie par PR #13. La première
n'existe qu'en local, sans remote et sans PR.

Une session neuve recevra peut-être la même désignation. **La bonne branche est
`claude/r73-loi-evin`** — ne pas ouvrir une seconde PR.

## 7. Points ouverts hérités

- **5 défauts de contraste préexistants** sur l'accueil, antérieurs à R92 et
  hors de son mandat : `button.chip`, `em`, `h3`, `p.eyebrow.eyebrow-light`,
  `p.section-intro.intro-light`. Une passe dédiée reste à décider.
- Placeholders `[À COMPLÉTER]` / `[À CONFIRMER]` dans
  `LEGAL-DATA-REQUIRED.md`, `LEGAL-RESPONSIBILITIES.md` et les pages légales.
- Validation juridique externe des textes AVYR : non faite.
- Vérification visuelle du film de marque sur un vrai navigateur : le Chromium
  de test n'a pas les codecs H.264 propriétaires, le repli poster documenté
  se déclenche toujours. À faire par Kily.
