# AVYR — site autonome

Site vitrine de **AVYR**, marque indépendante de cocktails en pochette. Ce
dossier est un site **complet et séparé** du site événementiel SYFIR situé
à la racine du dépôt : sa propre page d'accueil, sa navigation, ses assets,
ses styles, son script, ses métadonnées, ses pages légales.

**Stack** : HTML / CSS / JavaScript vanilla, zéro dépendance, zéro build —
même philosophie que le site SYFIR racine, dont ce dossier ne dépend pas.

## Indépendance technique

Aucun fichier de ce dossier ne référence un chemin relatif remontant vers
la racine du dépôt (`../style.css`, `../script.js`, etc.) : `style.css`,
`script.js`, `products-data.js` et les images/vidéos utilisées sont des
copies locales, propres à ce site. Ce dossier peut être déplacé tel quel
dans un nouveau dépôt/domaine sans rien casser.

**Lien de courtoisie vers SYFIR** : chaque page porte, dans son footer et
son menu mobile, un lien externe volontaire « Écosystème SYFIR ↗ » (nouvel
onglet), qui n'est pas une dépendance fonctionnelle. Depuis R82.1c, ce lien
utilise l'**URL absolue** du site SYFIR — plus aucune URL relative
remontante (`../`) n'existe dans ce dossier.

## Constantes d'URL inter-sites (à changer lors du déploiement séparé)

| Constante | Valeur actuelle | Où |
|---|---|---|
| URL officielle SYFIR (depuis AVYR) | `https://rododo97141.github.io/boutique-syf/partenaires.html` | footer + menu mobile de chaque page de ce dossier |
| URL officielle AVYR (depuis SYFIR) | `https://rododo97141.github.io/boutique-syf/avyr-site/index.html` | `partenaire-avyr.html` (CTA « Aperçu du site AVYR ») et `faq.html` à la racine |

Le jour du déploiement d'AVYR sur son propre domaine : un
chercher-remplacer de chacune de ces deux valeurs suffit (et côté SYFIR,
repasser le libellé du CTA de « Aperçu du site AVYR » à « Découvrir le
site officiel AVYR »).

## Origine du code

`style.css` a été dupliqué intégralement depuis le site SYFIR au moment de
la séparation (R82) — c'est un choix pragmatique pour garantir zéro
régression visuelle immédiate, au prix de règles CSS non utilisées ici
(billetterie, fiches artistes...). Un nettoyage est possible mais non
bloquant. `script.js`, en revanche, a été **réécrit** spécifiquement pour
ce site : le fichier SYFIR d'origine dépend directement de `events-data.js`
(catalogue d'événements SYFIR) dès son chargement — une dépendance
incompatible avec un site AVYR autonome.

## Lancer en local

```bash
# depuis ce dossier, ou en pointant l'URL vers /avyr-site/
python3 -m http.server 8099
# puis ouvrir http://localhost:8099/avyr-site/index.html
```

## Structure

```
index.html            Accueil AVYR
univers.html           L'univers AVYR (histoire, savoir-faire)
collection.html        Catalogue des 3 recettes signature
produit.html?id=X       Fiche produit dédiée, partageable
format.html             Le Format (la pochette)
professionnels.html     Espace pro (bars, revendeurs, organisateurs)
points-de-vente.html    Localisateur (points de vente réels)
art-de-servir.html      One-pager distributeur imprimable
mentions-legales.html, cgv.html, confidentialite.html   Pages légales AVYR
script.js               Toute l'interactivité (autonome)
products-data.js        Source unique des 3 recettes
style.css               Design system (copie du site SYFIR au moment R82)
images/, videos/        Assets locaux
```

## À régler avant mise en ligne

Voir `LEGAL-DATA-REQUIRED.md` et `LEGAL-RESPONSIBILITIES.md` à la racine
du dépôt (section B et C) : raison sociale AVYR, hébergeur, contact RGPD,
et la relation juridique exacte avec SYFIR restent à confirmer par le
fondateur avant publication.

Avant de brancher un endpoint réel (`FORM_ENDPOINT` dans `script.js`),
déterminer et documenter la base légale du traitement, compléter
l'information RGPD du formulaire, préciser la finalité, les
destinataires, la durée de conservation et les droits des personnes.
Ajouter une case de consentement distincte uniquement pour les
traitements qui reposent réellement sur le consentement, notamment une
prospection facultative ou une inscription marketing. Cette base légale
n'est pas choisie ici : elle dépend du fonctionnement réel de l'endpoint
et doit être validée par le fondateur.

L'abus d'alcool est dangereux pour la santé. À consommer avec modération.
