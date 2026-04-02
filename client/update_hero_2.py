import re
import sys

file_path = r'c:\Users\Student\Desktop\DEEPFAKE DETECTION\client\src\pages\LandingPage.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    orig = f.read()

hero_pattern = r'\{\/\* Hero Section \*\/\}\n\s*<section className="relative w-full overflow-hidden py-16 lg:py-28 bg-white cursor-crosshair">.*?<\/section>'

hero_replacement = r'''{/* Hero Section */}
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
              className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1] mb-6 drop-shadow-2xl"
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
          <div className="absolute top-1/2 -translate-y-1/2 w-full max-w-[1400px] h-0 pointer-events-none hidden xl:block z-10">
            {/* Left Card - Audio Spectrogram */}
            <motion.div
              animate={{ y: [-15, 15, -15], rotateZ: [-2, 2, -2] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute left-[5%] xl:left-[2%] 2xl:left-[10%] -top-32 w-72 p-5 rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl shadow-[0_0_40px_rgba(0,0,0,0.5)] z-20"
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
                    animate={{ height: ['10%', f"{10 + (i%3)*30}%", '10%'] }}
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
              className="absolute right-[5%] xl:right-[2%] 2xl:right-[10%] -top-12 w-80 p-5 rounded-3xl border border-white/10 bg-slate-900/60 backdrop-blur-xl shadow-[0_0_40px_rgba(0,0,0,0.5)] z-20"
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
                <div className="ml-auto w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
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
      </section>'''

new_content = re.sub(hero_pattern, hero_replacement, orig, flags=re.DOTALL)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

if orig == new_content:
    print("NO CHANGES MADE. Regex failed.")
else:
    print("Successfully replaced.")
