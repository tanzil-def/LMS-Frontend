import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import api from '../../api';

// Image import
import loginImg from '../../assets/Brain-Station-23-1.jpg';

const Forgot = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await api.post('/v1/auth/api/v1/auth/forgot-password', { email });
            setMessage(response.data.message || "Password reset link sent if email exists.");
            setSubmitted(true);
        } catch (err) {
            setError(err.response?.data?.detail || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-white font-sans overflow-hidden">
            {/* --- Left Side: Form Box --- */}
            <div className="w-full lg:w-[40%] flex items-center justify-center p-8 sm:p-12 lg:p-16 bg-white z-10 shadow-2xl overflow-y-auto">
                <div className="w-full max-w-sm">

                    <div className="mb-6">
                        <Link to="/login" className="inline-flex items-center text-[#0056b3] hover:text-[#004494] font-bold text-sm mb-8 transition-colors">
                            <ArrowLeft size={16} className="mr-2" />
                            Back to Login
                        </Link>
                    </div>

                    {!submitted ? (
                        <>
                            <div className="mb-8 text-center sm:text-left">
                                <h2 className="text-4xl font-black text-[#0056b3] tracking-tighter mb-2">
                                    RECOVER
                                </h2>
                                <div className="h-1 w-20 bg-[#0056b3] mx-auto sm:ml-0 rounded-full"></div>
                                <p className="text-gray-500 mt-6 font-medium text-sm">
                                    Lost your access? Enter your email and we'll send you a recovery link.
                                </p>
                            </div>

                            {error && (
                                <div className="mb-6 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-bold rounded">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="text-gray-400 group-focus-within:text-[#0056b3] transition-colors" size={18} />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 bg-[#f3f4f7] border border-transparent focus:bg-white focus:border-[#0056b3] rounded-lg outline-none transition-all font-medium text-sm text-gray-700"
                                        placeholder="Email Address"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#0056b3] hover:bg-[#004494] text-white font-bold py-3.5 px-4 rounded-lg uppercase tracking-wide transition-all shadow-lg active:scale-[0.98] disabled:opacity-70"
                                >
                                    {loading ? "Sending link..." : "Send Reset Link"}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-50 rounded-full mb-8 shadow-sm">
                                <CheckCircle className="text-green-500" size={40} />
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Check your inbox</h2>
                            <p className="text-gray-600 mb-10 leading-relaxed font-medium">
                                If an account exists with that email, you'll receive a password reset link shortly.
                            </p>
                            <Link
                                to="/login"
                                className="inline-block px-10 bg-gray-800 hover:bg-black text-white font-bold py-3.5 rounded-lg transition-all text-xs uppercase tracking-widest shadow-md"
                            >
                                Return to Login
                            </Link>
                        </div>
                    )}
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

export default Forgot;
