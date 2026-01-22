import React from 'react';

interface ProgressTrackerProps {
    steps: {
        title: string;
        description?: string;
    }[];
    currentStep: number;
    isVisible: boolean;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ steps, currentStep, isVisible }) => {
    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-8 animate-in zoom-in-95 duration-300">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Proceso de análisis</h3>

                <div className="relative space-y-8">
                    {/* Vertical Connecting Line */}
                    <div className="absolute left-[19px] top-4 bottom-4 w-[2px] bg-gray-100 -z-10" />

                    {steps.map((step, index) => {
                        const isActive = index === currentStep;
                        const isCompleted = index < currentStep;
                        const isPending = index > currentStep;

                        return (
                            <div key={index} className="flex items-start gap-4">
                                {/* Step Indicator */}
                                <div
                                    className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 border-2
                    ${isActive
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30 scale-110'
                                            : isCompleted
                                                ? 'bg-blue-600 border-blue-600 text-white'
                                                : 'bg-white border-gray-200 text-gray-300'
                                        }
                  `}
                                >
                                    {isCompleted ? (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <span>{index + 1}</span>
                                    )}
                                </div>

                                {/* Step Text */}
                                <div className="pt-1.5 transition-all duration-300">
                                    <p
                                        className={`
                      font-medium transition-colors
                      ${isActive
                                                ? 'text-blue-600 font-bold'
                                                : isCompleted
                                                    ? 'text-gray-900'
                                                    : 'text-gray-400'
                                            }
                    `}
                                    >
                                        {step.title}
                                    </p>
                                    {step.description && isActive && (
                                        <p className="text-sm text-gray-500 mt-1 animate-in fade-in slide-in-from-left-2">
                                            {step.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ProgressTracker;
