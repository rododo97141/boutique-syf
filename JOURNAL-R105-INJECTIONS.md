# R105 — LE FILM DANS LE HERO, ET CE QUE LE JAVASCRIPT AJOUTE

> « Il doit pas avoir la vidéo, ça doit être comme la maquette. » (Kily)

`script.js` injectait `videos/syfir-film-canva-web.mp4` dans le hero de
l'accueil, et `index.html` préchargeait son poster en `fetchpriority="high"`.
La maquette n'a **aucune vidéo** : son hero est une photo fixe à opacité .5
avec un zoom lent, rien d'autre.

C'est un survivant au sens exact du terme — présent d'un seul côté — et
**ma liste de R103 ne pouvait pas l'attraper** : elle comparait les DOM
rendus, mais je l'avais bâtie sur un relevé de classes et d'identifiants,
et surtout le film n'est déclaré **nulle part** en CSS. Il naît à
l'exécution. Les 102 couches de `maquette.mjs` n'y pouvaient rien non plus :
on ne compare que ce qu'on sait nommer.

## Ce qui se passait vraiment — mesuré, pas déduit

Dans ce conteneur, **le `<video>` n'apparaissait déjà pas dans le DOM** :
le hero ne contenait que `div.hero-photo` et son voile. Le gestionnaire
d'erreur d'`injectHeroVideo` retire le bloc quand aucune source ne décode,
et **les codecs H.264 sont absents de ce bac à sable**.

**Mais les deux fichiers étaient téléchargés quand même** — poster *et*
mp4 de ~9,5 Mo, tracés à la requête réseau. Sur une machine avec les
codecs, le film s'injecte et se peint par-dessus la photo. Je ne peux pas
observer ce chemin ici : je le déduis du code, et je le dis comme une
déduction, pas comme une mesure.

### Une correction de fait, au passage

L'élément LCP n'était **pas** le poster du film, malgré ce que déclarait
le commentaire du `<head>`. Mesuré avant retrait, trois passes :
`h1.marque` à chaque fois. Le commentaire décrivait une intention, pas la
réalité — et personne ne l'avait vérifiée depuis R90.

## Le retrait

- l'appel `injectHeroVideo($('.hero#accueil'), …)` est retiré ;
- le `<link rel="preload">` du poster est retiré du `<head>` ;
- **rien ne le remplace**, et c'est délibéré : la photo du hero est un
  `<img>` écrit dans le HTML, donc trouvée par le scanner de préchargement
  au premier octet — un `preload` n'avancerait rien, et la maquette n'en a
  aucun.

**LE FILM N'EST PAS SUPPRIMÉ.** `videos/syfir-film-canva-web.mp4` et son
poster restent dans le dépôt. La fonction `injectHeroVideo` est
**conservée telle quelle**, prête pour son futur hôte (`syf-tv.html`) :
on retire l'appel, pas l'outil.

### LCP — remesuré, trois passes de chaque côté

| | passe 1 | passe 2 | passe 3 | médiane |
|---|---:|---:|---:|---:|
| avant | 520 ms | 596 ms | 604 ms | **596 ms** |
| après | 320 ms | 464 ms | 420 ms | **420 ms** |

**−176 ms**, et **zéro requête vers `videos/`** là où il y en avait deux.
Élément LCP inchangé : `h1.marque` des deux côtés. Budget 2500 ms.

---

# L'INVENTAIRE DE CE QUE LE JAVASCRIPT AJOUTE À L'ACCUEIL

Demandé complet **avant** tout autre retrait. Je ne retire rien d'autre
que la vidéo dans ce lot.

**Deux moyens indépendants.**
*Moyen 1 — différence de DOM* : la page est rendue **sans JavaScript**,
puis **avec**, et les deux arbres sont comparés signature par signature.
Ce qui apparaît dans le second et pas dans le premier est, par
construction, né du script. **40 signatures.**
*Moyen 2 — instrumentation* : les fabriques (observateurs, minuteries,
écouteurs) sont remplacées **avant tout script**, et on compte ce qui est
réellement armé.

## A. Ce qui est LÉGITIME — la maquette a la même chose, autrement produite

| Ce que le JS crée | Pourquoi ce n'est pas un survivant |
|---|---|
| `a.date` ×4 et tout leur contenu (`img`, `span.puce`, `div.quand`, `h3`, `p.ou`) | La grille de dates. La maquette l'écrit en dur, le site la rend depuis `events-data.js`. **Même résultat, même classes** — `maquette.mjs` les compare et trouve 0 écart. |
| `.img-fade` puis `.img-in` ×3 | Fondu d'arrivée des images. |
| retrait de la classe `vide` sur `#nextEvents` | L'état vide de R99 se lève quand il y a des dates. |

## B. Ce qui est un SURVIVANT DÉJÀ CONNU — mais dont on apprend l'origine

| Ce que le JS crée | Statut |
|---|---|
| **`div#megaMenu.mega`** et **tout son sous-arbre** (~30 signatures : `.mega-top`, `.mega-logo`, `.mega-search`, `#megaSearch`, `#megaClose`, `.mega-body`, `.mega-side`, `.mega-side-group` ×2, `.mega-side-head` ×2, `.mega-content`, `#megaResults`, `#megaPanels`, `.mega-row`, `.mega-row-head`, `.mega-envies`, `.mega-envie` ×4, et 15 liens) | Groupe C de la liste R103. **Nouveau fait : il est entièrement construit par le JS**, il n'existe pas une ligne dans `index.html`. C'est ce que `#searchBtn` ouvre — le bouton que tu as gardé. |
| `span.badge-demo` ×4 | Les dates de démonstration, déjà **À RETIRER AVANT PUBLICATION** (commit `f20ea5a`). |
| `p.cart-empty`, `#deleteProfileBtn`, `.form-demo-note` | Contenus de l'espace client et du formulaire, groupes D et E de la liste R103. `#deleteProfileBtn` porte une obligation RGPD. |

## C. Ce qui est un SURVIVANT NOUVEAU — trouvé par ce lot

### `nav.scrolled` — la barre se rétracte au défilement

**La seule vraie découverte de l'inventaire.** Au chargement la barre n'a
pas de classe ; après défilement, le JS lui pose `scrolled`. Mesuré des
deux côtés :

| | classe en haut | après défilement | ce qui change |
|---|---|---|---|
| **accueil** | *(aucune)* | **`scrolled`** | **`height: 72px → 64px`** |
| **maquette** | *(aucune)* | *(aucune)* | **aucune propriété** |

La barre de la maquette ne bouge jamais. Celle de l'accueil maigrit de 8 px.

**Pourquoi aucun instrument ne pouvait le voir** : ce n'est ni un élément
ni un pseudo-élément, c'est **une classe posée après un défilement**, et
`maquette.mjs` mesure à hauteur zéro. Trois angles morts successifs —
`::before` (R104), injection JS (ce lot), **état déclenché par le
défilement** — et le troisième vient d'être ouvert.

**Sa source est une cinquième collision**, et sur un **élément nu**, pas
sur une classe : `style.css:4440` pose `nav.scrolled { height: calc(var(--nav-h) - 8px) }`
sans scope. C'est exactement la limite que j'avais signalée en R104 —
« l'inventaire porte sur des noms de classe ; la maquette style aussi des
éléments nus » — et elle vient de produire son premier défaut.

**Je ne l'ai pas retiré** : tu as demandé la liste avant tout autre
retrait. C'est une ligne de CSS scopée quand tu trancheras.

## D. La mécanique armée — et une machine qui tourne à vide

| | Accueil | Maquette |
|---|---|---|
| `requestAnimationFrame` | 31 appels | l'horloge `--p`, même forme |
| `IntersectionObserver` | **1** (`script.js:342`) | **1** (les blocs `.rev`) |
| `MutationObserver` · `ResizeObserver` · `setInterval` | **0** · **0** · **0** | 0 |
| `setTimeout > 400 ms` | **1** (1600 ms, `script.js:369`) | 0 |
| Écouteurs `window`/`document` | `scroll` ×3 · `keydown` ×2 · `hashchange` ×2 · `click` ×2 · `load` ×2 · `visibilitychange` · `scrollend` · `resize` | `scroll`, `resize` |

**L'observateur et la minuterie de 1600 ms servent le mécanisme
`.reveal` — et l'accueil n'a plus aucun `.reveal` depuis R100.** Ils
s'arment et n'observent rien.

Ce n'est pas un défaut : c'est **le manque déjà signalé en R103**, vu par
l'autre bout. La maquette a 22 blocs `.rev` qui montent à l'entrée ;
l'accueil n'en a plus. **La machinerie complète est intacte et prête** —
observateur, garde-fou d'ancre, filet à 1600 ms. Rétablir les apparitions
est une affaire de classes à reposer, pas de code à réécrire.

## E. Ce que le JavaScript RETIRE

`nav#nav` perd sa signature nue au profit de `nav#nav.scrolled` (même
élément, classe ajoutée). `noscript > style` disparaît, ce qui est le
comportement normal de `<noscript>` quand le JS est actif.

---

# VÉRIFICATIONS DU LOT

| Instrument | Résultat |
|---|---|
| `maquette.mjs` — 102 couches × 34 propriétés, 2 tailles | **0 écart**, 11 tolérés |
| `lcp.mjs` (mobile, CPU ×4) | **596 → 420 ms** en médiane · élément `h1.marque` |
| Requêtes `videos/` | **2 → 0** |
| `acquis.mjs` | ✓ les trois · loi Évin **19,36:1** sur le pixel peint |
| `soiree.mjs` | ✓ deux moyens concordants |
| `debordement.mjs` (390 px) | ✓ **0** élément qui dépasse |
| `contraste.mjs` (AA) | ✓ **0** défaut |
| `ui-dump.mjs` | 30 combinaisons, **0 erreur JS** |
| `ui-diff-hors-index.mjs` (r104 → r105) | ✓ **0 différence** sur 28 combinaisons hors accueil |

Captures : `tools/qa/captures/r105-{accueil,maquette}-{desktop,390}.png`.

**PR #13 reste en Draft. Les 13 autres pages n'ont pas été touchées.
Rien d'autre que la vidéo n'a été retiré.**
