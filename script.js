document.addEventListener('DOMContentLoaded', function() {
    // NAVIGATION 
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    hamburger.addEventListener('click', function() {
        this.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Active link on scroll
    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', function() {
        let current = '';
        sections.forEach(section => {
            const top = section.offsetTop - 120;
            const height = section.offsetHeight;
            if (window.scrollY >= top && window.scrollY < top + height) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });

        const navbar = document.querySelector('.navbar');
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });

    // SLIDER
    const slider = document.querySelector('.slider');
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const dotsContainer = document.querySelector('.slider-dots');
    let currentSlide = 0;
    let slideInterval;

    slides.forEach((_, index) => {
        const dot = document.createElement('span');
        dot.classList.add('dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });

    const dots = document.querySelectorAll('.dot');

    function goToSlide(index) {
        if (index < 0) index = slides.length - 1;
        if (index >= slides.length) index = 0;
        currentSlide = index;
        slider.style.transform = `translateX(-${index * 100}%)`;
        dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
    }

    function nextSlide() { goToSlide(currentSlide + 1); }
    function prevSlide() { goToSlide(currentSlide - 1); }

    nextBtn.addEventListener('click', () => { clearInterval(slideInterval); nextSlide(); startAutoSlide(); });
    prevBtn.addEventListener('click', () => { clearInterval(slideInterval); prevSlide(); startAutoSlide(); });

    function startAutoSlide() {
        clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, 4000);
    }
    startAutoSlide();

    // CART WITH INR&USD CALCULATIONS
    let cart = [];
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartTotalSpan = document.getElementById('cart-total');
    const cartTotalINRSpan = document.getElementById('cart-total-inr');
    
    const USD_TO_INR = 95.30;

    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const product = this.dataset.product;
            const priceUSD = parseFloat(this.dataset.price);
            const priceINR = priceUSD * USD_TO_INR;
            
            const existingItem = cart.find(item => item.product === product);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({ 
                    product, 
                    priceUSD, 
                    priceINR, 
                    quantity: 1 
                });
            }
            updateCart();
            
            // Button feedback
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-check"></i> Added!';
            setTimeout(() => { this.innerHTML = originalText; }, 1500);
        });
    });

    function formatINR(amount) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    function formatUSD(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    function updateCart() {
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
            cartTotalSpan.textContent = '0.00';
            if (cartTotalINRSpan) {
                cartTotalINRSpan.textContent = '₹0.00';
            }
            return;
        }

        let html = '';
        let totalUSD = 0;
        let totalINR = 0;
        
        cart.forEach((item, index) => {
            const itemTotalUSD = item.priceUSD * item.quantity;
            const itemTotalINR = item.priceINR * item.quantity;
            totalUSD += itemTotalUSD;
            totalINR += itemTotalINR;
            
            html += `
                <div class="cart-item">
                    <div>
                        <span class="cart-item-name">${item.product}</span>
                        <span style="color: var(--gray-600); font-size: 0.9rem;"> × ${item.quantity}</span>
                    </div>
                    <div>
                        <span class="cart-item-price">${formatUSD(itemTotalUSD)}</span>
                        <span style="color: var(--gray-600); font-size: 0.85rem; margin: 0 0.5rem;">|</span>
                        <span class="cart-item-price-inr" style="color: var(--primary); font-weight: 600;">${formatINR(itemTotalINR)}</span>
                        <button class="remove-item" data-index="${index}">✕</button>
                    </div>
                </div>
            `;
        });
        
        cartItemsContainer.innerHTML = html;
        cartTotalSpan.textContent = totalUSD.toFixed(2);
        
        // Update INR total if element exists
        if (cartTotalINRSpan) {
            cartTotalINRSpan.textContent = formatINR(totalINR);
        }

        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', function() {
                cart.splice(this.dataset.index, 1);
                updateCart();
            });
        });
    }

    // CHECKOUT BUTTON
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            if (cart.length === 0) {
                alert('Your cart is empty! Add some products first.');
                return;
            }
            
            const totalUSD = cart.reduce((sum, item) => sum + (item.priceUSD * item.quantity), 0);
            const totalINR = cart.reduce((sum, item) => sum + (item.priceINR * item.quantity), 0);
            
            const items = cart.map(item => 
                `${item.product} (${item.quantity} × ${formatUSD(item.priceUSD)})`
            ).join('\n');
            
            alert(
                `🛒 Order Summary:\n\n` +
                `${items}\n\n` +
                `─────────────────\n` +
                `Total (USD): ${formatUSD(totalUSD)}\n` +
                `Total (INR): ${formatINR(totalINR)}\n\n` +
                `Thank you for your order! We'll process it shortly.`
            );
            
            // Clear cart after checkout
            cart = [];
            updateCart();
        });
    }

    // CONTACT FORM
    const contactForm = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name');
            const email = document.getElementById('email');
            const subject = document.getElementById('subject');
            const message = document.getElementById('message');
            let isValid = true;

            [name, email, subject, message].forEach(field => {
                const error = field.parentElement.querySelector('.error-message');
                if (!field.value.trim()) {
                    error.textContent = 'This field is required';
                    field.style.borderColor = '#e74c3c';
                    isValid = false;
                } else {
                    error.textContent = '';
                    field.style.borderColor = '';
                }
            });

            if (email.value.trim() && !email.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
                const error = email.parentElement.querySelector('.error-message');
                error.textContent = 'Please enter a valid email';
                email.style.borderColor = '#e74c3c';
                isValid = false;
            }

            if (isValid) {
                formMessage.className = 'form-message success';
                formMessage.textContent = '✓ Message sent successfully! We\'ll get back to you soon.';
                this.reset();
                setTimeout(() => {
                    formMessage.className = 'form-message';
                    formMessage.textContent = '';
                }, 5000);
            } else {
                formMessage.className = 'form-message error';
                formMessage.textContent = 'Please fill in all fields correctly.';
            }
        });
    }
});