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
```

Les trois sont **versionnés** et doivent le rester : le harnais est un
actif du projet (décision R93), et deux d'entre eux encodent des pièges
qu'il serait coûteux de redécouvrir.

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

## 2. LOT D — les 13 pages par familles

Ordre validé, inchangé :

1. **contenu long** — `evenements`, `syf-tv`, `artistes`
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
   de CTA), contre les boutons **blancs** de la maquette 3. Décision
   d'identité, pas d'habillage. *(hérité de C/3)*
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
6. **`clics.mjs` ne dit pas si l'effet est le BON effet.** Un filtre déjà
   actif recliqué se déclare muet à raison ; une commande qui fait la
   mauvaise chose se déclare répondante. **Nouveau.**
7. **Le moyen 2 de `reservation.mjs` partage l'encodeur de la page.** Il
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
