import React, { useState, useEffect } from 'react';
import { ImageUploadIcon, DownloadIcon, SolidCircleIcon, SolidSquareIcon, CrossStitchIcon } from './Icons';
import { Logo } from './Logo';

// A simple pumpkin silhouette path for the demo
const PumpkinIcon: React.FC = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-16 h-16 text-slate-500">
    <path d="M22,10.5c0-3.2-2.5-5.7-5.7-5.7c-1.8,0-3.4,0.8-4.5,2.1C10.7,5.6,9.1,4.8,7.3,4.8C4.1,4.8,1.6,7.3,1.6,10.5 c0,2.4,1.6,4.5,3.8,5.3c-0.2,0.4-0.3,0.9-0.3,1.3c0,1.9,1.6,3.5,3.5,3.5c1.6,0,3-1.1,3.4-2.6c0.4,0.1,0.8,0.2,1.2,0.2 s0.8-0.1,1.2-0.2c0.4,1.5,1.8,2.6,3.4,2.6c1.9,0,3.5-1.6,3.5-3.5c0-0.5-0.1-0.9-0.3-1.3C20.4,15,22,12.9,22,10.5z M16.3,12.2 c-0.6,0-1-0.5-1-1s0.5-1,1-1s1,0.5,1,1S16.9,12.2,16.3,12.2z M7.3,12.2c-0.6,0-1-0.5-1-1s0.5-1,1-1s1,0.5,1,1S7.9,12.2,7.3,12.2z M15.1,15.8c-0.8,0.8-2,1.3-3.3,1.3s-2.5-0.5-3.3-1.3c-0.4-0.4-0.4-1,0-1.4c0.4-0.4,1-0.4,1.4,0c0.5,0.5,1.2,0.8,2,0.8 s1.5-0.3,2-0.8c0.4-0.4,1-0.4,1.4,0C15.5,14.8,15.5,15.4,15.1,15.8z"></path>
  </svg>
);


const steps = [
  { name: 'Step 1', title: 'Upload an Image' },
  { name: 'Step 2', title: 'Customize Your Pattern' },
  { name: 'Step 3', title: 'Choose Your Style' },
  { name: 'Step 4', title: 'Download & Stitch' },
];

const HowToVideo: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentStep(prevStep => (prevStep + 1) % steps.length);
    }, 4000); // Cycle every 4 seconds

    return () => clearTimeout(timer);
  }, [currentStep]);

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 text-center mb-2">How It Works</h2>
      <p className="text-slate-600 text-lg text-center mb-8 max-w-2xl">
        Create your perfect cross-stitch pattern in four simple, quick steps. Watch the short demo below to see it in action.
      </p>
      
      <div className="w-full max-w-3xl bg-slate-800 rounded-xl shadow-2xl overflow-hidden border-4 border-slate-700">
        <div className="h-8 bg-slate-700 flex items-center px-3">
            <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
        </div>
        
        <div className="relative aspect-video bg-slate-50 flex items-center justify-center p-8 overflow-hidden">
          <div className="absolute top-4 left-4 flex items-center gap-2 z-20">
            <Logo className="w-6 h-6 text-slate-400" />
            <span className="font-semibold text-slate-400 text-sm hidden sm:block">Cross-Stitch Genie</span>
          </div>

          {/* Keyframes for animations */}
          <style>{`
            @keyframes icon-swoop {
              0% { transform: translate(80px, -80px) scale(0.5); opacity: 0; }
              50% { opacity: 1; }
              100% { transform: translate(0, 0) scale(1); opacity: 1; }
            }
            .swoop { animation: icon-swoop 1s ease-in-out forwards; }
            
            @keyframes slider-anim {
              0%, 100% { width: 25%; }
              50% { width: 75%; }
            }
            .slider-animate::after {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              height: 100%;
              background-color: #0ea5e9; /* sky-500 */
              border-radius: 9999px;
              animation: slider-anim 2s ease-in-out infinite;
            }
             @keyframes press {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(0.95); }
            }
            .press-animate { animation: press 1s ease-in-out 1s; }
            
            @keyframes fly-out {
               0% { transform: translate(0, 0) scale(0.5); opacity: 1; }
               100% { transform: translate(100px, -100px) scale(0.2); opacity: 0; }
            }
            .fly-out { animation: fly-out 1s ease-in 1.5s forwards; }
            
            @keyframes icon-pop-in {
              0% { transform: scale(0.5); opacity: 0; }
              100% { transform: scale(1); opacity: 1; }
            }
            .icon-pop-in { animation: icon-pop-in 0.5s ease-out forwards; }
            
            @keyframes select-highlight {
              0%, 100% { transform: scale(1); background-color: white; border-color: #cbd5e1; } /* slate-300 */
              50% { transform: scale(1.1); background-color: #e0f2fe; border-color: #0ea5e9; } /* sky-100, sky-500 */
            }
            .select-highlight { animation: select-highlight 1.5s ease-in-out 1s; }
          `}</style>

          {/* Step 1: Upload */}
          <div className={`absolute w-full h-full flex flex-col items-center justify-center transition-opacity duration-500 ${currentStep === 0 ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
            <div className="relative w-72 h-40 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center bg-white p-4">
              <ImageUploadIcon className="w-12 h-12 text-slate-400" />
              <p className="text-slate-500 mt-2 text-sm">Drag & drop your image</p>
              <div className="absolute swoop" style={{animationDelay: '0.5s'}}>
                 <PumpkinIcon />
              </div>
            </div>
          </div>
          
          {/* Step 2: Customize */}
          <div className={`absolute w-full h-full flex items-center justify-center gap-8 transition-opacity duration-500 ${currentStep === 1 ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
            <div className="w-48 h-48 bg-white border border-slate-200 rounded-lg flex items-center justify-center p-2">
                 <div className="grid grid-cols-8 gap-1">
                    {Array.from({ length: 64 }).map((_, i) => (
                        <div key={i} className={`w-3 h-3 rounded-full ${Math.random() > 0.4 ? 'bg-slate-700' : 'bg-transparent'}`} />
                    ))}
                 </div>
            </div>
            <div className="w-56 space-y-6">
                <div>
                  <label className="block text-xs font-medium text-slate-600">Stitch Count</label>
                  <div className="w-full h-2 mt-1 bg-slate-200 rounded-full relative slider-animate"></div>
                </div>
                 <div>
                  <label className="block text-xs font-medium text-slate-600">Threshold</label>
                  <div className="w-full h-2 mt-1 bg-slate-200 rounded-full relative slider-animate" style={{animationDelay: '1s'}}></div>
                </div>
            </div>
          </div>

          {/* Step 3: Choose Style */}
          <div className={`absolute w-full h-full flex flex-col items-center justify-center transition-opacity duration-500 ${currentStep === 2 ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
            <div className="flex items-center justify-center gap-4">
              <div className="icon-pop-in p-4 bg-white border-2 border-slate-300 rounded-lg" style={{ animationDelay: '0.5s' }}>
                <SolidCircleIcon className="w-12 h-12 text-slate-600" />
              </div>
              <div className="icon-pop-in p-4 bg-white border-2 border-slate-300 rounded-lg select-highlight" style={{ animationDelay: '0.7s' }}>
                <CrossStitchIcon className="w-12 h-12 text-slate-600" />
              </div>
              <div className="icon-pop-in p-4 bg-white border-2 border-slate-300 rounded-lg" style={{ animationDelay: '0.9s' }}>
                <SolidSquareIcon className="w-12 h-12 text-slate-600" />
              </div>
            </div>
          </div>
          
          {/* Step 4: Download */}
          <div className={`absolute w-full h-full flex flex-col items-center justify-center transition-opacity duration-500 ${currentStep === 3 ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
            <div className="relative space-y-3">
                <button className="w-56 flex items-center justify-center gap-2 px-4 py-3 bg-sky-500 text-white font-semibold rounded-lg shadow-md press-animate">
                    <DownloadIcon className="w-5 h-5" />
                    PDF (with Instructions)
                </button>
                <div className="absolute top-0 right-[-20px] fly-out">
                  <div className="w-12 h-14 bg-white border-2 border-red-500 rounded-md shadow-lg">
                    <p className="text-xs font-bold text-red-500 text-center border-b border-red-500">PDF</p>
                  </div>
                </div>
                <button className="w-56 flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 text-white font-semibold rounded-lg shadow-md">
                    <DownloadIcon className="w-5 h-5" />
                    Download PNG
                </button>
            </div>
          </div>

          {/* Step Title & Timeline */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center w-full max-w-md">
            <div className="relative h-8 w-full flex items-center justify-center">
                 {steps.map((step, index) => (
                    <div key={step.name} className={`absolute transition-all duration-500 ${currentStep === index ? 'opacity-100' : 'opacity-0 -translate-y-2'}`}>
                       <p className="font-bold text-slate-800 text-center">
                         <span className="text-sky-500">{step.name}:</span> {step.title}
                       </p>
                    </div>
                 ))}
            </div>
            
            <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden mt-2">
                 <div className="bg-sky-500 h-1 rounded-full" style={{ width: `${((currentStep + 1) / steps.length) * 100}%`, transition: 'width 0.5s ease-out' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowToVideo;