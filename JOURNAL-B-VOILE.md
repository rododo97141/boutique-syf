# LOT B — LE VOILE SAUTAIT, IL DÉRIVE

Le bug de R97, resté vivant pendant que le ciel de l'accueil était
corrigé. `@keyframes ambient-grade` animait le **raccourci** `background`.
Le raccourci embarque `background-image`, dont le type est **discret** :
le navigateur ne sait pas interpoler un dégradé vers un autre, il bascule
à mi-chemin. Les cinq étapes — aube, golden hour, sunset, nuit océan,
braise — ne produisaient pas une dérive mais **quatre sauts**.

## Trois corrections de fait que je te dois

J'avais écrit trois choses fausses dans le plan. Mesurées :

| Ce que j'avais dit | Ce qui est vrai |
|---|---|
| « 8 pages portent le voile » | **7** : `cgv`, `confidentialite`, `faq`, `mentions-legales`, `partenaire-avyr`, `partenaire-delices-bassin-bleu`, `partenaires` |
| « 14 étapes de keyframes utilisent ce raccourci » | **une seule** règle, `ambient-grade`, 5 étapes. Après correction, le scan renvoie **zéro** raccourci à composante discrète animé dans `style.css` **et** `components.css`, et zéro propriété discrète animée directement. **Il n'y a pas d'autres cas à traiter** — c'est la réponse à « ce que tu fais des autres » |
| « 3 valeurs de luminance aujourd'hui » | **5**, soit exactement le nombre d'étapes du keyframe |

Le `.ambience` qu'on trouve dans `script.js` est l'ambiance **sonore** du
Portail, sans rapport avec le voile. Aucune injection JS ici.

## Le remède, et pourquoi celui-là

Sur le ciel, R97/C empilait des couches dont on anime les **opacités**.
Ici il aurait fallu ajouter cinq sous-couches au balisage **des 7 pages**.
On obtient le même résultat sans toucher à un seul fichier HTML : ce ne
sont pas les dégradés qu'on interpole, ce sont **leurs paramètres**.
`@property` donne un type aux variables, ce qui les rend interpolables —
c'est déjà l'idiome du dépôt depuis le pouls R94.

```css
@property --voile-teinte { syntax: '<color>';      inherits: false; … }
@property --voile-centre { syntax: '<percentage>'; inherits: false; … }
.ambience { background-image: radial-gradient(115% 115% at 50% 45%,
              transparent var(--voile-centre), var(--voile-teinte) 100%); }
```

Le raccourci `background` disparaît aussi de la règle de base : une
exception « inoffensive » est exactement ce qui l'a fait réapparaître
trois lots plus tard.

**Aucune couleur n'a changé.** Les cinq teintes sont reprises verbatim —
leur passage au vocabulaire de la nuit est le travail du lot C, et
mélanger les deux aurait rendu impossible de dire laquelle des deux causes
produit un changement à l'écran. Ta limite est tenue : **habillage, pas
structure** — aucun HTML touché, aucune section déplacée, aucun texte
réécrit.

## LA PREUVE — et le moyen 1 a échoué trois fois avant de valoir

C'est la partie la plus utile de ce lot, parce qu'à deux reprises
j'aurais pu crier victoire à tort.

**Tentative 1 — carré de 6 px, moyennes arrondies à l'entier.** Le voile
pèse 5 à 20 % d'alpha : il déplace le pixel d'**une ou deux unités sur
255**, et j'arrondissais. Résultat : 7 paliers sur 12 après correction là
où le mécanisme en produisait 12. Les deux moyens se contredisaient, et
l'outil a refusé de conclure — c'est ce refus qui a sauvé le lot.

**Tentative 2 — bloc de 260 px, moyennes en flottant.** 12 sur 12 après
correction… **et 12 sur 12 avant aussi.** Il mesurait le **contenu de la
page qui défile sous le voile**, pas le voile. *Un moyen qui donne le même
verdict avant et après ne mesure pas ce qu'on croit.*

**Tentative 3 — différentiel de masquage** (la méthode prouvée en R103 sur
la photo du hero) : même zone photographiée **avec** puis **sans** le
voile, le contenu s'annule. Toujours 12/12 des deux côtés : entre les deux
clichés, les révélations et la parallaxe bougeaient le fond, au point de
produire des apports **négatifs** — ce qu'une couche translucide ne peut
pas faire.

**Tentative 4 — différentiel + page figée** (animations en pause pendant
la paire de clichés). Là, la signature apparaît **en clair dans les
nombres bruts** :

```
AVANT   Δrgb : … +2.38/+1.75/−0.64  ×3   +3.18/+1.03/−0.96 ×2
               −0.44/+0.04/+0.70    ×3   +2.66/+1.91/−0.27 ×2
APRÈS   Δrgb : aucune répétition, rampe continue
```

**Et la métrique aussi était fausse.** Compter des « luminances
distinctes » laissait passer l'état fautif à 10 sur 12 : le bruit résiduel
suffit à rendre deux relevés d'un même plateau numériquement différents.
La signature du type discret n'est pas *peu de valeurs*, c'est
**l'identité de relevés consécutifs**. On compte donc les **répétitions
consécutives**, qui doivent être nulles.

### Résultat, aux deux moyens, dans les deux sens

| | états distincts | **relevés consécutifs identiques** | mécanisme | verdict |
|---|---:|---:|---:|---|
| **avant** | 7 / 12 | **4** | 5 / 12 | ✗ le voile saute |
| **après** | 12 / 12 | **0** | 12 / 12 | ✓ le voile dérive |

Les deux moyens concordent **dans les deux états** — c'est ça, la preuve,
et pas le seul chiffre d'après. Seuil demandé : 8 sur 12. Obtenu : 12.

**Les 7 pages vérifiées une par une** : `cgv`, `confidentialite`, `faq`,
`mentions-legales`, `partenaire-avyr`, `partenaire-delices-bassin-bleu`,
`partenaires` — **12/12 et 0 plateau partout**.

## Les images

`tools/qa/captures/b-voile-AVANT.png` et `b-voile-APRES.png` — l'apport du
voile seul, amplifié ×40, aux 12 positions. **Avant : cinq blocs. Après :
douze marches.** Ça se lit en une seconde.

`b-partenaires-AVANT.png` / `b-partenaires-APRES.png` — les pleines pages.
**Elles sont indiscernables, et c'est normal** : à 5–20 % d'alpha, au
repos, le voile est identique des deux côtés. Le défaut était **temporel**.
Je les livre parce que tu les as demandées, pas parce qu'elles prouvent
quoi que ce soit — prétendre le contraire serait mentir sur ce qu'une
image montre.

## Ce que la preuve d'intention a révélé sur elle-même

Premier usage réel de l'outil du lot A, et il a trouvé **son propre
défaut** : les réclamations n'étaient pas liées à leur paire de dumps.
`R106/1`, honorée au lot précédent, redevenait « sans effet » au lot
suivant et faisait échouer un lot innocent. Chaque entrée porte désormais
`de` / `vers`, et le rapport dit combien d'entrées concernent d'autres
passages **pour qu'on ne les croie pas vérifiées**.

Second enseignement : **le lot B ne réclame rien, et c'est juste.**
`r106 → r107` produit **0 différence** au dump — il change une
interpolation, donc un comportement dans le temps, et un dump lit la page
au repos. Zéro différence, zéro réclamation, preuve verte : cohérent, à
condition de dire que cette preuve porte sur l'état statique et **pas** sur
ce que le lot a corrigé. C'est `voile.mjs` qui prouve le lot B.

## Vérifications

| Instrument | Résultat |
|---|---|
| `voile.mjs` × 7 pages | **12/12 · 0 plateau** partout · deux moyens concordants |
| `voile.mjs` sur l'état d'avant | **7/12 · 4 plateaux · mécanisme 5/12** — l'instrument discrimine |
| Scan des raccourcis discrets animés | **0** dans `style.css` et `components.css` |
| `ui-dump.mjs` | 30 combinaisons, **0 erreur JS** |
| `intentions.mjs` (r106 → r107) | ✓ 0 différence, 0 réclamation — cohérent |

**PR #13 reste en Draft.**
