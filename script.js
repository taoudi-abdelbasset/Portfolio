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
    const body = document.body;
    const themeIcon = themeToggle.querySelector('i');
    const currentTheme = localStorage.getItem('theme') || 'light';
    if (currentTheme === 'dark') {
        body.classList.add('dark-mode');
        themeIcon.classList.replace('fa-moon', 'fa-sun');
    }
    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        if (body.classList.contains('dark-mode')) {
            themeIcon.classList.replace('fa-moon', 'fa-sun');
            localStorage.setItem('theme', 'dark');
        } else {
            themeIcon.classList.replace('fa-sun', 'fa-moon');
            localStorage.setItem('theme', 'light');
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

    console.log('Hero section loaded:', main.roles);
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
    section.innerHTML = `<h2>Skills & Technologies</h2><div class="skills-grid"></div>`;
    const grid = section.querySelector('.skills-grid');
    skills.forEach(skill => {
        grid.innerHTML += `
        <div class="skill-card" data-skill="${skill.id}" data-aos="fade-up">
            <i class="${skill.icon}"></i>
            <h3>${skill.title}</h3>
            <p>${skill.description}</p>
            <div class="tech-tags">${skill.techTags.map(t=>`<span class="tech-tag">${t}</span>`).join('')}</div>
        </div>`;
    });
    
    // Modal for certificates
    const skillModal = document.getElementById('skillModal');
    const skillDetails = document.getElementById('skillDetails');
    skillModal.querySelector('.close').onclick = () => skillModal.style.display = 'none';
    section.querySelectorAll('.skill-card').forEach(card => {
        card.addEventListener('click', () => {
            const skill = skills.find(s => s.id === card.getAttribute('data-skill'));
            skillDetails.innerHTML = `<h2>Certificates</h2><div class="certificates-grid">${skill.certificates && skill.certificates.length ? skill.certificates.map(c => `<div class="certificate-item"><div><strong>${c.name}</strong></div><div>${c.issuer}</div><a href="${c.link}" target="_blank">View Certificate</a></div>`).join('') : '<div>No certificates available.</div>'}</div>`;
            skillModal.style.display = 'block';
        });
    });
}

// =====================
// Projects Section
// =====================
function loadProjects(projects) {
    const projectsGrid = document.getElementById('projectsGrid');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectSearch = document.getElementById('projectSearch');
    let currentFilter = 'all';
    
    function renderProjects() {
        const search = projectSearch.value.toLowerCase();
        projectsGrid.innerHTML = '';
        let filtered = projects.filter(p =>
            (currentFilter === 'all' || p.category === currentFilter) &&
            (p.title.toLowerCase().includes(search) || p.description.toLowerCase().includes(search) || p.technologies.join(' ').toLowerCase().includes(search))
        );
        if (filtered.length === 0) {
            projectsGrid.innerHTML = '<div style="text-align:center;color:#888;">No projects found.</div>';
            return;
        }
        filtered.slice(0, 3).forEach(project => {
            const card = document.createElement('div');
            card.className = 'project-card';
            card.innerHTML = `
                <div class="project-image"><i class="${project.image}"></i></div>
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
    }
    
    renderProjects();
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter');
            renderProjects();
        });
    });
    projectSearch.addEventListener('input', renderProjects);
}

// =====================
// Contact Section
// =====================
function loadContact(contacts) {
    const section = document.getElementById('contact');
    section.innerHTML = `<div class="contact-simple"><h2>Let's Collaborate</h2><p>Ready to work together? Get in touch!</p><div class="contact-links"></div></div>`;
    const links = section.querySelector('.contact-links');
    contacts.forEach(link => {
        links.innerHTML += `<a href="${link.link}" class="contact-link" target="_blank"><i class="${link.icon}"></i><span>${link.label}</span></a>`;
    });
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
}

function showProjectModal(project) {
    const modal = document.getElementById('projectModal');
    const details = document.getElementById('projectDetails');
    
    details.innerHTML = `
        <div class="project-modal-header">
            <div class="project-icon"><i class="${project.image}"></i></div>
            <div class="project-title-section">
                <h2>${project.title}</h2>
                <span class="project-category">${project.category}</span>
            </div>
        </div>
        
        <div class="project-modal-body">
            ${project.demoVideo ? `
            <div class="demo-section">
                <h4>Demo Video</h4>
                <video controls width="100%" style="max-height: 300px;">
                    <source src="${project.demoVideo}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
            </div>` : ''}
            
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
}

// =====================
// Run main loader
// =====================
loadPortfolio();