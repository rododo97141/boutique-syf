# PASSATION — reprendre au LOT D (E est fini)

> Branche `claude/e1-reservation-workflow-zrgpdj`, **PR #14 en Draft**,
> basée sur `claude/r73-loi-evin` (**PR #13, qui reste en Draft et n'a pas
> été touchée**).
> Lire d'abord **`HANDOFF.md` section 0**, puis **`JOURNAL-E-FONCTIONS.md`**,
> puis ceci. `PASSATION-C-D.md` reste valable **sauf** pour son chapitre E,
> que celui-ci remplace.

## Où on en est

| Lot | État |
|---|---|
| **A** — socle de preuve | ✅ |
| **B** — le voile `.ambience` | ✅ |
| **C/1** — rôle TEXTE | ✅ 238 substitutions |
| **C/2** — rôles FOND / BORDURE / OMBRE | ✅ 78 substitutions |
| **C/3** — les accents chauds | ⬜ *(déprogrammé après E — voir « ordre » ci-dessous)* |
| **D** — par familles de pages | ⬜ **LA REPRISE** |
| **E/1** — parcours de réservation | ✅ |
| **E/2** — formulaires branchés | ✅ *(sauf l'envoi réel, bloqué par le réseau — voir plus bas)* |
| **E/3** — la chasse aux boutons muets | ✅ **fini : tous les candidats cliqués** |

Dumps : `e-avant` (avant E/2) → `e2` → `e1`. Le prochain lot dumpe `e3`.
⚠ `tools/qa/out/` est **gitignoré** : dans un conteneur neuf il n'y a
**aucun dump**. Pour une preuve de confinement, refaire la référence en
mettant ses propres modifications de côté (`git stash push -- <fichiers>`,
dump, `git stash pop`) — c'est ce qu'a fait ce lot.

## L'ORDRE, et pourquoi il a changé

E devait passer avant D « parce qu'une page qui fonctionne se démontre
mieux qu'une page bien colorée dont le bouton est muet ». C'était juste,
et la mesure l'a confirmé au-delà de ce qu'on croyait : **l'action
principale de la billetterie était réellement morte**, et personne ne
l'avait vu depuis R99.

**C/3 passe maintenant APRÈS D**, et ce n'est pas un abandon : C/3 attend
un arbitrage d'identité (`--sunset`, 99 usages de CTA) que seul Kily peut
rendre, tandis que D ne dépend de personne. Faire D en premier, c'est
travailler pendant que la question mûrit au lieu d'attendre.

---

# LA LEÇON DE CE LOT, à mettre à côté de la section 0 de HANDOFF

# UN BOUTON NE SE JUGE PAS À LA LECTURE. IL SE CLIQUE.

`HANDOFF.md` §0 dit « on ne compare que ce qu'on sait nommer ». Ce lot en
ajoute la face symétrique : **on ne condamne, et on n'acquitte, que ce
qu'on a essayé.** Trois verdicts hérités, trois faux :

| | Verdict hérité | Après le clic |
|---|---|---|
| `#edBuy` | mort | **répond** — désactivé tant qu'aucune quantité n'est choisie |
| « Billets » (billetterie) | probablement bon | **MORT** — `TypeError`, modale jamais ouverte |
| ♥ favori | probablement bon | **MORT en pratique** — favori écrit en `NaN` |

Et l'instrument neuf s'est trompé lui aussi, dès son premier passage
complet : il a déclaré « ✓ RÉPOND » pour deux boutons **dont le clic avait
échoué**, en comptant les mutations que la page produit toute seule.
Corrigé par un **plancher** relevé sans clic sur chaque page, et par la
règle « un clic qui n'a pas eu lieu ne donne pas de verdict ». **Seizième
erreur d'outillage du projet, première de celui-ci.**

---

# CE QUI EST FAIT, ET COMMENT LE REVÉRIFIER

```bash
export NODE_PATH=/opt/node22/lib/node_modules
node tools/qa/reservation.mjs --captures   # E/1 — 24/24, les deux parcours
node tools/qa/formulaires.mjs --captures   # E/2 — 18/18, cinq réponses réseau
node tools/qa/clics.mjs                    # E/3 — on clique pour de vrai
node tools/qa/clics.mjs index.html --frais # E/3 — le Portail n'existe qu'en 1re visite
node tools/qa/cibles.mjs                   # 390 px — cibles tactiles, boîte PEINTE
node tools/qa/inp.mjs                      # délai geste → peinture, CPU ×4
```

Les trois sont **versionnés** et doivent le rester : le harnais est un
actif du projet (décision R93), et deux d'entre eux encodent des pièges
qu'il serait coûteux de redécouvrir.

---

# CE QUE LE MANDAT DE CLÔTURE A AJOUTÉ, ET OÙ ÇA EN EST

| Point | État |
|---|---|
| **1. Aucun clic mort** | ✅ 39 candidats cliqués : **37 répondent, 0 muets**, 2 non mesurables résolus par `--frais`. **0 `href="#"`**, **0 ancre morte** (audit statique sur les 19 pages). |
| **2. Parcours de réservation** | ✅ 24/24 |
| **3. Formulaires** | ✅ 18/18 · ⛔ **le mail réel reste à envoyer** (réseau bloqué, voir ci-dessous) |
| **4. Les 13 pages (lot D)** | 🟡 **`syf-tv` et `artistes` faites** · reste `evenements`, puis les formulaires, puis les légales |
| **5. Sur téléphone** | ✅ **0 cible sous 44 px** (48 avant) · 0 débordement · menu accessible |
| **6. Aucun placeholder visible** | ✅ hors pages légales, assumées. Aucun « lorem », aucun « bientôt » non expliqué. |
| **Parcours de présentation** | ✅ `PARCOURS-DE-PRESENTATION.md` |
| **INP** | 🟡 **mesuré pour la première fois — 3/9 sous 200 ms.** Voir ci-dessous. |
| **Partage (OG)** | ✅ 19/19 pages |

## ⚠ L'INP — LE CHIFFRE, NON ARRONDI

`node tools/qa/inp.mjs` · 390 px · CPU bridé ×4 · 3 passes, **on garde le pire**.

| Interaction | Pire |
|---|---:|
| ouvrir « Mon espace » | **0 ms** |
| ajouter un billet (+) | **136 ms** |
| RÉSERVER — le clic principal | **184 ms** |
| ouvrir le voile d'entrée | ✗ **208 ms** |
| soumettre le formulaire de contact | ✗ **216 ms** |
| aimer un événement (♥) | ✗ **256 ms** |
| ouvrir la recherche (méga-menu) | ✗ **280 ms** |
| filtrer la billetterie | ✗ **296 ms** |
| ouvrir le tunnel billets | ✗ **312 ms** |
| trier les partenaires | ⚠ non joué (sélecteur `data-sort="recent"`, pas `"chrono"` — à corriger dans l'outil) |

**Ce que ça dit, et ce que ça ne dit pas.** Les deux interactions qui
comptent le plus pour la démonstration — **ajouter un billet** et
**réserver** — passent. Les dépassements sont tous des re-rendus de liste
(filtres, cœur, tunnel) et l'ouverture du méga-menu, **entièrement
construit en JS à l'ouverture**. Aucun ne dépasse 320 ms : c'est « à
améliorer », pas « mauvais » (le seuil « mauvais » est 500 ms).
**Rien n'a été corrigé** : c'est un lot en soi, et il ne se traite pas à
la fin d'un autre.

## SYFIR TV — LA PLACE DU DIRECT, PRÉPARÉE ET INVISIBLE

**Aucune section « en direct » n'a été créée.** Aucun bouton, aucun
compte à rebours, aucune mention de diffusion à venir. Le visiteur ne
voit rien, parce qu'il n'y a rien.

**Où elle s'insérera, quand elle existera** : entre `<header class="tv-hero">`
et la section « À regarder » — c'est-à-dire **juste après le hero**, en
tête de page. L'ordre des sections a été laissé tel quel exprès : un bloc
inséré à cet endroit ne déplace rien.

**Ce qu'elle pourra réutiliser sans rien écrire de neuf** : `.tv-hero-slide`
(plein cadre, une diapositive par écran, voile de scène) pour le lecteur ;
`.replay-card` et `.media-row-track` pour une rangée de directs passés ;
`.rb-badge` pour l'étiquette d'état. Le hero étant désormais **plein
écran et non plus encarté**, un bloc « direct » posé au-dessus se lira
comme une prise d'antenne, pas comme une bannière ajoutée.

**Ce qu'elle demandera** : une source de flux réelle (aucune n'existe), et
la règle du projet s'applique — **on ne l'annonce pas avant qu'elle
diffuse**.

## LA NEWSLETTER DE SYFIR TV — RÉPONSE À LA QUESTION POSÉE

**Elle n'est pas muette.** Elle traverse `submitForm` avec
`source: 'newsletter'`, qui n'est pas dans `FORM_SOURCES_ACTIVES` : elle
répond, affiche « rien n'est enregistré ni transmis », et porte la note
« démo — transmission bientôt active ». Elle ne tombe donc **pas** sous la
règle des boutons qui ne répondent pas.

⚠ **Elle apparaît DEUX FOIS sur `syf-tv.html`** — une section dédiée
(« Reste dans la boucle ») puis celle du pied de page, à 400 px l'une de
l'autre, avec le même champ et la même note. C'est redondant et ça
affaiblit les deux. **Signalé, non tranché** : en retirer une est
structurel.

**Le branchement reste une décision du superviseur** : une entrée
`'newsletter'` dans `FORM_SOURCES_ACTIVES` (`script.js`) suffit.

---

# CE QUI RESTE À FAIRE — par ordre

## 1. ⛔ L'ENVOI RÉEL DU FORMULAIRE — la seule chose que je n'ai pas pu faire

`api.web3forms.com:443` est **refusé par la politique de sortie de
l'environnement d'exécution** (`gateway answered 403 to CONNECT`, tracé
dans le journal du proxy). Ce n'est pas un défaut de câblage — le POST est
vérifié de bout en bout par `formulaires.mjs` — c'est le bac à sable qui
n'a pas le droit de joindre cet hôte. La consigne du proxy est explicite :
**on ne contourne pas, on signale.**

> **Ce qu'il reste à faire, et c'est un clic** : ouvrir `partenaires.html`
> dans un navigateur ordinaire, remplir le formulaire avec un objet qui
> s'identifie comme un test, envoyer. Le message part vers la boîte
> déclarée par Kily. **Si la confirmation verte s'affiche, le prestataire
> a accepté le message** — le lot a vérifié que cette phrase ne s'affiche
> dans aucun autre cas.

Si un environnement autorisant cet hôte devient disponible, l'envoi se
fait en une commande depuis `formulaires.mjs` en retirant l'interception.

## 2. LOT D — les pages par familles

Ordre **révisé** (décision de Kily : SYFIR TV absorbe communauté, médias
et actualité — c'est la destination, pas une page parmi treize) :

1. **contenu long** — ✅ `syf-tv` **faite** (hero plein cadre + les quatre
   « Moments » légendés) · ✅ `artistes` **faite** (3 fiches d'exemple, le
   format d'un line-up se lit) · ⬜ reste **`evenements`**
2. **formulaires** — `espace-pro`, `partenaires`, `contact`
3. **pages légales** — `cgv`, `mentions-legales`, `confidentialite`, `faq`

> **LA LIMITE, facile à franchir sans le vouloir : l'habillage et le
> rythme, PAS la structure.** Pas de déménagement de section, pas de
> suppression de contenu, pas de réécriture de texte. Une page qui paraît
> cassée **se signale**, elle ne se restructure pas.

Une famille = un lot = un jeu de captures côte à côte dans
`tools/qa/captures/`.

## 3. C/3 — les accents chauds, quand l'arbitrage sera rendu

Voir `PASSATION-C-D.md` pour les chiffres (154 `--passion`, 58 `--sunset`,
etc.) et l'outil `scratchpad/bascule.py`. **⚠ `scratchpad/` ne survit pas
à la session** : l'outil est à réécrire, sa méthode est décrite dans
`PASSATION-C-D.md` §LOT C/3.

---

# ARBITRAGES OUVERTS — à poser à Kily, pas à trancher

1. **`--sunset` #FF7A00**, la couleur d'action de tout le site (99 usages
   de CTA), contre les boutons **blancs** de la maquette 3. *(hérité de C/3)*

   ⚠ **CORRECTION D'UNE ERREUR PROPAGÉE, ET RETIRÉE PAR SON AUTEUR** : il
   avait été écrit que **l'or était la signature de SYFIR**. C'est faux.
   La signature de marque est une **PHRASE** — « Tes prochains souvenirs
   commencent ici. » (décision R84, `DOCTRINE-SYFIR.md` §Signature de
   marque). **L'or n'est qu'un accent, il peut bouger.** Toute consigne
   antérieure qui traitait l'or comme intouchable *au nom de l'identité*
   était mal fondée : la distinction or de marque / or de scène reste
   utile **techniquement**, mais ce n'est pas une question d'identité.
   Cet arbitrage — et celui de `--gold*` en C/3 — est donc un arbitrage
   **d'habillage**, pas de marque. Ça élargit ce qui est permis en C/3.
2. **La hauteur de la barre** : 77 px contre 52,3 dans la maquette.
   « À l'identique » et « cibles ≥ 44 px » sont incompatibles. *(hérité)*
3. **« Revente interdite »** reste écrit sur un billet de démonstration
   qui ne donne accès à rien. La retirer serait supprimer du texte
   existant sans qu'on l'ait demandé. **Nouveau, lot E/1.**
4. **La newsletter** : elle reste en mode démo, et sa note le dit. Le jour
   où Kily lève ce point de liste rouge, il suffit d'ajouter `'newsletter'`
   à `FORM_SOURCES_ACTIVES` dans `script.js`. **Nouveau, lot E/2.**
5. **Le registre du méga-menu**, **le grain `--noise`**, **le fond du
   `.toast`** : voir `PASSATION-C-D.md`. *(hérités, inchangés)*

# LIMITES D'OUTILLAGE — à TRAITER, pas à re-signaler

*(règle 2 de `HANDOFF.md` : une limite signalée et non traitée finit
toujours par coûter — elle a déjà produit trois défauts)*

1. **`registre.mjs` ne mesure pas les états survol/focus.** *(hérité)*
2. **`lisibilite.mjs` n'est pas opposable** : sa méthode suppose un fond
   plat dominant, que la nuit n'a pas. À reconstruire ou à retirer. *(hérité)*
3. **`contraste.mjs` a le même angle mort** → **1 faux positif
   PRÉEXISTANT** sur `evenements.html` (`.btn-solid` « Billets », fond en
   dégradé). Le superviseur a dit de le **laisser**. Il est toujours là,
   et il est toujours faux : le bouton est lisible sur capture. *(hérité)*
4. **`.rev`** : l'accueil n'a plus d'apparitions depuis R100 alors que la
   maquette en a 22. Des classes à reposer, pas du code à écrire. *(hérité)*
5. **Trois règles mortes** posent encore `--cream` en fond : `.serve-tag`,
   `.event-date`, `.hero-line span`. *(hérité, arbitrage)*
6. **`inp.mjs` : le scénario « trier les partenaires » vise
   `.chip[data-sort="chrono"]`, or l'attribut réel est `"recent"`.**
   L'interaction n'est donc pas jouée, et l'outil le dit au lieu de
   compter un succès. **Une ligne à corriger.** *Nouveau.*
7. **`clics.mjs` ne dit pas si l'effet est le BON effet.** Un filtre déjà
   actif recliqué se déclare muet à raison ; une commande qui fait la
   mauvaise chose se déclare répondante. **Nouveau.**
8. **Le moyen 2 de `reservation.mjs` partage l'encodeur de la page.** Il
   prouve **quelle chaîne a été encodée**, pas que l'encodeur est juste.
   Un décodeur QR indépendant lèverait la limite. **Nouveau.**

# LA PASTILLE BLANCHE — close, vérifiée une seconde fois

Elle avait été trouvée et corrigée au lot C/2 (commit `9a91761`) : un
`#toast` **vide** peint en permanence en bas de chaque page, son masquage
dépendant de sa propre hauteur. **Revérifiée dans cette session par un
moyen différent** — un relevé de toutes les couches `fixed`/`sticky`
claires et opaques peintes au repos : **0 sur 6 pages**. Le sujet est clos.

# LISTE ROUGE — inchangée sauf un point

Passer une PR en Ready ou la fusionner · activer un hébergement ou publier
· encaisser de l'argent · **créer un compte chez un tiers** · brancher
Shotgun ou la newsletter · toucher à `avyr-site/` · inventer une équipe,
un artiste, un témoignage ou un logo (**il n'y a PAS d'équipe**, Unity 141
est le seul artiste réel) · visuel produit hors `partenaire-avyr.html` ·
mention d'alcool ou affirmation juridique · dépendance ou build ·
supprimer une fonctionnalité.

> **Le seul point levé** : `FORM_ENDPOINT`, par autorisation explicite du
> fondateur, **et pour ce seul point**. Le compte prestataire a été créé
> par lui. « Brancher la newsletter » **n'est pas levé**.

# À RETIRER AVANT PUBLICATION

- Commit **`f20ea5a`**, préfixé « DEMO — », quatre événements de
  démonstration. `git revert` en une commande.
- **La publication reste bloquée** par les mentions légales incomplètes,
  **et désormais aussi** par `LEGAL-DATA-REQUIRED.md` **§A bis** : un
  sous-traitant hors UE reçoit des données personnelles que
  `confidentialite.html` ne mentionne pas.

---

# LOT D — CE QUI EST FAIT, ET LA PROCHAINE ACTION EXACTE

| Famille | Page | État |
|---|---|---|
| contenu long | `syf-tv.html` | ✅ hero plein cadre au registre de la maquette · les 4 « Moments » portent titre, soirée et badge « Exemple » |
| contenu long | `artistes.html` | ✅ 3 fiches d'exemple — le format d'un line-up se lit enfin |
| contenu long | `evenements.html` | ✅ collision de badges corrigée (date sous la pastille de stock) |
| **formulaires** | `espace-pro`, `partenaires`, `contact` | ⬜ **LA PROCHAINE** |
| légales | `cgv`, `mentions-legales`, `confidentialite`, `faq` | ⬜ |

## La méthode, telle qu'elle a marché deux fois

**Deux commits par page, jamais un seul** :
1. un commit **habillage** (CSS seul, aucun contenu) ;
2. un commit **`DEMO — `** (contenu seul, annulable), **suivi immédiatement**
   de sa ligne dans `A-RETIRER-AVANT-LANCEMENT.md`.

Et entre les deux : **regarder la capture**. Les deux vrais défauts de ce
lot — le hero de SYFIR TV qui s'ouvrait comme un billet de blog, les
badges du hero événement sous la barre de nav — n'ont été vus que là.

## Les trois défauts structurels — ✅ CORRIGÉS sur autorisation

Signalés d'abord, corrigés ensuite, une fois le mandat donné :
le titre en double d'`artistes.html`, les deux formulaires newsletter de
`syf-tv.html`, et les six vignettes qui pointaient sur leur propre section
(plus cinq `onerror` qui retombaient sur l'image en échec — un no-op qui
donnait l'illusion d'un filet).

## ⚠ WEB3FORMS — LA VRAIE CAUSE, pour ne pas la rechercher

`api.web3forms.com` **refuse tout appel hors navigateur**, quel que soit
l'Origin : « This method is not allowed. Use our API in client side or
contact support with server IP address (Pro plan is required) ». Vérifié
depuis un environnement autorisé à sortir.

**Aucun harnais ne pourra jamais tester cet envoi.** Ce n'était pas
seulement le proxy du bac à sable : c'est une règle du service. **Ne
cherche pas de contournement réseau, il n'y en a pas.** Seul un vrai
navigateur peut faire partir ce formulaire.

Conséquence traitée : le message d'échec ne devine plus la cause. Il
relève `navigator.onLine` et le protocole de la page, et distingue le cas
`file://` (Origin `null`, ce que fait quelqu'un qui double-clique le
fichier) — avec le geste qui répare. Aucun chemin n'affiche « merci ».

## La limite qui bloquera les vraies fiches artistes

**Il n'existe aucune photo utilisable pour un artiste nommé.** Le dépôt n'a
que des visuels sans visage (micro, public de dos, silhouettes) ou des
portraits de personnes réelles qu'on ne peut pas rebaptiser. `images/README.md`
liste déjà ce que le client doit fournir : **les photos d'artistes en font
partie**, et rien ne remplacera un envoi réel.
