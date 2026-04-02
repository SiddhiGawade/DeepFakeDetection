import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Video, AudioLines, Image as ImageIcon, ArrowRight, ShieldAlert } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-zinc-950 overflow-hidden text-zinc-100 font-sans flex flex-col items-center justify-center selection:bg-purple-500/30">
      
      {/* Abstract Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-fuchsia-600/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50 pointer-events-none mask-image-radial-gradient" />

      <main className="relative z-10 flex flex-col items-center justify-center px-6 max-w-5xl mx-auto w-full text-center mt-[-4rem]">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-md mb-8 shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-all duration-300 hover:bg-purple-500/20 hover:border-purple-500/50 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]">
          <ShieldAlert className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
            Next-Gen AI Deepfake Detection
          </span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
          Unmask the <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-400 to-blue-400">Truth</span><br />
          Behind the Media.
        </h1>
        
        {/* Description */}
        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mb-12 leading-relaxed">
          Advanced neural networks analyze metadata, artifacts, and inconsistencies in image, audio, and video files to protect you from falling victim to manipulated synthetic media.
        </p>

        {/* C2A Button */}
        <button
          onClick={() => navigate('/detect')}
          className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-zinc-100 text-zinc-950 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 hover:bg-white active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_40px_rgba(168,85,247,0.4)] overflow-hidden"
        >
          {/* Inner Button Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          
          <span className="relative z-10 flex items-center gap-2">
            Start Detection
            <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </button>

        {/* Feature Highlights Grid */}
        <div className="mt-20 w-full grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm transition-colors duration-300 hover:bg-zinc-800/50 hover:border-zinc-700">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
              <ImageIcon className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2 text-left">Image Analysis</h3>
            <p className="text-zinc-400 text-sm leading-relaxed text-left">
              Detects AI-generated artifacts, GAN traces, and latent blending errors in static images.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm transition-colors duration-300 hover:bg-zinc-800/50 hover:border-zinc-700">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4">
              <Video className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2 text-left">Video Forensics</h3>
            <p className="text-zinc-400 text-sm leading-relaxed text-left">
              Analyzes frame-by-frame temporal consistency, facial tracking glitches, and deepfake masks.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm transition-colors duration-300 hover:bg-zinc-800/50 hover:border-zinc-700">
            <div className="w-12 h-12 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center mb-4">
              <AudioLines className="w-6 h-6 text-fuchsia-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2 text-left">Voice Authentication</h3>
            <p className="text-zinc-400 text-sm leading-relaxed text-left">
              Extracts spectral frequencies to differentiate between human vocal cords and AI synthesis.
            </p>
          </div>
        </div>

      </main>
      
      {/* Custom CSS for radial gradient mask */}
      <style dangerouslySetInnerHTML={{__html: `
        .mask-image-radial-gradient {
          mask-image: radial-gradient(ellipse at center, black 10%, transparent 70%);
          -webkit-mask-image: radial-gradient(ellipse at center, black 10%, transparent 70%);
        }
      `}} />
    </div>
  );
}
