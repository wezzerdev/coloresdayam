import React, { useEffect } from 'react';
import { X, Sparkles, BookOpen, CheckCircle2 } from 'lucide-react';

const HelpModal = ({ onClose }) => {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return (
        <div 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200" 
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="help-modal-title"
        >
            <div 
                className="w-full sm:max-w-2xl bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 relative flex flex-col max-h-[85vh] text-slate-100 animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Drag handle visual para móvil */}
                <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-4 sm:hidden"></div>

                <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            <BookOpen size={20} />
                        </div>
                        <div>
                            <h2 id="help-modal-title" className="text-lg sm:text-xl font-bold font-heading text-slate-100">
                                Guía Rápida — Colores Dayam
                            </h2>
                            <p className="text-xs text-slate-400">Aprende a usar el estudio de color en 4 sencillos pasos</p>
                        </div>
                    </div>
                    <button 
                        type="button"
                        onClick={onClose} 
                        aria-label="Cerrar modal"
                        className="touch-target p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors focus-ring"
                    >
                        <X size={20}/>
                    </button>
                </div>
                
                <div className="overflow-y-auto pr-1 space-y-5 text-xs sm:text-sm text-slate-300">
                    <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex items-start gap-3">
                        <Sparkles className="h-5 w-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                        <p>¡Bienvenido! Con Colores Dayam crearás paletas cromáticas profesionales y accesibles para tus aplicaciones en segundos.</p>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                            <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
                                <span className="h-5 w-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs">1</span>
                                <h3>Elige tu Color Base o Genera con IA</h3>
                            </div>
                            <p className="text-slate-400 pl-7">
                                Selecciona un <strong>Color de Marca</strong> principal o presiona <strong>Generar Aleatorio ✨</strong> o usa la IA para descubrir armonías cromáticas listas para producción.
                            </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                            <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
                                <span className="h-5 w-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs">2</span>
                                <h3>Personaliza la Tipografía y Escala de Grises</h3>
                            </div>
                            <p className="text-slate-400 pl-7">
                                Activa <strong>Gris Automático</strong> para calcular sombras armónicas. Cambia la fuente tipográfica y alterna entre modo claro/oscuro para validar el contraste.
                            </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                            <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
                                <span className="h-5 w-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs">3</span>
                                <h3>Auditoría de Accesibilidad & Daltonismo</h3>
                            </div>
                            <p className="text-slate-400 pl-7">
                                Simula protanopia, deuteranopia y tritanopia, y revisa la matriz de contraste WCAG (AAA/AA) para asegurar accesibilidad universal.
                            </p>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                            <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
                                <span className="h-5 w-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs">4</span>
                                <h3>Exporta Código para Web, iOS o Android</h3>
                            </div>
                            <p className="text-slate-400 pl-7">
                                En la ventana <strong>Exportar</strong>, obtén tokens listos para copiar en CSS Variables, Tailwind CSS v3/v4, JSON o formato nativo.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800 flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="touch-target w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-600/20 transition-all focus-ring"
                    >
                        Entendido, continuar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HelpModal;