// Age Gate
const ageGate = document.getElementById('age-gate');
const ageConfirm = document.getElementById('age-confirm');
const ageDeny = document.getElementById('age-deny');
const header = document.querySelector('.main-header');
const heroSection = document.querySelector('.hero-section');

function revealSite() {
    document.body.classList.remove('modal-open');
    ageGate.classList.add('fade-out');
    setTimeout(() => {
        ageGate.style.display = 'none';
        header.classList.add('visible');
        heroSection.classList.add('active');
    }, 800);
}

if (sessionStorage.getItem('age-verified')) {
    ageGate.style.display = 'none';
    header.classList.add('visible');
    heroSection.classList.add('active');
} else {
    document.body.classList.add('modal-open');
}

ageConfirm.addEventListener('click', () => {
    sessionStorage.setItem('age-verified', '1');
    revealSite();
});

ageDeny.addEventListener('click', () => {
    window.location.href = 'https://www.google.fr';
});

// Header scroll effect
window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
});

// Reveal on scroll
const reveals = document.querySelectorAll('.reveal');
if (reveals.length) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('in');
        });
    }, { threshold: 0.15 });
    reveals.forEach(el => observer.observe(el));
}
