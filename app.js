/**
 * LLMesh Documentation App Router (Vanilla JS)
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // DOM Elements
    const contentArea = document.getElementById('content-area');
    const loadingIndicator = document.getElementById('loading-indicator');
    const sidebar = document.getElementById('app-sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const searchInput = document.getElementById('search-input');
    const navLinks = document.querySelectorAll('.nav-link');

    // Default route
    const defaultRoute = 'introduction';

    // Route config mappings (hash -> file name under content/)
    const routes = {
        'introduction': 'introduction.md',
        'installation': 'installation.md',
        'text-generation': 'text-generation.md',
        'memory': 'memory.md',
        'structured-outputs': 'structured-outputs.md',
        'agents': 'agents.md',
        'observability': 'observability.md',
        'events': 'events.md',
        'rag': 'rag.md',
        'laravel': 'laravel.md'
    };

    // Initialize Markdown Parser Options
    if (typeof marked !== 'undefined') {
        marked.setOptions({
            gfm: true,
            breaks: true,
            headerIds: true,
            mangle: false
        });
    }

    /**
     * Show or hide loading indicator
     */
    function toggleLoader(show) {
        loadingIndicator.style.display = show ? 'block' : 'none';
        contentArea.style.opacity = show ? '0.4' : '1';
    }

    /**
     * Load markdown file, parse and render it
     */
    async function loadPage(routeName) {
        toggleLoader(true);
        const fileName = routes[routeName] || routes[defaultRoute];
        const contentPath = `content/${fileName}`;

        try {
            const response = await fetch(contentPath);
            if (!response.ok) {
                throw new Error(`Failed to load page: ${response.statusText}`);
            }
            const markdownText = await response.text();
            
            // Parse Markdown to HTML
            if (typeof marked !== 'undefined') {
                contentArea.innerHTML = marked.parse(markdownText);
            } else {
                contentArea.innerHTML = `<p>${markdownText}</p>`;
            }

            // Wrap code blocks in a copyable wrapper and insert Copy button
            enhanceCodeBlocks();

            // Run PrismJS highlight autoloader
            if (typeof Prism !== 'undefined') {
                Prism.highlightAll();
            }

            // Scroll content area back to top
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (error) {
            console.error(error);
            contentArea.innerHTML = `
                <div class="error-container" style="padding: 2rem; border: 1px solid #ef4444; border-radius: 8px; background-color: rgba(239, 68, 68, 0.05); color: #fca5a5;">
                    <h2 style="margin-top: 0; font-family: var(--font-heading);">❌ Page Load Error</h2>
                    <p style="margin-bottom: 0;">We encountered an error loading this chapter: <strong>${error.message}</strong>. Please ensure the documentation server is running and try again.</p>
                </div>
            `;
        } finally {
            toggleLoader(false);
        }
    }

    /**
     * Update active link in sidebar and title
     */
    function updateActiveNav(routeName) {
        navLinks.forEach(link => {
            const hash = link.getAttribute('href');
            if (hash === `#${routeName}`) {
                link.classList.add('active');
                
                // Update Browser Title
                const sectionName = link.textContent;
                document.title = `${sectionName} — LLMesh Docs`;
            } else {
                link.classList.remove('active');
            }
        });
    }

    /**
     * Handle routing
     */
    function handleRoute() {
        // Extract route from hash
        let hash = window.location.hash.slice(1);
        if (!hash || !routes[hash]) {
            hash = defaultRoute;
            window.location.hash = `#${defaultRoute}`;
            return;
        }

        // Close sidebar on mobile after navigating
        closeMobileSidebar();

        updateActiveNav(hash);
        loadPage(hash);
    }

    // Hash change listener
    window.addEventListener('hashchange', handleRoute);

    // Initial Routing
    handleRoute();

    // =========================================================================
    // Sidebar Mobile Toggles
    // =========================================================================
    
    function openMobileSidebar() {
        sidebar.classList.add('open');
        sidebarOverlay.classList.add('open');
    }

    function closeMobileSidebar() {
        sidebar.classList.remove('open');
        sidebarOverlay.classList.remove('open');
    }

    sidebarToggle.addEventListener('click', openMobileSidebar);
    sidebarOverlay.addEventListener('click', closeMobileSidebar);

    // =========================================================================
    // Live Search Filtering
    // =========================================================================
    
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase().trim();
        const navSections = document.querySelectorAll('.nav-section');

        navSections.forEach(section => {
            let sectionHasMatch = false;
            const links = section.querySelectorAll('.nav-link');
            
            links.forEach(link => {
                const text = link.textContent.toLowerCase();
                if (text.includes(term)) {
                    link.style.display = 'block';
                    sectionHasMatch = true;
                } else {
                    link.style.display = 'none';
                }
            });

            // If no links match in this section, hide the header too
            const title = section.querySelector('.nav-section-title');
            if (term !== '' && !sectionHasMatch) {
                if (title) title.style.display = 'none';
            } else {
                if (title) title.style.display = 'block';
            }
        });
    });

    // =========================================================================
    // Code Blocks Enhancement (Copy to Clipboard)
    // =========================================================================
    
    function enhanceCodeBlocks() {
        const preElements = contentArea.querySelectorAll('pre');
        
        preElements.forEach(pre => {
            // Check if already enhanced
            if (pre.parentElement.classList.contains('code-wrapper')) {
                return;
            }

            // Create wrapper
            const wrapper = document.createElement('div');
            wrapper.className = 'code-wrapper';
            
            // Insert wrapper before pre
            pre.parentNode.insertBefore(wrapper, pre);
            
            // Move pre inside wrapper
            wrapper.appendChild(pre);

            // Create Copy Button
            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-btn';
            copyBtn.textContent = 'Copy';
            wrapper.appendChild(copyBtn);

            // Copy Click Event
            copyBtn.addEventListener('click', async () => {
                const code = pre.querySelector('code');
                const textToCopy = code ? code.innerText : pre.innerText;

                try {
                    await navigator.clipboard.writeText(textToCopy);
                    copyBtn.textContent = 'Copied!';
                    copyBtn.classList.add('copied');
                    
                    setTimeout(() => {
                        copyBtn.textContent = 'Copy';
                        copyBtn.classList.remove('copied');
                    }, 2000);
                } catch (err) {
                    console.error('Failed to copy text: ', err);
                }
            });
        });
    }
});
