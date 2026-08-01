# Journal R99 — L'ACCUEIL DEVIENT LA MAQUETTE

Kily a rouvert le site après R98 et tranché : **« Non, toujours pas. Je voulais
une page et un format plus comme ça »**, en pointant la maquette.

> **Ce n'était pas la couleur qui échouait, c'était le SQUELETTE.** La maquette
> compte **six** blocs, l'accueil en comptait **vingt-deux** — et son hero
> n'était pas une image plein écran mais un **carrousel horizontal de cinq
> panneaux**. On avait repeint une page catalogue au lieu de construire une
> affiche.

Décision qui lève une interdiction de la liste rouge : **l'accueil devient
exactement la maquette, six blocs**. Les sections en trop **déménagent**, à une
condition absolue — **rien ne disparaît du site**.

---

## Le tableau de déménagement — vérifié fichier par fichier

Chaque ligne a été contrôlée par `grep` **sur le fichier de destination**, avant
tout retrait. « Probable » n'était pas suffisant.

| Section | Contenu unique au site ? | Destination | Vérif. | Action |
|---|---|---|---|---|
| hero (carrousel ×5) | les 4 panneaux ne portaient que des liens vers `evenements.html` | — | — | **carrousel supprimé** |
| `#manifesto` | unique | — | — | **reste** — bloc 2 |
| `.marquee` | aucun lien, aucun fait, 8 mots de vocabulaire | — | — | retiré (décor) |
| **`#marque`** | **UNIQUE** · **11 liens entrants** | `partenaires.html` | **ABSENT** | **déplacé** + liens suivis |
| `#prochains` | — | — | — | **reste** — bloc 4 |
| `#evenements` | « rooftop », « organise la tienne » | `evenements.html` | **PRÉSENT** | teaser retiré |
| **`#artistes`** | affiche reste ; **grille + agenda uniques**, 44 + 13 liens | **`artistes.html` (créée)** | aucune page ne les portait | **déplacés** |
| `#services` | « chacun peut créer sa fête » · Smartboard · formulaire soirée | 3 pages | **PRÉSENT** | teaser retiré |
| `#confiance` | — | — | — | **reste** — bloc 5 |
| `#saveurs-teaser` | « AVYR », « pochette » | `partenaires.html`, `partenaire-avyr.html` | **PRÉSENT** | teaser retiré |
| `#communaute-teaser` | pointeur vers 518 lignes réelles | `syf-tv.html` | **PRÉSENT** | teaser retiré |
| `.partner-teaser` | « SYFIR EXPERIENCE », « met en relation » | `partenaires.html` | **PRÉSENT** | teaser retiré |
| `footer` | — | — | — | **reste** — bloc 6 |

### Le piège que l'inventaire de sections ne montrait pas

`index.html#agenda` a **13 liens entrants**, et l'ancre vit **à l'intérieur**
de `#artistes`. Un inventaire par sections ne la voit pas. Déplacer `#artistes`
sans elle aurait cassé 13 liens en silence.

Total des liens redirigés : **44** (`#artistes`) + **13** (`#agenda`) +
**11** (`#marque`) = **68**. Reste : **0**.

---

## Les points, avec leurs mesures

| Point | Livré | Mesures |
|---|---|---|
| **R99/1** | `artistes.html` reçoit le line-up intégral | 4 filtres, 1 carte (Unity 141, seul artiste réel), agenda présent, **0 erreur JS** · harnais 14 → **15 pages**, 28 → **30 combinaisons** |
| **R99/2** | `#marque` déménage vers `partenaires.html` | ancre présente à destination **et** absente à la source — deux assertions, pas une |
| **R99/3** | Les 5 teasers + le bandeau retirés | sections de l'accueil : `home-hero \| manifesto \| prochains \| artistes \| confiance` + footer · **0 erreur JS** · **0 lien orphelin** |
| **R99/4** | Le carrousel meurt ; blocs 1, 2, 3 | hero **900/900** et **844/844** = 100svh · SYFIR **210 / 58,5 px**, `-10,5 px` = **−.05em**, `line-height .86` · sur-titre **11 px / 5,5 px (.5em) / or** · halo `0 0 90px rgba(127,178,255,.5)` · artistes **96svh**, photo **.56 cover** |
| **R99/5** | Blocs 4, 5, 6 + l'état vide assumé | grille `grid`, **gap 2px**, fond `rgba(238,242,248,.1)` · cartes **400 px**, radius **0** · signature **150 px, opacité .14** · loi Évin **18,05:1 sur le pixel peint** |
| **R99/6** | L'audit de l'or terminé | brillantes **3,0 px** (seuil 4) / halo **8,0** (12) · croix **22×1** (24) · ampoules **5,0** (6) · **1,47 %** de pixels dorés · **0** surface au crème chaud restante |
| **R99/7** | Vérification finale | contraste AA **0 défaut** sur `index` **et** `artistes` · **0 débordement** · **15 pages dans le budget LCP**, pire **1 304 ms** · **0 erreur JS** sur 30 · la soirée avance toujours |

### La preuve de confinement, reformulée — parce que R99 déborde EXPRÈS

R99 est un **déménagement** : la preuve n'est plus « 0 différence hors accueil »,
elle devient **« chaque différence hors accueil est un déménagement voulu »**.

| Page | Différences | Cause |
|---|---|---|
| `partenaires.html` | 10 | a **reçu** `#marque` (+1 008 px, nouveaux `.h2` et `.eyebrow`) |
| `confidentialite.html` | 4 | puce « préférence de thème » retirée — devenue fausse en R98 |
| `artistes.html` | 2 | **page nouvelle** |
| **11 autres pages** | **0** | intactes |

---

## Ce que seule la CAPTURE pouvait voir — quatre fois en un lot

Le critère de réussite n'était pas un chiffre. Il a fallu **regarder**, et à
chaque fois tous les indicateurs étaient déjà verts :

1. **`.rb-card` porte `aspect-ratio: 3/4`.** Juste pour une carte de grille
   (290 px → 387 px) ; **absurde en pleine largeur** : 1440 × 4/3 = **1920 px**,
   un tiers de la page pour trois lignes de texte.
2. **La photo de l'état vide était une plage en plein jour** sur un site de nuit.
3. **`#confiance` posait un fond opaque `#1B1B1B`** — un panneau gris flottant au
   milieu de la nuit, qui coupait le ciel en deux. Les six blocs étaient corrects,
   les valeurs aussi, et le monde n'était plus unique.
4. **Le bouton principal traînait une ombre VIOLETTE**, `rgba(126,34,206,.35)`,
   héritée du dégradé de l'ancien monde d'été. Le contraste du texte était
   parfait, la couleur du fond correcte — **seule l'ombre mentait**.

> Le harnais prouve qu'on n'a rien cassé. **Il ne dit jamais si c'est beau.**

## Deux affirmations fausses corrigées au passage

Antérieures à R99, et elles relèvent de la doctrine (aucune donnée inventée) :
le titre annonçait **« Trois dates »** avec **zéro** date publiée, et l'intro
promettait que **« les Early Bird partent vite »** sans aucun événement.

## L'état vide assumé remplace un trou

La branche « aucune date » faisait `section.hidden = true` : le bloc
**disparaissait**. C'était précisément la section que Kily pointait. Désormais
une carte pleine largeur, même traitement photo, pastille « Bientôt » en liseré
d'or, qui dit franchement qu'il n'y a rien de publié et propose la seule chose
réellement disponible — organiser la sienne, via le formulaire qui existe déjà.

**Aucun événement inventé.** L'offre reste annoncée comme en construction.

---

# ⚠ À RETIRER AVANT PUBLICATION — les dates de démonstration

**Commit : `f20ea5a`** — préfixé « DEMO — », il ne contient **que** `events-data.js`.

```bash
git revert f20ea5a
```

Une seule commande. Le jour de la publication, c'est la première chose à faire.

## Ce que c'est

Quatre événements de démonstration sur l'accueil, autorisés explicitement par
Kily en R99 : *« tu peux mettre quelques dates, vu que je ne vais pas publier le
site maintenant »*. **L'autorisation ne vaut que dans ce cadre** — elle ne rouvre
pas la règle générale, qui reste : aucune donnée fictive dans la version
publique.

| Date | Événement | Commune | Type |
|---|---|---|---|
| 22 août 2026 | Rooftop Sunset Session | Pointe-à-Pitre | rooftop |
| 5 sept. 2026 | Beach Party — Pleine Lune | Sainte-Anne | beach |
| 19 sept. 2026 | Villa Session — Soirée privée | Le Gosier | privé |
| 10 oct. 2026 | Nuit Carnaval | Basse-Terre | festival |

## Les garde-fous, et comment ils sont vérifiés

- **`demo: true` sur les quatre.** Le mécanisme existait déjà — le badge
  « Exemple » est rendu par `script.js` (l. 1767 et 2608), `evenement.js` et
  `artiste.js`. Il est **réutilisé**, jamais contourné.
  **Mesuré sur la page rendue : 4 cartes, 4 badges « Exemple ».**
- **Aucun nom de lieu réel.** Le champ `venue` est **volontairement absent** : il
  alimenterait un objet `Place` en JSON-LD (`evenement.js` l. 90), donc une
  adresse structurée pour un lieu inventé. Seules les **communes** sont nommées,
  et une commune n'est pas un établissement.
- **Aucun nom d'artiste réel.** Unity 141 reste le seul artiste réel du site et
  n'apparaît sur aucune de ces soirées.
- **Organisateur : SYFIR elle-même.** Aucune structure tierce inventée.

## Ce qui reprend la main au revert

L'**état vide assumé** (R99/5) : une carte pleine largeur, même traitement photo,
pastille « Bientôt » en liseré d'or, qui dit franchement qu'il n'y a rien de
publié et propose d'organiser la sienne. Il est en place et testé — il ne
s'affiche simplement plus tant que les démos sont là.

> **Les deux affirmations fausses corrigées en R99/5 ne doivent PAS revenir.**
> « Trois dates » (avec zéro date) et « les Early Bird partent vite » (fausse
> rareté) restent retirées. Ce n'est pas parce qu'il y a des exemples qu'un
> chiffre en dur dans un titre redevient acceptable.
