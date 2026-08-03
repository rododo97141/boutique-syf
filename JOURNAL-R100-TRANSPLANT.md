# Journal R100 — TRANSPLANTATION, PAS TRADUCTION

Quatrième « toujours pas » de Kily. La cause n'était pas les valeurs : c'était
que l'accueil portait **les classes DU SITE** auxquelles on appliquait les
valeurs de la maquette.

> `home-hero`, `manifesto`, `next-events`, `section-dark`, `eco-grid`,
> `container`, `reveal`, `rb-card`… chacune traîne des centaines de lignes de
> CSS hérité — paddings, max-width, arrondis, fonds, ombres, `aspect-ratio`.
> **Bonne structure, mauvaise peau.**

## Ce qui a changé de méthode

L'accueil utilise désormais **les classes de la maquette**, et les anciennes ont
été **retirées du markup — pas surchargées**. Une surcharge laisse vivre
l'héritage, et l'héritage finit toujours par gagner quelque part.

| Bloc | Classes de la maquette |
|---|---|
| 1 | `header.hero` > `.hero-photo>img` · `.marque` `.sous` `.tag` `.actions` > `.btn.btn-1` `.btn.btn-2` |
| 2 | `section.sec` > `.eyebrow` `h2` `.lead` |
| 3 | `section.plein` > `img` · `.dedans` > `.bloc` |
| 4 | `section.sec` (titre seul) puis `div.dates` **hors** > `a.date` > `img` `.puce` `.quand` `h3` `.ou` |
| 5 | `section.sec` > `.eco` > `.c` × 6 |
| 6 | `footer` > `.signe` `.sante` |

Le rendu JS des dates a été réécrit : il n'émet plus **aucune** classe du site —
plus de `.rb-card`, qui traînait `aspect-ratio: 3/4`, `border-radius`,
`box-shadow` et un overlay.

## Le tableau de conformité — `tools/qa/maquette.mjs`

**59 sélecteurs/propriétés relevés sur le style CALCULÉ de l'élément réel**, aux
deux tailles. Pas la déclaration : ce que le navigateur a résolu — clamp calculés,
var substituées, cascade tranchée.

**Résultat : 59/59 conformes en desktop, 59/59 à 390 px.**

Les quatre valeurs qui font l'allure, mesurées :

| | attendu | mesuré |
|---|---|---|
| `.dates` gap | 2px | **2px** |
| `.dates` fond (le filet) | rgba(238,242,248,.1) | **rgba(238, 242, 248, 0.1)** |
| `.date` min-height | 400px | **400px** |
| `.date` border-radius | 0 | **0px** |
| `.plein` hauteur | ≥ 96vh | **oui** |
| `.plein img` opacity / position | .56 / absolute | **0.56 / absolute** |
| `.hero` display / place-items | grid / center | **grid / center** |
| `.hero` hauteur rendue | 100 % de l'écran | **100 %** |

## Les deux cases fausses, et ce qu'elles ont appris

### 1. Un conflit que je m'étais infligé moi-même

`.hero` mesurait **145 %** de l'écran (1302 px pour une fenêtre de 900) et
`.hero-photo img` sortait en `static`.

Cause : **ma propre règle** `.page-home .hero > div` (spécificité 0-3-1) écrasait
`.page-home .hero-photo` (0-2-0) et forçait `position: relative`. La photo
repassait **dans le flux** et poussait le hero. Le hero n'était plus un écran.

> La leçon vaut pour l'héritage du site **comme pour le mien** : une règle plus
> spécifique gagne, d'où qu'elle vienne. Écrire un bloc neuf ne protège pas d'un
> conflit — seule la mesure le montre.

### 2. Une erreur dans mon contrat de vérification, pas dans la page

`.signe` attendu à 46,8 px à 390 px, mesuré 50 px. `clamp(50px, 12vw, 150px)` :
12vw = 46,8 px, mais **le minimum de 50 px l'emporte**. J'avais calculé le `vw`
sans appliquer la borne basse. **C'est le CSS qui avait raison.**

> Un instrument peut être faux dans les deux sens. Celui-ci accusait la page.

## Ce qui n'a pas bougé

Portail, pouls, ciel à trois couches, faisceaux, brume, dates de démo avec leur
badge « Exemple ». **Confinement : 0 différence sur les 28 combinaisons hors
accueil** — les 14 autres pages n'ont pas bougé d'un pixel.

Contraste AA **0 défaut** · **0 débordement** à 390 px · LCP **504 ms** / 2 500 ·
**0 erreur JS** sur 30 combinaisons · les trois acquis verts.

## Ce que ce lot retire, et je le signale

- **`.reveal` sur l'accueil.** L'animation d'entrée des blocs disparaît de cette
  page (elle reste sur les 14 autres). La maquette n'en a pas, et `.reveal` est
  une classe du site avec son CSS hérité — la garder aurait été garder
  l'héritage.
- **Le bloc « Nos partenaires officiels »** de l'accueil. Vérifié avant retrait :
  « partenaires officiels » ×3, « AVYR » ×13 et « Délices du Bassin Bleu » ×3 sur
  `partenaires.html`. Le contenu existe à destination.
- **La signature « SYFIR™ »** du manifeste, décorative, qui doublait celle du
  pied de page (`.signe`, toujours là).

## ⚠ Ce que je n'ai toujours pas

`maquettes/3-LUMIERE-DE-SCENE.html` **n'est pas encore dans le dépôt**. Ce lot est
donc vérifié contre le **squelette écrit** fourni par le superviseur, pas contre
le fichier. Dès qu'il arrive, la vérification est à refaire **règle par règle**
contre lui — c'est le contrat, et non plus son résumé.
