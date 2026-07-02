# CLAUDE.md — boutique-syf (SYFIR — Le Cocktail Libre™)

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

**Typographies** : Montserrat 800–900 pour les titres, Plus Jakarta Sans pour le corps,
Fraunces italique **réservé aux mots-clés émotionnels**.

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
- Slogan officiel : **« Goûte à la liberté. »** — jamais reformulé.
- Manifesto liberté/spontanéité ; phrases courtes ; tutoiement ;
  **jargon marketing interdit**.
- Les textes doivent pouvoir être **lus à voix haute dans un bar sans sonner faux**.

## 5. Boucle fermée

1. **Lire ce fichier** avant toute modification.
2. **Une intention par intervention.**
3. **Rendre + capturer** (desktop et 390px).
4. **Critiquer la capture** contre le design system, la capture précédente et l'intention.
5. **Corriger et boucler.**
6. **Test vert, puis commit unique.**

> **« Ce qui n'est pas vérifié visuellement n'est pas terminé. Le réel tranche. »**
