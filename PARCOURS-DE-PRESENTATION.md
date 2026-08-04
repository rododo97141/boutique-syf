> ⚠ **CE N'EST PLUS UN LIVRABLE.** Kily a tranché : « il ne doit pas y
> avoir de parcours de présentation, c'est moi qui fais la présentation ».
> Il connaît son produit. Ce fichier est **conservé comme note interne** —
> il ne se maintient plus, et rien ne doit en dépendre.
>
> Ce qui reste utile ailleurs a été déplacé : les fonctions et leurs
> limites réelles sont dans **`FONCTIONS-DU-SITE.md`**, et la condition
> « servir le site » est levée par `LANCER-LE-SITE.command`.

---

# PARCOURS DE PRÉSENTATION — SYFIR

> **Pour Kily, à suivre devant quelqu'un.** Dix étapes, dans l'ordre.
> Chacune a été **essayée** — pas déduite du code. Ce qui est écrit dans
> « ce qui se passe » est ce que la machine a réellement fait.
>
> Durée : **8 à 12 minutes** en parlant. Chaque étape tient sans la
> précédente, sauf 5 → 6 → 7, qui forment une seule histoire.

---

## AVANT DE COMMENCER — trois minutes qui évitent tout

**0. ⚠ SERS LE SITE — ne double-clique PAS le fichier.**

C'est le point qui décide si l'étape 10 marche ou non, et il a déjà coûté
un test raté.

> Une page ouverte en **double-cliquant** sur `index.html` s'affiche à une
> adresse `file://…`, ce qui donne au site une **origine « nulle »**. Le
> service de messagerie refuse les envois venus d'une origine nulle —
> c'est une **règle de sécurité du navigateur**, pas un défaut du site.
> **Le formulaire de l'étape 10 ne partira pas.** Tout le reste du
> parcours fonctionne, y compris le billet hors ligne.

**Ce qu'il faut faire, une ligne, rien à installer** — ouvre un Terminal,
place-toi dans le dossier du site, puis :

```bash
python3 -m http.server 8000
```

*(Sous Windows : `py -m http.server 8000`.)*

Puis ouvre **`http://localhost:8000`** dans le navigateur. Laisse le
Terminal ouvert pendant toute la présentation ; `Ctrl+C` l'arrête à la
fin.

**Comment savoir que c'est bon** : l'adresse commence par `http://` et
non par `file://`. C'est le seul contrôle à faire.

**1. Prépare un navigateur propre.** Le site se souvient de toi (billets,
favoris, profil, voile d'entrée déjà franchi). Pour que l'étape 1 existe,
il faut une fenêtre qui ne t'a jamais vu : **une fenêtre de navigation
privée**. C'est le seul geste vraiment obligatoire.

**2. Charge la page une fois avant.** Ouvre `index.html`, laisse-la
s'afficher, puis reviens en arrière. Les polices et les photos seront en
cache : le site démarre net devant la personne.

**3. Décide sur quoi tu montres.** Le parcours marche à l'identique sur
ordinateur et sur téléphone. Sur téléphone, le menu est derrière le bouton
☰ en haut à droite — pense-y avant, pas devant quelqu'un.

---

## LE PARCOURS

### 1 — LE VOILE D'ENTRÉE  ·  `index.html`, première visite

**Ce que tu fais** : tu ouvres le site. Tu ne cliques pas tout de suite —
tu laisses deux secondes de silence.

**Ce qui se passe** : un voile sombre couvre la page, avec deux entrées :
**« Entrer dans la fête »** et **« entrer sans le son »**. Tu cliques sur
la première.

**Ce que tu dis** : « On ne rentre pas dans une soirée par un pop-up de
cookies. On rentre par une porte. »

> ⚠ **Le voile n'apparaît qu'à la première visite.** S'il ne s'affiche
> pas, c'est que le navigateur se souvient de toi — reprends en navigation
> privée. C'est la seule étape qui a cette contrainte.

### 2 — L'ACCUEIL QUI DÉROULE LA NUIT  ·  `index.html`

**Ce que tu fais** : tu descends **lentement**, à la molette ou au pouce.
Ne va pas au bout : arrête-toi deux fois en route.

**Ce qui se passe** : le fond n'est pas une image, c'est **une soirée qui
avance**. Trois couches de nuit se relaient à mesure que tu descends, les
projecteurs s'ouvrent, la brume monte. Rien ne clignote, rien ne saute.

**Ce que tu dis** : « Le fond suit la descente. Plus tu avances dans la
page, plus la nuit est installée. C'est la même soirée du début à la
fin. »

### 3 — LA BILLETTERIE ET SES FILTRES  ·  `evenements.html`

**Ce que tu fais** : dans le menu, **Événements & Fêtes**. Puis tu cliques
deux ou trois filtres : **Rooftop**, **Beach Party**, puis **Tous**.

**Ce qui se passe** : la grille se recompose à chaque filtre, sans
rechargement.

**Ce que tu dis** : « Les dates affichées portent toutes un badge
**Exemple** : ce sont des soirées de démonstration, pas des vraies. Le
jour où une vraie date arrive, elle prend leur place sans rien changer
d'autre. »

> **Dis-le toi-même, avant qu'on te le demande.** C'est le moment le plus
> fort du parcours : tu montres que le site refuse d'inventer.

### 4 — LE ♥ , ET CE QU'IL DIT DU SITE  ·  même page

**Ce que tu fais** : tu touches le **♥** d'une carte. Puis le bouton
**profil** en haut à droite, onglet **Favoris**.

**Ce qui se passe** : le favori est là. Il n'est parti nulle part — il
vit sur l'appareil.

**Ce que tu dis** : « Rien ne sort du téléphone. Pas de compte obligatoire,
pas de serveur, pas de tracking. »

### 5 — LA FICHE ÉVÉNEMENT  ·  clic sur une carte

**Ce que tu fais** : tu cliques une carte — **Rooftop Sunset Session** est
la plus démonstrative.

**Ce qui se passe** : une page complète — photo, date, compte à rebours
**réel**, lieu cliquable vers la carte, genres, partage WhatsApp, ajout au
calendrier, et en bas **« Tu aimeras aussi »**.

**Ce que tu dis** : « Le compte à rebours est calculé sur la vraie date.
Il n'y a aucun faux compteur nulle part sur ce site. »

### 6 — LA RÉSERVATION, DE BOUT EN BOUT  ·  même page

**Ce que tu fais** : dans le bloc **Billets**, tu appuies sur **« + »** en
face de **Entrée**. Puis **« Réserver mes billets »**.

**Ce qui se passe** : le bouton était gris — il s'allume dès que tu
choisis une quantité, et le total s'affiche. Après le clic : une onde,
puis **un billet avec son QR code**, son numéro, et la mention
**Démonstration**.

**Ce que tu dis** : « Le parcours va jusqu'au bout, et il ne prend pas un
centime. Le billet porte écrit qu'il est une démonstration — dans le
texte, et **dans le QR lui-même**. Si quelqu'un le scanne, le code
répond `DEMO`. »

> C'est le sommet du parcours. Laisse le QR à l'écran deux secondes de
> plus que tu ne le voudrais.

### 7 — LE BILLET DANS LE PROFIL  ·  bouton profil

**Ce que tu fais** : bouton **profil** en haut à droite, onglet
**Mes billets**.

**Ce qui se passe** : le billet est là, avec son QR, son numéro, la
mention **Démonstration** et le détail de la commande.

**Ce que tu dis** : « Le billet vit sur l'appareil. C'est ce qui permet
l'étape suivante. »

### 8 — LE BILLET HORS LIGNE  ·  la démonstration qui surprend

**Ce que tu fais** : **tu coupes le réseau** — mode avion sur téléphone,
Wi-Fi coupé sur ordinateur. Puis tu **recharges la page** et tu rouvres
**Mes billets**.

**Ce qui se passe** : la page se recharge, le billet est là, **le QR
aussi**.

**Ce que tu dis** : « À l'entrée d'un festival, le réseau ne passe pas.
Le billet marche quand même. »

> ⚠ **Refais l'étape 6 avant celle-ci si tu as changé d'appareil** : le
> billet est sur le téléphone qui l'a réservé, pas dans un compte.
> Et **remets le réseau** avant l'étape 10.

### 9 — LA RECHERCHE  ·  la loupe, en haut à droite

**Ce que tu fais** : tu cliques la **loupe** et tu tapes le début d'un
mot — par exemple `roof`.

**Ce qui se passe** : un panneau pleine largeur s'ouvre sur l'univers
SYFIR ; les résultats se filtrent à la frappe.

**Ce que tu dis** : « Tout l'univers est atteignable depuis n'importe
quelle page, en deux gestes. »

### 10 — UN FORMULAIRE QUI PART VRAIMENT  ·  `partenaires.html`

**Ce que tu fais** : menu **L'Écosystème**, puis descends jusqu'au
formulaire. Tu remplis avec **tes vraies coordonnées** et tu envoies.

**Ce qui se passe** : le bouton passe à **« Envoi… »**, puis un bandeau
vert : **« Message envoyé. »** Le message arrive dans ta boîte mail.

**Ce que tu dis** : « C'est le seul formulaire du site qui transmet, et
il transmet pour de vrai. Les autres disent honnêtement qu'ils ne
transmettent pas encore. »

> ⚠ **Fais cet envoi UNE FOIS, seul, avant la présentation**, pour
> vérifier que le mail arrive. Voir la note en fin de document.

---

# NE PAS MONTRER — et pourquoi

**Mieux vaut l'éviter en connaissance de cause que le découvrir devant un
partenaire.** Rien de cette liste n'est cassé : ce sont des choses **pas
encore prêtes**, et les montrer sans contexte ferait douter du reste.

| Ce qu'il faut éviter | Pourquoi | Si on te pose la question |
|---|---|---|
| **Les pages légales** — Mentions légales, CGV, Confidentialité | Elles portent des `[À COMPLÉTER]` bien visibles : raison sociale, SIRET, hébergeur, médiateur. **C'est volontaire** — rien n'a été inventé en attendant. | « Elles attendent les informations de la société. Le site refuse d'écrire une donnée juridique fausse en attendant la vraie. » |
| **Le paiement** | Il n'existe pas. Le parcours de réservation s'arrête avant, et le billet le dit. | « On a fait le parcours complet sans encaissement, exprès. Le jour où on branche un prestataire de paiement, il se pose à la fin d'un tunnel qui marche déjà. » |
| **« Mon profil » présenté comme un compte** | Le profil vit **sur l'appareil**. Il n'y a ni serveur, ni mot de passe, ni récupération. Un billet pris sur un téléphone n'existe pas sur un autre. | « C'est volontairement local pour l'instant : aucune donnée personnelle ne quitte l'appareil tant qu'on n'a pas de quoi les protéger correctement. » |
| **L'espace pro, onglets Ventes / Scan / Équipe / Messages / Paramètres** | Ce sont des maquettes marquées **« Bientôt disponible »**. La **Vue d'ensemble** et **Mes événements**, eux, fonctionnent — montre ces deux-là si le sujet vient. | « La colonne de gauche montre où va le produit. Les deux premiers écrans marchent déjà. » |
| **La newsletter** (bas de page) | Elle affiche « démo — transmission bientôt active » et ne transmet rien. C'est vrai, mais ça détonne juste après l'étape 10. | « Une inscription newsletter demande un consentement qu'on n'a pas encore outillé. On a préféré ne pas la brancher à moitié. » |
| **La billetterie Shotgun** | Retirée du rendu sur consigne. | — |
| **Une deuxième réservation dans la même démo** | Le billet précédent reste dans le profil : la liste s'allonge et l'effet de l'étape 7 se dilue. | — |

---

# SI QUELQUE CHOSE NE MARCHE PAS DEVANT QUELQU'UN

| Symptôme | Cause la plus probable | Le geste |
|---|---|---|
| Le voile d'entrée ne s'affiche pas | le navigateur se souvient de toi | fenêtre de **navigation privée** |
| « Réserver mes billets » reste gris | aucune quantité choisie | appuyer sur **« + »** — c'est un garde-fou, pas une panne |
| Le billet n'apparaît pas hors ligne | la page n'avait pas fini de se mettre en cache | remettre le réseau, recharger **une fois**, puis recouper |
| Le formulaire affiche un message rouge | le réseau, ou le prestataire a refusé | **le texte saisi est conservé** : réessayer suffit |
| Les photos mettent du temps | premier chargement | charger la page une fois avant la présentation (§Avant de commencer) |

---

# ✅ L'ENVOI EST PROUVÉ — et la seule condition, c'est le §0

**Le test a été fait depuis un vrai navigateur, sur une page servie en
`https://` : HTTP 200, « Form submitted successfully! », et les deux mails
sont arrivés dans la boîte de Kily.** La clé et le câblage fonctionnent.
Ce n'est plus une inconnue.

**La seule condition est celle du §0 : le site doit être SERVI.** Le test
fait en double-cliquant le fichier n'a rien envoyé — origine nulle,
refusée par le service. Ce n'est pas un défaut du site.

| Comment tu ouvres le site | L'étape 10 |
|---|---|
| `http://localhost:8000` (ou une vraie adresse en ligne) | ✅ le message part |
| double-clic sur le fichier (`file://…`) | ❌ rien ne part — le site le dit et explique quoi faire |

Le site ne ment dans aucun des deux cas : en `file://` il affiche un
message rouge qui nomme la cause et donne le geste. Il n'affiche
**jamais** « merci » sans un envoi accepté.
