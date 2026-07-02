# HANDOFF — SYFIR (Le Cocktail Libre™)

> Document de passation pour reprendre le travail dans une session fraîche sans perte de contexte.
> Dernière mise à jour : fin du LOT 11 (juillet 2026).

## 1. Le projet en une phrase

Site de marque + billetterie festival pour **SYFIR**, marque de cocktails alcoolisés en sachet
(« Le Cocktail Libre™ », univers Antilles/Guadeloupe : plage, carnaval, golden hour).
Vanilla **HTML/CSS/JS, zéro dépendance, zéro build** — tout se teste en ouvrant les fichiers
derrière un simple `python3 -m http.server`.

## 2. Contexte de travail

- **Dépôt** : `rododo97141/boutique-syf` (ex-`mon-site`, renommé — les remotes suivent).
- **Branche de travail** : `claude/tender-hypatia-p002y8` → **PR #8** (récapitulative, base
  `claude/magical-newton-o5z6tx`). Toujours pousser sur cette branche.
- **Mode de fonctionnement** : un « superviseur » (l'utilisateur) envoie des LOTS numérotés de
  tâches, exige **un commit par point**, des **tests réels** (Playwright dans le bac à sable,
  `NODE_PATH=/opt/node22/lib/node_modules`, Chromium préinstallé) et une **URL de preview**
  à chaque lot : `https://raw.githack.com/rododo97141/boutique-syf/<SHA>/<page>`.
- ⚠️ Bac à sable : les images Unsplash et localhost ne sortent pas — pour tester les carrousels/
  images, intercepter avec `page.route()` et servir un PNG factice (voir scripts /tmp des lots).
- L'utilisateur écrit en français, style oral — répondre en français.

## 3. Architecture

| Fichier | Rôle |
|---|---|
| `index.html` | Site de marque : hero (slogan « Goûte à la liberté. »), manifesto 3 lignes, bloc Prochains événements, marquee, marque, cocktails, Où nous trouver (+ logos partenaires fusionnés, ancre `#confiance`), passerelle événements, Artistes/DJs/Groupes (carrousels média + audio), agenda concerts, partenaires (formulaire intelligent), équipe, communauté (vidéo d'ambiance Pexels + galerie), CTA final, footer |
| `evenements.html` | Billetterie : hero (fond vidéo Pexels injecté après load), **section Billetterie officielle Shotgun** (carte-lien + `#shotgunWidget` TODO), billetterie **démo** (groupée par jour, filtres type/ville/genre, compteur, cœurs favoris), espace pro (formulaire création), modales (billets, Mon espace), FAB Billets |
| `evenement.html` + `evenement.js` | Fiche partageable `?id=X` : SEO/OG/JSON-LD MusicEvent, Maps, partage (navigator.share/WhatsApp), tunnel billets, compte à rebours, « Vous aimerez aussi » |
| `espace-pro.html` + `espace-pro.js` | Smartboard organisateur : sidebar (Vue d'ensemble avec KPI + comparatifs simulés déterministes, Mes événements dupliquer/supprimer, Ventes/Scan/Équipe/Messages/Paramètres en maquettes « Bientôt ») |
| `events-data.js` | **Source de données unique** `window.SYFIR` : baseEvents (6), TIERS_DEFAULT (Early Bird `scarce`, Standard `reco`, VIP), helpers (euro, fmtTime, priceRange, mapsUrl, countdownText, getAllEvents/getEvent + pro events localStorage). Chargé AVANT script.js sur les 4 pages |
| `script.js` | Tout le reste (IIFE unique) : thème, age gate, reveal, carrousels média `buildMediaCarousel`, audio, favoris, newsletter, billetterie (rendu/filtres/modales/Mon espace/pro), FAB, to-top. ⚠️ `if (!eventsGrid) return;` sépare le code toutes-pages du code billetterie — tout code multi-pages doit être AVANT cette ligne |
| `style.css` | Design system complet (~1900 lignes), sommaire en tête de fichier |
| ~~`audio/*.wav`~~ | Supprimés (lot 13) : aucun faux extrait — le bouton ▶ ouvre la vraie plateforme de l'artiste (YouTube/Spotify/SoundCloud) dans un nouvel onglet, masqué sinon |
| `images/README.md` | Noms EXACTS des visuels que le client doit uploader (fallbacks Unsplash en place) |
| `.claude/skills/expert-95/` | Skill projet du client (SKILL.md verbatim fourni par lui + memoire.md) — ne pas réécrire |
| `apercu-syfir.html` | Snapshot autonome ancien (lot ~6) — PAS maintenu, ne pas s'y fier |
| `cgv/mentions-legales/confidentialite.html`, `favicon.svg` | Créés par le client via GitHub — ne pas casser les liens footer |

## 4. Décisions de design (à respecter)

- **Thèmes** : sombre « nuit festive » / clair « été doré » / auto (7h-19h clair), attribut
  `data-theme` posé par un script inline dans chaque `<head>` (anti-flash), menu 🌗 dans la nav.
  **Toute couleur codée en dur doit avoir sa surcharge `html[data-theme="light"]`** (règle QA).
- **Palette** : tokens dans `:root` ; or métallique `--gold-metal` sur les `em` de titres ;
  **blanc pur banni** (surfaces `#FFFDF6`, fonds clairs limités à `#FAF6EE`/`#F3ECDC`) ;
  en clair, `--gold-deep` est redéfini `#7E5C06` (contraste AA) et l'orange petit texte → `#A04600`.
- **Motion** : 2 tokens `--dur-fast` 180ms (hover/focus) / `--dur-med` 300ms (entrées) ;
  press `scale(.97)` sur tous les boutons ; `prefers-reduced-motion` → 1ms ; reveals visibles
  par défaut (`.in` = simple enrichissement) ; reveals latéraux → verticaux sous 640px.
- **Grille 8px** (4px micro) sur paddings/margins ; cartes d'une rangée alignées
  (flex column + `margin-top:auto` sur le pied) ; images de cartes **5:4**, zoom hover 1.03.
- **Mobile-first** : cibles ≥44px (bloc dédié dans la media query ≤639px), 0 débordement
  horizontal, un seul CTA principal par écran (le FAB s'efface sur le hero).
- **Éthique** : AUCUN faux compteur/fausse urgence — compte à rebours basé sur la vraie date,
  « Quantité limitée » seulement sur Early Bird (vrai dans les données), badge « Recommandé »
  simple ancrage. Age gate 18+ (localStorage `syfir-age-ok`), mention loi Évin `.footer-sante`
  sur les 4 pages (contraste ≥4.5 vérifié).
- **Fukasawa (lot 8)** : nav 5 entrées max, pas de préloader, pas de tilt, parallaxe ≥768px
  uniquement, CTA en langage expérience (« Vivre un événement », « Découvrir l'expérience »).
- **Grain** : `--noise` (SVG 3,2%) sur fonds sombres uniquement, jamais en clair ni sur crème.
- Sections immersives (communauté, hero billetterie) : or chaud sur `--ocean-deep` en sombre.

## 5. localStorage (clés)

`syfir-theme` (auto/light/dark) · `syfir-age-ok` · `syfir-user` ({name,email,city}) ·
`syfir-tickets` ([{event,city,date,detail,num}]) · `syfir-favs` ([ids]) · `syfir-pro-events` ([événements créés]).
Dans les tests Playwright, TOUJOURS pré-poser `syfir-age-ok=1` (sinon l'age gate bloque tout).

## 6. Lots livrés (tous validés à l'écran par le superviseur)

1. **L1** QA : chips partenaires en clair, audit contraste, événements passés masqués, reveal 78/78.
2. **L2** Billetterie festival : cartes enrichies (heure/lieu/genres/fourchette), groupes par jour, filtre genre, compteur, FAB.
3. **L3** Fiche partageable + SEO (JSON-LD MusicEvent), source unique events-data.js, liens streaming nettoyés.
4. **L4** Mon profil (billets À venir/Passés, avatar connecté) + Smartboard espace-pro.html.
5. **L5** Carrousels média artistes (scroll-snap, ARIA, façade vidéo), harmonisation 4 pages (footer partout), mobile 390.
6. **L6** Loi Évin (.footer-sante), age gate, newsletter (TODO Brevo commenté), aftermovie façade.
7. **L7** Tokens motion, grille 8px (170 valeurs), favoris + « Vous aimerez aussi », images 5:4.
8. **L8** Soustraction : nav 7→5, préloader/tilt retirés, logos fusionnés, manifesto, badge Recommandé. Mesures avant/après données.
9. **L9** Fluidité (blanc banni, jonctions 140px), contraste AA 0 infraction, slogan, Prochains événements + CTA final, images Blue Lagoon/Marina réparées.
10. **L10** Typo SOTY (h2 70px), or/océan, grain, compte à rebours réel + rareté Early Bird.
11. **L11** Shotgun (carte kily-141 + TODO widget, démo étiquetée), confirmation « C'est dans la poche » (n° unique, revente interdite, contact), KPI comparatifs + Messages, ce HANDOFF.
12. **L12** Fiches produit cocktails : cartes cliquables → modale (galerie carrousel réutilisée, formats verre/sachet avec visuels, CTA Où le trouver) ; **vidéo officielle client `videos/syf-planteur.mp4`** en 1re diapositive (muette en boucle + bouton son) ; emplacements `images/produits/syf-{planteur,coral,golden}-1/2.jpg` avec fallbacks et badge « Visuel officiel bientôt » (Coral/Golden). ⚠ Le Chromium du bac à sable n'a pas le codec H.264 : la vidéo ne se teste qu'en vrai navigateur.

13. **L13** Line-up réparé : groupes en .artist-card complètes (carrousel/fiche/filtre), faux .wav supprimés (écoute = vraie plateforme en nouvel onglet, sinon masqué), **Unity 141 (groupe réel, kompa — Guadeloupe)** ajouté avec ses vrais liens YouTube/Instagram/Facebook/TikTok, liens Instagram/Facebook/TikTok ajoutés à la fiche artiste, play au-dessus des points du carrousel (z-index).

## 7. TODO connus / en attente

- [ ] **Widget Shotgun réel** : coller le code depuis Smartboard > Ma page > Widget dans `#shotgunWidget` (evenements.html, TODO commenté en place).
- [ ] **Endpoint newsletter** : brancher Brevo/Mailchimp (TODO commenté dans script.js, section 09b-ter).
- [ ] **Vidéos Pexels en hotlink (lot 14)** : le conteneur bloque pexels.com — déposer les fichiers `videos/ambiance-sunset.mp4` (9640964), `videos/prep-cocktail.mp4` (4747677), `videos/orange-juice.mp4` (5944773) en 720p H.264 ≤6 Mo pour remplacer le hotlink (source locale déjà première dans chaque `<video>`).
- [ ] **Visuels client** : images/`syfir-*.png`, `artiste-*.png`, `equipe-*.png`, **photos produit `images/produits/`** (voir images/README.md) + vrais extraits audio + `data-video` des artistes + URL aftermovie (`VIDEO_ID`) + vidéos Coral/Golden.
- [ ] **Bibliothèque de composants React `syfir-ui/` + /design-sync** : reportée par le superviseur, « remise en file après les lots site » (plan détaillé discuté : 10-15 composants depuis style.css, puis sync claude.ai/design).
- [ ] Vrais profils streaming des artistes (data-attributes en place, boutons masqués tant que génériques).
- [ ] **Unity 141** : bio à faire valider par le client + photo officielle `images/artiste-unity.png` (placeholder étiqueté en ligne).
- [ ] PR #8 : à maintenir à jour au fil des lots (descriptif structuré par lot, liens preview par SHA).

## 8. Conventions de contribution

- Commits en français, descriptifs, un par point de lot (pas d'ID de modèle dedans).
- Avant tout push : `git pull --rebase origin claude/tender-hypatia-p002y8` (le client committe
  parfois via GitHub entre deux lots), puis `git push -u origin claude/tender-hypatia-p002y8`.
- Tester chaque point (Playwright headless) : erreurs JS, les 2 thèmes, mobile 390px si layout.
- Ne jamais introduire de dépendance/build ; ne pas toucher au hero validé ni au skill expert-95.
