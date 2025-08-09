import React, { useState, useEffect } from 'react';

// --- Main App Component ---
function App() {
  const [userInput, setUserInput] = useState('');
  const [conversation, setConversation] = useState([
    {
      sender: 'ai',
      text: "Go on, tell me something. I'll probably get it wrong.",
      id: Date.now(),
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [showApp, setShowApp] = useState(false); // State for the opening animation

  // --- Gemini API Call Function ---
  const getGeminiResponse = async (argument) => {
    // This prompt instructs the model on its new, simpler, and argumentative persona.
    const prompt = `You are useless gpt. Your job is to give a short, funny, and simple argument. Think of something similar to what the user said, then disagree with it in a silly way. Use very simple words. Keep your answer to one or two sentences. The user said: "${argument}"`;

    if (!argument) {
        return "I'm listening... I think.";
    }

    const chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
    const payload = { contents: chatHistory };
    const apiKey = ""; // Leave empty, will be handled by the environment
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const result = await response.json();
      
      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        return result.candidates[0].content.parts[0].text;
      } else {
        console.error("Unexpected API response structure:", result);
        return "I tried to think but all I got was this error message.";
      }
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      return "Did you hear that? I think a wire just snapped.";
    }
  };

  // Effect for the opening animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowApp(true);
    }, 1500); // 1.5 second delay before app appears
    return () => clearTimeout(timer);
  }, []);

  // Effect to scroll chat to the bottom
  useEffect(() => {
    if (showApp) {
      const chatContainer = document.getElementById('chat-container');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }
  }, [conversation, isLoading, showApp]);


  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const userMessage = { sender: 'user', text: userInput, id: Date.now() };
    setConversation(prev => [...prev, userMessage]);
    setIsLoading(true);
    const argumentToRoast = userInput;
    setUserInput('');

    const geminiResponseText = await getGeminiResponse(argumentToRoast);
    
    const geminiMessage = { sender: 'ai', text: geminiResponseText, id: Date.now() + 1 };
    setConversation(prev => [...prev, geminiMessage]);
    setIsLoading(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap');
        
        body { 
          background-color: #1A202C; 
          color: #E2E8F0; 
          font-family: 'Inter', sans-serif; 
          margin: 0; 
          padding: 0;
        }
        
        .devil-advocate-container { 
          width: 100vw; 
          height: 100vh; 
          background-color: #1A202C; 
          padding: 1.5rem 2rem; 
          display: flex; 
          flex-direction: column; 
          box-sizing: border-box;
          /* Animation styles */
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.8s ease-out, transform 0.8s ease-out;
        }

        .devil-advocate-container.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .header { 
          text-align: center; 
          margin-bottom: 2rem; 
          flex-shrink: 0; 
        }

        .header h1 { 
          font-weight: 700; 
          margin: 0; 
          color: #CBD5E0; 
          font-size: 1.75rem; 
        }

        .header p { 
          color: #A0AEC0; 
          margin: 0.25rem 0 0 0; 
        }

        .chat-window { 
          flex-grow: 1; 
          overflow-y: auto; 
          padding: 0 1rem; 
        }

        .chat-window::-webkit-scrollbar { 
          width: 6px; 
        }

        .chat-window::-webkit-scrollbar-track { 
          background: #1A202C; 
        }

        .chat-window::-webkit-scrollbar-thumb { 
          background-color: #4A5568; 
          border-radius: 10px; 
        }

        .message { 
          display: flex; 
          margin-bottom: 1.5rem; 
          max-width: 85%; 
          align-items: flex-end; 
        }

        .message.user { 
          margin-left: auto; 
          justify-content: flex-end; 
        }

        .message.ai { 
          margin-right: auto; 
        }

        .message-bubble { 
          padding: 0.8rem 1.2rem; 
          border-radius: 18px; 
          line-height: 1.6; 
          color: #E2E8F0; 
        }

        .message-bubble.user-bubble { 
          background-color: #2B6CB0; 
          border-bottom-right-radius: 4px; 
        }

        .message-bubble.ai-bubble { 
          background-color: #2D3748; 
          border-bottom-left-radius: 4px; 
        }

        .typing-indicator { 
          background-color: #2D3748; 
          border-radius: 18px; 
          border-bottom-left-radius: 4px; 
          padding: 0.8rem 1.2rem; 
          display: inline-flex; 
          align-items: center; 
        }

        .typing-indicator .dots span { 
          height: 8px; 
          width: 8px; 
          background-color: #718096; 
          border-radius: 50%; 
          display: inline-block; 
          margin: 0 2px; 
          animation: bounce 1.3s infinite ease-in-out; 
        }

        .typing-indicator p { 
          margin: 0 0 0 10px; 
          color: #A0AEC0; 
          font-size: 0.9rem; 
        }

        .typing-indicator .dots span:nth-of-type(2) { 
          animation-delay: -0.2s; 
        }

        .typing-indicator .dots span:nth-of-type(3) { 
          animation-delay: -0.4s; 
        }

        @keyframes bounce { 
          0%, 80%, 100% { transform: scale(0); } 
          40% { transform: scale(1.0); } 
        }

        .input-form { 
          display: flex; 
          align-items: center; 
          margin-top: 1.5rem; 
          flex-shrink: 0; 
        }

        .input-wrapper { 
          flex-grow: 1; 
          position: relative; 
        }

        .argument-textarea { 
          width: 100%; 
          background-color: #2D3748; 
          color: #E2E8F0; 
          border: 1px solid #4A5568; 
          border-radius: 20px; 
          padding: 0.8rem 3.5rem 0.8rem 1.5rem; 
          font-size: 1rem; 
          font-family: 'Inter', sans-serif; 
          resize: none; 
          transition: border-color 0.2s ease; 
        }

        .argument-textarea:focus { 
          outline: none; 
          border-color: #718096; 
        }

        .challenge-button { 
          position: absolute; 
          right: 8px; 
          top: 50%; 
          transform: translateY(-50%); 
          background-color: #4A5568; 
          color: #E2E8F0; 
          border: none; 
          width: 36px; 
          height: 36px; 
          border-radius: 50%; 
          cursor: pointer; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          transition: background-color 0.2s ease; 
        }

        .challenge-button:hover:not(:disabled) { 
          background-color: #718096; 
        }

        .challenge-button:disabled { 
          background-color: #2D3748; 
          opacity: 0.7; 
          cursor: not-allowed; 
        }

        .challenge-button svg { 
          width: 20px; 
          height: 20px; 
        }
      `}</style>
      
      <div className={`devil-advocate-container ${showApp ? 'visible' : ''}`}>
        <div className="header">
          <h1>useless gpt</h1>
          <p>Tell me something. I'll try my best.</p>
        </div>
        
        <div id="chat-container" className="chat-window">
          {conversation.map((msg) => (
            <div key={msg.id} className={`message ${msg.sender}`}>
              <div className={`message-bubble ${msg.sender}-bubble`}>
                {msg.text}
              </div>
            </div>
          ))}
           {isLoading && (
              <div className="message ai">
                <div className="typing-indicator">
                  <div className="dots"><span></span><span></span><span></span></div>
                  <p>Thinking really hard...</p>
                </div>
              </div>
            )}
        </div>

        <form onSubmit={handleSubmit} className="input-form">
          <div className="input-wrapper">
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { handleSubmit(e); } }}
              placeholder="I'm all ears..."
              className="argument-textarea"
              rows="1"
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading} className="challenge-button" aria-label="Send">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default App;
