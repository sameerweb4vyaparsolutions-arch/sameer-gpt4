import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, Plus, Send, Trash2, UserRound, Sparkles, Image as ImageIcon, MessageSquareText, Download } from 'lucide-react';
import './styles.css';

const starter = {
  id: crypto.randomUUID(),
  title: 'New chat',
  messages: []
};

function App() {
  const [chats, setChats] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('sameer-gpt-chats')) || [starter];
    } catch {
      return [starter];
    }
  });
  const [activeId, setActiveId] = useState(() => chats[0]?.id || starter.id);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('chat');
  const endRef = useRef(null);

  const active = chats.find((c) => c.id === activeId) || chats[0];

  useEffect(() => {
    localStorage.setItem('sameer-gpt-chats', JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [active?.messages, loading]);

  const updateActive = (updater) => {
    setChats((prev) => prev.map((c) => (c.id === activeId ? updater(c) : c)));
  };

  const newChat = () => {
    const chat = { id: crypto.randomUUID(), title: 'New chat', messages: [] };
    setChats((prev) => [chat, ...prev]);
    setActiveId(chat.id);
  };

  const removeChat = (id) => {
    setChats((prev) => {
      const next = prev.filter((c) => c.id !== id);
      if (!next.length) {
        const chat = { id: crypto.randomUUID(), title: 'New chat', messages: [] };
        setActiveId(chat.id);
        return [chat];
      }
      if (id === activeId) setActiveId(next[0].id);
      return next;
    });
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const oldMessages = active?.messages || [];
    const userMessage = { role: 'user', content: text };
    const outgoing = [...oldMessages, userMessage];

    updateActive((chat) => ({
      ...chat,
      title: chat.messages.length ? chat.title : text.slice(0, 32),
      messages: outgoing
    }));
    setInput('');
    setLoading(true);

    try {
      if (mode === 'image') {
        const response = await fetch('/api/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: text })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data?.details || data?.error || 'Image request failed');
        updateActive((chat) => ({
          ...chat,
          messages: [...chat.messages, { role: 'assistant', type: 'image', content: `Generated image: ${text}`, image: data.image, model: data.model }]
        }));
      } else {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: outgoing.map(({ role, content }) => ({ role, content })) })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data?.details || data?.error || 'Request failed');
        updateActive((chat) => ({
          ...chat,
          messages: [...chat.messages, { role: 'assistant', content: data.reply }]
        }));
      }
    } catch (error) {
      updateActive((chat) => ({
        ...chat,
        messages: [...chat.messages, { role: 'assistant', content: `Connection error: ${error.message}` }]
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-icon"><Sparkles size={18} /></div><span>Sameer GPT</span></div>
        <button className="new-chat" onClick={newChat}><Plus size={18} /> New chat</button>
        <div className="chat-list">
          {chats.map((chat) => (
            <div key={chat.id} className={`chat-row ${chat.id === activeId ? 'active' : ''}`}>
              <button onClick={() => setActiveId(chat.id)}>{chat.title}</button>
              <button className="trash" onClick={() => removeChat(chat.id)} aria-label="Delete chat"><Trash2 size={15} /></button>
            </div>
          ))}
        </div>
        <div className="sidebar-footer"><Bot size={16} /> Powered by open models</div>
      </aside>

      <main className="main">
        <header className="topbar"><strong>Sameer GPT</strong><span>Personal AI Assistant</span></header>
        <section className="messages">
          {!active?.messages.length ? (
            <div className="welcome">
              <div className="hero-icon"><Sparkles size={28} /></div>
              <h1>How can I help you today?</h1>
              <p>Fast answers, cleaner code help, and AI image generation in one place.</p>
              <div className="suggestions">
                <button onClick={() => setInput('Create a responsive React landing page')}>Build a React page</button>
                <button onClick={() => setInput('Explain this JavaScript error simply')}>Debug my code</button>
                <button onClick={() => { setMode('image'); setInput('A professional 3D company logo on a clean white background'); }}>Generate an image</button>
              </div>
            </div>
          ) : (
            <div className="message-column">
              {active.messages.map((m, i) => (
                <article className={`message ${m.role}`} key={i}>
                  <div className="avatar">{m.role === 'assistant' ? <Bot size={18} /> : <UserRound size={18} />}</div>
                  <div className="bubble"><div className="role">{m.role === 'assistant' ? 'Sameer GPT' : 'You'}</div>{m.type === 'image' && m.image ? <div className="generated-wrap"><img className="generated-image" src={m.image} alt={m.content} /><a className="download-image" href={m.image} download="sameer-gpt-image.png"><Download size={16} /> Save image</a><small className="model-label">{m.model}</small></div> : <div className="content markdown"><ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown></div>}</div>
                </article>
              ))}
              {loading && <article className="message assistant"><div className="avatar"><Bot size={18} /></div><div className="bubble"><div className="role">Sameer GPT</div><div className="typing"><span></span><span></span><span></span></div></div></article>}
              <div ref={endRef} />
            </div>
          )}
        </section>

        <div className="composer-wrap">
          <div className="mode-switch">
            <button className={mode === 'chat' ? 'selected' : ''} onClick={() => setMode('chat')}><MessageSquareText size={16} /> Chat</button>
            <button className={mode === 'image' ? 'selected' : ''} onClick={() => setMode('image')}><ImageIcon size={16} /> Generate Image</button>
          </div>
          <div className="composer">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder={mode === 'image' ? 'Describe the image you want to generate' : 'Message Sameer GPT'}
              rows="1"
            />
            <button onClick={sendMessage} disabled={loading || !input.trim()}><Send size={18} /></button>
          </div>
          <small>{mode === 'image' ? 'Image generation powered by Sameer . Usage depends on your API allowance.' : 'Sameer GPT can make mistakes. Verify important information.'}</small>
        </div>
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
