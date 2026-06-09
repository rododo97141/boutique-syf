document.addEventListener('DOMContentLoaded', () => {

    // ── DOM ──────────────────────────────────────────────────────────────────
    const ageGate     = document.getElementById('age-gate');
    const ageConfirm  = document.getElementById('age-confirm');
    const ageDeny     = document.getElementById('age-deny');
    const mainHeader  = document.querySelector('.main-header');
    const heroSection = document.getElementById('hero');
    const body        = document.body;

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

    // ── MODULE PANIER ────────────────────────────────────────────────────────
    let cart = [];

    const cartIconGlobal     = document.querySelector('.cart-icon');
    const cartCountBadge     = document.querySelector('.cart-count');
    const cartDrawer         = document.getElementById('cart-drawer');
    const closeCartBtn       = document.getElementById('close-cart');
    const cartOverlay        = document.querySelector('.cart-drawer-overlay');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalPriceEl   = document.getElementById('cart-total-price');
    const addToCartButtons   = document.querySelectorAll('.btn-add-cart');

    cartIconGlobal.addEventListener('click', toggleCart);
    closeCartBtn.addEventListener('click', toggleCart);
    cartOverlay.addEventListener('click', toggleCart);

    function toggleCart() {
        cartDrawer.classList.toggle('open');
    }

    addToCartButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const btn = e.currentTarget;
            const productData = {
                id: btn.getAttribute('data-id'),
                name: btn.getAttribute('data-name'),
                price: parseFloat(btn.getAttribute('data-price')),
                img: btn.getAttribute('data-img'),
                quantity: 1
            };
            addProductToCart(productData);
            animateCartBadge();
        });
    });

    function addProductToCart(product) {
        const existingIndex = cart.findIndex(item => item.id === product.id);
        if (existingIndex > -1) {
            cart[existingIndex].quantity += 1;
        } else {
            cart.push(product);
        }
        updateCartUI();
    }

    function updateCartUI() {
        const totalItems = cart.reduce((acc, curr) => acc + curr.quantity, 0);
        cartCountBadge.textContent = totalItems;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="cart-empty-state">
                    <p>Le panier est vide.</p>
                    <span>Commencez à capturer l'instant.</span>
                </div>
            `;
            cartTotalPriceEl.textContent = "0,00 €";
            return;
        }

        cartItemsContainer.innerHTML = "";

        cart.forEach(item => {
            const itemRow = document.createElement('div');
            itemRow.classList.add('cart-item');
            itemRow.innerHTML = `
                <img src="${item.img}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-details">
                    <h4 class="cart-item-name">${item.name}</h4>
                    <span class="cart-item-price">${item.price.toFixed(2).replace('.', ',')} €</span>
                    <div class="cart-quantity-selector">
                        <button class="qty-btn qty-minus" data-id="${item.id}"><i class="fa-solid fa-minus"></i></button>
                        <span class="qty-val">${item.quantity}</span>
                        <button class="qty-btn qty-plus" data-id="${item.id}"><i class="fa-solid fa-plus"></i></button>
                    </div>
                </div>
                <button class="btn-remove-item" data-id="${item.id}"><i class="fa-solid fa-trash-can"></i></button>
            `;
            cartItemsContainer.appendChild(itemRow);
        });

        const totalPrice = cart.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
        cartTotalPriceEl.textContent = `${totalPrice.toFixed(2).replace('.', ',')} €`;

        bindCartActions();
    }

    function bindCartActions() {
        document.querySelectorAll('.qty-plus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                const item = cart.find(p => p.id === id);
                if (item) item.quantity += 1;
                updateCartUI();
            });
        });

        document.querySelectorAll('.qty-minus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                const item = cart.find(p => p.id === id);
                if (item && item.quantity > 1) {
                    item.quantity -= 1;
                } else if (item && item.quantity === 1) {
                    cart = cart.filter(p => p.id !== id);
                }
                updateCartUI();
            });
        });

        document.querySelectorAll('.btn-remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                cart = cart.filter(p => p.id !== id);
                updateCartUI();
            });
        });
    }

    function animateCartBadge() {
        cartIconGlobal.classList.add('cart-bounce');
        setTimeout(() => cartIconGlobal.classList.remove('cart-bounce'), 400);
    }
});
