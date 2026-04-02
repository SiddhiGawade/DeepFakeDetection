import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, Upload, Play, Check, 
  Video, AudioLines, FileImage
} from 'lucide-react';
import logo from '../assets/Logo tab.png';

export default function LandingPage() {
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col">
      {/* Navigation Bar */}
      <nav className="flex items-center justify-between px-6 lg:px-12 h-20 bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <img src={logo} alt="Logo" className="w-16 h-16" />
          <span className="text-2xl font-black tracking-tight text-blue-700">TrueLens AI</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <span className="hover:text-blue-600 cursor-pointer transition-colors">Home</span>
          <span className="hover:text-blue-600 cursor-pointer transition-colors">About</span>
          <span className="hover:text-blue-600 cursor-pointer transition-colors">Pricing</span>
        </div>
        
        <div className="flex items-center gap-6">
          <button className="hidden sm:flex text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-5 py-2.5 rounded-full transition-colors items-center gap-2">
            <span className="mr-1 text-base leading-none">👤</span> Sign In
          </button>
          <button 
            onClick={() => navigate('/detect')}
            className="text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 px-6 py-2.5 rounded-full shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" /> View Demo
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto w-full px-6 lg:px-12 py-12 lg:py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
        
        {/* Left Column */}
        <div className="flex flex-col items-start text-left">
          {/* Badges */}
          <div className="flex items-center gap-4 mb-8 flex-wrap">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider border border-blue-100">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              DEEPFAKE DETECTION
            </div>
            <div className="w-[42px] h-[42px] rounded-full border border-slate-200 flex flex-col items-center justify-center text-[8px] font-black text-slate-500 text-center leading-tight"><span>ISO</span><span className="text-slate-400">27001</span></div>
            <div className="w-[42px] h-[42px] rounded-full bg-[#5BA4DF] flex flex-col items-center justify-center text-[8px] font-black text-white text-center leading-tight"><span>AICPA</span><span>SOC</span></div>
            <div className="w-[42px] h-[42px] rounded-full bg-[#20377B] flex items-center justify-center text-[10px] font-black text-yellow-400">GDPR</div>
          </div>

          <h1 className="text-5xl lg:text-[4rem] font-extrabold tracking-tight text-[#1F2937] leading-[1.05] mb-6">
            Deepfake Detector for Images, Audio & Videos
          </h1>
          
          <p className="text-lg text-slate-500 mb-10 max-w-xl leading-relaxed">
            Detect AI-generated deepfakes, manipulated videos, and synthetic media with advanced computer vision technology. Protect your organization from sophisticated video fraud, misinformation campaigns, and identity impersonation across all digital platforms.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mb-12 w-full sm:w-auto">
            <button
              onClick={() => navigate('/detect')}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#1754CE] hover:bg-blue-700 text-white rounded-full font-bold text-base transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
            >
              Start Free Analysis &rarr;
            </button>
            <button className="w-full sm:w-auto px-8 py-3.5 bg-[#4B5563] hover:bg-slate-700 text-white rounded-full font-bold text-base transition-all shadow-lg shadow-slate-500/30">
              Schedule Demo
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#10B981] flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 text-white stroke-[4]" />
                </div>
                <span className="text-slate-600 font-semibold text-[15px]">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column - Analysis Card */}
        <div className="relative w-full max-w-lg mx-auto lg:ml-auto mt-8 lg:mt-0">
          <div className="rounded-[2.5rem] border-[2px] border-dashed border-[#A5C6FB] p-8 lg:p-10 bg-white relative">
            <div className="text-center mb-8 relative z-10">
              <h2 className="text-[22px] font-bold text-[#1D4ED8] mb-4">Basic Deepfake Detection Analysis</h2>
              <p className="text-slate-600 text-[15px] mb-4 leading-relaxed">
                Unlock <strong>faster speeds and even better accuracy</strong> with our custom enterprise models.
              </p>
              
              <a href="#" className="text-[#2563EB] underline font-medium hover:text-blue-800 transition-colors text-sm">
                Book your demo today.
              </a>

              <p className="text-sm text-slate-500 mt-6 mb-6">
                For bulk image analysis, please upload a <strong>ZIP file</strong> of your images.
              </p>
              
              <button 
                onClick={() => navigate('/detect')}
                className="mx-auto flex items-center justify-center gap-2 px-8 py-3 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-full transition-all shadow-md w-11/12 sm:w-auto"
              >
                <Upload className="w-[18px] h-[18px]" /> Upload File
              </button>
            </div>

            {/* Images Grid */}
            <div className="grid grid-cols-3 gap-3 relative z-10">
              <img src="https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&q=80&w=400&h=300" alt="Analysis 1" className="w-full h-[90px] object-cover rounded-xl shadow-sm hover:scale-105 transition-transform" />
              <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400&h=300" alt="Analysis 2" className="w-full h-[90px] object-cover rounded-xl shadow-sm hover:scale-105 transition-transform" />
              <img src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=400&h=300" alt="Analysis 3" className="w-full h-[90px] object-cover rounded-xl shadow-sm hover:scale-105 transition-transform" />
              <img src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400&h=300" alt="Analysis 4" className="w-full h-[90px] object-cover rounded-xl shadow-sm hover:scale-105 transition-transform" />
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400&h=300" alt="Analysis 5" className="w-full h-[90px] object-cover rounded-xl shadow-sm hover:scale-105 transition-transform" />
              <img src="https://images.unsplash.com/photo-1558222218-b7b54eede3f3?auto=format&fit=crop&q=80&w=400&h=300" alt="Analysis 6" className="w-full h-[90px] object-cover rounded-xl bg-slate-100 shadow-sm hover:scale-105 transition-transform" />
            </div>
          </div>
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
