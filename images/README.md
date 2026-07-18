# Images SYFIR — guide d'upload

Déposez ici vos visuels de marque. **Les noms de fichiers doivent être EXACTEMENT
ceux du tableau** (minuscules, extension `.png` comprise) : le site les détecte
automatiquement. Tant qu'un fichier manque, une photo d'ambiance de remplacement
s'affiche à sa place — aucune image cassée n'apparaîtra jamais.

## Fichiers attendus

| Nom exact du fichier | Où il apparaît | Visuel conseillé |
|---|---|---|
| `syfir-logo.png` | Logo dans la barre de navigation | L'emblème déesse-soleil seul (idéalement fond transparent) |
| `syfir-hero.png` | Grand fond de la page d'accueil (secours) | Le visuel plage avec pochette et « LE COCKTAIL LIBRE ! » |
| `syfir-planteur-hero.webp` | Grand fond de la page d'accueil (prioritaire) | La pochette Syf Planteur en gros plan, format paysage — idéalement en `.webp` optimisé |
| `syfir-planteur.png` | Carte « Syf Planteur™ » | La pochette Saveur-Planteurs seule, en gros plan |
| `syfir-danseuse.png` | Section « Notre marque » | La danseuse carnaval (cadrage vertical de préférence) |
| `syfir-mobile.png` | Bannière « Votre été, partout » | La pochette à la plage « Cocktail mobile » |
| `syfir-fete.png` | Galerie #SYFIR (1ʳᵉ photo) | Les amis qui trinquent (piscine, rooftop ou bateau) |
| `syfir-flatlay.png` | Galerie #SYFIR (2ᵉ photo) | La pochette vue de dessus entourée de fruits |
| `artiste-solaris.png` | Section Artistes & DJs — DJ Solaris | Portrait / DJ aux platines |
| `artiste-kreyol.png` | Section Artistes & DJs — Kréyòl Sound System | Groupe en live |
| `artiste-maya.png` | Section Artistes & DJs — Maya Lumière | Chanteuse au micro |
| `artiste-brise.png` | Section Artistes & DJs — DJ Brise | DJ en sunset set |
| `artiste-tropicanos.png` | Section Artistes & DJs — Los Tropicanos | Groupe latino sur scène |
| `artiste-neo.png` | Section Artistes & DJs — NÉO | DJ / producteur électro |

> Les noms d'artistes ci-dessus sont des **exemples** : modifie-les directement
> dans `index.html` (section « Artistes & DJs ») pour mettre tes vrais artistes,
> puis dépose leurs photos sous le nom de fichier correspondant.

### Groupes & équipe

| `artiste-zenith.png` | Section Groupes — Zénith Brass | Fanfare / brass band |
| ~~`artiste-unity.png`~~ `artiste-unity.jpg` | Section Groupes — Unity 141 (groupe réel) | ✅ REÇUE (photo des 10 musiciens, compressée depuis images/originaux/) |
| `equipe-camille.png` | Équipe — Camille Roussel | Portrait carré |
| `equipe-yanis.png` | Équipe — Yanis Mercier | Portrait carré |
| `equipe-lea.png` | Équipe — Léa Fontaine | Portrait carré |
| `equipe-marco.png` | Équipe — Marco Léandre | Portrait carré |

### Extraits audio (dossier `audio/`)

Le lecteur de la fiche artiste lit les fichiers du dossier `audio/` :
`dj-solaris.wav`, `maya-lumiere.wav`, `dj-brise.wav`, `neo.wav`.
Ce sont pour l'instant de **courts extraits de démonstration** (tonalités) —
remplace-les par tes vrais mixes (même nom de fichier). Le format `.wav` ou
`.mp3` fonctionne : si tu passes en `.mp3`, mets à jour les `data-audio`
correspondants dans `index.html`.

## Comment les déposer

1. Ouvrez ce dossier `images/` sur GitHub (branche `claude/tender-hypatia-p002y8`).
2. Cliquez sur **Add file → Upload files**.
3. Glissez vos photos **renommées exactement** comme dans le tableau.
4. Validez (« Commit changes ») — elles apparaissent immédiatement sur le site.

Si vos fichiers sont en `.jpg`, renommez-les simplement en `.png` avant l'upload
(ou demandez-moi d'adapter le code aux extensions `.jpg`).

Conseils : visez 1600 px de large pour `syfir-hero` et `syfir-mobile`,
700-900 px pour les autres. Évitez les fichiers de plus de 2 Mo pour
garder le site rapide.


### Photos produit (dossier `images/produits/`)

| Fichier exact | Produit |
|---|---|
| `syf-planteur-1.jpg` | ✅ REÇUE — pochette Planteur sur table en bois, plage (visuel principal + og:image du site) |
| `syf-planteur-2.jpg` | ✅ REÇUE — flat lay de la pochette entourée de fruits (galerie) |
| `syf-planteur-3.jpg` | ✅ REÇUE — pochette + verre face à la plage (galerie) |
| `syf-planteur-verre.jpg` | ✅ REÇUE — verre de Planteur, format « Sur place » |
| `syf-coral-1.jpg` / `syf-coral-2.jpg` | Photos officielles Syf Coral Breeze (en attente) |
| `syf-golden-1.jpg` / `syf-golden-2.jpg` | Photos officielles Syf Golden Escape (en attente) |

Les originaux non compressés du client sont archivés dans `images/originaux/`.

Tant qu'un fichier manque, la galerie retire sa diapositive et garde un
visuel Unsplash de secours (badge « Visuel officiel bientôt » sur Coral
et Golden). La vidéo officielle du Planteur est déjà en place :
`videos/syf-planteur.mp4`.

### Vidéos d'ambiance (dossier `videos/`) — crédit Pexels

Sélection du superviseur sur [Pexels](https://www.pexels.com) (licence Pexels :
usage commercial libre, attribution non obligatoire — créditée ici par propreté) :

| Fichier à uploader | Vidéo Pexels (hotlink actif en attendant) | Usage |
|---|---|---|
| `videos/ambiance-sunset.mp4` | [pexels.com/video/9640964](https://www.pexels.com/video/9640964/) — toast au coucher de soleil | Fond du hero billetterie + section communauté |
| `videos/prep-cocktail.mp4` | [pexels.com/video/4747677](https://www.pexels.com/video/4747677/) — préparation de cocktails au bar | Fiche produit Syf Coral Breeze |
| `videos/orange-juice.mp4` | [pexels.com/video/5944773](https://www.pexels.com/video/5944773/) — orange piquée sur un verre | Fiche produit Syf Golden Escape |

⚠️ Le réseau du conteneur de développement bloque pexels.com : les vidéos sont
intégrées en **hotlink direct** (`pexels.com/download/video/<id>/`). Chaque
`<video>` liste le fichier local en **première source** : déposez les .mp4
ci-dessus dans `videos/` (720p H.264, ~6 Mo max, sans audio si possible) et
ils prendront automatiquement le relais du hotlink.

## Rapatriement des images Unsplash (R20)

Des photos de démo (artistes fictifs, événements, lieux) sont encore servies
depuis `images.unsplash.com`. Pour supprimer toute dépendance externe :

```bash
bash tools/rapatrier-unsplash.sh   # nécessite un réseau ouvert vers unsplash
```

Le script télécharge chaque photo dans `images/ext/` (JPEG + WebP) et réécrit
les URLs du dépôt. Dans le sandbox de dev, `images.unsplash.com` est bloqué
(egress 403) : lancer depuis une machine au réseau ouvert, puis committer.
