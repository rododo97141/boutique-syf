# Journal R98 — UN SEUL MONDE, LA NUIT

Refonte « Lumière de scène », maquette 3, **validée telle quelle par Kily**
(rien à ajouter, rien à retirer). Une ligne par point livré, avec ses **mesures
réelles**.

Règle de gouvernance appliquée à chaque ligne, et elle a sauvé sept fois sur le
programme précédent : **aucun défaut ni aucune réussite n'est déclaré sur la foi
d'un seul instrument.** Le second moyen est nommé.

> **La leçon qui a déclenché ce lot, et qui vaut plus que lui.** Kily a ouvert le
> site dans son propre navigateur : « visuellement, le site ne donne pas envie ».
> Aucune de nos mesures ne pouvait dire ça. Le harnais prouve qu'on n'a rien
> cassé ; **il ne dit jamais si c'est beau.** Tout ce qui suit est mesuré — et
> rien de ce qui suit ne prouve le désir.

---

## ⚠ CONSIGNÉ AVANT TOUT — un bug vivant sur les 8 autres pages

Découvert en instruisant le plan R98, **hors du périmètre de ce lot**. Écrit ici
au premier commit plutôt qu'en fin de programme : il ne vivait jusque-là que dans
une conversation, c'est-à-dire nulle part — et c'est exactement l'angle mort qui a
coûté cher deux fois sur ce chantier.

**`@keyframes ambient-grade` anime le raccourci `background`** (`style.css`,
§40). C'est le voile `.ambience` — celui des **8 autres pages**, neutralisé sur
l'accueil par `.page-home .ambience { display: none }`.

C'est **le bug exact qui a coûté tout R97** : le composant image d'un
`background` animé en raccourci est traité en **discret**. Les cinq étapes de
`ambient-grade` (aube → golden hour → sunset → nuit océan → braise) ne
s'interpolent donc pas — elles **sautent**. L'ambiance annoncée comme une dérive
lente est en réalité une succession de paliers, sur 8 pages, depuis R3.

Mesuré sur le dépôt : **14 étapes de keyframes** utilisent le raccourci
`background:` dans `style.css`. Le piège est systémique, pas ponctuel — et le
commentaire de §39 le nommait déjà (« vaut aussi pour `background`, `transition`,
`mask`, `grid` »). La règle était écrite ; elle n'a été appliquée nulle part.

> **Pour la session des 13 autres pages :** c'est `.ambience` qu'il faut
> regarder, **pas le ciel**. Chercher `.sky` sur ces pages ne donne rien et
> laisse croire qu'il n'y a rien à faire. Le remède est connu et mesuré :
> propriétés longues + empilement d'opacités (voir R98/3 ci-dessous).

---

## Les deux corrections que la vérification a apportées à la carte du retrait

La carte a été **vérifiée contre le code avant d'être suivie**, et non crue sur
parole. Ses chiffres sont exacts au chiffre près (13 pages `#themeSwitch`, 14
`data-theme-pref`, 396 lignes de thème clair, 9 de sombre, `class="sky"` sur la
seule `index.html`). Deux de ses conclusions, en revanche, étaient plus
pessimistes que le réel — et les deux **rendent le chantier plus sûr** :

1. **Le Portail (R93) n'a AUCUNE règle sélectionnée par un thème.** La carte
   annonçait « 18 règles dépendantes du thème, ses surcharges claires doivent
   être retirées ». Mesuré sur le bloc `.portal` : **0** sélecteur `data-theme`,
   **19** consommations de tokens `var(--…)`. Les « dépendances » portent sur les
   **valeurs** des tokens, pas sur le **sélecteur** de thème.
   *Second moyen, indépendant du grep :* le commentaire du bloc l'énonce
   lui-même — « Le voile est nuit profonde dans les deux thèmes… Aucune surcharge
   claire — c'est délibéré. »
   **Conséquence : il n'y a rien à retirer dans le Portail.** Il traverse le
   retrait sans être touché, puisque le sombre est la base.

2. **Le pouls (R94) est découplé par construction.** Bloc R94 complet
   (`style.css` 4184-4450) : **0** occurrence de `data-theme` ou `data-sky`. La
   forme retenue en R94 — une horloge sur `:root`, des consommateurs qui lisent
   une variable — l'a mis hors d'atteinte. Il n'entre dans l'ordre de retrait à
   aucune étape.

> Les deux acquis que la carte demandait de « sauver du retrait » sont en fait
> **hors de sa trajectoire**. C'est le meilleur résultat possible, et il est
> mesuré, pas espéré.

---

## R98/0 — LE SOCLE DE MESURE

| Livré | Mesures réelles |
|---|---|
| Dump `avant-nuit` (56 combinaisons) sur le code intact, **avant toute modification** · projection de la moitié sombre en référence de confinement · option `--theme=` ajoutée à `ui-diff-hors-index.mjs` | Déterminisme prouvé : 2 dumps du même code → **0 différence** · **0 erreur JS** sur les 56 combinaisons, deux fois · projection sombre : **26** combinaisons hors accueil, **0 différence** · garde-fou du filtre vérifié par un **essai négatif** : un thème inexistant sort en **échec** (code 1), pas au vert |

### La baseline n'est pas reconstruite — elle est projetée

La carte concluait : « tous les dumps de référence antérieurs deviennent
incomparables, nouvelle baseline obligatoire ». C'est **vrai de l'accueil**, qui
est refondu. C'est **faux de la preuve de confinement**, et c'est ce qui la sauve.

Le harnais mesure 14 pages × **2 thèmes** × 2 viewports = 56. Le retrait fait
perdre **une** dimension, pas deux. Le sombre est le monde qui survit : comparer
la moitié sombre d'un dump à deux thèmes avec un dump à un seul thème met les
deux dans le **même référentiel**.

La preuve de confinement reste donc **opposable pendant** le changement
site-wide — au lieu d'être reconstruite après lui, auquel cas elle ne prouverait
plus rien sur la transition elle-même, c'est-à-dire sur le seul moment où le
risque existe.

### Le garde-fou qui manquait à l'outil, et pourquoi il compte

Un filtre de projection mal orthographié retient **0 combinaison** et affiche
« 0 différence » — soit un **vert sur zéro donnée**. C'est la forme la plus
dangereuse de faux positif : elle ressemble exactement à un succès.

L'outil sort désormais en **échec** quand l'ensemble retenu est vide, et le
comportement a été vérifié par un **essai négatif délibéré** (`--theme=nuit`,
inexistant → code 1). Un instrument qui peut passer au vert sans rien mesurer ne
prouve rien : c'est la septième variante de la leçon du programme précédent.

---

## Ordre de retrait retenu, et ce qui le dicte

Le principe : **le sombre est la base, le clair n'est qu'une couche de
surcharges.** Mesuré sur les 396 lignes de thème clair — 276 `color`, 84
`background`, 79 `border-color`, 19 `box-shadow`, 5 tokens, et **AUCUNE** ligne
de géométrie, de mise en page ou de comportement. On ne « choisit » donc pas la
nuit : on **retire ce qui la recouvrait**.

Chaque commit doit laisser la page rendable. C'est ça qui impose l'ordre :

1. les 9 règles `data-theme="dark"` deviennent **inconditionnelles** (grain
   compris) — le rendu sombre cesse de dépendre d'un attribut ;
2. retrait des **396 lignes** de thème clair — il n'y a plus qu'un monde ;
3. retrait du sélecteur, du script anti-flash et de §06 — l'attribut cesse
   d'être posé, et plus rien ne le lit ;
4. retrait de **La Traversée** d'un seul bloc — `data-sky`, §46, §47, `PISTES`,
   les 3 keyframes, les plafonds §39.3. **La dépendance triple se retire
   ensemble ou pas du tout.**

### Ce que le monde unique dissout, et qui occupait tout R96 et R97

**La jointure des deux horloges disparaît.** Il n'y a plus de bascule d'encre :
l'encre est crème, toujours. Les **49 défauts structurels** et la bande morte
`L ∈ [0,168 ; 0,243]` — où aucune encre de la charte ne tenait 4,5:1 — n'ont plus
d'objet, la palette de nuit n'y entrant jamais.

Le risque de lisibilité ne disparaît pas : il **se déplace**, entièrement, sur
les **photos plein cadre à opacité .5-.56** — le seul endroit où du texte se
posera désormais sur du clair. C'est là que la mesure doit porter, et nulle part
ailleurs.

---

## LOT 1 — UN SEUL MONDE (soustractif, site-wide)

| Point | Livré | Mesures réelles |
|---|---|---|
| **R98/1-1** | Le grain devient permanent, **explicitement** | Sombre : **0 différence** sur 26 combinaisons, valeur identique au caractère près · Clair : 0 différence, et la **cause est nommée** — `html[data-theme="light"] body` utilise le raccourci `background`, qui remet `background-image` à `none` · instrument contrôlé : `ui-dump` relève bien `backgroundImage` et rend l'URL du grain en toutes lettres |
| **R98/1-2** | Retrait des **396 lignes** de thème clair · style.css 5234 → 4820 | Confinement **0 différence** (26 combos) · **preuve indépendante** : écarts clair vs sombre **1426 → 12**, et les 12 sont tous sur l'accueil ; hors accueil **0 écart sur 20 950 propriétés** · contraste AA `evenements.html` : **0 défaut** |
| **R98/1-3** | Retrait du sélecteur (13 pages), du script anti-flash (14), de §06 (64 lignes) et du CSS orphelin (45 lignes) | Exactement **4 classes** de différences, toutes expliquées : 24 × `.theme-btn` absent, 24 × `.nav-actions` −58 px, 4 × hauteur de `confidentialite.html` · **largeurs inchangées** (390 / 1440) : aucun débordement introduit · harnais **56 → 28** dans le même commit |
| **R98/1-4** | La Traversée retirée d'un bloc + les 3 variantes R97 + le décor de nuit rendu permanent | Confinement **0 différence** (26 combos) · **les 3 acquis mesurés sur le résultat** (voir ci-dessous) · LCP accueil **612 ms** / 2500 |
| **R98/1-5** | Nouvelle référence `nuit-00` (28 combinaisons) · balayage LCP | **14 pages dans le budget**, pire page `partenaires.html` **1 380 ms** / 2 500, accueil **624 ms** · **0 erreur JS** sur les 28 |

### Les trois acquis, mesurés sur le résultat et non déduits

`tools/qa/acquis.mjs` — nouveau. « Hors trajectoire du retrait » était une
déduction ; ceci est une mesure.

- **Le Portail** se lève réellement : opacité **peinte** 1 → 0,41 → 0,14 → 0,05
  → 0,015 → 0,004 → 0, **8 valeurs distinctes**, et il cesse de bloquer la page.
- **Le pouls** bat toujours : horloge `:root` à **517 ms (116 BPM)**, confirmée
  par deux moyens (l'API d'animation *et* la valeur calculée) ; et surtout
  `--syfir-beat` **varie réellement** — 8 valeurs distinctes sur 8 relevés. Une
  variable déclarée qui ne bouge pas serait un pouls mort qu'aucune lecture de
  code ne distinguerait d'un pouls vivant.
- **Le sol sous le ciel** tient : les 4 blocs en `position: relative`, et la
  mention loi Évin à **18,05:1 sur le pixel peint**.

### Le défaut latent de R96, trouvé avant de rallumer le ciel

La règle « le sol sous le ciel » visait quatre blocs en **enfant direct**
(`.page-home > .manifesto`). Or `.manifesto`, `.marquee` et `.next-events`
vivent dans `<main id="main">` : **la règle ne les a jamais atteints.** Mesuré :
position calculée `static` sur les trois, `relative` sur le seul pied de page —
le seul déclaré hors de `<main>`.

R96 croyait donc avoir corrigé quatre blocs ; il en a corrigé un. Le défaut ne
se voit **que si un ciel peint par-dessus** : il l'était en R96, il le
redeviendra au lot 3, et il aurait rendu ces trois blocs invisibles exactement
comme le pied de page l'a été. Corrigé **avant** de rallumer le ciel, pas après.

> C'est la même leçon que R96 lui-même : le défaut n'était pas là où l'audit
> regardait. Et c'est la deuxième fois que la règle « vérifier par un second
> moyen » attrape quelque chose que la lecture du code donnait pour acquis.
