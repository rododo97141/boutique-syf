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

**Seule exception assumée** : chaque page porte, dans son footer et son
menu mobile, un lien de courtoisie « Écosystème SYFIR ↗ » vers
`../partenaires.html` — un lien EXTERNE volontaire (nouvel onglet), pas une
dépendance fonctionnelle. Ce lien continuera de fonctionner tant que les
deux sites vivent dans le même dépôt ; le jour où AVYR migre vers son
propre domaine, il suffira de remplacer cette seule URL relative par
l'URL absolue du site SYFIR.

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

L'abus d'alcool est dangereux pour la santé. À consommer avec modération.
