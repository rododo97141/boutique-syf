document.addEventListener('DOMContentLoaded', () => {

    // ── DOM ──────────────────────────────────────────────────────────────────
    const ageGate      = document.getElementById('age-gate');
    const ageConfirm   = document.getElementById('age-confirm');
    const ageDeny      = document.getElementById('age-deny');
    const mainHeader   = document.querySelector('.main-header');
    const heroSection  = document.getElementById('hero');
    const cartDrawer   = document.getElementById('cart-drawer');
    const cartOverlay  = cartDrawer.querySelector('.cart-drawer-overlay');
    const closeCartBtn = document.getElementById('close-cart');
    const cartIcon     = document.querySelector('.cart-icon');
    const cartCountEl  = document.querySelector('.cart-count');
    const cartItemsCtn = document.getElementById('cart-items-container');
    const cartTotalEl  = document.getElementById('cart-total-price');
    const body         = document.body;

    // ── AGE GATE ─────────────────────────────────────────────────────────────
    body.classList.add('modal-open');

    if (sessionStorage.getItem('age-verified') === 'true') {
        removeAgeGate(true);
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
            }, 800);
        }
    }

    function revealSite() {
        mainHeader.classList.add('visible');
        setTimeout(() => heroSection.classList.add('active'), 300);
    }

    // ── HEADER SCROLL ────────────────────────────────────────────────────────
    window.addEventListener('scroll', () => {
        mainHeader.classList.toggle('scrolled', window.scrollY > 50);
    });

    // ── PARALLAXE HALO ───────────────────────────────────────────────────────
    const sunsetHalo = document.querySelector('.sunset-halo');
    window.addEventListener('scroll', () => {
        if (window.scrollY < window.innerHeight) {
            sunsetHalo.style.transform = `translateX(-50%) translateY(${window.scrollY * 0.4}px)`;
        }
    });

    // ── REVEAL ON SCROLL ─────────────────────────────────────────────────────
    const revealOptions = {
        root: null,
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-active');
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // ── CART STATE ───────────────────────────────────────────────────────────
    let cart = [];

    function openCart() {
        cartDrawer.classList.add('open');
        body.classList.add('modal-open');
    }

    function closeCart() {
        cartDrawer.classList.remove('open');
        body.classList.remove('modal-open');
    }

    cartIcon.addEventListener('click', openCart);
    closeCartBtn.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);

    // Ajouter au panier
    document.querySelectorAll('.btn-add-cart').forEach(btn => {
        btn.addEventListener('click', () => {
            const { id, name, price, img } = btn.dataset;
            const existing = cart.find(item => item.id === id);
            if (existing) {
                existing.qty++;
            } else {
                cart.push({ id, name, price: parseFloat(price), img, qty: 1 });
            }
            renderCart();
            openCart();
            animateCartIcon();
        });
    });

    function renderCart() {
        if (cart.length === 0) {
            cartItemsCtn.innerHTML = `
                <div class="cart-empty-state">
                    <p>Le panier est vide.</p>
                    <span>Commencez à capturer l'instant.</span>
                </div>`;
            cartTotalEl.textContent = '0,00 €';
            cartCountEl.textContent = '0';
            return;
        }

        const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
        const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
        cartCountEl.textContent = totalQty;
        cartTotalEl.textContent = total.toFixed(2).replace('.', ',') + ' €';

        cartItemsCtn.innerHTML = cart.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <img src="${item.img}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-details">
                    <p class="cart-item-name">${item.name}</p>
                    <div class="cart-item-controls">
                        <button class="cart-qty-btn" data-action="decrease" data-id="${item.id}">−</button>
                        <span class="cart-qty">${item.qty}</span>
                        <button class="cart-qty-btn" data-action="increase" data-id="${item.id}">+</button>
                    </div>
                </div>
                <span class="cart-item-price">${(item.price * item.qty).toFixed(2).replace('.', ',')} €</span>
            </div>
        `).join('');

        // Délégation des boutons +/−
        cartItemsCtn.querySelectorAll('.cart-qty-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                const item = cart.find(i => i.id === id);
                if (!item) return;
                if (btn.dataset.action === 'increase') {
                    item.qty++;
                } else {
                    item.qty--;
                    if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
                }
                renderCart();
            });
        });
    }

    function animateCartIcon() {
        cartIcon.classList.add('bounce');
        cartIcon.addEventListener('animationend', () => cartIcon.classList.remove('bounce'), { once: true });
    }
});
