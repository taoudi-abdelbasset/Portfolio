// =====================
// Google Analytics Configuration & Event Tracking
// =====================

// Replace 'GA_MEASUREMENT_ID' with your actual Google Analytics Measurement ID
// Get it from: https://analytics.google.com/analytics/web/
const GA_MEASUREMENT_ID = 'G-D9ZV8TZTZ5'; // Replace with your actual GA4 Measurement ID

// Load Google Analytics
function loadGoogleAnalytics() {
    // Load gtag script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);
    
    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, {
        page_title: 'Portfolio - Taoudi Abdelbasset',
        page_location: window.location.href
    });
    
    console.log('Google Analytics initialized with ID:', GA_MEASUREMENT_ID);
}

// Analytics Event Tracking Functions
const Analytics = {
    // Track contact link clicks
    trackContactClick: (contactType, contactValue) => {
        if (window.gtag) {
            gtag('event', 'contact_click', {
                'contact_type': contactType,
                'contact_value': contactValue,
                'event_category': 'Contact',
                'event_label': `${contactType}: ${contactValue}`
            });
        }
        console.log(`Analytics: Contact clicked - ${contactType}: ${contactValue}`);
    },

    // Track project interactions
    trackProjectClick: (projectTitle, projectCategory) => {
        if (window.gtag) {
            gtag('event', 'project_view', {
                'project_name': projectTitle,
                'project_category': projectCategory,
                'event_category': 'Projects',
                'event_label': projectTitle
            });
        }
        console.log(`Analytics: Project viewed - ${projectTitle} (${projectCategory})`);
    },

    // Track skill card clicks
    trackSkillClick: (skillTitle) => {
        if (window.gtag) {
            gtag('event', 'skill_view', {
                'skill_name': skillTitle,
                'event_category': 'Skills',
                'event_label': skillTitle
            });
        }
        console.log(`Analytics: Skill viewed - ${skillTitle}`);
    },

    // Track education modal opens
    trackEducationClick: (educationTitle, institution) => {
        if (window.gtag) {
            gtag('event', 'education_view', {
                'education_title': educationTitle,
                'institution': institution,
                'event_category': 'Education',
                'event_label': `${educationTitle} - ${institution}`
            });
        }
        console.log(`Analytics: Education viewed - ${educationTitle} at ${institution}`);
    },

    // Track experience modal opens
    trackExperienceClick: (jobTitle, company) => {
        if (window.gtag) {
            gtag('event', 'experience_view', {
                'job_title': jobTitle,
                'company': company,
                'event_category': 'Experience',
                'event_label': `${jobTitle} - ${company}`
            });
        }
        console.log(`Analytics: Experience viewed - ${jobTitle} at ${company}`);
    },

    // Track navigation clicks
    trackNavigationClick: (sectionName) => {
        if (window.gtag) {
            gtag('event', 'navigation_click', {
                'section_name': sectionName,
                'event_category': 'Navigation',
                'event_label': sectionName
            });
        }
        console.log(`Analytics: Navigation clicked - ${sectionName}`);
    },

    // Track CTA button clicks
    trackCTAClick: (buttonText, destination) => {
        if (window.gtag) {
            gtag('event', 'cta_click', {
                'button_text': buttonText,
                'destination': destination,
                'event_category': 'CTA',
                'event_label': buttonText
            });
        }
        console.log(`Analytics: CTA clicked - ${buttonText} -> ${destination}`);
    },

    // Track project filter usage
    trackProjectFilter: (filterType) => {
        if (window.gtag) {
            gtag('event', 'project_filter', {
                'filter_type': filterType,
                'event_category': 'Projects',
                'event_label': `Filter: ${filterType}`
            });
        }
        console.log(`Analytics: Project filter used - ${filterType}`);
    },

    // Track search usage
    trackSearch: (searchTerm, searchType) => {
        if (window.gtag) {
            gtag('event', 'search', {
                'search_term': searchTerm,
                'search_type': searchType,
                'event_category': 'Search',
                'event_label': searchTerm
            });
        }
        console.log(`Analytics: Search performed - ${searchTerm} (${searchType})`);
    },

    // Track theme toggle
    trackThemeToggle: (newTheme) => {
        if (window.gtag) {
            gtag('event', 'theme_toggle', {
                'theme': newTheme,
                'event_category': 'UI',
                'event_label': `Theme: ${newTheme}`
            });
        }
        console.log(`Analytics: Theme changed to ${newTheme}`);
    },

    // Track modal closes
    trackModalClose: (modalType, contentName) => {
        if (window.gtag) {
            gtag('event', 'modal_close', {
                'modal_type': modalType,
                'content_name': contentName,
                'event_category': 'Modals',
                'event_label': `${modalType}: ${contentName}`
            });
        }
        console.log(`Analytics: Modal closed - ${modalType}: ${contentName}`);
    },

    // Track page time
    trackTimeOnPage: () => {
        const startTime = Date.now();
        
        window.addEventListener('beforeunload', () => {
            const timeSpent = Math.round((Date.now() - startTime) / 1000);
            if (window.gtag && timeSpent > 5) { // Only track if user spent more than 5 seconds
                gtag('event', 'page_time', {
                    'time_seconds': timeSpent,
                    'event_category': 'Engagement',
                    'event_label': `${timeSpent}s on page`
                });
            }
        });
    },

    // Track scroll depth
    trackScrollDepth: () => {
        let maxScroll = 0;
        let scrollThresholds = [25, 50, 75, 90, 100];
        let trackedThresholds = [];

        window.addEventListener('scroll', () => {
            const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
            
            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
                
                scrollThresholds.forEach(threshold => {
                    if (scrollPercent >= threshold && !trackedThresholds.includes(threshold)) {
                        trackedThresholds.push(threshold);
                        if (window.gtag) {
                            gtag('event', 'scroll_depth', {
                                'scroll_percent': threshold,
                                'event_category': 'Engagement',
                                'event_label': `${threshold}% scrolled`
                            });
                        }
                        console.log(`Analytics: Scroll depth - ${threshold}%`);
                    }
                });
            }
        });
    }
};

// Enhanced Portfolio Functions with Analytics Integration
function enhancePortfolioWithAnalytics() {
    // Initialize Google Analytics
    loadGoogleAnalytics();
    
    // Start tracking page time and scroll depth
    Analytics.trackTimeOnPage();
    Analytics.trackScrollDepth();
    
    console.log('Portfolio Analytics Enhanced Successfully!');
}

// =====================
// Integration Functions - Add these to your existing functions
// =====================

// Enhanced Contact Loading with Analytics
function loadContactWithAnalytics(contacts) {
    const section = document.getElementById('contact');
    section.innerHTML = `<div class="contact-simple"><h2>Let's Collaborate</h2><p>Ready to work together? Get in touch!</p><div class="contact-links"></div></div>`;
    const links = section.querySelector('.contact-links');
    links.innerHTML = '';
    
    contacts.forEach(link => {
        let href = link.link || link.value;
        let label = link.label || link.value;
        let contactType = link.type || 'unknown';
        
        // If it's an email or phone, ensure proper prefix
        if (link.type === 'email' && !href.startsWith('mailto:')) {
            href = 'mailto:' + link.value;
        } else if (link.type === 'phone' && !href.startsWith('tel:')) {
            href = 'tel:' + link.value;
        }
        
        // Open in new tab for web links only
        const isWeb = href.startsWith('http');
        const target = isWeb ? ' target="_blank" rel="noopener"' : '';
        
        const contactElement = document.createElement('a');
        contactElement.href = href;
        contactElement.className = 'contact-link';
        if (target) contactElement.setAttribute('target', '_blank');
        if (target) contactElement.setAttribute('rel', 'noopener');
        contactElement.innerHTML = `<i class="${link.icon}"></i><span>${label}</span>`;
        
        // Add analytics tracking
        contactElement.addEventListener('click', () => {
            Analytics.trackContactClick(contactType, link.value || href);
        });
        
        links.appendChild(contactElement);
    });
}

// Enhanced Project Modal Function with Analytics
function showProjectModalWithAnalytics(project) {
    // Track project view
    Analytics.trackProjectClick(project.title, project.category || 'Uncategorized');
    
    const modal = document.getElementById('projectModal');
    const details = document.getElementById('projectDetails');
    
    // Your existing showProjectModal code here...
    // (keeping the same modal rendering logic)
    
    // Add analytics to project links
    setTimeout(() => {
        const projectLinks = modal.querySelectorAll('.project-link');
        projectLinks.forEach(link => {
            link.addEventListener('click', () => {
                const linkText = link.textContent.trim();
                Analytics.trackCTAClick(linkText, link.href);
            });
        });
    }, 100);
    
    modal.style.display = 'block';
}

// Enhanced Theme Toggle with Analytics
function enhanceThemeToggleWithAnalytics() {
    const themeToggle = document.getElementById('themeToggle');
    
    // Add analytics to existing theme toggle functionality
    const originalClickHandler = themeToggle.onclick;
    
    themeToggle.addEventListener('click', () => {
        setTimeout(() => {
            const isDark = document.body.classList.contains('dark-mode');
            Analytics.trackThemeToggle(isDark ? 'dark' : 'light');
        }, 50);
    });
}

// Enhanced Navigation with Analytics
function enhanceNavigationWithAnalytics() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const sectionName = link.textContent.trim();
            Analytics.trackNavigationClick(sectionName);
        });
    });
    
    // Track CTA buttons in hero section
    setTimeout(() => {
        const ctaButtons = document.querySelectorAll('.cta-button');
        ctaButtons.forEach(button => {
            button.addEventListener('click', () => {
                const buttonText = button.textContent.trim();
                const destination = button.getAttribute('href');
                Analytics.trackCTAClick(buttonText, destination);
            });
        });
    }, 1000);
}

// Enhanced Project Filters with Analytics
function enhanceProjectFiltersWithAnalytics() {
    setTimeout(() => {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                const filterType = button.getAttribute('data-filter') || button.textContent.trim();
                Analytics.trackProjectFilter(filterType);
            });
        });
        
        // Track project search
        const projectSearch = document.getElementById('projectSearch');
        if (projectSearch) {
            let searchTimeout;
            projectSearch.addEventListener('input', () => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    const searchTerm = projectSearch.value.trim();
                    if (searchTerm.length > 2) {
                        Analytics.trackSearch(searchTerm, 'projects');
                    }
                }, 1000);
            });
        }
    }, 1000);
}

// Function to integrate analytics into existing modals
function enhanceModalsWithAnalytics() {
    // Education modal analytics
    setTimeout(() => {
        const educationItems = document.querySelectorAll('[data-education-id]');
        educationItems.forEach(item => {
            item.addEventListener('click', () => {
                const educationId = item.getAttribute('data-education-id');
                const titleElement = item.querySelector('.timeline-title');
                const companyElement = item.querySelector('.timeline-company');
                
                if (titleElement && companyElement) {
                    Analytics.trackEducationClick(
                        titleElement.textContent.trim(),
                        companyElement.textContent.trim()
                    );
                }
            });
        });
        
        // Experience modal analytics
        const experienceItems = document.querySelectorAll('[data-experience-id]');
        experienceItems.forEach(item => {
            item.addEventListener('click', () => {
                const experienceId = item.getAttribute('data-experience-id');
                const titleElement = item.querySelector('.timeline-title');
                const companyElement = item.querySelector('.timeline-company');
                
                if (titleElement && companyElement) {
                    Analytics.trackExperienceClick(
                        titleElement.textContent.trim(),
                        companyElement.textContent.trim()
                    );
                }
            });
        });
        
        // Skill card analytics
        const skillCards = document.querySelectorAll('.skill-card');
        skillCards.forEach(card => {
            card.addEventListener('click', () => {
                const skillTitle = card.querySelector('h3');
                if (skillTitle) {
                    Analytics.trackSkillClick(skillTitle.textContent.trim());
                }
            });
        });
    }, 1500);
}

// =====================
// Initialize Enhanced Analytics
// =====================
function initializePortfolioAnalytics() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            enhancePortfolioWithAnalytics();
            enhanceNavigationWithAnalytics();
            enhanceThemeToggleWithAnalytics();
            enhanceProjectFiltersWithAnalytics();
            enhanceModalsWithAnalytics();
        });
    } else {
        enhancePortfolioWithAnalytics();
        enhanceNavigationWithAnalytics();
        enhanceThemeToggleWithAnalytics();
        enhanceProjectFiltersWithAnalytics();
        enhanceModalsWithAnalytics();
    }
}

// Auto-initialize when script loads
initializePortfolioAnalytics();

// Export Analytics object for manual tracking
window.PortfolioAnalytics = Analytics;