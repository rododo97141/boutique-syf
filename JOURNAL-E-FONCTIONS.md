# JOURNAL LOT E — LE SITE RÉPOND

> Branche `claude/e1-reservation-workflow-zrgpdj`. La PR reste en **Draft**.
> Objectif tranché par Kily : « il faut que le site soit prêt pour être
> présenté visuellement **avec les fonctions** ». **Ce qui se clique doit
> répondre.** Ordre : E/3 → E/1 → E/2 → D.

---

## Ce que ce lot a appris, et qui vaut plus que les correctifs

# UN BOUTON NE SE JUGE PAS À LA LECTURE. IL SE CLIQUE.

La section 0 de `HANDOFF.md` dit « on ne compare que ce qu'on sait
nommer », et elle a été écrite après quatre défauts que la mesure ne
voyait pas. Ce lot en ajoute la face symétrique, et elle coûte aussi cher :

| | Ce qu'on croyait | Ce que le clic a montré |
|---|---|---|
| `#edBuy` — « Réserver mes billets » | **mort** (`disabled` dans le HTML) | **il répond** : désactivé tant qu'aucune quantité n'est choisie, actif au premier « + ». Un garde-fou, pas une panne. |
| `button.btn` — « Billets » de la billetterie | **candidat servi par un écouteur délégué**, donc probablement bon | **MORT** : `TypeError`, la modale ne s'ouvrait jamais, sur les quatre événements. |
| `button.fav-btn` — le cœur ♥ | idem | **MORT en pratique** : le favori était écrit en `NaN` et ne se retrouvait plus. |

**Trois verdicts sur trois étaient faux dans les deux sens.** Une accusation
sans preuve, deux acquittements sans preuve. `muets.mjs` avait raison de
les appeler des *candidats* et de refuser de trancher ; ce qui manquait
n'était pas un meilleur instrument, c'était **l'essai**.

---

# E/1 — LE PARCOURS DE RÉSERVATION, SANS PAIEMENT

## La panne qu'on ne cherchait pas

`+'demo-rooftop-1'` vaut `NaN`, et `NaN` n'est égal à rien — pas même à
lui-même.

R99 a donné aux événements des identifiants **texte**. Le code de la
billetterie, lui, les relisait encore avec `+…`, hérité de l'époque où ils
étaient numériques. Deux commandes en sont mortes, dont **l'action
principale de la page billetterie**, et rien ne le signalait : l'erreur
partait à la console, la modale ne s'ouvrait pas, et un visiteur croyait
avoir mal cliqué.

**Confirmé par deux moyens avant correction** — la lecture du code, puis
le clic réel produisant `Cannot read properties of undefined (reading
'date')`. Corrigé en un seul geste, six comparaisons :

```js
const memeId = (a, b) => String(a) === String(b);
```

Il survit aux deux formes : les identifiants texte de R99 **et** les
identifiants numériques que l'espace pro fabrique encore avec `Date.now()`.

## La mention « démonstration » — trois choix, trois raisons

La règle du lot : le billet porte une mention **visible et indélébile**.
« Indélébile » n'est pas un adjectif, c'est une contrainte de conception.

1. **Inconditionnelle.** Elle ne dépend ni de `ev.demo`, ni d'un champ
   enregistré sur le billet, ni d'un réglage. Le parcours **entier** est
   une démonstration, pas seulement les dates d'exemple : un billet pris
   sur un événement créé depuis l'espace pro n'encaisse pas davantage.
   Aucune donnée manquante ne peut donc l'effacer.
2. **Posée au rendu, pas à l'écriture.** Les billets déjà dans le
   `localStorage` d'un visiteur — pris avant ce lot — la portent aussi,
   dès le prochain affichage. **Mesuré**, pas supposé.
3. **Dans le QR.** La charge utile devient `SYFIR|DEMO|…`. C'est le seul
   endroit où la mention survit à une capture d'écran.

Phrase **unique**, dans `events-data.js` : le tunnel existe en deux
exemplaires (la modale de `evenements.html`, la fiche `evenement.html`) et
deux copies d'une même phrase finissent toujours par diverger.

> **Aucun prix n'est présenté comme dû.** La confirmation dit dans la même
> phrase que le billet existe *et* qu'aucun paiement n'a eu lieu, plutôt
> que de reléguer le second point à une note.

## La preuve — `tools/qa/reservation.mjs`, 24/24

**Les deux parcours sont testés**, parce qu'une correction posée sur l'un
a toutes les chances d'oublier l'autre.

| Moyen | Ce qu'il voit |
|---|---|
| **1 — le texte rendu** | message de confirmation, pastille du pic, phrase sous la carte, ligne de Mon espace |
| **2 — le QR peint** | mis en évidence par **discrimination** : le tracé doit être celui de la chaîne **avec** le marqueur *et* différer de celui **sans**. Le jour où quelqu'un retire `DEMO`, l'égalité bascule et le test tombe. |

**Périmètre déclaré du moyen 2**, parce qu'un rapport vert sans périmètre
est une opinion : il partage l'encodeur de la page. Il prouve **quelle
chaîne a été encodée**, pas que l'encodeur est juste — la justesse de
l'encodeur est un acquis R95, hors de ce lot.

**Le hors-ligne est mesuré, pas déduit** : le réseau est réellement coupé
(`setOffline`), la page rechargée, le billet et son QR retrouvés.

Captures : `tools/qa/captures/e1-confirmation-fiche.png` ·
`e1-billet-profil.png`.

## Signalé, non tranché

**« Revente interdite »** reste écrit sur un billet qui ne donne accès à
rien. La mention sonne étrangement là — mais la retirer serait supprimer
du texte existant de ma propre initiative, et rien ne l'impose.

---

# E/2 — LES FORMULAIRES ENVOIENT POUR DE VRAI

`FORM_ENDPOINT` est activé sur **Web3Forms**, autorisation explicite du
fondateur, levée de liste rouge **limitée à ce seul point**. Aucun compte
n'a été créé depuis cette session : Kily a créé le sien.

**La clé est publique par conception**, et il faut l'écrire ici pour que
personne ne « corrige » ça plus tard : Web3Forms la documente comme telle.
Elle est même une **protection** — elle sert d'alias, l'adresse de
destination réelle n'apparaît nulle part dans les sources. La sortir vers
un fichier de configuration n'ajouterait aucune sécurité et ajouterait une
étape de build, qui est en liste rouge.

> **La ligne de la clé** : `script.js`, constante `FORM_ACCESS_KEY`, juste
> sous `FORM_ENDPOINT`. Une ligne, rien d'autre à toucher.
> La compatibilité **Formspree** est conservée et ne coûte rien : une URL
> `https://formspree.io/f/xxxxxxxx` fonctionne telle quelle, le champ
> `access_key` surnuméraire étant simplement ignoré.

## Quatre choses auraient menti, et ont été corrigées

- **`r.ok` seul ne suffit pas.** Web3Forms peut répondre **200 avec
  `{"success":false}`** (clé invalide, spam, quota). Le corps est lu, et le
  succès n'est déclaré que si les deux concordent. C'est le piège central
  du lot : un formulaire qui affiche « merci » alors que rien n'est parti
  ment au visiteur **et** au destinataire.
- **« réponse sous 48 h »** — retiré. Rien ne tient ni ne mesure ce délai.
  Ce qui est affirmé est ce qui est vérifié : le message est parti et a été
  accepté.
- **« écris-nous à contact@syfir.fr »** — retiré. Le domaine n'est pas
  acheté ; la boîte n'existe pas.
- **Sur échec, le formulaire n'est PAS réinitialisé.** « Réessaie »
  demanderait sinon de tout retaper. Visible sur la capture.
- **Le toast d'échec** que j'avais ajouté recouvrait la fin de la phrase
  d'échec. Retiré — vu à la capture, par aucun instrument.

## La newsletter ne transmet pas, et c'est délibéré

« Brancher la newsletter » est un point de liste rouge **distinct**, et il
n'a pas été levé. Une inscription newsletter est un consentement
commercial qui appelle son propre traitement (registre, désinscription,
double opt-in), pas un simple message.

Elle garde donc sa note « démo », **qui dit la vérité pour elle**. Le choix
est rendu lisible par une liste explicite (`FORM_SOURCES_ACTIVES`) au lieu
d'être caché dans une condition.

## Ce que la mesure a corrigé dans la question elle-même

Le superviseur demandait de vérifier l'effacement de la note démo sur
**trois** formulaires — partenaire, espace pro, contact. La mesure dit
qu'il n'y en a **qu'un** :

| Formulaire | Réalité mesurée |
|---|---|
| `#partnerForm` (partenaires.html) | **le seul qui transmet** — et c'est aussi le formulaire de contact du site : tous les liens « Contact », « Nous rejoindre » et « Contacter l'organisateur » y mènent. Note démo **effacée**. |
| `#proForm` (evenements.html) | **espace pro** : il ne collecte aucun contact et ne transmet rien **par conception** (R80-4). Il n'a jamais eu de note démo à effacer. |
| `.footer-news` (14 pages) | newsletter — note **conservée**. |
| `#edWaitForm` (liste d'attente) | chemin **local**, hors `submitForm`. Note **conservée**. |

## La preuve — `tools/qa/formulaires.mjs`, 18/18

Cinq réponses **forcées au niveau du réseau**, donc sans toucher au code
du site : succès, refus applicatif (200 + `success:false`), 422, réseau
mort, honeypot. Plus le contenu du POST (`access_key` dans le corps,
`_gotcha` **jamais** transmis) et l'état des notes démo sur les quatre
formulaires.

⚠ **Le formulaire de liste d'attente n'est rendu nulle part** avec les
données actuelles : aucun événement ne porte `stock: 'complet'`. Le
mesurer quand même et conclure « rien à signaler » aurait été **un vert
sur zéro donnée** — la forme de faux positif qui ressemble le plus à un
succès. L'événement complet est donc fabriqué dans le stockage local,
comme le ferait l'espace pro, et la page rendue pour de vrai.

Captures : `e2-formulaire-succes.png` · `e2-formulaire-refus.png` ·
`e2-formulaire-echec-reseau.png`.

## ⛔ CE QUI N'A PAS PU ÊTRE FAIT — l'envoi réel

**`api.web3forms.com:443` est refusé par la politique de sortie de cet
environnement d'exécution** (`gateway answered 403 to CONNECT`, tracé dans
le journal du proxy). Ce n'est pas un défaut du câblage : c'est le bac à
sable qui n'a pas le droit de joindre cet hôte, et la consigne du proxy
est explicite — on ne contourne pas, on signale.

**Le mail de test doit donc partir d'une machine avec un vrai accès
réseau**, et c'est l'affaire d'un clic :

> Ouvrir `partenaires.html` dans un navigateur, remplir le formulaire avec
> un objet qui s'identifie comme un test, envoyer. Le message part vers
> `syfir.lifestyle@gmail.com`. **Si la confirmation verte s'affiche, le
> prestataire a accepté le message** — le lot a vérifié que cette phrase
> ne s'affiche dans aucun autre cas.

## RGPD — consigné, pas rédigé

Un sous-traitant **hors UE** reçoit désormais des données personnelles,
dont **celles d'un responsable légal** quand le demandeur est mineur. Les
**faits techniques** sont dans `LEGAL-DATA-REQUIRED.md` **§A bis** :
sous-traitant, finalité, données transmises et non transmises, durée de
conservation (**à confirmer** — l'ordre de grandeur de 30 jours n'a pas
été vérifié, et la conformité ne se fonde pas sur un ordre de grandeur),
destinataire, et ce qui manque sur `confidentialite.html`.

**Aucune ligne juridique n'a été rédigée** : c'est en liste rouge.
Le point est **bloquant pour la publication**.
