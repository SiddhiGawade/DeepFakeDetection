/**
 * VideoDetectionPage.jsx
 *
 * Video upload experience for frame-based deepfake checks.
 * Delegates constraints and validation authority to backend upload API.
 *
 * Owner: Team Lead (Ayush)
 * Version: 1.0.0
 *
 * Team review checklist:
 * - keep MEDIA_TYPE fixed to video
 * - avoid local duration/FPS hard checks in this page
 * - keep success panel aligned with backend result payload
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Video as VideoIcon, Upload, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import logo from '../assets/Logo tab.png';
import { fetchUploadConstraints, getConstraintUiHints, uploadMediaFile } from '../services/uploadApi';
import { getUploadErrorMessage } from '../constants/uploadErrorMap';

const VIDEO_VERDICT_PATTERN = Object.freeze({
  fakeThreshold: 0.52,
  realThreshold: 0.48,
  minConfidence: 0.35,
  tieBreakerConfidence: 0.5,
});

const FRIENDLY_VERDICT_LABELS = Object.freeze({
  fake: 'AI Generated',
  real: 'Authentic',
  inconclusive: 'Inconclusive',
});

const LOADING_STEPS = [
  'Uploading video file...',
  'Extracting temporal and geometry features...',
  'Running staged FaceMesh and rPPG inference...',
  'Finalizing fusion verdict...',
];

function normalizeUnitInterval(rawValue) {
  if (rawValue === null || rawValue === undefined) return null;
  const numeric = Number(rawValue);
  if (!Number.isFinite(numeric)) return null;
  if (numeric > 1) return Math.min(Math.max(numeric / 100, 0), 1);
  return Math.min(Math.max(numeric, 0), 1);
}

function resolveVideoVerdict(payload) {
  const rawVerdict = typeof payload?.verdict === 'string' ? payload.verdict.toLowerCase() : null;
  if (rawVerdict && FRIENDLY_VERDICT_LABELS[rawVerdict]) {
    return rawVerdict;
  }

  const score = normalizeUnitInterval(payload?.prediction);
  const confidence = normalizeUnitInterval(payload?.confidence);

  if (score === null || confidence === null || confidence < VIDEO_VERDICT_PATTERN.minConfidence) {
    return 'inconclusive';
  }

  if (score >= VIDEO_VERDICT_PATTERN.fakeThreshold) {
    return 'fake';
  }

  if (score <= VIDEO_VERDICT_PATTERN.realThreshold) {
    return 'real';
  }

  const isBiological = Boolean(payload?.rppg_result?.is_biological ?? payload?.analysis?.is_biological);
  if (confidence >= VIDEO_VERDICT_PATTERN.tieBreakerConfidence) {
    return isBiological ? 'real' : 'fake';
  }

  return 'inconclusive';
}

export default function VideoDetectionPage() {
  const MEDIA_TYPE = 'video';
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [previewSize, setPreviewSize] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [constraints, setConstraints] = useState(null);
  const [progressStep, setProgressStep] = useState(0);

  useEffect(() => {
    let interval;
    if (status === 'uploading') {
      interval = setInterval(() => {
        setProgressStep((prev) => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
      }, 2000);
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
      setProgressStep(0);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setProgressStep(0);
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
      setProgressStep(0);
    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorMessage(getUploadErrorMessage(err.code, err.detail || err.message || 'Upload failed.'));
      setProgressStep(0);
    }
  };

  const { mediaHintLabel, maxSizeLabel } = getConstraintUiHints(constraints);
  const isPipelineFailed = result?.status === 'failed' || Boolean(result?.error_code);
  const stageSummary = result?.stage_details && typeof result.stage_details === 'object'
    ? Object.entries(result.stage_details)
      .map(([stage, details]) => `${stage}:${details?.success ? 'ok' : 'failed'}`)
      .join(' | ')
    : 'N/A';

  const confidenceLabel = (() => {
    if (result?.confidence === null || result?.confidence === undefined) return 'N/A';
    const numeric = Number(result.confidence);
    if (!Number.isFinite(numeric)) return String(result.confidence);
    const percent = numeric <= 1 ? numeric * 100 : numeric;
    return `${percent.toFixed(2)}%`;
  })();

  const scoreLabel = (() => {
    if (result?.prediction === null || result?.prediction === undefined) return 'N/A';
    const numeric = Number(result.prediction);
    if (!Number.isFinite(numeric)) return String(result.prediction);
    return numeric.toFixed(4);
  })();

  const verdictKey = isPipelineFailed ? 'inconclusive' : resolveVideoVerdict(result);
  const verdictLabel = isPipelineFailed ? 'Analysis Failed' : FRIENDLY_VERDICT_LABELS[verdictKey] || 'Inconclusive';
  const verdictTone = isPipelineFailed
    ? 'danger'
    : verdictKey === 'fake'
      ? 'danger'
      : verdictKey === 'real'
        ? 'safe'
        : 'warning';

  const resultToneClasses = (() => {
    if (verdictTone === 'danger') return 'text-red-700 bg-red-50 border-red-200';
    if (verdictTone === 'safe') return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    return 'text-amber-800 bg-amber-50 border-amber-200';
  })();

  const verdictNarrativeSentences = Array.isArray(result?.verdict_narrative?.sentences)
    ? result.verdict_narrative.sentences.filter((line) => typeof line === 'string' && line.trim().length > 0).slice(0, 3)
    : [];
  const verdictNarrativeSource = result?.verdict_narrative?.source || 'template';

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

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 lg:px-8 py-10 flex flex-col">
        <div className="mb-10 text-center">
          <div className="w-16 h-16 bg-pink-100 text-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <VideoIcon className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Video Defect Detection</h1>
          <p className="text-slate-500">Upload video footage to perform frame-by-frame temporal forensics.</p>
        </div>

        <div className="bg-white rounded-3xl p-8 border-2 border-slate-100 shadow-xl shadow-slate-200/50">
          
          {!previewUrl && (
            <div className="border-2 border-dashed border-pink-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center bg-pink-50/30">
              <Upload className="w-10 h-10 text-pink-400 mb-4" />
              <h3 className="text-lg font-bold text-slate-700 mb-1">Select a Video</h3>
              <p className="text-sm text-slate-500 mb-6">{mediaHintLabel} up to {maxSizeLabel}</p>
              
              <label className="cursor-pointer bg-pink-500 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-pink-500/30 hover:bg-pink-600 transition-colors">
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
              <div className="lg:col-span-4 flex flex-col w-full h-full">
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 mb-4 flex items-center justify-center shadow-inner">
                  <video src={previewUrl} controls className="max-w-full max-h-full" />
                </div>

                <div className="w-full flex justify-between items-center bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                  <div className="flex flex-col truncate pr-4">
                    <span className="font-bold text-slate-800 truncate">{file.name}</span>
                    <span className="text-xs text-slate-500 mt-1">{previewSize} MB</span>
                  </div>
                  <button
                    onClick={() => { setFile(null); setPreviewUrl(null); setStatus('idle'); setProgressStep(0); }}
                    className="text-xs font-bold text-red-600 hover:text-red-800 bg-red-50 px-4 py-2 rounded-xl shrink-0 transition-colors"
                    disabled={status === 'uploading'}
                  >
                    Discard
                  </button>
                </div>
              </div>

              <div className="lg:col-span-8 flex flex-col w-full h-full justify-center">
                {status === 'error' && (
                  <div className="w-full text-red-600 bg-red-50 p-4 rounded-xl mb-6 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span className="text-sm font-medium">{errorMessage}</span>
                  </div>
                )}

                {status === 'success' && result && (
                  <div className={`w-full border p-8 rounded-3xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 ${resultToneClasses}`}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <div className="col-span-1 flex flex-col items-center justify-center text-center bg-white/50 p-6 rounded-2xl border border-black/5 shadow-inner">
                        {verdictTone === 'safe' ? (
                          <CheckCircle2 className="w-16 h-16 text-emerald-500 mb-2 drop-shadow-md" />
                        ) : (
                          <AlertCircle className="w-16 h-16 text-red-500 mb-2 drop-shadow-md" />
                        )}
                        <h2 className="font-extrabold text-3xl">{verdictLabel}</h2>
                        <p className="font-bold opacity-80 mt-1">Confidence: {confidenceLabel}</p>
                      </div>

                      <div className="col-span-1 md:col-span-2 bg-white/50 p-6 rounded-2xl border border-black/5 flex flex-col justify-center shadow-inner">
                        <h4 className="font-bold text-slate-700 mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
                          <VideoIcon className="w-4 h-4 text-slate-400" />
                          Pipeline Dashboard
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono text-slate-600">
                          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                            <span className="text-[10px] text-slate-400 uppercase font-sans font-bold">Status</span>
                            <span className="font-bold text-slate-800 text-sm mt-1">{result.status || 'completed'}</span>
                          </div>
                          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                            <span className="text-[10px] text-slate-400 uppercase font-sans font-bold">User Verdict</span>
                            <span className="font-bold text-slate-800 text-sm mt-1">{verdictLabel}</span>
                          </div>
                          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                            <span className="text-[10px] text-slate-400 uppercase font-sans font-bold">Saved Hash</span>
                            <span className="font-bold text-slate-800 text-sm mt-1 truncate">{result.savedAs || 'N/A'}</span>
                          </div>
                          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                            <span className="text-[10px] text-slate-400 uppercase font-sans font-bold">Task ID</span>
                            <span className="font-bold text-slate-800 text-sm mt-1 truncate">{result.task_id || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <h4 className="font-bold opacity-80 mb-4 text-sm uppercase tracking-wider ml-1">Video Analytical Checks</h4>
                    {verdictNarrativeSentences.length > 0 && (
                      <div className="mb-6 p-5 rounded-2xl border shadow-sm bg-white/80 border-slate-200">
                        <h4 className="font-bold text-slate-800">Plain-Language Verdict Summary</h4>
                        <div className="mt-3 space-y-2 text-sm text-slate-700">
                          {verdictNarrativeSentences.map((sentence, idx) => (
                            <p key={idx}>- {sentence}</p>
                          ))}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-3 uppercase tracking-wider">Narrative Source: {verdictNarrativeSource}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                      <div className="p-5 rounded-2xl border shadow-sm bg-white/70 border-slate-200">
                        <h4 className="font-bold text-slate-800">Fusion Diagnostics</h4>
                        <p className="text-sm mt-2 text-slate-700">Reason: {result.analysis?.verdict_reason || 'N/A'}</p>
                        <p className="text-sm mt-1 text-slate-700">Stage Health: {result.analysis?.stage_health || 'N/A'}</p>
                      </div>

                      <div className="p-5 rounded-2xl border shadow-sm bg-white/70 border-slate-200">
                        <h4 className="font-bold text-slate-800">Geometry Signals</h4>
                        <p className="text-sm mt-2 text-slate-700">EAR Mean: {result.geometry_result?.ear_mean ?? 'N/A'}</p>
                        <p className="text-sm mt-1 text-slate-700">Jitter: {result.geometry_result?.landmark_jitter ?? 'N/A'}</p>
                        <p className="text-sm mt-1 text-slate-700">Blink Rate: {result.geometry_result?.blink_rate_per_min ?? 'N/A'}</p>
                      </div>

                      <div className="p-5 rounded-2xl border shadow-sm bg-white/70 border-slate-200">
                        <h4 className="font-bold text-slate-800">rPPG Signals</h4>
                        <p className="text-sm mt-2 text-slate-700">BPM: {result.rppg_result?.bpm_estimate ?? 'N/A'}</p>
                        <p className="text-sm mt-1 text-slate-700">Signal Quality: {result.rppg_result?.signal_quality ?? 'N/A'}</p>
                        <p className="text-sm mt-1 text-slate-700">Biological: {result.rppg_result?.is_biological === null || result.rppg_result?.is_biological === undefined ? 'N/A' : String(result.rppg_result?.is_biological)}</p>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 font-mono text-xs overflow-auto shadow-sm border border-slate-200">
                      <p><b>Original Name:</b> {result.originalName}</p>
                      <p><b>Pipeline Stages:</b> {stageSummary}</p>
                      <p><b>Internal Fusion Score:</b> {scoreLabel}</p>
                      {result.error_code && <p><b>Error Code:</b> {result.error_code}</p>}
                      {result.error_detail && <p><b>Error Detail:</b> {result.error_detail}</p>}
                    </div>
                  </div>
                )}

                {status === 'uploading' ? (
                  <div className="w-full bg-white border border-slate-200 p-12 rounded-3xl shadow-xl flex flex-col items-center justify-center transition-all animate-in fade-in zoom-in duration-500">
                    <div className="relative w-24 h-24 mb-6">
                      <svg className="w-full h-full text-pink-500 animate-spin origin-center" viewBox="0 0 100 100" style={{ animationDuration: '2.5s' }}>
                        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6" strokeDasharray="210 90" strokeLinecap="round" opacity="0.2" />
                        <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6" strokeDasharray="90 210" strokeLinecap="round" className="text-pink-500" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <VideoIcon className="w-10 h-10 text-pink-500 animate-pulse duration-1000" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-slate-700 animate-pulse transition-all duration-500 text-center">{LOADING_STEPS[progressStep]}</h3>
                    <div className="w-full bg-slate-100 h-2 mt-6 rounded-full overflow-hidden">
                      <div
                        className="bg-pink-500 h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${((progressStep + 1) / LOADING_STEPS.length) * 100}%` }}
                      />
                    </div>
                  </div>
                ) : status !== 'success' && (
                  <div className="w-full bg-white border-2 border-dashed border-slate-200 p-16 rounded-3xl flex flex-col items-center justify-center text-center">
                    <VideoIcon className="w-16 h-16 text-slate-200 mb-6" />
                    <h3 className="text-xl font-bold text-slate-700 mb-2">Ready for Analysis</h3>
                    <p className="text-slate-500 text-sm mb-8 max-w-sm">
                      Our staged pipeline will run geometry checks, rPPG consistency, and fusion scoring to produce a final verdict.
                    </p>
                    <button
                      onClick={handleUpload}
                      className="w-full max-w-sm py-4 rounded-full font-extrabold text-white flex items-center justify-center gap-2 transition-all shadow-xl bg-pink-500 hover:bg-pink-600 shadow-pink-500/40 text-lg"
                    >
                      {status === 'uploading' ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Uploading...</>
                      ) : (
                        'Run Deepfake Check'
                      )}
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
