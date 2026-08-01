# Journal R101 — LA VÉRIFICATION CONTRE LE FICHIER

`maquettes/3-LUMIERE-DE-SCENE.html` est arrivé dans le dépôt (commit `69c9ffb`).
Les cinq lots précédents travaillaient sur un **résumé écrit** de ce fichier.

> **75 écarts trouvés et corrigés.** 63 en lisant le fichier, 12 de plus
> débusqués par l'instrument — des héritages du site qui avaient survécu.
> Plus **11 écarts tolérés**, chacun documenté et justifié.

## L'écart qui explique le plus

**`h2 em` est en BLEU CLAIR dans la maquette, pas en or.**

Tous les titres de l'accueil portaient un accent doré là où la maquette met la
lumière froide des projecteurs — sur quatre titres, à chaque écran. Aucune mesure
ne pouvait le dire : nos deux valeurs étaient cohérentes entre elles, elles
n'étaient simplement pas celles du contrat.

## Le changement d'instrument

`tools/qa/maquette.mjs` ne compare plus l'accueil à un **tableau tapé à la main**.
Il **sert la maquette**, la rend dans le même navigateur, au même viewport, et
compare les styles **calculés** des deux pages — 34 paires de sélecteurs × 34
propriétés.

> Un tableau tapé à la main hérite de toutes les erreurs de lecture de celui qui
> le tape. Le fichier, lui, ne peut pas se tromper sur lui-même.

Deux sources de bruit ont dû être neutralisées avant de conclure : les blocs
`.rev` de la maquette montent de 0 à 1 en une seconde (mesurés en vol : **0,016
contre 1**), et le bouton principal anime son anneau à 1,034 s (deux pages
échantillonnées à deux instants donnent deux `box-shadow` différents). État final
forcé, animations figées au même instant des deux côtés.

## Les 63 écarts lus dans le fichier

| Zone | Ce qui différait |
|---|---|
| **La base** | `body` à **17px/1.68** (site : 16px), couleur `--creme` |
| **Titres** | `h2 em` **bleu clair** (or) · `letter-spacing -.01em` · `h2` en `--creme` (blanc) · marges 24px |
| **Sur-titres** | **Plus Jakarta Sans 600** (Unbounded 700) · `line-height 1` · marge 20px |
| **Texte** | `.lead` en **clamp(17px,1.9vw,21px)** (1rem) · marge 30px |
| **Hero** | marque à **deux ombres** · `.sous` en PJS · `.tag` en **20ch** (26) · voile `::after` **absent** · zoom **34 s, 1.06→1.16** (26 s, 1→1.09) |
| **Boutons** | padding **17px 34px** · radius **999px** · **12.5px/.16em** · gap 10px · anneau **`phare` à 1,034 s** (drop-shadow) · liseré **.32** (.38) · `backdrop-filter` · hover **or** |
| **Plein cadre** | `isolation: isolate` · `z-index -2/-1` · `.dedans` **sans padding vertical** |
| **Dates** | carte en **flex colonne justifiée en bas, padding 30px** (positions absolues) · `.quand` **en or** (bleu) · `h3` **600 26px** (800 1.18rem) · **pastille en verre sombre à liseré crème** (liseré or) |
| **Écosystème** | `<b>`/`<span>` (h3/p) · padding **28px 24px** · survol bleu |
| **Pied de page** | fond **rgba(3,6,13,.86)** + `backdrop-filter` · `.f-in` **absent** · `.signe` en `-.05em/.88` · `.sante` **13px** + liseré |

## Les 12 héritages que seul l'instrument pouvait voir

| Écart | Sa règle |
|---|---|
| `.hero` `justify-content: center`, `overflow: hidden` | **le site a aussi une classe `.hero`** (style.css §hero) |
| `.btn` `position: relative`, `overflow: hidden`, `justify-content`, `::before` | **le site a aussi une classe `.btn`** (`syfir-ui/components.css` §35) |
| `footer` liseré **OR** au lieu de crème | `.page-home > footer` de R98/1-4 |
| `.lead` `max-width` **100 px trop étroit** | chaîne de repli des polices différente |
| `.f-in` marge auto **54 px au lieu de 74** | `.brand-sign` du site ajoutait son padding |
| `.sec position: relative`, `.tag margin-inline: auto` | **mes propres ajouts**, absents du contrat |

> **Deux collisions de noms de classe.** `.hero` et `.btn` existent dans le site
> *et* dans la maquette. Renommer sortirait du contrat ; on retire donc leurs
> effets **nommément, propriété par propriété**. C'est traquer la règle, pas la
> surcharger en aveugle.

## Les 11 écarts tolérés, et pourquoi

- **Le reset `img` du site** (`display:block; max-width:100%`), que la maquette
  n'a pas. **Inertie PROUVÉE, pas supposée** : la boîte rendue de
  `.hero-photo img` est **identique au pixel** des deux côtés — 1527×954 @−43,−27.
  Les largeurs de `.plein img` et `.date img` ne diffèrent que parce que la
  maquette a **3 dates** et l'accueil **4** (1440/3 = 480 contre 1438/4 = 359) :
  c'est du contenu, pas du style.
- **`minmax(min(290px,100%),1fr)`** au lieu de `minmax(290px,1fr)` : évite un
  débordement à 390 px, mesuré.
- **Le fond du body** : peint par la couche `.sky` (R98), pas par `body`.

## État

Confinement **0 différence** sur les 28 combinaisons hors accueil · contraste AA
**0 défaut** · **0 débordement** à 390 px · LCP **600 ms** / 2 500 · **0 erreur
JS** sur 30 · les trois acquis verts · les 4 badges « Exemple » toujours là.
