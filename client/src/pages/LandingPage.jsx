import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, Upload, Play, Check, 
  Video, AudioLines, FileImage, ScanLine, Sparkles, Crosshair, Activity
} from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Lottie from 'lottie-react';
import logo from '../assets/Logo tab.png';

const scanningLottie = {"v":"5.5.2","fr":60,"ip":0,"op":60,"w":100,"h":100,"nm":"SCAN","ddd":0,"assets":[],"layers":[{"ddd":0,"ind":1,"ty":4,"nm":"Line","sr":1,"ks":{"o":{"a":1,"k":[{"i":{"x":[0.833],"y":[0.833]},"o":{"x":[0.167],"y":[0.167]},"t":0,"s":[0]},{"i":{"x":[0.833],"y":[0.833]},"o":{"x":[0.167],"y":[0.167]},"t":30,"s":[100]},{"t":60,"s":[0]}]},"r":{"a":0,"k":0,"ix":6},"p":{"a":1,"k":[{"i":{"x":0.833,"y":0.833},"o":{"x":0.167,"y":0.167},"t":0,"s":[50,0,0],"to":[0,20,0],"ti":[0,0,0]},{"i":{"x":0.833,"y":0.833},"o":{"x":0.167,"y":0.167},"t":30,"s":[50,100,0],"to":[0,0,0],"ti":[0,20,0]},{"t":60,"s":[50,0,0]}],"ix":2,"l":2},"a":{"a":0,"k":[0,0,0],"ix":1,"l":2},"s":{"a":0,"k":[100,100,100],"ix":6,"l":2}},"ao":0,"shapes":[{"ty":"gr","it":[{"d":1,"ty":"el","s":{"a":0,"k":[100,2],"ix":2},"p":{"a":0,"k":[0,0],"ix":3},"nm":"Ellipse Path 1","mn":"ADBE Vector Shape - Ellipse","hd":false},{"ty":"fl","c":{"a":0,"k":[1,1,1,1],"ix":4},"o":{"a":0,"k":100,"ix":5},"r":1,"bm":0,"nm":"Fill 1","mn":"ADBE Vector Graphic - Fill","hd":false},{"ty":"tr","p":{"a":0,"k":[0,0],"ix":2},"a":{"a":0,"k":[0,0],"ix":1},"s":{"a":0,"k":[100,100],"ix":3},"r":{"a":0,"k":0,"ix":6},"o":{"a":0,"k":100,"ix":7},"sk":{"a":0,"k":0,"ix":4},"sa":{"a":0,"k":0,"ix":5},"nm":"Transform"}],"nm":"Ellipse 1","np":3,"cix":2,"bm":0,"ix":1,"mn":"ADBE Vector Group","hd":false}],"ip":0,"op":60,"st":0,"bm":0}]};

const VantaDotsBackground = () => {
  const vantaRef = useRef(null);
  const vantaEffect = useRef(null);

  useEffect(() => {
    import('three').then((THREE) => {
      // Vanta's minified build requires THREE on the global window object
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

const FUIOverlay = () => {
  const [data, setData] = useState({ lat: 34.05, lng: -118.24, bitrate: 4.5 });
  
  useEffect(() => {
    const interval = setInterval(() => {
      setData({
        lat: 34.05 + (Math.random() * 0.01 - 0.005),
        lng: -118.24 + (Math.random() * 0.01 - 0.005),
        bitrate: 4.0 + Math.random() * 1.5
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  
};

export default function LandingPage() {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const [isHovering, setIsHovering] = useState(false);



  const features = [
    "Full Detection History Dashboard",
    "On-site & regional deployments",
    "Advanced Video Analysis",
    "Real-time Deepfake Detection",
    "Media Authenticity Verification"
  ];

  const trustedBy = [
    "Media Companies",
    "Law Enforcement",
    "Social Platforms"
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col relative">
      {/* Navigation Bar */}
      <nav className="absolute top-0 w-full flex items-center justify-between px-6 lg:px-12 h-24 bg-transparent z-50">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <img src={logo} alt="Logo" className="w-16 h-16 drop-shadow-[0_0_15px_rgba(56,189,248,0.5)]" />
          <span className="text-2xl font-black tracking-tight text-white drop-shadow-md">TrueLens AI</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-300">
          <span className="hover:text-cyan-400 cursor-pointer transition-colors shadow-sm">Home</span>
          <span className="hover:text-cyan-400 cursor-pointer transition-colors shadow-sm">About</span>
          <span className="hover:text-cyan-400 cursor-pointer transition-colors shadow-sm">Pricing</span>
        </div>
        
        <div className="flex items-center gap-6">
          <button className="hidden sm:flex text-sm font-bold text-slate-300 hover:text-white transition-colors items-center gap-2">
            Sign In
          </button>
          <button 
            onClick={() => navigate('/detect')}
            className="text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-6 py-2.5 rounded-full shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all flex items-center gap-2 border border-blue-400/30"
          >
            <Play className="w-4 h-4 fill-current" /> View Demo
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative w-full min-h-screen overflow-hidden flex items-center bg-[#050B14] cursor-crosshair">
        
        <FUIOverlay />

        {/* Vanta DOTS Background */}
        <VantaDotsBackground />
        {/* Subtle Radial Gradient Overlay for depth */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#050B14]/60 to-[#050B14] z-[1] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full relative z-20 flex flex-col items-center justify-center pt-32 lg:pt-40 text-center">
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center max-w-4xl"
          >


            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1] mb-6 drop-shadow-2xl"
            >
              Detect <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500">Deepfakes</span><br/>With Absolute Precision
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl leading-relaxed"
            >
              Protect your organization from synthetic media and AI-generated fraud using continuous 3D spatial analysis and advanced neural networking.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto"
            >
              <button
                onClick={() => navigate('/detect')}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                className="relative overflow-hidden w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white rounded-full font-bold text-lg transition-all shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] hover:-translate-y-1 flex items-center justify-center gap-3 group border border-cyan-400/50 z-30"
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
              
            </motion.div>
          </motion.div>
          


        </div>


      </section>

      {/* Trusted By Banner */}
      <section className="py-8 bg-slate-50 border-y border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-12 text-[14px] font-bold text-slate-500">
        <span className="text-slate-400">Trusted By</span>
        {trustedBy.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <Check className="w-5 h-5 text-[#10B981] stroke-[3]" />
            <span className="text-slate-600">{item}</span>
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
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full">
          <div className="text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-[#1F2937] mb-4">Comprehensive Forensic Analysis</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg">We cover every vector of synthetic media generation.</p>
          </div>

          <div className="flex flex-col gap-24">
            {/* Feature 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="w-12 h-12 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center mb-6">
                  <Video className="w-6 h-6" />
                </div>
                <h3 className="text-3xl font-bold text-[#1F2937] mb-4">Video Forensics</h3>
                <p className="text-slate-600 text-lg leading-relaxed mb-6">
                  Analyzes frame-by-frame temporal consistency, facial tracking glitches, and deepfake masks. Our advanced algorithms detect minute changes in pulse rate, lighting inconsistencies, and blending boundaries that are invisible to the naked eye.
                </p>
                <ul className="space-y-3 font-medium text-slate-700">
                  <li className="flex items-center gap-3"><Check className="w-5 h-5 text-emerald-500" /> Frame-by-frame Temporal Analysis</li>
                  <li className="flex items-center gap-3"><Check className="w-5 h-5 text-emerald-500" /> Face Swap Detection</li>
                  <li className="flex items-center gap-3"><Check className="w-5 h-5 text-emerald-500" /> Lip-sync Inconsistency Tracking</li>
                </ul>
              </div>
              <div className="order-first lg:order-last relative">
                <img src="https://images.unsplash.com/photo-1616874535071-af635c05d762?auto=format&fit=crop&q=80&w=800&h=600" alt="Video analysis" className="rounded-3xl shadow-2xl" />
                <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/20 to-transparent rounded-3xl mix-blend-overlay"></div>
              </div>
            </div>

            {/* Feature 2 (Reversed) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="relative">
                <img src="https://images.unsplash.com/photo-1590602847861-f357a914ea8a?auto=format&fit=crop&q=80&w=800&h=600" alt="Audio analysis" className="rounded-3xl shadow-2xl" />
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 to-transparent rounded-3xl mix-blend-overlay"></div>
              </div>
              <div>
                <div className="w-12 h-12 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center mb-6">
                  <AudioLines className="w-6 h-6" />
                </div>
                <h3 className="text-3xl font-bold text-[#1F2937] mb-4">Voice Authentication</h3>
                <p className="text-slate-600 text-lg leading-relaxed mb-6">
                  Extracts spectral frequencies to differentiate between human vocal cords and AI synthesis. Protect against sophisticated voice cloning used in social engineering and banking fraud.
                </p>
                <ul className="space-y-3 font-medium text-slate-700">
                  <li className="flex items-center gap-3"><Check className="w-5 h-5 text-emerald-500" /> Spectral Frequency Analysis</li>
                  <li className="flex items-center gap-3"><Check className="w-5 h-5 text-emerald-500" /> Silence & Breath Detection</li>
                  <li className="flex items-center gap-3"><Check className="w-5 h-5 text-emerald-500" /> Multi-language Support</li>
                </ul>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="w-12 h-12 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mb-6">
                  <FileImage className="w-6 h-6" />
                </div>
                <h3 className="text-3xl font-bold text-[#1F2937] mb-4">Image Artifact Detection</h3>
                <p className="text-slate-600 text-lg leading-relaxed mb-6">
                  Detects AI-generated images, GAN traces, and latent blending errors in static photos. Verify the authenticity of identity documents, news photographs, and insurance claims.
                </p>
                <ul className="space-y-3 font-medium text-slate-700">
                  <li className="flex items-center gap-3"><Check className="w-5 h-5 text-emerald-500" /> Pixel-level Anomaly Map</li>
                  <li className="flex items-center gap-3"><Check className="w-5 h-5 text-emerald-500" /> Exif Metadata Forensics</li>
                  <li className="flex items-center gap-3"><Check className="w-5 h-5 text-emerald-500" /> Midjourney/DALL-E 3 Detection</li>
                </ul>
              </div>
              <div className="order-first lg:order-last relative">
                <img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800&h=600" alt="Image analysis" className="rounded-3xl shadow-2xl" />
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-transparent rounded-3xl mix-blend-overlay"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 lg:px-12 max-w-7xl mx-auto w-full text-center">
        <h2 className="text-3xl lg:text-4xl font-extrabold text-[#1F2937] mb-16">Trusted by Industry Leaders</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-xl shadow-slate-200/50 flex flex-col items-center text-center">
            <div className="text-yellow-400 flex gap-1 mb-6 text-lg">★★★★★</div>
            <p className="text-slate-600 mb-8 grow">"TrueLens AI has completely transformed how we verify user-submitted media. It's incredibly fast, accurate, and integrates directly into our CMS pipeline."</p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150" alt="Sarah J." className="w-full h-full object-cover" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-[#1F2937]">Sarah Jenkins</h4>
                <p className="text-xs text-slate-500">Head of Trust & Safety, MediaCorp</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-xl shadow-slate-200/50 flex flex-col items-center text-center transform md:-translate-y-4">
            <div className="text-yellow-400 flex gap-1 mb-6 text-lg">★★★★★</div>
            <p className="text-slate-600 mb-8 grow">"As a news agency, verifying footage authenticity is critical. TrueLens AI is the safety net that ensures we never broadcast synthetic or manipulated content."</p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150&h=150" alt="Michael C." className="w-full h-full object-cover" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-[#1F2937]">Michael Chen</h4>
                <p className="text-xs text-slate-500">Chief Editor, Global News</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-xl shadow-slate-200/50 flex flex-col items-center text-center">
            <div className="text-yellow-400 flex gap-1 mb-6 text-lg">★★★★★</div>
            <p className="text-slate-600 mb-8 grow">"The voice cloning detection is state-of-the-art. We deployed the TrueLens API to catch fraudulent verification attempts before they reach human reviewers."</p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden">
                <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150&h=150" alt="Elena R." className="w-full h-full object-cover" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-[#1F2937]">Elena Rostova</h4>
                <p className="text-xs text-slate-500">VP of Security, FinTech Global</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="py-20 px-6 lg:px-12 max-w-7xl mx-auto w-full mb-12">
        <div className="bg-[#1754CE] rounded-[3rem] p-12 lg:p-20 text-center relative overflow-hidden shadow-2xl shadow-blue-600/30">
          <div className="absolute top-[-50%] left-[-10%] w-[60%] h-[150%] bg-white/10 blur-[100px] rounded-full pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-6">Ready to secure your digital content?</h2>
            <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">Join hundreds of organizations currently using TrueLens AI to detect manipulation and combat misinformation in real-time.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={() => navigate('/detect')} className="w-full sm:w-auto px-8 py-4 bg-white text-blue-700 font-bold rounded-full hover:bg-slate-50 transition-colors shadow-lg">
                Start Free Analysis
              </button>
              <button className="w-full sm:w-auto px-8 py-4 border-2 border-white/30 text-white font-bold rounded-full hover:bg-white/10 transition-colors">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
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
  );
}
