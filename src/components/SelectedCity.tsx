
interface SelectedCityProps {
    city: string;
}

const SelectedCity = ({ city }: SelectedCityProps) => {
    return (
        <div className="">
            <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder={city}
                    className="w-0.5 pl-10 pr-4 py-3 bg-white/20 backdrop-blur-md rounded-xl text-white placeholder-white/70 border border-white/30 focus:outline-none focus:border-white/50"
                />
            </div>
        </div>
    )
}


export default SelectedCity;