/**
 * AudioDetectionPage.jsx
 *
 * Audio upload experience for deepfake voice analysis flow.
 * Thin page wrapper over shared upload service with audio-specific defaults.
 *
 * Owner: Team Lead (Ayush)
 * Version: 1.0.0
 *
 * Team review checklist:
 * - keep MEDIA_TYPE fixed to audio
 * - preserve backend-driven error and constraints handling
 * - keep waveform preview cosmetic and non-blocking
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AudioLines, Upload, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import logo from '../assets/Logo tab.png';
import { fetchUploadConstraints, getConstraintUiHints, uploadMediaFile } from '../services/uploadApi';
import { getUploadErrorMessage } from '../constants/uploadErrorMap';

export default function AudioDetectionPage() {
  const MEDIA_TYPE = 'audio';
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [previewSize, setPreviewSize] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [constraints, setConstraints] = useState(null);
  const [progressStep, setProgressStep] = useState(0);

  const loadingSteps = [
    "Uploading audio file...",
    "Extracting acoustic features...",
    "Running Deepfake analysis models...",
    "Finalizing classification verdict..."
  ];

  useEffect(() => {
    let interval;
    if (status === 'uploading') {
      interval = setInterval(() => {
        setProgressStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
      }, 2000);
    } else {
      setProgressStep(0);
    }
    return () => clearInterval(interval);
  }, [status]);

  useEffect(() => {
    let active = true;

    fetchUploadConstraints(MEDIA_TYPE)
      .then((data) => {
        if (active) setConstraints(data);
      })
      .catch(() => {
        if (active) setConstraints(null);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
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

    try {
      const response = await uploadMediaFile({
        file,
        mediaType: MEDIA_TYPE,
        metadata: {
          source_label: file.name,
        },
      });

      setStatus('success');
      setResult(response.data);
    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorMessage(getUploadErrorMessage(err.code, err.detail || err.message || 'Upload failed.'));
    }
  };

  const { mediaHintLabel, maxSizeLabel } = getConstraintUiHints(constraints);

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

      <main className="flex-1 max-w-[90rem] mx-auto w-full px-4 lg:px-8 py-10 flex flex-col">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AudioLines className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Audio Analysis</h1>
          <p className="text-slate-500">Upload an audio recording to extract spectral frequencies and detect voice cloning.</p>
        </div>

        <div className="bg-white rounded-3xl p-8 border-2 border-slate-100 shadow-xl shadow-slate-200/50">
          
          {!previewUrl && (
            <div className="border-2 border-dashed border-amber-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center bg-amber-50/30">
              <Upload className="w-10 h-10 text-amber-400 mb-4" />
              <h3 className="text-lg font-bold text-slate-700 mb-1">Select an Audio File</h3>
              <p className="text-sm text-slate-500 mb-6">{mediaHintLabel} up to {maxSizeLabel}</p>
              
              <label className="cursor-pointer bg-amber-500 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-amber-500/30 hover:bg-amber-600 transition-colors">
                Browse Files
                <input 
                  type="file" 
                  className="hidden" 
                  accept={`${MEDIA_TYPE}/*`}
                  onChange={handleFileChange}
                />
              </label>
            </div>
          )}

          {previewUrl && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
              
              {/* === LEFT SIDE: Audio Player & File details === */}
              <div className="lg:col-span-4 flex flex-col w-full h-full">
                <div className="w-full p-8 rounded-3xl bg-zinc-900 border border-zinc-700 mb-4 flex flex-col items-center justify-center shadow-2xl">
                   <div className="flex gap-1 mb-8 opacity-70 mt-4">
                     {[...Array(15)].map((_, i) => (
                        <div key={i} className="w-2 bg-amber-500 rounded-full animate-pulse" style={{ height: `${Math.random() * 40 + 10}px`, animationDelay: `${i * 0.1}s` }} />
                     ))}
                   </div>
                   <audio src={previewUrl} controls className="w-full h-10 mt-4" />
                </div>
                
                <div className="w-full flex justify-between items-center bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                  <div className="flex flex-col truncate pr-4">
                    <span className="font-bold text-slate-800 truncate">{file.name}</span>
                    <span className="text-xs text-slate-500 mt-1">{previewSize} MB</span>
                  </div>
                  <button 
                    onClick={() => { setFile(null); setPreviewUrl(null); setStatus('idle'); }}
                    className="text-xs font-bold text-red-600 hover:text-red-800 bg-red-50 px-4 py-2 rounded-xl shrink-0 transition-colors"
                    disabled={status === 'uploading'}
                  >
                    Discard
                  </button>
                </div>
              </div>

              {/* === RIGHT SIDE: Analysis & Results === */}
              <div className="lg:col-span-8 flex flex-col w-full h-full justify-center">

              {status === 'error' && (
                <div className="w-full max-w-lg text-red-600 bg-red-50 p-4 rounded-xl mb-6 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span className="text-sm font-medium">{errorMessage}</span>
                </div>
              )}

              {status === 'success' && (
                <div className={`w-full ${result.is_fake ? 'text-red-700 bg-red-50 border-red-200' : 'text-emerald-700 bg-emerald-50 border-emerald-200'} border p-8 rounded-3xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                  
                  {/* Top Dashboard Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="col-span-1 flex flex-col items-center justify-center text-center bg-white/50 p-6 rounded-2xl border border-black/5 shadow-inner">
                      {result.is_fake ? (
                        <AlertCircle className="w-16 h-16 text-red-500 mb-2 drop-shadow-md" />
                      ) : (
                        <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-2 drop-shadow-md" />
                      )}
                      <h2 className="font-extrabold text-3xl">{result.verdict}</h2>
                      <p className="font-bold opacity-80 mt-1">Confidence: {result.confidence}%</p>
                    </div>

                    {result.analysis && (
                      <div className="col-span-1 md:col-span-2 bg-white/50 p-6 rounded-2xl border border-black/5 flex flex-col justify-center shadow-inner">
                        <h4 className="font-bold text-slate-700 mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                          <AudioLines className="w-4 h-4 text-slate-400" />
                          Raw Acoustic Dashboard
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono text-slate-600">
                          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                            <span className="text-[10px] text-slate-400 uppercase font-sans font-bold">Pitch Std</span>
                            <span className="font-bold text-slate-800 text-sm mt-1">{result.analysis.pitch_std} Hz</span>
                          </div>
                          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                            <span className="text-[10px] text-slate-400 uppercase font-sans font-bold">Zero Crossing</span>
                            <span className="font-bold text-slate-800 text-sm mt-1">{result.analysis.zero_crossing_rate}</span>
                          </div>
                          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                            <span className="text-[10px] text-slate-400 uppercase font-sans font-bold">Silence Ratio</span>
                            <span className="font-bold text-slate-800 text-sm mt-1">{result.analysis.silence_ratio}</span>
                          </div>
                          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                            <span className="text-[10px] text-slate-400 uppercase font-sans font-bold">MFCC Var</span>
                            <span className="font-bold text-slate-800 text-sm mt-1">{result.analysis.mfcc_variance}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Feature Check Grid (Horizontal/Tabular Layout) */}
                  <h4 className="font-bold opacity-80 mb-4 text-sm uppercase tracking-wider ml-1">AI Analytical Checks</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {result.reasons && result.reasons.length > 0 && result.reasons.map((reason, idx) => (
                      <div key={idx} className={`p-5 rounded-2xl border shadow-sm ${reason.type === 'good' ? 'bg-emerald-100/50 border-emerald-200 hover:bg-emerald-100' : 'bg-amber-100/50 border-amber-300 hover:bg-amber-100'} transition-colors`}>
                        <h4 className={`font-bold flex items-center gap-2 ${reason.type === 'good' ? 'text-emerald-800' : 'text-amber-800'}`}>
                          {reason.type === 'good' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                          {reason.feature}
                        </h4>
                        <p className={`text-sm mt-2 leading-snug ${reason.type === 'good' ? 'text-emerald-700' : 'text-amber-900 duration-1000 font-medium'}`}>
                          {reason.detail}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {status === 'uploading' ? (
                <div className="w-full bg-white border border-slate-200 p-12 rounded-3xl shadow-xl flex flex-col items-center justify-center transition-all animate-in fade-in zoom-in duration-500">
                  <div className="relative w-24 h-24 mb-6">
                    <svg className="w-full h-full text-amber-500 animate-spin origin-center" viewBox="0 0 100 100" style={{ animationDuration: '2.5s' }}>
                      <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6" strokeDasharray="210 90" strokeLinecap="round" opacity="0.2" />
                      <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6" strokeDasharray="90 210" strokeLinecap="round" className="text-amber-500" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <AudioLines className="w-10 h-10 text-amber-500 animate-pulse duration-1000" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-700 animate-pulse transition-all duration-500 text-center">{loadingSteps[progressStep]}</h3>
                  <div className="w-full bg-slate-100 h-2 mt-6 rounded-full overflow-hidden">
                    <div 
                      className="bg-amber-500 h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${((progressStep + 1) / loadingSteps.length) * 100}%` }}
                    />
                  </div>
                </div>
              ) : status !== 'success' && (
                <div className="w-full bg-white border-2 border-dashed border-slate-200 p-16 rounded-3xl flex flex-col items-center justify-center text-center">
                  <AudioLines className="w-16 h-16 text-slate-200 mb-6" />
                  <h3 className="text-xl font-bold text-slate-700 mb-2">Ready for Analysis</h3>
                  <p className="text-slate-500 text-sm mb-8 max-w-sm">
                    Our AI models will extract mel spectrograms and evaluate the audio for synthetic irregularities.
                  </p>
                  <button 
                    onClick={handleUpload}
                    className="w-full max-w-sm py-4 rounded-full font-extrabold text-white flex items-center justify-center gap-2 transition-all shadow-xl bg-amber-500 hover:bg-amber-600 shadow-amber-500/40 text-lg"
                  >
                    Run Deepfake Check
                  </button>
                </div>
              )}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
