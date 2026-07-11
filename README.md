# SYFIR — Le Cocktail Libre™

Site vitrine + billetterie de **SYFIR**, marque de cocktails premium en sachet
(univers Antilles/Guadeloupe : plage, carnaval, golden hour).

**Stack** : HTML / CSS / JavaScript **vanilla**, zéro dépendance, zéro build.
Tout fonctionne en ouvrant les fichiers derrière un simple serveur statique.
PWA (manifest + service worker), deux thèmes (clair « été doré » / sombre
« nuit festive »), conformité loi Évin (age gate 18+, mention sanitaire).

Pages : `index.html` (marque) · `saveurs.html` (cocktails) · `evenements.html`
(billetterie) · `evenement.html?id=X` (fiche partageable) · `actualite.html` ·
`espace-pro.html` (Smartboard organisateur).

---

## 1. Lancer en local

Un serveur statique suffit (le service worker et `fetch` exigent `http://`,
pas `file://`) :

```bash
# depuis la racine du dépôt
python3 -m http.server 8899
# puis ouvrir http://localhost:8899/index.html
```

> Le codec **H.264** est requis pour lire les vidéos `.mp4` (hero, ambiance).
> La plupart des navigateurs de bureau l'ont ; certains Chromium « nus » non —
> dans ce cas le **poster** (image) reste affiché, c'est prévu.

---

## 2. Mettre en ligne sur GitHub Pages

> ⚠️ La mise en ligne est **la décision du fondateur**. Voici la marche à suivre.

1. **Pousser** le site sur la branche à publier (souvent `main`).
2. Sur GitHub : **Settings → Pages**.
3. **Build and deployment → Source** : choisir **Deploy from a branch**.
4. **Branch** : sélectionner la branche (ex. `main`) et le dossier **`/ (root)`**,
   puis **Save**.
5. Patienter ~1 min : l'URL publique s'affiche, du type
   `https://<utilisateur>.github.io/<dépôt>/` (ici
   `https://rododo97141.github.io/boutique-syf/`).
6. Vérifier que la page s'ouvre, que le thème bascule, et que le service worker
   s'enregistre (DevTools → Application → Service Workers).

Rien d'autre à configurer : le site est 100 % statique.

### Domaine personnalisé (optionnel)

1. **Settings → Pages → Custom domain** : saisir le domaine (ex. `www.syfir.fr`),
   **Save**. GitHub crée un fichier `CNAME` à la racine.
2. Chez le registrar du domaine, créer un enregistrement DNS :
   - **CNAME** `www` → `<utilisateur>.github.io`
   - (apex `syfir.fr` : un **ALIAS/ANAME** ou les 4 **A** de GitHub Pages).
3. Cocher **Enforce HTTPS** une fois le certificat émis.

---

## 3. À régler AVANT la mise en ligne (check-list)

| Quoi | Où | Détail |
|---|---|---|
| **Domaine définitif** | `robots.txt`, `sitemap.xml`, `<link rel="canonical">` des 6 pages, `og:image`/`twitter:image` | Remplacer le placeholder `https://www.syfir.fr` par le vrai domaine (une seule valeur, plusieurs fichiers). |
| **Formulaires** | `FORM_ENDPOINT` en tête de `script.js` | Vide = mode démo (aucun envoi). Renseigner un endpoint **Formspree** (`https://formspree.io/f/xxxx`, le plus simple) ou **Brevo/Mailchimp** pour recevoir newsletter + demandes partenaires. Honeypot anti-spam déjà en place. |
| **Vidéos locales** | `videos/` | `syfir-pub-video.mp4` (hero) est en place. Optionnel : `ambiance-sunset.mp4` / `prep-cocktail.mp4` / `orange-juice.mp4` remplacent les hotlinks Pexels (voir `images/README.md`). |
| **Visuels manquants** | `images/`, `images/produits/` | Photos Coral/Golden officielles, portraits équipe/artistes — noms exacts dans `images/README.md`. Des fallbacks Unsplash s'affichent en attendant. |
| **Widget billetterie** | `evenements.html` (bloc `#shotgunWidget` commenté) | Coller le code Shotgun si réactivation. |

---

## 4. Structure

```
index.html saveurs.html actualite.html          pages de marque
evenements.html evenement.html espace-pro.html  billetterie + fiche + smartboard
events-data.js   source unique window.SYFIR (événements, helpers)
script.js        toute l'interactivité (thème, age gate, billetterie, formulaires, PWA, QR…)
evenement.js espace-pro.js   logique des pages fiche & smartboard
style.css        design system complet (tokens, 39 sections commentées)
manifest.webmanifest sw.js   PWA
robots.txt sitemap.xml        SEO
images/ videos/ tools/        assets + script de retouche reproductible
CLAUDE.md        la « loi du dépôt » (design system, règles éditoriales)
```

---

## 5. Crédits & conformité

- **Loi Évin** : vérification d'âge 18+ (localStorage) + mention sanitaire sur
  chaque page. À conserver.
- **Polices** : Unbounded (titres), Plus Jakarta Sans (UI/corps), Fraunces
  (accents) via Google Fonts.
- **Vidéos d'ambiance de secours** : Pexels (licence libre, usage commercial),
  créditées dans `images/README.md`.

L'abus d'alcool est dangereux pour la santé. À consommer avec modération.
