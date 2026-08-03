# R106 — LA BARRE, LE VIDE OBSERVÉ, ET LE QUATRIÈME ANGLE MORT

Trois décisions exécutées, un arbitrage rendu à Kily, et un instrument
élargi deux fois — dont une parce que la première correction ne mordait
pas.

## 1. `nav.scrolled` — retiré de l'accueil

> « Le même visuel à l'identique ; une barre qui maigrit de 8 px au
> défilement n'est pas dans le contrat. »

`.page-home nav.scrolled` repose nommément les six propriétés que les deux
règles non scopées du site imposaient : `height`, `background-color`,
`background-image`, `backdrop-filter`, `box-shadow`, `top`.

**Pourquoi en CSS et pas en JS** — `classList.toggle('scrolled')` est
**une ligne d'un gestionnaire de défilement partagé par les 14 pages**.
Brancher ce gestionnaire sur l'identité de la page serait plus fragile
qu'une règle scopée. La classe reste donc posée sur l'accueil et n'y
produit plus rien ; la règle est ce qui l'explique à qui cherchera
`.scrolled`. **Les 13 autres pages gardent leur barre rétractable.**

### Et le défaut était deux fois plus gros que signalé

En ajoutant la paire `nav` à l'instrument (elle n'existait pas), la barre
s'est révélée **trop haute aussi au repos** : **72 px contre 52,3 px**.
Le site posait `nav { height: var(--nav-h) }` ; la maquette n'écrit aucune
hauteur et laisse la barre se dimensionner par son contenu. `height: auto`
sur `.page-home nav` retire l'imposition. Un second écart est tombé dans
la foulée : `gap: 18px` contre `normal`.

## ⚖ UN ARBITRAGE POUR KILY — la barre ne peut pas faire 52 px

Une fois l'imposition CSS retirée, la barre de l'accueil mesure **77 px**,
pas 52,3. **La différence n'est plus du CSS : c'est du contenu.**

- La maquette ne porte qu'un logo et des liens texte.
- L'accueil porte en plus **les boutons recherche et profil** que tu as
  explicitement demandé de garder.
- `CLAUDE.md` §2.5 fait loi : **cibles tactiles ≥ 44 px**.
- 44 + 16 + 16 (le padding de la maquette) = **76**.

**« À l'identique » et « cibles ≥ 44 px » ne peuvent pas être vrais
ensemble ici.** Trois issues, aucune que je prenne seul :

1. **garder 77 px** — la barre est plus haute que la maquette, les cibles
   sont conformes ;
2. **réduire le padding vertical** à 8 px → barre à 60 px, cibles toujours
   à 44 px, mais on s'écarte du `padding: 16px 26px` du fichier ;
3. **réduire les boutons** sous 44 px → on épouse la maquette et on viole
   la loi du dépôt. Je ne la propose que pour mémoire.

En attendant, `nav.height` est **tolérée en la nommant « ARBITRAGE EN
ATTENTE »** dans l'instrument — pas en la faisant disparaître.

## 2. Le méga-menu — reste, et voici son registre

Il reste : c'est ce que `#searchBtn` ouvre. Capture livrée :
`tools/qa/captures/r106-megamenu-desktop.png`.

**Ce qui est déjà dans le registre de la nuit** — fond sombre bleuté,
**Unbounded** pour les titres et **Plus Jakarta Sans** pour le texte
(exactement les familles de la maquette), aucun aplat d'or, aucune ombre
portée d'ancien site.

**Les quatre tells de l'ancien site**, mesurés, que je te soumets :

| # | Ce qui diverge | Mesuré | La maquette |
|---|---|---|---|
| 1 | **Le crème est CHAUD** | `rgb(250, 248, 242)` (`#FAF8F2`) sur tous les textes | `rgb(238, 242, 248)` (`#EEF2F8`), un blanc **froid** |
| 2 | **Cartes « envies » arrondies** | `border-radius: 16px` | ses cartes de dates sont **bord à bord, sans rayon** |
| 3 | **Champ de recherche cerclé d'or** | liseré doré autour de l'`input`, `border-radius: 4px` | l'or n'apparaît **qu'au sur-titre** |
| 4 | **Bouton de fermeture rond** | pastille circulaire en haut à droite | tu as fait retirer les cercles dorés de la barre en R103 |

Le 1 est le plus insidieux : deux crèmes très proches, mais l'un tire vers
le jaune et l'autre vers le bleu — c'est la signature chromatique de
l'ancien site qui rentre par la porte du panneau. **Je n'ai rien changé :
tu tranches.**

## 3. L'observateur qui observait le vide — retiré

> « Du code qui observe le vide n'est pas neutre, il est trompeur pour la
> prochaine session — elle croira que les apparitions existent. »

La machinerie `.reveal` (IntersectionObserver, minuterie de 1600 ms,
quatre écouteurs) est désormais sous `if (reveals.length) { … }`.

**Le garde est général, pas une exception pour l'accueil.** `script.js`
est partagé par les 14 pages, et « zéro élément à révéler » est la seule
condition qui compte. Rien n'est supprimé : la machinerie entière reste en
place pour les autres pages **et** pour le jour où l'accueil retrouvera
ses apparitions (la maquette en a 22 — manque ouvert depuis R103).

**Vérifié page par page, après défilement complet :**

| Page | `.reveal` | révélés | restés invisibles |
|---|---:|---:|---:|
| `index.html` | 0 | 0 | **0** |
| `evenements.html` | 30 | 27 | **0** |
| `syf-tv.html` | 26 | 24 | **0** |
| `partenaires.html` | 20 | 20 | **0** |
| `artistes.html` | 8 | 8 | **0** |
| `espace-pro.html` | 0 | 0 | **0** |

Aucun élément bloqué à l'invisible nulle part : le garde est inerte là où
il y a du travail à faire.

---

# L'INSTRUMENT — élargi deux fois, dont une parce qu'il ne mordait pas

## Le quatrième angle mort : les PROPRIÉTÉS

J'ai d'abord ajouté la paire `nav` et une seconde passe de mesure après
défilement. Puis j'ai fait ce que j'aurais dû faire à chaque fois :
**vérifier que l'instrument mord**, en désactivant la correction pour voir
s'il hurle.

**Il n'a pas hurlé.** Parce que `height` **ne figurait pas dans la liste
des propriétés comparées** — ni `borderBottom*`, alors que la barre porte
son liseré en bas et que seuls les bords du HAUT y étaient. Les 20 px
d'écart au repos, ce n'est pas l'instrument qui les avait trouvés : c'est
une mesure que j'avais écrite à côté.

C'est **le même angle mort descendu d'un cran** : après les sélecteurs
(R104) et le moment (R105), les **propriétés**.

`height`, `minWidth`, `borderBottomWidth/Color/Style` et `backdropFilter`
entrent dans la comparaison. **`width` a été essayée puis retirée**, et la
raison est écrite dans le fichier : sans webfont, les deux chaînes de repli
diffèrent et toutes les largeurs de texte divergeaient de quelques pixels
(`.marque` 577,6 contre 565,9) — l'instrument aurait mesuré l'artefact
d'environnement documenté en R103, pas le dessin. Un instrument qui hurle
sur du bruit finit ignoré.

Les onze hauteurs pilotées par la longueur du contenu sont tolérées **une
par une, avec leur raison mesurée** — jamais en famille.

## Et il ne mordait toujours pas : la tolérance qui aveuglait le mouvement

Seconde tentative, second échec. La passe après défilement comparait
bêtement l'accueil défilé à la maquette défilée — et la tolérance posée
sur `nav.height` (l'arbitrage en attente) **avalait aussi l'état défilé**.
Une tolérance destinée au repos aveuglait le mouvement.

**La bonne question n'est pas « même valeur que la maquette ? » mais
« l'accueil bouge-t-il là où la maquette ne bouge pas ? ».** La seconde
passe compare désormais **chaque côté à lui-même** entre le haut et le
quart de page, et c'est la **divergence de comportement** qui est l'écart.
Aucune tolérance d'état de repos ne peut la masquer.

**Preuve que ça mord** — neutralisation désactivée :

```
✗ nav                height AU DÉFILEMENT
  maquette NE BOUGE PAS : 52.3125px -> 52.3125px
  accueil  CHANGE       : 77px      -> 64px
```

Aux deux tailles. Neutralisation rétablie : 0 écart.

---

# VÉRIFICATIONS DU LOT

| Instrument | Résultat |
|---|---|
| `maquette.mjs` — 36 paires × 3 couches × 41 propriétés, **2 passes**, 2 tailles | **0 écart**, 34 tolérés et nommés |
| Preuve de morsure (neutralisation désactivée) | ✓ l'écart sort, aux deux tailles |
| `.reveal` sur 6 pages | ✓ 0 élément resté invisible |
| `acquis.mjs` | ✓ les trois |
| `soiree.mjs` | ✓ deux moyens concordants |
| `debordement.mjs` (390 px) | ✓ 0 élément qui dépasse |
| `contraste.mjs` (AA) | ✓ 0 défaut |
| `lcp.mjs` (mobile, CPU ×4) | 448 ms / budget 2500 |
| `ui-dump.mjs` | 30 combinaisons, 0 erreur JS |
| `ui-diff-hors-index.mjs` (r105 → r106) | ✓ **0 différence** sur 28 combinaisons hors accueil |

Captures : `r106-{accueil,maquette}-{desktop,390}.png` et
`r106-megamenu-desktop.png`.

La leçon des quatre angles morts est inscrite **en section 0 de
`HANDOFF.md`**, avant tout le reste.

**PR #13 reste en Draft.**
