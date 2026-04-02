const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'pages', 'LandingPage.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace WireframeGlobe and FUIOverlay
content = content.replace(
  /const WireframeGlobe = \(\) => \{\s*const meshRef = useRef\(\);\s*useFrame\(\(state\) => \{\s*meshRef\.current\.rotation\.y \+= 0\.003;\s*meshRef\.current\.rotation\.x = Math\.sin\(state\.clock\.elapsedTime \* 0\.3\) \* 0\.2;\s*\}\);\s*return \(\s*<mesh ref=\{meshRef\} scale=\{2\.5\} position=\{\[3, 0, -2\]\}>\s*<sphereGeometry args=\{\[1, 32, 32\]\} \/>\s*<meshBasicMaterial color="#3b82f6" wireframe transparent opacity=\{0\.08\} \/>\s*<\/mesh>\s*\);\s*\};\s*const FUIOverlay = \(\) => \{\s*const \[data, setData\] = useState\(\{ lat: 34\.05, lng: -118\.24, bitrate: 4\.5 \}\);\s*useEffect\(\(\) => \{\s*const interval = setInterval\(\(\) => \{\s*setData\(\{\s*lat: 34\.05 \+ \(Math\.random\(\) \* 0\.01 - 0\.005\),\s*lng: -118\.24 \+ \(Math\.random\(\) \* 0\.01 - 0\.005\),\s*bitrate: 4\.0 \+ Math\.random\(\) \* 1\.5\s*\}\);\s*\}, 500\);\s*return \(\) => clearInterval\(interval\);\s*\}, \[\]\);\s*return \(\s*<div className="absolute top-4 left-4 lg:top-8 lg:left-8 text-\[10px\] text-blue-500 font-mono tracking-widest opacity-60 flex flex-col gap-1 pointer-events-none z-10 hidden sm:flex">\s*<div className="flex items-center gap-2 mb-1 text-slate-400"><Crosshair className="w-3 h-3" \/> SYS\.COORD\.TRACK<\/div>\s*<div>\[LAT: \{data\.lat\.toFixed\(4\)\}\]<\/div>\s*<div>\[LNG: \{data\.lng\.toFixed\(4\)\}\]<\/div>\s*<div>\[BITRATE: \{data\.bitrate\.toFixed\(1\)\} MB\/s\]<\/div>\s*<\/div>\s*\);\s*\};/g,
  `const ThreadNetwork = () => {
  const groupRef = useRef();
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.0015;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh scale={3.5}>
        <icosahedronGeometry args={[1, 2]} />
        <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.06} />
      </mesh>
      <mesh scale={2.2} rotation={[Math.PI / 4, 0, 0]}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial color="#818cf8" wireframe transparent opacity={0.15} />
      </mesh>
      <mesh scale={1.2} rotation={[0, Math.PI / 4, Math.PI / 6]}>
        <icosahedronGeometry args={[1, 3]} />
        <meshBasicMaterial color="#34d399" wireframe transparent opacity={0.1} />
      </mesh>
    </group>
  );
};

const FUIOverlay = () => {
  const [data, setData] = useState({ lat: 34.05, lng: -118.24, bitrate: 4.5 });
  
  useEffect(() => {
    const interval = setInterval(() => {
      setData({
        lat: 34.05 + (Math.random() * 0.01 - 0.005),
        lng: -118.24 + (Math.random() * 0.01 - 0.005),
        bitrate: 4.0 + Math.random() * 1.5
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute top-28 left-6 lg:top-36 lg:left-12 text-[10px] text-cyan-500 font-mono tracking-widest opacity-60 flex flex-col gap-1 pointer-events-none z-10 hidden sm:flex">
      <div className="flex items-center gap-2 mb-1 text-slate-400"><Crosshair className="w-3 h-3 text-cyan-400" /> SYS.COORD.TRACK</div>
      <div>[LAT: {data.lat.toFixed(4)}]</div>
      <div>[LNG: {data.lng.toFixed(4)}]</div>
      <div>[BITRATE: {data.bitrate.toFixed(1)} MB/s]</div>
      <div className="mt-2 text-emerald-400 animate-pulse">[SECURE CONNECTION]</div>
    </div>
  );
};`
);

// Remove unused hooks
content = content.replace(
  /  \/\/ Scroll animations for the Hero live preview\n  const heatmapOpacity = useTransform\(scrollY, \[0, 300\], \[0, 1\]\);\n  const realBoxOpacity = useTransform\(scrollY, \[0, 300\], \[1, 0\.4\]\);\n  const dynamicScanLine = useTransform\(scrollY, \[0, 300\], \['0%', '100%']\);\n/g,
  ''
);

// Replace the min-h-screen class and navigation bar
content = content.replace(
  /<div className="min-h-screen bg-white font-sans text-slate-900 flex flex-col">\n\s*\{\/\* Navigation Bar \*\/\}\n\s*<nav className="flex items-center justify-between px-6 lg:px-12 h-20 bg-white\/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">([\s\S]*?)<\/nav>/g,
  `<div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col relative">
      {/* Navigation Bar */}
      <nav className="absolute top-0 w-full flex items-center justify-between px-6 lg:px-12 h-24 bg-transparent z-50">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          <img src={logo} alt="Logo" className="w-16 h-16 drop-shadow-[0_0_15px_rgba(56,189,248,0.5)]" />
          <span className="text-2xl font-black tracking-tight text-white drop-shadow-md">TrueLens AI</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-300">
          <span className="hover:text-cyan-400 cursor-pointer transition-colors shadow-sm">Home</span>
          <span className="hover:text-cyan-400 cursor-pointer transition-colors shadow-sm">About</span>
          <span className="hover:text-cyan-400 cursor-pointer transition-colors shadow-sm">Pricing</span>
        </div>
        
        <div className="flex items-center gap-6">
          <button className="hidden sm:flex text-sm font-bold text-slate-300 hover:text-white transition-colors items-center gap-2">
            Sign In
          </button>
          <button 
            onClick={() => navigate('/detect')}
            className="text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-6 py-2.5 rounded-full shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all flex items-center gap-2 border border-blue-400/30"
          >
            <Play className="w-4 h-4 fill-current" /> View Demo
          </button>
        </div>
      </nav>`
);

// Replace the Hero Section
content = content.replace(
  /\{\/\* Hero Section \*\/\}\n\s*<section className="relative w-full overflow-hidden py-16 lg:py-28 bg-white cursor-crosshair">[\s\S]*?<\/section>/g,
  `{/* Hero Section */}
      <section className="relative w-full min-h-screen overflow-hidden flex items-center bg-[#050B14] cursor-crosshair">
        
        <FUIOverlay />

        {/* 3D Canvas Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <Canvas camera={{ position: [0, 0, 6], fov: 60 }}>
            <ambientLight intensity={0.5} />
            <ThreadNetwork />
          </Canvas>
          {/* Subtle Radial Gradient Overlay for depth */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#050B14]/80 to-[#050B14] z-10" />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full relative z-20 flex flex-col items-center justify-center pt-32 lg:pt-40 text-center">
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center max-w-4xl"
          >
            {/* Badges */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/50 text-cyan-400 text-xs font-bold uppercase tracking-widest border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)] backdrop-blur-md mb-8"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              Next-Gen Neural Detection
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white leading-[1.1] mb-6 drop-shadow-2xl"
            >
              Detect <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500">Deepfakes</span><br/>With Absolute Precision
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl leading-relaxed"
            >
              Protect your organization from synthetic media and AI-generated fraud using continuous 3D spatial analysis and advanced neural networking.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto"
            >
              <button
                onClick={() => navigate('/detect')}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                className="relative overflow-hidden w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white rounded-full font-bold text-lg transition-all shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] hover:-translate-y-1 flex items-center justify-center gap-3 group border border-cyan-400/50 z-30"
              >
                Launch Scanner
                {isHovering ? (
                  <div className="w-6 h-6 flex items-center justify-center opacity-90 mix-blend-screen scale-150">
                    <Lottie animationData={scanningLottie} loop={true} autoplay={true} />
                  </div>
                ) : (
                  <ScanLine className="w-6 h-6 transition-transform group-hover:scale-110" />
                )}
              </button>
              <button
                className="w-full sm:w-auto px-10 py-4 bg-slate-800/50 hover:bg-slate-800 text-white border border-slate-600 hover:border-slate-400 backdrop-blur-md shadow-lg rounded-full font-bold text-lg transition-all flex items-center justify-center gap-3 z-30"
              >
                Watch Demo <Play className="w-5 h-5 fill-slate-300" />
              </button>
            </motion.div>
          </motion.div>
          
          {/* Symmetrical Floating Cards */}
          <div className="absolute top-1/2 -translate-y-1/2 w-full max-w-[1400px] h-0 pointer-events-none hidden xl:block">
            {/* Left Card - Audio Spectrogram */}
            <motion.div
              animate={{ y: [-15, 15, -15], rotateZ: [-2, 2, -2] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute left-[5%] -top-40 w-72 p-5 rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl shadow-[0_0_40px_rgba(0,0,0,0.5)] z-20"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent rounded-3xl pointer-events-none" />
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                  <AudioLines className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-white text-xs font-bold uppercase tracking-wider">Audio Vector</h3>
                  <p className="text-indigo-300/70 text-[10px] font-mono">DeepFake_v2.wav</p>
                </div>
              </div>
              <div className="h-16 flex items-end justify-between px-1 mt-4 border-b border-indigo-500/30 pb-2">
                {[...Array(24)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: ['10%', \`\${10 + Math.random() * 80}%\`, '10%'] }}
                    transition={{ duration: 0.4 + (i%5)*0.2, repeat: Infinity }}
                    className="w-1.5 bg-gradient-to-t from-indigo-600 to-indigo-300 rounded-sm shadow-[0_0_5px_rgba(99,102,241,0.5)]"
                  />
                ))}
              </div>
            </motion.div>

            {/* Right Card - Video Scanner */}
            <motion.div
              animate={{ y: [15, -15, 15], rotateZ: [2, -2, 2] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute right-[5%] -top-20 w-80 p-5 rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl shadow-[0_0_40px_rgba(0,0,0,0.5)] z-20"
            >
              <div className="absolute inset-0 bg-gradient-to-bl from-cyan-500/10 to-transparent rounded-3xl pointer-events-none" />
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                  <Video className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-white text-xs font-bold uppercase tracking-wider">Frame Analysis</h3>
                  <p className="text-cyan-300/70 text-[10px] font-mono">Target_Subject_A.mp4</p>
                </div>
                <div className="ml-auto w-2 h-2 rounded-full bg-red-500 animate-ping shadow-[0_0_10px_rgba(239,68,68,1)]" />
              </div>
              <div className="relative rounded-lg overflow-hidden h-32 bg-slate-800 border border-slate-700">
                <motion.div 
                  initial={{ top: '0%' }}
                  animate={{ top: '100%' }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 w-full h-[2px] bg-cyan-400 shadow-[0_0_15px_#22d3ee] z-30"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-60">
                   <ShieldCheck className="w-16 h-16 text-slate-500" />
                </div>
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.5)_1px,transparent_1px)] bg-[size:10px_10px] pointer-events-none" />
              </div>
              <div className="mt-3 text-[10px] text-cyan-500 font-mono flex justify-between animate-pulse">
                <span>DETECTING MESH...</span>
                <span>%98.4</span>
              </div>
            </motion.div>
          </div>

        </div>

        {/* Bottom fading gradient to blend with the next section */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-50 to-transparent z-10 pointer-events-none"></div>
      </section>`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Update complete');
