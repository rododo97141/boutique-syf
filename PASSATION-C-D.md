# PASSATION — reprendre au LOT C/2

> Écrite **avant** de manquer de contexte, comme exigé. Branche
> `claude/r73-loi-evin`, **PR #13 qui reste en Draft**.
> Lire d'abord **`HANDOFF.md` section 0** — « on ne compare que ce qu'on
> sait nommer » — puis ceci.

## Où on en est

Le programme validé par le superviseur va **du partagé vers le
particulier**, jamais page par page :

| Lot | État |
|---|---|
| **A** — socle de preuve | ✅ `intentions.mjs` (preuve d'intention, deux sens) + `registre.mjs` (audit de vocabulaire) |
| **B** — le voile `.ambience` | ✅ dérive au lieu de sauter, 7 pages, 12/12 et 0 plateau |
| **C/1** — la nuit devient la base, rôle TEXTE | ✅ 238 substitutions · vocabulaire de nuit 4 % → **66 %** |
| **C/2** — rôles FOND, BORDURE, OMBRE | ⬜ **à faire, c'est la reprise** |
| **C/3** — les accents chauds | ⬜ `--sunset`, `--passion`, `--mango`, `--coral` |
| **D** — par familles de pages | ⬜ contenu long · formulaires · légales |

## LA CONSIGNE DE RYTHME, qui prime sur tout

> « N'annonce plus “j'enchaîne sur X” — **enchaîne**. Ne termine pas un
> message sur une intention ; termine-le sur un résultat. »

Le superviseur l'a dit après **trois** arrêts sur une intention annoncée,
dont un de dix heures. **GO PERMANENT** : ne rien attendre entre les lots.

## LOT C/2 — exactement quoi faire

**Le principe** : on réécrit les **usages**, jamais les tokens. Repointer
`--cream` vers `#EEF2F8` serait plus court d'une ligne et détruirait la
distinction que `tokens.css` défend — `--cream` **est** le crème chaud de
l'ancien monde, il n'est simplement plus invoqué là où le rôle veut la
nuit. C'est ça, « l'ancien devient l'exception ».

**Le reste à basculer**, mesuré par rôle :

| Token | reste | rôles |
|---|---:|---|
| `--cream` + `--cream-rgb` | **96** | fond 59 · bordure 37 |
| `--ink` | 44 | texte 37 · fond 6 |
| `--ink-soft` | 23 | fond 23 |
| `--ocean-deep` | 19 | fond 18 |
| `--passion` + rgb | 254 | → **C/3** |
| `--sunset` + rgb | 99 | → **C/3** |

⚠ **LE PIÈGE À NE PAS RATER** : un fond clair et son encre sombre sont
**couplés**. `--cream` en fond porte du `--ink` en texte. Basculer l'un
sans l'autre casse le contraste. C'est pour ça qu'ils n'ont pas été faits
en C/1 — ils doivent partir **ensemble**, et `contraste.mjs` sur les
15 pages est la preuve, pas une formalité.

**L'or de marque ne bascule jamais** — décision Kily : `--gold`,
`--gold-rgb`, `--gold-light`, `--gold-deep` (90 usages). `--or` #E9C988
est l'or de scène. Toute décision de garder l'ancien registre **se nomme**.

**L'outil de bascule** est dans le bac à sable
(`scratchpad/bascule.py`) — il lit chaque déclaration, en déduit le rôle,
et ne substitue que dans les rôles listés. Il a un mode simulation par
défaut ; `--appliquer` écrit. **Ne jamais faire de chercher-remplacer
aveugle** : R102 a coûté 785 lignes supprimées par une opération
d'intervalle.

## La boucle de preuve d'un lot, dans l'ordre

```
node tools/qa/registre.mjs                    # avant, pour le chiffre
python3 …/bascule.py                          # simulation
python3 …/bascule.py --appliquer
node tools/qa/contraste.mjs <page>            # les 15, AA
node tools/qa/debordement.mjs <page>          # 390 px
node tools/qa/ui-dump.mjs r1NN               # 0 erreur JS
node tools/qa/intentions.mjs r1NN-1 r1NN --theme=dark
node tools/qa/maquette.mjs                    # l'accueil n'a pas bougé
node tools/qa/registre.mjs                    # après
```
Dumps : `r108` = état actuel. Le prochain lot dumpe `r109`.

**Chaque entrée du manifeste `tools/qa/intentions.json` porte `de` et
`vers`** — sans ça une réclamation honorée au lot N fait échouer le lot
N+1. Et **un lot peut légitimement ne rien réclamer** (le lot B produit
0 différence : il change une interpolation, un dump lit la page au repos).

## Les captures, c'est ce qui se regarde EN PREMIER

Chaque lot dépose dans `tools/qa/captures/` (non gitignoré) une pleine
page **avant** et **après**, même viewport, voile levé, animations figées.
Script prêt : `scratchpad/fam.mjs <page> <nom>`.
Pour un défaut invisible à l'œil, livrer les images **en disant qu'elles
ne prouvent rien** — c'est ce que le superviseur a explicitement salué.

## Limites en attente, à traiter et non à re-signaler

Une limite signalée et non traitée finit toujours par coûter — c'est la
règle 2 de `HANDOFF.md`, et elle a déjà produit deux défauts.

1. **`registre.mjs` ne mesure pas les états survol/focus.** Ouvert depuis
   le lot A.
2. **`lisibilite.mjs` n'est pas opposable** : sa méthode suppose un fond
   plat dominant, que la nuit n'a pas. À reconstruire ou à retirer.
3. **`contraste.mjs` a le même angle mort** : sur `.btn-solid`, fond en
   dégradé orange, il rapporte `bg(6,10,3)` qui n'existe nulle part →
   1 faux positif **préexistant** sur `evenements.html`. Le remède est
   celui déjà écrit dans `lisibilite.mjs` : si la tranche dominante pèse
   moins de 25 %, la boîte est **INDÉTERMINÉE**, ni réussie ni en défaut.
4. **`.rev` — l'accueil n'a plus d'apparitions** depuis R100 alors que la
   maquette en a 22. La machinerie est intacte (garde `reveals.length`) :
   c'est des classes à reposer, pas du code à écrire.

## Arbitrages ouverts, à ne pas trancher seul

- **La hauteur de la barre** : 77 px contre 52,3 dans la maquette. Ce
  n'est plus du CSS, c'est du contenu — les boutons recherche/profil que
  Kily a gardés, plus la loi des cibles ≥ 44 px (`CLAUDE.md` §2.5).
  « À l'identique » et « ≥ 44 px » sont incompatibles ici. Trois issues
  dans `JOURNAL-R106-STABILITE.md`.
- **Le registre du méga-menu** : quatre tells de l'ancien site mesurés
  (crème chaud `#FAF8F2`, cartes `border-radius: 16px`, champ de
  recherche cerclé d'or, bouton de fermeture rond). Capture livrée,
  Kily tranche.
- **Le grain `--noise`** : mesuré comme n'apportant rien (0,05875 contre
  0,05876). Retrait = liste rouge, donc arbitrage.

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
démonstration avec `demo: true` et badge « Exemple » visible. Révocable en
une commande, ne contient que les données.

## La limite de périmètre posée par le superviseur

> Sur les 13 pages : **l'habillage et le rythme, pas la structure.** Pas
> de déménagement de sections, pas de suppression de contenu, pas de
> réécriture de textes. Une page qui paraît structurellement cassée **se
> signale**, elle ne se restructure pas.

Et les accents des maquettes 1 (Néon Caraïbe) et 2 (Braise) ne viennent
**qu'après** : on ne pose pas d'accent sur une base pas encore commune.
Jamais une autre base que la nuit de la maquette 3.
