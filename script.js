// =====================
// Theme Toggle
// =====================
function loadTheme() {
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

// =====================
// Animated Role Text (from JSON)
// =====================
function animateRoleText(roles) {
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
// Particles (improved)
// =====================
function loadParticles() {
    const particles = document.getElementById('particles');
    particles.innerHTML = '';
    for (let i = 0; i < 25; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.width = p.style.height = `${Math.random() * 40 + 20}px`;
        p.style.left = `${Math.random() * 100}%`;
        p.style.top = `${Math.random() * 100}%`;
        p.style.background = 'rgba(59,130,246,0.08)';
        p.style.animationDuration = `${Math.random() * 4 + 4}s`;
        p.style.animationDelay = `${Math.random() * 2}s`;
        particles.appendChild(p);
    }
}

// =====================
// Navbar Active State
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
// Hero Section (with animated roles)
// =====================
function loadHero(main) {
    const hero = document.getElementById('home');
    hero.innerHTML = `
        <div class="hero-content">
            <div class="hero-image">
                <img src="${main.img}" alt="${main.name}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />
            </div>
            <div class="hero-text">
                <h1>${main.name}</h1>
                <div class="subtitle"><span id="animatedRole"></span></div>
                <div class="education">${main.education}</div>
                <p>${main.bio}</p>
            </div>
        </div>
    `;
    if (main.roles && main.roles.length > 0) {
        animateRoleText(main.roles);
    }
}

// =====================
// Education Section
// =====================
function loadEducation(education) {
    const section = document.getElementById('education');
    section.innerHTML = `<h2 data-aos="fade-up">Education</h2><div class="timeline"></div>`;
    const timeline = section.querySelector('.timeline');
    education.forEach((item, i) => {
        timeline.innerHTML += `
        <div class="timeline-item ${i%2===0?'left':'right'}" data-aos="${i%2===0?'fade-right':'fade-left'}">
            <div class="timeline-content">
                <div class="timeline-icon"><i class="${item.icon}"></i></div>
                <div class="timeline-date">${item.from} - ${item.to}</div>
                <div class="timeline-title">${item.title}</div>
                <div class="timeline-company">${item.location}</div>
                <div class="timeline-description">${item.description}</div>
                <div class="timeline-achievements"><ul>${item.achievements.map(a=>`<li>${a}</li>`).join('')}</ul></div>
                <div class="timeline-skills">${item.skills.map(s=>`<span class="skill-tag">${s}</span>`).join('')}</div>
            </div>
        </div>`;
    });
    // Add hover effect
    section.querySelectorAll('.timeline-content').forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// =====================
// Experience Section
// =====================
function loadExperience(experience) {
    const section = document.getElementById('experience');
    section.innerHTML = `<h2 data-aos="fade-up">Professional Experience</h2><div class="timeline"></div>`;
    const timeline = section.querySelector('.timeline');
    experience.forEach((item, i) => {
        timeline.innerHTML += `
        <div class="timeline-item ${i%2===0?'right':'left'}" data-aos="${i%2===0?'fade-left':'fade-right'}">
            <div class="timeline-content">
                <div class="timeline-icon"><i class="${item.icon}"></i></div>
                <div class="timeline-date">${item.from} - ${item.to}</div>
                <div class="timeline-title">${item.title}</div>
                <div class="timeline-company">${item.company}</div>
                <div class="timeline-description">${item.description}</div>
                <div class="timeline-achievements"><ul>${item.achievements.map(a=>`<li>${a}</li>`).join('')}</ul></div>
                <div class="timeline-skills">${item.skills.map(s=>`<span class="skill-tag">${s}</span>`).join('')}</div>
            </div>
        </div>`;
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
    // Project modal with full details
    const projectModal = document.getElementById('projectModal');
    const projectDetails = document.getElementById('projectDetails');
    projectModal.querySelector('.close').onclick = () => projectModal.style.display = 'none';
    window.onclick = e => {
        if (e.target === projectModal) projectModal.style.display = 'none';
        if (e.target === skillModal) skillModal.style.display = 'none';
    };
    function showProjectModal(project) {
        projectDetails.innerHTML = `
            <h2>${project.title}</h2>
            <div class="project-meta">
                <div class="meta-item"><h4>Category</h4>${project.category}</div>
                <div class="meta-item"><h4>Technologies</h4>${project.technologies.join(', ')}</div>
            </div>
            <p>${project.fullDescription}</p>
            <ul>${project.features.map(f => `<li>${f}</li>`).join('')}</ul>
            <div style="margin:1rem 0;">
                ${project.demoVideo ? `<a href="${project.demoVideo}" target="_blank" style="margin-right:1rem;color:#3b82f6;">Demo Video</a>` : ''}
                ${project.documentation ? `<a href="${project.documentation}" target="_blank" style="margin-right:1rem;color:#3b82f6;">Documentation</a>` : ''}
                ${project.githubLink ? `<a href="${project.githubLink}" target="_blank" style="color:#3b82f6;">GitHub</a>` : ''}
            </div>
            <h4>Team Members</h4>
            <div class="team-members">
                ${project.teamMembers.map(m => `<div class="team-member"><strong>${m.name}</strong><br>${m.role}<br><a href="mailto:${m.contact}" style="color:#3b82f6;">${m.contact}</a></div>`).join('')}
            </div>
        `;
        projectModal.style.display = 'block';
    }
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
// Modals (shared)
// =====================
function loadModals() {
    // Already handled in loadSkills and loadProjects
}

// =====================
// Main Loader Function (fetches JSON and loads sections)
// =====================
async function loadPortfolio() {
    const data = await fetch('data/portfolio.json').then(r => r.json());
    loadHero(data.main);
    loadEducation(data.education);
    loadExperience(data.experience);
    loadSkills(data.skills);
    loadProjects(data.projects);
    loadContact(data.contact);
    loadModals();
}

// =====================
// Initialize Everything
// =====================
document.addEventListener('DOMContentLoaded', function() {
    loadTheme();
    loadParticles();
    loadNavbar();
    loadPortfolio();
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});
