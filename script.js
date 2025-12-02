/* ==============================================
   PERSONAL PORTFOLIO - JAVASCRIPT
   ============================================== */

// Check for reduced motion preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Smooth scroll reveal on intersection
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            // Add slight stagger effect for multiple elements
            if (!prefersReducedMotion) {
                entry.target.style.animation = `fadeInUp 0.6s ease-out`;
            }
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all reveal elements
document.querySelectorAll('.reveal').forEach(el => {
    observer.observe(el);
});

// Enhanced button ripple effect on click
document.querySelectorAll('.btn, .link-btn, .badge').forEach(element => {
    element.addEventListener('click', function(e) {
        if (prefersReducedMotion) return;
        
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const ripple = document.createElement('span');
        ripple.style.position = 'absolute';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.style.width = '10px';
        ripple.style.height = '10px';
        ripple.style.background = 'rgba(255, 255, 255, 0.6)';
        ripple.style.borderRadius = '50%';
        ripple.style.pointerEvents = 'none';
        ripple.style.animation = `rippleEffect 0.6s ease-out`;
        
        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    });
});

// Add ripple animation keyframes dynamically
if (!document.querySelector('style[data-ripple]')) {
    const rippleStyle = document.createElement('style');
    rippleStyle.setAttribute('data-ripple', 'true');
    rippleStyle.textContent = `
        @keyframes rippleEffect {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(rippleStyle);
}

// Smooth scrolling for navigation links with active state tracking
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        
        if (href === '#') {
            e.preventDefault();
            return;
        }

        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({
                behavior: prefersReducedMotion ? 'auto' : 'smooth',
                block: 'start'
            });
        }
    });
});

// Active nav link tracking with smooth transitions
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav a');

window.addEventListener('scroll', debounce(() => {
    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (window.pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
}, 100));

// Form submission handler with animations
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;

        if (!name || !email || !message) {
            alert('Please fill in all fields');
            return;
        }

        // Add submit animation
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        submitBtn.textContent = '✓ Sent!';
        submitBtn.style.animation = 'none';
        
        console.log('Form submitted:', { name, email, message });
        alert(`Thanks ${name}! I'll get back to you at ${email} soon.`);

        this.reset();
        
        setTimeout(() => {
            submitBtn.textContent = originalText;
        }, 2000);
    });
}

// Debounce helper for performance
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Mouse move parallax effect on hero avatar
const avatar = document.querySelector('.avatar');
if (avatar && !prefersReducedMotion) {
    document.addEventListener('mousemove', debounce((e) => {
        const moveX = (e.clientX - window.innerWidth / 2) * 0.01;
        const moveY = (e.clientY - window.innerHeight / 2) * 0.01;
        avatar.style.transform = `translateX(${moveX}px) translateY(${moveY}px)`;
    }, 10));
}

// Intersection observer for proficiency bars (animated fill)
const barObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = `fillBar 1s ease-out forwards`;
            barObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

// Add animated fill bars keyframe
if (!document.querySelector('style[data-bars]')) {
    const barStyle = document.createElement('style');
    barStyle.setAttribute('data-bars', 'true');
    barStyle.textContent = `
        @keyframes fillBar {
            from {
                width: 0 !important;
            }
        }
    `;
    document.head.appendChild(barStyle);
}

document.querySelectorAll('.proficiency-fill').forEach(bar => {
    barObserver.observe(bar);
});

// Scroll progress indicator
const createProgressBar = () => {
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        height: 3px;
        background: linear-gradient(90deg, #7C5CFF, #2FE6C5);
        width: 0%;
        z-index: 100;
        transition: width 0.1s ease;
    `;
    document.body.appendChild(progressBar);
    
    return progressBar;
};

const progressBar = createProgressBar();

window.addEventListener('scroll', debounce(() => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (window.pageYOffset / totalHeight) * 100;
    progressBar.style.width = progress + '%';
}, 10));

// Mobile menu setup (for future expansion)
function setupMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const nav = document.querySelector('.nav');

    if (hamburger && nav) {
        hamburger.addEventListener('click', () => {
            nav.classList.toggle('open');
            hamburger.classList.toggle('active');
        });

        document.querySelectorAll('.nav a').forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('open');
                hamburger.classList.remove('active');
            });
        });
    }
}

setupMobileMenu();

// Reduced motion support
if (prefersReducedMotion) {
    document.documentElement.style.scrollBehavior = 'auto';
    document.querySelectorAll('[style*="animation"]').forEach(el => {
        el.style.animation = 'none';
    });
}

// Page load complete animation
window.addEventListener('load', () => {
    document.body.style.opacity = '1';
});

// Console branding
console.log(
    '%c👨‍💻 Welcome to my portfolio!',
    'font-size: 16px; font-weight: bold; color: #7C5CFF;'
);
console.log(
    '%cBuilt with HTML, CSS, and vanilla JavaScript',
    'font-size: 12px; color: #A9B4CC;'
);
