// =====================
// Google Analytics Configuration & Event Tracking
// =====================
// Your actual Google Analytics Measurement ID
const GA_MEASUREMENT_ID = 'G-D9ZV8TZTZ5';

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

    // Track theme toggle (without localStorage)
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
    },

    // Track time on page
    trackTimeOnPage: () => {
        const startTime = Date.now();
        
        // Track time when user leaves
        window.addEventListener('beforeunload', () => {
            const timeSpent = Math.round((Date.now() - startTime) / 1000);
            if (window.gtag && timeSpent > 5) {
                gtag('event', 'page_time', {
                    'time_seconds': timeSpent,
                    'event_category': 'Engagement',
                    'event_label': `${timeSpent}s on page`
                });
            }
        });

        // Also track time every 30 seconds for active users
        setInterval(() => {
            const timeSpent = Math.round((Date.now() - startTime) / 1000);
            if (window.gtag && timeSpent % 30 === 0 && timeSpent > 0) {
                gtag('event', 'time_milestone', {
                    'time_seconds': timeSpent,
                    'event_category': 'Engagement',
                    'event_label': `${timeSpent}s active`
                });
            }
        }, 30000);
    },

    // Track chatbot open
    trackChatOpen: () => {
        let status = 'not sent';
        if (window.gtag) {
            gtag('event', 'chat_open', {
                'event_category': 'Chatbot',
                'event_label': 'Chatbot Opened'
            });
            status = 'sent';
        }
        console.log('Analytics: Chatbot opened | Status:', status, '| Data:', {event: 'chat_open'});
        return status;
    },

    // Track chatbot message/question sent
    trackChatMessage: (message) => {
        let status = 'not sent';
        if (window.gtag) {
            gtag('event', 'chat_message_sent', {
                'event_category': 'Chatbot',
                'event_label': 'Message Sent',
                'message': message
            });
            status = 'sent';
        }
        // Optionally: Save question to localStorage for your own review (not sent to Google)
        try {
            let msgs = JSON.parse(localStorage.getItem('chatbot_questions') || '[]');
            msgs.push({ message, time: new Date().toISOString() });
            localStorage.setItem('chatbot_questions', JSON.stringify(msgs));
        } catch (e) {}
        console.log('Analytics: Chatbot message sent | Status:', status, '| Data:', {event: 'chat_message_sent', message});
        return status;
    },
};

// =====================
// Integration Functions
// =====================

// Enhanced Navigation with Analytics
function enhanceNavigationWithAnalytics() {
    // Wait for elements to load
    setTimeout(() => {
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                const sectionName = link.textContent.trim();
                Analytics.trackNavigationClick(sectionName);
            });
        });
        
        // Track CTA buttons in hero section
        const ctaButtons = document.querySelectorAll('.cta-button');
        ctaButtons.forEach(button => {
            button.addEventListener('click', () => {
                const buttonText = button.textContent.trim();
                const destination = button.getAttribute('href');
                Analytics.trackCTAClick(buttonText, destination);
            });
        });
    }, 2000);
}

// Enhanced Theme Toggle with Analytics
function enhanceThemeToggleWithAnalytics() {
    setTimeout(() => {
        const themeToggle = document.getElementById('themeToggle');
        
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                setTimeout(() => {
                    const isDark = document.body.classList.contains('dark-mode');
                    Analytics.trackThemeToggle(isDark ? 'dark' : 'light');
                }, 100);
            });
        }
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
    }, 2000);
}

// Enhanced Contact Loading with Analytics
function enhanceContactWithAnalytics() {
    setTimeout(() => {
        const contactLinks = document.querySelectorAll('.contact-link');
        contactLinks.forEach(link => {
            link.addEventListener('click', () => {
                const href = link.getAttribute('href');
                const text = link.textContent.trim();
                let contactType = 'unknown';
                
                if (href.startsWith('mailto:')) {
                    contactType = 'email';
                } else if (href.startsWith('tel:')) {
                    contactType = 'phone';
                } else if (href.includes('linkedin')) {
                    contactType = 'linkedin';
                } else if (href.includes('github')) {
                    contactType = 'github';
                } else if (href.includes('twitter')) {
                    contactType = 'twitter';
                }
                
                Analytics.trackContactClick(contactType, text);
            });
        });
    }, 2000);
}

// Enhanced Modals with Analytics
function enhanceModalsWithAnalytics() {
    setTimeout(() => {
        // Education modal analytics
        const educationItems = document.querySelectorAll('[data-education-id]');
        educationItems.forEach(item => {
            item.addEventListener('click', () => {
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

        // Project card analytics
        const projectCards = document.querySelectorAll('.project-card');
        projectCards.forEach(card => {
            card.addEventListener('click', () => {
                const projectTitle = card.querySelector('h3');
                if (projectTitle) {
                    Analytics.trackProjectClick(projectTitle.textContent.trim(), 'General');
                }
            });
        });
    }, 3000);
}

// =====================
// Initialize Analytics
// =====================
function initializeAnalytics() {
    console.log('Initializing Portfolio Analytics...');
    
    // Start tracking
    Analytics.trackTimeOnPage();
    Analytics.trackScrollDepth();
    
    // Enhance existing functionality
    enhanceNavigationWithAnalytics();
    enhanceThemeToggleWithAnalytics();
    enhanceProjectFiltersWithAnalytics();
    enhanceContactWithAnalytics();
    enhanceModalsWithAnalytics();
    
    console.log('Portfolio Analytics initialized successfully!');
    
    // Send initialization event
    if (window.gtag) {
        gtag('event', 'analytics_initialized', {
            'event_category': 'System',
            'event_label': 'Analytics Ready'
        });
    }
}

// Wait for everything to load before initializing
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(initializeAnalytics, 1000);
    });
} else {
    setTimeout(initializeAnalytics, 1000);
}

// Make Analytics available globally
window.PortfolioAnalytics = Analytics;

// Debug function to test analytics
window.testAnalytics = function() {
    console.log('Testing Analytics...');
    Analytics.trackNavigationClick('Test Navigation');
    Analytics.trackProjectClick('Test Project', 'Test Category');
    Analytics.trackContactClick('email', 'test@example.com');
    console.log('Test events sent!');
};