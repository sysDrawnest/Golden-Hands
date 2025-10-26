// components/components-loader.js - Updated with Asset Path Handling
class ComponentLoader {
    constructor() {
        this.debug = true;
        this.basePath = this.detectBasePath();
        this.assetBasePath = this.detectAssetBasePath();
    }

    detectBasePath() {
        const currentPath = window.location.pathname;
        if (currentPath.includes('/pages/')) {
            return '../';
        } else {
            return './';
        }
    }

    detectAssetBasePath() {
        const currentPath = window.location.pathname;
        if (currentPath.includes('/pages/')) {
            return '../assets/';
        } else {
            return 'assets/';
        }
    }

    async loadComponent(componentName, targetElementId) {
        try {
            // Use the correct path based on current location
            let componentPath;
            if (this.basePath === '../') {
                componentPath = `../components/${componentName}.html`;
            } else {
                componentPath = `components/${componentName}.html`;
            }
            
            if (this.debug) console.log(`Loading ${componentName} from ${componentPath}`);
            
            const response = await fetch(componentPath);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            let html = await response.text();
            
            // Fix asset paths in the loaded HTML
            html = this.fixAssetPaths(html);
            
            if (this.debug) console.log(`Successfully loaded ${componentName}`, html.substring(0, 100) + '...');
            
            const targetElement = document.getElementById(targetElementId);
            if (!targetElement) {
                throw new Error(`Target element #${targetElementId} not found`);
            }
            
            targetElement.innerHTML = html;
            
            // Re-initialize icons and event listeners after loading
            this.initializeComponent(componentName);
            
        } catch (error) {
            console.error(`Error loading ${componentName}:`, error);
            const targetElement = document.getElementById(targetElementId);
            if (targetElement) {
                targetElement.innerHTML = `<div style="color: red; padding: 20px; border: 2px solid red;">
                    Error loading ${componentName}: ${error.message}
                    <br>Current path: ${window.location.pathname}
                    <br>Base path: ${this.basePath}
                    <br>Asset path: ${this.assetBasePath}
                </div>`;
            }
        }
    }

    fixAssetPaths(html) {
        // Fix various asset path patterns
        const fixes = [
            // Fix src="assets/" paths
            { pattern: /src="assets\//g, replacement: `src="${this.assetBasePath}` },
            // Fix href="assets/" paths  
            { pattern: /href="assets\//g, replacement: `href="${this.assetBasePath}` },
            // Fix background-image: url('assets/') paths
            { pattern: /url\(['"]?assets\//g, replacement: `url('${this.assetBasePath}` },
            // Fix src='assets/' paths
            { pattern: /src='assets\//g, replacement: `src='${this.assetBasePath}` },
        ];

        let fixedHtml = html;
        fixes.forEach(({ pattern, replacement }) => {
            fixedHtml = fixedHtml.replace(pattern, replacement);
        });

        if (this.debug && html !== fixedHtml) {
            console.log('Fixed asset paths in HTML');
        }

        return fixedHtml;
    }

    initializeComponent(componentName) {
        // Re-initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
            if (this.debug) console.log(`Lucide icons initialized for ${componentName}`);
        }

        // Initialize component-specific functionality
        switch(componentName) {
            case 'navbar':
                this.initializeNavbar();
                break;
            case 'modal':
                this.initializeModal();
                break;
        }
    }

    initializeNavbar() {
        // Re-attach navbar event listeners
        const searchToggle = document.getElementById('search-toggle');
        const loginToggle = document.getElementById('login-toggle');
        const registerToggle = document.getElementById('register-toggle');
        const modalClose = document.getElementById('modal-close');
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        const mobileMenuClose = document.getElementById('mobile-menu-close');

        if (searchToggle) {
            searchToggle.addEventListener('click', toggleSearch);
            if (this.debug) console.log('Search toggle event attached');
        }
        if (loginToggle) {
            loginToggle.addEventListener('click', () => toggleLoginModal(true));
            if (this.debug) console.log('Login toggle event attached');
        }
        if (registerToggle) {
            registerToggle.addEventListener('click', () => toggleLoginModal(true));
            if (this.debug) console.log('Register toggle event attached');
        }
        if (modalClose) {
            modalClose.addEventListener('click', () => toggleLoginModal(false));
            if (this.debug) console.log('Modal close event attached');
        }
        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', () => toggleMobileMenu(true));
            if (this.debug) console.log('Mobile menu toggle event attached');
        }
        if (mobileMenuClose) {
            mobileMenuClose.addEventListener('click', () => toggleMobileMenu(false));
            if (this.debug) console.log('Mobile menu close event attached');
        }
    }

    initializeModal() {
        // Re-attach modal event listeners
        const loginModal = document.getElementById('login-modal');
        if (loginModal) {
            loginModal.addEventListener('click', (e) => {
                if (e.target.id === 'login-modal') {
                    toggleLoginModal(false);
                }
            });
            if (this.debug) console.log('Modal backdrop event attached');
        }
    }

    async loadAllComponents() {
        if (this.debug) {
            console.log('Starting to load all components...');
            console.log('Base path detected:', this.basePath);
            console.log('Asset base path:', this.assetBasePath);
        }
        
        const loadPromises = [
            this.loadComponent('navbar', 'navbar-container'),
            this.loadComponent('footer', 'footer-container'),
            this.loadComponent('modal', 'modal-container')
        ];
        
        await Promise.all(loadPromises);
        
        if (this.debug) console.log('All components loaded successfully');
        
        // Initialize any page-specific functionality
        if (typeof initPageSpecific === 'function') {
            initPageSpecific();
        }
    }
}

// Global navigation functions (must be available before components load)
function toggleDropdown() {
    const dropdown = document.getElementById('services-dropdown');
    if (dropdown) dropdown.classList.toggle('active');
}

function toggleSearch() {
    const searchPanel = document.getElementById('search-panel');
    if (searchPanel) {
        searchPanel.classList.toggle('hidden');
        if (!searchPanel.classList.contains('hidden')) {
            const searchInput = document.getElementById('search-input');
            if (searchInput) searchInput.focus();
        }
    }
}

function toggleLoginModal(open) {
    const modal = document.getElementById('login-modal');
    if (modal) {
        const isOpen = (open !== undefined) ? open : !modal.classList.contains('hidden');
        modal.classList.toggle('hidden', !isOpen);
        document.body.classList.toggle('overflow-hidden', isOpen);
    }
}

function toggleMobileMenu(open) {
    const drawer = document.getElementById('mobile-menu-drawer');
    if (drawer) {
        const isOpen = (open !== undefined) ? open : !drawer.classList.contains('active');
        drawer.classList.toggle('active', isOpen);
        document.body.classList.toggle('overflow-hidden', isOpen);
    }
}

function toggleMobileServices() {
    const dropdown = document.getElementById('mobile-services-dropdown');
    const arrow = document.getElementById('mobile-services-arrow');
    
    if (dropdown && arrow) {
        dropdown.classList.toggle('active');
        arrow.classList.toggle('rotate-180');
    }
}

// Make functions globally available
window.toggleDropdown = toggleDropdown;
window.toggleSearch = toggleSearch;
window.toggleLoginModal = toggleLoginModal;
window.toggleMobileMenu = toggleMobileMenu;
window.toggleMobileServices = toggleMobileServices;

// Initialize and load components when DOM is ready
document.addEventListener('DOMContentLoaded', async function() {
    if (typeof ComponentLoader !== 'undefined') {
        const loader = new ComponentLoader();
        await loader.loadAllComponents();
    } else {
        console.error('ComponentLoader class not found!');
    }
});