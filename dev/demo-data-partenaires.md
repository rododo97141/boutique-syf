# Données de démonstration — localisateur AVYR & « Ils nous font confiance »

**Fichier de développement, non chargé en production.** Aucune page publiée ne
référence ce fichier (aucun `<script>`/`<link>` ne le charge, aucun lien n'y
mène). Il n'existe que pour ne pas perdre le travail de maquette du
localisateur AVYR et du bandeau de logos SYFIR, le temps que de vrais
partenaires soient confirmés.

**Statut (R80.1 final) :** ces deux blocs ont été **entièrement retirés** du
HTML publié (`avyr-partenaires.html`, `index.html`) — plus seulement masqués
par un attribut `hidden`. Les pages publiques ne contiennent plus que leurs
états vides (`.state-empty`) :
- `avyr-partenaires.html#points-de-vente` : « Les premiers points partenaires
  AVYR seront prochainement annoncés. »
- `index.html#confiance` : « Le réseau de partenaires SYFIR sera bientôt
  présenté ici. »

Aucun des lieux et logos ci-dessous n'est un partenaire réel validé — ce sont
des données fictives de maquette (R22-1 pour le localisateur, lot d'origine
non daté pour le bandeau de logos).

## Pour réactiver

1. Confirmer chaque partenaire réel (accord écrit, coordonnées vérifiées).
2. Reconstruire les blocs avec les **vraies** données (adapter le gabarit
   ci-dessous : mêmes classes CSS, mêmes IDs `#locatorMap`/`#placeChips`/
   `#placesGrid`/`#placeModal` pour `avyr-partenaires.html`, mêmes IDs
   `#logoChips`/`#logosMarquee` pour `index.html` — le JS de `script.js` s'y
   rattache automatiquement, aucune modification de script nécessaire).
3. Retirer le badge `.badge-demo` (« Exemple ») une fois chaque lieu validé.
4. Retirer ou réduire le bloc `.state-empty` en conséquence.

---

## 1. Localisateur AVYR (`avyr-partenaires.html#points-de-vente`)

Carte SVG Guadeloupe + filtres + grille de 8 lieux + modale fiche partenaire.

```html
<!-- Store locator : carte Guadeloupe custom SVG (zéro dépendance) -->
<figure class="locator-map reveal d2" id="locatorMap">
  <svg viewBox="0 0 760 470" role="group" aria-labelledby="mapTitle mapDesc" class="gwada-svg">
    <title id="mapTitle">Carte de la Guadeloupe</title>
    <desc id="mapDesc">Nos 8 points de vente partenaires répartis sur Grande-Terre et Basse-Terre. Chaque pin ouvre la fiche du lieu.</desc>
    <!-- Basse-Terre (aile ouest) -->
    <path class="gwada-land" d="M400 235 C380 208 358 174 320 158 C284 143 248 139 218 150 C177 165 148 197 139 236 C129 281 150 331 191 361 C221 383 256 386 277 365 C301 341 300 300 331 275 C361 250 388 249 400 235 Z"/>
    <!-- Grande-Terre (aile est) -->
    <path class="gwada-land" d="M400 235 C405 196 441 161 501 150 C561 142 631 151 666 181 C691 206 680 241 650 259 C610 283 560 285 520 280 C480 275 445 285 425 275 C405 264 398 250 400 235 Z"/>
    <!-- îlots décoratifs (sans pin) -->
    <circle class="gwada-isle" cx="690" cy="405" r="20"/>
    <circle class="gwada-isle" cx="470" cy="425" r="9"/>
    <circle class="gwada-isle" cx="430" cy="440" r="6"/>

    <g class="map-pin" data-type="bar" data-target="place-sunset" tabindex="0" role="button" aria-label="Sunset Lounge, rooftop bar à Pointe-à-Pitre" transform="translate(414 240)">
      <circle class="pin-hit" cy="-12" r="22"/><g class="pin-art"><path class="pin-mark" d="M0 0 C-6 -9 -9 -13 -9 -17 A9 9 0 1 1 9 -17 C9 -13 6 -9 0 0 Z"/><circle class="pin-core" cy="-17" r="3.2"/></g><text class="pin-label" y="-34">Sunset Lounge</text>
    </g>
    <g class="map-pin" data-type="bar" data-target="place-casacoco" tabindex="0" role="button" aria-label="La Casa Coco, bar de plage au Gosier" transform="translate(455 263)">
      <circle class="pin-hit" cy="-12" r="22"/><g class="pin-art"><path class="pin-mark" d="M0 0 C-6 -9 -9 -13 -9 -17 A9 9 0 1 1 9 -17 C9 -13 6 -9 0 0 Z"/><circle class="pin-core" cy="-17" r="3.2"/></g><text class="pin-label" y="-34">La Casa Coco</text>
    </g>
    <g class="map-pin" data-type="hotel" data-target="place-karibea" tabindex="0" role="button" aria-label="Karibea Beach Resort, hôtel au Gosier" transform="translate(507 254)">
      <circle class="pin-hit" cy="-12" r="22"/><g class="pin-art"><path class="pin-mark" d="M0 0 C-6 -9 -9 -13 -9 -17 A9 9 0 1 1 9 -17 C9 -13 6 -9 0 0 Z"/><circle class="pin-core" cy="-17" r="3.2"/></g><text class="pin-label" y="-34">Karibea Beach Resort</text>
    </g>
    <g class="map-pin" data-type="beach" data-target="place-tisable" tabindex="0" role="button" aria-label="Le Ti' Sable, beach club à Sainte-Anne" transform="translate(570 243)">
      <circle class="pin-hit" cy="-12" r="22"/><g class="pin-art"><path class="pin-mark" d="M0 0 C-6 -9 -9 -13 -9 -17 A9 9 0 1 1 9 -17 C9 -13 6 -9 0 0 Z"/><circle class="pin-core" cy="-17" r="3.2"/></g><text class="pin-label" y="-34">Le Ti' Sable</text>
    </g>
    <g class="map-pin" data-type="restaurant" data-target="place-habitation" tabindex="0" role="button" aria-label="L'Habitation Créole, restaurant à Saint-François" transform="translate(634 206)">
      <circle class="pin-hit" cy="-12" r="22"/><g class="pin-art"><path class="pin-mark" d="M0 0 C-6 -9 -9 -13 -9 -17 A9 9 0 1 1 9 -17 C9 -13 6 -9 0 0 Z"/><circle class="pin-core" cy="-17" r="3.2"/></g><text class="pin-label pin-label-end" y="-34">L'Habitation Créole</text>
    </g>
    <g class="map-pin" data-type="beach" data-target="place-bluelagoon" tabindex="0" role="button" aria-label="Blue Lagoon, beach club à Deshaies" transform="translate(216 173)">
      <circle class="pin-hit" cy="-12" r="22"/><g class="pin-art"><path class="pin-mark" d="M0 0 C-6 -9 -9 -13 -9 -17 A9 9 0 1 1 9 -17 C9 -13 6 -9 0 0 Z"/><circle class="pin-core" cy="-17" r="3.2"/></g><text class="pin-label" y="-34">Blue Lagoon</text>
    </g>
    <g class="map-pin" data-type="boutique" data-target="place-comptoir" tabindex="0" role="button" aria-label="Le Comptoir des Îles, boutique à Basse-Terre" transform="translate(182 319)">
      <circle class="pin-hit" cy="-12" r="22"/><g class="pin-art"><path class="pin-mark" d="M0 0 C-6 -9 -9 -13 -9 -17 A9 9 0 1 1 9 -17 C9 -13 6 -9 0 0 Z"/><circle class="pin-core" cy="-17" r="3.2"/></g><text class="pin-label pin-label-start" y="-34">Le Comptoir des Îles</text>
    </g>
    <g class="map-pin" data-type="restaurant" data-target="place-marina" tabindex="0" role="button" aria-label="Le Marina Café, bar-restaurant à Gourbeyre" transform="translate(218 347)">
      <circle class="pin-hit" cy="-12" r="22"/><g class="pin-art"><path class="pin-mark" d="M0 0 C-6 -9 -9 -13 -9 -17 A9 9 0 1 1 9 -17 C9 -13 6 -9 0 0 Z"/><circle class="pin-core" cy="-17" r="3.2"/></g><text class="pin-label pin-label-start" y="-34">Le Marina Café</text>
    </g>
  </svg>
  <figcaption class="locator-hint">Touche un pin pour voir le lieu · les filtres allument les points correspondants</figcaption>
</figure>

<div class="filter-chips reveal d2" id="placeChips">
  <button class="chip active" data-place="tous">Tous</button>
  <button class="chip" data-place="bar">Bars</button>
  <button class="chip" data-place="restaurant">Restaurants</button>
  <button class="chip" data-place="beach">Beach clubs</button>
  <button class="chip" data-place="hotel">Hôtels</button>
  <button class="chip" data-place="boutique">Boutiques</button>
</div>

<div class="places-grid" id="placesGrid">

  <article class="place-card reveal d1" id="place-tisable" data-type="beach" data-desc="Les pieds dans le sable fin de Bois Jolan, Le Ti' Sable est une adresse de Sainte-Anne. Transats face au lagon, ambiance lounge au coucher du soleil et cocktails AVYR servis dans le verre ou en pochette à emporter." data-photos="images/ext/unsplash-photo-1507525428034-b723cf961d3e.jpg">
    <div class="place-thumb"><picture><source type="image/webp" srcset="images/ext/unsplash-photo-1519046904884-53103b34b206.webp"><img width="192" height="192" src="images/ext/unsplash-photo-1519046904884-53103b34b206.jpg" alt="Le Ti' Sable — beach club à Sainte-Anne" loading="lazy" decoding="async"></picture></div>
    <div class="place-body"><span class="place-type">Beach club</span><h3>Le Ti' Sable <span class="badge-demo">Exemple</span></h3><p class="place-loc">📍 Plage de Bois Jolan — Sainte-Anne</p><div class="place-serve"><span>🥂 Sur place</span><span>🛍️ À emporter</span></div></div>
  </article>

  <article class="place-card reveal d2" id="place-casacoco" data-type="bar" data-desc="Sur la célèbre plage de la Datcha au Gosier, La Casa Coco mêle esprit guinguette tropicale et énergie festive. Musique live, transats colorés et cocktails AVYR à savourer face à la mer ou à emporter pour la plage." data-photos="images/ext/unsplash-photo-1551024709-8f23befc6f87.jpg">
    <div class="place-thumb"><picture><source type="image/webp" srcset="images/ext/unsplash-photo-1551024709-8f23befc6f87.webp"><img width="192" height="192" src="images/ext/unsplash-photo-1551024709-8f23befc6f87.jpg" alt="La Casa Coco — bar de plage au Gosier" loading="lazy" decoding="async"></picture></div>
    <div class="place-body"><span class="place-type">Bar de plage</span><h3>La Casa Coco <span class="badge-demo">Exemple</span></h3><p class="place-loc">📍 Plage de la Datcha — Le Gosier</p><div class="place-serve"><span>🥂 Sur place</span><span>🛍️ À emporter</span></div></div>
  </article>

  <article class="place-card reveal d3" id="place-sunset" data-type="bar" data-desc="Perché au cœur de Pointe-à-Pitre, le Sunset Lounge offre une vue panoramique sur la ville et la baie. Ambiance feutrée, DJ sets au crépuscule et carte de cocktails AVYR servis exclusivement sur place dans le verre signature." data-photos="images/ext/unsplash-photo-1414235077428-338989a2e8c0.jpg">
    <div class="place-thumb"><picture><source type="image/webp" srcset="images/ext/unsplash-photo-1414235077428-338989a2e8c0.webp"><img width="192" height="192" src="images/ext/unsplash-photo-1414235077428-338989a2e8c0.jpg" alt="Sunset Lounge — rooftop bar à Pointe-à-Pitre" loading="lazy" decoding="async"></picture></div>
    <div class="place-body"><span class="place-type">Rooftop bar</span><h3>Sunset Lounge <span class="badge-demo">Exemple</span></h3><p class="place-loc">📍 Centre-ville — Pointe-à-Pitre</p><div class="place-serve"><span>🥂 Sur place</span></div></div>
  </article>

  <article class="place-card reveal d4" id="place-habitation" data-type="restaurant" data-desc="À Saint-François, L'Habitation Créole met à l'honneur la cuisine antillaise dans un cadre végétal. En accord avec ses plats signatures, le restaurant propose les cocktails AVYR servis sur place pour prolonger l'expérience." data-photos="images/ext/unsplash-photo-1517248135467-4c7edcad34c4.jpg">
    <div class="place-thumb"><picture><source type="image/webp" srcset="images/ext/unsplash-photo-1517248135467-4c7edcad34c4.webp"><img width="192" height="192" src="images/ext/unsplash-photo-1517248135467-4c7edcad34c4.jpg" alt="L'Habitation Créole — restaurant à Saint-François" loading="lazy" decoding="async"></picture></div>
    <div class="place-body"><span class="place-type">Restaurant</span><h3>L'Habitation Créole <span class="badge-demo">Exemple</span></h3><p class="place-loc">📍 Avenue de l'Europe — Saint-François</p><div class="place-serve"><span>🥂 Sur place</span></div></div>
  </article>

  <article class="place-card reveal d1" id="place-karibea" data-type="hotel" data-desc="Face au lagon de la Pointe de la Verdure au Gosier, le Karibea Beach Resort accueille ses hôtes dans un cadre balnéaire. Cocktails AVYR disponibles au bar de la piscine et de la plage, sur place ou à emporter." data-photos="images/ext/unsplash-photo-1571003123894-1f0594d2b5d9.jpg">
    <div class="place-thumb"><picture><source type="image/webp" srcset="images/ext/unsplash-photo-1571003123894-1f0594d2b5d9.webp"><img width="192" height="192" src="images/ext/unsplash-photo-1571003123894-1f0594d2b5d9.jpg" alt="Karibea Beach Resort — hôtel au Gosier" loading="lazy" decoding="async"></picture></div>
    <div class="place-body"><span class="place-type">Hôtel</span><h3>Karibea Beach Resort <span class="badge-demo">Exemple</span></h3><p class="place-loc">📍 Pointe de la Verdure — Le Gosier</p><div class="place-serve"><span>🥂 Sur place</span><span>🛍️ À emporter</span></div></div>
  </article>

  <article class="place-card reveal d2" id="place-comptoir" data-type="boutique" data-desc="Au cœur de Basse-Terre, Le Comptoir des Îles est une épicerie fine dédiée aux saveurs locales. On y retrouve les pochettes AVYR signature à emporter, parfaites pour prolonger l'esprit des tropiques chez soi ou en pique-nique." data-photos="images/ext/unsplash-photo-1488459716781-31db52582fe9.jpg">
    <div class="place-thumb"><picture><source type="image/webp" srcset="images/ext/unsplash-photo-1488459716781-31db52582fe9.webp"><img width="192" height="192" src="images/ext/unsplash-photo-1488459716781-31db52582fe9.jpg" alt="Le Comptoir des Îles — boutique à Basse-Terre" loading="lazy" decoding="async"></picture></div>
    <div class="place-body"><span class="place-type">Boutique</span><h3>Le Comptoir des Îles <span class="badge-demo">Exemple</span></h3><p class="place-loc">📍 Rue de la République — Basse-Terre</p><div class="place-serve"><span>🛍️ À emporter</span></div></div>
  </article>

  <article class="place-card reveal d3" id="place-bluelagoon" data-type="beach" data-desc="Sur la plage de Grande Anse à Deshaies, Blue Lagoon est un beach club au sable doré et aux eaux turquoise. Parasols, paillotes et cocktails AVYR servis sur place ou en pochette pour profiter du soleil les pieds dans l'eau." data-photos="images/ext/unsplash-photo-1519046904884-53103b34b206.jpg">
    <div class="place-thumb"><picture><source type="image/webp" srcset="images/ext/unsplash-photo-1519046904884-53103b34b206.webp"><img width="192" height="192" src="images/ext/unsplash-photo-1519046904884-53103b34b206.jpg" onerror="this.onerror=null;this.src='images/ext/unsplash-photo-1507525428034-b723cf961d3e.jpg'" alt="Blue Lagoon — beach club à Deshaies" loading="lazy" decoding="async"></picture></div>
    <div class="place-body"><span class="place-type">Beach club</span><h3>Blue Lagoon <span class="badge-demo">Exemple</span></h3><p class="place-loc">📍 Plage de Grande Anse — Deshaies</p><div class="place-serve"><span>🥂 Sur place</span><span>🛍️ À emporter</span></div></div>
  </article>

  <article class="place-card reveal d4" id="place-marina" data-type="restaurant" data-desc="Amarré à la Marina de Rivière-Sens à Gourbeyre, Le Marina Café marie cuisine de la mer et ambiance nautique décontractée. Vue sur les bateaux, terrasse au coucher du soleil et cocktails AVYR servis sur place." data-photos="images/ext/unsplash-photo-1414235077428-338989a2e8c0.jpg">
    <div class="place-thumb"><picture><source type="image/webp" srcset="images/ext/unsplash-photo-1414235077428-338989a2e8c0.webp"><img width="192" height="192" src="images/ext/unsplash-photo-1414235077428-338989a2e8c0.jpg" onerror="this.onerror=null;this.src='images/ext/unsplash-photo-1496337589254-7e19d01cec44.jpg'" alt="Le Marina Café — bar-restaurant à Gourbeyre" loading="lazy" decoding="async"></picture></div>
    <div class="place-body"><span class="place-type">Bar-restaurant</span><h3>Le Marina Café <span class="badge-demo">Exemple</span></h3><p class="place-loc">📍 Marina de Rivière-Sens — Gourbeyre</p><div class="place-serve"><span>🥂 Sur place</span></div></div>
  </article>

</div>
<p class="no-results" id="noPlaces" hidden>Aucun partenaire dans cette catégorie pour le moment — la famille AVYR s'agrandit chaque mois. ✦</p>
```

Modale fiche partenaire (à replacer avant `<script src="events-data.js">`, en fin de body) :

```html
<div class="modal" id="placeModal">
  <div class="modal-box">
    <button class="modal-close" data-close aria-label="Fermer">&times;</button>
    <div class="modal-body">
      <div class="pm-gallery">
        <div class="pm-main"><img width="700" height="394" id="pmMainImg" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==" alt=""></div>
        <div class="pm-thumbs" id="pmThumbs"></div>
      </div>
      <p class="modal-tag" id="pmType" style="margin-top:18px"></p>
      <h3 id="pmTitle"></h3>
      <p class="modal-meta" id="pmLoc"></p>
      <div class="pm-serve" id="pmServe"></div>
      <p class="pm-desc" id="pmDesc"></p>
      <a class="pm-web" id="pmWeb" href="#" target="_blank" rel="noopener" hidden>Visiter le site →</a>
    </div>
  </div>
</div>
```

---

## 2. « Ils nous font confiance » (`index.html#confiance`)

Filtres + bandeau défilant de 10 logos partenaires (aucun validé).

```html
<div class="filter-chips logos-chips reveal d2" id="logoChips">
  <button class="chip active" data-cat="tous">Tous</button>
  <button class="chip" data-cat="bar">Bars &amp; Clubs</button>
  <button class="chip" data-cat="hotel">Hôtels</button>
  <button class="chip" data-cat="beach">Beach clubs</button>
  <button class="chip" data-cat="media">Médias</button>
  <button class="chip" data-cat="distrib">Distributeurs</button>
</div>

<!-- Bandeau défilant (pause au survol) -->
<div class="logos-marquee reveal d3" id="logosMarquee">
  <div class="logos-track" id="logosTrack">
    <a class="logo-tile" data-cat="beach" href="avyr-partenaires.html#points-de-vente" title="Le Ti' Sable — Beach club"><span>Le Ti' Sable</span><small>Beach club</small></a>
    <a class="logo-tile" data-cat="bar" href="avyr-partenaires.html#points-de-vente" title="Sunset Lounge — Rooftop bar"><span>Sunset Lounge</span><small>Rooftop</small></a>
    <a class="logo-tile" data-cat="hotel" href="avyr-partenaires.html#points-de-vente" title="Habitation Créole — Hôtel"><span>Habitation Créole</span><small>Hôtel</small></a>
    <a class="logo-tile" data-cat="beach" href="avyr-partenaires.html#points-de-vente" title="La Casa Coco — Bar de plage"><span>La Casa Coco</span><small>Bar de plage</small></a>
    <a class="logo-tile" data-cat="media" href="#confiance" title="Tropik FM — Radio partenaire"><span>Tropik FM</span><small>Radio</small></a>
    <a class="logo-tile" data-cat="distrib" href="#confiance" title="Antilles Distrib — Distributeur"><span>Antilles Distrib</span><small>Distributeur</small></a>
    <a class="logo-tile" data-cat="bar" href="avyr-partenaires.html#points-de-vente" title="Blue Lagoon — Beach club"><span>Blue Lagoon</span><small>Club</small></a>
    <a class="logo-tile" data-cat="hotel" href="avyr-partenaires.html#points-de-vente" title="Palm Resort — Hôtel"><span>Palm Resort</span><small>Hôtel</small></a>
    <a class="logo-tile" data-cat="media" href="#confiance" title="Karaïb Mag — Magazine"><span>Karaïb Mag</span><small>Magazine</small></a>
    <a class="logo-tile" data-cat="distrib" href="#confiance" title="Sun Logistics — Distribution"><span>Sun Logistics</span><small>Distribution</small></a>
  </div>
</div>
<p class="no-results logos-empty container" id="noLogos" hidden>Aucun partenaire dans cette catégorie pour l'instant. ✦</p>
```
