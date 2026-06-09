document.addEventListener('DOMContentLoaded', () => {

    // Elements Dom
    const ageGate = document.getElementById('age-gate');
    const ageConfirm = document.getElementById('age-confirm');
    const ageDeny = document.getElementById('age-deny');
    const mainHeader = document.querySelector('.main-header');
    const heroSection = document.getElementById('hero');
    const body = document.body;

    // Gestion de l'Age Gate avec SessionStorage pour ne pas bloquer l'utilisateur à chaque refresh
    body.classList.add('modal-open');

    if (sessionStorage.getItem('age-verified') === 'true') {
        removeAgeGate(true); // Sans animation si déjà validé
    }

    ageConfirm.addEventListener('click', () => {
        sessionStorage.setItem('age-verified', 'true');
        removeAgeGate(false);
    });

    ageDeny.addEventListener('click', () => {
        window.location.href = 'https://www.google.com';
    });

    function removeAgeGate(immediate) {
        if (immediate) {
            ageGate.style.display = 'none';
            body.classList.remove('modal-open');
            revealSite();
        } else {
            ageGate.classList.add('fade-out');
            body.classList.remove('modal-open');
            setTimeout(() => {
                ageGate.style.display = 'none';
                revealSite();
            }, 800); // Aligné sur la transition CSS
        }
    }

    // Révélation scénarisée des éléments de la page
    function revealSite() {
        mainHeader.classList.add('visible');
        setTimeout(() => {
            heroSection.classList.add('active');
        }, 300);
    }

    // Effet Navbar au Scroll (Changement d'opacité et de flou)
    window.addEventListener('scroll', () => {
        mainHeader.classList.toggle('scrolled', window.scrollY > 50);
    });

    // Effet Parallaxe Doux sur le Halo Solaire du Hero
    const sunsetHalo = document.querySelector('.sunset-halo');
    window.addEventListener('scroll', () => {
        if (window.scrollY < window.innerHeight) {
            sunsetHalo.style.transform = `translateX(-50%) translateY(${window.scrollY * 0.4}px)`;
        }
    });
});
