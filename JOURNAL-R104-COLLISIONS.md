# R104 — LA GOUTTE, ET LA DEUXIÈME SOURCE D'HÉRITAGE

Kily a regardé les captures à l'œil et a trouvé ce que six lots de mesures
n'avaient pas vu : **un losange doré planté devant chacun des quatre
sur-titres de l'accueil.**

> « ◆ LE MANIFESTE », « ◆ ARTISTES, DJS & GROUPES LIVE »,
> « ◆ PROCHAINES DATES », « ◆ L'ÉCOSYSTÈME ». La maquette n'en a aucun.

C'est le **motif goutte R30** : `syfir-ui/components.css` §02 pose
`.eyebrow::before` — 8 px de côté, `var(--drop-fill)`, `border-radius:
50% 50% 50% 0`, tourné à 45°.

## Pourquoi la mesure ne pouvait pas le voir — deux angles morts

**1. Il y avait une DEUXIÈME source d'héritage, jamais inspectée.**
Je cherchais les survivances du site dans `style.css`. Mais
`syfir-ui/components.css` est chargée **avant** lui et définit `.eyebrow`
avec les valeurs du site : `var(--display)`, `.75rem`, poids 700,
`letter-spacing: .35em`, `color: var(--sunset)`. La maquette veut
Plus Jakarta Sans 600, 11 px, `.3em`, en or. Trois lots durant j'ai
raisonné comme s'il n'existait qu'une feuille.

**2. Un `::before` n'est pas un sélecteur.** `maquette.mjs` comparait
34 paires de **sélecteurs** × 34 propriétés. Un pseudo-élément n'apparaît
dans aucune de ces paires : il était structurellement invisible à
l'instrument. Un décor ajouté par pseudo-élément ne se voit **qu'à l'œil**
— et à l'œil, personne ne regardait, puisque les captures n'entraient dans
le dépôt que depuis R103.

C'est la **troisième collision de noms**, après `.hero` et `.btn`, et la
première qui vienne de la bibliothèque.

---

## 1. L'INVENTAIRE COMPLET DES 27 NOMS

Demandé avec les cases vides : *« je veux savoir ce qui a été testé, pas
seulement ce qui a échoué »*.

**Deux moyens indépendants, qui concordent exactement.**
*Moyen 1* — analyse structurée des trois feuilles (`tokens.css`,
`components.css`, `style.css`), règle par règle, en séparant ce qui est
scopé `.page-home` (le nôtre) de ce qui ne l'est pas (le site).
*Moyen 2* — interrogation du **CSSOM sur l'accueil rendu** : on demande au
navigateur quelles règles visent un élément portant ce nom. Ça couvre les
`@media`, la spécificité et les trois feuilles d'un coup, et ça ne dépend
pas de mon parseur.

Colonnes : règles **scopées** `.page-home` (les nôtres, voulues) · règles
**libres** (celles du site, qui s'appliqueraient aussi) · ce qu'elles
imposent.

| Nom | Scopées | Libres | Où | Ce que ça impose |
|---|---:|---:|---|---|
| `.hero` | 3 | **4** | style.css | `position` `min-height` `display` `align-items` `justify-content` `text-align` `overflow` · `body:has(.hero)` → `text-shadow` ×2 · `.home-hero .hero` → `min-height` `height` |
| `.marque` | 1 | 0 | — | — |
| `.sous` | 1 | 0 | — | — |
| `.tag` | 1 | 0 | — | — |
| `.actions` | 1 | 0 | — | — |
| `.btn` | 2 | **16** | components.css ×2, style.css ×14 | `display` `align-items` `justify-content` `gap` `font-family` `font-weight` `font-size` `letter-spacing` `text-transform` `padding` `border-radius` `border` `transition` `position` `overflow` ; puis 14 règles de contexte (`.nav-actions .btn`, `.footer-news .btn`, `.next-cta .btn` → `filter`…) |
| `.btn-1` | 2 | 0 | — | — |
| `.btn-2` | 2 | 0 | — | — |
| `.sec` | 1 | 0 | — | — |
| **`.eyebrow`** | 1 | **2** | components.css | `.eyebrow` → `font-family` `font-size` `font-weight` `letter-spacing` `text-transform` `color` `margin-bottom` · **`.eyebrow::before` → `content` `display` `vertical-align` `width` `height` `margin-right` `background` `border-radius` `transform`** |
| `.lead` | 2 | **2** | style.css | `font-size` `margin-bottom` `color` · `max-width` |
| `.plein` | 5 | 0 | — | — |
| `.dedans` | 1 | 0 | — | — |
| `.bloc` | 1 | 0 | — | — |
| `.dates` | 2 | 0 | — | — |
| `.date` | 7 | 0 | — | — |
| `.quand` | 1 | 0 | — | — |
| `.ou` | 1 | 0 | — | — |
| `.puce` | 1 | 0 | — | — |
| `.eco` | 6 | 0 | — | — |
| `.c` | 5 | 0 | — | — |
| `.signe` | 1 | 0 | — | — |
| `.sante` | 1 | 0 | — | — |
| `.nuit` | 2 | 0 | — | — |
| `.projos` | 4 | 0 | — | — |
| `.brume` | 3 | 0 | — | — |
| `.rev` | 0 | 0 | — | — |

**23 noms sur 27 sont propres.** Quatre collisions : `.hero`, `.btn`,
`.eyebrow`, `.lead`.

### État de chacune

- **`.hero`** — neutralisée nommément dès R100 (`.page-home .hero` repose
  `justify-content: normal`, `overflow: visible`, `position: static`…).
  `maquette.mjs` : 0 écart, pseudos compris.
- **`.btn`** — neutralisée nommément dès R100, `.page-home .btn::before
  { content: none }` compris. Les 14 règles de contexte
  (`.nav-actions .btn`…) ne s'appliquent pas : aucun de ces conteneurs
  n'existe sur l'accueil. 0 écart.
- **`.lead`** — `.page-home .lead` repose les quatre propriétés du site
  (`font-size`, `color`, `max-width`, `margin`). 0 écart. **Elle n'avait
  jamais été nommée comme collision** : elle passait pour propre parce
  qu'elle était déjà couverte par accident de l'ordre de travail.
- **`.eyebrow`** — l'élément était neutralisé ; **le pseudo ne l'était
  pas.** C'est le défaut de ce lot.

### Ce que cet inventaire ne couvre pas, et je le dis

La liste porte sur des **noms de classe**. La maquette style aussi des
**éléments nus** (`h2`, `h3`, `b`, `span`, `em`, `p`, `footer`, `nav`),
sur lesquels le site a ses propres règles. Ceux-là sont couverts par les
34 paires de `maquette.mjs` — désormais pseudos compris — mais pas par ce
tableau-ci.

---

## 2. LE RETRAIT

```css
.page-home .eyebrow::before { content: none; }
```

Scopé. **La goutte reste sur les 13 autres pages** : c'est un motif de
marque assumé depuis R30, et retirer un motif partout serait une
régression déguisée en correction.

### Vérifié par deux moyens, dont un qui a d'abord menti

**Moyen 1** — `content` calculé : `none` sur l'accueil, `""` ailleurs.

**Moyen 2, première version — INSUFFISANT, et je le note.** J'ai d'abord
lu les pixels clairs dans les 14 px à gauche du sur-titre. Résultat :
**26 % sur l'accueil contre 16 % sur les pages qui ONT la goutte.** Lu
vite, ça disait l'inverse de la vérité. Explication : sans la goutte, le
**texte** commence au bord de la boîte et remplit la bande ; avec elle, le
texte est repoussé de 17 px et la bande ne contient qu'un petit losange
sur du noir. **La bande ne sait pas distinguer un losange d'un « L ».**

**Moyen 2, version décisive** — le **décalage du premier glyphe**, mesuré
par un `Range` sur le nœud de texte. La goutte occupe 8 px + 9 px de
marge : sa présence est un déplacement de 17 px, et rien d'autre ne
produit ce déplacement.

| Page | `::before` | Décalage du 1er glyphe | Verdict |
|---|---|---:|---|
| **index.html** | `none` | **0 px** | **aucune goutte** |
| evenements.html | `""` | 17 px | goutte présente |
| syf-tv.html | `""` | 17 px | goutte présente |
| partenaires.html | `""` | 17 px | goutte présente |
| artistes.html | `""` | 17 px | goutte présente |
| evenement.html | `""` | 17 px | goutte présente |

---

## 3. L'INSTRUMENT — les pseudo-éléments entrent dans la comparaison

`maquette.mjs` lit maintenant **trois couches par paire** : l'élément,
son `::before`, son `::after`. Soit **102 couches** au lieu de 34, aux
deux tailles.

**La présence avant les valeurs.** Sur un pseudo qui n'existe pas, le
navigateur répond quand même à toutes les propriétés — héritées ou
initiales. Comparer ces valeurs-là ferait hurler l'outil sur du vide. La
première question est donc « ce pseudo existe-t-il des deux côtés ? », et
c'est `content` qui y répond (`none` = pas de pseudo) :

- absent des deux côtés → rien à comparer, on passe ;
- présent d'un seul côté → **« PSEUDO EN TROP »**, et on n'énumère pas
  ses 34 propriétés : un décor à supprimer n'a pas besoin d'être décrit ;
- présent des deux côtés → comparaison propriété par propriété.

**L'instrument retrouve seul le défaut que Kily avait trouvé à l'œil.**
Lancé avant le correctif, il sort exactement une ligne, aux deux tailles :

```
✗ .eyebrow::before   PSEUDO EN TROP   maquette « aucun »
                                      accueil  « "" »
```

Et **une seule** parmi les 34 paires : aucun autre pseudo-élément du site
n'a survécu sur l'accueil. Après le correctif : **0 écart**.

---

## VÉRIFICATIONS DU LOT

| Instrument | Résultat |
|---|---|
| `maquette.mjs` — **102 couches** × 34 propriétés, 2 tailles | **0 écart**, 11 tolérés et nommés |
| Décalage du 1er glyphe (second moyen) | accueil **0 px** · 5 autres pages **17 px** |
| `acquis.mjs` | ✓ les trois · loi Évin **19,36:1** sur le pixel peint |
| `soiree.mjs` | ✓ deux moyens concordants |
| `debordement.mjs` (390 px) | ✓ **0** élément qui dépasse |
| `contraste.mjs` (AA) | ✓ **0** défaut |
| `lcp.mjs` (mobile, CPU ×4) | **432 ms** / budget 2500 |
| `ui-dump.mjs` | 30 combinaisons, **0 erreur JS** |
| `ui-diff-hors-index.mjs` (r103 → r104) | ✓ **0 différence** sur 28 combinaisons — la goutte n'a bougé nulle part ailleurs |

Captures : `tools/qa/captures/r104-{accueil,maquette}-{desktop,390}.png`.

**PR #13 reste en Draft. Les 13 autres pages n'ont pas été touchées.**
