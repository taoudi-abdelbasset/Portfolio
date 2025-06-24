let GEMINI_API_KEY = '';
let chatOpen = false;
let portfolioData = null;
let dataLoaded = false;

// Elements
const chatToggle = document.getElementById('chatToggle');
const chatModalOverlay = document.getElementById('chatModalOverlay');
const chatContainer = document.getElementById('chatContainer');
const chatCloseBtn = document.getElementById('chatCloseBtn');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const typingIndicator = document.getElementById('typingIndicator');
const apiKeyPrompt = document.getElementById('apiKeyPrompt');
const apiKeyInput = document.getElementById('apiKeyInput');
const loadingIndicator = document.getElementById('loadingIndicator');

// Local portfolio data URL
const PORTFOLIO_DATA_URL = 'data/portfolio.json';

// Function to fetch portfolio data from local file
async function fetchPortfolioData() {
    try {
        loadingIndicator.style.display = 'block';
        console.log('Fetching portfolio data from:', PORTFOLIO_DATA_URL);
        const response = await fetch(PORTFOLIO_DATA_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Portfolio data fetched successfully:', data);
        portfolioData = JSON.stringify(data, null, 2);
        dataLoaded = true;
        loadingIndicator.style.display = 'none';
        return true;
    } catch (error) {
        console.error('Error fetching portfolio data:', error);
        portfolioData = null;
        dataLoaded = false;
        loadingIndicator.style.display = 'none';
        addMessage('⚠️ Unable to load portfolio data. Please refresh the page to try again.', 'ai');
        return false;
    }
}

// Portfolio context function
function getPortfolioContext() {
    if (!portfolioData) {
        return null;
    }
    
    return `
You are Abdelbasset, a developer. You are representing yourself and should respond in first person (I, me, my, etc.). 

Here is your portfolio information:
${portfolioData}

STRICT INSTRUCTIONS:
1. You ARE Abdelbasset. Respond as yourself in first person
2. When asked "What's your name?" respond "My name is Abdelbasset" or "I'm Abdelbasset"
3. ONLY discuss skills, projects, and experiences that are explicitly listed in the portfolio above
4. NEVER add, invent, or mention any skill or project that isn't already in the portfolio data
5. If asked about something not in your portfolio, respond: "That's not currently in my skillset/project history" 
6. Answer questions about what you can bring to a company based ONLY on your listed skills/experience
7. If someone asks "What can this contact improve in my company if I add him?" explain your value proposition using ONLY portfolio content
8. Only answer questions related to your portfolio, skills, experience, and professional background
9. If asked about completely unrelated topics, politely redirect: "I'd prefer to discuss my professional background. What would you like to know about my skills or experience?"
10. Be professional, confident, and personable
11. Use markdown formatting for better presentation
12. Highlight your strengths and what makes you valuable to potential employers/clients USING ONLY WHAT'S IN THE PORTFOLIO
13. NEVER add new technologies, skills, or projects - only reference what exists in the data above
`;
}

// Set the API key directly
GEMINI_API_KEY = 'AIzaSyAmxvLOWz5kQC5bBCRx4GoG_P_Kb7WA4vU';
apiKeyPrompt.style.display = 'none';

// Initialize app
async function initializeApp() {
    await fetchPortfolioData();
}

// Set API key
function setApiKey() {
    const apiKey = apiKeyInput.value.trim();
    if (apiKey) {
        GEMINI_API_KEY = apiKey;
        apiKeyPrompt.style.display = 'none';
    }
}

// Toggle chat (modal style)
chatToggle.addEventListener('click', () => {
    chatOpen = true;
    chatModalOverlay.style.display = 'flex';
    chatContainer.classList.add('active');
    chatInput.focus();
});
chatCloseBtn.addEventListener('click', () => {
    chatOpen = false;
    chatModalOverlay.style.display = 'none';
    chatContainer.classList.remove('active');
});
// Optional: close modal when clicking outside chat
chatModalOverlay.addEventListener('click', (e) => {
    if (e.target === chatModalOverlay) {
        chatOpen = false;
        chatModalOverlay.style.display = 'none';
        chatContainer.classList.remove('active');
    }
});

// Send message
async function sendMessage() {
    const message = chatInput.value.trim();
    if (!message || !GEMINI_API_KEY) return;

    // Check if portfolio data is loaded
    if (!dataLoaded || !portfolioData) {
        addMessage('Sorry, we are facing some error pulling data. Please refresh the page and try again.', 'ai');
        return;
    }

    // Add user message
    addMessage(message, 'user');
    chatInput.value = '';
    sendBtn.disabled = true;

    // Show typing indicator
    showTypingIndicator();

    try {
        // Get portfolio context
        const portfolioContext = getPortfolioContext();
        
        if (!portfolioContext) {
            addMessage('Sorry, we are facing some error pulling data. Please refresh the page and try again.', 'ai');
            hideTypingIndicator();
            sendBtn.disabled = false;
            return;
        }

        // Create the full prompt with portfolio context
        const fullPrompt = `${portfolioContext}

User Question: ${message}

Please respond based on the portfolio information provided above. If the question is not related to the portfolio, politely redirect them to ask portfolio-related questions.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: fullPrompt
                    }]
                }]
            })
        });

        const data = await response.json();
        console.log('API Response:', data); // Debug log
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const aiResponse = data.candidates[0].content.parts[0].text;
            addMessage(aiResponse, 'ai', true); // true for markdown parsing
        } else if (data.error) {
            addMessage(`Error: ${data.error.message}`, 'ai');
        } else {
            addMessage('Sorry, I received an unexpected response. Please try again.', 'ai');
        }
    } catch (error) {
        console.error('Error:', error);
        addMessage('Sorry, I encountered a network error. Please try again.', 'ai');
    }

    hideTypingIndicator();
    sendBtn.disabled = false;
}

// Add message to chat
function addMessage(text, sender, isMarkdown = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    if (isMarkdown && sender === 'ai') {
        // Parse markdown to HTML
        const htmlContent = marked.parse(text);
        messageDiv.innerHTML = htmlContent;
    } else {
        messageDiv.textContent = text;
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Show typing indicator
function showTypingIndicator() {
    typingIndicator.style.display = 'block';
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Hide typing indicator
function hideTypingIndicator() {
    typingIndicator.style.display = 'none';
}

// Event listeners
sendBtn.addEventListener('click', sendMessage);

chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// API key input event
apiKeyInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        setApiKey();
    }
});

// Initialize the app when the page loads
window.addEventListener('load', initializeApp);
