# DOCTRINE-SYFIR.md

**Document interne. Référence canonique du copy du site SYFIR.**
En cas de contradiction entre une page du site et ce document, ce document tranche —
et la page est corrigée.

Ce fichier ne contient **aucune donnée juridique, commerciale ou factuelle inventée**.
Ce qui n'est pas encore arbitré est marqué `[À CONFIRMER]` et reste une inconnue
jusqu'à décision du fondateur.

Portée : le site SYFIR (racine du dépôt). Le site AVYR (`avyr-site/`) a sa propre
doctrine éditoriale — voir `avyr-site/README.md`.

---

## 1. Identité validée

> **SYFIR est une identité de fête et de musique, portée par un écosystème de services,
> permettant aussi bien aux particuliers de créer leurs petites soirées qu'à SYFIR et
> ses partenaires de produire de grands événements.**

**Territoire** : fête + musique + expérience collective.

### Les quatre fonctions

| Fonction | Ce que ça veut dire |
|---|---|
| **Inspirer** | Donner envie, montrer ce qui se passe, faire exister les moments. |
| **Permettre** | Donner les moyens de créer sa propre fête. |
| **Connecter** | Mettre en relation ceux qui font la fête et ceux qui la rendent possible. |
| **Produire** | Créer et coorganiser les grands événements. |

### Les deux échelles

**Échelle 1 — les particuliers créent leurs petites soirées.**
Anniversaires, fêtes privées. La personne sélectionne des services dans l'écosystème :
lieu, DJ, nourriture, boissons, décoration, son, photo.

Trois niveaux d'accompagnement : **autonome**, **assistée**, **complète**.

> **⚠️ Statut réel : offre EN CONSTRUCTION, non opérationnelle.**
> Interdit tant que ce n'est pas ouvert : catalogue de services, grille tarifaire,
> parcours de réservation, promesse de disponibilité, nom de prestataire non confirmé.
> Autorisé : dire que l'offre se construit, et recueillir un intérêt via le formulaire
> existant (`partenaires.html?type=soiree-particulier#partnerForm`).

**Échelle 2 — SYFIR produit ou coorganise les grands événements.**
Festivals, concerts, grandes soirées. C'est l'échelle réellement active aujourd'hui,
avec la billetterie et le Smartboard organisateur.

### Phrase de synthèse

> **« Avec SYFIR, chacun peut créer sa fête, et SYFIR peut créer les grands moments
> qui rassemblent tout le monde. »**

### Signature de marque

> **R84 — décision validée par le fondateur.** L'ancien slogan **« Goûte à la
> liberté »** appartient à l'ère où SYFIR était la marque de cocktails. Il est
> **retiré définitivement** du site, et il n'est **pas transféré à AVYR** :
> associer un produit alcoolisé à la liberté est précisément le type
> d'association que la loi Évin interdit (art. L3323-4 — seules les mentions
> objectives sont autorisées pour l'alcool).

Trois niveaux, jamais confondus :

| Niveau | Texte | Usage |
|---|---|---|
| **Signature publique officielle** | **« Tes prochains souvenirs commencent ici. »** | Hero, pied de page (« la fin signée »), JSON-LD `slogan`. Signature actuelle du site. |
| **Manifeste de marque** | *(à rédiger au besoin — page écosystème, dossier de presse)* | Développement long de l'identité, pas une phrase unique répétée partout. |
| **Philosophie interne** | « Le véritable luxe est de comprendre que chaque instant est précieux. » | Jamais affichée obligatoirement — repère de ton pour l'équipe, pas un slogan public. |

---

## 2. La règle partenaire

> **Un partenaire SYFIR accompagne et enrichit l'univers sans y être fondu.**

Un partenaire garde son identité, sa marque, son autonomie juridique et commerciale.
Il n'est pas absorbé dans l'identité SYFIR, et SYFIR ne se substitue pas à lui.

Corollaire direct, à ne jamais perdre de vue : **SYFIR met en relation et coordonne ;
il ne fournit pas lui-même les services de ses partenaires.**

---

## 3. Statut des partenaires nommés

### AVYR

- Marque **produit** indépendante de cocktails. Ce n'est pas une marque SYFIR.
- Elle n'est **ni éditée ni vendue par SYFIR**.
- Elle a son **propre site autonome** (`avyr-site/`), sa propre nav, son propre code,
  ses propres pages légales.
- Sur le site SYFIR, elle est présentée par **une seule page courte** :
  `partenaire-avyr.html`.
- Séparation des marques : **SYFIR** = l'écosystème, l'événementiel, la billetterie,
  le média. **AVYR** = le cocktail.
- Aucun diminutif (« Syp », « Syf ») en communication officielle.

### Les Délices du Bassin Bleu

- Restaurant à **Gourbeyre**, établissement **indépendant**.
- Membre de l'écosystème SYFIR, et restaurant partenaire AVYR.
- Faits confirmés et affichables : le nom, la commune, le fait que des cocktails AVYR
  y sont proposés, le lien Instagram.
- Tout le reste est `[À CONFIRMER]` — voir `LEGAL-RESPONSIBILITIES.md`.

---

## 4. Politique d'âge par événement

SYFIR **n'a pas** de modale d'âge globale : le site n'est pas un site consacré à
l'alcool, et bloquer toutes les pages serait faux pour un événement tout public.

Chaque événement porte un **statut d'âge** parmi quatre :

| Statut | Libellé affiché | Rappel à la réservation |
|---|---|---|
| `tout-public` | Tout public | aucun |
| `16-plus` | 16 ans et plus | oui |
| `18-plus` | 18 ans et plus | oui |
| `a-confirmer` | Condition d'âge à confirmer | oui |

Valeur par défaut si le champ est absent : **`a-confirmer`**. On ne suppose jamais.

**Ce qu'on ne dit jamais** : que SYFIR *vérifie* l'âge ou l'identité.
**Ce qu'on dit** : que l'organisateur ou le lieu **peut demander un justificatif à
l'entrée**.

Le site AVYR conserve sa **propre** confirmation d'âge, indépendante — c'est un site
consacré à un produit alcoolisé, la situation n'est pas la même. Le mot employé est
« confirmation » ou « déclaration », **jamais** « vérification ».

Décision du fondateur : la règle des 18 ans à l'inscription du compte SYFIR est
maintenue, sans exception. Un événement peut être ouvert aux mineurs (statut
tout-public ou 16-plus) sans que cela change la règle du compte : c'est l'adulte
titulaire du compte qui effectue toute démarche pour un mineur dont il est
responsable. SYFIR ne collecte, ne vend et ne gère jamais aucune donnée ni aucun
billet nominatif lié à un mineur — le compte et l'achat restent à 100% adultes.
Toute information d'âge affichée sur un événement reste une mention informative
rédigée par l'organisateur, sous sa seule responsabilité ; SYFIR ne la vérifie
jamais, conformément à la règle déjà énoncée plus haut dans cette section.

---

## 4bis. Rôle de SYFIR par événement : deux axes, trois modes

Le rôle de SYFIR n'est pas fixe pour l'ensemble de la marque, et **ce n'est pas une
alternative binaire** : il se détermine événement par événement, sur deux axes
**indépendants** qui se croisent librement.

### Les deux axes

**Axe 1 — détention juridique de l'événement** : qui porte le bail du lieu, les
autorisations administratives et la qualité d'organisateur.
- **Courtière** : SYFIR ne porte rien de tout cela — elle met en relation, chaque
  prestataire réalise et contracte directement avec le client (cf. section 2, La
  règle partenaire).
- **Organisatrice partielle** : SYFIR ne porte **ni le bail ni les autorisations**,
  mais contracte **en son nom** la programmation artistique, et souvent la
  billetterie. Ce n'est **pas** une coorganisation à mi-chemin — c'est une position
  précise, définie par ce que SYFIR contracte elle-même.
- **Organisatrice pleine** : SYFIR porte le bail, les autorisations et la qualité
  d'organisateur.

**Axe 2 — production de prestations en propre** : SYFIR produit-elle elle-même une
prestation qu'elle doit assurer ? Aucune / programmation artistique / billetterie /
autre.

Les deux axes sont indépendants et se croisent : SYFIR peut produire en propre
(ex. programmation artistique) sans être organisatrice au sens de l'axe 1, et être
organisatrice sans rien produire elle-même.

Ce croisement doit être **explicite et déterminé pour chaque événement, jamais
ambigu** : il conditionne l'assurance à mobiliser, les déclarations légales à
effectuer, et la chaîne de responsabilité en cas d'incident. En cas de litige,
c'est le rôle **réellement joué dans les faits** qui prévaut, pas l'étiquette
choisie a priori.

### Les trois modes

- **Vivre un événement** — participation : la personne assiste à un événement
  organisé par SYFIR ou par un tiers.
- **Organiser le sien** — SYFIR accompagne, avec ou pour le client (particulier ou
  professionnel), avec ou sans artistes selon l'événement.
- **SYFIR publie** — le site diffuse les événements organisés, les siens comme ceux
  de tiers (soirées, festivals, événements). C'est un rôle de diffuseur/plateforme,
  et c'est littéralement ce que fait le site aujourd'hui (billetterie, fiches
  événement).

### Obligations déclenchées par l'axe 2

Dès que SYFIR contracte elle-même un artiste ou un technicien du spectacle
(programmation artistique en propre), elle porte les obligations sociales et
déclaratives attachées à cette contractualisation (GUSO, ou statut d'intermittent
au-delà d'un seuil légal — pas un choix de gestion), ainsi que la déclaration
SACEM pour la diffusion musicale. Le détail de ces obligations relève du corpus
juridique (`LEGAL-RESPONSIBILITIES.md`), pas de cette doctrine de copy.

**Réserve** : la qualification du DJ comme artiste du spectacle vivant a fait
l'objet de débats juridiques ; la position actuelle du GUSO et du ministère les
inclut, mais cela reste **à confirmer par l'avocat** — ce n'est pas présenté comme
purgé de toute contestation.

### Ce qui ne change pas selon le rôle ou le mode

Dans tous les cas, la restauration et la boisson alcoolisée restent en toutes
circonstances **hors du périmètre de SYFIR elle-même** — assurées exclusivement par
un partenaire ou un lieu licencié.

**[Statut à ce jour]** Aucun événement organisé directement par SYFIR en tant
qu'organisatrice n'a encore eu lieu — cette section est préparatoire, en
anticipation de l'évolution de la marque, pas la description d'une pratique déjà
en cours.

---

## 5. Vocabulaire

### À bannir

| Formule interdite | Pourquoi |
|---|---|
| « nos services traiteur » | SYFIR ne fournit pas de traiteur. |
| « nous proposons [service d'un tiers] » | Fait apparaître SYFIR comme fournisseur. |
| « SYFIR vous fournit… » | Idem. |
| « notre offre boissons » | SYFIR ne vend pas de boissons. |
| « On apporte le reste » | Formule d'ensemblier : laisse croire que SYFIR exécute tout. |
| « on amène les cocktails, le bar et l'ambiance » | Faux, et double risque : fournisseur + produit alcoolisé d'un tiers. |
| « nouvelles saveurs » (dans un texte SYFIR) | Vocabulaire produit AVYR. |
| « Goûte à la liberté » (pour SYFIR **ou** AVYR) | R84 — ancien slogan, retiré définitivement. Associer un produit alcoolisé à la liberté est le type d'association que la loi Évin interdit (art. L3323-4) : non transférable à AVYR. Signature actuelle de SYFIR : « Tes prochains souvenirs commencent ici. » |

### À utiliser

- « prestataires sélectionnés »
- « partenaires de l'écosystème »
- « SYFIR met en relation »
- « service assuré par [le partenaire] »
- « le contrat est conclu directement avec le prestataire »

### Règle de fond

Le risque visé est la **pratique commerciale trompeuse** et l'**apparence de
fournisseur**. Chaque fois qu'une phrase pourrait faire croire au lecteur que SYFIR
exécute lui-même une prestation qu'il ne fait que mettre en relation, elle est fausse
et doit être réécrite.

### Ton éditorial

Phrases courtes, tutoiement, jargon marketing interdit. Les textes doivent pouvoir
être **lus à voix haute dans un bar sans sonner faux**. L'expérience avant le produit.

---

## 6. Sélection et référencement des partenaires

Rubrique publique : `partenaires.html#referencement`.

- L'entrée se fait par candidature (formulaire) ou échange direct. Rien n'est
  automatique.
- Un partenaire n'est publié qu'avec son **accord explicite**, et seules les
  informations qu'il a lui-même confirmées sont affichées.
- **Critère complémentaire rendu public** (décision du fondateur, 26/07) : assurance
  et autorisations applicables à jour, fournies et vérifiées. Pas d'ancienneté
  minimale, pas de critère chiffré — cohérent avec l'esprit d'accompagnement de la
  marque, qui n'exclut pas les jeunes structures. L'absence d'une assurance
  obligatoire ou d'une autorisation indispensable **bloque le référencement sans
  exception possible**.
- **Ordre d'affichage** (décision du fondateur, 26/07) : tri **alphabétique par
  défaut**, avec une **option chronologique** offerte à l'utilisateur. Aucune place
  n'est vendue, aucun classement payant — règle inchangée. *(Statut
  d'implémentation, tracé explicitement : avec 2 partenaires officiels affichés à
  ce jour, un sélecteur de tri à l'écran n'apporte rien de perceptible — la règle
  est posée maintenant, l'interface de tri suit quand la liste grandira. Choix
  assumé, pas un oubli.)*
- La sortie se fait à la demande du partenaire à tout moment, ou à l'initiative de
  SYFIR si la collaboration prend fin ou si les informations ne sont plus exactes.
- SYFIR **ne se porte pas garant** de la conformité réglementaire, des autorisations
  ou des assurances de ses partenaires, au-delà de la vérification faite à l'entrée
  dans la sélection.

`[À CONFIRMER]` : préavis et modalités formelles de retrait.

---

## 7. Principes déjà actés

Principes de gestion validés par le fondateur, à respecter dans toute décision
structurante — y compris quand ils ne sont pas visibles sur le site.

- **Réserve financière systématique.** Toute activité constitue une réserve ; on ne
  fonctionne pas à flux tendu.
- **Entité vendeuse unique.** Une seule entité vend, pour que la responsabilité
  commerciale soit lisible et non éclatée.
  `[À CONFIRMER]` — laquelle, et son périmètre exact : voir `LEGAL-DATA-REQUIRED.md`.
- **Accès aux données par mission.** On accède aux données pour la mission qu'on a à
  remplir, pas au-delà.
- **Doctrine contractuelle : protéger le vital, clauses défendables, négociation
  maîtrisée.** On protège d'abord ce sans quoi le projet ne survit pas ; on ne signe
  que des clauses qu'on pourrait défendre ; on garde la main sur la négociation.

---

## 8. Honnêteté — les règles dures

1. **Aucune donnée juridique, commerciale ou factuelle inventée.** Jamais. Un
   placeholder `[À COMPLÉTER]` / `[À CONFIRMER]` visible vaut mieux qu'une donnée
   plausible et fausse.
2. **Aucune donnée fictive dans la version publique.** Pas de faux partenaires, faux
   artistes, faux événements, faux chiffres, faux témoignages — même marqués « démo ».
   Un état vide honnête est préférable.
3. **Aucune affirmation de conformité non prouvée.** On ne dit pas qu'on vérifie ce
   qu'on ne vérifie pas.
4. **Une offre non ouverte est annoncée comme non ouverte**, visuellement et
   textuellement.
5. **Ce qui n'est pas vérifié visuellement n'est pas terminé.** Rendre, capturer,
   critiquer, corriger.

---

## 9. Documents liés

| Fichier | Contenu |
|---|---|
| `CLAUDE.md` | Design system, contraintes techniques, conventions de code. |
| `LEGAL-DATA-REQUIRED.md` | Données légales et factuelles manquantes. |
| `LEGAL-RESPONSIBILITIES.md` | Qui vend, qui encaisse, qui sert, qui détient la licence — faits confirmés et inconnues. |
| `avyr-site/README.md` | Architecture et doctrine du site AVYR autonome. |
| `HANDOFF.md` | État technique du dépôt. |
