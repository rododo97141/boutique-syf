# R103 — LA BARRE DU HAUT, LA PHOTO, ET LA LISTE DES SURVIVANTS

Trois demandes de Kily, dans l'ordre où elles ont été traitées, puis la
liste complète qu'il a réclamée pour trancher lui-même.

> « Fais la liste de ces survivants et donne-la-moi ; je tranche ce qui
> reste et ce qui part, mais je veux la liste complète. »

Et le changement de méthode qui commande tout le reste :

> « À partir de maintenant, chaque lot livre dans `tools/qa/captures/` une
> pleine page de l'accueil ET la même pleine page de la maquette, même
> viewport, voile levé, animées figées. C'est ce que je regarderai en
> premier, avant tout tableau. »

C'est fait : `tools/qa/captures/` n'est pas gitignoré, les quatre images
`r103-{accueil,maquette}-{desktop,390}.png` sont dans le dépôt.

---

## 1. Le décor d'étoiles R92 — retiré

440 lignes de CSS orphelin (`§39.35 → 39.395`). Le balisage était déjà
parti ; le CSS, non. `grep` sur `sky-stars|star-bright|star-shoot|garland|
eclat-diamant` renvoie **0** dans `style.css` comme dans `index.html`.
Accolades revérifiées après coup (solde final 0, minimum 0) — la leçon de
R102, où une suppression par intervalle avait emporté 785 lignes parce
qu'un intervalle est aveugle à ce qu'il enjambe.

## 2. La photo du hero — elle ne se peignait pas

Kily demandait de vérifier « sur les pixels, pas sur le CSS ». Bien lui en
a pris.

**Moyen 1 — différentiel de masquage.** On masque `.hero-photo`, on
recapture, on compare. Sur la maquette l'écart est de **12** ; sur
l'accueil il était de **0** : masquer la photo ne changeait rien, donc
elle ne peignait rien. Un `getComputedStyle` sur `.hero-photo img` aurait
répondu « visible, opacité 1, boîte 1527×954 » — et se serait trompé.

**Cause :** `main` n'était pas positionné. `.hero-photo` est en
`z-index: -1` ; sans contexte d'empilement sur `main`, elle passait
*derrière* la couche ciel. Remède : `.page-home main { position: relative;
z-index: 3 }`. **Écart remesuré après : 19.**

## 3. La barre du haut — celle de la maquette

> « retire ceci et mets le visuel de la maquette 3 à l'identique, retire
> tout le reste SAUF le menu recherche et profils »

Les deux cercles cerclés d'or sont partis. Mesuré sur la barre en place :
fond `linear-gradient(rgba(4,7,15,.9), rgba(4,7,15,.2))`, liseré
`rgba(238,242,248,.08)`, `backdrop-filter: blur(14px)`, 4 liens texte,
3 outils, `border-width: 0px`, `border-radius: 0px`, fond transparent sur
les outils. Aucun cercle.

## 4. Trouvé en chemin — le voile d'ambiance R3 était encore actif

`.page-home .ambience { display: none }` avait **disparu dans une de mes
réécritures**. Le voile golden-hour peignait à `z-index: 40`, au-dessus de
`main` (z 3). La div est retirée d'`index.html`. Coin peint après :
`3,5,12` contre `4,7,16` côté maquette.

## 5. Trouvé en chemin — le fond de la page était l'ENCRE, pas la NUIT

Le plus gros écart visible des captures, et il était **maquillé en
exception documentée** depuis cinq lots. `maquette.mjs` tolérait
`body.backgroundColor` avec pour motif : « le fond de l'accueil est peint
par la couche `.sky` ». Une excuse déguisée en exception — exactement ce
que l'en-tête de ce bloc de tolérances interdit.

La mesure l'a démentie : le body de l'accueil est à `#111` (l'Encre —
`r = g = b`, gris **neutre**) quand la maquette pose `--nuit-0` `#04070F`
(bleu). Tant que la couche fixe `.sky` couvre la fenêtre, personne ne voit
la différence. Mais `.sky` est `position: fixed` et **ne se peint qu'une
fois dans une capture pleine page** : sur les images que Kily regarde, la
moitié de l'accueil sortait en **gris neutre** là où la maquette est
bleue — le manifeste et l'écosystème, deux des six blocs.

Bandes de fond mesurées tous les 12,5 % de la hauteur, avant :

| | 0 % | 13 % | 25 % | 38 % | 50 % | 63 % | 75 % | 88 % | 100 % |
|---|---|---|---|---|---|---|---|---|---|
| accueil | 3,5,10 | 18,17,20 | 4,9,19 | **17,17,17** | 3,6,14 | **17,17,17** | **17,17,17** | **17,17,17** | 4,7,15 |
| maquette | 4,7,16 | 3,7,15 | 3,7,16 | 6,14,31 | 4,7,15 | 4,7,15 | 32,41,59 | 10,20,43 | 9,17,34 |

Remède : `.page-home { background-color: #04070f }`. La tolérance est
**retirée** de `maquette.mjs` — elle ne peut plus excuser le retour du
défaut. Conformité après : **0 écart** aux deux tailles, 11 tolérés (un de
moins qu'avant, et celui qui reste est nommé pour ce qu'il est).

## 6. La police en serif des captures n'est PAS un écart

Sur les images, les titres de la maquette sortent en **serif** et ceux de
l'accueil en **sans**. Ne pas « corriger » ça.

`document.fonts.size` vaut **0** des deux côtés : aucun webfont ne se
charge dans le conteneur, qui n'a pas accès à `fonts.googleapis.com`. Les
familles déclarées sont identiques (`Unbounded`, `Fraunces`,
`Plus Jakarta Sans`) — `maquette.mjs` le vérifie et compte 0 écart. Seule
la **chaîne de repli** diffère : la maquette écrit `"Unbounded"` nu (repli
= serif par défaut), le site `'Unbounded', sans-serif`. Sur la machine de
Kily, où les polices se chargent, les deux rendent Unbounded.

---

# LA LISTE COMPLÈTE DES SURVIVANTS

Relevé par différence de DOM entre `index.html` et
`maquettes/3-LUMIERE-DE-SCENE.html`, rendus dans le même navigateur, au
même viewport, voile levé. **73 classes** et **49 identifiants** existent
sur l'accueil et pas dans la maquette.

Personne n'avait cherché ça : les 75 écarts de R101 étaient **tous** des
choses présentes des deux côtés avec des valeurs différentes. Ce qui
n'existe que d'un seul côté n'était mesuré par aucun instrument.

Je ne tranche rien ici. Je classe, je dis à quoi ça sert, et je signale ce
qui casserait si ça partait.

## A. Le Portail — ACQUIS PROTÉGÉ (R93)

`.portal` · `.portal-inner` · `.portal-mark` · `.portal-line` ·
`.portal-enter` · `.portal-quiet` · `#portal` · `#portalTitle` ·
`#portalEnter` · `#portalQuiet`

La porte d'entrée : « SYFIR™ — La fête commence ici. » avec « Entrer dans
la fête » / « entrer sans le son ». **Absent de la maquette parce que la
maquette est une maquette**, pas parce qu'il a été rejeté. Vérifié encore
ce lot : le voile se lève réellement (opacité peinte 1 → 0,409 → 0,163 →
0,075 → 0,028 → 0,009 → 0,002 → 0, huit valeurs distinctes).

⚠ **Toutes les mesures de ce lot lèvent ce voile par `localStorage`.** Si
le Portail part, rien ne casse ; mais il faut le dire, parce que c'est la
première chose qu'un visiteur voit et qu'aucune capture ne le montre.

## B. La navigation réelle — sans elle il n'y a pas de site

`.nav-outils` · `.outil` ×3 · `.nav-sound` · `.snd-dot` · `.burger` ·
`.mobile-nav` · `.mobile-close` · `.mobile-nav-util` · `.mobile-nav-foot` ·
`#nav` · `#searchBtn` · `#clientSpaceBtn` · `#soundBtn` · `#burgerBtn` ·
`#mobileNav` · `#closeNav` · `#clientSpaceBtnMobile`

Recherche et profil : **Kily les a explicitement gardés.**

Deux écarts que je signale au lieu de les décider :

- **Le burger** — la maquette, à 390 px, se contente de **masquer ses
  liens** et ne met rien à la place : elle n'a aucune navigation sur
  mobile. Un site ne peut pas. Gardé ; à confirmer.
- **Le bouton son** (`.nav-sound`, `.snd-dot`, `#soundBtn`) — acquis du
  Portail (choix « entrer sans le son »), il porte l'état sonore choisi à
  l'entrée. Le retirer laisserait ce choix sans commande.

## C. Le méga-menu — le plus gros bloc de la liste

`.mega` · `.mega-top` · `.mega-logo` · `.mega-search` · `.mega-close` ·
`.mega-body` · `.mega-side` · `.mega-side-group` ×2 · `.mega-side-head` ×2 ·
`.mega-content` · `.mega-results` · `.mega-panels` · `.mega-row` ·
`.mega-row-head` · `.mega-envies` · `.mega-envie` ×4 · `#megaMenu` ·
`#megaSearch` · `#megaClose` · `#megaResults` · `#megaPanels`

Le panneau pleine largeur avec la recherche et « Parcourir par envies »
(Fête · Plage · Concert · Privé). C'est lui que `#searchBtn` ouvre. **Si
le méga-menu part, le bouton recherche que Kily a gardé n'ouvre plus
rien** — les deux se tranchent ensemble.

C'est aussi le porteur du panneau **AVYR cocktail** à trois entrées
(amendement R15/R19 du CLAUDE.md).

## D. L'espace client

`.modal` · `.modal-box` · `.modal-box-sm` · `.modal-close` ·
`.modal-body` · `.tabs` · `.tab` ×5 · `.tab-panel` ×5 · `.subtabs` ·
`.subtab` ×2 · `.form-field` ×8 · `.field-error` ×8 · `.btn-full` ×5 ·
`.btn-ghost` ×2 · `.cart-empty` · `.danger-link` · `.active` ×3 ·
`#clientModal` · `#clientTitle` · `#clientTabs` · `#panel-tickets` ·
`#ticketSubtabs` · `#myTickets` · `#panel-favs` · `#myFavs` ·
`#panel-profile` · `#profName` · `#profEmail` · `#profCity` ·
`#logoutBtn` · `#deleteProfileBtn` · `#panel-login` · `#clEmail` ·
`#clPass` · `#panel-register` · `#rgName` · `#rgEmail` · `#rgPass`

Billets, favoris, profil, connexion, inscription. Ouvert par
`#clientSpaceBtn` — l'autre bouton que Kily a gardé. Même remarque qu'en C :
**garder le bouton profil et retirer la modale laisserait un bouton mort.**

`#deleteProfileBtn` et `#logoutBtn` portent des obligations RGPD
(cf. `LEGAL-RESPONSIBILITIES.md`) : ce ne sont pas des ornements.

## E. Le pied de page du site

`.container` · `.footer-grid` · `.footer-brand` · `.footer-logo` ·
`.footer-col` ×4 · `.footer-news` · `.footer-news-row` ·
`.footer-news-msg` · `.form-demo-note` · `.hp-field` · `.btn-sm` ·
`.btn-solid` ×4 · `.brand-sign` · `.brand-sign-slogan` · `.footer-bottom` ·
`#nlEmail`

La maquette a un pied de page **de maquette** : un grand SYFIR, une phrase,
la mention sanitaire. Le site a quatre colonnes de liens (Explorer,
Artistes, SYFIR TV, Légal), la signature R84 « Tes prochains souvenirs
commencent ici. », le formulaire newsletter et la ligne de copyright.

⚠ Les liens **Mentions légales / CGV / Confidentialité** sont des
obligations, pas du décor. `.hp-field` est le pot de miel anti-robot du
formulaire. `.form-demo-note` affiche « démo — transmission bientôt
active » : le formulaire est **volontairement inactif** (liste rouge,
`FORM_ENDPOINT` non activé).

Le grand SYFIR du pied de page et la mention sanitaire, eux, sont dans la
maquette — ils ne sont pas dans cette liste.

## F. Confort de lecture et de service

`.skip-link` · `.to-top` · `#toTop` · `.scroll-progress` ·
`#scrollProgress` · `.toast` · `#toast` · `.img-fade` ×3 · `.img-in` ×3

- `.skip-link` « Aller au contenu » : accessibilité au clavier.
- `.to-top` / `.scroll-progress` : confort de défilement.
- `.toast` : les messages du site (ajout aux favoris, erreurs de
  formulaire). Sans lui, ces retours n'ont plus d'endroit où s'afficher.
- `.img-fade` / `.img-in` : fondu d'arrivée des images. Mesuré ce lot,
  LCP mobile CPU ×4 = **300 ms** pour un budget de 2500.

## G. La couche ciel

`.sky`

La maquette pose `.nuit` et `.projos` **directement en `position: fixed`**.
Le site les enveloppe dans un `.sky` fixe unique (`contain: layout paint
style`). Différence de structure, pas de rendu : les opacités et les
boîtes des six couches sont **identiques au millième** des deux côtés
(mesuré à 38 % et 75 % de la page). Ce wrapper est ce qui permet de
confiner le décor à `.page-home` sans toucher aux 14 autres pages.

## H. Le grain

Le body porte `--noise`, un `url(data:image/svg+xml…)`. La maquette n'a
aucune image de fond sur le body.

`grain.mjs` tranche : **« Le grain n'apporte RIEN de mesurable sur ce
fond »** — amplitude 0,05875 contre 0,05876 sans lui. Kily avait posé la
règle en R98 : « retire-le s'il devient du bruit ». Il est mesurable comme
nul. **Je ne l'ai pas retiré d'autorité** — c'est une suppression, donc
liste rouge. La tolérance correspondante dans `maquette.mjs` porte
désormais son vrai nom : « survivant soumis à arbitrage ».

## I. Les dates de démonstration — À RETIRER AVANT PUBLICATION

`.badge-demo` ×4

Commit **`f20ea5a`**, préfixé « DEMO — », ne contenant que les données,
révocable en une commande. Les quatre badges « Exemple » sont visibles sur
les cartes de l'accueil comme demandé.

## J. Deux entrées de la liste qui n'en sont pas

`.[object` et `.SVGAnimatedString]`, ×14 chacune : **artefact de mon propre
script de relevé**, qui lisait `el.className` sur des `<svg>`, où cette
propriété est un objet et non une chaîne. Ce ne sont pas des classes.
Je les laisse écrites ici plutôt que de les effacer en silence : une liste
« complète » dont on a retiré les scories sans le dire n'est plus une
mesure.

---

# CE QUI MANQUE — l'autre sens de la différence

## `.rev` ×22 et `.in` — les apparitions à l'entrée

**La maquette a des révélations au défilement. L'accueil n'en a plus** :
je les avais retirées en R100 pendant la transplantation. Ce n'est pas un
survivant, c'est un **manque**, et il est à moi. À restaurer sauf avis
contraire — les captures de ce lot les figent à leur état final des deux
côtés, donc les images ne le montrent pas.

## `#scene` `#dates` `#eco` — faux manques

Les sections existent, sous les identifiants du site (`#artistes`,
`#prochains`, `#confiance`). Différence de nommage, pas de contenu.

## `.tag-maq` — à ne surtout pas copier

Le badge « Maquette 3 sur 3 — Lumière de scène — cinéma » de la maquette
elle-même.

---

# LES INSTRUMENTS — deux qui mentaient, corrigés

Le lot en a démasqué trois de plus. Le compte continue depuis R93.

## 13ᵉ — la tuile compositée périmée

Un `scrollTo()` programmatique suivi d'une capture photographie une
**tuile compositée périmée** de la couche fixe en `contain: paint`. Lu
comme ça, le ciel de l'accueil rendait `17,17,17` à mi-page alors qu'il
peint `4,7,15` dès qu'un cran de molette force le repeint. J'ai failli
diagnostiquer un défaut de page sur un défaut d'appareil.

Remède, partout où on lit un pixel après défilement programmatique :
`mouse.wheel(0,1)` puis `(0,-1)`, puis deux `requestAnimationFrame`.

## 14ᵉ — `lisibilite.mjs` était MORT et annonçait « ✓ »

Sa garde « ne pas juger le texte posé sur une photo » remontait les
ancêtres à la recherche d'un `url()` de fond — et **le body porte le
grain**. Elle trouvait donc un « média » pour **tous** les éléments de la
page, les exemptait tous, suivait **0 élément**, et concluait :
« ✓ aucun élément sous le seuil, à AUCUN moment du parcours ».

Un feu vert sur une mesure vide. Il tournait comme ça depuis des lots.

Trois défauts d'appareil corrigés : remontée arrêtée au body · repeint
forcé avant capture · boîtes mesurées seulement quand elles sont
entièrement **sous la barre fixe** et dans la fenêtre (une boîte à cheval
sur le bord haut voyait son `y` ramené à 0 et se faisait découper **dans
la barre**, dont le `backdrop-filter: blur(14px)` étale la photo du hero
en gris clairs — d'où des fonds relevés à `238,242,248`, exactement le
crème). De 0 élément suivi à **93**, et de 15 « défauts » à 5.

## 15ᵉ — et les 5 qui restent sont encore faux

Preuve sans appel : les fonds qu'il rapporte — `238,242,248` ·
`148,161,185` · `123,139,165` — **sortent de la gamme que la page sait
peindre**. Le cœur du ciel le plus clair de toute la soirée est mesuré à
`51,74,109` par `soiree.mjs`, sur ses 12 pas. Aucune boîte de l'accueil ne
peut reposer sur du `238,242,248`.

Second moyen, découpage direct des quatre boîtes incriminées, molette
bousculée : bouton « S'inscrire » sur son dégradé orange `248,136,16` ·
`.badge-demo` sur `40,32,24` · `.date .quand` sur `8,8,24` · pied de page
sur `0,0,8`. **Toutes sombres.**

La cause n'est pas un réglage, c'est la méthode : l'outil suppose que
chaque boîte a **un fond plat dominant**. L'accueil de nuit n'en a pas —
dégradés, `backdrop-filter`, photos plein cadre. Sur le lien de nav
« Artistes », boîte 73×19, la tranche de couleur la plus large ne pèse que
**6 %** des pixels.

Je l'ai rendu **honnête sur ce qu'il ne sait pas lire** (les boîtes sans
fond dominant sortent en INDÉTERMINÉES — ni réussies, ni en défaut) mais
je ne l'ai **pas réglé pour qu'il passe au vert** : ce serait accorder
l'instrument au résultat voulu. Son verdict n'est pas opposable sur
l'accueil tant qu'il ne sait pas lire un fond non plat. L'instrument de
référence pour l'AA reste `contraste.mjs`, qui compose le fond par la
cascade au lieu de le deviner à l'image — **0 défaut**, d'accord avec les
découpages directs.

Corrigé au passage : `lisibilite.mjs` et `contraste.mjs` étiquetaient
encore leurs rapports « thème light », six lots après le retrait des deux
thèmes. Un libellé faux sur une mesure juste suffit à faire douter de la
mesure.

---

# VÉRIFICATIONS DU LOT

| Instrument | Résultat |
|---|---|
| `maquette.mjs` (34 paires × 34 propriétés, 2 tailles) | **0 écart**, 11 tolérés et nommés |
| `acquis.mjs` (Portail · pouls · sol sous le ciel) | ✓ les trois — mention loi Évin à **19,36:1** sur le pixel peint |
| `soiree.mjs` | ✓ 12 luminances peintes distinctes sur 12 · deux moyens concordants |
| `debordement.mjs` (390 px) | ✓ scrollWidth 390, **0** élément qui dépasse |
| `contraste.mjs` (AA) | ✓ **0** défaut confirmé |
| `lcp.mjs` (mobile, CPU ×4) | **300 ms** / budget 2500 · élément LCP `h1.marque` |
| `ui-dump.mjs` | 30 combinaisons, **0 erreur JS** |
| `ui-diff-hors-index.mjs` (r102 → r103) | ✓ **0 différence** sur 28 combinaisons hors accueil — le lot est confiné |
| `lisibilite.mjs` | non opposable, voir ci-dessus |
| `grain.mjs` | le grain n'apporte rien de mesurable |

Captures dans `tools/qa/captures/` : `r103-accueil-desktop.png`,
`r103-maquette-desktop.png`, `r103-accueil-390.png`,
`r103-maquette-390.png`.

**PR #13 reste en Draft.**
