// Age Gate
const ageGate = document.getElementById('age-gate');
const ageConfirm = document.getElementById('age-confirm');
const ageDeny = document.getElementById('age-deny');

if (sessionStorage.getItem('age-verified')) {
  ageGate.classList.add('hidden');
}

ageConfirm.addEventListener('click', () => {
  sessionStorage.setItem('age-verified', '1');
  ageGate.classList.add('hidden');
});

ageDeny.addEventListener('click', () => {
  window.location.href = 'https://www.google.fr';
});

// Header scroll effect
const header = document.querySelector('.main-header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 60);
});

// Reveal on scroll
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
    }
  });
}, { threshold: 0.15 });

reveals.forEach(el => observer.observe(el));
