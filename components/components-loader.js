// components-loader.js - Debug Version 
class ComponentLoader {
    constructor() {
        this.components = {
            'navbar': 'components/navbar.html',
            'footer': 'components/footer.html', 
            'modal': 'components/modal.html'
        };
        this.debug = true;
    }

    async loadComponent(componentName, targetElementId) {
        try {
            if (this.debug) console.log(`Loading ${componentName} from ${this.components[componentName]}`);
            
            const response = await fetch(this.components[componentName]);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const html = await response.text();
            
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
            // Show error in the container for debugging
            const targetElement = document.getElementById(targetElementId);
            if (targetElement) {
                targetElement.innerHTML = `<div style="color: red; padding: 20px; border: 2px solid red;">
                    Error loading ${componentName}: ${error.message}
                </div>`;
            }
        }
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
        if (this.debug) console.log('Starting to load all components...');
        
        const loadPromises = Object.keys(this.components).map(component => {
            return this.loadComponent(component, `${component}-container`);
        });
        
        await Promise.all(loadPromises);
        
        if (this.debug) console.log('All components loaded successfully');
        
        // Initialize any page-specific functionality
        if (typeof initPageSpecific === 'function') {
            initPageSpecific();
        }
    }
}

// Initialize and load components when DOM is ready
document.addEventListener('DOMContentLoaded', async function() {
    if (typeof ComponentLoader !== 'undefined') {
        const loader = new ComponentLoader();
        await loader.loadAllComponents();
    } else {
        console.error('ComponentLoader class not found!');
    }
});