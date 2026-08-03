# tools/qa/captures — les captures VERSIONNÉES

> **Pourquoi ce dossier existe, et pourquoi il n'est pas dans `out/`.**
> `tools/qa/out/` est ignoré par git. Six lots durant, le superviseur a jugé sur
> des **chiffres** pendant que Kily jugeait sur des **images** — et les images
> n'étaient nulle part. Trois « toujours pas » se sont joués là.

Chaque lot dépose ici, au minimum :

| Fichier | Ce que c'est |
|---|---|
| `<lot>-accueil-desktop.png` | l'accueil, pleine page, 1440×900 |
| `<lot>-maquette-desktop.png` | `maquettes/3-LUMIERE-DE-SCENE.html`, **même viewport** |
| `<lot>-accueil-390.png` | l'accueil, pleine page, 390×844 |
| `<lot>-maquette-390.png` | la maquette, **même viewport** |

**Conditions de prise, identiques des deux côtés** — sinon on compare deux
instants et non deux pages :

- voile du Portail **levé** (`localStorage.syfir-portal`),
- blocs `.rev` / `.reveal` forcés à leur état **final**,
- animations **figées au même instant** (`currentTime = 0`),
- page descendue jusqu'en bas **avant** la capture (l'accueil grandit pendant
  qu'on le mesure — piège R92 §4B), puis remontée en haut.

Générées par `node tools/qa/captures.mjs <lot>`.

> **C'est ce que le superviseur regarde en premier, avant tout tableau.**
