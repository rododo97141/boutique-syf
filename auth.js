/* ============================================================
   auth.js — module d'authentification SYFIR (isolé)
   ------------------------------------------------------------
   AUTH_PROVIDER = 'local' : le profil vit sur l'APPAREIL (localStorage),
   sans mot de passe, sans envoi réseau. Honnête : on ne simule jamais une
   authentification qu'on n'a pas (pas de faux boutons Google/Apple).

   Interface stable (à conserver quand on branchera un vrai fournisseur) :
     SYFIR_AUTH.getProfile()            -> objet profil | null
     SYFIR_AUTH.signIn(email)           -> { ok, profile } | { ok:false, reason }
     SYFIR_AUTH.signUp(profile)         -> { ok, profile } | { ok:false, reason }
     SYFIR_AUTH.signOut()               -> void
     SYFIR_AUTH.deleteProfile()         -> void   (RGPD — efface le profil)
     SYFIR_AUTH.isLegalAge(birthISO)    -> bool   (>= 18 ans)

   TODO — brancher un vrai fournisseur (décision + compte du FONDATEUR requis) :
   passer AUTH_PROVIDER à 'supabase' ou 'firebase' pour de VRAIS Google/Apple
   et la synchro multi-appareils. Ne changer QUE l'implémentation interne ci-
   dessous ; l'interface publique (getProfile/signIn/signUp/signOut/…) ne bouge
   pas, donc le reste du site n'a rien à modifier.
   - Supabase : supabase.auth.signInWithOAuth({ provider: 'google' | 'apple' }),
     getUser(), signOut() ; profil dans une table `profiles`.
   - Firebase : signInWithPopup(GoogleAuthProvider/OAuthProvider('apple.com')),
     onAuthStateChanged, Firestore pour le profil.

   TODO — parcours d'inscription cible façon Nike (accounts.nike.com/join),
   à implémenter côté Supabase quand un vrai backend sera branché. En mode
   'local' aujourd'hui : PAS de mot de passe ni de code e-mail (honnêteté
   technique). Le jour venu, le parcours devient, écran par écran :
     1. E-mail        — l'utilisateur saisit son e-mail (déjà en place).
     2. Code de vérif — supabase.auth.signInWithOtp({ email }) envoie un code ;
        écran de saisie du code à 6 chiffres.
     3. Renvoi temporisé — bouton « Renvoyer le code dans Xs » : décompte
        (ex. 30s) désactivé, réactivé à 0, re-signInWithOtp au clic.
     4. Compléter le profil — prénom, nom, date de naissance (18+), commune,
        opt-in newsletter (le formulaire d'inscription actuel).
     5. Mot de passe — supabase.auth.updateUser({ password }) avec règles
        live à la Nike : 8 caractères min, au moins une majuscule, une
        minuscule et un chiffre (même pattern « croix grise → coche verte »
        que la validation e-mail/âge déjà en place sur compte.html).
   L'interface publique ci-dessus (signUp/signIn/…) restera le point d'entrée ;
   ces étapes s'orchestrent dans l'implémentation `supabase` et dans compte.html.
   ============================================================ */
(function () {
  'use strict';

  var AUTH_PROVIDER = 'local';   // <- seul point à changer pour un vrai backend
  var KEY = 'syfir-user';

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; }
  }
  function write(p) {
    try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) {}
  }

  // Âge légal (18+) à partir d'une date ISO 'YYYY-MM-DD'
  function isLegalAge(birthISO) {
    if (!birthISO) return false;
    var d = new Date(birthISO + 'T00:00:00');
    if (isNaN(d.getTime())) return false;
    var now = new Date();
    var age = now.getFullYear() - d.getFullYear();
    var m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
    return age >= 18;
  }

  var providers = {
    local: {
      getProfile: function () {
        var p = read();
        return (p && p.name) ? p : null;
      },
      // « Connu sur cet appareil » : l'e-mail correspond au profil enregistré.
      signIn: function (email) {
        var p = read();
        if (p && p.email && email && p.email.toLowerCase() === String(email).toLowerCase()) {
          return { ok: true, profile: p };
        }
        return { ok: false, reason: 'unknown' };
      },
      signUp: function (profile) {
        profile = profile || {};
        if (!profile.name || !profile.email) return { ok: false, reason: 'missing' };
        if (!isLegalAge(profile.birth)) return { ok: false, reason: 'age' };
        var p = {
          name: String(profile.name).trim(),
          email: String(profile.email).trim(),
          city: String(profile.city || '').trim(),
          birth: profile.birth,
          newsletter: !!profile.newsletter
        };
        write(p);
        return { ok: true, profile: p };
      },
      signOut: function () {
        try { localStorage.removeItem(KEY); } catch (e) {}
      },
      // RGPD : efface le profil de l'appareil. (Billets/favoris s'effacent à part.)
      deleteProfile: function () {
        try { localStorage.removeItem(KEY); } catch (e) {}
      }
    }
    /* , supabase: { … }, firebase: { … }  // à implémenter le jour venu */
  };

  var impl = providers[AUTH_PROVIDER] || providers.local;

  window.SYFIR_AUTH = {
    provider: AUTH_PROVIDER,
    getProfile: impl.getProfile,
    signIn: impl.signIn,
    signUp: impl.signUp,
    signOut: impl.signOut,
    deleteProfile: impl.deleteProfile,
    isLegalAge: isLegalAge
  };
})();
