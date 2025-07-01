// Replace with your actual Google Analytics Measurement ID
const GA_MEASUREMENT_ID = 'G-D9ZV8TZTZ5';

// Load Google Analytics
function loadGoogleAnalytics() {
    // Only load if not already loaded
    if (window.gtag) {
        console.log('Google Analytics already loaded');
        return;
    }

    // Load gtag script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);
    
    // Initialize gtag after script loads
    script.onload = () => {
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', GA_MEASUREMENT_ID, {
            page_title: 'Portfolio - Taoudi Abdelbasset',
            page_location: window.location.href
        });
        
        console.log('Google Analytics initialized with ID:', GA_MEASUREMENT_ID);
    };
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
                'project_category': projectCategory || 'Uncategorized',
                'event_category': 'Projects',
                'event_label': projectTitle
            });
        }
        console.log(`Analytics: Project viewed - ${projectTitle} (${projectCategory || 'Uncategorized'})`);
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

    // Track scroll depth
    trackScrollDepth: () => {
        let maxScroll = 0;
        let scrollThresholds = [25, 50, 75, 90, 100];
        let trackedThresholds = [];

        const handleScroll = () => {
            const scrollPercent = Math.round(
                (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
            );
            
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
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
    }
};