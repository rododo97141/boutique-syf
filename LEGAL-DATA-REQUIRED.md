# Données juridiques et factuelles à confirmer avant publication

Document interne (non publié sur le site). Liste les informations
manquantes nécessaires à la mise en conformité des sites SYFIR et AVYR,
et de la page partenaire des Délices du Bassin Bleu. **Aucune de ces
données n'a été inventée ou supposée** — elles sont toutes marquées
`[À COMPLÉTER]` dans le HTML correspondant (`mentions-legales.html`,
`cgv.html`, `confidentialite.html`, sur les deux sites).

**Tant que les données obligatoires ci-dessous ne sont pas fournies, la
publication finale des sites reste bloquée** (mentions légales
incomplètes = non-conformité art. 6 III de la loi n° 2004-575 pour la
confiance dans l'économie numérique).

---

## A. Site SYFIR (racine du dépôt)

| Donnée | Fichier(s) concerné(s) |
|---|---|
| Raison sociale | mentions-legales.html, cgv.html |
| Forme juridique | mentions-legales.html, cgv.html |
| Capital social (si applicable) | mentions-legales.html |
| Siège social (adresse complète) | mentions-legales.html |
| SIRET / RCS | mentions-legales.html |
| N° TVA intracommunautaire | mentions-legales.html |
| Directeur·rice de la publication | mentions-legales.html |
| Téléphone de contact | mentions-legales.html |
| Nom et adresse de l'hébergeur | mentions-legales.html |
| Responsable du traitement des données (RGPD) | confidentialite.html |
| Email de contact RGPD | confidentialite.html |
| Modalités de prix, TVA, paiement, livraison/retrait, rétractation, médiateur de la consommation | cgv.html |
| Source des visuels libres de droits utilisés (ex. Unsplash) | mentions-legales.html |

## A bis. ⚠ NOUVEAU (lot E/2) — un sous-traitant reçoit désormais des données

**Ce point est ouvert par le lot E/2 et il est BLOQUANT pour la publication.**
Jusqu'ici le formulaire de contact ne transmettait rien : `FORM_ENDPOINT`
était vide, aucune donnée personnelle ne quittait le navigateur, et la page
de confidentialité n'avait donc rien à déclarer sur ce point. **Ce n'est
plus vrai.** Depuis E/2, le formulaire `#partnerForm` de `partenaires.html`
envoie ses champs à un prestataire tiers.

> **Rien de ce qui suit n'est une rédaction juridique** — écrire le texte de
> la page de confidentialité est hors du périmètre de cette session (liste
> rouge : aucune affirmation juridique). Ce sont les **faits techniques**,
> relevés dans le code, à remettre au juriste pour qu'il rédige.

| Élément | Fait constaté dans le code |
|---|---|
| **Sous-traitant** | Web3Forms — `https://api.web3forms.com/submit` (`script.js`, constante `FORM_ENDPOINT`). Prestataire **hors Union européenne** : le transfert et sa base légale sont à qualifier. |
| **Finalité** | Acheminer vers la boîte mail du fondateur une demande de contact / candidature partenaire envoyée depuis le site. |
| **Données transmises** | nom, email, téléphone, contexte de la demande, message, type de demande, statut majeur/mineur, et — **si mineur** — nom et contact du responsable légal. Ce dernier point mérite une attention particulière : ce sont des données concernant un mineur. |
| **Données NON transmises** | le honeypot `_gotcha` est retiré du corps avant l'envoi. Aucun stockage local des saisies. |
| **Durée de conservation chez le sous-traitant** | **à confirmer auprès de Web3Forms** — l'ordre de grandeur communément annoncé est de 30 jours, mais ce chiffre n'a **pas** été vérifié depuis cette session : la conformité ne se fonde pas sur un ordre de grandeur. |
| **Destinataire final** | la boîte mail déclarée par le fondateur à la création du formulaire. Elle n'apparaît **pas** dans les sources du site : la clé publique Web3Forms sert d'alias. |
| **Ce qui manque sur le site** | `confidentialite.html` ne mentionne **ni** ce sous-traitant, **ni** cette finalité, **ni** cette durée, **ni** le transfert hors UE. La case de consentement du formulaire dit seulement « J'accepte d'être recontacté(e) par l'équipe SYFIR » — elle ne dit rien du tiers. |
| **Registre des traitements** | à créer ou à compléter (art. 30 RGPD) pour ce traitement. |

**Ce qui reste EN MODE DÉMO, et donc hors de ce point** : la newsletter
(`.footer-news`, sur toutes les pages), le formulaire de l'espace pro
(`#proForm`, qui ne collecte aucun contact — R80-4) et la liste d'attente
(`#edWaitForm`, purement locale). Aucun de ces trois ne transmet quoi que
ce soit à un tiers, et chacun l'affiche.

## B. Site AVYR (avyr-site/)

| Donnée | Fichier(s) concerné(s) |
|---|---|
| Entité exploitant la marque AVYR (raison sociale) | avyr-site/mentions-legales.html, avyr-site/cgv.html |
| Propriétaire ou licencié de la marque AVYR | avyr-site/mentions-legales.html |
| Forme juridique, capital, siège, SIRET/RCS, TVA | avyr-site/mentions-legales.html |
| Directeur·rice de la publication AVYR | avyr-site/mentions-legales.html |
| Fabricant ou conditionneur des cocktails (si applicable) | avyr-site/mentions-legales.html |
| Nom et adresse de l'hébergeur (avyr-site, si hébergement distinct un jour) | avyr-site/mentions-legales.html |
| Responsable du traitement des données (RGPD) | avyr-site/confidentialite.html |
| Email de contact RGPD | avyr-site/confidentialite.html |
| Conditions commerciales professionnelles (grille tarifaire, TVA, paiement, livraison, rétractation, médiateur) | avyr-site/cgv.html |
| Domaine officiel définitif (avyr-site vit provisoirement sous le déploiement GitHub Pages de SYFIR) | avyr-site/README.md, canonicals des 12 pages |

## C. Relation SYFIR / AVYR

| Donnée | Où c'est utilisé |
|---|---|
| Même structure juridique ou entités distinctes ? | mentions-legales.html (SYFIR et AVYR), cgv.html (les deux) |
| Si entités distinctes : existe-t-il un contrat de partenariat écrit ? | LEGAL-RESPONSIBILITIES.md (voir section dédiée) |
| Licence de marque éventuelle (SYFIR utilise-t-elle le nom/logo AVYR avec autorisation, et réciproquement ?) | partenaire-avyr.html, footer des deux sites |
| Droit d'utilisation des visuels AVYR sur le site SYFIR (photos produit utilisées sur partenaire-avyr.html, index.html) | partenaire-avyr.html, index.html |
| Droit d'utilisation du nom/logo SYFIR sur le site AVYR (lien réciproque en footer) | avyr-site/*.html (lien « Écosystème SYFIR ») |
| Répartition des responsabilités commerciales (qui facture quoi à qui) | LEGAL-RESPONSIBILITIES.md |

## D. Les Délices du Bassin Bleu

| Donnée | Où c'est utilisé |
|---|---|
| Autorisation d'utilisation du nom de l'établissement | déjà confirmée par le fondateur (R81.5) — à documenter formellement si besoin d'un écrit |
| Autorisation d'utilisation de visuels futurs (photos du lieu, du plat, etc.) | partenaire-delices-bassin-bleu.html — aucun visuel du restaurant n'est utilisé à ce jour (seule une photo de cocktail générique AVYR y figure) |
| Lien officiel (site web du restaurant, s'il existe) | partenaire-delices-bassin-bleu.html — emplacement prévu dans le texte (« Visiter le site officiel », non affiché tant que non fourni) |
| Statut exact de la collaboration (contrat écrit, accord oral, autre) | LEGAL-RESPONSIBILITIES.md |
| Responsable de la vente et du service des boissons sur place | LEGAL-RESPONSIBILITIES.md |
| Adresse précise (les deux sources publiques disponibles divergent — Odyssea vs Tripadvisor) | non publiée tant que non confirmée par le fondateur ou l'établissement |
| Horaires, téléphone, page Facebook | non publiés (non fournis) |

---

## Statut

**Aucune de ces données n'est publiée en dur sur les pages publiques** — les
pages légales affichent des placeholders `[À COMPLÉTER]` explicites, jamais
une valeur inventée. Les pages restent marquées `noindex` tant que ce
document n'est pas vidé de tout `[À COMPLÉTER]` obligatoire.

**Depuis le lot E/2, la section A bis s'ajoute aux motifs de blocage** : un
formulaire du site transmet désormais des données personnelles à un
sous-traitant que la page de confidentialité ne mentionne pas.
