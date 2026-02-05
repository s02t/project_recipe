// Theme Management for Light/Dark Mode

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
});

function initializeTheme() {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme, false);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme, true);
}

function setTheme(theme, animate = true) {
    // Add transition class for smooth theme change
    if (animate) {
        document.documentElement.style.transition = 'background 0.3s ease, color 0.3s ease';
        setTimeout(() => {
            document.documentElement.style.transition = '';
        }, 300);
    }
    
    // Set theme attribute
    document.documentElement.setAttribute('data-theme', theme);
    
    // Update icon
    const icon = document.getElementById('themeIcon');
    if (icon) {
        if (theme === 'dark') {
            icon.className = 'bi bi-sun-fill';
            animateIcon(icon);
        } else {
            icon.className = 'bi bi-moon-stars-fill';
            animateIcon(icon);
        }
    }
    
    // Save preference
    localStorage.setItem('theme', theme);
}

function animateIcon(icon) {
    icon.style.animation = 'none';
    setTimeout(() => {
        icon.style.animation = 'iconSpin 0.5s ease';
    }, 10);
}

// Add icon spin animation
const style = document.createElement('style');
style.textContent = `
    @keyframes iconSpin {
        from { transform: rotate(0deg) scale(1); }
        50% { transform: rotate(180deg) scale(1.2); }
        to { transform: rotate(360deg) scale(1); }
    }
`;
document.head.appendChild(style);

// Make toggleTheme globally available
window.toggleTheme = toggleTheme;
