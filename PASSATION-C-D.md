# PASSATION — reprendre au LOT C/3

> Branche `claude/r73-loi-evin`, **PR #13 qui reste en Draft**.
> Lire d'abord **`HANDOFF.md` section 0** — « on ne compare que ce qu'on
> sait nommer » — puis ceci.
> Mise à jour : après C/2 et la traque de la pastille blanche.

## Où on en est

Le programme va **du partagé vers le particulier**, jamais page par page.

| Lot | État |
|---|---|
| **A** — socle de preuve | ✅ `intentions.mjs` (preuve d'intention, deux sens) · `registre.mjs` (audit de vocabulaire) |
| **B** — le voile `.ambience` | ✅ dérive au lieu de sauter · 7 pages · 12/12 et 0 plateau |
| **C/1** — rôle TEXTE | ✅ 238 substitutions |
| **C/2** — rôles FOND / BORDURE / OMBRE + `.section-cream` | ✅ 78 substitutions + le cas couplé |
| **C/3** — les accents chauds | ⬜ **LA REPRISE** |
| **D** — par familles de pages | ⬜ contenu long · formulaires · légales |

**Vocabulaire de nuit** (mesuré par `registre.mjs`) : 4 % → **69 %**.
Dumps : `r109` = état après C/2. Le prochain lot dumpe `r110`.

## LA CONSIGNE DE RYTHME

> « N'annonce plus “j'enchaîne sur X” — **enchaîne**. Ne termine pas un
> message sur une intention ; termine-le sur un résultat. »

**GO PERMANENT** sur C/3 et D : ne rien attendre entre les lots.
*(Note : deux des arrêts reprochés venaient d'une coupure de connexion,
pas d'une habitude de fin de tour — le superviseur l'a retiré. La
consigne reste bonne en soi.)*

## LOT C/3 — exactement quoi faire

**Le principe, inchangé** : on réécrit les **usages**, jamais les tokens.
`--cream` **est** le crème chaud de l'ancien monde ; il n'est simplement
plus invoqué là où le rôle veut la nuit. Jamais de chercher-remplacer
aveugle — l'outil `scratchpad/bascule.py` lit chaque déclaration, en
déduit le rôle (texte / fond / bordure / ombre / svg) et ne substitue que
dans les rôles listés. Mode simulation par défaut, `--appliquer` écrit.

**Ce qui reste**, mesuré après C/2 :

| Token | reste | rôles |
|---|---:|---|
| `--passion` | 154 | texte 107 · bordure 20 · fond 14 · outline 8 |
| `--passion-rgb` | 100 | bordure 66 · fond 29 · ombre 5 |
| `--sunset` | 58 | texte 33 · fond 14 · bordure 10 |
| `--sunset-rgb` | 41 | fond 21 · ombre 16 · bordure 3 |
| `--coral` | 10 | texte 8 |
| `--cream` + rgb | 59 | fond (dont `.toast`, coupé avec son encre) |
| `--ink` | 43 | texte 36 (l'encre des surfaces claires restantes) |
| `--gold*` | 90 | **NE BASCULE PAS** — or de MARQUE, décision Kily |

**La cible de nuit pour un accent** : `--or` #E9C988 (or de scène, *en
détail, jamais en aplat*), `--bleu-clair` #7FB2FF (les halos, et l'accent
des titres dans la maquette), `--blanc` #FFFAF0.

⚠ **UN ARBITRAGE À POSER, PAS À TRANCHER SEUL : `--sunset` #FF7A00.**
C'est la couleur d'ACTION de tout le site (les CTA), et elle figure dans
la palette officielle de `CLAUDE.md` §1 — au même titre que Crème, Encre
et Océan profond, déjà basculés en C/1 et C/2 sous l'arbitrage acté.
Mais la maquette 3 fait ses boutons en **blanc**, pas en orange.
Convertir 99 usages de CTA est une décision d'identité, pas d'habillage :
la poser au superviseur avec les chiffres, faire le reste, et continuer.

⚠ **`CLAUDE.md` §1 est périmé** : sa table des couleurs ne liste que
l'ancienne palette et ignore les tokens de nuit ajoutés en R98. Documenter
la réalité (les deux ors, les deux crèmes, les trois nuits) évitera à la
prochaine session de croire que le crème chaud est encore la base.

## La boucle de preuve d'un lot, dans l'ordre

```
node tools/qa/registre.mjs                     # avant, pour le chiffre
python3 …/bascule.py                           # simulation
python3 …/bascule.py --appliquer
node tools/qa/contraste.mjs <page>             # AA, les pages touchées
node tools/qa/debordement.mjs <page>           # 390 px
node tools/qa/ui-dump.mjs r110                 # 0 erreur JS
node tools/qa/intentions.mjs r109 r110 --theme=dark
node tools/qa/maquette.mjs                     # l'accueil n'a pas bougé
node tools/qa/registre.mjs                     # après
```

**Chaque entrée de `tools/qa/intentions.json` porte `de` et `vers`** —
sans ça une réclamation honorée au lot N fait échouer le lot N+1. Et
**un lot peut légitimement ne rien réclamer** (le lot B produit 0
différence : il change une interpolation, un dump lit la page au repos).

## Les captures, ce qui se regarde EN PREMIER

Une pleine page **avant** et **après** par lot, dans `tools/qa/captures/`
(non gitignoré), même viewport, voile levé, animations figées. Script
prêt : `scratchpad/fam.mjs <page> <nom>`. Pour un défaut invisible à
l'œil, livrer les images **en disant qu'elles ne prouvent rien**.

## LA PASTILLE BLANCHE — trouvée et corrigée, à retenir comme méthode

Un `#toast` **vide était peint en permanence** en bas de chaque page.
Cause : il se cachait par `translate(-50%, 140%)` — 140 % **de sa propre
hauteur**. Rempli il fait ~52 px, 140 % = 73 px, il franchit son
`bottom: 24px`. **Vide, il tombe à 32 px** : 45 px de course, 11 px de
pastille crème restent à l'écran. *Un masquage dont la course dépend du
contenu ne masque plus quand il n'y a pas de contenu.*
Remède : `opacity` + `visibility`, qui ne dépendent pas de la taille et
retirent la boîte du parcours clavier. Vérifié aux deux moyens : plus
aucune couche fixe claire sur 4 pages, et le toast s'affiche toujours
(`0/hidden` → `1/visible` → `0/hidden`).

**C'est la cinquième fois qu'un défaut réel est trouvé à l'œil sur une
capture et par aucun instrument** — après le losange, le film injecté, la
barre qui maigrit et la barre trop haute. D'où la section 0 de `HANDOFF`.

## Limites en attente — à TRAITER, pas à re-signaler

Une limite signalée et non traitée finit toujours par coûter (règle 2 de
`HANDOFF.md`) : elle a déjà produit deux défauts.

1. **`registre.mjs` ne mesure pas les états survol/focus.**
2. **`lisibilite.mjs` n'est pas opposable** : sa méthode suppose un fond
   plat dominant, que la nuit n'a pas. À reconstruire ou à retirer.
3. **`contraste.mjs` a le même angle mort** → 1 faux positif
   **préexistant** sur `evenements.html` (`.btn-solid`, fond en dégradé,
   il rapporte `bg(6,10,3)` qui n'existe nulle part). Le superviseur a dit
   de le **laisser** : antérieur, et le remède est déjà écrit dans
   `lisibilite.mjs` (tranche dominante < 25 % ⇒ INDÉTERMINÉ).
4. **`.rev`** : l'accueil n'a plus d'apparitions depuis R100 alors que la
   maquette en a 22. La machinerie est intacte (garde `reveals.length`) —
   des classes à reposer, pas du code à écrire.
5. **Trois règles mortes** posent encore `--cream` en fond : `.serve-tag`,
   `.event-date`, `.hero-line span`. Aucune de ces classes n'existe dans
   un HTML ni dans le JS. Ni converties (illusion de travail) ni
   supprimées (liste rouge) — signalées pour arbitrage.

## Arbitrages ouverts

- **`--sunset`**, ci-dessus.
- **La hauteur de la barre** : 77 px contre 52,3 dans la maquette. Ce
  n'est plus du CSS mais du contenu — les boutons recherche/profil gardés
  + cibles ≥ 44 px (`CLAUDE.md` §2.5). « À l'identique » et « ≥ 44 px »
  sont incompatibles. Trois issues dans `JOURNAL-R106-STABILITE.md`.
- **Le registre du méga-menu** : quatre tells mesurés (crème chaud
  `#FAF8F2`, cartes `radius: 16px`, champ de recherche cerclé d'or,
  fermeture ronde). Capture livrée.
- **Le grain `--noise`** : mesuré comme n'apportant rien (0,05875 contre
  0,05876). Retrait = liste rouge.
- **Le fond de `.toast`** : `--cream` chaud, paire couplée avec son encre.

## LISTE ROUGE — s'arrêter et demander

Passer la PR en Ready ou la fusionner · activer FORM_ENDPOINT / Shotgun /
la newsletter · toucher à `avyr-site/` · inventer une équipe, un artiste,
un témoignage ou un logo partenaire (**il n'y a PAS d'équipe**, Unity 141
est le seul artiste réel, cette absence est la configuration correcte) ·
mettre un visuel produit ailleurs que sur `partenaire-avyr.html` · toute
mention d'alcool ou affirmation juridique · installer une dépendance ou
une étape de build · **supprimer une fonctionnalité**.

## À RETIRER AVANT PUBLICATION

Commit **`f20ea5a`**, préfixé « DEMO — », quatre événements de
démonstration (`demo: true`, badge « Exemple »). Révocable en une
commande, ne contient que les données.

## La limite de périmètre — facile à franchir sans le vouloir

> Sur les 13 pages : **l'habillage et le rythme, pas la structure.** Pas
> de déménagement de section, pas de suppression de contenu, pas de
> réécriture de texte. Une page qui paraît cassée **se signale**, elle ne
> se restructure pas.

Les accents des maquettes 1 (Néon Caraïbe) et 2 (Braise) ne viennent
**qu'après** : on ne pose pas d'accent sur une base pas encore commune.
Jamais une autre base que la nuit de la maquette 3.

## Ordre du lot D, déjà validé

1. **contenu long** — `evenements`, `syf-tv`, `artistes`
2. **formulaires** — `espace-pro`, `partenaires`, `contact`
3. **pages légales** — `cgv`, `mentions-legales`, `confidentialite`, `faq`

Une famille = un lot = un jeu de captures côte à côte.
