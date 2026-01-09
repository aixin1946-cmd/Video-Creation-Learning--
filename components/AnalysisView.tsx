import React from 'react';
import { AnalysisResult, Stage } from '../types';
import { Play, Clock, Target, AlertTriangle, Film, Music, Scissors, LayoutTemplate } from 'lucide-react';

interface Props {
  data: AnalysisResult;
  stage: Stage;
}

export const AnalysisView: React.FC<Props> = ({ data, stage }) => {
  
  // Stage 1: Case Card & Verdict
  if (stage === Stage.Verdict || stage === Stage.Intake) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Film className="text-blue-400" /> 案例卡片 (Case Card)
            </h2>
            <div className="space-y-3 text-slate-300">
              <p><span className="text-slate-500">名称：</span> {data.caseCard.name}</p>
              <p><span className="text-slate-500">平台：</span> {data.caseCard.platform}</p>
              <p><span className="text-slate-500">时长：</span> {data.caseCard.duration}</p>
              <p><span className="text-slate-500">目标受众：</span> {data.caseCard.targetAudience}</p>
            </div>
            <div className="mt-4">
              <p className="text-sm font-semibold text-slate-400 mb-2">学习要点</p>
              <div className="flex flex-wrap gap-2">
                {data.caseCard.learningPoints.map((pt, i) => (
                  <span key={i} className="px-2 py-1 bg-blue-900/50 text-blue-300 text-xs rounded border border-blue-800">{pt}</span>
                ))}
              </div>
            </div>
          </div>

          <div className={`p-6 rounded-xl border ${data.verdict.worthLearning ? 'bg-green-900/20 border-green-800' : 'bg-red-900/20 border-red-800'}`}>
             <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Target className={data.verdict.worthLearning ? "text-green-400" : "text-red-400"} /> 
              教练判定
            </h2>
            <div className="mb-4">
                <span className={`text-2xl font-black uppercase ${data.verdict.worthLearning ? 'text-green-400' : 'text-red-400'}`}>
                    {data.verdict.worthLearning ? "值得学习 (WORTH LEARNING)" : "跳过 (SKIP)"}
                </span>
            </div>
            <ul className="space-y-2 mb-4">
                {data.verdict.reasons.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-300 text-sm">
                        <span>•</span> {r}
                    </li>
                ))}
            </ul>
            {data.verdict.alternative && (
                <div className="mt-4 p-3 bg-slate-900 rounded text-sm text-slate-400">
                    替代建议：{data.verdict.alternative}
                </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Stage 2: Structure
  if (stage === Stage.Structure) {
    return (
      <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 animate-fadeIn">
        <div className="p-6 border-b border-slate-700">
             <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <LayoutTemplate className="text-purple-400" /> 结构时间轴
            </h2>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-400">
                <thead className="bg-slate-900 text-slate-200 uppercase font-bold text-xs">
                    <tr>
                        <th className="p-4">时间戳</th>
                        <th className="p-4">段落</th>
                        <th className="p-4">目的</th>
                        <th className="p-4">观众心理</th>
                        <th className="p-4">画面策略</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                    {data.structure.map((item, i) => (
                        <tr key={i} className="hover:bg-slate-700/50 transition-colors">
                            <td className="p-4 font-mono text-blue-400">{item.timestamp}</td>
                            <td className="p-4 font-bold text-white">{item.segment}</td>
                            <td className="p-4">{item.purpose}</td>
                            <td className="p-4 italic text-slate-500">{item.psychology}</td>
                            <td className="p-4 text-emerald-400">{item.visualStrategy}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    );
  }

  // Stage 3: DNA
  if (stage === Stage.DNA) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col items-center text-center">
                <Clock className="w-10 h-10 text-orange-400 mb-4" />
                <h3 className="text-slate-400 text-sm uppercase font-bold">平均镜头时长</h3>
                <p className="text-3xl font-black text-white mt-2">{data.dna.avgShotLength}</p>
            </div>
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col items-center text-center">
                <Scissors className="w-10 h-10 text-pink-400 mb-4" />
                <h3 className="text-slate-400 text-sm uppercase font-bold">剪辑密度/节奏</h3>
                <p className="text-lg font-medium text-white mt-2">{data.dna.pacing}</p>
            </div>
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col items-center text-center">
                <Music className="w-10 h-10 text-cyan-400 mb-4" />
                <h3 className="text-slate-400 text-sm uppercase font-bold">声音策略</h3>
                <p className="text-sm text-slate-300 mt-2">{data.dna.soundStrategy}</p>
            </div>
        </div>
    )
  }

  // Stage 4: Extractables (Shot List)
  if (stage === Stage.Extractables) {
    return (
        <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 animate-fadeIn">
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
             <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Film className="text-yellow-400" /> 分镜表 (Shot List)
            </h2>
            <button className="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded text-white transition">复制全部</button>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-400">
                <thead className="bg-slate-900 text-slate-200 uppercase font-bold text-xs">
                    <tr>
                        <th className="p-4 w-12">编号</th>
                        <th className="p-4 w-24">时间</th>
                        <th className="p-4">画面内容</th>
                        <th className="p-4">动作/音频</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                    {data.shotList.map((shot, i) => (
                        <tr key={i} className="hover:bg-slate-700/50">
                            <td className="p-4 text-slate-500">{shot.id}</td>
                            <td className="p-4 font-mono text-blue-400">
                                <div>{shot.timeRange}</div>
                                <div className="text-xs text-slate-600">({shot.duration})</div>
                            </td>
                            <td className="p-4 text-slate-200">{shot.visual}</td>
                            <td className="p-4 space-y-1">
                                <div className="text-pink-400 text-xs uppercase font-bold">{shot.action}</div>
                                <div className="text-slate-500 italic">{shot.audio}</div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    );
  }

  // Stage 5: Playbook (SOP & Script)
  if (stage === Stage.Playbook) {
    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Script Template */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                 <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <LayoutTemplate className="text-indigo-400" /> 填空脚本 (Script Template)
                </h2>
                <div className="grid gap-4">
                    {Object.entries(data.scriptTemplate).map(([key, value]) => (
                        <div key={key} className="bg-slate-900/50 p-4 rounded border border-slate-700/50">
                            <label className="text-xs uppercase font-bold text-indigo-400 mb-1 block">{key}</label>
                            <p className="text-slate-200 text-lg font-medium">{value}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* SOP */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                 <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Target className="text-red-400" /> 剪辑 SOP (操作规范)
                </h2>
                <div className="grid gap-4">
                    {data.sop.map((rule, i) => (
                        <div key={i} className="flex gap-4 p-4 bg-slate-900 rounded border-l-4 border-red-500">
                             <div className="font-mono text-slate-500 font-bold">{(i + 1).toString().padStart(2, '0')}</div>
                             <div>
                                 <h4 className="text-white font-bold">{rule.rule}</h4>
                                 <p className="text-slate-400 text-sm mt-1">{rule.howTo}</p>
                                 <div className="mt-2 text-xs bg-slate-800 inline-block px-2 py-1 rounded text-slate-500">
                                     示例: {rule.example}
                                 </div>
                             </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
  }

  return null;
};