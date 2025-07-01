function animateRoleText(roles) {
    if (!roles || roles.length === 0) {
        console.error('No roles provided for animation.');
        return;
    }
    
    const roleElement = document.getElementById('animatedRole');
    let currentIndex = 0;
    
    function typeWriter(text, callback) {
        roleElement.textContent = '';
        let i = 0;
        
        function type() {
            if (i < text.length) {
                roleElement.textContent += text.charAt(i);
                i++;
                setTimeout(type, 100);
            } else {
                setTimeout(callback, 2000);
            }
        }
        type();
    }
    
    function eraseText(callback) {
        const currentText = roleElement.textContent;
        let i = currentText.length;
        
        function erase() {
            if (i > 0) {
                roleElement.textContent = currentText.substring(0, i - 1);
                i--;
                setTimeout(erase, 50);
            } else {
                callback();
            }
        }
        erase();
    }
    
    function cycle() {
        typeWriter(roles[currentIndex], () => {
            eraseText(() => {
                currentIndex = (currentIndex + 1) % roles.length;
                setTimeout(cycle, 500);
            });
        });
    }
    
    cycle();
}

// =====================
// Main Loader Function
// =====================
async function loadPortfolio() {
    const data = await fetch('data/portfolio.json').then(r => r.json());
    
    loadTheme();
    loadParticles();
    loadNavbar();
    loadHero(data.main);
    loadEducation(data.education);
    loadExperience(data.experience);
    loadSkills(data.skills);
    loadProjects(data.projects);
    loadContact(data.contact);
    loadModals();
}

// =====================
// Theme & Utilities
// =====================
function loadTheme() {
    AOS.init({ duration: 1000, once: true, offset: 100 });

    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle.querySelector('i');
    const navbar = document.querySelector('.navbar');
    const currentTheme = localStorage.getItem('theme') || 'light';

    // Apply theme based on localStorage
    if (currentTheme === 'dark') {
        document.documentElement.classList.add('dark-mode');
        document.body.classList.add('dark-mode');
        themeIcon.classList.replace('fa-moon', 'fa-sun');
        navbar.classList.remove('navbar-light', 'bg-white');
        navbar.classList.add('navbar-dark', 'bg-dark');
    } else {
        document.documentElement.classList.remove('dark-mode');
        document.body.classList.remove('dark-mode');
        themeIcon.classList.replace('fa-sun', 'fa-moon');
        navbar.classList.remove('navbar-dark', 'bg-dark');
        navbar.classList.add('navbar-light', 'bg-white');
    }

    // Toggle theme on click
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        document.documentElement.classList.toggle('dark-mode');

        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');

        if (isDark) {
            themeIcon.classList.replace('fa-moon', 'fa-sun');
            navbar.classList.remove('navbar-light', 'bg-white');
            navbar.classList.add('navbar-dark', 'bg-dark');
        } else {
            themeIcon.classList.replace('fa-sun', 'fa-moon');
            navbar.classList.remove('navbar-dark', 'bg-dark');
            navbar.classList.add('navbar-light', 'bg-white');
        }
    });
}


function loadParticles() {
    const particles = document.getElementById('particles');
    
    for (let i = 0; i < 25; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.width = p.style.height = `${Math.random() * 40 + 20}px`;
        p.style.left = `${Math.random() * 100}%`;
        p.style.top = `${Math.random() * 100}%`;
        p.style.animationDuration = `${Math.random() * 4 + 4}s`;
        p.style.animationDelay = `${Math.random() * 2}s`;
        particles.appendChild(p);
    }
}

// =====================
// Navbar
// =====================
function loadNavbar() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 80;
            if (pageYOffset >= sectionTop) {
                current = section.getAttribute('id');
            }
        });
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').slice(1) === current) {
                link.classList.add('active');
            }
        });
    });
}

// =====================
// Hero Section
// =====================
function loadHero(main) {
    const hero = document.getElementById('home');
    hero.innerHTML = `
        <div class="hero-content">
            <div class="hero-image-container">
                <div class="hero-image">
                    <img src="${main.img}" alt="${main.name}" style="width:100%;height:100%;object-fit:cover;" />
                </div>
            </div>
            <div class="hero-text">
                <h1>${main.name}</h1>
                <div class="subtitle-container">
                    <div class="subtitle"><span id="animatedRole"></span></div>
                </div>
                <div class="education">${main.education}</div>
                <p>${main.bio}</p>
                <div class="hero-cta">
                    <a href="#projects" class="cta-button cta-primary">
                        <i class="fas fa-rocket"></i>
                        View My Work
                    </a>
                    <a href="#contact" class="cta-button cta-secondary">
                        <i class="fas fa-envelope"></i>
                        Get In Touch
                    </a>
                </div>
            </div>
        </div>
    `;

    // console.log('Hero section loaded:', main.roles);
    if (main.roles && main.roles.length > 0) {
        animateRoleText(main.roles);
    }
}

// =====================
// Education Section with Modal
// =====================
function loadEducation(education) {
    const section = document.getElementById('education');
    section.innerHTML = `<h2 data-aos="fade-up">Education</h2><div class="timeline"></div>`;
    const timeline = section.querySelector('.timeline');
    
    education.forEach((item, i) => {
        timeline.innerHTML += `
        <div class="timeline-item ${i%2===0?'left':'right'}" data-aos="${i%2===0?'fade-right':'fade-left'}" data-education-id="${i}">
            <div class="timeline-content">
                <div class="timeline-icon"><i class="${item.icon}"></i></div>
                <div class="timeline-date">${item.from} - ${item.to}</div>
                <div class="timeline-title">${item.title}</div>
                <div class="timeline-company">${item.location}</div>
                <div class="click-hint">Click for details</div>
            </div>
        </div>`;
    });

    // Add click events for education modal
    section.querySelectorAll('.timeline-item').forEach(item => {
        item.addEventListener('click', () => {
            const educationId = item.getAttribute('data-education-id');
            const educationData = education[educationId];
            showEducationModal(educationData);
        });
        
        // Hover effects
        item.addEventListener('mouseenter', function() {
            this.querySelector('.timeline-content').style.transform = 'translateY(-10px) scale(1.02)';
        });
        item.addEventListener('mouseleave', function() {
            this.querySelector('.timeline-content').style.transform = 'translateY(0) scale(1)';
        });
    });
}

// =====================
// Experience Section with Modal
// =====================
function loadExperience(experience) {
    const section = document.getElementById('experience');
    section.innerHTML = `<h2 data-aos="fade-up">Professional Experience</h2><div class="timeline"></div>`;
    const timeline = section.querySelector('.timeline');
    
    experience.forEach((item, i) => {
        const logoHtml = item.logo ? 
            `<img src="${item.logo}" alt="${item.company}" class="company-logo" />` : 
            `<i class="${item.icon || 'fas fa-briefcase'}"></i>`;
            
        timeline.innerHTML += `
        <div class="timeline-item ${i%2===0?'right':'left'}" data-aos="${i%2===0?'fade-left':'fade-right'}" data-experience-id="${i}">
            <div class="timeline-content">
                <div class="timeline-icon">${logoHtml}</div>
                <div class="timeline-date">${item.from} - ${item.to}</div>
                <div class="timeline-title">${item.title}</div>
                <div class="timeline-company">${item.company}</div>
                <div class="click-hint">Click for details</div>
            </div>
        </div>`;
    });

    // Add click events for experience modal
    section.querySelectorAll('.timeline-item').forEach(item => {
        item.addEventListener('click', () => {
            const experienceId = item.getAttribute('data-experience-id');
            const experienceData = experience[experienceId];
            showExperienceModal(experienceData);
        });
    });

    // Intersection Observer for animation
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateX(0)';
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
    
    section.querySelectorAll('.timeline-item').forEach(item => {
        observer.observe(item);
    });
}

// =====================
// Skills Section
// =====================
function loadSkills(skills) {
    const section = document.getElementById('skills');
    section.innerHTML = `<h2>Skills & Technologies</h2><div class="skills-grid"></div><div class="skills-controls" style="text-align:center;margin-top:1.5rem;"></div>`;
    const grid = section.querySelector('.skills-grid');
    const controls = section.querySelector('.skills-controls');
    function getIncrement() {
        return window.innerWidth <= 600 ? 4 : 8;
    }
    let maxShow = getIncrement();
    function renderSkills() {
        grid.innerHTML = '';
        let toShow = skills.slice(0, maxShow);
        toShow.forEach(skill => {
            grid.innerHTML += `
            <div class="skill-card" data-skill="${skill.id}" data-aos="fade-up">
                <i class="${skill.icon}"></i>
                <h3>${skill.title}</h3>
                <p>${skill.description}</p>
                <div class="tech-tags">${skill.techTags.map(t=>`<span class="tech-tag">${t}</span>`).join('')}</div>
            </div>`;
        });
        controls.innerHTML = '';
        if (skills.length > maxShow) {
            controls.innerHTML += `<button class="show-more-btn">Show More (+${getIncrement()})</button>`;
        }
        if (maxShow > getIncrement()) {
            controls.innerHTML += `<button class="show-less-btn">Show Less</button>`;
        }
        // Modal for certificates
        const skillModal = document.getElementById('skillModal');
        const skillDetails = document.getElementById('skillDetails');
        skillModal.querySelector('.close').onclick = () => skillModal.style.display = 'none';
        section.querySelectorAll('.skill-card').forEach(card => {
            card.addEventListener('click', () => {
                const skill = skills.find(s => s.id === card.getAttribute('data-skill'));
                skillDetails.innerHTML = `
                    <div class="modal-header">
                        <div class="modal-icon"><i class="${skill.icon}"></i></div>
                        <div class="modal-title-section">
                            <h2>${skill.title} Certificates</h2>
                        </div>
                    </div>
                    <div class="modal-body">
                        <div class="certificates-grid">
                            ${skill.certificates && skill.certificates.length ? skill.certificates.map(c => `
                                <div class="certificate-item">
                                    <div><strong>${c.name}</strong></div>
                                    <div>${c.issuer}</div>
                                    <a href="${c.link}" target="_blank">View Certificate</a>
                                </div>
                            `).join('') : '<div>No certificates available.</div>'}
                        </div>
                    </div>
                `;
                skillModal.style.display = 'block';
            });
        });
        // Button events
        if (controls.querySelector('.show-more-btn')) {
            controls.querySelector('.show-more-btn').onclick = () => {
                maxShow += getIncrement();
                renderSkills();
            };
        }
        if (controls.querySelector('.show-less-btn')) {
            controls.querySelector('.show-less-btn').onclick = () => {
                maxShow = getIncrement();
                renderSkills();
            };
        }
    }
    renderSkills();
    window.addEventListener('resize', () => {
        let newInc = getIncrement();
        if (maxShow > newInc && window.innerWidth <= 600) {
            maxShow = newInc;
            renderSkills();
        } else if (maxShow < newInc && window.innerWidth > 600) {
            maxShow = newInc;
            renderSkills();
        }
    });
}

// =====================
// Projects Section
// =====================
function loadProjects(projects) {
    const projectsGrid = document.getElementById('projectsGrid');
    // Dynamically create filter buttons based on project categories (multi-label support)
    let filterBtnsContainer = document.getElementById('projectsFilterBtns');
    if (!filterBtnsContainer) {
        filterBtnsContainer = document.createElement('div');
        filterBtnsContainer.id = 'projectsFilterBtns';
        filterBtnsContainer.className = 'filter-btns';
        projectsGrid.parentNode.insertBefore(filterBtnsContainer, projectsGrid);
    }
    // Collect all unique categories from all projects (multi-label)
    const categoriesSet = new Set();
    projects.forEach(p => {
        if (Array.isArray(p.categories)) {
            p.categories.forEach(cat => categoriesSet.add(cat));
        } else if (p.category) {
            categoriesSet.add(p.category);
        }
    });
    const categories = Array.from(categoriesSet);
    // Add 'all' as the first filter
    const allFilters = ['all', ...categories];
    filterBtnsContainer.innerHTML = '';
    allFilters.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn' + (cat === 'all' ? ' active' : '');
        btn.setAttribute('data-filter', cat);
        btn.textContent = cat === 'all' ? 'All Projects' : (cat.toUpperCase() + ' Project');
        filterBtnsContainer.appendChild(btn);
    });
    const filterBtns = filterBtnsContainer.querySelectorAll('.filter-btn');
    const projectSearch = document.getElementById('projectSearch');
    const controlsId = 'projects-controls';
    let controls = document.getElementById(controlsId);
    if (!controls) {
        controls = document.createElement('div');
        controls.id = controlsId;
        controls.style.textAlign = 'center';
        controls.style.marginTop = '1.5rem';
        projectsGrid.parentNode.appendChild(controls);
    }
    let currentFilter = 'all';
    function getIncrement() {
        return window.innerWidth <= 600 ? 4 : 8;
    }
    let maxShow = getIncrement();
    function renderProjects() {
        const search = projectSearch.value.toLowerCase();
        projectsGrid.innerHTML = '';
        let filtered = projects.filter(p => {
            // Multi-label filter logic
            let cats = Array.isArray(p.categories) ? p.categories : (p.category ? [p.category] : []);
            let matchCat = (currentFilter === 'all') || cats.includes(currentFilter);
            let matchSearch = p.title.toLowerCase().includes(search) || p.description.toLowerCase().includes(search) || p.technologies.join(' ').toLowerCase().includes(search);
            return matchCat && matchSearch;
        });
        let toShow = filtered.slice(0, maxShow);
        if (toShow.length === 0) {
            projectsGrid.innerHTML = '<div style="text-align:center;color:#888;">No projects found.</div>';
            controls.innerHTML = '';
            return;
        }
        toShow.forEach(project => {
            const card = document.createElement('div');
            card.className = 'project-card';
            // Top section: use imgBg if present and not empty, else icon
            let topSection = '';
            if (project.imgBg && project.imgBg.trim() !== '') {
                topSection = `<div class="project-image" style="background-image:url('${project.imgBg}');background-size:cover;background-position:center;"></div>`;
            } else {
                topSection = `<div class="project-image"><i class="${project.image}"></i></div>`;
            }
            card.innerHTML = `
                ${topSection}
                <div class="project-content">
                    <h3>${project.title}</h3>
                    <p>${project.description}</p>
                    <div class="project-tags">
                        ${project.technologies.map(t => `<span class="tag">${t}</span>`).join(' ')}
                    </div>
                </div>
            `;
            card.addEventListener('click', () => showProjectModal(project));
            projectsGrid.appendChild(card);
        });
        controls.innerHTML = '';
        if (filtered.length > maxShow) {
            controls.innerHTML += `<button class="show-more-btn">Show More (+${getIncrement()})</button>`;
        }
        if (maxShow > getIncrement()) {
            controls.innerHTML += `<button class="show-less-btn">Show Less</button>`;
        }
        if (controls.querySelector('.show-more-btn')) {
            controls.querySelector('.show-more-btn').onclick = () => {
                maxShow += getIncrement();
                renderProjects();
            };
        }
        if (controls.querySelector('.show-less-btn')) {
            controls.querySelector('.show-less-btn').onclick = () => {
                maxShow = getIncrement();
                renderProjects();
            };
        }
    }
    renderProjects();
    filterBtnsContainer.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtnsContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter');
            maxShow = getIncrement();
            renderProjects();
        });
    });
    projectSearch.addEventListener('input', () => {
        maxShow = getIncrement();
        renderProjects();
    });
    window.addEventListener('resize', () => {
        let newInc = getIncrement();
        if (maxShow > newInc && window.innerWidth <= 600) {
            maxShow = newInc;
            renderProjects();
        } else if (maxShow < newInc && window.innerWidth > 600) {
            maxShow = newInc;
            renderProjects();
        }
    });
}

// =====================
// Contact Section
// =====================
function loadContact(contacts) {
    const section = document.getElementById('contact');
    section.innerHTML = `<div class="contact-simple"><h2>Let's Collaborate</h2><p>Ready to work together? Get in touch!</p><div class="contact-links"></div></div>`;
    const links = section.querySelector('.contact-links');
    links.innerHTML = '';
    contacts.forEach(link => {
        // console.log('Contact section loaded:', link);
        let href = link.link || link.value;
        let label = link.label || link.value;
        // If it's an email or phone, ensure proper prefix
        if (link.type === 'email' && !href.startsWith('mailto:')) {
            href = 'mailto:' + link.value;
        } else if (link.type === 'phone' && !href.startsWith('tel:')) {
            href = 'tel:' + link.value;
        }
        // Open in new tab for web links only
        const isWeb = href.startsWith('http');
        const target = isWeb ? ' target="_blank" rel="noopener"' : '';
        links.innerHTML += `<a href="${href}" class="contact-link"${target}><i class="${link.icon}"></i><span>${label}</span></a>`;
    });
    // Analytics for contact links
    setTimeout(() => {
        section.querySelectorAll('.contact-link').forEach(link => {
            link.addEventListener('click', () => {
                const href = link.getAttribute('href');
                const text = link.textContent.trim();
                let contactType = 'unknown';
                if (href.startsWith('mailto:')) contactType = 'email';
                else if (href.startsWith('tel:')) contactType = 'phone';
                else if (href.includes('linkedin')) contactType = 'linkedin';
                else if (href.includes('github')) contactType = 'github';
                else if (href.includes('twitter')) contactType = 'twitter';
                if (window.PortfolioAnalytics) {
                    PortfolioAnalytics.trackContactClick && PortfolioAnalytics.trackContactClick(contactType, text);
                }
            });
        });
    }, 1000);
}

// =====================
// Chatbot Analytics Integration
// =====================

// Helper to track chat open and message sent
function setupChatbotAnalytics() {
    const chatToggle = document.getElementById('chatToggle');
    const sendBtn = document.getElementById('sendBtn');
    const chatInput = document.getElementById('chatInput');
    let chatOpened = false;

    if (chatToggle) {
        chatToggle.addEventListener('click', () => {
            if (!chatOpened) {
                chatOpened = true;
                if (window.PortfolioAnalytics) {
                    PortfolioAnalytics.trackChatOpen && PortfolioAnalytics.trackChatOpen();
                } else if (window.gtag) {
                    gtag('event', 'chat_open', {
                        'event_category': 'Chatbot',
                        'event_label': 'Chatbot Opened'
                    });
                }
            }
        });
    }

    if (sendBtn && chatInput) {
        sendBtn.addEventListener('click', () => {
            const msg = chatInput.value.trim();
            if (msg.length > 0) {
                if (window.PortfolioAnalytics) {
                    PortfolioAnalytics.trackChatMessage && PortfolioAnalytics.trackChatMessage(msg);
                } else if (window.gtag) {
                    gtag('event', 'chat_message_sent', {
                        'event_category': 'Chatbot',
                        'event_label': 'Message Sent',
                        'message': msg
                    });
                }
            }
        });
        // Also track Enter key
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const msg = chatInput.value.trim();
                if (msg.length > 0) {
                    if (window.PortfolioAnalytics) {
                        PortfolioAnalytics.trackChatMessage && PortfolioAnalytics.trackChatMessage(msg);
                    } else if (window.gtag) {
                        gtag('event', 'chat_message_sent', {
                            'event_category': 'Chatbot',
                            'event_label': 'Message Sent',
                            'message': msg
                        });
                    }
                }
            }
        });
    }
}

/**
 * Sends a simple hello world event to Google Analytics.
 * @returns {boolean} true if sent, false if not
 */
window.sendHelloWorldEvent = function() {
    if (window.gtag) {
        gtag('event', 'hello_world', {
            message: 'hello world!',
            datetime: new Date().toString()
        });
        return true;
    }
    return false;
}

// =====================
// Modal Functions
// =====================
function loadModals() {
    // Close modals when clicking outside
    window.onclick = e => {
        const modals = ['projectModal', 'skillModal', 'educationModal', 'experienceModal'];
        modals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (e.target === modal) modal.style.display = 'none';
        });
    };
    // Add close (X) button functionality for all modals
    const modalIds = ['projectModal', 'skillModal', 'educationModal', 'experienceModal'];
    modalIds.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal) {
            const closeBtn = modal.querySelector('.close');
            if (closeBtn) {
                closeBtn.onclick = () => { modal.style.display = 'none'; };
            }
        }
    });
}

function showEducationModal(education) {
    const modal = document.getElementById('educationModal');
    const details = document.getElementById('educationDetails');
    
    details.innerHTML = `
        <div class="modal-header">
            <div class="modal-icon"><i class="${education.icon}"></i></div>
            <div class="modal-title-section">
                <h2>${education.title}</h2>
                <h3>${education.location}</h3>
                <div class="modal-date">${education.from} - ${education.to}</div>
            </div>
        </div>
        <div class="modal-body">
            <div class="description-section">
                <h4>Description</h4>
                <p>${education.description}</p>
            </div>
            ${education.achievements && education.achievements.length ? `
            <div class="achievements-section">
                <h4>Achievements</h4>
                <ul>${education.achievements.map(a => `<li>${a}</li>`).join('')}</ul>
            </div>` : ''}
            ${education.skills && education.skills.length ? `
            <div class="skills-section">
                <h4>Skills Gained</h4>
                <div class="skill-tags">${education.skills.map(s => `<span class="skill-tag">${s}</span>`).join('')}</div>
            </div>` : ''}
        </div>
    `;
    
    modal.style.display = 'block';
    // Analytics
    if (window.PortfolioAnalytics) {
        PortfolioAnalytics.trackEducationClick && PortfolioAnalytics.trackEducationClick(education.title, education.location);
    }
}

function showExperienceModal(experience) {
    const modal = document.getElementById('experienceModal');
    const details = document.getElementById('experienceDetails');
    
    const logoHtml = experience.logo ? 
        `<img src="${experience.logo}" alt="${experience.company}" class="modal-logo" />` : 
        `<i class="${experience.icon || 'fas fa-briefcase'}"></i>`;
    
    details.innerHTML = `
        <div class="modal-header">
            <div class="modal-icon">${logoHtml}</div>
            <div class="modal-title-section">
                <h2>${experience.title}</h2>
                <h3>${experience.company}</h3>
                <div class="modal-date">${experience.from} - ${experience.to}</div>
            </div>
        </div>
        <div class="modal-body">
            <div class="description-section">
                <h4>Role Description</h4>
                <p>${experience.description}</p>
            </div>
            ${experience.achievements && experience.achievements.length ? `
            <div class="achievements-section">
                <h4>Key Achievements</h4>
                <ul>${experience.achievements.map(a => `<li>${a}</li>`).join('')}</ul>
            </div>` : ''}
            ${experience.skills && experience.skills.length ? `
            <div class="skills-section">
                <h4>Technologies Used</h4>
                <div class="skill-tags">${experience.skills.map(s => `<span class="skill-tag">${s}</span>`).join('')}</div>
            </div>` : ''}
        </div>
    `;
    
    modal.style.display = 'block';
    // Analytics
    if (window.PortfolioAnalytics) {
        PortfolioAnalytics.trackExperienceClick && PortfolioAnalytics.trackExperienceClick(experience.title, experience.company);
    }
}

function showProjectModal(project) {
    const modal = document.getElementById('projectModal');
    const details = document.getElementById('projectDetails');
    
    const renderVideo = (videoUrl) => {
        // Check if the video is from YouTube or Google Drive and create the appropriate iframe
        if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
            // YouTube video embedding
            const videoId = videoUrl.split('v=')[1] || videoUrl.split('/').pop();
            return `
                <div class="demo-section">
                    <h4>Demo Video</h4>
                    <iframe width="100%" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                </div>
            `;
        } else if (videoUrl.includes('drive.google.com')) {
            // Google Drive video embedding (public video only)
            const fileId = videoUrl.split('/d/')[1].split('/')[0];
            return `
                <div class="demo-section">
                    <h4>Demo Video</h4>
                    <iframe src="https://drive.google.com/file/d/${fileId}/preview" width="100%" height="315" allow="autoplay"></iframe>
                </div>
            `;
        } else {
            return ''; // If it's not a recognized video link, return nothing
        }
    };
    
    details.innerHTML = `
        <div class="modal-header">
            <div class="project-icon"><i class="${project.image}"></i></div>
            <div class="project-title-section">
                <h2>${project.title}</h2>
                <span class="project-category">${project.category}</span>
            </div>
        </div>
        
        <div class="modal-body">
            ${project.demoVideo ? renderVideo(project.demoVideo) : ''}
            
            <div class="description-section">
                <h4>Project Description</h4>
                <p>${project.fullDescription || project.description}</p>
            </div>
            
            ${project.features && project.features.length ? `
            <div class="features-section">
                <h4>Key Features</h4>
                <ul class="features-list">${project.features.map(f => `<li>${f}</li>`).join('')}</ul>
            </div>` : ''}
            
            <div class="tech-section">
                <h4>Technologies Used</h4>
                <div class="project-tech-tags">
                    ${project.technologies.map(t => `<span class="tech-tag">${t}</span>`).join('')}
                </div>
            </div>
            
            ${project.teamMembers && project.teamMembers.length ? `
            <div class="team-section">
                <h4>Team Members</h4>
                <div class="team-grid">
                    ${project.teamMembers.map(member => `
                        <div class="team-member">
                            <div class="member-avatar">
                                ${member.img ? 
                                    `<img src="${member.img}" alt="${member.name}" />` : 
                                    `<i class="fas fa-user"></i>`
                                }
                            </div>
                            <div class="member-info">
                                <strong>${member.name}</strong>
                                <div class="member-role">${member.role}</div>
                                <a href="mailto:${member.contact}" class="member-contact">${member.contact}</a>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>` : ''}
            
            <div class="project-links">
                ${project.githubLink ? `<a href="${project.githubLink}" target="_blank" class="project-link"><i class="fab fa-github"></i> GitHub</a>` : ''}
                ${project.documentation ? `<a href="${project.documentation}" target="_blank" class="project-link"><i class="fas fa-book"></i> Documentation</a>` : ''}
                ${project.demoVideo ? `<a href="${project.demoVideo}" target="_blank" class="project-link"><i class="fas fa-play"></i> Demo Video</a>` : ''}
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
    // Analytics
    if (window.PortfolioAnalytics) {
        PortfolioAnalytics.trackProjectClick && PortfolioAnalytics.trackProjectClick(project.title, project.category || 'General');
    }
}

// =====================
// Run main loader
// =====================
loadPortfolio();
setupChatbotAnalytics();