import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  // Language cycling for chat mockup
  const languages = [
    { code: 'hi', text: 'मेरा ऑर्डर कहाँ है?', name: 'Hindi' },
    { code: 'bn', text: 'আমার অর্ডার কোথায়?', name: 'Bengali' },
    { code: 'ta', text: 'என் ஆர்டர் எங்கே?', name: 'Tamil' },
    { code: 'es', text: '¿Dónde está mi pedido?', name: 'Spanish' },
    { code: 'ar', text: 'أين طلبي؟', name: 'Arabic' },
    { code: 'zh', text: '我的订单在哪里？', name: 'Chinese' },
    { code: 'en', text: 'Where is my order?', name: 'English' }
  ];

  const [currentLangIndex, setCurrentLangIndex] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLangIndex((prev) => (prev + 1) % languages.length);
    }, 2500); // Change language every 2.5 seconds

    return () => clearInterval(interval);
  }, []);

  // Show/hide scroll to top button
  useEffect(() => {
    const handleScroll = (e) => {
      const scrollTop = e.target.scrollTop;
      setShowScrollTop(scrollTop > 300);
    };

    const landingPage = document.querySelector('.landing-page');
    if (landingPage) {
      landingPage.addEventListener('scroll', handleScroll);
      return () => landingPage.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const scrollToTop = () => {
    const landingPage = document.querySelector('.landing-page');
    if (landingPage) {
      landingPage.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-container">
          <div className="nav-logo" onClick={scrollToTop}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span>BabelBridge</span>
          </div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How it Works</a>
            <a href="#pricing">Pricing</a>
            <button className="nav-btn-primary" onClick={() => navigate('/dashboard')}>
              Agent Dashboard
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Break Language Barriers.
              <br />
              <span className="gradient-text">Connect Globally.</span>
            </h1>
            <p className="hero-subtitle">
              Multilingual customer support chat powered by real-time translation.
              Support customers in 7+ languages without hiring multilingual agents.
            </p>
            <div className="hero-buttons">
              <button className="btn-primary" onClick={() => navigate('/dashboard')}>
                Get Started Free
              </button>
              <button className="btn-secondary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Watch Demo
              </button>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">7+</span>
                <span className="stat-label">Languages</span>
              </div>
              <div className="stat">
                <span className="stat-number">Real-time</span>
                <span className="stat-label">Translation</span>
              </div>
              <div className="stat">
                <span className="stat-number">100%</span>
                <span className="stat-label">Accuracy</span>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="chat-mockup">
              <div className="chat-header">
                <div className="chat-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span className="chat-title">Customer Support</span>
              </div>
              <div className="chat-messages">
                <div className="chat-msg user" key={currentLangIndex}>
                  <p>{languages[currentLangIndex].text}</p>
                  <span className="lang-badge">{languages[currentLangIndex].name}</span>
                </div>
                <div className="chat-msg agent">
                  <p>Where is my order?</p>
                  <span className="lang-badge">English (Agent)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="section-container">
          <h2 className="section-title">Why BabelBridge?</h2>
          <p className="section-subtitle">Everything you need for multilingual customer support</p>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <h3>7+ Languages Supported</h3>
              <p>English, Hindi, Bengali, Tamil, Spanish, Arabic, Chinese and counting.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <h3>Real-time Translation</h3>
              <p>Instant message translation with multiple fallback layers for reliability.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h3>24/7 Support</h3>
              <p>Never miss a customer. Always-on chat widget on your website.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="9" y1="3" x2="9" y2="21" />
                </svg>
              </div>
              <h3>Easy Integration</h3>
              <p>One line of code. Embed the widget anywhere in minutes.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M18 20V10M12 20V4M6 20v-6" />
                </svg>
              </div>
              <h3>Analytics Dashboard</h3>
              <p>Track sessions, response times, and customer satisfaction.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h3>Secure & Private</h3>
              <p>End-to-end encryption. Your customer data stays safe.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="how-it-works">
        <div className="section-container">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">Get started in 3 simple steps</p>

          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Embed Widget</h3>
              <p>Copy one line of code and paste it in your website.</p>
              <div className="code-preview">
                <code>{'<script src="babelbridge.js"></script>'}</code>
              </div>
            </div>

            <div className="step">
              <div className="step-number">2</div>
              <h3>Customers Chat</h3>
              <p>Users chat in their native language. Messages auto-translate.</p>
            </div>

            <div className="step">
              <div className="step-number">3</div>
              <h3>You Respond</h3>
              <p>Reply in English. Customers receive it in their language.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="pricing">
        <div className="section-container">
          <h2 className="section-title">Simple Pricing</h2>
          <p className="section-subtitle">Choose the plan that fits your needs</p>

          <div className="pricing-grid">
            <div className="pricing-card">
              <h3>Free</h3>
              <div className="price">
                <span className="amount">$0</span>
                <span className="period">/month</span>
              </div>
              <ul className="features-list">
                <li>✓ 100 sessions/month</li>
                <li>✓ 7 languages</li>
                <li>✓ Basic analytics</li>
                <li>✓ Email support</li>
              </ul>
              <button className="btn-outline">Get Started</button>
            </div>

            <div className="pricing-card featured">
              <div className="popular-badge">Popular</div>
              <h3>Pro</h3>
              <div className="price">
                <span className="amount">$29</span>
                <span className="period">/month</span>
              </div>
              <ul className="features-list">
                <li>✓ Unlimited sessions</li>
                <li>✓ All languages</li>
                <li>✓ Advanced analytics</li>
                <li>✓ Priority support</li>
                <li>✓ Custom branding</li>
                <li>✓ API access</li>
              </ul>
              <button className="btn-primary">Start Free Trial</button>
            </div>

            <div className="pricing-card">
              <h3>Enterprise</h3>
              <div className="price">
                <span className="amount">Custom</span>
              </div>
              <ul className="features-list">
                <li>✓ Everything in Pro</li>
                <li>✓ Dedicated support</li>
                <li>✓ SLA guarantee</li>
                <li>✓ On-premise option</li>
                <li>✓ Custom integrations</li>
              </ul>
              <button className="btn-outline">Contact Sales</button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="cta-container">
          <h2>Ready to break language barriers?</h2>
          <p>Start supporting customers in their language today.</p>
          <button className="btn-primary" onClick={() => navigate('/dashboard')}>
            Get Started Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-brand">
            <div className="footer-logo" onClick={scrollToTop}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span>BabelBridge</span>
            </div>
            <p>Breaking language barriers, one conversation at a time.</p>
          </div>

          <div className="footer-links">
            <div className="footer-col">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <a href="#how-it-works">How it Works</a>
            </div>

            <div className="footer-col">
              <h4>Company</h4>
              <a href="#">About</a>
              <a href="#">Blog</a>
              <a href="#">Careers</a>
            </div>

            <div className="footer-col">
              <h4>Support</h4>
              <a href="#">Help Center</a>
              <a href="#">Contact</a>
              <a href="/dashboard">Dashboard</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2024 BabelBridge. All rights reserved.</p>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button className="scroll-to-top" onClick={scrollToTop} aria-label="Scroll to top">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M18 15l-6-6-6 6" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default LandingPage;
