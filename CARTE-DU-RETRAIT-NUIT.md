# Carte du retrait — vers un seul monde, la nuit

> Document écrit à la clôture de la session R93→R97, pour la session qui prendra
> la suite. **Tous les chiffres qui suivent ont été MESURÉS** sur l'état du dépôt
> au 31/07 (commit `d86a5d6`), pas estimés de mémoire.

---

## DIRECTION RETENUE — maquette 3, « Lumière de scène »

Kily a choisi la **maquette 3, LUMIÈRE DE SCÈNE**, et l'a validée **telle quelle,
rien à ajouter ni à retirer** :

- **nuit bleue profonde**
- **faisceaux de projecteurs**
- **brume**
- **grandes photos plein cadre**
- **l'or en détail seulement**

Règles qui en découlent :

- **Un seul monde, la nuit.** Plus de bascule clair / sombre.
- **La soirée avance au défilement** — début de soirée → cœur de nuit — **à
  l'intérieur de la nuit**. Ce n'est plus un passage jour→nuit.
- Les **autres pages** pourront emprunter des **accents** aux deux autres
  maquettes, **jamais une autre base**.

Ce qui a déclenché ce virage, et qui mérite d'être retenu : Kily a ouvert le site
dans son propre navigateur. **« Visuellement, le site ne donne pas envie. »**
Aucune de nos mesures ne pouvait dire cela. Le harnais prouve qu'on n'a rien
cassé ; il ne dit jamais si c'est beau.

---

## Ce que coûte le retrait — mesuré, pas deviné

### HTML — 14 pages sur 18, mais du copier-coller identique

| Élément | Portée |
|---|---|
| Bloc sélecteur de thème (`id="themeSwitch"`) | **13 pages** |
| Script anti-flash du `<head>` (`data-theme-pref`) | **14 pages** |
| `meta theme-color` | **14 pages**, déjà figé à `#071E30` |

Ce sont des **blocs strictement identiques** répétés page à page : un seul motif à
retirer, appliqué 14 fois. **Aucune structure de page n'en dépend.**

> ⛔ **`avyr-site/` en porte 11 de plus — HORS PÉRIMÈTRE. Ne pas y toucher.**

### CSS — ~9 % du fichier, et uniquement de la couleur

Sur **5 215 lignes** de `style.css` :

| Motif | Lignes |
|---|---|
| `data-theme="light"` | **396** |
| `data-theme="dark"` | **9** |
| `data-sky` | **72** |
| `data-theme-pref` | **11** |

Et surtout, **la nature de ces lignes** — c'est le chiffre qui compte :

| Propriété redéfinie | Occurrences |
|---|---|
| `color` | **276** |
| `background` | **84** |
| `border-color` | **79** |
| `box-shadow` | **19** |
| redéfinitions de tokens | **5** |
| **géométrie, mise en page, comportement** | **AUCUNE** |

Retirer le thème clair **ne déplace pas un pixel de structure**.

### JS — 25 occurrences, 3 blocs délimités

- le **menu de thème** ;
- **La Traversée**, `script.js` §46 (paliers du ciel) ;
- son **repli** sans scroll-timeline, §47.

Rien d'autre ne lit le thème.

---

## LE FAIT QUI CHANGE TOUT

**`class="sky"` et `data-sky-stage` n'existent QUE dans `index.html`.**

La Traversée est **déjà confinée à une seule page**. La retirer, c'est toucher une
page — pas quatorze.

---

## Le piège à ne pas manquer

Les **8 autres pages** portent un **AUTRE voile : `.ambience`**. Il est neutralisé
sur l'accueil (La Traversée le remplaçait) mais **actif partout ailleurs**.

> Pour l'ambiance des autres pages, c'est **`.ambience` qu'il faudra regarder, pas
> le ciel**. Chercher `.sky` sur ces pages ne donnera rien et laissera croire
> qu'il n'y a rien à faire.

## La dépendance triple

`PISTES` (`script.js` §47) encode les trajectoires du ciel par préférence de
thème. Son propre commentaire l'annonce : il doit rester synchronisé avec **les
keyframes CSS §39.2** et **les plafonds §39.3**.

**Trois endroits couplés — à retirer ensemble, ou pas du tout.** En retirer un
seul laisse le site dans un état incohérent que rien ne signalera.

## Les deux acquis à sauver du retrait

1. **Le Portail (R93) a 18 règles dépendantes du thème.** Le voile d'entrée est
   déjà nuit profonde dans les deux thèmes — il survivra sans peine — mais ses
   surcharges claires doivent être retirées, pas oubliées.
2. **Le grain `--noise` (R94) est conditionné au thème sombre.** S'il n'y a plus
   qu'un monde de nuit, **il devient permanent**. C'est probablement souhaitable
   pour « lumière de scène » — mais c'est une décision à prendre, **pas un effet
   de bord à subir**.

## Le harnais QA

`tools/qa/` mesure aujourd'hui **14 pages × 2 thèmes × 2 viewports = 56
combinaisons**. Avec un seul thème il tombe à **28**.

La **preuve de confinement reste valable** dans son principe, mais **tous les
dumps de référence antérieurs deviennent incomparables** : ils contiennent une
dimension qui n'existera plus.

> **Nouvelle baseline obligatoire le jour du basculement.** Sans quoi le premier
> diff après refonte affichera des milliers de différences et ne prouvera rien.

---

## La conclusion, telle qu'elle a été formulée

> **Le gros du travail n'est pas la suppression : c'est de choisir les nouvelles
> valeurs de ces 276 `color` et 84 `background` une fois qu'il n'y a plus qu'un
> monde.**

---

## À la décharge de la variante B — ne pas en tirer une fausse leçon

Les captures de `tools/qa/comparaison-r97/` montrent, en thème sombre, des
demi-teintes boueuses sur la rangée B et un « AVYR » presque effacé à 70 %.

**Cela venait d'un bug de mon implémentation de B, pas du concept.** Mon override
remplaçait l'animation du ciel pour **tous** les thèmes, en ignorant les variantes
que §39.3 sélectionne par préférence : en sombre, B empilait les couches jour et
doré au lieu de partir au crépuscule. La variante C, écrite ensuite, respecte ces
variantes et n'a pas ce défaut.

Si une session future relit ces captures, qu'elle sache que **B a été écartée sur
mon erreur, pas sur son idée** — au cas où le mécanisme d'empilement d'opacités
resservirait. Il est, lui, parfaitement valide : mesuré à **11 valeurs de
luminance distinctes sur 12 relevés**, là où le raccourci `background` des
keyframes n'en produisait que **3** sur tout le parcours.

---

## État laissé en place

- **R97 est suspendu** (cf. `JOURNAL-R93-R95.md`) : l'arbitrage A / B / C **n'est
  plus ouvert**.
- Les trois variantes **restent en place** — A active par défaut, B et C derrière
  `data-r97` — le temps que la refonte soit cadrée. **Rien à supprimer sans
  mandat.**
- **PR #13 en Draft**, jamais Ready, jamais fusionnée.
