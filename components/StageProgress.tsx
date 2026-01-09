import React from 'react';
import { Stage } from '../types';
import { CheckCircle, Circle, Lock } from 'lucide-react';

interface StageProgressProps {
  currentStage: Stage;
  setStage: (stage: Stage) => void;
  maxStageReached: Stage;
}

const stages = [
  { id: Stage.Intake, label: '案例建档' }, // Intake
  { id: Stage.Verdict, label: '价值判断' }, // Verdict
  { id: Stage.Structure, label: '结构拆解' }, // Structure
  { id: Stage.DNA, label: '剪辑DNA' }, // DNA
  { id: Stage.Extractables, label: '素材提取' }, // Assets/Extractables
  { id: Stage.Playbook, label: '流程复制' }, // Playbook
  { id: Stage.Assignment, label: '模仿作业' }, // Homework
  { id: Stage.Review, label: '对比复盘' }, // Review
];

export const StageProgress: React.FC<StageProgressProps> = ({ currentStage, setStage, maxStageReached }) => {
  return (
    <div className="w-full bg-slate-900 border-b border-slate-700 overflow-x-auto">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between min-w-[800px]">
          {stages.map((stage, index) => {
            const isCompleted = stage.id < currentStage;
            const isCurrent = stage.id === currentStage;
            const isLocked = stage.id > maxStageReached;

            return (
              <div 
                key={stage.id} 
                className={`flex flex-col items-center gap-2 cursor-pointer relative group ${isLocked ? 'opacity-40 pointer-events-none' : 'hover:opacity-80'}`}
                onClick={() => !isLocked && setStage(stage.id)}
              >
                <div className="relative z-10 bg-slate-900 p-1">
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : isCurrent ? (
                    <Circle className="w-6 h-6 text-blue-500 fill-blue-500/20" />
                  ) : isLocked ? (
                    <Lock className="w-6 h-6 text-slate-600" />
                  ) : (
                    <Circle className="w-6 h-6 text-slate-500" />
                  )}
                </div>
                <span className={`text-xs font-medium ${isCurrent ? 'text-blue-400' : 'text-slate-400'}`}>
                  {stage.label}
                </span>
                
                {/* Connector Line */}
                {index < stages.length - 1 && (
                  <div className={`absolute top-4 left-[50%] w-full h-[2px] -z-0 ${stage.id < maxStageReached ? 'bg-blue-900' : 'bg-slate-800'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};