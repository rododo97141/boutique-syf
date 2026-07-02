# Images SYFIR — guide d'upload

Déposez ici vos visuels de marque. **Les noms de fichiers doivent être EXACTEMENT
ceux du tableau** (minuscules, extension `.png` comprise) : le site les détecte
automatiquement. Tant qu'un fichier manque, une photo d'ambiance de remplacement
s'affiche à sa place — aucune image cassée n'apparaîtra jamais.

## Fichiers attendus

| Nom exact du fichier | Où il apparaît | Visuel conseillé |
|---|---|---|
| `syfir-logo.png` | Logo dans la barre de navigation | L'emblème déesse-soleil seul (idéalement fond transparent) |
| `syfir-hero.png` | Grand fond de la page d'accueil (secours) | Le visuel plage avec sachet et « LE COCKTAIL LIBRE ! » |
| `syfir-planteur-hero.webp` | Grand fond de la page d'accueil (prioritaire) | Le sachet Syf Planteur en gros plan, format paysage — idéalement en `.webp` optimisé |
| `syfir-planteur.png` | Carte « Syf Planteur™ » | Le sachet Saveur-Planteurs seul, en gros plan |
| `syfir-danseuse.png` | Section « Notre marque » | La danseuse carnaval (cadrage vertical de préférence) |
| `syfir-mobile.png` | Bannière « Votre été, partout » | Le sachet à la plage « Cocktail mobile » |
| `syfir-fete.png` | Galerie #SYFIR (1ʳᵉ photo) | Les amis qui trinquent (piscine, rooftop ou bateau) |
| `syfir-flatlay.png` | Galerie #SYFIR (2ᵉ photo) | Le sachet vu de dessus entouré de fruits |
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
| `syf-planteur-1.jpg` / `syf-planteur-2.jpg` | 2 photos officielles du sachet Syf Planteur (fiche produit) |
| `syf-coral-1.jpg` / `syf-coral-2.jpg` | Photos officielles Syf Coral Breeze |
| `syf-golden-1.jpg` / `syf-golden-2.jpg` | Photos officielles Syf Golden Escape |

Tant qu'un fichier manque, la galerie retire sa diapositive et garde un
visuel Unsplash de secours (badge « Visuel officiel bientôt » sur Coral
et Golden). La vidéo officielle du Planteur est déjà en place :
`videos/syf-planteur.mp4`.
