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
