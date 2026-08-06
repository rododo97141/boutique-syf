# DEUX RÈGLES DE PERFORMANCE — payées par un navigateur gelé

> Ces deux règles ne viennent pas d'une bonne pratique lue quelque part :
> **chacune a figé le navigateur** pendant le travail du 04/08. Elles sont
> écrites ici parce qu'elles se réintroduisent facilement — les deux motifs
> ont l'air parfaitement raisonnables.

## 1. Jamais une propriété dépendant de `--p` sur un pseudo-élément plein écran

`--p` est **réécrite à chaque image** par la boucle du ciel (l'horloge de
défilement). Une propriété qui la lit est donc recalculée 60 fois par
seconde.

**Ce qui gèle** : deux dégradés radiaux repeints 60 fois par seconde sur
un **calque non promu**. Le moteur de rendu s'arrête.

**Pourquoi `.n0` / `.n1` / `.n2` y survivent** : ce sont de **vrais
éléments**. Ils peuvent être promus sur leur propre calque de composition ;
un pseudo-élément plein écran ne l'est pas, et sa repeinture réenrôle son
parent.

**Vérifié dans l'état actuel du dépôt** : les six lectures de `var(--p)`
sont toutes sur de vrais éléments — `.n0`, `.n1`, `.n2` (les trois nuits),
`.projos` (les projecteurs), `.brume`. **Aucun pseudo-élément ne lit
`--p`.** C'est l'état à préserver.

> **Le contrôle, avant de commiter du CSS** : pour chaque `::before` /
> `::after`, vérifier qu'aucune de ses déclarations ne contient `var(--p)`.
> Si un décor doit dériver au défilement, il prend un **élément à lui**.

## 2. Aucun sélecteur universel

`.page-home *:focus-visible` place **tout le document** dans l'ensemble
candidat : le recalcul de style repart en boucle sur l'arbre entier, à
chaque changement de focus.

**Sélecteurs nommés uniquement.** Si une règle doit couvrir plusieurs
composants, on liste les composants — la liste est plus longue à écrire et
elle est bornée.

**Vérifié dans l'état actuel** : aucun sélecteur universel dans
`style.css` ni dans `syfir-ui/`. La seule occurrence de `*` est le reset
`*, *::before, *::after { box-sizing }`, qui ne porte **aucun état** et ne
se réévalue jamais.

> **Le contrôle** : `grep -n '\*:focus\|\.page-home \*'` doit rendre vide.

---

## Ce que ces deux règles ont en commun

Les deux motifs sont **corrects au sens du CSS** — ils produisent
exactement l'effet demandé. Ce qui les rend fautifs, c'est le **coût de
recalcul**, qu'aucun instrument du harnais ne mesure aujourd'hui : ni le
contraste, ni le débordement, ni les cibles tactiles, ni même l'INP (qui
mesure une interaction ponctuelle, pas une boucle de défilement).

**C'est un angle mort déclaré**, à traiter comme les autres : une limite
signalée et non traitée finit toujours par coûter (`HANDOFF.md` §0,
règle 2). L'instrument qui manque mesurerait le **temps passé en style et
en peinture pendant un défilement continu**.
