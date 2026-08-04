# À RETIRER AVANT LANCEMENT — le registre des démonstrations

> **Ce fichier est la seule chose qui empêchera qu'une démonstration soit
> publiée par oubli.** Il n'y a pas d'autre garde-fou : ni test, ni
> instrument, ni relecture ne peuvent distinguer un contenu de
> démonstration d'un contenu réel une fois qu'on a cessé d'y penser.
>
> **Toute personne qui ajoute du contenu de démonstration ajoute sa ligne
> ici, dans le même geste.** Un contenu de démo non inscrit est un contenu
> qui sera publié.

## Le cadre — décision du fondateur

Le site **n'est pas destiné au grand public aujourd'hui**. C'est une
**présentation** : une maquette vivante que Kily montre à des gens pour
qu'ils visualisent ce que ça sera. Le vrai lancement viendra après, et
c'est **à ce moment-là** qu'on retire les démonstrations pour mettre le
réel.

C'est ce cadre — et lui seul — qui autorise du contenu inventé sur les
pages que le vide empêche de comprendre.

## Les règles, qui ne bougent pas d'un pouce

1. **Chaque élément de démonstration porte `demo: true` et son badge
   « Exemple » VISIBLE.** Un visiteur ne doit jamais pouvoir croire que
   c'est réel. Le badge n'est pas une politesse, c'est la condition.
2. **Unity 141 reste le SEUL artiste réel** et n'est **jamais mélangé** à
   une démonstration : aucune démo sur ses dates, aucune démo qui partage
   son affiche.
3. **Aucun nom réel**, inventé ou emprunté : pas d'artiste existant, pas
   de lieu existant, pas de marque existante. Des noms **manifestement
   fictifs**.
4. **Un commit séparé par famille de contenu**, préfixé `DEMO — `, ne
   contenant **que** des données. Annulable par `git revert <sha>`.
5. **Le sha est inscrit ici** avec ce qu'il contient, **dans le même
   geste** que le commit.
6. **Aucun JSON-LD pour un contenu de démonstration.** Un objet
   `schema.org` est une affirmation lisible par machine : le badge protège
   le visiteur, il ne protège ni un moteur de recherche, ni un agrégateur,
   ni un assistant. (Règle établie en R99, vérifiée dans `evenement.js`.)

## LE REGISTRE

| sha | Famille | Contenu | Fichier(s) | Annuler |
|---|---|---|---|---|
| `f20ea5aeaa2f88beef87f6d0ebd15d422d99be7c` | **dates** | 4 événements de démonstration (`demo-rooftop-1`, `demo-beach-1`, `demo-villa-1`, `demo-carnaval-1`) — lieux, dates, prix et stocks inventés. Aucun nom de lieu réel (`venue` volontairement absent), aucun nom d'artiste réel, organisateur = SYFIR. | `events-data.js` | `git revert f20ea5a` |
| `10a453857a46fb5896bbdc18382a803c8c2916d2` | **moments SYFIR TV** | 4 légendes sur les photos de la section « Moments » : titre + soirée + commune, chacune précédée de son badge « Exemple ». **Aucun nom nouveau** — les quatre moments renvoient aux quatre soirées de `f20ea5a`. Unity 141 n'y apparaît pas. | `syf-tv.html` | `git revert 10a4538` |

| `e53adf4ba09db6ac32d7a3cf8bbec03e89ddfb25` | **artistes** | 3 fiches d'exemple (`Sélecta Démo 01`, `Kolektif Démo 02`, `Duo Démo 03`) — le mot « Démo » est **dans le nom de scène**, aucune photo de visage, aucun contact, aucun lien social. **Unity 141 n'est pas touché.** | `artistes.html` | `git revert e53adf4` |

> ⚠ **Ordre de révocation** : `10a4538` **avant** `f20ea5a`. Les légendes
> citent les soirées ; retirer les soirées d'abord laisserait quatre
> légendes qui renvoient à des dates inexistantes. `e53adf4` est
> indépendant et se révoque quand on veut.

> **Pourquoi ces noms sont laids, et pourquoi c'est volontaire.** La règle
> interdit d'emprunter un artiste existant. Depuis l'atelier, sans accès
> réseau, on ne peut pas **prouver** qu'un nom de scène antillais
> plausible n'appartient à personne — et un tel nom a une vraie chance de
> heurter un artiste réel sans qu'on le sache. Un nom que personne ne
> porterait est la seule garantie vérifiable. Le jour où de vrais artistes
> arrivent, ces trois fiches partent d'une commande.
>
> **Et aucune n'a de visage.** Attribuer un nom de scène inventé au visage
> d'une personne réellement photographiée serait une invention sur ELLE,
> pas sur SYFIR. Les trois visuels sont un micro, un public de dos et des
> silhouettes à contre-jour. **Limite réelle à lever** : de vraies fiches
> demanderont de vraies photos, fournies par les artistes.

*(Les lignes suivantes s'ajoutent au fur et à mesure. Une famille = une
ligne = un sha.)*

## APRÈS LE RETRAIT — ce qui doit rester vrai

Le site ne doit pas s'effondrer quand les démonstrations partent. **Les
états vides sont construits et assumés** :

| Page | Ce qui s'affiche sans démonstration |
|---|---|
| accueil | l'état vide de R99 reprend la main sur `#nextEvents` |
| billetterie | la grille annonce qu'aucune date n'est ouverte |
| artistes | Unity 141 seul — **c'est la configuration correcte**, pas un manque |
| profil | « Aucun billet à venir. Réserve ta première soirée SYFIR ! » |

**À vérifier après chaque `revert`** : `node tools/qa/ui-dump.mjs <label>`
(0 erreur JS) et un coup d'œil aux quatre pages ci-dessus. Un état vide
qui casse est pire qu'une démonstration oubliée : il se voit le jour du
lancement.

## Ce qui N'EST PAS de la démonstration, et ne se retire donc pas

- **Unity 141** — artiste réel.
- **Les Délices du Bassin Bleu** — partenaire réel (faits confirmés
  uniquement, cf. `DOCTRINE-SYFIR.md` §3).
- **AVYR** — marque partenaire réelle et **indépendante**.
- **Les `[À COMPLÉTER]` des pages légales** — ce sont des manques
  déclarés, pas des démonstrations. Ils bloquent la publication ; ils ne
  se retirent pas, ils se remplissent.
- **Le parcours de réservation** — le billet porte la mention
  « démonstration » parce qu'**aucun paiement n'existe**, pas parce que le
  parcours serait faux. Il fonctionne pour de vrai. Le jour où un
  encaissement est branché, c'est la mention qui tombe, pas le parcours.
