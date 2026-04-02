import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileImage, AudioLines, Video } from 'lucide-react';
import logo from '../assets/Logo tab.png';

export default function DetectionPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      {/* Minimal Navigation Bar */}
      <nav className="flex items-center justify-between px-6 lg:px-12 h-20 bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <img src={logo} alt="Logo" className="w-12 h-12" />
          <span className="text-xl font-black tracking-tight text-blue-700">TrueLens AI</span>
        </div>
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 lg:px-12 py-16 flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-800 mb-4">
          Select Detection Type
        </h1>
        <p className="text-lg text-slate-500 mb-16 max-w-2xl">
          Choose the type of media you want to analyze. Our advanced neural network supports comprehensive forensic checks across images, audio, and video files.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
          {/* Option 1: Image */}
          <div 
            onClick={() => navigate('/image-detection')}
            className="group cursor-pointer bg-white border-[2px] border-slate-100 rounded-3xl p-8 hover:border-indigo-400 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 transform hover:-translate-y-2 flex flex-col items-center text-center"
          >
            <div className="w-20 h-20 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <FileImage className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">Fake Image Detection</h2>
            <p className="text-slate-500 mb-6">
              Detect latent blending errors, abnormal pixels, and GAN manipulations in static images (JPEG, PNG, WEBP).
            </p>
            <button className="mt-auto px-6 py-2.5 bg-slate-100 text-indigo-700 font-bold rounded-full group-hover:bg-indigo-600 group-hover:text-white transition-colors w-full">
              Analyze Image
            </button>
          </div>

          {/* Option 2: Audio */}
          <div 
            onClick={() => navigate('/audio-detection')}
            className="group cursor-pointer bg-white border-[2px] border-slate-100 rounded-3xl p-8 hover:border-amber-400 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 transform hover:-translate-y-2 flex flex-col items-center text-center"
          >
            <div className="w-20 h-20 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <AudioLines className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">Audio Analysis</h2>
            <p className="text-slate-500 mb-6">
              Extracts spectral frequencies and catches synthetic voice models in audio recordings (MP3, WAV, M4A).
            </p>
            <button className="mt-auto px-6 py-2.5 bg-slate-100 text-amber-600 font-bold rounded-full group-hover:bg-amber-500 group-hover:text-white transition-colors w-full">
              Analyze Audio
            </button>
          </div>

          {/* Option 3: Video */}
          <div 
            onClick={() => navigate('/video-detection')}
            className="group cursor-pointer bg-white border-[2px] border-slate-100 rounded-3xl p-8 hover:border-pink-400 hover:shadow-2xl hover:shadow-pink-500/10 transition-all duration-300 transform hover:-translate-y-2 flex flex-col items-center text-center"
          >
            <div className="w-20 h-20 rounded-2xl bg-pink-50 text-pink-500 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Video className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">Video Defect Detection</h2>
            <p className="text-slate-500 mb-6">
              Frame-by-frame forensics looking for facial tracking glitches and deepfake masks in videos (MP4, WEBM).
            </p>
            <button className="mt-auto px-6 py-2.5 bg-slate-100 text-pink-600 font-bold rounded-full group-hover:bg-pink-500 group-hover:text-white transition-colors w-full">
              Analyze Video
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
