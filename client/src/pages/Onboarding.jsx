import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { CATEGORIES, TOP_SOURCES } from '../utils/formatters';
import { Check, Sparkles, ArrowRight, CheckCircle2, Compass } from 'lucide-react';

export default function Onboarding() {
  const { user, updatePreferences } = useAuthStore();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [selectedInterests, setSelectedInterests] = useState(user?.interests || ['technology', 'ai', 'business']);
  const [selectedSources, setSelectedSources] = useState(user?.preferredSources || ['The Verge', 'TechCrunch', 'Bloomberg']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleInterest = (id) => {
    if (selectedInterests.includes(id)) {
      if (selectedInterests.length > 1) {
        setSelectedInterests(selectedInterests.filter(i => i !== id));
      }
    } else {
      setSelectedInterests([...selectedInterests, id]);
    }
  };

  const toggleSource = (src) => {
    if (selectedSources.includes(src)) {
      setSelectedSources(selectedSources.filter(s => s !== src));
    } else {
      setSelectedSources([...selectedSources, src]);
    }
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      await updatePreferences({
        interests: selectedInterests,
        preferredSources: selectedSources,
        onboardingCompleted: true
      });
      navigate('/for-you');
    } catch (err) {
      console.warn('Onboarding update failed');
      navigate('/for-you');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 sm:px-0 animate-in fade-in duration-300">
      {/* Progress Indicators */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-bold text-xs flex items-center justify-center font-display">
            N
          </span>
          <span className="font-editorial text-lg font-bold text-neutral-950 dark:text-white">
            NewsHub Onboarding
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
          <span className={step >= 1 ? 'text-neutral-900 dark:text-neutral-100 font-bold' : ''}>01. Topics</span>
          <span>/</span>
          <span className={step >= 2 ? 'text-neutral-900 dark:text-neutral-100 font-bold' : ''}>02. Sources</span>
          <span>/</span>
          <span className={step >= 3 ? 'text-neutral-900 dark:text-neutral-100 font-bold' : ''}>03. Ready</span>
        </div>
      </div>

      {/* Step 1: Topics */}
      {step === 1 && (
        <div className="bg-white dark:bg-[#161616] border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 space-y-6">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">Step 1 of 3</span>
            <h1 className="font-editorial text-2xl sm:text-3xl font-semibold text-neutral-950 dark:text-white mt-1">
              What do you want to read?
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Select 3 or more topics to initialize your tailored recommendation model.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {CATEGORIES.filter(c => c.id !== 'all').map((cat) => {
              const isSelected = selectedInterests.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleInterest(cat.id)}
                  className={`p-4 border text-left flex flex-col justify-between transition-all duration-150 ${
                    isSelected
                      ? 'border-neutral-900 bg-neutral-100/70 dark:border-neutral-100 dark:bg-neutral-800/80 text-neutral-950 dark:text-white'
                      : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider">{cat.name}</span>
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                      isSelected ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 border-transparent' : 'border-neutral-300 dark:border-neutral-700'
                    }`}>
                      {isSelected && <Check size={10} strokeWidth={3} />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={selectedInterests.length === 0}
              className="px-6 py-2.5 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 text-xs font-bold uppercase tracking-widest hover:opacity-90 disabled:opacity-40 transition-opacity flex items-center gap-2"
            >
              <span>Next: Sources</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Sources */}
      {step === 2 && (
        <div className="bg-white dark:bg-[#161616] border border-neutral-200 dark:border-neutral-800 p-6 sm:p-8 space-y-6">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400">Step 2 of 3</span>
            <h1 className="font-editorial text-2xl sm:text-3xl font-semibold text-neutral-950 dark:text-white mt-1">
              Choose your favourite sources
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Select trusted publications to prioritize in your news feed.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {TOP_SOURCES.map((source) => {
              const isSelected = selectedSources.includes(source);
              return (
                <button
                  key={source}
                  type="button"
                  onClick={() => toggleSource(source)}
                  className={`p-3.5 border text-left flex items-center justify-between transition-all duration-150 ${
                    isSelected
                      ? 'border-neutral-900 bg-neutral-100/70 dark:border-neutral-100 dark:bg-neutral-800/80 text-neutral-950 dark:text-white font-medium'
                      : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 text-neutral-600 dark:text-neutral-400'
                  }`}
                >
                  <span className="text-xs truncate">{source}</span>
                  <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border shrink-0 ${
                    isSelected ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 border-transparent' : 'border-neutral-300 dark:border-neutral-700'
                  }`}>
                    {isSelected && <Check size={8} strokeWidth={3} />}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2 border border-neutral-300 dark:border-neutral-700 text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-6 py-2.5 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <span>Review Feed</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Completion & Ready */}
      {step === 3 && (
        <div className="bg-white dark:bg-[#161616] border border-neutral-200 dark:border-neutral-800 p-8 text-center space-y-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100">
            <CheckCircle2 size={28} strokeWidth={1.8} />
          </div>

          <div>
            <h1 className="font-editorial text-2xl sm:text-3xl font-semibold text-neutral-950 dark:text-white">
              Your personalized feed is ready.
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-2 max-w-md mx-auto">
              We calibrated your recommendation engine with {selectedInterests.length} interest domains and {selectedSources.length} preferred publishers.
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 justify-center max-w-md mx-auto py-2">
            {selectedInterests.map(i => (
              <span key={i} className="px-2.5 py-1 text-[10px] uppercase font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
                {i}
              </span>
            ))}
          </div>

          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 flex justify-center">
            <button
              type="button"
              onClick={handleFinish}
              disabled={isSubmitting}
              className="px-8 py-3 bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <Compass size={14} />
              <span>{isSubmitting ? 'Finalizing Setup...' : 'Explore My News Feed'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
