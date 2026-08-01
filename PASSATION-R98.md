# Passation R98 — « Lumière de scène », un seul monde, la nuit

> Écrite **avant** de manquer de contexte, pas après. Elle décrit l'état réel du
> dépôt, ce qui reste à faire, et les pièges qui ont déjà coûté cher.
>
> Le détail des mesures point par point est dans **`JOURNAL-R98-NUIT.md`**.
> La loi du dépôt reste **`CLAUDE.md`**, l'identité **`DOCTRINE-SYFIR.md`**.

---

## 1. Où en est le chantier

**Branche `claude/r73-loi-evin`, PR #13, en Draft — elle le reste.** Décision du
superviseur : PR #13 est le fil unique du projet, on n'en ouvre pas de seconde.
L'environnement d'exécution désigne parfois `claude/r73-lumiere-scene-fszixq` :
**ce n'est pas la bonne branche**, elle a été abandonnée à 0 commit d'écart.

### Livré et mesuré

| Lot | Ce qu'il fait |
|---|---|
| **R98/0** | Socle de mesure. Dump `avant-nuit` (56 combinaisons) pris **avant** toute modification, et **projection** de sa moitié sombre en référence de confinement |
| **R98/1-1 → 1-5** | **Le retrait**, site-wide et purement soustractif : grain rendu permanent, 396 lignes de thème clair, sélecteur + anti-flash + §06, La Traversée d'un bloc. Nouvelle référence `nuit-00` |
| **R98/2-1, 2-2** | Les tokens de la nuit, puis le fond de nuit en propriétés longues |
| **R98/3** | Le ciel qui avance : trois couches empilées pilotées par `--p` en rAF |
| **R98/4** | Les quatre faisceaux en `screen` et la brume |
| **R98/4bis** | **La composition** : hero 100svh centré à marque géante, section photo pleine largeur, grille de dates bord à bord |
| **R98/6** | Les photos entrent dans la nuit (opacité .54, contrast 1.1), bouton blanc qui bat à 116 BPM |

### État mesuré à cette passation

- Contraste AA accueil : **0 défaut** (composition *et* pixels peints)
- Débordement horizontal à 390 px : **0**
- LCP accueil : **848 ms** / budget 2 500 · les 14 pages dans le budget
- Confinement : **0 différence** sur les 26 combinaisons hors accueil
- **0 erreur JS** sur les 28 combinaisons
- Les trois acquis (Portail, pouls, sol sous le ciel) : **verts**, mesurés sur le
  résultat par `tools/qa/acquis.mjs`

---

## 2. Ce qui RESTE à faire, par ordre de priorité

### A. Le CLS de l'accueil — mesuré, non expliqué

**Cinq passes propres : 0,0021 quatre fois, 0,0000 une fois.** Les 13 autres
pages sont à **0,0000**. C'est ~50× sous le seuil « bon » de 0,1, mais R94 avait
noté 0,0000 sur l'accueil aussi.

**Je n'ai pas su attribuer le résidu.** L'observateur désigne `DIV.nav-actions`,
or sa largeur est **stable à 222 px** et son nombre d'enfants constant sur
3 secondes : c'est un **déplacement**, pas un redimensionnement, et je n'ai pas
trouvé le moteur.

> **Une expérience à ne PAS refaire, et c'est pour ça qu'elle est écrite ici.**
> Neutraliser les règles de hero R98 à l'exécution donne CLS 0,2027 contre
> 0,0000 — lu vite, « les règles R98 améliorent le CLS de 100× ». C'est **faux** :
> injecter un style après le chargement provoque le décalage **par construction**.
> L'expérience mesure l'injection, pas l'ancien site.

Piste non explorée : mesurer le CLS sur un `git worktree` du commit pré-R98, servi
séparément. C'est la seule comparaison honnête.

### B. L'audit de l'or n'est complet qu'à moitié

Fait, et mesuré : **1,470 %** des pixels de la page entière sont dorés (7 écrans
balayés) — un détail, pas une surface. `.h2 em` est passé du dégradé métallique à
l'or plein (un dégradé de 4,4 rem est une **surface**, ce que la règle interdit).

**Pas fait :** les seuils par élément — point ≤ 4 px, halo ≤ 12 px, croix ≤ 24 px,
ampoule ≤ 6 px. Les **étoiles brillantes, guirlandes et éclat diamant** n'ont pas
été re-mesurés depuis qu'ils sont devenus **permanents** (R98/1-4). Le halo du
bouton, lui, l'a été : **9,49 px max**, seuil 12.

> ⚠ Un audit de l'or **par les règles CSS sur-déclare structurellement** : il a
> annoncé huit « surfaces dorées » dont `a.event-door` à 117 000 px², qui a en
> réalité un fond **crème à 5 %**. Les `em` listés sont des dégradés **clippés au
> texte** : leur boîte englobante n'est pas leur surface peinte. **Mesurer les
> pixels, pas les règles.**

### C. La grille de dates ne peut pas être vue

`baseEvents` est **vide** — mesuré : **0 carte rendue** dans `#nextEvents`. La
règle CSS de la grille bord à bord (filet 2 px, `min-height: 400px`, sans
arrondi) est **écrite et prête**, elle n'a **jamais été rendue à l'écran**.

> **Ne pas inventer d'événements pour la voir : c'est en LISTE ROUGE.** Un état
> vide honnête est la configuration correcte du dépôt. La grille se vérifiera le
> jour où de vraies dates existeront.

### D. Les 13 autres pages — et le piège qui les attend

Elles sont aujourd'hui sur leur **monde sombre**, celui que R96 avait mesuré à
0 défaut AA. Elles n'ont **pas** reçu « Lumière de scène ». Kily a dit qu'elles
pourront emprunter des **accents** aux deux autres maquettes, **jamais une autre
base**.

> **⚠ LE PIÈGE, nommé par deux passations successives : ces pages portent un
> AUTRE voile, `.ambience`, pas `.sky`.** Chercher `.sky` sur elles ne donne rien
> et laisse croire qu'il n'y a rien à faire. `.sky` n'existe que sur
> `index.html`, et `.ambience` y est neutralisée par `.page-home .ambience`.

**Et `.ambience` porte le bug de R97, toujours vivant.** `@keyframes
ambient-grade` anime le **raccourci `background`** : ses cinq étapes (aube →
golden hour → sunset → nuit océan → braise) **sautent** au lieu de dériver, sur
8 pages, depuis R3. Le remède est connu et mesuré : **propriétés longues +
empilement d'opacités** (voir `.sky-grade::before/::after`, mesuré à 12 valeurs
de luminance distinctes sur 12 relevés).

Mesuré sur le dépôt : **14 étapes de keyframes** utilisent encore ce raccourci
dans `style.css`. Le piège est **systémique**.

### E. Deux détails site-wide laissés en suspens, délibérément

- **`meta theme-color`** : passé à `#04070F` sur `index.html` seulement. Les 13
  autres gardent `#071E30` jusqu'à leur propre refonte — un `theme-color` doit
  décrire la page qu'il habille.
- **La description de PR #13** couvre R73 → R96 et **ignore tout R98**. Elle
  annonce encore « 56 combinaisons », « deux thèmes » et « la jointure des deux
  horloges » comme chantier ouvert. **Elle est périmée et doit être réécrite** —
  sans passer la PR en Ready.

---

## 3. Les acquis à ne jamais emporter par accident

Trois choses survivent au retrait et **doivent continuer à survivre**. Elles sont
vérifiées par `tools/qa/acquis.mjs`, qui mesure le **résultat** :

1. **Le Portail (R93)** — il n'a **aucune** règle sélectionnée par un thème (la
   carte du retrait se trompait sur ce point). Il consomme des tokens, rien de
   plus. Vérifié : opacité peinte 1 → 0,41 → 0,14 → … → 0.
2. **Le pouls (R94)** — une horloge sur `:root` anime `--syfir-beat`, des
   consommateurs la lisent. **Ne jamais poser d'`animation` sur un élément
   d'appel** : ça écrase son animation d'entrée. **Ne jamais animer
   `box-shadow`** : ça détruit l'ombre propre. `filter: drop-shadow` se compose.
3. **Le sol sous le ciel (R96)** — `position: relative` sur les quatre blocs de
   premier niveau de l'accueil. **Le ciel de nuit est aussi une couche `fixed`**,
   donc sans cette règle le pied de page redevient invisible, mention loi Évin
   comprise.

> **Défaut latent corrigé en R98/1-4, à connaître** : cette règle R96 visait ses
> quatre blocs en **enfant direct** (`.page-home > .manifesto`), or trois d'entre
> eux vivent dans `<main>` — **elle ne les a jamais atteints**. Seul le pied de
> page, déclaré hors de `<main>`, en bénéficiait. Corrigé en sélecteur descendant
> **avant** de rallumer le ciel.

---

## 4. Le harnais de mesure — et ses onze calibrations

`tools/qa/` contient désormais **huit** outils. Quatre sont nés de R98 :

| Outil | Ce qu'il mesure |
|---|---|
| `ui-diff-hors-index.mjs --theme=` | **La projection** : compare la moitié sombre d'un dump à deux thèmes avec un dump à un seul. C'est ce qui garde la preuve de confinement opposable **pendant** un changement site-wide |
| `acquis.mjs` | Les trois acquis, sur le résultat peint |
| `grain.mjs` | Le grain dithère-t-il, ou bruite-t-il ? Options `--fond` et `--scene` |
| `soiree.mjs` | La soirée avance-t-elle vraiment ? Deux moyens indépendants |
| `debordement.mjs` | Le débordement horizontal à 390 px, **avec le nom des coupables** |

### Les quatre défauts d'instrument trouvés pendant R98 (8ᵉ à 11ᵉ du harnais)

Ils valent d'être connus : **trois d'entre eux auraient fait conclure l'inverse
de la vérité.**

8. **`grain.mjs` effaçait le ciel avec le grain.** Neutraliser par
   `background-image: none` emportait les dégradés *et* la couche ciel — on
   comparait deux fonds différents, pas deux grains. Remède : neutraliser **à la
   source**, dans le token (`--noise: none`).
9. **`debordement.mjs` annonçait 46 débordements, tous faux** — les diapositives
   inactives du carrousel, posées à droite en attendant leur tour. Un élément
   clippé par un ancêtre en `overflow: hidden` **ne peut pas** élargir la page.
   Un outil qui hurle toujours n'est plus lu.
10. **`soiree.mjs` mesurait deux instants différents** — il lisait le mécanisme,
    puis capturait l'image 80 ms plus tard, entre-temps le rAF avait bougé. Il
    relevait `--p = 0,959` en photographiant un ciel à `--p = 0`. **Cinquième
    occurrence de cette famille** sur ce projet. Remède : attendre que `--p` se
    **stabilise**. Un instant, une vérité.
11. **Un faux négatif sur le pouls** : ma regex prenait la première longueur de
    `drop-shadow(couleur 0px 0px 7.12px)` — le décalage horizontal, pas le flou —
    et annonçait « le bouton ne pulse pas ». Sans second moyen, j'aurais
    « corrigé » un pouls qui fonctionnait.

> **La règle qui a servi onze fois : ne jamais déclarer un défaut NI une
> réussite sur la foi d'un seul instrument.** Et mesurer le **résultat**, jamais
> le câblage — un test qui vérifie qu'une propriété est *déclarée* ne prouve rien.

---

## 5. Ce que le monde unique a dissous, et qu'il ne faut pas rouvrir

**La jointure des deux horloges (R96, R97) n'a plus d'objet.** Il n'y a plus de
bascule d'encre : l'encre est crème en permanence, sur des fonds qui vont de
`#04070F` à `#0A1226` — **16,5:1**. Les 49 défauts structurels et la bande morte
`L ∈ [0,168 ; 0,243]`, où aucune encre de la charte ne tenait 4,5:1, ne sont plus
jamais traversés.

**L'arbitrage R97 A/B/C est clos et les trois variantes sont supprimées.** Ce qui
en a été gardé, et qui est mesuré : le **mécanisme** de C — empiler des couches
dont on pilote l'opacité. 12 valeurs de luminance distinctes sur 12 relevés,
contre 3 sur tout le parcours pour le raccourci `background`.

**Le risque de lisibilité n'a pas disparu : il s'est déplacé.** Il vit désormais
entièrement sur les **photos plein cadre** — le seul endroit où du texte se pose
encore sur du clair. Mesurer au **90ᵉ centile** du fond, jamais à sa moyenne : un
texte illisible sur la partie claire d'une photo passe une moyenne.

---

## 6. Liste rouge — on s'arrête et on demande

PR en Ready ou fusionnée · `FORM_ENDPOINT`, Shotgun, newsletter · `avyr-site/` ·
inventer une équipe, un artiste, un témoignage ou un logo (**il n'y a pas
d'équipe, Unity 141 est le seul artiste réel — cette absence est la configuration
correcte**) · visuel produit hors `partenaire-avyr.html` · mention d'alcool ou
affirmation juridique · dépendance ou étape de build · **supprimer une
fonctionnalité**.

> Sur ce dernier point, R98 a tenu la ligne : le carrousel du hero garde ses cinq
> diapositives, les flèches de la rangée de dates sont **masquées** et non
> retirées du HTML, le décor de nuit (étoiles, brillantes, filantes, guirlandes)
> a été rendu **permanent** plutôt que supprimé avec les paliers qui le
> conditionnaient.

---

## 7. Et la leçon qui vaut plus que tout le programme

Kily a ouvert le site dans son propre navigateur : **« visuellement, le site ne
donne pas envie. »** Aucune de nos mesures ne pouvait dire ça.

Ça s'est reproduit **à l'intérieur même de R98** : après le lot 4, tous les
indicateurs étaient verts — 0 défaut AA, 0 débordement, LCP dans le budget,
confinement parfait — et la capture montrait un hero de **plein jour turquoise**
sur un site de nuit. Le ciel et les faisceaux étaient là, intégralement
recouverts par une photo à pleine opacité.

> **Le harnais prouve qu'on n'a rien cassé. Il ne dit jamais si c'est beau.**
> Rendre, capturer, critiquer la capture, corriger. C'est le réel qui tranche —
> et sur le visuel, c'est Kily.
