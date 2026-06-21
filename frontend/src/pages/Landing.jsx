// src/pages/Landing.jsx
import { Link } from 'react-router-dom';
import { Search, Brain, Layers, Zap, ArrowRight, Globe, Library } from 'lucide-react';

export default function Landing() {
  return (
    <div style={{ background: 'var(--color-surface-0)', minHeight: '100vh', color: 'var(--color-text-primary)', fontFamily: 'var(--font-sans)' }}>
      {/* Navbar */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 48px',
        borderBottom: '1px solid var(--color-border)',
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(var(--color-surface-0-rgb), 0.8)', backdropFilter: 'blur(16px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'var(--color-text-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Library size={18} color="var(--color-surface-0)" />
          </div>
          <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em', fontFamily: 'var(--font-heading)' }}>
            Knowledge Vault
          </span>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Link to="/login" style={{ color: 'var(--color-text-secondary)', textDecoration: 'none', fontWeight: 500, fontSize: 14 }}>Log in</Link>
          <Link to="/register" className="btn-primary" style={{ padding: '8px 16px', fontSize: 14 }}>Sign up <ArrowRight size={14} /></Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={{ textAlign: 'center', padding: '140px 24px 100px', maxWidth: 860, margin: '0 auto' }}>
        <h1 style={{
          fontSize: 'clamp(48px, 7vw, 76px)', fontWeight: 800, lineHeight: 1.05,
          letterSpacing: '-0.04em', margin: '0 0 24px', fontFamily: 'var(--font-heading)'
        }}>
          Your external brain, <br/>
          <span style={{ color: 'var(--color-text-muted)' }}>powered by AI.</span>
        </h1>
        
        <p style={{
          fontSize: 20, color: 'var(--color-text-secondary)', lineHeight: 1.6,
          margin: '0 auto 48px', maxWidth: 600, fontWeight: 400
        }}>
          Capture articles, PDFs, YouTube videos, and notes instantly. Search by meaning and chat with your personal knowledge base.
        </p>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', alignItems: 'center' }}>
          <Link to="/register" className="btn-primary" style={{ fontSize: 16, padding: '14px 28px', height: 50 }}>
            Get Started <ArrowRight size={16} />
          </Link>
          <a href="#how-it-works" className="btn-ghost" style={{ fontSize: 16, padding: '14px 28px', height: 50 }}>
            How it works
          </a>
        </div>
      </div>

      {/* Divider */}
      <div style={{ maxWidth: 1000, margin: '0 auto', height: 1, background: 'var(--color-border)' }} />

      {/* Features Grid */}
      <div id="how-it-works" style={{ maxWidth: 1200, margin: '0 auto', padding: '120px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 80 }}>
          <h2 style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.03em', margin: '0 0 16px', fontFamily: 'var(--font-heading)' }}>
            A new standard for knowledge
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 18, maxWidth: 500, margin: '0 auto' }}>
            Built for productivity. Designed to stay out of your way.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          
          <div className="glass-card" style={{ padding: 40, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Globe size={28} color="var(--color-text-primary)" />
            <h3 style={{ fontSize: 20, fontWeight: 600, margin: 0, fontFamily: 'var(--font-heading)' }}>Frictionless Capture</h3>
            <p style={{ fontSize: 15, color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.6 }}>
              Save any webpage, YouTube video, or GitHub repo instantly using the Chrome Extension. No context switching.
            </p>
          </div>

          <div className="glass-card" style={{ padding: 40, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Search size={28} color="var(--color-text-primary)" />
            <h3 style={{ fontSize: 20, fontWeight: 600, margin: 0, fontFamily: 'var(--font-heading)' }}>Semantic Search</h3>
            <p style={{ fontSize: 15, color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.6 }}>
              Find what you're looking for by meaning, not just exact keywords. Powered by Gemini text embeddings.
            </p>
          </div>

          <div className="glass-card" style={{ padding: 40, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Brain size={28} color="var(--color-text-primary)" />
            <h3 style={{ fontSize: 20, fontWeight: 600, margin: 0, fontFamily: 'var(--font-heading)' }}>Repository Chat</h3>
            <p style={{ fontSize: 15, color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.6 }}>
              Have a conversation with your own knowledge. Ask questions and get answers grounded strictly in your saved resources.
            </p>
          </div>

          <div className="glass-card" style={{ padding: 40, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Layers size={28} color="var(--color-text-primary)" />
            <h3 style={{ fontSize: 20, fontWeight: 600, margin: 0, fontFamily: 'var(--font-heading)' }}>Contextual Repositories</h3>
            <p style={{ fontSize: 15, color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.6 }}>
              Organize your knowledge into focused repositories. Keep your side-projects, research, and personal notes perfectly isolated.
            </p>
          </div>

        </div>
      </div>

      {/* CTA Section */}
      <div style={{ background: 'var(--color-surface-1)', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '120px 24px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 24px', fontFamily: 'var(--font-heading)' }}>
            Start building your vault.
          </h2>
          <Link to="/register" className="btn-primary" style={{ fontSize: 16, padding: '14px 32px' }}>
            Create an account <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ 
        padding: '32px 48px', 
        borderTop: '1px solid var(--color-border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        color: 'var(--color-text-muted)', fontSize: 13
      }}>
        <div>© 2026 Knowledge Vault AI</div>
        <div style={{ display: 'flex', gap: 16 }}>
          <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Twitter</a>
          <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>GitHub</a>
        </div>
      </footer>
    </div>
  );
}
