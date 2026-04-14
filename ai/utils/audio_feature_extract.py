import librosa
import numpy as np
import torch

def extract_mel_spectrogram(file_path, sr=16000, duration=4.0, 
                              n_mels=128, n_fft=2048, hop_length=512):
    try:
        y, _ = librosa.load(file_path, sr=sr, duration=duration)
        
        # Same padding logic as Colab
        target_length = int(sr * duration)
        if len(y) < target_length:
            y = np.pad(y, (0, target_length - len(y)), mode='constant')
        else:
            y = y[:target_length]
        
        mel = librosa.feature.melspectrogram(
            y=y, sr=sr, n_mels=n_mels,
            n_fft=n_fft, hop_length=hop_length
        )
        mel_db = librosa.power_to_db(mel, ref=np.max)
        
        # Same normalization as Colab
        mel_db = (mel_db - mel_db.mean()) / (mel_db.std() + 1e-8)
        
        return mel_db.astype(np.float32)
    
    except Exception as e:
        print(f"Feature extraction error: {e}")
        return None


def extract_audio_analysis(file_path, sr=16000, duration=4.0):
    """
    Rule-based checks that generate human-readable reasons.
    Runs separately from the model — gives explainability.
    """
    try:
        y, _ = librosa.load(file_path, sr=sr, duration=duration)
        
        reasons = []
        analysis = {}

        # ── Check 1: Pitch Variance ──────────────────────────
        pitches, magnitudes = librosa.piptrack(y=y, sr=sr)
        pitch_values = pitches[pitches > 0]
        pitch_std = float(np.std(pitch_values)) if len(pitch_values) > 0 else 0
        analysis['pitch_std'] = round(pitch_std, 3)
        
        if pitch_std < 20:
            reasons.append({
                "type": "warning",
                "feature": "Pitch Consistency",
                "detail": f"Pitch variation too low ({pitch_std:.1f} Hz). "
                           "Real human speech typically varies more naturally."
            })
        else:
            reasons.append({
                "type": "good",
                "feature": "Pitch Consistency",
                "detail": f"Natural pitch variation detected ({pitch_std:.1f} Hz)."
            })

        # ── Check 2: Spectral Flatness ───────────────────────
        flatness = librosa.feature.spectral_flatness(y=y)
        mean_flatness = float(np.mean(flatness))
        analysis['spectral_flatness'] = round(mean_flatness, 4)
        
        if mean_flatness > 0.1:
            reasons.append({
                "type": "warning",
                "feature": "Spectral Flatness",
                "detail": f"Audio sounds unusually 'clean' (flatness: {mean_flatness:.4f}). "
                           "AI-generated speech often lacks natural noise texture."
            })
        else:
            reasons.append({
                "type": "good",
                "feature": "Spectral Flatness",
                "detail": f"Natural spectral texture present (flatness: {mean_flatness:.4f})."
            })

        # ── Check 3: Zero Crossing Rate ──────────────────────
        zcr = librosa.feature.zero_crossing_rate(y)
        mean_zcr = float(np.mean(zcr))
        analysis['zero_crossing_rate'] = round(mean_zcr, 4)
        
        if mean_zcr > 0.15:
            reasons.append({
                "type": "warning",
                "feature": "Signal Irregularity",
                "detail": f"High zero-crossing rate ({mean_zcr:.4f}) detected. "
                           "May indicate synthetic audio artifacts."
            })
        else:
            reasons.append({
                "type": "good",
                "feature": "Signal Irregularity",
                "detail": f"Normal signal crossing rate ({mean_zcr:.4f})."
            })

        # ── Check 4: Energy / Silence Pattern ────────────────
        rms = librosa.feature.rms(y=y)[0]
        silence_ratio = float(np.mean(rms < 0.01))
        analysis['silence_ratio'] = round(silence_ratio, 3)
        
        if silence_ratio < 0.05:
            reasons.append({
                "type": "warning",
                "feature": "Breathing & Silence",
                "detail": f"Very few natural pauses detected ({silence_ratio*100:.1f}% silence). "
                           "Real speech usually has breathing gaps."
            })
        else:
            reasons.append({
                "type": "good",
                "feature": "Breathing & Silence",
                "detail": f"Natural pause patterns present ({silence_ratio*100:.1f}% silence)."
            })

        # ── Check 5: MFCC Naturalness ────────────────────────
        mfcc = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
        mfcc_var = float(np.mean(np.var(mfcc, axis=1)))
        analysis['mfcc_variance'] = round(mfcc_var, 3)
        
        if mfcc_var < 50:
            reasons.append({
                "type": "warning",
                "feature": "Vocal Tract Pattern",
                "detail": f"MFCC variance unusually low ({mfcc_var:.1f}). "
                           "AI voices often have overly consistent vocal tract patterns."
            })
        else:
            reasons.append({
                "type": "good",
                "feature": "Vocal Tract Pattern",
                "detail": f"Natural vocal tract variation detected ({mfcc_var:.1f})."
            })

        return reasons, analysis

    except Exception as e:
        return [], {"error": str(e)}
