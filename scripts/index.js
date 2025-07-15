const PageController = (() => {
    // --- Configuration ---
    const CONFIG = {
        sidebarButtonSelector: '.sidebar nav .button',
        mainContentSelector: '.main-content',
        sectionSelector: '.section',
        hamburgerId: 'hamburger-menu',
        accordionId: 'accordion-menu',
        initialSection: 'aboutme',
        sections: [
            { id: 'aboutme', file: 'aboutme.html' },
            { id: 'education', file: 'education.html' },
            { id: 'projects', file: 'projects.html' },
            { id: 'skills', file: 'skills.html' },
            { id: 'research', file: 'research.html' },
            { id: 'experience', file: 'experience.html' }
        ]
    };

    // --- State ---
    const state = {
        lastClickedSection: CONFIG.initialSection,
        loadedContent: {}
    };

    // --- DOM Elements ---
    const elements = {};

    // --- Private Methods ---

    const cacheDOMElements = () => {
        elements.sidebarButtons = document.querySelectorAll(CONFIG.sidebarButtonSelector);
        elements.mainContent = document.querySelector(CONFIG.mainContentSelector);
        elements.sections = document.querySelectorAll(CONFIG.sectionSelector);
        elements.hamburgerMenu = document.getElementById(CONFIG.hamburgerId);
        elements.accordionMenu = document.getElementById(CONFIG.accordionId);
    };

    const loadContent = async (sectionId, fileName) => {
        try {
            const response = await fetch(fileName);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const content = await response.text();
            state.loadedContent[sectionId] = content;
            const sectionElement = document.getElementById(sectionId);
            if (sectionElement) sectionElement.innerHTML = content;
        } catch (error) {
            console.error(`Error loading ${fileName}:`, error);
            const sectionElement = document.getElementById(sectionId);
            if(sectionElement) sectionElement.innerHTML = `<p>Error loading content for ${sectionId}</p>`;
        }
    };

    const updateActiveButton = (activeSectionId) => {
        elements.sidebarButtons.forEach(button => {
            button.classList.toggle('button_active', button.getAttribute('href') === '#' + activeSectionId);
        });
    };

    const scrollToSection = (sectionId) => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
            state.lastClickedSection = sectionId;
            updateActiveButton(sectionId);
        }
    };

    // --- Event Handlers ---

    const handleScroll = () => {
        let currentSection = state.lastClickedSection;
        elements.sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= 100 && rect.bottom > 100) {
                currentSection = section.id;
            }
        });
        state.lastClickedSection = currentSection;
        updateActiveButton(currentSection);
    };

    const handleSectionHover = (event) => {
        const section = event.target.closest(CONFIG.sectionSelector);
        if (section) {
            updateActiveButton(section.id);
        }
    };

    const handleSectionLeave = () => {
        updateActiveButton(state.lastClickedSection);
    };

    const handleNavClick = (event) => {
        event.preventDefault();
        const sectionId = event.currentTarget.getAttribute('href').substring(1);
        scrollToSection(sectionId);
    };

    const handleHamburgerClick = () => {
        elements.accordionMenu.classList.toggle('active');
    };

    // --- Initialization ---

    const initEventListeners = () => {
        window.addEventListener('scroll', handleScroll);

        if (elements.mainContent) {
            elements.mainContent.addEventListener('mouseover', handleSectionHover);
            elements.mainContent.addEventListener('mouseleave', handleSectionLeave);
        }

        elements.sidebarButtons.forEach(button => {
            button.addEventListener('click', handleNavClick);
        });

        if (elements.hamburgerMenu && elements.accordionMenu) {
            elements.hamburgerMenu.addEventListener('click', handleHamburgerClick);
        }
    };

    const init = async () => {
        cacheDOMElements();
        initEventListeners();

        // Load initial section first for immediate content
        await loadContent(CONFIG.initialSection, 'aboutme.html');
        updateActiveButton(CONFIG.initialSection);

        // Load other sections in the background
        CONFIG.sections
            .filter(section => section.id !== CONFIG.initialSection)
            .forEach(section => loadContent(section.id, section.file));
    };

    return {
        init
    };
})();

document.addEventListener('DOMContentLoaded', PageController.init);