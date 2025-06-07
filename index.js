// Add smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Scroll navigation functionality
function setupScrollNavigation(containerId, prevBtnId, nextBtnId) {
    const container = document.getElementById(containerId);
    const prevBtn = document.getElementById(prevBtnId);
    const nextBtn = document.getElementById(nextBtnId);
    
    if (!container || !prevBtn || !nextBtn) return;
    
    const cardWidth = 350; // Width of project cards + gap
    const tutorialCardWidth = 300; // Width of tutorial cards + gap
    const scrollAmount = containerId.includes('projects') ? cardWidth + 30 : tutorialCardWidth + 30;
    
    prevBtn.addEventListener('click', () => {
        container.scrollBy({
            left: -scrollAmount,
            behavior: 'smooth'
        });
    });
    
    nextBtn.addEventListener('click', () => {
        container.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
        });
    });
    
    // Update button visibility based on scroll position
    function updateButtonVisibility() {
        const scrollLeft = container.scrollLeft;
        const maxScroll = container.scrollWidth - container.clientWidth;
        
        prevBtn.style.opacity = scrollLeft > 0 ? '1' : '0.5';
        nextBtn.style.opacity = scrollLeft < maxScroll - 1 ? '1' : '0.5';
        
        prevBtn.disabled = scrollLeft <= 0;
        nextBtn.disabled = scrollLeft >= maxScroll - 1;
    }
    
    container.addEventListener('scroll', updateButtonVisibility);
    window.addEventListener('resize', updateButtonVisibility);
    updateButtonVisibility(); // Initial check
}

// Initialize scroll navigation for both sections
setupScrollNavigation('projectsContainer', 'projectsPrev', 'projectsNext');
setupScrollNavigation('tutorialsContainer', 'tutorialsPrev', 'tutorialsNext');

// Search functionality
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const projectsContainer = document.getElementById('projectsContainer');
const tutorialsContainer = document.getElementById('tutorialsContainer');

// All project and tutorial cards
const allCards = [
    ...document.querySelectorAll('.project-card'),
    ...document.querySelectorAll('.tutorial-card')
];

// Highlight text function
function highlightText(text, searchTerm) {
    if (!searchTerm) return text;
    
    const regex = new RegExp(searchTerm, 'gi');
    return text.replace(regex, match => `<span class="highlight">${match}</span>`);
}

// Search function
function performSearch(searchTerm) {
    if (!searchTerm) {
        searchResults.style.display = 'none';
        return;
    }
    
    const results = [];
    
    allCards.forEach(card => {
        const searchData = card.getAttribute('data-search').toLowerCase();
        const title = card.querySelector('h3').textContent.toLowerCase();
        const description = card.querySelector('p').textContent.toLowerCase();
        
        if (searchData.includes(searchTerm) || 
            title.includes(searchTerm) || 
            description.includes(searchTerm)) {
            
            const type = card.classList.contains('project-card') ? 'Project' : 'Tutorial';
            const highlightedTitle = highlightText(card.querySelector('h3').textContent, searchTerm);
            const highlightedDesc = highlightText(card.querySelector('p').textContent, searchTerm);
            
            results.push({
                element: card,
                type,
                title: highlightedTitle,
                description: highlightedDesc
            });
        }
    });
    
    displayResults(results, searchTerm);
}

// Display search results
function displayResults(results, searchTerm) {
    searchResults.innerHTML = '';
    
    if (results.length === 0) {
        searchResults.innerHTML = '<div class="no-results">No results found for "' + searchTerm + '"</div>';
    } else {
        results.forEach(result => {
            const resultElement = document.createElement('div');
            resultElement.className = 'search-result-item';
            resultElement.innerHTML = `
                <h4><span class="result-type">${result.type}</span>${result.title}</h4>
                <p>${result.description}</p>
            `;
            
            resultElement.addEventListener('click', () => {
                // First ensure all cards are visible
                allCards.forEach(card => card.style.display = '');
                
                // Scroll to the specific card
                result.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // Apply more noticeable highlight animation
                result.element.style.boxShadow = '0 0 0 4px rgba(52, 152, 219, 0.7)';
                result.element.style.transform = 'scale(1.03)';
                result.element.style.transition = 'all 0.3s ease';
                
                // Reset the highlight after animation
                setTimeout(() => {
                    result.element.style.boxShadow = '';
                    result.element.style.transform = '';
                }, 2500);
                
                // Close search results
                searchResults.style.display = 'none';
                searchInput.value = '';
            });
            
            searchResults.appendChild(resultElement);
        });
    }
    
    searchResults.style.display = 'block';
}

// Event listeners
searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.trim().toLowerCase();
    performSearch(searchTerm);
});

// Close search results when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-container')) {
        searchResults.style.display = 'none';
    }
});

// Filter projects and tutorials when pressing Enter
searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const searchTerm = searchInput.value.trim().toLowerCase();
        
        if (!searchTerm) {
            // Show all if search is empty
            allCards.forEach(card => card.style.display = '');
            return;
        }
        
        allCards.forEach(card => {
            const searchData = card.getAttribute('data-search').toLowerCase();
            const title = card.querySelector('h3').textContent.toLowerCase();
            const description = card.querySelector('p').textContent.toLowerCase();
            
            if (searchData.includes(searchTerm) || 
                title.includes(searchTerm) || 
                description.includes(searchTerm)) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
        
        // Scroll to projects section if there are results
        if (document.querySelector('.project-card[style=""]') || 
            document.querySelector('.tutorial-card[style=""]')) {
            document.getElementById('projects').scrollIntoView({ behavior: 'smooth' });
        }
        
        searchResults.style.display = 'none';
    }
});

// auth-handler.js - Handle authentication checks for contact link

// Cookie management functions
function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) {
            try {
                return JSON.parse(decodeURIComponent(c.substring(nameEQ.length, c.length)));
            } catch (e) {
                console.error('Error parsing cookie:', e);
                return null;
            }
        }
    }
    return null;
}

// Check if session is still valid (within 7 days)
function isSessionValid(sessionData) {
    if (!sessionData || !sessionData.signInTime) {
        return false;
    }
    
    const sessionAge = Date.now() - sessionData.signInTime;
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    
    return sessionAge < maxAge;
}

// Check authentication status
function checkAuthStatus() {
    try {
        // Check memory first (for same session)
        if (window.tempUserSession && isSessionValid(window.tempUserSession)) {
            return true;
        }
        
        // Check cookie (for persistence across sessions)
        const cookieSession = getCookie('userSession');
        if (cookieSession && isSessionValid(cookieSession)) {
            window.tempUserSession = cookieSession; // Sync to memory
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Error checking auth status:', error);
        return false;
    }
}

// Handle contact link clicks
function handleContactClick(event) {
    event.preventDefault(); // Prevent default navigation
    
    console.log('Contact link clicked, checking authentication...');
    
    if (checkAuthStatus()) {
        console.log('User is authenticated, redirecting to contact page...');
        window.location.href = 'contact.html';
    } else {
        console.log('User is not authenticated, redirecting to login page...');
        window.location.href = 'login.html';
    }
}

// Initialize contact link handling
function initializeContactLinkHandler() {
    // Find all contact links (both in navigation and call-to-action)
    const contactLinks = document.querySelectorAll('a[href="contact.html"]');
    
    contactLinks.forEach(link => {
        link.addEventListener('click', handleContactClick);
        console.log('Contact link handler attached');
    });
    
    // Also handle any dynamically created contact links
    document.addEventListener('click', function(event) {
        if (event.target.matches('a[href="contact.html"]') || 
            event.target.closest('a[href="contact.html"]')) {
            handleContactClick(event);
        }
    });
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing contact link authentication handler...');
    initializeContactLinkHandler();
});

// Export functions for external use if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        checkAuthStatus,
        handleContactClick,
        initializeContactLinkHandler
    };
}