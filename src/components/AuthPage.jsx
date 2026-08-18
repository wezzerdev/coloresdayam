import React, { useState } from 'react';
import { Lock, Mail, User, ShieldCheck, KeyRound, Loader2, AlertTriangle, CheckCircle2, ArrowLeft, Palette, Sparkles } from 'lucide-react';
import { supabase } from '../apiClient.js';

const AuthPage = ({ onNavigate }) => {
    // Vistas: 'LOGIN' | 'SIGNUP' | 'VERIFY_CODE' | 'FORGOT_PASSWORD' | 'RESET_PASSWORD'
    const [mode, setMode] = useState('LOGIN');

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [verificationCode, setVerificationCode] = useState('');
    const [generatedCodeNotice, setGeneratedCodeNotice] = useState(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);

    const resetMessages = () => {
        setError(null);
        setMessage(null);
        setGeneratedCodeNotice(null);
    };

    // 1. Manejador de Login
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        resetMessages();

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
        } catch (err) {
            setError(err.message || 'Error al iniciar sesión.');
        } finally {
            setLoading(false);
        }
    };

    // 2. Manejador de Registro (Pide Nombre, Email, Password, ConfirmPassword)
    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        resetMessages();

        if (!name.trim()) {
            setError('Ingresa tu nombre completo.');
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                name: name.trim()
            });
            if (error) throw error;

            setMessage(`Código de confirmación generado. Ingrésalo a continuación.`);
            if (data?.code) {
                setGeneratedCodeNotice(data.code);
            }
            setMode('VERIFY_CODE');
        } catch (err) {
            setError(err.message || 'Error al registrar la cuenta.');
        } finally {
            setLoading(false);
        }
    };

    // 3. Manejador de Confirmación por Código de 6 Dígitos
    const handleVerifyCode = async (e) => {
        e.preventDefault();
        setLoading(true);
        resetMessages();

        if (!verificationCode || verificationCode.trim().length !== 6) {
            setError('Ingresa el código de 6 dígitos.');
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase.auth.verifyCode({
                email,
                code: verificationCode.trim()
            });
            if (error) throw error;
        } catch (err) {
            setError(err.message || 'Código de confirmación inválido.');
        } finally {
            setLoading(false);
        }
    };

    // 4. Solicitud de Recuperación de Contraseña (Forgot Password)
    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        resetMessages();

        try {
            const { data, error } = await supabase.auth.forgotPassword({ email });
            if (error) throw error;

            setMessage(`Código de recuperación generado.`);
            if (data?.code) {
                setGeneratedCodeNotice(data.code);
            }
            setMode('RESET_PASSWORD');
        } catch (err) {
            setError(err.message || 'No se encontró la cuenta especificada.');
        } finally {
            setLoading(false);
        }
    };

    // 5. Restablecer Contraseña con Código
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        resetMessages();

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden.');
            setLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.resetPassword({
                email,
                code: verificationCode.trim(),
                newPassword: password
            });
            if (error) throw error;

            setMessage('¡Contraseña restablecida correctamente! Ya puedes iniciar sesión.');
            setPassword('');
            setConfirmPassword('');
            setMode('LOGIN');
        } catch (err) {
            setError(err.message || 'Error al restablecer la contraseña.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 font-sans relative overflow-hidden text-slate-100">
            {/* Formas sutiles con desenfoque de fondo */}
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-pink-600/15 rounded-full blur-3xl pointer-events-none"></div>

            <div className="max-w-md w-full glass-panel rounded-3xl p-8 border border-slate-800/80 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-200">
                
                {/* Logo & Marca */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold mb-3">
                        <Sparkles size={13} />
                        <span>Conectado a Supabase</span>
                    </div>
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-xl shadow-indigo-500/25 mb-4 group cursor-pointer" onClick={() => onNavigate('landing')}>
                        <div className="h-full w-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                            <Palette className="h-8 w-8 text-indigo-400" />
                        </div>
                    </div>

                    <h1 className="text-2xl font-extrabold font-heading tracking-tight text-slate-100">
                        {mode === 'LOGIN' && 'Bienvenido de Nuevo'}
                        {mode === 'SIGNUP' && 'Crea tu Cuenta Profesional'}
                        {mode === 'VERIFY_CODE' && 'Confirmar Cuenta'}
                        {mode === 'FORGOT_PASSWORD' && 'Recuperar Contraseña'}
                        {mode === 'RESET_PASSWORD' && 'Definir Nueva Contraseña'}
                    </h1>
                    <p className="text-slate-400 text-xs sm:text-sm mt-1">
                        {mode === 'LOGIN' && 'Accede a tu estudio de color y paletas guardadas.'}
                        {mode === 'SIGNUP' && 'Guarda, audita y sincroniza tus sistemas de diseño.'}
                        {mode === 'VERIFY_CODE' && `Ingresa el código de 6 dígitos enviado a ${email}`}
                        {mode === 'FORGOT_PASSWORD' && 'Ingresa tu correo para recibir un código de recuperación.'}
                        {mode === 'RESET_PASSWORD' && 'Ingresa tu código y tu nueva contraseña.'}
                    </p>
                </div>

                {/* Mensajes de Alerta */}
                {error && (
                    <div className="mb-5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in">
                        <AlertTriangle size={18} className="flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {message && (
                    <div className="mb-5 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in">
                        <CheckCircle2 size={18} className="flex-shrink-0" />
                        <span>{message}</span>
                    </div>
                )}

                {/* Aviso visual de código para pruebas locales */}
                {generatedCodeNotice && (
                    <div className="mb-5 p-3.5 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs text-center flex flex-col items-center gap-1 font-mono">
                        <div className="flex items-center gap-1.5 font-bold text-indigo-400">
                            <Sparkles size={14} />
                            <span>Código de Verificación Generado:</span>
                        </div>
                        <span className="text-xl font-bold tracking-widest text-white bg-slate-900 px-4 py-1.5 rounded-xl border border-indigo-500/40 my-1">
                            {generatedCodeNotice}
                        </span>
                    </div>
                )}

                {/* MODO 1: LOGIN */}
                {mode === 'LOGIN' && (
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="email"
                                placeholder="correo@ejemplo.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="password"
                                placeholder="Contraseña"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                            />
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={() => { setMode('FORGOT_PASSWORD'); resetMessages(); }}
                                className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline"
                            >
                                ¿Olvidaste tu contraseña?
                            </button>
                        </div>
                        
                        <button
                            type="submit"
                            disabled={loading}
                            className="touch-target w-full font-semibold py-3 px-4 rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/25 transition-all transform hover:scale-[1.01] flex items-center justify-center disabled:opacity-50 focus-ring"
                        >
                            {loading ? <Loader2 size={20} className="animate-spin" /> : 'Iniciar Sesión'}
                        </button>
                    </form>
                )}

                {/* MODO 2: SIGNUP (Registro con Nombre Completo) */}
                {mode === 'SIGNUP' && (
                    <form onSubmit={handleSignup} className="space-y-4">
                        <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Nombre completo"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                            />
                        </div>

                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="email"
                                placeholder="correo@ejemplo.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="password"
                                placeholder="Contraseña (mínimo 6 caracteres)"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="password"
                                placeholder="Confirmar contraseña"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                            />
                        </div>
                        
                        <button
                            type="submit"
                            disabled={loading}
                            className="touch-target w-full font-semibold py-3 px-4 rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/25 transition-all transform hover:scale-[1.01] flex items-center justify-center disabled:opacity-50 focus-ring"
                        >
                            {loading ? <Loader2 size={20} className="animate-spin" /> : 'Crear Cuenta'}
                        </button>
                    </form>
                )}

                {/* MODO 3: VERIFY_CODE (Confirmación por código de 6 dígitos) */}
                {mode === 'VERIFY_CODE' && (
                    <form onSubmit={handleVerifyCode} className="space-y-4">
                        <div className="relative">
                            <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                maxLength={6}
                                placeholder="Código de 6 dígitos (ej. 482910)"
                                required
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-700 bg-slate-900 text-slate-100 text-center font-mono text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="touch-target w-full font-semibold py-3 px-4 rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center disabled:opacity-50 focus-ring"
                        >
                            {loading ? <Loader2 size={20} className="animate-spin" /> : 'Confirmar y Activar Cuenta'}
                        </button>
                    </form>
                )}

                {/* MODO 4: FORGOT_PASSWORD */}
                {mode === 'FORGOT_PASSWORD' && (
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="email"
                                placeholder="correo@ejemplo.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="touch-target w-full font-semibold py-3 px-4 rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center disabled:opacity-50 focus-ring"
                        >
                            {loading ? <Loader2 size={20} className="animate-spin" /> : 'Enviar Código de Recuperación'}
                        </button>
                    </form>
                )}

                {/* MODO 5: RESET_PASSWORD */}
                {mode === 'RESET_PASSWORD' && (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div className="relative">
                            <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                maxLength={6}
                                placeholder="Código de 6 dígitos"
                                required
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-slate-100 text-center font-mono text-base tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="password"
                                placeholder="Nueva contraseña (min 6 carac.)"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="password"
                                placeholder="Confirmar nueva contraseña"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="touch-target w-full font-semibold py-3 px-4 rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center disabled:opacity-50 focus-ring"
                        >
                            {loading ? <Loader2 size={20} className="animate-spin" /> : 'Restablecer Contraseña'}
                        </button>
                    </form>
                )}

                {/* Alternador de Vistas / Links */}
                <div className="text-center mt-6 pt-4 border-t border-slate-800/80 flex flex-col items-center gap-2">
                    {mode === 'LOGIN' && (
                        <button
                            type="button"
                            onClick={() => { setMode('SIGNUP'); resetMessages(); }}
                            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold hover:underline"
                        >
                            ¿No tienes cuenta? Regístrate aquí
                        </button>
                    )}

                    {(mode === 'SIGNUP' || mode === 'FORGOT_PASSWORD' || mode === 'VERIFY_CODE' || mode === 'RESET_PASSWORD') && (
                        <button
                            type="button"
                            onClick={() => { setMode('LOGIN'); resetMessages(); }}
                            className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 hover:underline"
                        >
                            <ArrowLeft size={14} />
                            <span>Volver al Inicio de Sesión</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuthPage;