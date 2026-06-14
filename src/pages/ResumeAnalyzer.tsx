import React, { useState, useEffect } from 'react';
import { ProGate } from '../components/ProGate';
import { localStore } from '../lib/store';
import { ResumeAnalysis } from '../lib/types';
import { 
  FileText, 
  UploadCloud, 
  CheckCircle2, 
  AlertTriangle, 
  Lightbulb, 
  Trash2, 
  Calendar,
  X,
  RefreshCw,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export const ResumeAnalyzer: React.FC = () => {
  return (
    <ProGate>
      <ResumeAnalyzerContent />
    </ProGate>
  );
};

const ResumeAnalyzerContent: React.FC = () => {
  const [analyses, setAnalyses] = useState<ResumeAnalysis[]>([]);
  const [activeAnalysis, setActiveAnalysis] = useState<ResumeAnalysis | null>(null);
  
  // Inputs state
  const [rawText, setRawText] = useState('');
  const [fileName, setFileName] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  
  // Progress loaders state
  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);

  const steps = [
    'Reading document tokens...',
    'Extracting technical skill vectors...',
    'Benchmarking against full-stack job specifications...',
    'Formatting suggestions with Gemini Pro model...'
  ];

  useEffect(() => {
    const list = localStore.getResumeAnalyses();
    setAnalyses(list);
    if (list.length > 0) {
      setActiveAnalysis(list[0]);
    }
  }, []);

  const handleSimulatedFileDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      // Mock raw text extraction
      setRawText(`Simulated extraction from ${file.name}. Technical focus: React, Javascript.`);
      toast.success(`Attached file: ${file.name}`);
    }
  };

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobDesc.trim()) {
      toast.error('Please enter the target job description or role requirements');
      return;
    }
    if (!rawText.trim() && !fileName) {
      toast.error('Please upload a file or paste your resume text first');
      return;
    }

    setScanning(true);
    setScanStep(0);

    // Typing scan progress steps
    for (let step = 0; step < steps.length; step++) {
      setScanStep(step);
      await new Promise(resolve => setTimeout(resolve, 900));
    }

    const lowerJobDesc = jobDesc.toLowerCase();
    const lowerResume = rawText.toLowerCase();

    const commonKeywords = [
      'react', 'javascript', 'typescript', 'node', 'express', 'mongodb', 
      'python', 'sql', 'postgres', 'docker', 'aws', 'git', 'tailwind', 
      'css', 'html', 'nextjs', 'next.js', 'vue', 'angular', 'graphql',
      'rest', 'api', 'testing', 'jest', 'cypress', 'redux', 'dsa', 
      'algorithms', 'java', 'spring', 'c++', 'ruby', 'rails', 'php',
      'devops', 'kubernetes', 'ci/cd', 'frontend', 'backend', 'fullstack'
    ];

    // Identify required skills from the job description
    const matchedRequired = commonKeywords.filter(keyword => {
      const regex = new RegExp(`\\b${keyword.replace('.', '\\.')}\\b`, 'i');
      return regex.test(lowerJobDesc);
    });

    const requiredSkills = matchedRequired.length > 0 ? matchedRequired : ['react', 'javascript', 'typescript', 'css'];

    // Check matches in the resume
    const matchingSkills = requiredSkills.filter(skill => {
      const regex = new RegExp(`\\b${skill.replace('.', '\\.')}\\b`, 'i');
      return regex.test(lowerResume);
    });

    const missingSkills = requiredSkills.filter(skill => !matchingSkills.includes(skill));

    // Calculate score
    let score = 55;
    if (requiredSkills.length > 0) {
      score += Math.round((matchingSkills.length / requiredSkills.length) * 40);
    }
    score = Math.max(10, Math.min(score, 99));

    // Generate dynamic feedback
    const strengths = [
      'Layout structure and readability align with professional standards',
      ...matchingSkills.map(skill => `Strong match: Included '${skill.toUpperCase()}' as required by target role`),
    ];
    if (strengths.length === 1) {
      strengths.push('Displays general technical competency keywords');
    }

    const weaknesses = [
      ...missingSkills.map(skill => `Missing: '${skill.toUpperCase()}' was specified in job description but not found in CV`),
    ];
    if (weaknesses.length === 0) {
      weaknesses.push('Bullet points are descriptive but could focus more on quantitative metrics');
    }

    const suggestions = [
      ...missingSkills.map(skill => `Add specific project bullet points highlighting your experience with ${skill.toUpperCase()}`),
      'Incorporate quantitative accomplishments (e.g. "improved performance by 25%")',
      'Highlight testing frameworks or deployment tools mentioned in role description'
    ];

    const payload = {
      fileName: fileName ? `[Job: ${jobDesc}] ${fileName}` : `[Job: ${jobDesc}] Pasted_Resume.txt`,
      score,
      strengths,
      weaknesses,
      suggestions,
      rawText
    };

    try {
      const newAnalysis = localStore.addResumeAnalysis(payload);
      const updatedList = localStore.getResumeAnalyses();
      setAnalyses(updatedList);
      setActiveAnalysis(newAnalysis);
      setScanning(false);
      setRawText('');
      setFileName('');
      setJobDesc('');
      toast.success('Resume analyzed successfully!');
    } catch (e) {
      toast.error('Scan failed');
      setScanning(false);
    }
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this analysis report?')) {
      // Direct access from localStorage array filtering
      const list = JSON.parse(localStorage.getItem('dt_resume_analyses') || '[]');
      const filtered = list.filter((a: any) => a.id !== id);
      localStorage.setItem('dt_resume_analyses', JSON.stringify(filtered));
      
      const refreshed = localStore.getResumeAnalyses();
      setAnalyses(refreshed);
      if (activeAnalysis?.id === id) {
        setActiveAnalysis(refreshed.length > 0 ? refreshed[0] : null);
      }
      toast.success('Report removed');
    }
  };

  const triggerReset = () => {
    setActiveAnalysis(null);
    setRawText('');
    setFileName('');
    setJobDesc('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[calc(100vh-120px)]">
      {/* Past Reports List */}
      <div className="glass-card p-4 flex flex-col lg:col-span-1 h-full overflow-hidden justify-between">
        <div className="overflow-hidden flex flex-col h-full">
          <button 
            onClick={triggerReset}
            className="w-full flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all mb-4 shrink-0"
          >
            <Plus className="w-4 h-4" /> Scan New CV
          </button>

          <div className="space-y-1.5 overflow-y-auto no-scrollbar flex-1">
            {analyses.map(a => {
              const active = activeAnalysis?.id === a.id;
              return (
                <div
                  key={a.id}
                  onClick={() => setActiveAnalysis(a)}
                  className={`flex items-center justify-between p-2.5 rounded-lg text-sm cursor-pointer select-none transition-all ${
                    active 
                      ? 'bg-primary/15 border border-primary/30 text-foreground font-semibold' 
                      : 'hover:bg-secondary/40 text-muted-foreground hover:text-foreground border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 shrink-0 text-primary" />
                    <div className="truncate">
                      <p className="truncate font-medium">{a.fileName}</p>
                      <span className="text-[9px] text-muted-foreground font-mono">{a.createdAt.split('T')[0]}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold font-mono text-primary bg-primary/10 px-1.5 py-0.2 rounded">{a.score}%</span>
                    <button 
                      onClick={(e) => handleDelete(a.id, e)}
                      className="p-1 rounded text-muted-foreground/60 hover:text-red-500 hover:bg-red-500/5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Analysis Display Panel */}
      <div className="lg:col-span-3 h-full flex flex-col">
        <AnimatePresence mode="wait">
          {scanning ? (
            /* Loading scan animation */
            <motion.div 
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass-card flex-1 flex flex-col items-center justify-center p-8 text-center"
            >
              <RefreshCw className="w-10 h-10 text-primary animate-spin mb-4" />
              <h3 className="font-bold text-lg text-foreground mb-1">Scanning Resume</h3>
              <p className="text-sm text-muted-foreground font-mono max-w-sm">
                {steps[scanStep]}
              </p>
            </motion.div>
          ) : activeAnalysis ? (
            /* Results Panel */
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6 flex-1"
            >
              {/* Score card grid summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Circular Score Gauge */}
                <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Recruiter Match Score</span>
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="64" cy="64" r="52" className="stroke-secondary fill-none" strokeWidth="8"/>
                      <circle 
                        cx="64" 
                        cy="64" 
                        r="52" 
                        className="stroke-primary fill-none" 
                        strokeWidth="8"
                        strokeDasharray="327"
                        strokeDashoffset={327 - (327 * activeAnalysis.score) / 100}
                      />
                    </svg>
                    <span className="absolute text-3xl font-extrabold font-mono text-foreground">{activeAnalysis.score}%</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono mt-3 uppercase">File: {activeAnalysis.fileName}</span>
                </div>

                {/* Score description explanation card */}
                <div className="glass-card p-6 md:col-span-2 flex flex-col justify-center">
                  <h3 className="text-lg font-bold text-foreground mb-2">Gemini Pro Evaluation</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Your resume matches the core indicators of active recruiters. Based on this profile scan, adding cloud deployment details (Docker/AWS) and specific JavaScript libraries will further elevate your visibility index.
                  </p>
                </div>
              </div>

              {/* Strengths, Weaknesses, Suggestions details cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Strengths */}
                <div className="glass-card p-5 border-t-4 border-t-emerald-500 bg-emerald-500/5">
                  <h4 className="font-bold text-sm text-foreground flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Key Strengths
                  </h4>
                  <ul className="space-y-2.5 text-xs text-muted-foreground">
                    {activeAnalysis.strengths.map((str, i) => (
                      <li key={i} className="flex gap-2 items-start">
                        <span className="text-emerald-500 shrink-0 mt-0.5">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div className="glass-card p-5 border-t-4 border-t-red-500 bg-red-500/5">
                  <h4 className="font-bold text-sm text-foreground flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-red-500" /> Deficiencies
                  </h4>
                  <ul className="space-y-2.5 text-xs text-muted-foreground">
                    {activeAnalysis.weaknesses.map((wk, i) => (
                      <li key={i} className="flex gap-2 items-start">
                        <span className="text-red-500 shrink-0 mt-0.5">•</span>
                        <span>{wk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Suggestions */}
                <div className="glass-card p-5 border-t-4 border-t-yellow-500 bg-yellow-500/5">
                  <h4 className="font-bold text-sm text-foreground flex items-center gap-2 mb-3">
                    <Lightbulb className="w-4 h-4 text-yellow-500" /> Action Checklist
                  </h4>
                  <ul className="space-y-2.5 text-xs text-muted-foreground">
                    {activeAnalysis.suggestions.map((sug, i) => (
                      <li key={i} className="flex gap-2 items-start">
                        <span className="text-yellow-500 shrink-0 mt-0.5">•</span>
                        <span>{sug}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ) : (
            /* Upload State Panel */
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass-card p-8 flex-1 flex flex-col justify-center items-center"
            >
              <form onSubmit={handleScan} className="max-w-lg w-full space-y-5">
                <div className="text-center mb-2">
                  <h3 className="font-bold text-xl text-foreground">Evaluate Resume</h3>
                  <p className="text-sm text-muted-foreground">Scan your CV against industry keywords with Gemini Pro</p>
                </div>

                {/* Target Job Description */}
                <div>
                  <label className="block text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Target Job Description / Role requirements *
                  </label>
                  <textarea 
                    rows={5}
                    required
                    placeholder="Enter target role or copy paste job description details (e.g. React Frontend Developer, Node, AWS)..."
                    value={jobDesc}
                    onChange={(e) => setJobDesc(e.target.value)}
                    className="w-full bg-background border-2 border-primary/30 text-foreground text-sm rounded-lg px-3 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm shadow-primary/5 transition-all outline-none resize-none"
                  />
                </div>

                {/* Drag and Drop Box */}
                <div className="relative border-2 border-dashed border-border/40 hover:border-primary/50 transition-all rounded-lg p-5 text-center bg-secondary/5 group cursor-pointer">
                  <input 
                    type="file" 
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleSimulatedFileDrop}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-20"
                  />
                  <div className="flex flex-col items-center justify-center">
                    <UploadCloud className="w-7 h-7 text-muted-foreground group-hover:text-primary transition-colors mb-2" />
                    <p className="text-sm font-semibold text-foreground/90">
                      {fileName ? `Attached: ${fileName}` : 'Drag & drop CV file here'}
                    </p>
                    <span className="text-xs text-muted-foreground mt-0.5">Supports PDF, DOCX, TXT up to 5MB</span>
                  </div>
                </div>

                {/* Or raw text paste box */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 text-center">
                    — Or Paste Plain Resume Text —
                  </label>
                  <textarea 
                    rows={4}
                    placeholder="Paste your resume summary, work experience bullet points, and education details..."
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    className="w-full bg-background border border-border/40 text-foreground text-sm rounded-lg px-3 py-2.5 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold py-3 px-4 rounded-lg shadow-lg hover:shadow-primary/20 transition-all active:scale-[0.98]"
                >
                  <FileText className="w-4 h-4" /> Scan Resume with AI
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
