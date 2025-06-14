/**
 * @file content.js
 * Sendora Chrome Extension Content Script for Gmail.
 * This script injects an AI-powered reply button into Gmail's compose windows.
 */

console.log("Sendora Email Writer Extension content script loaded.");

// Inject CSS styles directly into the page
function injectStyles() {
    if (document.getElementById('sendora-extension-styles')) {
        return; // Already injected
    }

    const style = document.createElement('style');
    style.id = 'sendora-extension-styles';
    style.textContent = `
        /* Sendora Extension Styles */
        .sendora-ai-button {
            position: relative !important;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
            color: white !important;
            border: none !important;
            border-radius: 18px !important;
            padding: 8px 16px !important;
            margin-right: 8px !important;
            font-family: 'Google Sans', Roboto, Arial, sans-serif !important;
            font-size: 14px !important;
            font-weight: 500 !important;
            letter-spacing: 0.25px !important;
            cursor: pointer !important;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
            box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24) !important;
            user-select: none !important;
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            min-height: 32px !important;
            text-decoration: none !important;
            outline: none !important;
            overflow: hidden !important;
        }

        .sendora-ai-button:hover {
            transform: translateY(-1px) !important;
            box-shadow: 0 4px 8px rgba(0,0,0,0.16), 0 4px 8px rgba(0,0,0,0.23) !important;
            background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%) !important;
        }

        .sendora-ai-button:active {
            transform: translateY(0) !important;
            box-shadow: 0 1px 2px rgba(0,0,0,0.16) !important;
            background: linear-gradient(135deg, #4f63d2 0%, #5d3a84 100%) !important;
        }

        .sendora-ai-button:focus {
            outline: 2px solid #667eea !important;
            outline-offset: 2px !important;
        }

        .sendora-ai-button:disabled,
        .sendora-ai-button[disabled] {
            opacity: 0.6 !important;
            cursor: not-allowed !important;
            transform: none !important;
            background: linear-gradient(135deg, #999 0%, #777 100%) !important;
        }

        @keyframes sendora-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .sendora-spinner {
            width: 14px !important;
            height: 14px !important;
            border: 2px solid rgba(255, 255, 255, 0.3) !important;
            border-top: 2px solid #ffffff !important;
            border-radius: 50% !important;
            animation: sendora-spin 1s linear infinite !important;
            margin-right: 8px !important;
        }

        .sendora-ai-button.success {
            background: linear-gradient(135deg, #48bb78 0%, #38a169 100%) !important;
        }

        .sendora-ai-button.error {
            background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%) !important;
        }

        .sendora-ai-button span:first-child {
            margin-right: 6px !important;
            font-size: 16px !important;
            line-height: 1 !important;
            display: inline-flex !important;
            align-items: center !important;
        }

        .sendora-ai-button span:last-child {
            white-space: nowrap !important;
            font-weight: 500 !important;
            letter-spacing: 0.25px !important;
        }

        @media (max-width: 768px) {
            .sendora-ai-button {
                padding: 6px 12px !important;
                font-size: 13px !important;
                min-height: 28px !important;
            }
            
            .sendora-ai-button span:first-child {
                font-size: 14px !important;
                margin-right: 4px !important;
            }
        }

        @media (prefers-contrast: high) {
            .sendora-ai-button {
                border: 2px solid white !important;
                background: #1a202c !important;
            }
            
            .sendora-ai-button:hover {
                background: #2d3748 !important;
            }
        }

        @media (prefers-reduced-motion: reduce) {
            .sendora-ai-button {
                transition: none !important;
            }
            
            .sendora-ai-button:hover {
                transform: none !important;
            }
            
            .sendora-spinner {
                animation: none !important;
            }
        }
    `;
    
    document.head.appendChild(style);
    console.log("Sendora styles injected");
}

// --- Configuration ---
const SENDORA_API_ENDPOINT = 'http://localhost:8080/api/email/generate';
const AI_REPLY_BUTTON_CLASS = 'ai-reply-button';
const AI_REPLY_BUTTON_ID = 'sendora-ai-reply-button';

// Set to track compose windows where button has been injected
const injectedComposeWindows = new WeakSet();

// --- Utility Functions ---

/**
 * Wait for an element to appear in the DOM
 */
function waitForElement(selector, timeout = 10000, parent = document) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        function check() {
            const element = parent.querySelector(selector);
            if (element) {
                resolve(element);
            } else if (Date.now() - startTime > timeout) {
                reject(new Error(`Element ${selector} not found within ${timeout}ms`));
            } else {
                setTimeout(check, 100);
            }
        }
        
        check();
    });
}

/**
 * Check if we're on Gmail
 */
function isGmail() {
    return window.location.hostname === 'mail.google.com';
}

/**
 * Helper function to find elements containing specific text
 */
function findElementWithText(parent, tagName, text) {
    const elements = parent.getElementsByTagName(tagName);
    for (let element of elements) {
        if (element.textContent && element.textContent.includes(text)) {
            return element;
        }
    }
    return null;
}

// --- Core Functions ---

/**
 * Creates the Sendora AI button element with improved styling.
 */
function createSendoraButton() {
    const button = document.createElement('div');
    button.id = AI_REPLY_BUTTON_ID;
    button.className = 'T-I J-J5-Ji aoO T-I-atl L3 sendora-ai-button';
    button.setAttribute('role', 'button');
    button.setAttribute('tabindex', '0');
    button.setAttribute('data-tooltip', 'Generate reply with Sendora AI');

    // Create button content with icon and text
    const iconSpan = document.createElement('span');
    iconSpan.innerHTML = '✨';
    iconSpan.style.cssText = `
        margin-right: 6px;
        font-size: 16px;
        line-height: 1;
    `;

    const textSpan = document.createElement('span');
    textSpan.textContent = 'Sendora AI';
    textSpan.style.cssText = `
        white-space: nowrap;
        font-weight: 500;
        letter-spacing: 0.25px;
    `;

    button.appendChild(iconSpan);
    button.appendChild(textSpan);

    console.log("Sendora button created with enhanced styling");
    return button;
}

/**
 * Extracts email context from the compose window.
 */
function extractEmailContext(composeWindow) {
    // Extract subject
    const subjectInput = composeWindow.querySelector('input[name="subjectbox"], input[aria-label*="Subject"]');
    const subject = subjectInput ? subjectInput.value.trim() : '';

    // Extract recipient
    const toField = composeWindow.querySelector('textarea[name="to"], [aria-label*="To"] textarea, [aria-label*="Recipients"] textarea');
    const recipient = toField ? toField.value.trim() : '';

    // Extract original message body from quoted content or conversation
    let originalBody = '';
    
    // Look for quoted content in reply/forward scenarios
    const quotedSelectors = [
        '.gmail_quote',
        '.gmail_extra', 
        'blockquote',
        '[data-smartmail="gmail_signature"]',
        '.ii.gt .im',  // Gmail conversation messages
        '.adn.ads .ii.gt',  // Alternative conversation structure
    ];

    for (const selector of quotedSelectors) {
        const element = composeWindow.querySelector(selector) || 
                       document.querySelector(selector); // Check document if not in compose window
        if (element) {
            originalBody = element.innerText.trim();
            if (originalBody && originalBody.length > 20) break; // Get substantial content
        }
    }

    // If no quoted content found, try to get conversation context from the email thread
    if (!originalBody) {
        const conversationMessages = document.querySelectorAll('.ii.gt .im, .adn.ads .ii.gt');
        if (conversationMessages.length > 0) {
            // Get the last message in the conversation
            const lastMessage = conversationMessages[conversationMessages.length - 1];
            originalBody = lastMessage ? lastMessage.innerText.trim() : '';
        }
    }

    console.log("Extracted context:", { subject, recipient, bodyLength: originalBody.length });
    return { subject, body: originalBody, recipient };
}

/**
 * Finds the compose content area.
 */
function getComposeContentArea(composeWindow) {
    const selectors = [
        'div[aria-label="Message Body"][role="textbox"]',
        'div[contenteditable="true"][role="textbox"]',
        '.Am.Al.editable',
        'div[contenteditable="true"][aria-label*="Message"]',
        'div[contenteditable="true"].Am',
        'div[contenteditable="true"]'
    ];

    for (const selector of selectors) {
        const area = composeWindow.querySelector(selector);
        if (area && area.isContentEditable) {
            console.log("Found compose content area with selector:", selector);
            return area;
        }
    }

    console.warn("Compose content area not found");
    return null;
}

/**
 * Inserts reply text into the compose area.
 */
function insertReplyIntoCompose(composeContentArea, replyText) {
    if (!composeContentArea) {
        console.error("Compose content area not available");
        return;
    }

    // Clear existing content
    composeContentArea.innerHTML = '';

    // Split reply into paragraphs and insert
    const paragraphs = replyText.split(/\n\s*\n/).filter(p => p.trim());
    
    paragraphs.forEach((paragraph, index) => {
        const div = document.createElement('div');
        div.textContent = paragraph.trim();
        composeContentArea.appendChild(div);

        if (index < paragraphs.length - 1) {
            const br = document.createElement('br');
            composeContentArea.appendChild(br);
        }
    });

    // Trigger events to notify Gmail of changes
    composeContentArea.focus();
    
    // Dispatch input events
    const inputEvent = new Event('input', { bubbles: true, cancelable: true });
    const changeEvent = new Event('change', { bubbles: true, cancelable: true });
    
    composeContentArea.dispatchEvent(inputEvent);
    composeContentArea.dispatchEvent(changeEvent);

    console.log("Reply inserted successfully");
}

/**
 * Calls the Sendora backend API with improved error handling.
 */
async function generateReplyWithSendora(emailContext) {
    console.log("Calling Sendora API with context:", emailContext);

    try {
        const requestBody = {
            emailContent: emailContext.body || "Please generate a professional email response",
            tone: "professional",
            language: "English",
            subject: emailContext.subject,
            recipient: emailContext.recipient
        };

        console.log("Sending request body:", requestBody);

        const response = await fetch(SENDORA_API_ENDPOINT, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        console.log("Response status:", response.status);
        console.log("Response content-type:", response.headers.get('content-type'));

        if (!response.ok) {
            const errorText = await response.text();
            console.error("API error response:", errorText);
            
            // Try to parse error as JSON first
            try {
                const errorJson = JSON.parse(errorText);
                throw new Error(errorJson.error || errorJson.message || `Server error (${response.status})`);
            } catch (parseError) {
                throw new Error(`Server error (${response.status}): ${errorText}`);
            }
        }

        // Get response as text first
        const responseText = await response.text();
        console.log("Raw response text:", responseText);

        // Check if response is empty
        if (!responseText || responseText.trim().length === 0) {
            throw new Error('Empty response from server');
        }

        // Try to parse as JSON first
        let result;
        try {
            result = JSON.parse(responseText);
            console.log("Parsed JSON response:", result);
            
            // Check for error in JSON response
            if (result.status === 'error' || result.error) {
                throw new Error(result.error || result.message || 'Server returned an error');
            }
            
            // Extract the generated reply from JSON response
            const generatedReply = result.generatedEmail || 
                                  result.reply || 
                                  result.generated_text || 
                                  result.message ||
                                  result.response ||
                                  result.data ||
                                  result.content ||
                                  result.text ||
                                  result.email ||
                                  (typeof result === 'string' ? result : null);

            if (!generatedReply || typeof generatedReply !== 'string') {
                console.warn("No valid reply text found in JSON response");
                throw new Error('Invalid response format: no email content found');
            }
            
            return generatedReply.trim();
            
        } catch (parseError) {
            console.log("Response is not JSON, treating as plain text");
            
            // Check if it's clearly an HTML error page
            if (responseText.includes('<!DOCTYPE') || 
                responseText.includes('<html>') ||
                responseText.includes('<body>') ||
                responseText.includes('<title>')) {
                throw new Error('Server returned HTML error page instead of email content. Check if the API endpoint is correct.');
            }
            
            // If it's plain text but contains obvious error indicators
            if (responseText.toLowerCase().includes('thank you for reporting') ||
                responseText.toLowerCase().includes('server response format error')) {
                throw new Error('Server configuration error: API is returning error messages instead of email content. Please check backend logs.');
            }
            
            if (responseText.toLowerCase().includes('error') && 
                responseText.toLowerCase().includes('404')) {
                throw new Error('API endpoint not found (404). Verify the server route configuration.');
            }
            
            if (responseText.toLowerCase().includes('error') && 
                responseText.toLowerCase().includes('500')) {
                throw new Error('Internal server error (500). Check backend logs for details.');
            }
            
            // If it looks like a valid email response, return it
            if (responseText.length > 20 && !responseText.toLowerCase().includes('error')) {
                return responseText.trim();
            }
            
            // Otherwise, it's probably an error
            throw new Error(`Unexpected response format: ${responseText.substring(0, 100)}...`);
        }

    } catch (error) {
        console.error("Full API error:", error);
        
        // Network/Connection errors
        if (error.message.includes('Failed to fetch') || 
            error.name === 'TypeError' ||
            error.message.includes('NetworkError') ||
            error.message.includes('net::')) {
            throw new Error("Cannot connect to Sendora backend. Please ensure the server is running on localhost:8080");
        }
        
        // CORS errors
        if (error.message.includes('CORS') || 
            error.message.includes('Access-Control')) {
            throw new Error("CORS error: Backend needs to allow requests from mail.google.com");
        }
        
        // Re-throw the original error message if it's already descriptive
        throw error;
    }
}

/**
 * Handles the Sendora button click with improved UI feedback.
 */
async function handleSendoraButtonClick(button, composeWindow) {
    console.log("Sendora button clicked");

    // Store original content and disable button
    const originalContent = button.innerHTML;
    button.disabled = true;
    button.style.pointerEvents = 'none';
    button.style.opacity = '0.7';
    
    // Show loading state with animation
    button.innerHTML = `
        <span style="display: inline-flex; align-items: center;">
            <span class="sendora-spinner"></span>
            Generating...
        </span>
    `;

    try {
        // Find compose content area
        const composeContentArea = getComposeContentArea(composeWindow);
        if (!composeContentArea) {
            throw new Error("Could not find email compose area");
        }

        // Extract email context
        const emailContext = extractEmailContext(composeWindow);
        
        // Generate reply
        const generatedReply = await generateReplyWithSendora(emailContext);
        
        // Insert reply
        insertReplyIntoCompose(composeContentArea, generatedReply);

        // Show success feedback briefly
        button.innerHTML = `
            <span style="display: inline-flex; align-items: center;">
                <span style="margin-right: 6px;">✅</span>
                Generated!
            </span>
        `;
        button.style.background = 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)';
        
        setTimeout(() => {
            button.innerHTML = originalContent;
            button.disabled = false;
            button.style.pointerEvents = 'auto';
            button.style.opacity = '1';
            button.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        }, 1500);

    } catch (error) {
        console.error("Error during reply generation:", error);
        
        // Show error feedback
        button.innerHTML = `
            <span style="display: inline-flex; align-items: center;">
                <span style="margin-right: 6px;">❌</span>
                Error
            </span>
        `;
        button.style.background = 'linear-gradient(135deg, #f56565 0%, #e53e3e 100%)';
        
        // Show error message in compose area
        const composeContentArea = getComposeContentArea(composeWindow);
        if (composeContentArea) {
            const errorMessage = `Sendora Error: ${error.message}\n\nTroubleshooting steps:\n1. Ensure backend server is running on localhost:8080\n2. Check browser console for detailed errors\n3. Verify API endpoint /api/email/generate exists\n4. Check CORS configuration if needed`;
            insertReplyIntoCompose(composeContentArea, errorMessage);
        }
        
        // Restore button after showing error
        setTimeout(() => {
            button.innerHTML = originalContent;
            button.disabled = false;
            button.style.pointerEvents = 'auto';
            button.style.opacity = '1';
            button.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        }, 3000);
    }
}

/**
 * Injects the Sendora button into the compose window.
 */
async function injectSendoraButton(composeWindow) {
    if (injectedComposeWindows.has(composeWindow)) {
        console.log("Button already injected in this window");
        return;
    }

    console.log("Injecting Sendora button into compose window");

    try {
        // Check if button already exists
        if (composeWindow.querySelector(`#${AI_REPLY_BUTTON_ID}`)) {
            console.log("Button already exists in this window");
            injectedComposeWindows.add(composeWindow);
            return;
        }

        // Enhanced selectors for finding the toolbar/button area
        let buttonContainer = null;
        
        const containerSelectors = [
            // Reply/compose toolbar selectors
            '.btC',           // Main button container
            '.aoD',           // Alternative button container  
            '.gU.Up',         // Another button container variant
            '.Am.Al.editable', // Content area container
            'td.gU.Up',       // Table cell button container
            '.IZ',            // Toolbar container
            '[role="toolbar"]', // ARIA toolbar
            '.aDh',           // Button area
            '.aoI'            // Send button area
        ];

        for (const selector of containerSelectors) {
            const container = composeWindow.querySelector(selector);
            if (container) {
                buttonContainer = container;
                console.log("Found button container with selector:", selector);
                break;
            }
        }

        // If no container found, try to find Send button and use its parent
        if (!buttonContainer) {
            const sendSelectors = [
                'div[role="button"][data-tooltip*="Send"]',
                'div[role="button"][aria-label*="Send"]', 
                '.T-I.J-J5-Ji.aoO.T-I-atl.L3'
            ];

            for (const selector of sendSelectors) {
                const sendButton = composeWindow.querySelector(selector);
                if (sendButton) {
                    buttonContainer = sendButton.parentNode;
                    console.log("Found Send button, using parent as container");
                    break;
                }
            }

            // Additional fallback: look for spans containing "Send" text
            if (!buttonContainer) {
                const allButtons = composeWindow.querySelectorAll('div[role="button"]');
                for (const btn of allButtons) {
                    const sendSpan = findElementWithText(btn, 'span', 'Send');
                    if (sendSpan) {
                        buttonContainer = btn.parentNode;
                        console.log("Found Send button by text content, using parent as container");
                        break;
                    }
                }
            }
        }
        // Fallback: look for any button-like elements and use their container
        if (!buttonContainer) {
            const anyButton = composeWindow.querySelector('div[role="button"], .T-I');
            if (anyButton) {
                buttonContainer = anyButton.parentNode;
                console.log("Using fallback button container");
            }
        }

        if (!buttonContainer) {
            console.error("Could not find suitable button container");
            return;
        }

        // Create and insert button
        const button = createSendoraButton();
        
        // Add click handler
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSendoraButtonClick(button, composeWindow);
        });

        // Add keyboard handler for accessibility
        button.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                handleSendoraButtonClick(button, composeWindow);
            }
        });

        // Insert button at the beginning of the container
        if (buttonContainer.firstChild) {
            buttonContainer.insertBefore(button, buttonContainer.firstChild);
        } else {
            buttonContainer.appendChild(button);
        }
        
        // Mark as injected
        injectedComposeWindows.add(composeWindow);
        
        console.log("Sendora button injected successfully");

    } catch (error) {
        console.error("Error injecting button:", error);
    }
}

/**
 * Detects compose windows and injects buttons with improved detection.
 */
function detectAndInjectButtons() {
    if (!isGmail()) return;

    // Enhanced selectors for compose/reply windows
    const composeSelectors = [
        'div[role="dialog"]',     // Popup compose
        '.nH.nn',                 // Inline compose
        '.no',                    // Alternative compose
        '.aO7',                   // Reply box
        '.I5',                    // Reply area
        '.Ar.Au',                 // Another reply variant
        'div[contenteditable="true"][aria-label*="Message"]' // Direct content editable
    ];

    const foundWindows = new Set();

    for (const selector of composeSelectors) {
        const elements = document.querySelectorAll(selector);
        
        elements.forEach(element => {
            // Additional checks to confirm this is a compose window
            const hasComposeElements = 
                element.querySelector('div[aria-label*="Message Body"], input[name="subjectbox"], div[contenteditable="true"]') ||
                element.querySelector('div[role="textbox"], textarea[name="to"]') ||
                element.matches('div[contenteditable="true"]');

            if (hasComposeElements && !injectedComposeWindows.has(element)) {
                foundWindows.add(element);
            }
        });
    }

    // Also check for reply boxes in conversation view
    const replyBoxes = document.querySelectorAll('.I5, .aO7, div[contenteditable="true"][aria-label*="Message"]');
    replyBoxes.forEach(box => {
        const composeArea = box.closest('.nH') || box.closest('[role="main"]') || box;
        if (composeArea && !injectedComposeWindows.has(composeArea)) {
            foundWindows.add(composeArea);
        }
    });

    // Inject buttons into found windows
    foundWindows.forEach(window => {
        console.log("Detected new compose/reply window");
        injectSendoraButton(window);
    });
}

// --- Initialize Extension ---

if (isGmail()) {
    console.log("Initializing Sendora extension on Gmail");

    // Inject styles first
    injectStyles();

    // Initial detection after page loads
    setTimeout(detectAndInjectButtons, 2000);

    // Set up mutation observer to detect new compose windows
    const observer = new MutationObserver((mutations) => {
        let shouldCheck = false;
        
        for (const mutation of mutations) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check if new node contains compose elements
                        if (node.matches?.('div[role="dialog"], .nH, .no, .aO7, .I5') || 
                            node.querySelector?.('div[role="dialog"], .nH.nn, .no, .aO7, .I5, div[contenteditable="true"]')) {
                            shouldCheck = true;
                            break;
                        }
                    }
                }
            }
            if (shouldCheck) break;
        }

        if (shouldCheck) {
            setTimeout(detectAndInjectButtons, 500);
        }
    });

    // Start observing
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Additional periodic check to catch any missed compose windows
    setInterval(detectAndInjectButtons, 3000);

    console.log("Sendora extension initialized and observing for compose windows");
} else {
    console.log("Not on Gmail, Sendora extension inactive");
}