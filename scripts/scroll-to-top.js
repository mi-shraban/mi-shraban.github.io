const ScrollToTopController = (() => {
    // --- Configuration ---
    const CONFIG = {
        buttonId: 'scrollToTopBtn',
        showOnPx: 300
    };

    // --- DOM Elements ---
    const elements = {};

    // --- Private Methods ---
    const cacheDOMElements = () => {
        elements.button = document.getElementById(CONFIG.buttonId);
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // --- Event Handlers ---
    const handleScroll = () => {
        if (window.scrollY > CONFIG.showOnPx) {
            elements.button.style.display = 'block';
        } else {
            elements.button.style.display = 'none';
        }
    };

    // --- Initialization ---
    const initEventListeners = () => {
        window.addEventListener('scroll', handleScroll);
        elements.button.addEventListener('click', scrollToTop);
    };

    const init = () => {
        cacheDOMElements();
        initEventListeners();
    };

    return {
        init
    };
})();

document.addEventListener('DOMContentLoaded', ScrollToTopController.init);