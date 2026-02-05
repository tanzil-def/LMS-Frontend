import React, { useState, useEffect } from 'react';
import { FaUser, FaLock, FaGoogle, FaFacebook, FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../Providers/AuthProvider';
import api from '../../api';

// Image import
import loginImg from '../../assets/Brain-Station-23-1.jpg';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [info, setInfo] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    useEffect(() => {
        if (location.state?.message) {
            setInfo(location.state.message);
        }
    }, [location]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const response = await api.post('/v1/auth/api/v1/auth/login', { email, password, provider: "local" });
            if (response.data.access_token) {
                login(response.data.access_token, response.data.user);
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.detail || "Invalid login credentials!");
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = (provider) => {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";
        const cleanBaseUrl = baseUrl.endsWith('/v1') ? baseUrl.slice(0, -3) : baseUrl;
        window.location.href = `${cleanBaseUrl}/v1/auth/api/v1/auth/${provider}/login`;
    };

    return (
        <div className="min-h-screen w-full flex bg-white font-sans overflow-hidden">
            {/* --- Left Side: Login Box --- */}
            <div className="w-full lg:w-[40%] flex items-center justify-center p-8 sm:p-12 lg:p-16 bg-white z-10 shadow-2xl overflow-y-auto">
                <div className="w-full max-w-sm">

                    <div className="mb-10 text-center">
                        <h2 className="text-4xl font-black text-[#0056b3] tracking-tighter mb-2">
                            LMS PORTAL
                        </h2>
                        <div className="h-1 w-20 bg-[#0056b3] mx-auto rounded-full"></div>
                    </div>

                    {error && (
                        <div className="mb-6 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-bold rounded">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <FaUser className="text-gray-400 group-focus-within:text-[#0056b3] transition-colors" />
                            </div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-[#f3f4f7] border border-transparent focus:bg-white focus:border-[#0056b3] rounded-lg outline-none transition-all font-medium text-sm text-gray-700"
                                placeholder="Username or Email"
                            />
                        </div>

                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <FaLock className="text-gray-400 group-focus-within:text-[#0056b3] transition-colors" />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-11 pr-12 py-3 bg-[#f3f4f7] border border-transparent focus:bg-white focus:border-[#0056b3] rounded-lg outline-none transition-all font-medium text-sm text-gray-700"
                                placeholder="Password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>

                        <div className="text-center">
                            <Link to="/forgot-password" size="sm" className="text-xs font-semibold text-[#0056b3] hover:underline">
                                Forgotten your username or password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#0056b3] hover:bg-[#004494] text-white font-bold py-3 px-4 rounded-lg uppercase tracking-wide transition-all shadow-lg active:scale-[0.98] disabled:opacity-70"
                        >
                            {loading ? "Logging in..." : "Log In"}
                        </button>
                    </form>

                    <div className="my-8 flex items-center">
                        <div className="flex-1 h-px bg-gray-200"></div>
                        <span className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">OR</span>
                        <div className="flex-1 h-px bg-gray-200"></div>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => handleSocialLogin('google')}
                            className="w-full flex items-center justify-center gap-3 border border-gray-200 py-2.5 rounded-lg hover:bg-gray-50 transition-colors font-bold text-gray-700 text-sm shadow-sm"
                        >
                            <FaGoogle className="text-red-500" /> Log in with Google
                        </button>
                        <button
                            onClick={() => handleSocialLogin('facebook')}
                            className="w-full flex items-center justify-center gap-3 border border-gray-200 py-2.5 rounded-lg hover:bg-gray-50 transition-colors font-bold text-gray-700 text-sm shadow-sm"
                        >
                            <FaFacebook className="text-blue-600" /> Log in with Facebook
                        </button>
                    </div>

                    <div className="mt-10 pt-8 border-t border-gray-100 text-center">
                        <p className="text-gray-500 text-sm mb-4 font-medium italic">Is this your first time here?</p>
                        <Link
                            to="/register"
                            className="inline-block px-8 bg-gray-800 hover:bg-black text-white font-bold py-3 rounded-lg transition-all text-xs uppercase tracking-widest shadow-md"
                        >
                            Create new account
                        </Link>
                    </div>

                </div>
            </div>

            {/* --- Right Side: Full Image (Hidden on Mobile) --- */}
            <div className="hidden lg:block lg:w-[60%] relative">
                <div className="absolute inset-0 bg-blue-900/10 z-10"></div> {/* Subtle Tint */}
                <img
                    src={loginImg}
                    alt="LMS Background"
                    className="w-full h-full object-cover"
                />
            </div>
        </div>
    );
};

export default Login;