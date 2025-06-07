// Google Sign-In Configuration
let currentUser = null;
let isGoogleApiLoaded = false;

// Function to show error messages
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
    }
    console.error('Google Sign-In Error:', message);
}

// Function to hide error messages
function hideError() {
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
        errorDiv.classList.add('hidden');
    }
}

// Show loading state
function showLoadingState() {
    const loadingState = document.getElementById('signinLoadingState');
    const signinButton = document.getElementById('g_id_signin');
    if (loadingState) loadingState.classList.remove('hidden');
    if (signinButton) signinButton.classList.add('hidden');
}

// Hide loading state and show button
function showSigninButton() {
    const loadingState = document.getElementById('signinLoadingState');
    const signinButton = document.getElementById('g_id_signin');
    if (loadingState) loadingState.classList.add('hidden');
    if (signinButton) signinButton.classList.remove('hidden');
}

// Initialize Google Sign-In when API loads
function initializeGoogleSignIn() {
    console.log('Initializing Google Sign-In...');
    
    try {
        if (typeof google === 'undefined' || !google.accounts) {
            throw new Error('Google Sign-In API not loaded');
        }
        
        // Initialize Google Sign-In
        google.accounts.id.initialize({
            client_id: '650247727271-mcufppu5e4u1ksdt8758lstfvnj9ki3i.apps.googleusercontent.com',
            callback: handleSignInResponse,
            auto_select: false,
            cancel_on_tap_outside: false,
            use_fedcm_for_prompt: false
        });
        
        // Render the proper Google Sign-In button
        const signinContainer = document.getElementById('g_id_signin');
        if (signinContainer) {
            google.accounts.id.renderButton(
                signinContainer,
                {
                    theme: 'outline',
                    size: 'large',
                    type: 'standard',
                    text: 'signin_with',
                    shape: 'rectangular',
                    logo_alignment: 'left',
                    width: 280
                }
            );
        }
        
        isGoogleApiLoaded = true;
        showSigninButton();
        console.log('Google Sign-In initialized successfully');
        hideError();
        
    } catch (error) {
        console.error('Failed to initialize Google Sign-In:', error);
        showError('Failed to load Google Sign-In. Please refresh the page and try again.');
        // Hide loading state even on error
        const loadingState = document.getElementById('signinLoadingState');
        if (loadingState) loadingState.classList.add('hidden');
    }
}

// Handle Google Sign-In response
function handleSignInResponse(response) {
    console.log('Sign-in response received');
    hideError();
    
    try {
        if (!response.credential) {
            throw new Error('No credential received from Google');
        }
        
        // Decode the JWT token to get user info
        const userInfo = parseJwt(response.credential);
        console.log('User info decoded:', userInfo);
        
        currentUser = {
            name: userInfo.name,
            email: userInfo.email,
            picture: userInfo.picture,
            token: response.credential
        };
        
        // Store auth info (using memory storage for demo)
        storeUserSession(currentUser);
        
        // Show authenticated state
        showAuthenticatedView();
        
        console.log('User authenticated successfully');
        
    } catch (error) {
        console.error('Error handling sign-in:', error);
        showError('Authentication failed. Please try again.');
    }
}

// Parse JWT token
function parseJwt(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error parsing JWT:', error);
        throw new Error('Invalid token format');
    }
}

// Store user session (using memory for demo - in production use secure storage)
function storeUserSession(user) {
    try {
        // Using temporary in-memory storage since we can't use localStorage in Claude artifacts
        window.tempUserSession = user;
    } catch (error) {
        console.error('Error storing session:', error);
    }
}

// Check for existing authentication
function checkExistingAuth() {
    try {
        if (window.tempUserSession) {
            currentUser = window.tempUserSession;
            showAuthenticatedView();
            console.log('Existing authentication found');
        }
    } catch (error) {
        console.error('Error checking existing auth:', error);
        window.tempUserSession = null;
    }
}

// Show authenticated view
function showAuthenticatedView() {
    const authSection = document.getElementById('authSection');
    const contactFormSection = document.getElementById('contactFormSection');
    
    if (authSection) authSection.classList.add('hidden');
    if (contactFormSection) contactFormSection.classList.remove('hidden');
    
    // Populate user info
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');
    
    if (userAvatar) userAvatar.src = currentUser.picture || '';
    if (userName) userName.textContent = currentUser.name || '';
    if (userEmail) userEmail.textContent = currentUser.email || '';
    
    // Pre-fill hidden form fields
    const senderName = document.getElementById('senderName');
    const senderEmail = document.getElementById('senderEmail');
    const authToken = document.getElementById('authToken');
    
    if (senderName) senderName.value = currentUser.name || '';
    if (senderEmail) senderEmail.value = currentUser.email || '';
    if (authToken) authToken.value = currentUser.token || '';
}

// Initialize logout functionality
function initializeLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            console.log('Logging out...');
            
            // Clear session
            window.tempUserSession = null;
            currentUser = null;
            
            // Reset view
            const authSection = document.getElementById('authSection');
            const contactFormSection = document.getElementById('contactFormSection');
            
            if (authSection) authSection.classList.remove('hidden');
            if (contactFormSection) contactFormSection.classList.add('hidden');
            
            // Reset form
            const form = document.getElementById('contactForm');
            if (form) form.reset();
            
            // Sign out from Google
            if (isGoogleApiLoaded && google.accounts) {
                google.accounts.id.disableAutoSelect();
            }
            
            console.log('Logged out successfully');
        });
    }
}

// Form submission handling
function initializeForm() {
    const form = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    
    if (!form || !submitBtn) return;
    
    const originalBtnText = submitBtn.textContent;
    
    form.addEventListener('submit', function(e) {
        // Verify user is still authenticated
        if (!currentUser) {
            e.preventDefault();
            alert('Please sign in again to send your message.');
            return;
        }
        
        // Add loading state
        submitBtn.textContent = 'Sending Secure Message...';
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        
        // Reset after response (formspree will handle the actual submission)
        setTimeout(() => {
            submitBtn.textContent = 'Message Sent Securely!';
            submitBtn.classList.remove('loading');
            submitBtn.classList.add('success');
            
            // Reset form after delay
            setTimeout(() => {
                // Reset message and subject only, keep user info
                const subject = document.getElementById('subject');
                const message = document.getElementById('message');
                
                if (subject) subject.value = '';
                if (message) message.value = '';
                
                submitBtn.textContent = originalBtnText;
                submitBtn.classList.remove('success');
                submitBtn.disabled = false;
            }, 2000);
        }, 1000);
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
}

// Enhanced form interactions
function initializeFormInteractions() {
    const formControls = document.querySelectorAll('.form-control');
    
    formControls.forEach(input => {
        input.addEventListener('focus', function() {
            if (this.parentElement) {
                this.parentElement.style.transform = 'translateY(-2px)';
            }
        });
        
        input.addEventListener('blur', function() {
            if (this.parentElement) {
                this.parentElement.style.transform = 'translateY(0)';
            }
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
            
            // Clear error styling when user starts typing
            if (this.style.borderColor === 'rgb(231, 76, 60)') {
                this.style.borderColor = '';
                this.style.boxShadow = '';
            }
        });
    });
}

// Smooth scroll for back button
function initializeBackButton() {
    const backButton = document.querySelector('.back-to-home');
    if (backButton) {
        backButton.addEventListener('click', function(e) {
            // Add smooth transition effect
            document.body.style.transition = 'opacity 0.3s ease';
            document.body.style.opacity = '0.8';
            
            setTimeout(() => {
                document.body.style.opacity = '1';
                document.body.style.transition = '';
            }, 200);
        });
    }
}

// Add intersection observer for animations on scroll
function initializeScrollAnimations() {
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
        const cards = document.querySelectorAll('.contact-info-card, .contact-form-card, .auth-section');
        cards.forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(card);
        });
    }
}

// Keyboard navigation enhancement
function initializeKeyboardNavigation() {
    document.addEventListener('keydown', function(e) {
        // Escape key to focus back button
        if (e.key === 'Escape') {
            const backButton = document.querySelector('.back-to-home');
            if (backButton) backButton.focus();
        }
        
        // Tab navigation enhancement for social links
        if (e.key === 'Tab') {
            const focusedElement = document.activeElement;
            if (focusedElement && focusedElement.classList.contains('social-link')) {
                focusedElement.style.transform = 'translateY(-3px) scale(1.05)';
                setTimeout(() => {
                    if (document.activeElement !== focusedElement) {
                        focusedElement.style.transform = '';
                    }
                }, 200);
            }
        }
    });
}

// Fallback initialization with multiple attempts
let initAttempts = 0;
const maxAttempts = 5;

function attemptInitialization() {
    if (!isGoogleApiLoaded && initAttempts < maxAttempts) {
        initAttempts++;
        console.log(`Attempting Google Sign-In initialization (attempt ${initAttempts}/${maxAttempts})...`);
        
        if (typeof google !== 'undefined' && google.accounts) {
            initializeGoogleSignIn();
        } else {
            setTimeout(attemptInitialization, 2000);
        }
    } else if (initAttempts >= maxAttempts && !isGoogleApiLoaded) {
        console.error('Failed to initialize Google Sign-In after maximum attempts');
        showError('Failed to load Google Sign-In. Please refresh the page and try again.');
        const loadingState = document.getElementById('signinLoadingState');
        if (loadingState) loadingState.classList.add('hidden');
    }
}

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing contact page...');
    
    // Initialize all functionality
    showLoadingState();
    checkExistingAuth();
    initializeLogout();
    initializeForm();
    initializeFormInteractions();
    initializeBackButton();
    initializeScrollAnimations();
    initializeKeyboardNavigation();
});

// Initialize Google Sign-In when the script loads
window.addEventListener('load', function() {
    console.log('Window loaded, initializing Google Sign-In...');
    
    // Wait a bit for the Google script to fully load
    setTimeout(() => {
        initializeGoogleSignIn();
    }, 1000);
    
    // Start the initialization attempts after a short delay
    setTimeout(attemptInitialization, 2000);
});

// Export functions for testing or external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeGoogleSignIn,
        handleSignInResponse,
        parseJwt,
        showAuthenticatedView,
        checkExistingAuth
    };
}