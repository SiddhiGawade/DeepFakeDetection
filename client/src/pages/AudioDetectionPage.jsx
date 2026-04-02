import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AudioLines, Upload, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import logo from '../assets/Logo tab.png';

export default function AudioDetectionPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [previewSize, setPreviewSize] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      const allowed = ['audio/mpeg', 'audio/wav', 'audio/mp4'];
      if (!allowed.includes(selected.type) && !selected.name.endsWith('.m4a')) {
        setErrorMessage('Unsupported file type. Please upload a MP3, WAV, or M4A audio file.');
        setStatus('error');
        return;
      }
      setFile(selected);
      setPreviewSize((selected.size / (1024 * 1024)).toFixed(2));
      setPreviewUrl(URL.createObjectURL(selected));
      setStatus('idle');
      setErrorMessage('');
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setStatus('uploading');
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('success');
        setResult(data.data);
      } else {
        throw new Error(data.message || 'Upload failed');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorMessage(err.message || 'An error occurred while uploading. Ensure backend is running.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      <nav className="flex items-center justify-between px-6 lg:px-12 h-20 bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <img src={logo} alt="Logo" className="w-12 h-12" />
          <span className="text-xl font-black tracking-tight text-blue-700">TrueLens AI</span>
        </div>
        <button 
          onClick={() => navigate('/detect')}
          className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
      </nav>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 lg:px-12 py-12 flex flex-col">
        <div className="mb-10 text-center">
          <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AudioLines className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Audio Analysis</h1>
          <p className="text-slate-500">Upload an audio recording to extract spectral frequencies and detect voice cloning.</p>
        </div>

        <div className="bg-white rounded-3xl p-8 border-[2px] border-slate-100 shadow-xl shadow-slate-200/50">
          
          {!previewUrl && (
            <div className="border-2 border-dashed border-amber-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center bg-amber-50/30">
              <Upload className="w-10 h-10 text-amber-400 mb-4" />
              <h3 className="text-lg font-bold text-slate-700 mb-1">Select an Audio File</h3>
              <p className="text-sm text-slate-500 mb-6">MP3, WAV, or M4A up to 200MB</p>
              
              <label className="cursor-pointer bg-amber-500 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-amber-500/30 hover:bg-amber-600 transition-colors">
                Browse Files
                <input 
                  type="file" 
                  className="hidden" 
                  accept="audio/mpeg, audio/wav, audio/mp4, .m4a"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          )}

          {previewUrl && (
            <div className="flex flex-col items-center">
              <div className="w-full max-w-lg p-10 rounded-2xl bg-zinc-900 border border-zinc-700 mb-6 flex flex-col items-center justify-center shadow-inner">
                 <div className="flex gap-1 mb-8 opacity-70">
                   {[...Array(15)].map((_, i) => (
                      <div key={i} className="w-2 bg-amber-500 rounded-full animate-pulse" style={{ height: `${Math.random() * 40 + 10}px`, animationDelay: `${i * 0.1}s` }} />
                   ))}
                 </div>
                 <audio src={previewUrl} controls className="w-full h-10" />
              </div>
              
              <div className="w-full max-w-lg mb-8 flex justify-between items-center bg-slate-50 border border-slate-200 p-4 rounded-xl">
                <div className="flex flex-col truncate pr-4">
                  <span className="font-semibold text-slate-700 truncate">{file.name}</span>
                  <span className="text-xs text-slate-500">{previewSize} MB</span>
                </div>
                <button 
                  onClick={() => { setFile(null); setPreviewUrl(null); setStatus('idle'); }}
                  className="text-xs font-bold text-red-500 hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-lg shrink-0"
                  disabled={status === 'uploading'}
                >
                  Remove
                </button>
              </div>

              {status === 'error' && (
                <div className="w-full max-w-lg text-red-600 bg-red-50 p-4 rounded-xl mb-6 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span className="text-sm font-medium">{errorMessage}</span>
                </div>
              )}

              {status === 'success' && (
                <div className="w-full max-w-lg text-emerald-700 bg-emerald-50 border border-emerald-200 p-6 rounded-xl mb-6">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    <span className="font-bold text-lg">Upload Successful!</span>
                  </div>
                  <div className="bg-white rounded-lg p-4 font-mono text-xs overflow-auto shadow-sm border border-emerald-100">
                     <p><b>Original Name:</b> {result.originalName}</p>
                     <p><b>Saved Hash:</b> {result.savedAs}</p>
                     <p className="mt-2 text-emerald-600 italic">Analysis pipeline placeholder...</p>
                  </div>
                </div>
              )}

              {status !== 'success' && (
                <button 
                  onClick={handleUpload}
                  disabled={status === 'uploading'}
                  className={`w-full max-w-lg py-4 rounded-full font-bold text-white flex items-center justify-center gap-2 transition-all shadow-xl ${status === 'uploading' ? 'bg-amber-400 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30'}`}
                >
                  {status === 'uploading' ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Uploading...</>
                  ) : (
                    'Run AI Analysis'
                  )}
                </button>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
