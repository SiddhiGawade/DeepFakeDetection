import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Video, AudioLines, Image as ImageIcon, ArrowRight, Eye } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-slate-900 overflow-hidden text-white font-sans flex flex-col items-center justify-center selection:bg-pink-500/30">
      
      {/* Abstract Background Elements (Bold Gradients) */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-pink-500/20 blur-[100px] rounded-full pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] opacity-30 pointer-events-none mask-image-radial-gradient" />

      {/* Navigation Bar */}
      <nav className="fixed top-0 inset-x-0 h-16 bg-slate-900/80 backdrop-blur-lg border-b border-slate-800 z-50 flex items-center justify-between px-6 lg:px-10">
        <div className="flex items-center gap-2 cursor-pointer transition-transform duration-300 hover:scale-105" onClick={() => navigate('/')}>
          <Eye className="w-6 h-6 text-pink-500" />
          <span className="text-xl font-extrabold tracking-tight text-white">TruthLens</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300 cursor-pointer">
          <span className="hover:text-pink-400 transition-colors">Home</span>
          <span className="hover:text-pink-400 transition-colors">Features</span>
          <span className="hover:text-pink-400 transition-colors">About</span>
        </div>
        
        <div>
          <button 
            onClick={() => navigate('/detect')}
            className="px-5 py-2 bg-gradient-to-r from-indigo-500 via-pink-500 to-amber-500 text-white rounded-lg text-sm font-bold shadow-lg hover:shadow-pink-500/40 transition-all duration-300 hover:scale-105 active:scale-95"
          >
            Start Free
          </button>
        </div>
      </nav>

      <main className="relative z-10 flex flex-col items-center justify-center px-6 max-w-5xl mx-auto w-full text-center mt-24 pb-12">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-indigo-500/30 bg-slate-800/50 backdrop-blur-md mb-8 shadow-lg shadow-indigo-500/10 transition-all duration-300 hover:border-pink-500/50 hover:shadow-pink-500/20">
          <ShieldCheck className="w-4 h-4 text-indigo-400" />
          <span className="text-sm font-semibold text-slate-200">
            Next-Gen AI Deepfake Detection
          </span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
          TruthLens<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-pink-500 to-amber-500 tracking-normal leading-tight">
            See Through the Fake.
          </span>
        </h1>
        
        {/* Description */}
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12 leading-relaxed">
          Advanced neural networks analyze metadata, artifacts, and inconsistencies in image, audio, and video files to protect you from falling victim to manipulated synthetic media.
        </p>

        {/* C2A Button */}
        <button
          onClick={() => navigate('/detect')}
          className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-slate-800 border border-slate-700 text-white rounded-2xl font-bold text-lg transition-all duration-500 hover:-translate-y-1 hover:border-pink-500/50 active:scale-95 shadow-xl hover:shadow-[0_20px_40px_rgba(236,72,153,0.3)] overflow-hidden"
        >
          {/* Inner Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-pink-500/20 to-amber-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          
          <span className="relative z-10 flex items-center gap-2">
            Start Detection
            <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1 text-pink-400" />
          </span>
        </button>

        {/* Feature Highlights Grid */}
        <div className="mt-20 w-full grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="p-8 rounded-2xl bg-slate-800 border border-slate-700/50 shadow-lg shadow-slate-900/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/20 hover:border-indigo-500/30 group">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center mb-6 border border-slate-700 group-hover:border-indigo-500/50 transition-colors">
              <ImageIcon className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3 text-left">Image Analysis</h3>
            <p className="text-slate-400 text-base leading-relaxed text-left">
              Detects AI-generated artifacts, GAN traces, and latent blending errors in static images.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-8 rounded-2xl bg-slate-800 border border-slate-700/50 shadow-lg shadow-slate-900/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-pink-500/20 hover:border-pink-500/30 group">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center mb-6 border border-slate-700 group-hover:border-pink-500/50 transition-colors">
              <Video className="w-6 h-6 text-pink-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3 text-left">Video Forensics</h3>
            <p className="text-slate-400 text-base leading-relaxed text-left">
              Analyzes frame-by-frame temporal consistency, facial tracking glitches, and deepfake masks.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-8 rounded-2xl bg-slate-800 border border-slate-700/50 shadow-lg shadow-slate-900/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-amber-500/20 hover:border-amber-500/30 group">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center mb-6 border border-slate-700 group-hover:border-amber-500/50 transition-colors">
              <AudioLines className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3 text-left">Voice Authentication</h3>
            <p className="text-slate-400 text-base leading-relaxed text-left">
              Extracts spectral frequencies to differentiate between human vocal cords and AI synthesis.
            </p>
          </div>
        </div>

      </main>
      
      {/* Custom CSS for radial gradient mask */}
      <style dangerouslySetInnerHTML={{__html: `
        .mask-image-radial-gradient {
          mask-image: radial-gradient(ellipse at center, rgba(0,0,0,0.8) 10%, transparent 70%);
          -webkit-mask-image: radial-gradient(ellipse at center, rgba(0,0,0,0.8) 10%, transparent 70%);
        }
      `}} />
    </div>
  );
}
