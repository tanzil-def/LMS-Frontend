import { Link } from "react-router-dom";

export default function Header({ title = "Dashboard", breadcrumbs = [] }) {
    return (
        <div className="relative bg-[#05b3f3] text-white shadow-md overflow-hidden">
            {/* Background Decorative Waves (Simplified and Slimmed) */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <svg
                    className="absolute bottom-0 left-0 w-full h-[150%] sm:h-[120%]"
                    viewBox="0 0 1440 100"
                    preserveAspectRatio="none"
                >
                    <path
                        fill="white"
                        d="M0,40 C300,10 600,60 900,20 C1200,50 1440,0 1440,0 L1440,100 L0,100 Z"
                    />
                </svg>
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Title and Breadcrumbs Area */}
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-1">
                            {title}
                        </h1>

                        {/* Breadcrumbs */}
                        <nav className="flex items-center text-xs sm:text-sm font-medium opacity-90" aria-label="Breadcrumb">
                            <ol className="inline-flex items-center space-x-1 md:space-x-2">
                                <li>
                                    <Link to="/dashboard" className="hover:underline transition-all">
                                        Dashboard
                                    </Link>
                                </li>
                                {breadcrumbs.map((crumb, index) => (
                                    <li key={index} className="flex items-center">
                                        <span className="mx-1 sm:mx-2 opacity-60">/</span>
                                        {crumb.path ? (
                                            <Link to={crumb.path} className="hover:underline transition-all">
                                                {crumb.label}
                                            </Link>
                                        ) : (
                                            <span className="opacity-100">{crumb.label}</span>
                                        )}
                                    </li>
                                ))}
                            </ol>
                        </nav>
                    </div>

                    {/* Action Button */}
                    <div className="flex items-center">
                        <button className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/30 font-bold py-2 px-6 rounded-full text-xs sm:text-sm transition-all duration-300 shadow-lg active:scale-95 whitespace-nowrap">
                            Customise this page
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
