document.addEventListener('DOMContentLoaded', function() {
    const loadedContent = {};

    // Variable to track the last clicked section
    let lastClickedSection = 'aboutme';

    // Array of sections to load
    const sections = [
        { id: 'aboutme', file: 'aboutme.html' },
        { id: 'education', file: 'education.html' },
        { id: 'projects', file: 'projects.html' },
        { id: 'skills', file: 'skills.html' },
        { id: 'research', file: 'research.html' },
        { id: 'experience', file: 'experience.html' }
    ];

    // Function to load content from external files
    async function loadContent(sectionId, fileName) {
        try {
            const response = await fetch(fileName);
            const content = await response.text();
            loadedContent[sectionId] = content;
            document.getElementById(sectionId).innerHTML = content;
        } catch (error) {
            console.error(`Error loading ${fileName}:`, error);
            document.getElementById(sectionId).innerHTML = `<p>Error loading content for ${sectionId}</p>`;
        }
    }

    // Function to update active button
    function updateActiveButton(activeSectionId) {
        const buttons = document.querySelectorAll('.sidebar nav .button');
        buttons.forEach(button => {
            button.classList.remove('button_active');
            if (button.getAttribute('href') === '#' + activeSectionId) {
                button.classList.add('button_active');
            }
        });
    }

    // Function to scroll to a specific section
    function scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            // Update the last clicked section when nav button is clicked
            lastClickedSection = sectionId;
            updateActiveButton(sectionId);
        }
    }

    // Function to handle scroll and update active button
    function handleScroll() {
        const sections = document.querySelectorAll('.section');
        let currentSection = 'aboutme';

        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top <= 100 && rect.bottom > 100) {
                currentSection = section.id;
            }
        });

        // Update last clicked section based on scroll position
        lastClickedSection = currentSection;
        updateActiveButton(currentSection);
    }

    function handleSectionHover(event) {
        const section = event.target.closest('.section');
        if (section) {
            updateActiveButton(section.id);
        }
    }

    // Function to handle mouse leave from sections
    function handleSectionLeave() {
        // Return to the last clicked section instead of scroll-based detection
        updateActiveButton(lastClickedSection);
    }

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);

    // Add mouseover and mouseleave event listeners to the main content area
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.addEventListener('mouseover', handleSectionHover);
        mainContent.addEventListener('mouseleave', handleSectionLeave);
    }

    // Add click listeners to nav buttons
    document.querySelectorAll('.sidebar nav .button').forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            const sectionId = button.getAttribute('href').substring(1);
            scrollToSection(sectionId);
        });
    });

    // Hamburger menu functionality
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const accordionMenu = document.getElementById('accordion-menu');

    if (hamburgerMenu && accordionMenu) {
        hamburgerMenu.addEventListener('click', function() {
            accordionMenu.classList.toggle('active');
        });
    }

    // Load all content when page loads
    async function initializePage() {
        // Load aboutme.html first
        await loadContent('aboutme', 'aboutme.html');
        updateActiveButton('aboutme');

        // Load other sections in the background
        const otherSections = sections.filter(section => section.id !== 'aboutme');
        otherSections.forEach(section => {
            loadContent(section.id, section.file);
        });
    }

    initializePage();
});
