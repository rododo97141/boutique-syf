# Journal du programme R93 → R95

Une ligne par point livré, avec ses **mesures réelles**. Les corrections
faites hors du mandat du lot en cours sont regroupées en fin de document.

Règle de gouvernance appliquée à chaque ligne : **aucun défaut n'est déclaré
sur la foi d'un seul instrument**. Le second moyen de vérification est nommé.

Budgets de référence : LCP mobile < 2 500 ms (mesure R92 : 504 ms, CPU ×4) ·
or en détail — point ≤ 4 px, halo ≤ 12 px, croix ≤ 24 px, ampoule ≤ 6 px ·
éclat furtif ≤ 10 % du cycle.

---

## R93 — LE PORTAIL

| Point | Livré | Mesures réelles |
|---|---|---|
| **R93/1** | Harnais QA versionné dans `tools/qa/` (angle mort A levé) | 56 combinaisons (14 pages × 2 thèmes × 2 viewports), **0 erreur JS** · déterminisme prouvé : 2 dumps du même code → **0 différence** · LCP accueil **564 ms** / budget 2 500 (élément LCP = `div.hero-bg`, poster du film) |
| **R93/2** | Voile : structure, rendu instantané, état résolu avant le premier pixel | **Point d'architecture 1 tranché.** LCP mobile CPU ×4, 3 passes par scénario : voile **504/576/520** → médiane **520 ms** ; sans voile **560/816/552** → médiane **560 ms**. Le voile **ne dégrade pas** le LCP et **n'en devient pas l'élément** (LCP reste `div.hero-bg` — Chromium ne décompte pas l'occlusion). 0 débordement à 390 px, cibles 52/44 px, 0 erreur JS |
| **R93/3** | Accessibilité : focus initial, piège de focus, `inert`, Échap | **Point d'architecture 2 tranché.** **0** élément focusable atteignable hors du voile (16 frères en `inert`) · Tab et Shift+Tab bouclent · Échap → mémorise `muet` · Entrer → rend le focus au skip-link |
| **R93/4** | Levée en fondu croisé, continuité, mémoire, film déclenché | **Point d'architecture 3 tranché.** Opacité échantillonnée **1 → 0.41 → 0.13 → 0.04 → 0.01 → 0** · palier du ciel **inchangé** avant/après (aucun palier forcé : le fondu suffit) · film **0** tentative avant la levée, **1** après · `prefers-reduced-motion` → levée immédiate |
| **R93/5** | Mouvement : reflet 5,5 s, pouls kompa, éclat furtif | Éclat visible **6,4 %** du cycle (seuil 10 %, 110 relevés sur un cycle complet) · halo du pouls **9,99 px** (seuil 12 px, max sur 40 relevés) · croix **20 px** (seuil 24 px) · pouls **517 ms** = 116 BPM exactement · reduced-motion **et** mode économe → `animation-name: none`, décor intact |
| **R93/6** | Ambiance procédurale Web Audio, zéro fichier | **0** contexte audio avant tout geste · **1** après « Entrer » · **0** après « entrer sans le son » · **0** après Échap · **0** sous `prefers-reduced-motion` · montée mesurée sur le gain maître réel : 0.0001 → 0.0003 → 0.0011 → 0.0037 → 0.012 → 0.0388 → 0.131 → **0.16** en ~2,5 s |
| **R93/7** | Réglage du son dans la nav : trois états | 1ʳᵉ visite → `off` · après Entrer → `on` · clic → `off` mémorisé · visite mémorisée avec préférence son → **`ready`, 0 contexte audio** · puis un geste quelconque → `on`, 1 contexte · préférence muette + geste → `off`, **0** contexte · absent des autres pages |
| **R93/8** | Vérification finale | **Confinement : 0 différence** sur les 52 combinaisons hors index · LCP **14 pages toutes dans le budget**, pire page `partenaires.html` **1 380 ms** / 2 500 · contraste du voile : **0 défaut AA** (ligne 11.29, bouton 16.45, lien discret 6.20) · parcours **au clavier seul** : Entrée sur le focus initial franchit la porte · 0 erreur JS sur les 56 combinaisons |

### R93/1 — ce que la calibration a appris

Le harnais a été **calibré contre le réel avant d'être déclaré fiable**. Sa
première version annonçait 11 défauts sur l'accueil, dont 6 faux. Trois défauts
de l'instrument, trouvés et corrigés :

1. **Fonds en dégradé ignorés** → le crème du `body` remontait sous des sections
   à fond dégradé sombre (6 faux positifs sur 11).
2. **Le ciel de La Traversée est une couche `position: fixed`** qui peint
   par-dessus le fond du `body` sans jamais être un ancêtre. Une remontée
   d'ancêtres ne peut structurellement pas le voir : l'outil annonçait « crème
   sur crème » là où une capture montre « crème sur marine sombre ».
   → L'outil déclare désormais **indéterminé** au lieu de deviner, puis mesure
   les **pixels réellement peints** (couleur dominante de la boîte capturée).
3. **Dumps non déterministes** : ils échantillonnaient des animations en vol
   (`opacity .950207` vs `.950219`), et la preuve de confinement prenait ce
   bruit pour un changement. → `freezeAnimations()` + quantification.

> Leçon retenue pour tout le programme : un instrument non calibré ne prouve
> rien, et un instrument non déterministe prouve n'importe quoi.

Deux défauts d'instrument supplémentaires trouvés **pendant** R93 et corrigés
dans `tools/qa/` :

4. **`transitionend` remonte depuis les enfants** (R93/4) — la transition du
   bouton perdant le survol terminait la levée dans la même frame ; le fondu
   ne se voyait jamais. L'écouteur filtre désormais sur la cible **et** la
   propriété.
5. **Un voile plein écran occulte la page** (R93/8) — mesurer le contraste des
   éléments situés derrière lui les mesurait *contre lui* : **36 faux défauts**
   sur du contenu que personne ne voit. L'outil ne mesure plus que le voile
   quand il est présent. Résultat après correction : **0 défaut**.

### Bugs réels trouvés par la mesure pendant l'écriture de R93

- **Zone morte temporelle ×2** (R93/6 et R93/7) : deux blocs lisaient des
  constantes déclarées plus bas dans le même module. Le premier cassait tout le
  son, le second tout le réglage. Aucun des deux n'aurait été vu par un test
  qui vérifie qu'une propriété est *déclarée*.
- **Le `™` invisible** (R93/5) : son opacité créait un contexte d'empilement qui
  coupait le `background-clip: text` du parent. Vu à la capture, pas au code.

---

## Corrections hors mandat

| # | Correction | Niveau | Second moyen de vérification | Mesures |
|---|---|---|---|---|
| 1 | **Pied de page illisible sur l'accueil au crépuscule** — au palier `dusk`, le verre du footer devient sombre mais deux de ses textes restaient sombres. Deux échappées à la bascule de texte §39.5 : `--gold-deep` (piège de cascade — l'alias est substitué au niveau `html`, donc figé puis hérité, hors de portée de la bascule) et `--ink-warm-rgb` (la bascule porte sur les tokens de couleur, pas sur leurs triplets `-rgb`) | VERT, commité isolément pour être annulable | Mesure des **couleurs calculées** au bas de page dans les deux thèmes, en plus de la mesure de pixels qui l'avait signalé ; puis capture | Avant : label **1.82:1**, liens de colonne **4.45:1** (seuil 4.5) · Après : or clair et crème dans les deux thèmes · confinement **0 différence** sur les 13 autres pages |

### ⚠ À TRAITER EN PRIORITÉ — pied de page illisible au crépuscule (thème clair)

Trouvé en vérification finale de R95, **après** correction d'un sixième défaut
de l'instrument (il lisait la couleur du texte en haut de page et le fond en bas
— deux instants différents sur une page dont l'encre bascule au défilement ;
22 défauts annoncés, **8 réels**).

Les 8 réels sont tous du **crème sur le ciel saumon clair du palier `dusk`**,
et l'un d'eux compte plus que les autres :

| Élément | Mesuré | Seuil |
|---|---|---|
| **`p.footer-sante` — la mention loi Évin** | **2,86:1** | 4,5 |
| `p` — © 2026 SYFIR | 2,95:1 | 4,5 |
| `span.form-demo-note` | 2,99:1 | 4,5 |
| `a` — « Notre marque » | 3,63:1 | 4,5 |
| `label` — newsletter | 2,10:1 | 4,5 |
| `button.chip` / `.chip.active` | 1,81 / 1,99 | 4,5 |

**La mention sanitaire doit être lisible** : c'est une obligation, pas une
préférence esthétique. La correction R93 (bascule des tokens) a bien fait passer
ces textes en crème, mais le vrai problème est ailleurs : **au crépuscule, le
verre du pied de page est trop transparent** pour du crème sur un ciel devenu
clair. La piste — opacifier le verre du footer au palier `dusk`, ou faire
basculer ces textes en encre sombre plutôt qu'en crème quand le ciel est clair —
n'a **pas** été tentée : la trancher en fin de session, sans pouvoir la vérifier
sur les deux thèmes et les quatre paliers, aurait été un pari.

### Constats ouverts, non corrigés (à instruire, pas assez compris pour agir)

- **Signature de marque du pied de page** (`.brand-sign-mark`, « SYFIR » 104 px) :
  mesurée à **2,86:1** sur le ciel au crépuscule (seuil 3:1 pour un grand texte).
  Le verre sombre du footer ne semble pas peint derrière cet élément — le pixel
  échantillonné y est la couleur du ciel, pas celle du verre. Diagnostic non
  achevé ; aucune correction tentée à l'aveugle.
- Les **5 défauts de contraste préexistants** de l'accueil (`button.chip`, `em`,
  `h3`, `p.eyebrow.eyebrow-light`, `p.section-intro.intro-light`) restent hors
  périmètre par décision du superviseur : passage dédié à venir.

---

## R94 — LE POULS ET LA TYPOGRAPHIE CINÉTIQUE

| Point | Livré | Mesures réelles |
|---|---|---|
| **R94/1** | Pouls kompa partagé à 116 BPM sur les éléments d'appel | 6 battants sur l'accueil, 2 sur la billetterie · `startTime` **0** partout, écart de phase **0 ms** · trois battants distincts relevés au même instant : **flou de halo identique au millième de pixel** · halo max **11,93 px** (seuil 12) |
| **R94/2** | Titres qui respirent au défilement (`font-variation-settings`) | Passage à la police **variable** : **1 fichier latin** à télécharger au lieu de 2, pour toute la plage 200-900 · respiration mesurée en descente progressive : **wght 800 → 675 → 800**, **50 valeurs distinctes** · **CLS 0.0000** · reduced-motion → wght 800 nominal |
| **R94/3** | Refonte : une seule horloge, des consommateurs | Empreinte hors accueil réduite à **`opacity` seule** (12 relevés, les badges) — contre 4 propriétés structurelles abîmées avant · LCP accueil **564/572/512 ms**, inchangé malgré la police variable |

### Ce que la mesure a imposé à R94

Trois dégâts, tous causés par le fait de poser une **animation** sur chaque
élément d'appel — et tous invisibles à la lecture du code :

1. `animation-name` sur un CTA **écrase son animation d'entrée** (les boutons de
   `partenaire-avyr.html` perdaient le `transform` de leur reveal) ;
2. animer `box-shadow` **écrase l'ombre propre** de l'élément (les boutons de
   `compte.html` perdaient leur élévation) ;
3. une base commune d'interlettrage **écrase celle de chaque titre** (le h1 de
   la billetterie passait de -.01em à -.02em et perdait 15 px de large).

La forme retenue — **une horloge sur `:root`, des consommateurs qui lisent une
variable** — n'écrase rien, et rend la mise en phase inutile : il n'y a qu'une
horloge. Les 30 lignes de synchronisation JS de R94/1 ont été supprimées.

Deux faits vérifiés **avant** d'écrire, qui ont changé l'implémentation :
Unbounded **n'a pas d'axe de largeur** (l'API Google Fonts répond HTTP 400 à
`wdth`) — la largeur passe donc par l'interlettrage, et on ne prétend pas animer
un axe qui n'existe pas ; et l'animation ne pouvait pas vivre sur le titre, car
`.reveal.in { animation: … }` est un raccourci qui l'aurait écrasée.

> **Limite d'environnement** : ce bac à sable n'émet **aucune requête vers Google
> Fonts** (`document.fonts` vide) — le site y rend toujours en police de repli, et
> une police de repli n'a pas d'axe variable. Le mécanisme est vérifié ; le rendu
> visuel de l'axe de graisse reste à juger dans un vrai navigateur.

---

## R95 — LA CONFIANCE

| Point | Livré | Mesures réelles |
|---|---|---|
| **R95/1** | Ajout au calendrier — **la fonction existait déjà**, vérifiée et mise aux normes | Téléchargement réel capturé et fichier relu : CRLF partout, `;` et `,` échappés, DTSTART/DTEND corrects, UID stable · **RFC 5545 §3.1** : ligne `DESCRIPTION` à **108 octets** → repli sur les **octets** (jamais au milieu d'un caractère UTF-8) → plus longue ligne **75 octets**, dépliage identique à l'original, **aucun accent cassé** |
| **R95/2** | Billet consultable hors ligne | **Défaut mesuré** : cache du service worker **vide** après la 1ʳᵉ visite (il ne contrôle pas la page qui l'installe), 12 entrées seulement à la 2ᵉ → préchargement de la coquille : **9 entrées dès la 1ʳᵉ visite** · hors ligne, page jamais visitée : rendue avec son CSS · **numéro du billet à l'écran** dans Mon profil |
| **R95/3** | Liste d'attente sur événement complet | Branchée sur le champ **réel** `stock === 'complet'` (aucun état inventé) · email invalide → refus · valide → enregistré et reconnu au retour · non complet → **aucun bloc** · **aucun chiffre fabriqué** (test cherchant « n personnes / inscrits / en attente » : rien) |

### La promesse que j'ai dû corriger dans mon propre texte

La première version de la liste d'attente annonçait « **Tu seras prévenu·e si une
place se libère** ». Aucun service d'envoi n'est branché (`FORM_ENDPOINT` vide) :
c'était exactement la *fonction annoncée mais absente* que R95 interdit. Le
message dit maintenant ce qui se passe vraiment, et porte la même note
« démo — transmission bientôt active » que tous les autres formulaires du site.

---

## Vérification finale du programme

- **Confinement** : R93 prouvé à **0 différence** sur les 52 combinaisons hors
  accueil. R94 est volontairement site-wide ; son empreinte hors accueil se
  limite à **`opacity`** (les badges qui respirent) — vérifié propriété par
  propriété sur la totalité du diff, pas sur son extrait.
- **LCP** : les 14 pages dans le budget de 2 500 ms, pire page `partenaires.html`
  à **1 368 ms**, accueil à **576 ms**.
- **Zéro erreur JS** sur les 56 combinaisons, à chaque dump du programme.
