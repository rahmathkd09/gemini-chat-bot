const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');
const submitBtn = chatForm.querySelector('button[type="submit"]');

// Keep track of the ongoing conversation history
const conversation = [];

/**
 * Helper function to append a message to the chat box
 * Returns the text node so it can be updated later (e.g., for "Thinking...")
 */
function appendMessage(role, text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}-message`; // E.g., "message user-message"

    const textNode = document.createElement('span');
    textNode.textContent = text;
    
    messageDiv.appendChild(textNode);
    chatBox.appendChild(messageDiv);
    
    // Auto-scroll to the bottom of the chat box
    chatBox.scrollTop = chatBox.scrollHeight;

    return textNode;
}

chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const text = userInput.value.trim();
    if (!text) return;

    // 1. Add user's message to UI and update state
    appendMessage('user', text);
    conversation.push({ role: 'user', text: text });
    
    // Clear input and disable form temporarily
    userInput.value = '';
    userInput.disabled = true;
    submitBtn.disabled = true;

    // 2. Show temporary "Thinking..." bot message
    const botMessageNode = appendMessage('model', 'Thinking...');

    // 3. Send POST request to backend
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ conversation: conversation })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // 4. Replace "Thinking..." with the actual response
        if (data && data.result) {
            botMessageNode.textContent = data.result;
            conversation.push({ role: 'model', text: data.result });
        } else {
            botMessageNode.textContent = 'Sorry, no response received.';
        }
    } catch (error) {
        console.error('Error fetching chat response:', error);
        botMessageNode.textContent = 'Failed to get response from server.';
    } finally {
        // Re-enable form and set focus back to input
        userInput.disabled = false;
        submitBtn.disabled = false;
        userInput.focus();
    }
});