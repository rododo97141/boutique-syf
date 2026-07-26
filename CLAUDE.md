# CLAUDE.md — boutique-syf (SYFIR)

Site statique **HTML/CSS/JS vanilla, aucun framework**.
Pages : `index.html`, `evenements.html`, `evenement.html`, `espace-pro.html` + pages légales.

**Ce fichier est la loi du dépôt** : en cas de doute, il tranche.
Le CSS existant (`style.css`) est la source de vérité des valeurs.

## 1. Design system

**Tokens couleurs** — toujours via les variables CSS, jamais en dur :

| Token | Valeur |
|---|---|
| Crème | `#FAF8F2` |
| Encre | `#111111` |
| Océan profond | `#071E30` |
| Or | `#D4A017` |
| Or métallique | `linear-gradient(160deg, #F6D87C 8%, #D4A017 38%, #B8860B 58%, #F0C84A 86%)` |
| Sunset | `#FF7A00` |
| Passion | `#FFC857` |

**Typographies — système à deux niveaux** :
- **Unbounded 700–800 pour l'IDENTITÉ et les TITRES** (logo, hero, h2/titres de section,
  titres de page, grands nombres/KPI, badges) — amendement fondateur du lot 22, critère
  **« ère nouvelle + fraîcheur »** : display géométrique aux formes larges, rondes et
  futuristes (bulles, gouttelettes) qui dit à la fois *nouveau monde* et *fraîcheur
  tropicale premium*. Choisie sur captures comparées du hero et d'une carte contre
  **Syne** (arty mais moins « nouveau monde »), **Bricolage Grotesque** (grotesque
  éditoriale trop commune) et **Space Grotesk** (techy, neutre) ; remplace Montserrat.
  Unbounded est large → interlettrage resserré (logo/footer `.04em`, hero `.02em`).
- **Plus Jakarta Sans pour l'UI** (liens de nav, boutons) : plus étroite et lisible
  « dans un bar » — l'identité Unbounded reste réservée aux titres, jamais en petit
  texte fonctionnel. Corps de texte : Plus Jakarta Sans.
- **Fraunces italique réservé aux mots-clés émotionnels** (accents des titres).

**Géométrie & motion** : rayon `18px` partout, grille `8px`,
transitions `180ms` / `300ms` `cubic-bezier(.16,1,.3,1)` —
**aucune autre durée sans justification commentée**.

## 2. Règles impératives

1. **Deux thèmes** — défaut AUTO par heure (clair 7h–19h, sombre la nuit, préférence
   en localStorage) ; le clair s'écrit via des surcharges `html[data-theme="light"]` ;
   **toute nouvelle couleur existe dans les deux thèmes**.
2. **Mention sanitaire alcool** visible sur toute page.
3. **Pas d'autoplay**, sauf fond vidéo muet.
4. `prefers-reduced-motion` **respecté**.
5. Cibles tactiles **≥ 44px**.
6. Mobile **390px sans débordement** horizontal.
7. **Un commit par point**.
8. **Test Playwright avant commit**.
9. **Push / merge / auth = décision du créateur uniquement.**

## 3. Conventions

- Classes constatées : `car-track`, `media-car`, `artist-card`, `cocktail-card` ;
  tout nouveau composant en **kebab-case**, suffixe `-card` / `-track`.
- Assets dans `images/produits/` et `videos/` ; noms de fichiers en
  **kebab-case sans accents**.
- **WebP prioritaire** pour les images, **MP4 H.264** pour la vidéo ;
  `onerror` de repli sur les `img` critiques.

## 4. Ton éditorial

- **L'expérience avant le produit.**
- Signature officielle : **« Tes prochains souvenirs commencent ici. »** (R84 — voir
  `DOCTRINE-SYFIR.md` §Signature de marque pour les 3 niveaux : signature publique /
  manifeste / philosophie interne). L'ancien slogan « Goûte à la liberté » est **retiré
  définitivement** et **non transférable à AVYR** (association alcool/liberté interdite
  par la loi Évin, art. L3323-4).
- Manifesto liberté/spontanéité ; phrases courtes ; tutoiement ;
  **jargon marketing interdit**.
- Les textes doivent pouvoir être **lus à voix haute dans un bar sans sonner faux**.

### Lexique de marque

Le vocabulaire porte la valeur. **Ces mots sont la loi** ; tout nouveau texte
(visible, `alt`, `aria-label`, meta, JSON-LD, README) les respecte.

| Dire | Jamais | Pourquoi |
|---|---|---|
| **AVYR** (marque **produit** : le cocktail) vs **SYFIR** (l'**écosystème** et la marque mère : univers, événementiel, billetterie, média) | ~~Syprium~~ (nom d'origine, abandonné R49) · ~~Sirium~~ (nom transitoire R49→R59, abandonné R60, vérifié INPI) · **aucun diminutif** « Syp » ni « Syf » en communication officielle | Amendement R49/R50/R60 (loi Évin, séparation produit / marque mère, validée par le fondateur) : le PRODUIT alcoolisé est **AVYR** (variante « Planteur ») ; **SYFIR** reste l'univers, l'événement, la billetterie et le média. Règle : **jamais de diminutif** (« Syp », « Syf ») là où le message est contrôlé. Les cocktails se nomment **AVYR Planteur / Coral Breeze / Golden Escape** ; `brand` JSON-LD des objets `Product` = `AVYR`. Ne touche pas à **SYFIR** (univers/nav/footer/logo/#brand). **« Le Cocktail Libre™ »** est une marque déposée du **produit** AVYR (sa collection de cocktails, `avyr-site/`) — jamais utilisée pour titrer ou sous-titrer SYFIR (R84, décision fondateur : SYFIR n'a jamais été et n'est plus la marque de cocktails). |
| **pochette** (LA pochette) | ~~sachet~~ | Évoque la maroquinerie, colle au visuel marbre-or, effet premium. **Féminin** : accorder (*la* pochette, scellé**e**, dorée, réell**e**, entouré**e**, prêt**es**) ; réécrire la formule pour qu'elle sonne (« le soleil **en pochette** », « la golden hour **en pochette** », « **La** pochette, format liberté »), jamais un chercher-remplacer mécanique. |
| **SYFIR TV** (la page) | ~~Actualité~~ · l'ancienne graphie diminutive (avec « Syf ») | La chaîne des moments SYFIR — angle éditorial « chaîne TV » assumé (ambiances, aftermovies, soirées). Amendement R50 : le libellé visible est **SYFIR TV** partout (nav, eyebrow, CTA, titres, méga-menu). Le fichier `syf-tv.html` est **conservé** (chemin technique + SEO ; `actualite.html` reste un stub de redirection) — seul le libellé change. |
| **Nos Signatures** (la vitrine saveurs de l'accueil) | ~~Nos Cocktails Signature~~ | Amendement R12 : le titre de la section cartes pochettes de l'accueil (accent Fraunces sur *Signatures*). Ne renomme ni la page `saveurs.html`, ni la row du méga-menu (« Les pochettes **AVYR** »). |
| **AVYR cocktail** (l'entrée de nav vers `saveurs.html`) | ~~Saveurs~~, ~~Notre Gamme~~ · les anciens libellés de la vitrine (abandonnés R49/R50) | Amendement R19/R49/R50 : **AVYR cocktail** est un **libellé autonome** (item de nav, `title`/`og:title`, h1 du hero, fin de fil d'Ariane) ; en nav (capitales via CSS) s'affiche **AVYR COCKTAIL**. Dans une phrase **avec article**, écrire « **la collection AVYR** » ou « **nos cocktails AVYR** » — ne jamais accoler « AVYR cocktail » à un article défini. L'URL reste `saveurs.html` ; hero aligné (eyebrow « La collection », h1 « AVYR *cocktail* », title/og « AVYR cocktail »). |
| **Panneau AVYR cocktail** — 3 entrées catégories | ~~liste de produits~~ | Amendement R15/R19 : le déroulant de nav est un panneau pleine largeur (vignettes + libellés capitales) à trois catégories : **Toute la collection** (`saveurs.html`), **Nos cocktails** (`saveurs.html#cocktails`, la grille — expérience « sur place, dans le verre ») et **Nos signatures** (`saveurs.html#signatures`, la pochette signature — expérience « à emporter »). Pas de noms de produits individuels dans la nav. |

> Seuls les **noms de fichiers** d'assets historiques peuvent garder `sachet`
> (`syfir-sachet-*`) : ce sont des chemins, pas du texte de marque.

## 5. Boucle fermée

1. **Lire ce fichier** avant toute modification.
2. **Une intention par intervention.**
3. **Rendre + capturer** (desktop et 390px).
4. **Critiquer la capture** contre le design system, la capture précédente et l'intention.
5. **Corriger et boucler.**
6. **Test vert, puis commit unique.**

> **« Ce qui n'est pas vérifié visuellement n'est pas terminé. Le réel tranche. »**
