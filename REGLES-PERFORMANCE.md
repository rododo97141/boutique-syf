# DEUX RÈGLES DE PERFORMANCE — payées par un navigateur gelé

> Ces deux règles ne viennent pas d'une bonne pratique lue quelque part :
> **chacune a figé le navigateur** pendant le travail du 04/08. Elles sont
> écrites ici parce qu'elles se réintroduisent facilement — les deux motifs
> ont l'air parfaitement raisonnables.

## 1. Jamais une propriété dépendant de `--p` sur un pseudo-élément plein écran

`--p` est **réécrite à chaque image** par la boucle du ciel (l'horloge de
défilement). Une propriété qui la lit est donc recalculée 60 fois par
seconde.

**Ce qui gèle** : deux dégradés radiaux repeints 60 fois par seconde sur
un **calque non promu**. Le moteur de rendu s'arrête.

**Pourquoi `.n0` / `.n1` / `.n2` y survivent** : ce sont de **vrais
éléments**. Ils peuvent être promus sur leur propre calque de composition ;
un pseudo-élément plein écran ne l'est pas, et sa repeinture réenrôle son
parent.

**Vérifié dans l'état actuel du dépôt** : les six lectures de `var(--p)`
sont toutes sur de vrais éléments — `.n0`, `.n1`, `.n2` (les trois nuits),
`.projos` (les projecteurs), `.brume`. **Aucun pseudo-élément ne lit
`--p`.** C'est l'état à préserver.

> **Le contrôle, avant de commiter du CSS** : pour chaque `::before` /
> `::after`, vérifier qu'aucune de ses déclarations ne contient `var(--p)`.
> Si un décor doit dériver au défilement, il prend un **élément à lui**.

## 2. Aucun sélecteur universel

`.page-home *:focus-visible` place **tout le document** dans l'ensemble
candidat : le recalcul de style repart en boucle sur l'arbre entier, à
chaque changement de focus.

**Sélecteurs nommés uniquement.** Si une règle doit couvrir plusieurs
composants, on liste les composants — la liste est plus longue à écrire et
elle est bornée.

**Vérifié dans l'état actuel** : aucun sélecteur universel dans
`style.css` ni dans `syfir-ui/`. La seule occurrence de `*` est le reset
`*, *::before, *::after { box-sizing }`, qui ne porte **aucun état** et ne
se réévalue jamais.

> **Le contrôle** : `grep -n '\*:focus\|\.page-home \*'` doit rendre vide.

---

## Ce que ces deux règles ont en commun

Les deux motifs sont **corrects au sens du CSS** — ils produisent
exactement l'effet demandé. Ce qui les rend fautifs, c'est le **coût de
recalcul**, qu'aucun instrument du harnais ne mesure aujourd'hui : ni le
contraste, ni le débordement, ni les cibles tactiles, ni même l'INP (qui
mesure une interaction ponctuelle, pas une boucle de défilement).

**C'est un angle mort déclaré**, à traiter comme les autres : une limite
signalée et non traitée finit toujours par coûter (`HANDOFF.md` §0,
règle 2). L'instrument qui manque mesurerait le **temps passé en style et
en peinture pendant un défilement continu**.

---

# 3. UNE TROISIÈME OCCURRENCE — et je m'étais trompée de coupable

`tools/qa/recalc.mjs` a été écrit pour combler l'angle mort ci-dessus. Il
a immédiatement **rougi sur les cinq pages mesurées**, alors que le
contrôle statique ne trouvait aucun des deux motifs interdits.

Un rouge uniforme sur cinq pages ressemble à un coût **constant**, pas à
un coût de page. La discrimination l'a confirmé — même page, même
défilement de 5 s, CPU ×4, la seule différence étant
`:root { animation-name: none }` :

| Page | recalcul de style | images en 5 s | pire image |
|---|---:|---:|---:|
| `artistes.html` **avec** l'horloge | **5 311 ms** | **27** (≈5 im/s) | 300 ms |
| `artistes.html` **sans** l'horloge | **349 ms** | **301** (≈60 im/s) | 17 ms |
| `index.html` **avec** | 4 355 ms | 84 | 183 ms |
| `index.html` **sans** | 2 244 ms | 178 | 150 ms |

**15 fois moins de recalcul, 11 fois plus d'images.**

## Pourquoi c'est la même faute que les deux autres

`--syfir-beat` est une propriété **enregistrée** (`@property`) et
**héritée** (`inherits: true`), animée sur `:root` à 116 BPM. Une
propriété héritée qui change **oblige le moteur à réévaluer tout l'arbre**
— c'est le sélecteur universel, sous un autre déguisement, soixante fois
par seconde.

Les trois occurrences partagent exactement la même forme : **un coût
proportionnel à la taille du document, payé à chaque image.**

## Ce qu'il faut retenir de la façon dont ça a été trouvé

`artistes.html` tournait à **5 images par seconde** et **personne ne l'a
vu** — moi compris, alors que je venais d'en regarder les captures et de
les déclarer bonnes. **Une capture est immobile : elle ne peut pas montrer
une fréquence d'images.** L'œil trouve ce que la mesure rate ; ici la
mesure trouve ce que l'œil ne peut structurellement pas voir.

## ⚠ NON CORRIGÉ, ET DÉLIBÉRÉMENT

Le correctif touche `style.css`, exactement le fichier que la reprise
réécrit (+707 lignes). Corriger maintenant fabriquerait un conflit sur le
fichier le plus disputé, à deux jours d'une présentation.

**C'est le premier point à traiter APRÈS l'intégration `REPRISE`**, et il
se retestera d'une commande : `node tools/qa/recalc.mjs --verifie`.

Piste, à vérifier et non à appliquer les yeux fermés : faire porter le
pouls par une propriété **non héritée** (`inherits: false`) et le lire sur
les seuls éléments qui en ont besoin — ils sont quatre, déjà nommés dans
`style.css` (`.btn-gradient.btn-lg`, `.btn-solid.btn-lg`, `.next-cta .btn`,
`.tickets-fab`, plus `.badge-soon`).


---

# ⚠ CORRECTION — J'AVAIS NOMMÉ LA MAUVAISE HORLOGE

La discrimination du premier passage coupait `:root { animation-name: none }`,
ce qui arrête **les deux** horloges de `:root` à la fois. J'ai attribué le
gain au **pouls** (`--syfir-beat`). **C'était une hypothèse présentée comme
une conclusion.**

Le correctif a été appliqué — pouls non hérité, horloge descendue sur les
cinq consommateurs — et **il n'a rien changé** : `artistes.html` restait à
5 354 ms et 27 images. C'est ce démenti qui a imposé la vraie mesure.

## Le vrai coupable, isolé cette fois

Même page, même défilement, une seule chose retirée à chaque essai :

| État | recalcul de style | images en 5 s | pire image |
|---|---:|---:|---:|
| tel quel | **5 050 ms** | 25 | 367 ms |
| **sans `syfir-type-breathe`** | **774 ms** | 59 | 667 ms |
| sans le ciel | 4 931 ms | 35 | 233 ms |
| sans les deux | 2 142 ms | **238** (≈48 im/s) | 50 ms |

**−85 % de recalcul en retirant la seule respiration typographique.** Le
ciel, lui, ne coûte presque rien : 5 050 → 4 931.

`syfir-type-breathe` anime `--syfir-wght` et `--syfir-track`, **toutes deux
`inherits: true`**, sur `:root` et sur une **timeline de défilement** :
tout l'arbre est réévalué à chaque image de défilement. Même faute que les
trois autres, quatrième costume.

## ⚠ POURQUOI CE N'EST PAS CORRIGÉ, ET CE QUE LE PROCHAIN DOIT SAVOIR

**L'héritage est PORTEUR ICI, par conception**, et le fichier l'explique :
l'animation ne peut pas vivre sur le titre (`.reveal.in { animation: … }`
est un raccourci qui écraserait `animation-name` et `animation-timeline` —
mesuré en son temps), donc **la section porte l'animation et le titre
consomme la variable héritée**. Passer `inherits: false` casse la
fonctionnalité.

Le correctif demande donc de **repenser le mécanisme**, pas de changer un
mot-clé — et ce n'est pas une chose à improviser en fin de contexte, sur
le fichier le plus disputé, juste après une intégration.

**Piste à instruire, non à appliquer** : porter la respiration sur les
titres eux-mêmes via une animation SÉPARÉE de `.reveal` (nom d'animation
distinct, listes parallèles comme le fait déjà le bloc scroll-timeline),
ce qui bornerait le recalcul aux titres au lieu du document.

## Ce qui EST corrigé, et qui reste juste

Le pouls est désormais **non hérité** et son horloge tourne sur les cinq
éléments qui la lisent, au lieu du document entier. Le gain est réel mais
**dominé** par la respiration typographique : il ne se verra qu'une fois
celle-ci traitée. `prefers-reduced-motion` et `data-econome` coupent
maintenant le pouls **là où il tourne** — sans ça, le mouvement réduit
aurait laissé battre ce qu'il est censé arrêter.
