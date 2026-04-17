import numpy as np
from PIL import Image, ImageFilter
import cv2

def extract_image_analysis(image_path):
    """
    Rule-based visual checks that generate human-readable reasons.
    Runs separately from the model — gives explainability.
    """
    try:
        img_pil = Image.open(image_path).convert("RGB")
        img = np.array(img_pil)
        gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)

        reasons = []
        analysis = {}

        # ── Check 1: Noise Pattern (Laplacian Variance) ──────────────
        # Real photos have natural sensor noise; GANs produce unnaturally smooth images
        laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
        analysis['noise_variance'] = round(laplacian_var, 2)

        if laplacian_var < 100:
            reasons.append({
                "type": "warning",
                "feature": "Noise Pattern",
                "detail": f"Unusually low image noise detected (variance: {laplacian_var:.1f}). "
                           "AI-generated images often lack natural camera sensor noise."
            })
        else:
            reasons.append({
                "type": "good",
                "feature": "Noise Pattern",
                "detail": f"Natural noise texture present (variance: {laplacian_var:.1f}). "
                           "Consistent with real camera sensor characteristics."
            })

        # ── Check 2: Edge Consistency (Sobel) ────────────────────────
        # Deepfakes often have blurred or inconsistent edges around face boundaries
        sobelx = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)
        sobely = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)
        edge_strength = float(np.mean(np.sqrt(sobelx**2 + sobely**2)))
        analysis['edge_strength'] = round(edge_strength, 3)

        if edge_strength < 15:
            reasons.append({
                "type": "warning",
                "feature": "Edge Consistency",
                "detail": f"Weak edge definition detected (strength: {edge_strength:.2f}). "
                           "AI-generated faces often have unnaturally smooth boundaries."
            })
        else:
            reasons.append({
                "type": "good",
                "feature": "Edge Consistency",
                "detail": f"Natural edge sharpness detected (strength: {edge_strength:.2f}). "
                           "Edge patterns consistent with real photography."
            })

        # ── Check 3: Color Distribution ───────────────────────────────
        # GAN images often have unusual color channel variance
        r_std = float(np.std(img[:, :, 0]))
        g_std = float(np.std(img[:, :, 1]))
        b_std = float(np.std(img[:, :, 2]))
        color_balance = float(np.std([r_std, g_std, b_std]))
        analysis['color_balance'] = round(color_balance, 3)
        analysis['rgb_std'] = {
            'r': round(r_std, 2),
            'g': round(g_std, 2),
            'b': round(b_std, 2)
        }

        if color_balance > 8:
            reasons.append({
                "type": "warning",
                "feature": "Color Distribution",
                "detail": f"Uneven color channel distribution detected (imbalance: {color_balance:.2f}). "
                           "AI images often show unusual RGB channel variance."
            })
        else:
            reasons.append({
                "type": "good",
                "feature": "Color Distribution",
                "detail": f"Balanced color distribution detected (imbalance: {color_balance:.2f}). "
                           "RGB channels show natural photographic balance."
            })

        # ── Check 4: Frequency Domain (FFT) ──────────────────────────
        # GANs leave periodic artifacts in the frequency domain
        f_transform = np.fft.fft2(gray)
        f_shift = np.fft.fftshift(f_transform)
        magnitude = 20 * np.log(np.abs(f_shift) + 1)
        h, w = magnitude.shape
        center_energy = float(np.mean(magnitude[h//4:3*h//4, w//4:3*w//4]))
        total_energy = float(np.mean(magnitude))
        freq_ratio = round(center_energy / (total_energy + 1e-8), 3)
        analysis['frequency_ratio'] = freq_ratio

        if freq_ratio > 1.8:
            reasons.append({
                "type": "warning",
                "feature": "Frequency Artifacts",
                "detail": f"Unusual frequency concentration detected (ratio: {freq_ratio:.3f}). "
                           "GAN models often leave periodic artifacts in the frequency domain."
            })
        else:
            reasons.append({
                "type": "good",
                "feature": "Frequency Artifacts",
                "detail": f"Natural frequency distribution detected (ratio: {freq_ratio:.3f}). "
                           "No periodic GAN artifacts found in frequency analysis."
            })

        # ── Check 5: Facial Symmetry ──────────────────────────────────
        # Deepfakes often have subtle left-right asymmetry
        h, w = gray.shape
        left_half = gray[:, :w//2]
        right_half = np.fliplr(gray[:, w//2:])
        min_w = min(left_half.shape[1], right_half.shape[1])
        symmetry_diff = float(np.mean(np.abs(
            left_half[:, :min_w].astype(float) - right_half[:, :min_w].astype(float)
        )))
        analysis['symmetry_diff'] = round(symmetry_diff, 3)

        if symmetry_diff > 25:
            reasons.append({
                "type": "warning",
                "feature": "Facial Symmetry",
                "detail": f"High facial asymmetry detected (diff: {symmetry_diff:.1f}). "
                           "Deepfake generation can introduce subtle structural inconsistencies."
            })
        else:
            reasons.append({
                "type": "good",
                "feature": "Facial Symmetry",
                "detail": f"Normal facial symmetry detected (diff: {symmetry_diff:.1f}). "
                           "Left-right facial structure appears consistent."
            })

        return reasons, analysis

    except Exception as e:
        return [], {"error": str(e)}
