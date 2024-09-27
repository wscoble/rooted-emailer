import './style.css';
import './app.css';
import { marked } from 'marked';

import logo from './assets/images/logo.png';
import { RenderTemplate, ListTemplates } from '../wailsjs/go/main/App';

let facilitators = '';
let currentWeek = 0;
let renderedEmails = {};  // Change this to an object instead of an array

// Update loadSavedData function
function loadSavedData() {
    const savedData = localStorage.getItem('rootedEmailerData');
    if (savedData) {
        const parsedData = JSON.parse(savedData);
        facilitators = parsedData.facilitators || '';
        currentWeek = parsedData.currentWeek || 0;
        if (Array.isArray(parsedData.renderedEmails)) {
            // Convert old array format to new object format
            renderedEmails = {};
            parsedData.renderedEmails.forEach((email, index) => {
                renderedEmails[email.name || `Participant ${index + 1}`] = email;
            });
        } else {
            renderedEmails = parsedData.renderedEmails || {};
        }
    }
    console.log('Loaded data:', { facilitators, currentWeek, renderedEmails });
}

// Update saveData function
function saveData() {
    const dataToSave = {
        facilitators,
        currentWeek,
        renderedEmails
    };
    localStorage.setItem('rootedEmailerData', JSON.stringify(dataToSave));
    console.log('Saved data:', dataToSave);
}

function createHeader(showBackButton = false) {
    return `
    <div class="header">
        <img id="logo" src="${logo}" alt="Rooted Network Logo">
        <div class="header-controls">
            <label for="facilitators">Facilitators:</label>
            <input type="text" id="facilitators" placeholder="Enter facilitators" value="${facilitators}">
            <label for="currentWeek">Week:</label>
            <input type="number" id="currentWeek" placeholder="Enter week" value="${currentWeek}">
        </div>
        ${showBackButton ? '<button id="backButton">Back</button>' : '<div></div>'}
    </div>
    `;
}

// Update createLayout function
function createLayout(content, showBackButton = false) {
    return `
    ${createHeader(showBackButton)}
    <div class="main-content">
        <div class="sidebar">
            ${createRenderedEmailsList()}
        </div>
        <div class="container">
            ${content}
        </div>
    </div>
    `;
}

function createParticipantForm() {
    const content = `
        <h1>Participant Information</h1>
        <form id="participantForm">
            <div class="input-group">
                <label for="name">Name:</label>
                <input type="text" id="name" name="name" required>
            </div>
            <div class="input-group">
                <label for="email">Email Address:</label>
                <input type="email" id="email" name="email" required>
            </div>
            <div class="input-group">
                <label for="snacks">Snack Week:</label>
                <input type="number" id="snacks" name="snacks" required min="1" max="99" maxlength="2">
            </div>
            <button type="submit">Render Template</button>
        </form>
    `;
    return createLayout(content);
}

// Update addRenderedEmail function
function addRenderedEmail(templateData, renderedTemplate) {
    renderedEmails[templateData.Name] = {
        name: templateData.Name,  // Add this line
        email: templateData.Emails[0],
        snacks: templateData.Snacks,
        weekRendered: templateData.CurrentWeek,
        emailAddresses: renderedTemplate.emailAddresses,
        subject: renderedTemplate.subject,
        body: marked(renderedTemplate.body)
    };
    saveData();
}

// Update the renderTemplate function
async function renderTemplate(templateData) {
    try {
        console.log('Calling RenderTemplate with:', templateData);
        const renderedTemplate = await RenderTemplate(templateData);
        console.log('Received rendered template:', renderedTemplate);
        
        addRenderedEmail(templateData, renderedTemplate);
        
        updateView(createRenderedView(renderedTemplate));
    } catch (error) {
        console.error('Error rendering template:', error);
        alert(`Error rendering template: ${error.message}`);
    }
}

function createRenderedView(renderedTemplate) {
    console.log('Creating rendered view with:', renderedTemplate);
    return `
    <div class="rendered-content">
        <div class="action-buttons">
            <div class="participant-controls">
                <input type="text" id="updateName" placeholder="Update Name" value="${renderedTemplate.name}">
                <input type="email" id="updateEmail" placeholder="Update Email" value="${renderedTemplate.emailAddresses[0]}">
                <input type="number" id="updateSnacks" placeholder="Update Snacks Week" value="${renderedTemplate.snacks}">
                <button id="updateParticipantButton">Update</button>
                <button id="deleteParticipantButton">Delete</button>
            </div>
        </div>
        <div class="copy-buttons">
            <button id="copyEmailsButton">Copy Email Addresses</button>
            <button id="copySubjectButton">Copy Subject</button>
            <button id="copyBodyButton">Copy Body</button>
        </div>
        <h2>Subject: ${renderedTemplate.subject}</h2>
        <div id="renderedTemplate">${marked(renderedTemplate.body)}</div>
    </div>
    `;
}

// Update createRenderedEmailsList function
function createRenderedEmailsList() {
    const emailList = Object.values(renderedEmails).map(email => 
        `<li><a href="#" data-name="${email.name}">${email.name}</a></li>`
    ).join('');
    return `
    <div id="renderedEmails">
        <button id="newParticipantButton">New Participant</button>
        <h2>Participants:</h2>
        <ul>${emailList}</ul>
    </div>
    `;
}

// Update updateView function
function updateView(content) {
    console.log('Updating view with content:', content);
    document.querySelector('#app').innerHTML = createLayout(content);
    addRenderedEmailsListeners();
    addCopyButtonListeners();
}

// Update addRenderedEmailsListeners function
function addRenderedEmailsListeners() {
    const emailLinks = document.querySelectorAll('#renderedEmails a');
    emailLinks.forEach(link => {
        link.addEventListener('click', async (e) => {
            e.preventDefault();
            const name = e.target.getAttribute('data-name');
            const renderedEmail = renderedEmails[name];
            
            if (renderedEmail.weekRendered !== currentWeek) {
                // Re-render the email with the current week
                const templateData = {
                    Name: name,
                    Emails: [renderedEmail.email],
                    Snacks: renderedEmail.snacks,
                    CurrentWeek: currentWeek,
                    Facilitators: facilitators
                };
                await renderTemplate(templateData);
            } else {
                // Use the existing rendered email
                updateView(createRenderedView(renderedEmail));
            }
        });
    });
}

function addCopyButtonListeners() {
    const copyEmailsButton = document.getElementById('copyEmailsButton');
    const copySubjectButton = document.getElementById('copySubjectButton');
    const copyBodyButton = document.getElementById('copyBodyButton');

    if (copyEmailsButton) {
        copyEmailsButton.addEventListener('click', () => copyToClipboard('emails'));
    }
    if (copySubjectButton) {
        copySubjectButton.addEventListener('click', () => copyToClipboard('subject'));
    }
    if (copyBodyButton) {
        copyBodyButton.addEventListener('click', () => copyToClipboard('body'));
    }
}

function copyToClipboard(type) {
    const lastRendered = renderedEmails[Object.keys(renderedEmails)[Object.keys(renderedEmails).length - 1]];
    let textToCopy = '';
    let htmlToCopy = '';

    switch (type) {
        case 'emails':
            textToCopy = lastRendered.emailAddresses.join(', ');
            break;
        case 'subject':
            textToCopy = lastRendered.subject;
            break;
        case 'body':
            textToCopy = lastRendered.body.replace(/<[^>]*>/g, ''); // Fallback plain text
            htmlToCopy = lastRendered.body; // HTML version
            break;
    }

    if (htmlToCopy) {
        // For body, we use the Clipboard API to set both HTML and plain text
        navigator.clipboard.write([
            new ClipboardItem({
                'text/plain': new Blob([textToCopy], { type: 'text/plain' }),
                'text/html': new Blob([htmlToCopy], { type: 'text/html' })
            })
        ]).then(() => {
            alert(`${type.charAt(0).toUpperCase() + type.slice(1)} copied to clipboard (HTML format)!`);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    } else {
        // For emails and subject, we just use the text version
        navigator.clipboard.writeText(textToCopy).then(() => {
            alert(`${type.charAt(0).toUpperCase() + type.slice(1)} copied to clipboard!`);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    }
}

// Initialize the application
function initApp() {
    loadSavedData();
    updateView(createParticipantForm());
}

// Update the event listener to automatically save header data
document.querySelector('#app').addEventListener('input', (e) => {
    if (e.target.id === 'facilitators') {
        facilitators = e.target.value;
        saveData();
    } else if (e.target.id === 'currentWeek') {
        currentWeek = parseInt(e.target.value, 10);
        saveData();
    }
});

// Update the click event listener
document.querySelector('#app').addEventListener('click', async (e) => {
    if (e.target.id === 'backButton' || e.target.id === 'newParticipantButton') {
        updateView(createParticipantForm());
    } else if (e.target.id === 'copyEmailsButton') {
        copyToClipboard('emails');
    } else if (e.target.id === 'copySubjectButton') {
        copyToClipboard('subject');
    } else if (e.target.id === 'copyBodyButton') {
        copyToClipboard('body');
    } else if (e.target.id === 'updateParticipantButton') {
        updateParticipant();
    } else if (e.target.id === 'deleteParticipantButton') {
        deleteParticipant();
    }
});

// Add these new functions
function updateParticipant() {
    const name = document.getElementById('updateName').value;
    const email = document.getElementById('updateEmail').value;
    const snacks = parseInt(document.getElementById('updateSnacks').value, 10);

    if (!name || !email || isNaN(snacks)) {
        alert('Please fill in all fields correctly.');
        return;
    }

    const oldName = Object.keys(renderedEmails).find(key => renderedEmails[key].email === email);
    
    if (oldName && oldName !== name) {
        delete renderedEmails[oldName];
    }

    const templateData = {
        Name: name,
        Emails: [email],
        Snacks: snacks,
        CurrentWeek: currentWeek,
        Facilitators: facilitators
    };

    renderTemplate(templateData);
}

function deleteParticipant() {
    const name = document.getElementById('updateName').value;
    
    if (renderedEmails[name]) {
        delete renderedEmails[name];
        saveData();
        updateView(createParticipantForm());
    } else {
        alert('Participant not found.');
    }
}

document.querySelector('#app').addEventListener('submit', async (e) => {
    if (e.target.id === 'participantForm') {
        e.preventDefault();
        const formData = new FormData(e.target);
        const templateData = {
            Name: formData.get('name'),
            Emails: [formData.get('email')],
            Snacks: parseInt(formData.get('snacks'), 10),
            CurrentWeek: currentWeek,
            Facilitators: facilitators
        };

        await renderTemplate(templateData);
    }
});

// Populate available templates (optional)
async function populateTemplates() {
    try {
        console.log('Fetching available templates...');
        const templates = await ListTemplates();
        console.log('Available templates:', templates);
        // You can use this to create a dropdown for template selection if needed
    } catch (err) {
        console.error('Error listing templates:', err);
    }
}

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    populateTemplates();
});
