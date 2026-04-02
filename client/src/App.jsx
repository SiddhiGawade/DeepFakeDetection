import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import DetectionPage from './pages/DetectionPage';
import ImageDetectionPage from './pages/ImageDetectionPage';
import AudioDetectionPage from './pages/AudioDetectionPage';
import VideoDetectionPage from './pages/VideoDetectionPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/detect" element={<DetectionPage />} />
        <Route path="/image-detection" element={<ImageDetectionPage />} />
        <Route path="/audio-detection" element={<AudioDetectionPage />} />
        <Route path="/video-detection" element={<VideoDetectionPage />} />
      </Routes>
    </Router>
  );
}

export default App;
