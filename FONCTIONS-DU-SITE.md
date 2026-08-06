# LES FONCTIONS DU SITE — ce qui marche sans hébergement, et ce qui ne peut pas

> **L'objectif, mots de Kily** : « la plupart des fonctions qu'on peut
> utiliser doivent fonctionner · celles qui ont vraiment besoin d'être en
> ligne, on peut les laisser · le reste doit faire comme si c'était un vrai
> site, avec la démo · comme ça on n'aura qu'à retirer la démo pour lancer
> le véritable site. »
>
> **On ne documente donc plus une limite : on la supprime quand c'est
> possible.** Ce fichier ne liste comme « impossible » que ce qui l'est
> réellement, et chaque ligne de la colonne 2 doit **le dire** au visiteur
> plutôt que d'échouer en silence.

## ⚠ LA CONDITION QUI COMMANDE TOUT : le site doit être SERVI

Un site ouvert en **double-cliquant** un fichier tourne en `file://`, ce
qui coupe trois choses d'un coup — **le service worker**, donc le mode
hors ligne ; **les requêtes réseau**, à cause de l'origine « nulle » ; et
une partie des chargements. Ce n'est pas un défaut du site, c'est une
règle de sécurité du navigateur.

**La limite est levée** : `LANCER-LE-SITE.command` sert le site en local
et ouvre le navigateur. **Tout ce qui suit est vrai dans ces
conditions-là**, et c'est la seule façon de juger le site.

---

## COLONNE 1 — CE QUI DOIT MARCHER, ET QUI MARCHE

Aucune de ces fonctions n'a besoin d'un hébergement. Toutes sont
**mesurées** par le harnais, avec l'instrument nommé.

| Fonction | Preuve |
|---|---|
| **Le parcours de réservation complet** — choix du type de billet, total, confirmation | `reservation.mjs` 24/24 |
| **Le billet réel** — numéro, QR peint, mention « démonstration » indélébile (jusque dans la charge utile du QR) | `reservation.mjs`, deux moyens indépendants |
| **Le billet dans le profil** — onglet « Mes billets », QR compris | `reservation.mjs` |
| **Le billet HORS LIGNE** — réseau réellement coupé, page rechargée | `reservation.mjs` (`setOffline`) · **exige le site servi** |
| **Les favoris ♥** — pose, retrait, resynchronisation des deux côtés | `clics.mjs` (localStorage modifié) |
| **Les filtres de la billetterie** (type, ville, genre, tri) | `clics.mjs` 7/7 |
| **Les filtres du line-up artistes** | `clics.mjs` 4/4 |
| **Le tri des partenaires** (alphabétique / chronologique) | `clics.mjs` 2/2 |
| **La recherche / méga-menu**, depuis n'importe quelle page | `clics.mjs` · `inp.mjs` (280 ms) |
| **Le Portail d'entrée** (« Entrer dans la fête » / « sans le son ») | `clics.mjs --frais` |
| **Le formulaire de contact** — envoi réel vers la boîte du fondateur | **prouvé** : HTTP 200, mails reçus · `formulaires.mjs` 18/18 · **exige le site servi** |
| **L'ajout au calendrier** (.ics) | fichier généré côté client |
| **Le partage** (`navigator.share`, WhatsApp, copie du lien) | code client, sans réseau |
| **La liste d'attente** d'un événement complet | `formulaires.mjs` (rendu forcé sur un événement `stock: complet`) |
| **La création d'événement** depuis l'espace pro | écrit dans `syfir-pro-events`, la grille se rafraîchit |
| **Le compte / profil local** | `auth.js`, localStorage |
| **Le compte à rebours** d'un événement | calculé sur la vraie date |
| **Les fiches événement et artiste** partageables (`?id=`) | rendues côté client |

**Règle tenue** : ces fonctions ne dépendent d'aucun serveur SYFIR. Elles
marcheront à l'identique le jour du lancement — **retirer la démo ne les
touche pas**.

---

## COLONNE 2 — CE QUI EXIGE VRAIMENT D'ÊTRE EN LIGNE

Elle est **courte**, et chaque ligne dit ce qu'elle est.

| Fonction | Pourquoi c'est impossible sans | Ce que le visiteur voit — vérifié |
|---|---|---|
| **Le paiement** | il faut un encaisseur, un compte marchand, une conformité | **rien n'est présenté comme dû.** La confirmation dit, dans la même phrase, que le billet existe **et** qu'aucun paiement n'a eu lieu. Le billet porte « démonstration » jusque dans son QR. |
| **Les comptes serveur** (mot de passe, récupération, multi-appareils) | il faut une base et une authentification | le profil est **local et le dit** : « Ton profil est enregistré sur cet appareil. » |
| **La newsletter** | un consentement commercial demande registre, désinscription, double opt-in | note visible **« démo — transmission bientôt active »**, et le message dit « rien n'est enregistré ni transmis ». Point de liste rouge **non levé**. |
| **La billetterie Shotgun** | widget d'un tiers | **retirée du rendu** sur consigne. Rien ne l'annonce, donc rien ne ment. |
| **L'aftermovie officiel** | la vidéo n'existe pas encore | la carte l'annonce comme **à venir**, sans lecteur mort ni bouton muet. |
| **Le direct SYFIR TV** | il faut une source de flux | **rien n'existe côté visiteur** — aucune section, aucun bouton, aucun compte à rebours. On ne l'annonce pas avant qu'il diffuse. |

**Aucune de ces six ne casse, n'échoue en silence, ni ne promet ce qu'elle
ne tient pas.** C'est la seule exigence de cette colonne.

---

## CE QUI A ÉTÉ VÉRIFIÉ SUR LE RETRAIT DE LA DÉMO

Testé pour de vrai, sur une branche jetable : **0 erreur JS**, **0 reste
de démo** dans le rendu, et les quatre états vides tiennent (voir
`A-RETIRER-AVANT-LANCEMENT.md`). Une réserve, avec sa résolution écrite :
`git revert f20ea5a` **conflicte** depuis que la couleur par événement a
posé un champ dans le bloc de démo. La résolution est
`const baseEvents = [];` et rien d'autre.
