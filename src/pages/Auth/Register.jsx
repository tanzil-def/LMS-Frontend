import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react';
import api from '../../api';

// Image import
import loginImg from '../../assets/Brain-Station-23-1.jpg';

const Register = () => {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        phone_number: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.post('/v1/auth/api/v1/auth/register', formData);
            // Registration success logic would usually involve a toast or redirecting to login
            navigate('/login', { state: { message: "Registration successful! Please login." } });
        } catch (err) {
            setError(err.response?.data?.detail || "Registration failed. Please check your details.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-white font-sans overflow-hidden">
            {/* --- Left Side: Register Box --- */}
            <div className="w-full lg:w-[40%] flex items-center justify-center p-8 sm:p-12 lg:p-16 bg-white z-10 shadow-2xl overflow-y-auto">
                <div className="w-full max-w-sm">

                    <div className="mb-8 text-center">
                        <h2 className="text-4xl font-black text-[#0056b3] tracking-tighter mb-2">
                            JOIN US
                        </h2>
                        <div className="h-1 w-20 bg-[#0056b3] mx-auto rounded-full"></div>
                        <p className="text-gray-500 mt-4 font-medium italic text-sm">Create your library account</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-bold rounded">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-4">
                        {/* Full Name */}
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <User className="text-gray-400 group-focus-within:text-[#0056b3] transition-colors" size={18} />
                            </div>
                            <input
                                type="text"
                                name="full_name"
                                required
                                value={formData.full_name}
                                onChange={handleChange}
                                className="w-full pl-11 pr-4 py-3 bg-[#f3f4f7] border border-transparent focus:bg-white focus:border-[#0056b3] rounded-lg outline-none transition-all font-medium text-sm text-gray-700"
                                placeholder="Full Name"
                            />
                        </div>

                        {/* Email */}
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail className="text-gray-400 group-focus-within:text-[#0056b3] transition-colors" size={18} />
                            </div>
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full pl-11 pr-4 py-3 bg-[#f3f4f7] border border-transparent focus:bg-white focus:border-[#0056b3] rounded-lg outline-none transition-all font-medium text-sm text-gray-700"
                                placeholder="Email Address"
                            />
                        </div>

                        {/* Phone Number */}
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Phone className="text-gray-400 group-focus-within:text-[#0056b3] transition-colors" size={18} />
                            </div>
                            <input
                                type="tel"
                                name="phone_number"
                                required
                                value={formData.phone_number}
                                onChange={handleChange}
                                className="w-full pl-11 pr-4 py-3 bg-[#f3f4f7] border border-transparent focus:bg-white focus:border-[#0056b3] rounded-lg outline-none transition-all font-medium text-sm text-gray-700"
                                placeholder="Phone Number"
                            />
                        </div>

                        {/* Password */}
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="text-gray-400 group-focus-within:text-[#0056b3] transition-colors" size={18} />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full pl-11 pr-12 py-3 bg-[#f3f4f7] border border-transparent focus:bg-white focus:border-[#0056b3] rounded-lg outline-none transition-all font-medium text-sm text-gray-700"
                                placeholder="Password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#0056b3] hover:bg-[#004494] text-white font-bold py-3.5 px-4 rounded-lg uppercase tracking-wide transition-all shadow-lg active:scale-[0.98] disabled:opacity-70"
                        >
                            {loading ? "Creating Account..." : "Create Account"}
                        </button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-gray-100 text-center">
                        <p className="text-gray-500 text-sm mb-4 font-medium italic">Already have an account?</p>
                        <Link
                            to="/login"
                            className="inline-block px-8 bg-gray-800 hover:bg-black text-white font-bold py-3 rounded-lg transition-all text-xs uppercase tracking-widest shadow-md"
                        >
                            Log in instead
                        </Link>
                    </div>

                </div>
            </div>

            {/* --- Right Side: Full Image (Hidden on Mobile) --- */}
            <div className="hidden lg:block lg:w-[60%] relative">
                <div className="absolute inset-0 bg-blue-900/10 z-10"></div>
                <img
                    src={loginImg}
                    alt="LMS Background"
                    className="w-full h-full object-cover"
                />
            </div>
        </div>
    );
};

export default Register;
