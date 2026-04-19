/**
 * LandingPage.jsx
 *
 * Public-facing product landing experience for TrueLens AI.
 * Holds marketing sections, hero interactions, and primary CTA into detection flow.
 *
 * Owner: Team Lead (Ayush)
 * Version: 1.0.0
 *
 * Team review checklist:
 * - keep visual effects optional and non-blocking on slower devices
 * - maintain clear CTA path to /detect
 * - avoid mixing upload/business validation logic into this page
 */
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, Upload, Play, Check, 
  Video, AudioLines, FileImage, ScanLine, Sparkles
} from 'lucide-react';
import { motion as Motion } from 'framer-motion';
import Lottie from 'lottie-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import logo from '../assets/Logo tab.png';
import videoImg from '../assets/VIDEO-IMG.png';
import imageImg from '../assets/IMAGE-IMG.png';
import audioImg from '../assets/AUDIO-IMG.png';

const scanningLottie = {"v":"5.5.2","fr":60,"ip":0,"op":60,"w":100,"h":100,"nm":"SCAN","ddd":0,"assets":[],"layers":[{"ddd":0,"ind":1,"ty":4,"nm":"Line","sr":1,"ks":{"o":{"a":1,"k":[{"i":{"x":[0.833],"y":[0.833]},"o":{"x":[0.167],"y":[0.167]},"t":0,"s":[0]},{"i":{"x":[0.833],"y":[0.833]},"o":{"x":[0.167],"y":[0.167]},"t":30,"s":[100]},{"t":60,"s":[0]}]},"r":{"a":0,"k":0,"ix":6},"p":{"a":1,"k":[{"i":{"x":0.833,"y":0.833},"o":{"x":0.167,"y":0.167},"t":0,"s":[50,0,0],"to":[0,20,0],"ti":[0,0,0]},{"i":{"x":0.833,"y":0.833},"o":{"x":0.167,"y":0.167},"t":30,"s":[50,100,0],"to":[0,0,0],"ti":[0,20,0]},{"t":60,"s":[50,0,0]}],"ix":2,"l":2},"a":{"a":0,"k":[0,0,0],"ix":1,"l":2},"s":{"a":0,"k":[100,100,100],"ix":6,"l":2}},"ao":0,"shapes":[{"ty":"gr","it":[{"d":1,"ty":"el","s":{"a":0,"k":[100,2],"ix":2},"p":{"a":0,"k":[0,0],"ix":3},"nm":"Ellipse Path 1","mn":"ADBE Vector Shape - Ellipse","hd":false},{"ty":"fl","c":{"a":0,"k":[1,1,1,1],"ix":4},"o":{"a":0,"k":100,"ix":5},"r":1,"bm":0,"nm":"Fill 1","mn":"ADBE Vector Graphic - Fill","hd":false},{"ty":"tr","p":{"a":0,"k":[0,0],"ix":2},"a":{"a":0,"k":[0,0],"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"r":{"a":0,"k":0,"ix":6},"o":{"a":0,"k":100,"ix":7},"sk":{"a":0,"k":0,"ix":4},"sa":{"a":0,"k":0,"ix":5},"nm":"Transform"}],"nm":"Ellipse 1","np":3,"cix":2,"bm":0,"ix":1,"mn":"ADBE Vector Group","hd":false}],"ip":0,"op":60,"st":0,"bm":0}]};

const VantaDotsBackground = () => {
  const vantaRef = useRef(null);
  const vantaEffect = useRef(null);

  useEffect(() => {
    import('three').then((THREE) => {
      window.THREE = THREE;
      import('vanta/dist/vanta.dots.min').then((VANTA) => {
        if (!vantaEffect.current && vantaRef.current) {
          vantaEffect.current = VANTA.default({
            el: vantaRef.current,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            scale: 1.00,
            scaleMobile: 1.00,
            color: 0x38bdf8,
            color2: 0x818cf8,
            backgroundColor: 0x050B14,
            size: 3.00,
            spacing: 35.00,
            showLines: true,
          });
        }
      });
    });
    return () => {
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
        vantaEffect.current = null;
      }
    };
  }, []);

  return <div ref={vantaRef} className="absolute inset-0" style={{ zIndex: 0 }} />;
};

export default function LandingPage() {
  const navigate = useNavigate();
  const [isHovering, setIsHovering] = useState(false);
  const smootherRef = useRef(null);
  const imageArtifactSectionRef = useRef(null);
  const leftTestimonialRef = useRef(null);
  const centerTestimonialRef = useRef(null);
  const rightTestimonialRef = useRef(null);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
    let animationContext;
    const previousScrollRestoration = window.history.scrollRestoration;

    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    ScrollTrigger.clearScrollMemory();
    window.scrollTo(0, 0);

    const existingSmoother = ScrollSmoother.get();
    if (existingSmoother) {
      existingSmoother.kill();
    }

    smootherRef.current = ScrollSmoother.create({
      wrapper: '#smooth-wrapper',
      content: '#smooth-content',
      smooth: 1,
      effects: true,
      smoothTouch: 0.1,
      normalizeScroll: true,
      ignoreMobileResize: true,
      ease: 'expo'
    });

    smootherRef.current.scrollTop(0);

    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      if (smootherRef.current) {
        smootherRef.current.scrollTop(0);
      }
    });

    animationContext = gsap.context(() => {
      if (!imageArtifactSectionRef.current || !leftTestimonialRef.current || !centerTestimonialRef.current || !rightTestimonialRef.current) {
        return;
      }

      gsap.set(centerTestimonialRef.current, {
        y: 140,
        scale: 0.84,
        autoAlpha: 0
      });

      gsap.set(leftTestimonialRef.current, {
        x: -150,
        y: 120,
        autoAlpha: 0
      });

      gsap.set(rightTestimonialRef.current, {
        x: 150,
        y: 120,
        autoAlpha: 0
      });

      const testimonialsRiseTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: imageArtifactSectionRef.current,
          start: 'top 10%',
          end: '+=720',
          scrub: 1.5,
          invalidateOnRefresh: true
        }
      });

      testimonialsRiseTimeline
        .to(centerTestimonialRef.current, {
          y: 0,
          scale: 1,
          autoAlpha: 1,
          ease: 'power3.out',
          duration: 1.15
        })
        .to(leftTestimonialRef.current, {
          x: 0,
          y: 0,
          autoAlpha: 1,
          ease: 'power3.out',
          duration: 1
        }, '>-0.1')
        .to(rightTestimonialRef.current, {
          x: 0,
          y: 0,
          autoAlpha: 1,
          ease: 'power3.out',
          duration: 1
        }, '<');
    });

    ScrollTrigger.refresh();

    return () => {
      if (animationContext) {
        animationContext.revert();
      }
      if (smootherRef.current) {
        smootherRef.current.kill();
        smootherRef.current = null;
      }
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = previousScrollRestoration;
      }
    };
  }, []);

  const trustedBy = [
    "Media Companies",
    "Law Enforcement",
    "Social Platforms"
  ];

  return (
    <div id="smooth-wrapper" className="overflow-x-hidden">
      <div id="smooth-content" className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col relative">
      {/* Navigation Bar */}
      <nav className="absolute top-0 w-full flex items-center justify-between px-6 lg:px-12 h-24 bg-transparent z-50">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <img src={logo} alt="Logo" className="w-16 h-16 drop-shadow-[0_0_15px_rgba(56,189,248,0.5)]" />
          <span className="text-2xl font-black tracking-tight text-white drop-shadow-md">TrueLens AI</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-300">
          <span className="hover:text-cyan-400 cursor-pointer transition-colors shadow-sm">Home</span>
          <span className="hover:text-cyan-400 cursor-pointer transition-colors shadow-sm">About Team</span>
          <span className="hover:text-cyan-400 cursor-pointer transition-colors shadow-sm">Pricing</span>
        </div>
        
        <div className="flex items-center gap-6">
          
          <button 
            onClick={() => navigate('/detect')}
            className="text-sm font-bold text-white bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-6 py-2.5 rounded-full shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all flex items-center gap-2 border border-blue-400/30"
          >
            <Play className="w-4 h-4 fill-current" /> View Demo
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative w-full min-h-screen overflow-hidden flex items-center bg-[#050B14] cursor-crosshair">
        <div data-speed="0.7" data-lag="0.15" className="absolute -left-24 top-24 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl pointer-events-none" />
        <div data-speed="1.25" data-lag="0.35" className="absolute -right-24 bottom-16 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

        {/* Vanta DOTS Background */}
        <VantaDotsBackground />
        {/* Subtle Radial Gradient Overlay for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-transparent via-[#050B14]/60 to-[#050B14] z-1 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full relative z-20 flex flex-col items-center justify-center pt-32 lg:pt-40 text-center">
          
          <Motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center max-w-4xl"
          >


            <div data-speed="clamp(0.92)">
              <Motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1] mb-6 drop-shadow-2xl"
              >
                Detect <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 via-blue-500 to-indigo-500">Deepfakes</span><br/>With Absolute Precision
              </Motion.h1>
            </div>
            
            <div data-lag="0.25">
              <Motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl leading-relaxed"
              >
                Protect your organization from synthetic media and AI-generated fraud using continuous 3D spatial analysis and advanced neural networking.
              </Motion.p>
            </div>

            <Motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto"
            >
              <button
                onClick={() => navigate('/detect')}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                className="relative overflow-hidden w-full sm:w-auto px-10 py-4 bg-linear-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white rounded-full font-bold text-lg transition-all shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] hover:-translate-y-1 flex items-center justify-center gap-3 group border border-cyan-400/50 z-30"
              >
                Start Detecting
                {isHovering ? (
                  <div className="w-6 h-6 flex items-center justify-center opacity-90 mix-blend-screen scale-150">
                    <Lottie animationData={scanningLottie} loop={true} autoplay={true} />
                  </div>
                ) : (
                  <ScanLine className="w-6 h-6 transition-transform group-hover:scale-110" />
                )}
              </button>
              
            </Motion.div>
          </Motion.div>
          


        </div>


      </section>

      {/* Trusted By Banner */}
      <section data-speed="clamp(0.96)" className="py-8 bg-indigo-50/60 border-y border-indigo-100 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-12 text-[14px] font-bold">
        <span className="text-indigo-400/80 uppercase tracking-wider text-xs">Trusted By</span>
        {trustedBy.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <Check className="w-5 h-5 text-[#10B981] stroke-3" />
            <span className="text-indigo-900/80">{item}</span>
          </div>
        ))}
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-6 lg:px-12 max-w-7xl mx-auto w-full text-center">
        <h2 className="text-3xl lg:text-4xl font-extrabold text-[#1F2937] mb-4">Detect Deepfakes in 3 Easy Steps</h2>
        <p className="text-slate-500 max-w-2xl mx-auto mb-16 text-lg">Our streamlined process makes it incredibly easy to authenticate media, whether it's a single image or a bulk video upload.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center p-8 rounded-2xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50 hover:-translate-y-2 transition-transform duration-300">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-6 text-blue-600">
              <Upload className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-[#1F2937] mb-3">1. Upload Media</h3>
            <p className="text-slate-500">Securely upload your videos, audio files, or images directly to our encrypted platform.</p>
          </div>
          <div className="flex flex-col items-center p-8 rounded-2xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50 hover:-translate-y-2 transition-transform duration-300">
            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-6 text-indigo-600">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-[#1F2937] mb-3">2. AI Analysis</h3>
            <p className="text-slate-500">Our neural network scans for manipulation artifacts, GAN traces, and voice cloning instantly.</p>
          </div>
          <div className="flex flex-col items-center p-8 rounded-2xl bg-white border border-slate-100 shadow-xl shadow-slate-200/50 hover:-translate-y-2 transition-transform duration-300">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-6 text-emerald-600">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-[#1F2937] mb-3">3. Get Report</h3>
            <p className="text-slate-500">Receive a detailed authenticity report within seconds, highlighting any manipulated zones.</p>
          </div>
        </div>
      </section>

      {/* Detailed Features Overview */}
      <section className="py-32 bg-[#0A101D] border-y border-slate-800 relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.05),transparent_70%)] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full relative z-10">
          <Motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-24"
          >
            <h2 className="text-3xl lg:text-5xl font-extrabold text-white mb-6 tracking-tight">Comprehensive Forensic Analysis</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg md:text-xl">We cover every vector of synthetic media generation using multi-modal AI detection engines.</p>
          </Motion.div>

          <div className="flex flex-col gap-32">
            {/* Feature 1 */}
            <div ref={imageArtifactSectionRef} className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <Motion.div 
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, margin: "-100px" }}
                transition={{ duration: 0.7 }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 shrink-0 rounded-2xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center shadow-[0_0_30px_rgba(236,72,153,0.15)]">
                    <Video className="w-7 h-7" />
                  </div>
                  <h3 className="text-3xl lg:text-4xl font-bold text-white">Video Forensics</h3>
                </div>
                <p className="text-slate-400 text-lg leading-relaxed mb-8">
                  Analyzes frame-by-frame temporal consistency, facial tracking glitches, and deepfake masks. Our advanced algorithms detect minute changes in pulse rate, lighting inconsistencies, and blending boundaries that are invisible to the naked eye.
                </p>
                <ul className="space-y-4 font-medium text-slate-300">
                  <li className="flex items-center gap-4"><div className="p-1 rounded-full bg-pink-500/20"><Check className="w-4 h-4 text-pink-400" /></div> Frame-by-frame Temporal Analysis</li>
                  <li className="flex items-center gap-4"><div className="p-1 rounded-full bg-pink-500/20"><Check className="w-4 h-4 text-pink-400" /></div> Face Swap Detection</li>
                  <li className="flex items-center gap-4"><div className="p-1 rounded-full bg-pink-500/20"><Check className="w-4 h-4 text-pink-400" /></div> Lip-sync Inconsistency Tracking</li>
                </ul>
              </Motion.div>
              <Motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: false, margin: "-100px" }}
                transition={{ duration: 0.7 }}
                className="order-first lg:order-last relative group"
              >
                <div className="absolute -inset-4 bg-linear-to-tr from-pink-500/30 to-purple-500/30 blur-2xl rounded-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="relative rounded-3xl shadow-2xl border border-slate-700/50 overflow-hidden aspect-4/3">
                  <img data-speed="auto" src={videoImg} alt="Video analysis" className="h-full w-full object-cover scale-[1.18]" />
                  <div className="absolute inset-0 bg-linear-to-tr from-pink-500/20 to-transparent rounded-3xl mix-blend-overlay pointer-events-none"></div>
                </div>
              </Motion.div>
            </div>

            {/* Feature 2 (Reversed) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <Motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: false, margin: "-100px" }}
                transition={{ duration: 0.7 }}
                className="relative group "
              >
                <div className="absolute -inset-4 bg-linear-to-tr from-amber-500/30 to-orange-500/30 blur-2xl rounded-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="relative rounded-3xl shadow-2xl border border-slate-700/50 overflow-hidden aspect-4/3">
                  <img data-speed="auto" src={audioImg} alt="Audio analysis" className="h-full w-full object-cover scale-[1.18]" />
                  <div className="absolute inset-0 bg-linear-to-tr from-amber-500/20 to-transparent rounded-3xl mix-blend-overlay pointer-events-none"></div>
                </div>
              </Motion.div>
              <Motion.div 
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, margin: "-100px" }}
                transition={{ duration: 0.7 }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 shrink-0 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.15)]">
                    <AudioLines className="w-7 h-7" />
                  </div>
                  <h3 className="text-3xl lg:text-4xl font-bold text-white">Voice Authentication</h3>
                </div>
                <p className="text-slate-400 text-lg leading-relaxed mb-8">
                  Extracts spectral frequencies to differentiate between human vocal cords and AI synthesis. Protect against sophisticated voice cloning used in social engineering and banking fraud.
                </p>
                <ul className="space-y-4 font-medium text-slate-300">
                  <li className="flex items-center gap-4"><div className="p-1 rounded-full bg-amber-500/20"><Check className="w-4 h-4 text-amber-400" /></div> Spectral Frequency Analysis</li>
                  <li className="flex items-center gap-4"><div className="p-1 rounded-full bg-amber-500/20"><Check className="w-4 h-4 text-amber-400" /></div> Silence & Breath Detection</li>
                  <li className="flex items-center gap-4"><div className="p-1 rounded-full bg-amber-500/20"><Check className="w-4 h-4 text-amber-400" /></div> Multi-language Support</li>
                </ul>
              </Motion.div>
            </div>

            {/* Feature 3 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <Motion.div 
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, margin: "-100px" }}
                transition={{ duration: 0.7 }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 shrink-0 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.15)]">
                    <FileImage className="w-7 h-7" />
                  </div>
                  <h3 className="text-3xl lg:text-4xl font-bold text-white">Image Artifact Detection</h3>
                </div>
                <p className="text-slate-400 text-lg leading-relaxed mb-8">
                  Detects AI-generated images, GAN traces, and latent blending errors in static photos. Verify the authenticity of identity documents, news photographs, and insurance claims.
                </p>
                <ul className="space-y-4 font-medium text-slate-300">
                  <li className="flex items-center gap-4"><div className="p-1 rounded-full bg-indigo-500/20"><Check className="w-4 h-4 text-indigo-400" /></div> Pixel-level Anomaly Map</li>
                  <li className="flex items-center gap-4"><div className="p-1 rounded-full bg-indigo-500/20"><Check className="w-4 h-4 text-indigo-400" /></div> Exif Metadata Forensics</li>
                  <li className="flex items-center gap-4"><div className="p-1 rounded-full bg-indigo-500/20"><Check className="w-4 h-4 text-indigo-400" /></div> Midjourney/DALL-E 3 Detection</li>
                </ul>
              </Motion.div>
              <Motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: false, margin: "-100px" }}
                transition={{ duration: 0.7 }}
                className="order-first lg:order-last relative group"
              >
                <div className="absolute -inset-4 bg-linear-to-tr from-indigo-500/30 to-blue-500/30 blur-2xl rounded-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="relative rounded-3xl shadow-2xl border border-slate-700/50 overflow-hidden aspect-4/3">
                  <img data-speed="auto" src={imageImg} alt="Image analysis" className="h-full w-full object-cover scale-[1.18]" />
                  <div className="absolute inset-0 bg-linear-to-tr from-indigo-500/20 to-transparent rounded-3xl mix-blend-overlay pointer-events-none"></div>
                </div>
              </Motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="pt-12 pb-24 px-6 lg:px-12 max-w-7xl mx-auto w-full text-center relative z-20">
        <Motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl lg:text-5xl font-extrabold text-[#1F2937] mb-6 tracking-tight">Trusted by Industry Leaders</h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg mb-20">See how top organizations are leveraging TrueLens AI to secure their digital ecosystems.</p>
        </Motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div ref={leftTestimonialRef}
            className="group relative bg-white border border-slate-200/60 rounded-3xl p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 flex flex-col items-center text-center hover:-translate-y-2 z-10 overflow-hidden"
          >
            <div className="absolute inset-0 bg-linear-to-b from-slate-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="text-amber-400 flex gap-1 mb-8 text-xl group-hover:scale-110 transition-transform duration-300">★★★★★</div>
            <p className="text-slate-600 mb-10 text-lg leading-relaxed relative z-10 grow">"TrueLens AI has completely transformed how we verify user-submitted media. It's incredibly fast, accurate, and integrates directly into our CMS pipeline."</p>
            <div className="flex items-center gap-5 relative z-10 w-full justify-center pt-6 border-t border-slate-100">
              <div className="w-14 h-14 rounded-full bg-slate-200 overflow-hidden ring-4 ring-slate-50">
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150" alt="Sarah J." className="w-full h-full object-cover" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-[#1F2937] text-lg">Sarah Jenkins</h4>
                <p className="text-sm font-medium text-blue-600">Head of Trust & Safety</p>
                <p className="text-xs text-slate-400">MediaCorp</p>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div ref={centerTestimonialRef}
            className="group relative bg-white border border-blue-100 rounded-3xl p-10 shadow-[0_8px_30px_rgba(59,130,246,0.08)] hover:shadow-[0_20px_40px_rgba(59,130,246,0.15)] transition-all duration-500 flex flex-col items-center text-center transform md:-translate-y-6 hover:-translate-y-8 z-20 overflow-hidden ring-1 ring-blue-50"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-cyan-400 to-blue-500"></div>
            <div className="absolute inset-0 bg-linear-to-b from-blue-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="text-amber-400 flex gap-1 mb-8 text-xl group-hover:scale-110 transition-transform duration-300">★★★★★</div>
            <p className="text-slate-700 font-medium mb-10 text-lg leading-relaxed relative z-10 grow">"As a news agency, verifying footage authenticity is critical. TrueLens AI is the safety net that ensures we never broadcast synthetic or manipulated content."</p>
            <div className="flex items-center gap-5 relative z-10 w-full justify-center pt-6 border-t border-slate-100">
              <div className="w-14 h-14 rounded-full bg-slate-200 overflow-hidden ring-4 ring-blue-50">
                <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150&h=150" alt="Michael C." className="w-full h-full object-cover" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-[#1F2937] text-lg">Michael Chen</h4>
                <p className="text-sm font-medium text-blue-600">Chief Editor</p>
                <p className="text-xs text-slate-400">Global News</p>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div ref={rightTestimonialRef}
            className="group relative bg-white border border-slate-200/60 rounded-3xl p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 flex flex-col items-center text-center hover:-translate-y-2 z-10 overflow-hidden"
          >
            <div className="absolute inset-0 bg-linear-to-b from-slate-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="text-amber-400 flex gap-1 mb-8 text-xl group-hover:scale-110 transition-transform duration-300">★★★★★</div>
            <p className="text-slate-600 mb-10 text-lg leading-relaxed relative z-10 grow">"The voice cloning detection is state-of-the-art. We deployed the TrueLens API to catch fraudulent verification attempts before they reach human reviewers."</p>
            <div className="flex items-center gap-5 relative z-10 w-full justify-center pt-6 border-t border-slate-100">
              <div className="w-14 h-14 rounded-full bg-slate-200 overflow-hidden ring-4 ring-slate-50">
                <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150&h=150" alt="Elena R." className="w-full h-full object-cover" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-[#1F2937] text-lg">Elena Rostova</h4>
                <p className="text-sm font-medium text-blue-600">VP of Security</p>
                <p className="text-xs text-slate-400">FinTech Global</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="py-20 px-6 lg:px-12 max-w-7xl mx-auto w-full mb-12 relative z-20">
        <Motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="bg-[#0B152A] rounded-[3rem] p-12 lg:p-24 text-center relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-800"
        >
          {/* Abstract glow shapes */}
          <div className="absolute top-[-30%] left-[-10%] w-[60%] h-[150%] bg-blue-600/30 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute bottom-[-30%] right-[-10%] w-[60%] h-[150%] bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none" />

          {/* Grid pattern overlay (optional, subtle radial fade) */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.1),transparent_70%)] pointer-events-none" />

          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight drop-shadow-md">
              Ready to secure your digital content?
            </h2>
            <p className="text-slate-300 text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
              Join hundreds of organizations currently using TrueLens AI to detect manipulation and combat misinformation in real-time.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
              <button 
                onClick={() => navigate('/detect')} 
                className="w-full sm:w-auto px-10 py-5 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] hover:-translate-y-1 flex items-center justify-center gap-2 border border-blue-400/30"
              >
                Start Free Analysis 
              </button>
              <button 
                className="w-full sm:w-auto px-10 py-5 border border-slate-600 text-white font-bold rounded-full hover:bg-white/5 transition-all duration-300 hover:-translate-y-1"
              >
                Contact Sales
              </button>
            </div>
          </div>
        </Motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0F172A] text-slate-300 py-16 px-6 lg:px-12 mt-auto">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6 cursor-pointer" onClick={() => navigate('/')}>
              <img src={logo} alt="Logo" className="w-12 h-12" />
              <span className="text-2xl font-black tracking-tight text-white">TrueLens AI</span>
            </div>
            <p className="text-slate-400 mb-6 max-w-sm leading-relaxed">
              Pioneering advanced forensic technology to identify AI-generated media and protect the truth in the digital age.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-colors font-bold text-sm">
                X
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-colors font-bold text-sm">
                IN
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-colors font-bold text-sm">
                GH
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-bold text-white mb-6">Product</h4>
            <ul className="space-y-4 text-sm font-medium text-slate-400">
              <li><a href="#" className="hover:text-blue-400 transition-colors">Video Forensics</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Audio Authentication</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Image Detection</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">API Access</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Pricing</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-bold text-white mb-6">Resources</h4>
            <ul className="space-y-4 text-sm font-medium text-slate-400">
              <li><a href="#" className="hover:text-blue-400 transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Case Studies</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Help Center</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-white mb-6">Company</h4>
            <ul className="space-y-4 text-sm font-medium text-slate-400">
              <li><a href="#" className="hover:text-blue-400 transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Press</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto w-full pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p>&copy; {new Date().getFullYear()} TrueLens AI, Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}
