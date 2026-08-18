import React, { useState, useEffect } from 'react';
import { X, User, Key, CheckCircle2, AlertCircle, Loader2, ShieldCheck, Mail } from 'lucide-react';
import { supabase } from '../../apiClient.js';

const ProfileModal = ({ user, onClose, onUserUpdated }) => {
    const [name, setName] = useState(user?.name || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [message, setMessage] = useState({ text: '', type: 'success' });

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const showMsg = (text, type = 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: 'success' }), 4000);
    };

    const handleUpdateName = async (e) => {
        e.preventDefault();
        if (!name.trim()) {
            showMsg('Ingresa un nombre válido', 'error');
            return;
        }
        setIsSavingProfile(true);
        const { data, error } = await supabase.auth.updateProfile({ name });
        setIsSavingProfile(false);

        if (error) {
            showMsg(error.message || 'Error al actualizar el nombre', 'error');
        } else {
            showMsg('¡Nombre actualizado con éxito!');
            if (onUserUpdated && data) {
                onUserUpdated(data);
            }
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (!currentPassword || !newPassword) {
            showMsg('Completa todos los campos de contraseña', 'error');
            return;
        }
        if (newPassword.length < 6) {
            showMsg('La nueva contraseña debe tener al menos 6 caracteres', 'error');
            return;
        }
        if (newPassword !== confirmPassword) {
            showMsg('Las nuevas contraseñas no coinciden', 'error');
            return;
        }

        setIsChangingPassword(true);
        const { error } = await supabase.auth.changePassword({ currentPassword, newPassword });
        setIsChangingPassword(false);

        if (error) {
            showMsg(error.message || 'Error al cambiar la contraseña', 'error');
        } else {
            showMsg('¡Contraseña modificada correctamente!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-modal-title"
        >
            <div 
                className="w-full sm:max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 relative flex flex-col max-h-[90vh] text-slate-100 animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Visual drag handle en móvil */}
                <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-4 sm:hidden"></div>

                {/* Header Modal */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-lg">
                            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                            <h2 id="profile-modal-title" className="text-base sm:text-lg font-bold font-heading text-slate-100">
                                Mi Perfil de Usuario
                            </h2>
                            <p className="text-xs text-slate-400">{user?.email}</p>
                        </div>
                    </div>
                    <button 
                        type="button"
                        onClick={onClose} 
                        aria-label="Cerrar modal de perfil"
                        className="touch-target p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors focus-ring"
                    >
                        <X size={20}/>
                    </button>
                </div>

                {/* Feedback Toast */}
                {message.text && (
                    <div className={`mb-4 p-3 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 ${
                        message.type === 'error' 
                            ? 'bg-red-500/10 text-red-400 border border-red-500/30' 
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    }`}>
                        {message.type === 'error' ? <AlertCircle size={16}/> : <CheckCircle2 size={16}/>}
                        <span>{message.text}</span>
                    </div>
                )}

                <div className="overflow-y-auto pr-1 space-y-6">
                    {/* Badge de cuenta verificada */}
                    <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-slate-300 font-medium">
                            <ShieldCheck size={16} className="text-emerald-400" />
                            <span>Estado de la cuenta</span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-bold">
                            Verificada ✓
                        </span>
                    </div>

                    {/* Sección 1: Editar Nombre */}
                    <form onSubmit={handleUpdateName} className="space-y-3">
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                            Nombre Completo
                        </label>
                        <div className="relative">
                            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Tu nombre completo"
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isSavingProfile}
                            className="touch-target w-full text-xs font-semibold py-2.5 px-4 rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 transition-all flex items-center justify-center gap-2 focus-ring disabled:opacity-50"
                        >
                            {isSavingProfile ? <Loader2 size={16} className="animate-spin" /> : 'Actualizar Nombre'}
                        </button>
                    </form>

                    <div className="h-px bg-slate-800"></div>

                    {/* Sección 2: Cambiar Contraseña */}
                    <form onSubmit={handleChangePassword} className="space-y-3">
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                            Seguridad & Contraseña
                        </label>
                        <div className="space-y-2">
                            <div className="relative">
                                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="password"
                                    required
                                    placeholder="Contraseña actual"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                                />
                            </div>
                            <div className="relative">
                                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="password"
                                    required
                                    placeholder="Nueva contraseña (min 6 carac.)"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                                />
                            </div>
                            <div className="relative">
                                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="password"
                                    required
                                    placeholder="Confirmar nueva contraseña"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-700 bg-slate-950 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={isChangingPassword}
                            className="touch-target w-full text-xs font-semibold py-2.5 px-4 rounded-xl text-slate-200 border border-slate-700 bg-slate-800/80 hover:bg-slate-800 hover:text-white transition-all flex items-center justify-center gap-2 focus-ring disabled:opacity-50"
                        >
                            {isChangingPassword ? <Loader2 size={16} className="animate-spin" /> : 'Cambiar Contraseña'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfileModal;
