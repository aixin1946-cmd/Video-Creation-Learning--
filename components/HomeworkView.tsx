import React, { useState } from 'react';
import { AnalysisResult, ReviewResult, Stage } from '../types';
import { Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { reviewHomework } from '../services/geminiService';

interface Props {
  data: AnalysisResult;
  stage: Stage;
  setStage: (s: Stage) => void;
  originalContext: string; // The analysis of the original video acting as prompt
}

export const HomeworkView: React.FC<Props> = ({ data, stage, setStage, originalContext }) => {
  const [review, setReview] = useState<ReviewResult | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleHomeworkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    setIsReviewing(true);
    setError(null);

    try {
        // Construct a context string from the analysis data to guide the review
        const contextSummary = `
            Style: ${data.caseCard.name}. 
            Key Rules: ${data.sop.map(s => s.rule).join('; ')}. 
            Structure: ${data.structure.map(s => s.purpose).join(' -> ')}.
        `;
        
        const result = await reviewHomework(contextSummary, file);
        setReview(result);
        setStage(Stage.Review);
    } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to review homework");
    } finally {
        setIsReviewing(false);
    }
  };

  if (stage === Stage.Assignment) {
      return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
            <div className="bg-gradient-to-r from-blue-900 to-slate-900 p-8 rounded-2xl border border-blue-800 shadow-xl">
                <h2 className="text-3xl font-black text-white mb-6">任务简报 (Mission Brief)</h2>
                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="text-blue-400 uppercase font-bold text-sm mb-2">目标 (Goal)</h3>
                        <p className="text-lg text-white mb-4">{data.homework.goal}</p>
                        
                        <h3 className="text-blue-400 uppercase font-bold text-sm mb-2">限制条件 (Constraints)</h3>
                        <p className="text-slate-300">{data.homework.constraints}</p>
                    </div>
                    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                        <h3 className="text-slate-400 uppercase font-bold text-sm mb-4">评分标准 (Grading Rubric)</h3>
                        <ul className="space-y-3">
                            {data.homework.rubric.map((r, i) => (
                                <li key={i} className="flex justify-between items-center border-b border-slate-700 pb-2 last:border-0">
                                    <span className="text-slate-200">{r.criteria}</span>
                                    <span className="text-xs bg-blue-900 px-2 py-1 rounded text-blue-200">{r.maxScore} 分</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            <div className="bg-slate-800 p-10 rounded-2xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center text-center">
                 {isReviewing ? (
                     <div className="flex flex-col items-center">
                         <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                         <h3 className="text-xl font-bold text-white">正在批改作业...</h3>
                         <p className="text-slate-400">教练正在将你的剪辑与原片蓝图进行对比。</p>
                     </div>
                 ) : (
                     <>
                        <Upload className="w-16 h-16 text-slate-500 mb-4" />
                        <h3 className="text-2xl font-bold text-white mb-2">上传模仿作品</h3>
                        <p className="text-slate-400 mb-6 max-w-md">提交你的视频文件。AI教练将根据评分标准进行分析，并给出修改计划。</p>
                        <input 
                            type="file" 
                            accept="video/*" 
                            onChange={handleHomeworkUpload}
                            className="block w-full text-sm text-slate-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-600 file:text-white
                                hover:file:bg-blue-700
                                cursor-pointer max-w-xs mx-auto
                            "
                        />
                        {error && <p className="text-red-400 mt-4">{error}</p>}
                     </>
                 )}
            </div>
        </div>
      );
  }

  if (stage === Stage.Review && review) {
      return (
          <div className="space-y-6 animate-fadeIn">
              <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500" />
                  <h2 className="text-slate-400 uppercase tracking-widest text-sm font-bold mb-2">模仿评分 (Score)</h2>
                  <div className="text-6xl font-black text-white mb-4">{review.score}<span className="text-2xl text-slate-500">/100</span></div>
                  <p className="text-slate-300 max-w-2xl mx-auto italic">"{review.feedback}"</p>
              </div>

              <div className="grid gap-4">
                  <h3 className="text-xl font-bold text-white mb-2">优先级修改计划 (Revision Plan)</h3>
                  {review.revisionPlan.map((item, i) => (
                      <div key={i} className="bg-slate-900 p-6 rounded-xl border border-slate-800 flex gap-6">
                          <div className={`
                            flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
                            ${item.priority === 'High' ? 'bg-red-900/50 text-red-500 border border-red-900' : 'bg-yellow-900/50 text-yellow-500 border border-yellow-900'}
                          `}>
                              {i + 1}
                          </div>
                          <div className="flex-grow">
                              <div className="flex items-center gap-3 mb-2">
                                  <h4 className="text-lg font-bold text-white">{item.problem}</h4>
                                  <span className={`text-xs px-2 py-0.5 rounded uppercase font-bold ${item.priority === 'High' ? 'bg-red-500 text-white' : 'bg-yellow-500 text-black'}`}>
                                      {item.priority} Priority
                                  </span>
                              </div>
                              <p className="text-slate-300 mb-3"><span className="text-green-400 font-bold">修改建议: </span>{item.solution}</p>
                              <div className="bg-slate-950 p-3 rounded border border-slate-800 text-sm text-slate-500 font-mono">
                                  示例: {item.example}
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
              
              <div className="flex justify-center pt-8">
                  <button onClick={() => setStage(Stage.Assignment)} className="text-slate-400 hover:text-white underline">
                      上传修改版 (Upload Revised Version)
                  </button>
              </div>
          </div>
      )
  }

  return null;
};