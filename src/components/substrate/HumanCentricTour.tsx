import React, { useState } from 'react';
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  HelpCircle,
  Search,
  BookOpen,
  Keyboard,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  ExternalLink,
  Sliders,
  Server,
  Play,
  Monitor
} from 'lucide-react';
import { TourStep, SystemControlDoc } from '../../types';
import { TOUR_STEPS, SYSTEM_CONTROL_DIRECTORY } from '../../data/InfrastructureNodeMetadata';

interface HumanCentricTourProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateSection?: (sectionId: string) => void;
  defaultTopicId?: string | null;
}

export const HumanCentricTour: React.FC<HumanCentricTourProps> = ({
  isOpen,
  onClose,
  onNavigateSection,
  defaultTopicId,
}) => {
  const [activeTab, setActiveTab] = useState<'tour' | 'manual'>('tour');
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!isOpen) return null;

  const currentStep = TOUR_STEPS[currentStepIdx] || TOUR_STEPS[0];

  const handleNextStep = () => {
    if (currentStepIdx < TOUR_STEPS.length - 1) {
      const nextIdx = currentStepIdx + 1;
      setCurrentStepIdx(nextIdx);
      if (onNavigateSection) {
        onNavigateSection(TOUR_STEPS[nextIdx].section);
      }
    } else {
      onClose();
    }
  };

  const handlePrevStep = () => {
    if (currentStepIdx > 0) {
      const prevIdx = currentStepIdx - 1;
      setCurrentStepIdx(prevIdx);
      if (onNavigateSection) {
        onNavigateSection(TOUR_STEPS[prevIdx].section);
      }
    }
  };

  const handleJumpToStep = (idx: number) => {
    setCurrentStepIdx(idx);
    if (onNavigateSection) {
      onNavigateSection(TOUR_STEPS[idx].section);
    }
  };

  // Filter system controls
  const filteredControls = SYSTEM_CONTROL_DIRECTORY.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.actionSummary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.technicalFunction.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', 'Virtual Compute', 'Operating Systems', 'Display & GPU', 'AI & Neural', 'Storage & I/O', 'Networking'];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Modal Top Header */}
        <div className="bg-slate-950/80 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>SERVERspace Academy &amp; Human-Centric Tour</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Comprehensive Guide
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Master how to navigate, operate, and logically utilize every single button, function, and utility.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Switcher Tabs */}
            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setActiveTab('tour')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                  activeTab === 'tour'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Guided Tour
              </button>
              <button
                onClick={() => setActiveTab('manual')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                  activeTab === 'manual'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Button &amp; Control Directory
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'tour' ? (
            /* GUIDED LEARNING TOUR WALKTHROUGH */
            <div className="space-y-6">
              {/* Stepper Progress bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Step {currentStepIdx + 1} of {TOUR_STEPS.length}</span>
                  <span className="font-mono text-cyan-400 font-bold">{Math.round(((currentStepIdx + 1) / TOUR_STEPS.length) * 100)}% Complete</span>
                </div>
                <div className="grid grid-cols-8 gap-1.5">
                  {TOUR_STEPS.map((step, idx) => (
                    <button
                      key={step.id}
                      onClick={() => handleJumpToStep(idx)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        idx === currentStepIdx
                          ? 'bg-cyan-400 ring-2 ring-cyan-500/40'
                          : idx < currentStepIdx
                          ? 'bg-blue-600'
                          : 'bg-slate-800 hover:bg-slate-700'
                      }`}
                      title={`${step.stepNumber}. ${step.title}`}
                    />
                  ))}
                </div>
              </div>

              {/* Active Step Card */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-6 space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {currentStep.badge || 'Module'}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-1.5">{currentStep.title}</h3>
                  </div>
                  <span className="text-xs font-mono text-slate-500">Section: {currentStep.section}</span>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed">
                  {currentStep.description}
                </p>

                {/* Practical how to use */}
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    <span>How to Logically &amp; Professionally Utilize This:</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed pl-6">
                    {currentStep.howToUse}
                  </p>
                </div>

                {/* Pro tip */}
                <div className="bg-amber-950/20 border border-amber-800/40 rounded-xl p-4 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    <span>Operational Pro-Tip:</span>
                  </div>
                  <p className="text-xs text-amber-200/90 leading-relaxed pl-6">
                    {currentStep.proTip}
                  </p>
                </div>
              </div>

              {/* Navigation controls */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={handlePrevStep}
                  disabled={currentStepIdx === 0}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous Step</span>
                </button>

                <div className="flex items-center gap-2">
                  {onNavigateSection && (
                    <button
                      onClick={() => {
                        onNavigateSection(currentStep.section);
                        onClose();
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Jump Directly to this View</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={handleNextStep}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-500/25 cursor-pointer transition-all"
                  >
                    <span>{currentStepIdx === TOUR_STEPS.length - 1 ? 'Finish Tour' : 'Next Step'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* BUTTON & CONTROL DIRECTORY (EVERY SINGLE BUTTON EXPLAINED) */
            <div className="space-y-4">
              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search any button, function, or technical utility..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap cursor-pointer transition-colors ${
                        selectedCategory === cat
                          ? 'bg-cyan-600 text-white shadow-sm'
                          : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Directory Items Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredControls.map((item) => (
                  <div
                    key={item.id}
                    className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                          {item.category}
                        </span>
                        <h4 className="text-sm font-bold text-white mt-1.5">{item.title}</h4>
                      </div>
                      {item.keyboardShortcut && (
                        <span className="text-[10px] font-mono px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300">
                          {item.keyboardShortcut}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {item.actionSummary}
                    </p>

                    <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-[11px]">
                      <div>
                        <strong className="text-slate-400">Technical Function: </strong>
                        <span className="text-slate-300 font-mono text-[10px]">{item.technicalFunction}</span>
                      </div>
                      <div>
                        <strong className="text-slate-400">Operational Consequence: </strong>
                        <span className="text-amber-300/90">{item.operationalConsequence}</span>
                      </div>
                      <div>
                        <strong className="text-slate-400">Status Indicator: </strong>
                        <span className="text-emerald-400">{item.statusIndicator}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
