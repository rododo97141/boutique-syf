# Passation R99 — l'accueil est devenu la maquette

> État réel du dépôt après R99. Le détail des mesures est dans
> **`JOURNAL-R99-MAQUETTE.md`**, celui de la nuit dans **`JOURNAL-R98-NUIT.md`**.
> La loi du dépôt reste **`CLAUDE.md`**, l'identité **`DOCTRINE-SYFIR.md`**.

---

# ⚠ À FAIRE EN PREMIER LE JOUR DE LA PUBLICATION

**`git revert f20ea5a`**

Ce commit (« DEMO — quatre dates de démonstration ») contient **uniquement**
`events-data.js` et les quatre événements de démonstration autorisés par Kily
en R99 (*« tu peux mettre quelques dates, vu que je ne vais pas publier le site
maintenant »*). **L'autorisation ne vaut que dans ce cadre.**

Les quatre portent `demo: true` et affichent le badge « Exemple » — vérifié,
4 cartes, 4 badges. Aucun nom de lieu réel (le champ `venue` est absent :
il alimenterait un `Place` JSON-LD), aucun nom d'artiste réel, organisateur
SYFIR. Au revert, l'**état vide assumé** de R99/5 reprend la main automatiquement.

---

## 1. Ce que R99 a fait

L'accueil comptait **22 blocs** et son hero était un **carrousel horizontal de
cinq panneaux**. Il en compte **six**, et le hero est une affiche.

| Point | Contenu |
|---|---|
| **R99/1** | `artistes.html` **créée** pour recevoir le line-up (filtres, grille, agenda) — aucune page ne pouvait l'accueillir |
| **R99/2** | `#marque` déménage vers `partenaires.html` — seul contenu unique au site |
| **R99/3** | Cinq teasers + le bandeau retirés, contenu vérifié à destination |
| **R99/4** | Le carrousel meurt ; blocs 1, 2, 3 aux valeurs de la maquette |
| **R99/5** | Blocs 4, 5, 6 + l'**état vide assumé** qui remplace un trou |
| **R99/6** | L'audit de l'or terminé ; le crème chaud chassé de la nuit |
| **R99/7** | Vérification finale |
| **R99/8** | **L'ossature mise au contrat** — 4 écarts corrigés, dont l'ORDRE des blocs |
| **DEMO** | `f20ea5a` — à retirer, voir ci-dessus |

**68 liens redirigés, 0 restant** : 44 `#artistes`, 13 `#agenda`, 11 `#marque`.

### L'ossature, vérifiée bloc par bloc contre le contrat

| # | Bloc | Sur-titre | Titre |
|---|---|---|---|
| 1 | `#accueil` | — | SYFIR + « Guadeloupe · Caraïbe » + « Entre dans la nuit. » |
| 2 | `#manifesto` | Le manifeste | Un réseau, *pas un catalogue.* |
| 3 | `#artistes` | Artistes, DJs & groupes live | Ceux qui font monter *la température.* |
| 4 | `#prochains` | Prochaines dates | Là où le moment *devient une scène.* |
| 5 | `#confiance` | L'Écosystème | Ta place dans *l'écosystème.* |
| 6 | `footer` | — | signature à opacité .14 + mention loi Évin |

---

## 2. Ce qui reste ouvert

### A. Deux points de copy signalés, non tranchés

- **La signature de marque.** Le contrat met « Entre dans la nuit. » dans le hero,
  à la place de « Tes prochains souvenirs commencent ici. » Or `DOCTRINE-SYFIR.md`
  §1 désigne cette dernière comme **signature publique officielle**, avec « Hero,
  pied de page » comme emplacements. Elle **reste présente dans le pied de page**,
  son autre emplacement officiel — le site ne perd pas sa signature — mais c'est
  une réduction d'usage qui mérite un mot du fondateur.
- **« Entrer dans la fête »** est **déjà** le libellé du bouton du **Portail**
  (R93). Deux boutons, deux actions différentes, les mêmes mots.

### B. Une déviation assumée au contrat

Le contrat dit `div.hero-photo>img` ; le hero garde `div.hero-bg` avec une image
de fond CSS. Le rendu est identique ; changer touche l'élément **LCP** (mesuré
aujourd'hui sur `div.hero-bg`) et le repli poster du film de marque documenté en
R91. Beaucoup de risque pour aucun pixel.

### C. Le CLS de l'accueil — toujours mesuré, toujours inexpliqué

**0,0021** médiane sur 5 passes, contre **0,0000** sur les autres pages. ~50× sous
le seuil « bon ». L'observateur désigne `DIV.nav-actions`, dont la largeur est
stable : c'est un **déplacement**, pas un redimensionnement.
Piste non explorée : mesurer sur un `git worktree` du commit pré-R98, servi
séparément — la seule comparaison honnête.
**À ne pas refaire :** neutraliser des règles à l'exécution donne « 0,2027 →
0,0000 », un résultat entièrement faux (l'injection tardive cause le décalage).

### D. Les 13 autres pages, et le piège qui les attend

Elles sont sur leur monde sombre, mesuré à 0 défaut AA en R96. Elles n'ont pas
reçu « Lumière de scène ». Kily a dit qu'elles pourront emprunter des **accents**
aux deux autres maquettes, **jamais une autre base**.

> **⚠ Elles portent un AUTRE voile, `.ambience`, pas `.sky`.** Chercher `.sky` sur
> elles ne donne rien. Et `@keyframes ambient-grade` anime le **raccourci
> `background`** — le bug exact qui a coûté tout R97 : ses cinq étapes **sautent**
> au lieu de dériver, sur 8 pages, depuis R3. Remède connu et mesuré : propriétés
> longues + empilement d'opacités. **14 étapes de keyframes** utilisent encore ce
> raccourci dans `style.css`.

### E. Détails

- `meta theme-color` : `#04070F` sur `index.html` seulement ; les autres gardent
  `#071E30` jusqu'à leur refonte.
- `artistes.html` n'est **pas** dans la coquille de pré-cache du service worker,
  volontairement — elle est minimale par conception (« un billet se lit »).

---

## 3. Les acquis, vérifiés par `tools/qa/acquis.mjs` sur le RÉSULTAT

1. **Le Portail** — aucune règle sélectionnée par un thème ; opacité peinte 1 → 0.
2. **Le pouls** — horloge `:root`, `--syfir-beat` qui **varie** réellement.
   Ne jamais poser d'`animation` sur un élément d'appel, ne jamais animer
   `box-shadow` : `filter: drop-shadow` se compose.
3. **Le sol sous le ciel** — `position: relative` sur les blocs de premier niveau.
   Le ciel de nuit est aussi une couche `fixed` : sans cette règle le pied de page
   redevient invisible. `.marquee` est **absent par décision R99/3** ; l'outil
   distingue « absent » de « en défaut » et **affiche** l'absence.

---

## 4. Le harnais — quinze pages, trente combinaisons, treize calibrations

Huit outils. La preuve de confinement a changé de forme en R99 : ce n'est plus
« 0 différence hors accueil » mais **« chaque différence hors accueil est un
déménagement voulu »** — 3 pages touchées, 11 intactes, aucune orpheline.

> **La règle qui a servi treize fois : ne jamais déclarer un défaut NI une
> réussite sur la foi d'un seul instrument.** Et mesurer le **résultat**, jamais
> le câblage.

---

## 5. Et la leçon, confirmée une quatrième fois

Sur R99, **quatre défauts** que seule la capture pouvait voir, alors que tous les
indicateurs étaient verts : `aspect-ratio: 3/4` faisant une carte de **1920 px**,
une photo de **plein jour** sur un site de nuit, un **panneau gris opaque** qui
coupait le ciel en deux, et une **ombre violette** héritée de l'ancien monde.

Et un cinquième que même la capture ne montrait pas — **l'ORDRE des blocs** —
trouvé seulement en comparant l'ossature au contrat, ligne à ligne.

> Le harnais prouve qu'on n'a rien cassé. **Il ne dit jamais si c'est beau.**
> Le verdict « c'est la même page » revient à Kily.
