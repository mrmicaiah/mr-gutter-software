import { useState, useRef, useEffect } from 'react';
import api from '../utils/api';

const SendIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>);
const XIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>);
const SparklesIcon = () => (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/><path d="M5 19l1 3 1-3 3-1-3-1-1-3-1 3-3 1 3 1z"/><path d="M19 12l1 2 1-2 2-1-2-1-1-2-1 2-2 1 2 1z"/></svg>);

const ALICE_AVATAR = 'https://res.cloudinary.com/dxzw1zwez/image/upload/w_80,h_80,c_fill,g_face/v1772644026/alice_profile_kpamkm.jpg';

export default function Alice({ estimates = [], jobs = [], goals = null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const buildSystemPrompt = () => {
    const activeEstimates = estimates.filter(e => e.stage !== 'sold');
    const pipelineTotal = activeEstimates.reduce((s, e) => s + (e.estimate_amount || 0), 0);
    
    // Calculate temperature counts
    const now = new Date();
    const temps = { hot: 0, warm: 0, cold: 0 };
    activeEstimates.forEach(e => {
      if (!e.created_at) return;
      const days = Math.floor((now - new Date(e.created_at)) / (1000 * 60 * 60 * 24));
      if (days <= 7) temps.hot++;
      else if (days <= 21) temps.warm++;
      else temps.cold++;
    });

    const estimatesList = activeEstimates.slice(0, 15).map(e => 
      `[${e.id}] ${e.client_name} - ${e.zipcode} - $${e.estimate_amount || 0} - ${e.stage}`
    ).join('\n') || 'None';

    const recentJobs = jobs.slice(0, 10).map(j => 
      `[${j.id}] ${j.client_name} - $${j.full_price} - ${j.job_date}`
    ).join('\n') || 'None';

    const yearlyGoal = goals?.yearly_target || 300000;

    return `You are Alice, the AI assistant for Mr Gutter Production Tracker. You help Denny manage his gutter installation business.

CURRENT STATE:

PIPELINE: $${pipelineTotal.toLocaleString()} total (${activeEstimates.length} estimates)
- Hot (under 1 week): ${temps.hot}
- Warm (1-3 weeks): ${temps.warm}  
- Cold (3+ weeks): ${temps.cold}

ACTIVE ESTIMATES:
${estimatesList}

RECENT JOBS (${jobs.length} total):
${recentJobs}

YEARLY GOAL: $${yearlyGoal.toLocaleString()}

CAPABILITIES:
- Add new estimates/leads to the pipeline
- Move estimates between stages (waiting, estimated, follow_up_1, follow_up_2, follow_up_3, sold)
- Update estimate amounts
- Create completed job records
- Search for estimates by client name
- Provide pipeline summaries and insights

PERSONALITY & GUARDRAILS:
- Be warm but efficient. You're a secretary, not a therapist.
- Keep responses to 1-3 sentences unless explaining something complex.
- Don't ask "Is there anything else?" or "How can I help?" - just wait.
- Don't over-explain what you did. "Done." or "Added." is often enough.
- Don't repeat back information the user just gave you.
- No small talk unless the user initiates it.
- If asked about yourself, keep it brief and redirect to work.
- Never use emojis in your responses.
- When you take an action, confirm briefly: "Added to pipeline." not "I've successfully added that lead to your pipeline for you!"
- If something is unclear, ask ONE clarifying question, not multiple.
- When referring to estimates, use the client name, not the ID.
- Don't make up data - only reference what's in the current state above.
- If you can't do something, say so briefly and suggest an alternative.
- Stay focused on Mr Gutter business operations only.`;
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await api.askAlice({
        system: buildSystemPrompt(),
        messages: [...messages, { role: 'user', content: userMessage }].map(m => ({
          role: m.role,
          content: m.content
        }))
      });

      // Extract text from response
      const assistantText = response.content
        ?.filter(block => block.type === 'text')
        .map(block => block.text)
        .join('\n') || 'Sorry, I had trouble processing that.';

      setMessages(prev => [...prev, { role: 'assistant', content: assistantText }]);
    } catch (err) {
      console.error('Alice error:', err);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I ran into an issue. Please try again.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Collapsed Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed left-6 top-1/2 -translate-y-1/2 z-50 w-14 h-14 rounded-full overflow-hidden transition-all hover:scale-110"
          style={{ 
            border: '3px solid var(--blue)',
            boxShadow: '0 0 20px var(--blue-glow), 0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          <img src={ALICE_AVATAR} alt="Alice" className="w-full h-full object-cover" />
        </button>
      )}

      {/* Expanded Panel */}
      {isOpen && (
        <div 
          className="fixed left-6 top-6 bottom-6 z-50 flex flex-col rounded-2xl overflow-hidden"
          style={{ 
            width: '340px',
            background: 'var(--bg-card)',
            border: '2px solid var(--blue)',
            boxShadow: '0 0 30px var(--blue-glow), 0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          {/* Header */}
          <div 
            className="flex items-center justify-between p-4"
            style={{ 
              background: 'linear-gradient(135deg, var(--blue) 0%, var(--blue-dark) 100%)',
            }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden" style={{ border: '2px solid white' }}>
                <img src={ALICE_AVATAR} alt="Alice" className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="font-display font-bold text-white tracking-wide">Alice</h3>
                <p className="text-xs text-white/70">AI Assistant</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg transition-colors hover:bg-white/20"
              style={{ color: 'white' }}
            >
              <XIcon />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ background: 'var(--bg-secondary)' }}>
            {messages.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--blue-light)', color: 'var(--blue)' }}>
                  <SparklesIcon />
                </div>
                <p className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Hey, I'm Alice.</p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  Add leads, check your pipeline, or ask me anything about the business.
                </p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div 
                key={i} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className="max-w-[85%] p-3 rounded-xl text-sm"
                  style={{
                    background: msg.role === 'user' ? 'var(--blue)' : 'var(--bg-card)',
                    color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                    border: msg.role === 'user' ? 'none' : '1px solid var(--border-primary)',
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div 
                  className="p-3 rounded-xl"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}
                >
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--blue)', animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--blue)', animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--blue)', animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4" style={{ borderTop: '1px solid var(--border-primary)', background: 'var(--bg-card)' }}>
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Alice..."
                className="flex-1 px-4 py-2.5 rounded-xl text-sm"
                style={{ 
                  background: 'var(--bg-tertiary)', 
                  border: '1px solid var(--border-primary)',
                  color: 'var(--text-primary)',
                }}
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="px-4 py-2.5 rounded-xl font-semibold transition-all"
                style={{ 
                  background: loading || !input.trim() ? 'var(--bg-tertiary)' : 'var(--blue)',
                  color: loading || !input.trim() ? 'var(--text-muted)' : 'white',
                }}
              >
                <SendIcon />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
