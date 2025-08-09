import React from 'react';

interface ForecastCardProps {
    day: string;
    iconSrc: string;
    max?: number;
    min?: number;
    unit?: string;
}

const ForecastCard: React.FC<ForecastCardProps> = ({ day, iconSrc, min, max }) => {


    return (
        <div className="regular five-card flex items-center justify-between w-full gap-4 text-[#F8E3B6]">
            <div className="text-sm text-left w-16">{day}</div>
            <div className="flex-shrink-0">
                <img src={iconSrc} alt={day} className="w-8 h-8 object-contain" />
            </div>
            <div className="text-sm w-10 text-center">{max ?? '--'}</div>
            <div className="text-sm w-10 text-blue-100 text-center">{min ?? '--'}</div>
        </div>
    );
};

export default ForecastCard;