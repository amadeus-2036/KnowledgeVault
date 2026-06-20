// src/pages/AskVault.jsx
// The RAG (Retrieval-Augmented Generation) interface.
// User asks a question → backend finds relevant notes/docs → Gemini answers grounded in that context.
import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { askVault } from '../api/ai.api';
import { MessageSquare, Send, Zap, User, FileText, Upload } from 'lucide-react';
import MarkdownRenderer from '../components/ui/MarkdownRenderer';

const MessageBubble = ({ role, content, sources }) => {
  const isUser = role === 'user';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: isUser ? 'flex-end' : 'flex-start' }}>
      {/* Sender label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 600 }}>
        {isUser ? <><User size={12} /> You</> : <><Zap size={12} style={{ color: 'var(--color-primary-light)' }} /> <span style={{ color: 'var(--color-primary-light)' }}>Knowledge Vault AI</span></>}
      </div>
      {/* Bubble */}
      <div
        style={{
          maxWidth: '80%',
          padding: '12px 16px',
          borderRadius: isUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
          background: isUser
            ? 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))'
            : 'var(--color-surface-3)',
          border: isUser ? 'none' : '1px solid var(--color-border)',
          fontSize: 14,
          color: 'var(--color-text-primary)',
        }}
      >
        {isUser ? (
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{content}</div>
        ) : (
          <MarkdownRenderer content={content} />
        )}
      </div>
      {/* Sources */}
      {sources?.length > 0 && (
        <div style={{ maxWidth: '80%', display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
          <span style={{ fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 600, alignSelf: 'center' }}>Sources:</span>
          {sources.map((s, i) => (
            <span
              key={i}
              style={{
                fontSize: 11, padding: '3px 8px', borderRadius: 99,
                background: 'var(--color-surface-3)', border: '1px solid var(--color-border)',
                color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              {s.type === 'document' ? <Upload size={10} /> : <FileText size={10} />}
              {s.title || s.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

import { getRepositories } from '../api/repositories.api';
import { useQuery } from '@tanstack/react-query';

export default function AskVault() {
  const { data: repositories = [] } = useQuery({
    queryKey: ['repositories'],
    queryFn: getRepositories,
  });
  const [selectedRepo, setSelectedRepo] = useState('');

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your Knowledge Vault AI. Ask me anything about your notes and documents — I'll find the relevant context and answer based on your own knowledge.",
      sources: [],
    },
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  const askMutation = useMutation({
    mutationFn: ({ question, repository }) => askVault({ question, repository }).then((r) => r.data.data),
    onSuccess: ({ answer, sources }) => {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: answer, sources },
      ]);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, something went wrong. Please try again.', sources: [] },
      ]);
    },
  });

  const handleSend = () => {
    if (!input.trim() || askMutation.isPending) return;
    const question = input.trim();
    setMessages((prev) => [...prev, { role: 'user', content: question, sources: [] }]);
    setInput('');
    askMutation.mutate({ question, repository: selectedRepo || undefined });
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, askMutation.isPending]);

  const exampleQuestions = [
    'What is binary search?',
    'Summarize my notes on React',
    'What algorithms did I study?',
    'Explain the main topics in my documents',
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '0' }}>
      {/* Header */}
      <div
        style={{
          padding: '24px 40px 20px',
          borderBottom: '1px solid var(--color-border)',
          background: 'var(--color-surface-1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div
            style={{
              width: 40, height: 40, borderRadius: 12,
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <MessageSquare size={20} color="var(--color-primary-content)" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em' }}>Ask My Vault</h1>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-secondary)' }}>
              RAG-powered Q&A grounded in your personal knowledge
            </p>
          </div>
          
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            <select
              value={selectedRepo}
              onChange={(e) => setSelectedRepo(e.target.value)}
              className="input"
              style={{ width: 200, padding: '6px 12px', height: 'auto', fontSize: 13 }}
            >
              <option value="">Global (All Vaults)</option>
              {repositories.map(repo => (
                <option key={repo._id} value={repo._id}>{repo.name}</option>
              ))}
            </select>

            <span
              style={{
                fontSize: 11, fontWeight: 700,
                background: 'var(--color-primary-glow)', border: '1px solid rgba(124,111,255,0.3)',
                color: 'var(--color-primary-light)', padding: '3px 10px', borderRadius: 99, textTransform: 'uppercase', letterSpacing: '0.05em',
              }}
            >
              Gemini AI
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 40px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {messages.map((msg, i) => (
          <MessageBubble key={i} {...msg} />
        ))}

        {/* Loading indicator */}
        {askMutation.isPending && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 34, height: 34, borderRadius: 10,
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}
            >
              <Zap size={16} color="var(--color-primary-content)" />
            </div>
            <div className="glass-card" style={{ padding: '12px 16px', display: 'flex', gap: 4 }}>
              {[0.1, 0.2, 0.3].map((d) => (
                <div
                  key={d}
                  style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: 'var(--color-primary-light)',
                    animation: `pulse 1.2s ${d}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Example Questions */}
      {messages.length === 1 && (
        <div style={{ padding: '0 40px 16px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {exampleQuestions.map((q) => (
            <button
              key={q}
              className="btn-ghost"
              style={{ fontSize: 13 }}
              onClick={() => { setInput(q); }}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div
        style={{
          padding: '16px 40px 24px',
          borderTop: '1px solid var(--color-border)',
          background: 'var(--color-surface-1)',
        }}
      >
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            id="ask-vault-input"
            className="input"
            style={{ flex: 1, height: 48, fontSize: 15 }}
            placeholder="Ask anything about your knowledge vault..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          />
          <button
            className="btn-primary"
            style={{ height: 48, padding: '0 20px' }}
            onClick={handleSend}
            disabled={askMutation.isPending || !input.trim()}
          >
            <Send size={18} />
          </button>
        </div>
        <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 8 }}>
          Answers are grounded in your notes and documents via Gemini AI + Vector Search
        </div>
      </div>
    </div>
  );
}
