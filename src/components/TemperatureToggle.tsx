import React from 'react';

interface TemperatureToggleProps {
    unit: 'celsius' | 'fahrenheit';
    onToggle: (unit: 'celsius' | 'fahrenheit') => void;
    disabled?: boolean;
}

const TemperatureToggle: React.FC<TemperatureToggleProps> = ({ unit, onToggle, disabled = false }) => {
    return (
        <div className="flex items-center gap-2 mb-4">
            <span className="text-white/70 text-sm regular">Temperature unit:</span>
            <div className="relative bg-white/20 backdrop-blur-md rounded-full p-1 border border-white/30">
                <div className="flex">
                    <button
                        onClick={() => onToggle('celsius')}
                        disabled={disabled}
                        className={`
                            px-3 py-1 rounded-full text-sm regular transition-all duration-200 
                            ${unit === 'celsius'
                            ? 'bg-white text-blue-900 shadow-md'
                            : 'text-white/70 hover:text-white'
                        }
                            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                    >
                        °C
                    </button>
                    <button
                        onClick={() => onToggle('fahrenheit')}
                        disabled={disabled}
                        className={`
                            px-3 py-1 rounded-full text-sm regular transition-all duration-200
                            ${unit === 'fahrenheit'
                            ? 'bg-white text-blue-900 shadow-md'
                            : 'text-white/70 hover:text-white'
                        }
                            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                    >
                        °F
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TemperatureToggle;