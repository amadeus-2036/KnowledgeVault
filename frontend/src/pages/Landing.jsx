// src/pages/Landing.jsx
import { Link } from 'react-router-dom';
import { Zap, Search, MessageSquare, FileText, ArrowRight, Star, Shield, Brain } from 'lucide-react';

const features = [
  { icon: FileText,      title: 'Smart Notes',        desc: 'Create and organize notes with AI-generated summaries and auto-tagging.' },
  { icon: Search,        title: 'Semantic Search',     desc: 'Find information by meaning, not just keywords. Vector-powered similarity search.' },
  { icon: MessageSquare, title: 'Ask My Vault',        desc: 'Ask questions in plain English. Get answers grounded in your own knowledge.' },
  { icon: Brain,         title: 'Knowledge Insights',  desc: 'Discover patterns in what you study and get personalized learning recommendations.' },
  { icon: Shield,        title: 'Secure & Private',    desc: 'Your data is yours. JWT-protected, user-scoped — only you can access your vault.' },
  { icon: Star,          title: 'Document Upload',     desc: 'Upload PDFs and text files. AI extracts, summarizes, and indexes them automatically.' },
];

export default function Landing() {
  return (
    <div style={{ background: 'var(--color-surface-0)', minHeight: '100vh', color: 'var(--color-text-primary)' }}>
      {/* Navbar */}
      <nav
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 48px',
          borderBottom: '1px solid var(--color-border)',
          position: 'sticky', top: 0, zIndex: 10,
          background: 'rgba(10,10,15,0.8)', backdropFilter: 'blur(12px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Zap size={20} color="var(--color-primary-content)" fill="var(--color-primary-content)" />
          </div>
          <span style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em' }}>Knowledge Vault AI</span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link to="/login" className="btn-ghost">Login</Link>
          <Link to="/register" className="btn-primary">Get Started <ArrowRight size={15} /></Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '100px 24px 80px', maxWidth: 780, margin: '0 auto' }}>
        {/* Badge */}
        <div
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 14px', borderRadius: 99,
            background: 'var(--color-primary-glow)',
            border: '1px solid rgba(124,111,255,0.3)',
            fontSize: 12, fontWeight: 600, color: 'var(--color-primary-light)',
            marginBottom: 28, textTransform: 'uppercase', letterSpacing: '0.06em',
          }}
        >
          <Zap size={12} /> Powered by Gemini AI
        </div>

        <h1
          style={{
            fontSize: 'clamp(40px, 6vw, 64px)', fontWeight: 800, lineHeight: 1.1,
            letterSpacing: '-0.03em', margin: '0 0 22px',
          }}
        >
          Your personal{' '}
          <span className="gradient-text">AI knowledge</span>
          <br />base, reimagined
        </h1>

        <p
          style={{
            fontSize: 18, color: 'var(--color-text-secondary)', lineHeight: 1.7,
            margin: '0 auto 40px', maxWidth: 560,
          }}
        >
          Store notes, upload documents, search semantically, and ask questions
          over your entire knowledge base — all powered by Gemini AI.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" className="btn-primary" style={{ fontSize: 15, padding: '13px 28px' }}>
            Start for free <ArrowRight size={17} />
          </Link>
          <Link to="/login" className="btn-ghost" style={{ fontSize: 15, padding: '13px 28px' }}>
            Sign in
          </Link>
        </div>
      </div>

      {/* Gradient divider */}
      <div style={{ width: '100%', height: 1, background: 'linear-gradient(90deg, transparent, var(--color-border-strong), transparent)' }} />

      {/* Features */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 24px' }}>
        <h2 style={{ textAlign: 'center', fontSize: 36, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 12 }}>
          Everything you need to think better
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--color-text-secondary)', marginBottom: 56, fontSize: 16 }}>
          A full-stack MERN application with Gemini AI, vector search, and beautiful UI.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="glass-card" style={{ padding: 24 }}>
              <div
                style={{
                  width: 44, height: 44, borderRadius: 12, marginBottom: 14,
                  background: 'var(--color-primary-glow)',
                  border: '1px solid rgba(124,111,255,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--color-primary-light)',
                }}
              >
                <Icon size={20} />
              </div>
              <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700 }}>{title}</h3>
              <p style={{ margin: 0, fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div
        style={{
          textAlign: 'center', padding: '80px 24px',
          borderTop: '1px solid var(--color-border)',
          background: 'radial-gradient(ellipse at center, var(--color-primary-glow) 0%, transparent 70%)',
        }}
      >
        <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 14 }}>
          Ready to build your vault?
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 32, fontSize: 16 }}>
          Join and start organizing your knowledge with the power of AI.
        </p>
        <Link to="/register" className="btn-primary" style={{ fontSize: 16, padding: '14px 32px' }}>
          Get started free <ArrowRight size={18} />
        </Link>
      </div>

      {/* Footer */}
      <div
        style={{
          textAlign: 'center', padding: '24px', fontSize: 13,
          color: 'var(--color-text-muted)',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        Built with React · Node.js · MongoDB Atlas · Gemini AI
      </div>
    </div>
  );
}
