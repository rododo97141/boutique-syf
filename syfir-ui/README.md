# syfir-ui

Bibliothèque de composants du site SYFIR.

**HTML/CSS/JS vanilla. Zéro dépendance, zéro build, zéro bundler.**
Deux `<link>` ordinaires, comme n'importe quelle feuille de style.

```html
<link rel="stylesheet" href="syfir-ui/tokens.css">
<link rel="stylesheet" href="syfir-ui/components.css">
<link rel="stylesheet" href="style.css">
```

## Les deux fichiers

| Fichier | Contenu |
|---|---|
| `tokens.css` | Les **valeurs** : couleurs, typographies, géométrie, durées. Un seul bloc `:root`. |
| `components.css` | Les **primitifs** : 13 composants, §01 à §13. Ne référence que des `var(--…)`. |

Ensemble, ils sont autonomes : on peut les charger sur une page neuve, sans
`style.css`, et obtenir des composants corrects.

## Ordre de chargement — la règle qui tient tout

`components.css` se charge **AVANT** `style.css`. Conséquence voulue : **à
spécificité égale, ce qui reste dans `style.css` gagne.**

C'est ce qui a permis d'extraire 13 composants sans toucher une seule
surcharge de thème clair, ni une seule règle de contexte page-spécifique.
Elles sont restées exactement où elles étaient, et continuent de gagner.

Inverser cet ordre casserait le thème clair sur tout le site.

L'ordre entre `tokens.css` et `components.css` n'a, lui, aucune importance
technique : `var()` résout à l'usage sur l'élément, pas à la déclaration.
Il est là pour la lisibilité de l'intention.

## Ce qui est un primitif, ce qui n'en est pas

**Extrait ici** — structure, variantes, tailles, états propres au composant.

**Laissé dans `style.css`**, volontairement, dans les trois cas suivants :

1. **Surcharges de thème.** `html[data-theme="light"] .eco-card { … }` reste
   avec les autres surcharges de thème. Règle 1 de `CLAUDE.md` : le clair
   s'écrit par surcharges.
2. **Règles de contexte page-spécifique.** `.final-cta .btn`,
   `.tickets-hero .section-intro`, `.ed-stock`. Le composant ne sait pas dans
   quelle page il vit ; c'est la page qui le sait.
3. **Sélecteurs partagés entre plusieurs composants.** La règle `:active`
   commune à `.btn`, `.chip` et `.qty-btn` ; les surcharges clair groupées
   entre `.choice-card` et `.vis-opt`, entre `.univers-card` et `.fact-card`.
   **Les découper casserait l'autre composant.**

C'est une bibliothèque de primitifs, pas un système exhaustif. Le dire
explicitement évite de croire qu'un composant est « complet » ici alors que
la moitié de son comportement visuel vit ailleurs — chaque section de
`components.css` liste donc ce qui reste dehors, et pourquoi.

## Les 13 composants

| § | Composant | Sélecteurs d'entrée | Pages |
|---|---|---|---|
| 01 | Boutons | `.btn` + `-solid` `-ghost` `-gradient` `-sm` `-lg` `-full` | 14 |
| 02 | En-têtes de section | `.eyebrow` `.h2` `.section-intro` | 12 |
| 03 | Champs de formulaire | `.form-grid` `.form-field` `.field-error` | 8 |
| 04 | Puces / filtres | `.chip` (+ `.active`) | 3 |
| 05 | Placeholders juridiques | `.legal-note` `.legal-muted` `.legal-box` `.legal-todo` | 6 |
| 06 | Badges | `.stock-badge` `.event-age-badge` `.rb-badge` + variantes | 2 + JS |
| 07 | Cartes info | `.univers-card` `.eco-card` `.official-card` | 2 |
| 08 | Rangée carrousel | `.media-row` `.media-row-track` `.row-arrow` | 4 |
| 09 | Cartes de choix radio | `.choice-card` | 1 |
| 10 | Interrupteur radio | `.visibility-switch` `.vis-opt` | 1 |
| 11 | Accordéon | `.faq-item` `.faq-q` `.faq-a` | 1 |
| 12 | Toast | `.toast` (+ `.show`) | toutes |
| 13 | Modale / overlay | `.modal` `.modal-box` `.modal-close` | 4 |

## Accessibilité : ce qui est délibéré

Trois composants s'appuient sur des éléments natifs plutôt que sur du script,
et ce n'est pas un raccourci — c'est le choix :

- **§09 / §10** — un `<input type="radio">` rendu invisible porte l'état ; le
  `<span>` porte le style. L'état sélectionné passe par `input:checked + span`,
  le focus clavier par `input:focus-visible + span`. Jamais un `div` avec un
  `onclick`.
- **§11** — `<details>`/`<summary>`. L'ouverture, le clavier et le rôle ARIA
  viennent du navigateur.
- **§13** — le repos combine `opacity: 0` **et** `visibility: hidden`.
  L'opacité seule laisserait la modale cliquable et focusable pendant qu'elle
  est invisible.

## Comment une extraction a été prouvée

Chaque composant a été extrait en un commit unique, et chaque commit est
accompagné d'un **diff de styles calculés** :

- 14 pages × 2 thèmes (clair / sombre) × 2 viewports (1440 / 390 px)
  = **56 combinaisons, 17 268 éléments**
- pour chaque élément : ~48 propriétés calculées, plus une signature de
  sélecteur structurel
- comparaison stricte avant / après
- **zéro différence exigée.** Un composant dont le diff n'est pas vide ne
  passe pas.

Les valeurs sont reprises **verbatim** de `style.css`. Aucune réécriture,
aucune « amélioration » au passage : le lot prouve un déplacement, pas un
changement de design. Toute amélioration se fera plus tard, visible, sur une
base dont on sait qu'elle n'a pas bougé.

## Pièges de cascade appris à la dure

Notés ici pour qu'un prochain lot ne les redécouvre pas.

**Ne jamais écrire le raccourci `animation`.** Toujours les propriétés
longues : `animation-name`, `-duration`, `-timing-function`,
`-iteration-count`, `-delay`, `-timeline`.

Le raccourci **remet à sa valeur initiale toute sous-propriété qu'il ne
mentionne pas** — y compris une qu'on vient d'écrire juste au-dessus, et y
compris depuis une règle de spécificité supérieure. Deux bugs dans le seul
lot R92, tous deux attrapés au test :

| Où | Ce que le raccourci a effacé | Symptôme |
|---|---|---|
| R92/1 | `animation-timeline` | la traversée du ciel ne démarrait pas |
| R92/6 | `animation-delay` | les 8 étoiles brillantes pulsaient à l'unisson |

Deux occurrences de la même cause suffisent à en faire une règle. Même
logique pour `background`, `transition`, `mask`, `grid` : un raccourci
n'ajoute pas, il **remplace tout le groupe**.

**Corollaire de méthode** : un test qui vérifie qu'une propriété est
*déclarée* ne prouve rien. Le test du socle R92/1 lisait bien
`animationName` et `animationTimeline` et passait au vert — alors que la
traversée était cassée. Ce qu'il faut mesurer, c'est le **résultat**
(la couleur d'arrivée du ciel, le retard réel de chaque étoile), jamais le
câblage.

## Limites connues

- **Pas de `components.js`.** Le comportement (toast, flèches de carrousel,
  ouverture de modale, tri des puces) vit toujours dans `script.js`. Raison
  assumée : la méthode de preuve ci-dessus mesure des **styles calculés**, elle
  est structurellement aveugle à une régression de comportement. Extraire du JS
  demande un test de comportement, pas un diff de styles — c'est un lot à part.
- **Les surcharges de thème clair ne sont pas dans la bibliothèque.** Un
  composant chargé sans `style.css` n'aura donc que sa version sombre.
