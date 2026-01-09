import React, { useState } from 'react';
import { Stage, AnalysisResult } from './types';
import { StageProgress } from './components/StageProgress';
import { analyzeVideo } from './services/geminiService';
import { AnalysisView } from './components/AnalysisView';
import { HomeworkView } from './components/HomeworkView';
import { Video, Upload, AlertTriangle, Loader2, Sparkles, FileVideo } from 'lucide-react';

const App: React.FC = () => {
  const [stage, setStage] = useState<Stage>(Stage.Intake);
  const [maxStageReached, setMaxStageReached] = useState<Stage>(Stage.Intake);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contextInput, setContextInput] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    // Client-side check: Reduced to 9MB to ensure Base64 encoded payload stays within API safe limits (approx <13MB total payload).
    // Larger files would require server-side File API implementation not available in this client-side demo.
    if (file.size > 9 * 1024 * 1024) {
        setError("文件过大。由于演示版API限制，请上传 9MB 以内的短视频片段。");
        return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await analyzeVideo(file, contextInput);
      setAnalysisResult(result);
      setStage(Stage.Verdict);
      setMaxStageReached(Stage.Assignment); // Unlock up to assignment
    } catch (err) {
      setError("分析失败。可能是视频编码问题或服务繁忙，请重试。");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 pb-20">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Video className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Video Coach AI (视频私教)</h1>
            <p className="text-xs text-slate-400">拆解 · 模仿 · 精通 (Deconstruct. Imitate. Master.)</p>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      {stage > Stage.Intake && (
        <StageProgress 
          currentStage={stage} 
          setStage={setStage} 
          maxStageReached={maxStageReached} 
        />
      )}

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        
        {/* Stage 0: Intake */}
        {stage === Stage.Intake && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 animate-fadeIn">
            <div className="space-y-4 max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                把爆款视频变成<br/>你的专属教材
              </h2>
              <p className="text-lg text-slate-400">
                上传参考视频。AI将拆解结构、节奏和剪辑秘密，生成一步步的复刻手册。
              </p>
            </div>

            {isLoading ? (
               <div className="bg-slate-900 p-12 rounded-2xl border border-slate-800 flex flex-col items-center">
                  <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-6" />
                  <h3 className="text-xl font-bold text-white">正在分析视频 DNA...</h3>
                  <div className="space-y-2 mt-4 text-sm text-slate-500">
                    <p>• 正在提取分镜表 (Extracting Shot List)</p>
                    <p>• 正在计算节奏指标 (Calculating Rhythm Metrics)</p>
                    <p>• 正在生成复刻手册 (Generating Rebuild Playbook)</p>
                  </div>
               </div>
            ) : (
              <div className="w-full max-w-md bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-2xl relative group">
                <div className="absolute inset-0 bg-blue-500/5 rounded-2xl group-hover:bg-blue-500/10 transition-colors" />
                
                <div className="relative">
                  <label className="block text-left mb-2 text-sm font-semibold text-slate-300">
                    1. 学习背景（可选）
                  </label>
                  <textarea 
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:outline-none mb-6 resize-none"
                    placeholder="例如：'我想把这个 Alex Hormozi 风格的短片套用到我的烹饪频道'"
                    rows={2}
                    value={contextInput}
                    onChange={(e) => setContextInput(e.target.value)}
                  />

                  <label className="block text-left mb-2 text-sm font-semibold text-slate-300">
                    2. 上传参考视频
                  </label>
                  <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 transition-colors hover:border-blue-500 hover:bg-slate-800/50 cursor-pointer relative">
                    <input 
                      type="file" 
                      accept="video/*" 
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-3 bg-slate-800 rounded-full">
                        <Upload className="w-6 h-6 text-blue-400" />
                      </div>
                      <p className="font-medium text-white">点击上传视频</p>
                      <p className="text-xs text-slate-500">MP4, WebM (演示版限9MB)</p>
                    </div>
                  </div>

                  {error && (
                    <div className="mt-4 p-3 bg-red-900/20 border border-red-900/50 rounded flex items-center gap-2 text-red-400 text-sm">
                      <AlertTriangle className="w-4 h-4" />
                      {error}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Analysis Stages (1-5) */}
        {analysisResult && stage >= Stage.Verdict && stage <= Stage.Playbook && (
          <AnalysisView data={analysisResult} stage={stage} />
        )}

        {/* Homework Stages (6-7) */}
        {analysisResult && (stage === Stage.Assignment || stage === Stage.Review) && (
            <HomeworkView 
                data={analysisResult} 
                stage={stage} 
                setStage={setStage} 
                originalContext={JSON.stringify(analysisResult.sop)}
            />
        )}

      </main>

      {/* Navigation Footer (Sticky if content is long) */}
      {analysisResult && stage > Stage.Intake && (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 p-4 z-40">
            <div className="max-w-5xl mx-auto flex justify-between items-center">
                <button 
                    disabled={stage === Stage.Verdict}
                    onClick={() => setStage(prev => Math.max(prev - 1, Stage.Verdict))}
                    className="text-slate-400 hover:text-white disabled:opacity-30 font-medium px-4 py-2"
                >
                    上一步 (Back)
                </button>
                <div className="text-xs text-slate-500 uppercase tracking-widest font-bold hidden sm:block">
                   阶段 {stage} / 8
                </div>
                <button 
                    disabled={stage >= maxStageReached}
                    onClick={() => setStage(prev => Math.min(prev + 1, 8))}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    下一步 (Next) <Sparkles className="w-4 h-4" />
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default App;