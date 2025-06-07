// Form submission handling
const form = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const originalBtnText = submitBtn.textContent;

form.addEventListener('submit', function(e) {
    // Add loading state
    submitBtn.textContent = 'Sending...';
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    // Reset after response (formspree will handle the actual submission)
    setTimeout(() => {
        submitBtn.textContent = 'Message Sent!';
        submitBtn.classList.remove('loading');
        submitBtn.classList.add('success');
        
        // Reset form after delay
        setTimeout(() => {
            form.reset();
            submitBtn.textContent = originalBtnText;
            submitBtn.classList.remove('success');
            submitBtn.disabled = false;
        }, 2000);
    }, 1000);
});

// Enhanced form interactions
document.querySelectorAll('.form-control').forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.style.transform = 'translateY(-2px)';
    });
    
    input.addEventListener('blur', function() {
        this.parentElement.style.transform = 'translateY(0)';
    });
    
    // Real-time validation feedback
    input.addEventListener('input', function() {
        if (this.checkValidity()) {
            this.style.borderColor = '#27ae60';
        } else if (this.value.length > 0) {
            this.style.borderColor = '#e74c3c';
        } else {
            this.style.borderColor = '#e1e8ed';
        }
    });
});

// Smooth scroll for back button if on same page
document.querySelector('.back-to-home').addEventListener('click', function(e) {
    // Add smooth transition effect
    document.body.style.transition = 'opacity 0.3s ease';
    document.body.style.opacity = '0.8';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
        document.body.style.transition = '';
    }, 200);
});

// Add intersection observer for animations on scroll
if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // Observe contact cards
    document.querySelectorAll('.contact-info-card, .contact-form-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

// Keyboard navigation enhancement
document.addEventListener('keydown', function(e) {
    // Escape key to focus back button
    if (e.key === 'Escape') {
        document.querySelector('.back-to-home').focus();
    }
    
    // Tab navigation enhancement for social links
    if (e.key === 'Tab') {
        const focusedElement = document.activeElement;
        if (focusedElement.classList.contains('social-link')) {
            focusedElement.style.transform = 'translateY(-3px) scale(1.05)';
            setTimeout(() => {
                if (document.activeElement !== focusedElement) {
                    focusedElement.style.transform = '';
                }
            }, 200);
        }
    }
});

// Handle form errors gracefully
form.addEventListener('invalid', function(e) {
    e.preventDefault();
    const firstInvalid = form.querySelector(':invalid');
    if (firstInvalid) {
        firstInvalid.focus();
        firstInvalid.style.borderColor = '#e74c3c';
        firstInvalid.style.boxShadow = '0 0 0 3px rgba(231, 76, 60, 0.1)';
    }
}, true);

// Clear error styling when user starts typing
document.querySelectorAll('.form-control').forEach(input => {
    input.addEventListener('input', function() {
        if (this.style.borderColor === 'rgb(231, 76, 60)') {
            this.style.borderColor = '';
            this.style.boxShadow = '';
        }
    });
});