'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, BarChart, Cpu, Users, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  return (
    <div style={{ backgroundColor: '#0b0f19', color: '#f1f5f9', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* Animated Background Mesh */}
      <div style={{
        position: 'fixed', top: '-50%', left: '-50%', width: '200%', height: '200%',
        background: 'radial-gradient(circle at 15% 50%, rgba(79, 70, 229, 0.15), transparent 25%), radial-gradient(circle at 85% 30%, rgba(16, 185, 129, 0.1), transparent 25%)',
        zIndex: 0, pointerEvents: 'none', animation: 'spin 60s linear infinite'
      }} />

      {/* Navigation */}
      <nav style={{
        position: 'fixed', top: 0, width: '100%', zIndex: 50, transition: 'all 0.3s ease',
        padding: scrolled ? '1rem 5%' : '1.5rem 5%',
        background: scrolled ? 'rgba(11, 15, 25, 0.8)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : '1px solid transparent',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #4f46e5, #ec4899)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck size={20} color="#fff" />
          </div>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.5px', color: '#fff' }}>Ubiquitous<span style={{ color: '#4f46e5' }}>.</span></span>
        </div>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <div style={{ display: 'none', gap: '2rem' }} className="nav-links-desktop">
            <a href="#features" style={{ color: '#94a3b8', fontSize: '0.95rem', fontWeight: 500, transition: 'color 0.2s' }}>Features</a>
            <a href="#solutions" style={{ color: '#94a3b8', fontSize: '0.95rem', fontWeight: 500, transition: 'color 0.2s' }}>Solutions</a>
            <a href="#testimonials" style={{ color: '#94a3b8', fontSize: '0.95rem', fontWeight: 500, transition: 'color 0.2s' }}>Testimonials</a>
          </div>
          <Link href="/login" style={{
            background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '0.6rem 1.5rem', borderRadius: '30px', fontWeight: 600,
            border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', transition: 'all 0.3s'
          }} className="login-btn-hover">
            Sign In
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '120px 5% 5rem', overflow: 'hidden' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} style={{ marginBottom: '1.5rem', background: 'rgba(79, 70, 229, 0.1)', border: '1px solid rgba(79, 70, 229, 0.3)', padding: '0.5rem 1rem', borderRadius: '30px', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#818cf8', fontSize: '0.85rem', fontWeight: 600 }}>
            <span style={{ width: 8, height: 8, background: '#4f46e5', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 10px #4f46e5' }}></span>
            V2.0 is now live: Dribbble-inspired UI Dashboard
          </motion.div>

          <motion.h1
            initial="hidden" animate="visible" variants={fadeIn}
            style={{ fontSize: 'clamp(3rem, 6vw, 5.5rem)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-2px', marginBottom: '1.5rem', maxWidth: '900px' }}
          >
            The Operating System for <br />
            <span style={{ background: 'linear-gradient(to right, #818cf8, #c084fc, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Modern Campuses.
            </span>
          </motion.h1>

          <motion.p
            initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.1 }}
            style={{ fontSize: '1.2rem', color: '#94a3b8', maxWidth: '600px', marginBottom: '3rem', lineHeight: 1.6 }}
          >
            Ubiquitous integrates AI-driven early warning systems, gamified leaderboards, and ultra-fast real-time synchronization to completely eliminate manual attendance friction.
          </motion.p>

          <motion.div initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.2 }} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/login" style={{
              background: '#4f46e5', color: '#fff', padding: '1rem 2.5rem', borderRadius: '30px', fontWeight: 600, fontSize: '1.1rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 10px 25px rgba(79, 70, 229, 0.4)', transition: 'all 0.3s'
            }} className="btn-glow">
              Launch Portal <ArrowRight size={20} />
            </Link>
            <button style={{
              background: 'rgba(255,255,255,0.05)', color: '#fff', padding: '1rem 2.5rem', borderRadius: '30px', fontWeight: 600, fontSize: '1.1rem',
              border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', transition: 'all 0.3s'
            }} className="btn-outline-hover">
              View Analytics Demo
            </button>
          </motion.div>

          {/* Floating Dashboard Preview Concept */}
          <motion.div
            initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4, type: 'spring' }}
            style={{ marginTop: '5rem', width: '100%', maxWidth: '1000px', position: 'relative', zIndex: 2 }}
          >
            <div style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5), 0 0 100px rgba(79, 70, 229, 0.2)' }}>
              {/* Simulated App Topbar */}
              <div style={{ height: '40px', background: '#1e293b', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', padding: '0 1rem', gap: '0.5rem' }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }}></div>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#f59e0b' }}></div>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#10b981' }}></div>
              </div>
              {/* Simulated App Content */}
              <div style={{ background: '#0f172a', padding: '2rem', display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '2rem', height: '400px' }}>
                <div style={{ background: '#1e293b', borderRadius: '12px', padding: '1rem' }}>
                  <div style={{ width: '100%', height: 20, background: 'rgba(255,255,255,0.05)', borderRadius: 4, marginBottom: '1rem' }}></div>
                  <div style={{ width: '80%', height: 20, background: 'rgba(255,255,255,0.05)', borderRadius: 4, marginBottom: '1rem' }}></div>
                  <div style={{ width: '90%', height: 20, background: 'rgba(255,255,255,0.05)', borderRadius: 4, marginBottom: '1rem' }}></div>
                </div>
                <div style={{ display: 'grid', gridTemplateRows: '1fr 2fr', gap: '1.5rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <div style={{ background: 'linear-gradient(135deg, rgba(79,70,229,0.2), transparent)', border: '1px solid rgba(79,70,229,0.3)', borderRadius: '12px', padding: '1rem' }}></div>
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1rem' }}></div>
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1rem' }}></div>
                  </div>
                  <div style={{ background: '#1e293b', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}></div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <motion.div animate={{ y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} style={{ position: 'absolute', top: '20%', left: '-5%', background: 'rgba(16, 185, 129, 0.2)', backdropFilter: 'blur(10px)', padding: '1rem', borderRadius: '16px', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', gap: '0.8rem', zIndex: 10 }}>
              <CheckCircle2 color="#10b981" />
              <div>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Real-time update</p>
                <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>+45 check-ins</p>
              </div>
            </motion.div>

            <motion.div animate={{ y: [0, 15, 0] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }} style={{ position: 'absolute', bottom: '15%', right: '-8%', background: 'rgba(239, 68, 68, 0.1)', backdropFilter: 'blur(10px)', padding: '1rem', borderRadius: '16px', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', alignItems: 'center', gap: '0.8rem', zIndex: 10 }}>
              <div style={{ background: '#ef4444', padding: '0.5rem', borderRadius: '8px' }}><AlertTriangle size={16} color="#fff" /></div>
              <div>
                <p style={{ fontSize: '0.8rem', color: '#ef4444' }}>AI Alert: Low Auth Risk</p>
                <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>Student drops <br /> below 75%</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Grid of Features Section */}
      <section id="features" style={{ padding: '8rem 5%', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, marginBottom: '1rem' }}>Architected for Control.</h2>
            <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>Ditch the spreadsheets. Our enterprise-grade architecture gives you total visibility into student consistency and high-level analytics.</p>
          </div>

          <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>

            {/* Feature 1 */}
            <motion.div variants={fadeIn} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '2.5rem', transition: 'all 0.3s' }} className="feature-card">
              <div style={{ width: 50, height: 50, borderRadius: '14px', background: 'rgba(79, 70, 229, 0.1)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', border: '1px solid rgba(79, 70, 229, 0.2)' }}>
                <BarChart size={24} />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem' }}>Recharts Analytics Edge</h3>
              <p style={{ color: '#94a3b8', lineHeight: 1.6, fontSize: '0.95rem' }}>Visualize attendance curves instantly. Spot negative trends via multi-dimension heatmaps and department-wise Area trend graphs.</p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div variants={fadeIn} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '2.5rem', transition: 'all 0.3s' }} className="feature-card">
              <div style={{ width: 50, height: 50, borderRadius: '14px', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <Cpu size={24} />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem' }}>AI Early Risk Warning</h3>
              <p style={{ color: '#94a3b8', lineHeight: 1.6, fontSize: '0.95rem' }}>Automated algorithms predict student drop-out risks. Dashboards proactively flag students that are pacing toward &lt; 75% thresholds.</p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div variants={fadeIn} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '2.5rem', transition: 'all 0.3s' }} className="feature-card">
              <div style={{ width: 50, height: 50, borderRadius: '14px', background: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                <Users size={24} />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem' }}>Gamified Leaderboards</h3>
              <p style={{ color: '#94a3b8', lineHeight: 1.6, fontSize: '0.95rem' }}>Drive student engagement with built-in gamification. Custom Top-3 Podiums, Gold/Silver/Bronze badges, and consistent achievement tags.</p>
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* Global CTA */}
      <section style={{ padding: '5rem 5%', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', background: 'linear-gradient(135deg, #1e1b4b, #312e81)', borderRadius: '32px', padding: '4rem 2rem', textAlign: 'center', border: '1px solid rgba(79, 70, 229, 0.3)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)', overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'url(/bg.png)', backgroundSize: 'cover', opacity: 0.1, mixBlendMode: 'overlay' }}></div>
          <h2 style={{ fontSize: 'clamp(2rem, 3.5vw, 2.5rem)', fontWeight: 800, color: '#fff', marginBottom: '1.5rem', position: 'relative', zIndex: 2 }}>Ready to transform your campus?</h2>
          <p style={{ color: '#a5b4fc', fontSize: '1.1rem', marginBottom: '2.5rem', maxWidth: '500px', margin: '0 auto 2.5rem', position: 'relative', zIndex: 2 }}>Join the world&apos;s most elite universities powered by the Ubiquitous Engine.</p>
          <Link href="/login" style={{
            background: '#fff', color: '#1e1b4b', padding: '1.2rem 3rem', borderRadius: '30px', fontWeight: 800, fontSize: '1.1rem',
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.3s', position: 'relative', zIndex: 2
          }} className="btn-solid-hover">
            Get Secure Access <ChevronRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '3rem 5% 2rem', marginTop: '4rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={24} color="#4f46e5" />
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>Ubiquitous<span style={{ color: '#4f46e5' }}>.</span></span>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>© 2026 Ubiquitous Engine Architecture. All rights reserved.</p>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{
        __html: `
         @keyframes spin { 100% { transform: rotate(360deg); } }
         .login-btn-hover:hover { background: rgba(255,255,255,0.2) !important; transform: translateY(-2px); }
         .btn-glow:hover { box-shadow: 0 15px 35px rgba(79, 70, 229, 0.6) !important; transform: translateY(-2px); }
         .btn-outline-hover:hover { background: rgba(255,255,255,0.1) !important; }
         .feature-card:hover { transform: translateY(-5px); border-color: rgba(79, 70, 229, 0.3) !important; background: rgba(255,255,255,0.04) !important; }
         .btn-solid-hover:hover { transform: translateY(-2px) scale(1.05); box-shadow: 0 10px 20px rgba(0,0,0,0.3); }

         @media (min-width: 768px) {
            .nav-links-desktop { display: flex !important; }
         }
      `}} />
    </div>
  );
}

// Ensure lucide icon works correctly
import { AlertTriangle } from 'lucide-react';
