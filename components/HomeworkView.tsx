import React, { useState } from 'react';
import { AnalysisResult, ReviewResult, Stage } from '../types';
import { Upload, CheckCircle, AlertCircle, Loader2, FileText, Video, Send, RefreshCw, Eye, Layout } from 'lucide-react';
import { reviewHomework, reviewScript } from '../services/geminiService';

interface Props {
  data: AnalysisResult;
  stage: Stage;
  setStage: (s: Stage) => void;
  originalContext: string;
}

type Mode = 'video' | 'script';

export const HomeworkView: React.FC<Props> = ({ data, stage, setStage, originalContext }) => {
  const [review, setReview] = useState<ReviewResult | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>('video');
  const [scriptText, setScriptText] = useState("");

  const contextSummary = `
    Style: ${data.caseCard.name}. 
    Key Rules: ${data.sop.map(s => s.rule).join('; ')}. 
    Structure: ${data.structure.map(s => s.purpose).join(' -> ')}.
    DNA: Pacing is ${data.dna.pacing}, Avg Shot Length is ${data.dna.avgShotLength}.
  `;

  const handleHomeworkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    if (file.size > 9 * 1024 * 1024) {
        setError("文件过大。请上传 9MB 以内的视频。");
        return;
    }
    setIsReviewing(true);
    setError(null);
    try {
        const result = await reviewHomework(contextSummary, file);
        setReview(result);
        setStage(Stage.Review);
    } catch (err) {
        setError("视频复盘失败，请重试。");
    } finally {
        setIsReviewing(false);
    }
  };

  const handleScriptSubmit = async () => {
    if (!scriptText.trim()) return;
    setIsReviewing(true);
    setError(null);
    try {
        const result = await reviewScript(contextSummary, scriptText);
        setReview(result);
        setStage(Stage.Review);
    } catch (err) {
        setError("文案分析失败，请重试。");
    } finally {
        setIsReviewing(false);
    }
  };

  if (stage === Stage.Assignment) {
      return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-2xl border border-slate-700 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-blue-600 p-2 rounded-lg"><Send className="w-5 h-5 text-white" /></div>
                    <h2 className="text-3xl font-black text-white">模仿练习 (Practice)</h2>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-blue-400 uppercase font-bold text-xs mb-2 tracking-widest">模仿目标 (Goal)</h3>
                        <p className="text-lg text-white mb-4 leading-relaxed">{data.homework.goal}</p>
                        
                        <h3 className="text-blue-400 uppercase font-bold text-xs mb-2 tracking-widest">限制条件</h3>
                        <p className="text-slate-400 text-sm">{data.homework.constraints}</p>
                    </div>
                    <div className="bg-slate-950/50 p-6 rounded-xl border border-slate-800">
                        <h3 className="text-slate-500 uppercase font-bold text-xs mb-4 tracking-widest">评分标准</h3>
                        <ul className="space-y-3 text-sm">
                            {data.homework.rubric.map((r, i) => (
                                <li key={i} className="flex justify-between items-start gap-4 border-b border-slate-800 pb-2 last:border-0">
                                    <span className="text-slate-300">{r.criteria}</span>
                                    <span className="text-[10px] bg-blue-900/50 px-2 py-0.5 rounded text-blue-300 whitespace-nowrap">{r.maxScore} 分</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Submission Toggle */}
            <div className="flex flex-col items-center">
                <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 mb-8">
                    <button 
                        onClick={() => setMode('video')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-all ${mode === 'video' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <Video className="w-4 h-4" /> 视频作品
                    </button>
                    <button 
                        onClick={() => setMode('script')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-all ${mode === 'script' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <FileText className="w-4 h-4" /> 文案草稿
                    </button>
                </div>

                {isReviewing ? (
                     <div className="w-full bg-slate-900 p-16 rounded-2xl border border-slate-800 flex flex-col items-center text-center">
                         <div className="relative">
                            <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-4" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <RefreshCw className="w-6 h-6 text-blue-300 animate-pulse" />
                            </div>
                         </div>
                         <h3 className="text-2xl font-bold text-white mb-2">教练正在精读中...</h3>
                         <p className="text-slate-400 max-w-xs">正在对比你的{mode === 'video' ? '剪辑手法' : '文案结构'}与爆款模板的差距</p>
                     </div>
                ) : mode === 'video' ? (
                    <div className="w-full bg-slate-900 p-12 rounded-2xl border-2 border-dashed border-slate-800 flex flex-col items-center justify-center text-center group hover:border-blue-500/50 transition-colors">
                        <Upload className="w-16 h-16 text-slate-700 mb-4 group-hover:text-blue-500 transition-colors" />
                        <h3 className="text-2xl font-bold text-white mb-2">提交视频作业</h3>
                        <p className="text-slate-500 mb-6 max-w-sm">上传你的模仿视频，教练将提供针对性剪辑建议。</p>
                        <input 
                            type="file" 
                            accept="video/*" 
                            onChange={handleHomeworkUpload}
                            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer max-w-xs mx-auto transition-all"
                        />
                        {error && <div className="mt-4 p-3 bg-red-900/20 text-red-400 rounded-lg flex items-center gap-2 border border-red-900/30"><AlertCircle className="w-4 h-4" /> {error}</div>}
                    </div>
                ) : (
                    <div className="w-full bg-slate-900 p-8 rounded-2xl border border-slate-800">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <FileText className="text-blue-400" /> 输入文案草稿
                        </h3>
                        <textarea 
                            value={scriptText}
                            onChange={(e) => setScriptText(e.target.value)}
                            className="w-full h-64 bg-slate-950 border border-slate-800 rounded-xl p-6 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all placeholder:text-slate-700"
                            placeholder="在此输入你的模仿文案。教练会分析其 Hook、信息密度和转化逻辑..."
                        />
                        <div className="flex justify-end mt-4">
                            <button 
                                onClick={handleScriptSubmit}
                                disabled={!scriptText.trim()}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20"
                            >
                                提交文案分析 <Send className="w-4 h-4" />
                            </button>
                        </div>
                        {error && <div className="mt-4 p-3 bg-red-900/20 text-red-400 rounded-lg flex items-center gap-2 border border-red-900/30"><AlertCircle className="w-4 h-4" /> {error}</div>}
                    </div>
                )}
            </div>
        </div>
      );
  }

  if (stage === Stage.Review && review) {
      return (
          <div className="space-y-10 animate-fadeIn">
              {/* Score Header */}
              <div className="bg-slate-800 p-10 rounded-2xl border border-slate-700 text-center relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-500 via-blue-500 to-emerald-500" />
                  <h2 className="text-slate-500 uppercase tracking-[0.2em] text-xs font-black mb-2">模仿匹配度 (Review Score)</h2>
                  <div className="text-7xl font-black text-white mb-4 tracking-tighter">
                    {review.score}<span className="text-3xl text-slate-600 font-normal">/100</span>
                  </div>
                  <div className="max-w-2xl mx-auto">
                    <p className="text-slate-300 text-lg leading-relaxed italic">"{review.feedback}"</p>
                  </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  {/* Revision Plan */}
                  <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <RefreshCw className="text-emerald-400 w-5 h-5" /> 修改路线图
                        </h3>
                      </div>
                      
                      {review.revisionPlan.map((item, i) => (
                          <div key={i} className="bg-slate-900/80 backdrop-blur-sm p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex gap-6 group">
                              <div className={`
                                flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shadow-inner
                                ${item.priority === 'High' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'}
                              `}>
                                  {i + 1}
                              </div>
                              <div className="flex-grow">
                                  <div className="flex items-center gap-3 mb-2">
                                      <h4 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{item.problem}</h4>
                                      <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-black ${item.priority === 'High' ? 'bg-red-500 text-white' : 'bg-yellow-500 text-slate-900'}`}>
                                          {item.priority}
                                      </span>
                                  </div>
                                  <p className="text-slate-300 mb-4 leading-relaxed"><span className="text-emerald-400 font-bold">建议：</span>{item.solution}</p>
                                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-500 font-medium italic">
                                      “ {item.example} ”
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>

                  {/* Suggested Visual Script - Only show if it's a script submission or AI generated it */}
                  {review.suggestedShotList && review.suggestedShotList.length > 0 && (
                      <div className="space-y-4">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                <Layout className="text-blue-400 w-5 h-5" /> 视觉脚本建议 (Visual Script)
                            </h3>
                          </div>
                          
                          <div className="space-y-4">
                              {review.suggestedShotList.map((shot, i) => (
                                  <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden group hover:border-blue-500/30 transition-all">
                                      <div className="bg-slate-800/50 p-3 border-b border-slate-800 flex justify-between items-center">
                                          <span className="text-xs font-black text-blue-400 uppercase tracking-widest">镜头 {i + 1}</span>
                                          <span className="text-[10px] bg-blue-900/30 text-blue-300 px-2 py-0.5 rounded border border-blue-800">{shot.shotType}</span>
                                      </div>
                                      <div className="p-5 space-y-3">
                                          <div>
                                              <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">对应文案片段</p>
                                              <p className="text-slate-200 text-sm font-medium border-l-2 border-slate-700 pl-3 italic">"{shot.scriptSegment}"</p>
                                          </div>
                                          <div>
                                              <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">画面内容建议</p>
                                              <p className="text-emerald-400 text-sm font-bold leading-relaxed">{shot.visualSuggestion}</p>
                                          </div>
                                          <div className="pt-2 text-[11px] text-slate-500 leading-relaxed bg-slate-950 p-2 rounded">
                                              <span className="font-bold text-slate-400">设计意图：</span>{shot.reasoning}
                                          </div>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  )}
              </div>
              
              <div className="flex flex-col items-center pt-12 pb-20">
                  <button 
                    onClick={() => { setReview(null); setStage(Stage.Assignment); }} 
                    className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors font-bold group text-sm"
                  >
                    <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" /> 返回提交新版本
                  </button>
              </div>
          </div>
      )
  }

  return null;
};