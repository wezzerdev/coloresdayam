import React, { useRef, useState, useEffect } from 'react';
import { RefreshCcw, Upload, Download, HelpCircle, Type, User, LogOut, Palette, ChevronDown } from 'lucide-react';
import { HelpModal } from './modals';
import { availableFonts } from '../utils/colorUtils';

const Header = ({ onImport, onExport, onReset, themeData, font, setFont, user, onLogout }) => {
    const importFileRef = useRef(null);
    const fontMenuRef = useRef(null);
    const [isHelpVisible, setIsHelpVisible] = useState(false);
    const [isFontMenuVisible, setIsFontMenuVisible] = useState(false);

    const controlsThemeStyle = themeData?.controlsThemeStyle || {};
    const pageTextColor = themeData?.stylePalette?.fullForegroundColors?.find(c => c.name === 'Predeterminado')?.color || 'inherit';
    const mutedTextColor = themeData?.stylePalette?.fullForegroundColors?.find(c => c.name === 'Apagado')?.color || 'rgba(148, 163, 184, 0.8)';

    // Cerrar el menú desplegable al hacer clic fuera o presionar Escape
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (fontMenuRef.current && !fontMenuRef.current.contains(e.target)) {
                setIsFontMenuVisible(false);
            }
        };
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setIsFontMenuVisible(false);
                setIsHelpVisible(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return (
        <>
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b border-slate-800/60 gap-4">
                {/* Branding principal con logo y títulos adaptativos */}
                <div className="flex items-center gap-3 sm:gap-4 group">
                    <div className="relative flex items-center justify-center h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
                        <div className="h-full w-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                            <Palette className="h-6 w-6 sm:h-7 sm:w-7 text-indigo-400" />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            {/* Título adaptativo: Móvil conciso / Escritorio completo */}
                            <h1 className="text-lg sm:text-2xl font-extrabold tracking-tight font-heading" style={{ color: pageTextColor }}>
                                <span className="sm:hidden text-rainbow-gradient">COLORES DAYAM</span>
                                <span className="hidden sm:inline text-rainbow-gradient">COLORES DAYAM</span>
                            </h1>
                            <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                STUDIO
                            </span>
                        </div>
                        <p className="text-xs sm:text-sm font-medium tracking-wide" style={{ color: mutedTextColor }}>
                            Estudio interactivo de diseño de color & accesibilidad WCAG
                        </p>
                    </div>
                </div>

                {/* Acciones de usuario y herramientas */}
                {user ? (
                    <div className="flex items-center gap-2 self-end sm:self-center">
                        <div 
                            className="flex items-center gap-2 text-xs sm:text-sm font-medium px-3 py-2 rounded-xl border border-slate-700/60 shadow-sm"
                            style={controlsThemeStyle}
                        >
                            <User size={18} className="text-indigo-400" />
                            <span className="font-semibold hidden sm:inline">{user.name || user.email}</span>
                        </div>
                        <button
                            type="button"
                            title="Cerrar Sesión"
                            aria-label="Cerrar Sesión"
                            onClick={onLogout}
                            className="touch-target px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-slate-700/60 hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 focus-ring"
                            style={controlsThemeStyle}
                        >
                            <LogOut size={18} />
                            <span className="sr-only sm:not-sr-only sm:ml-1.5">Salir</span>
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 self-stretch sm:self-center flex-wrap justify-end">
                        <input type="file" ref={importFileRef} onChange={onImport} accept=".json" className="hidden" aria-hidden="true" />

                        {/* Menú de Selección de Tipografía con Accesibilidad */}
                        <div className="relative" ref={fontMenuRef}>
                            <button
                                type="button"
                                title="Cambiar Fuente Tipográfica"
                                aria-label="Cambiar Fuente Tipográfica"
                                aria-expanded={isFontMenuVisible}
                                className="touch-target px-3 py-2 rounded-xl text-xs sm:text-sm font-medium border border-slate-700/60 flex items-center gap-1.5 hover:border-indigo-500/50 transition-all focus-ring"
                                style={controlsThemeStyle}
                                onClick={() => setIsFontMenuVisible(!isFontMenuVisible)}
                            >
                                <Type size={18} className="text-indigo-400" />
                                <span className="hidden md:inline font-semibold">{font}</span>
                                <ChevronDown size={14} className={`transition-transform duration-200 ${isFontMenuVisible ? 'rotate-180' : ''}`} />
                            </button>

                            {isFontMenuVisible && (
                                <div
                                    className="absolute top-full right-0 mt-2 w-52 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 p-1.5 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150"
                                    role="menu"
                                    aria-orientation="vertical"
                                >
                                    <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 mb-1">
                                        Tipografía
                                    </div>
                                    {Object.keys(availableFonts).map(fontName => (
                                        <button
                                            key={fontName}
                                            type="button"
                                            role="menuitem"
                                            onClick={() => {
                                                setFont(fontName);
                                                setIsFontMenuVisible(false);
                                            }}
                                            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between transition-colors ${
                                                font === fontName
                                                    ? 'bg-indigo-600/20 text-indigo-400 font-bold border border-indigo-500/30'
                                                    : 'text-slate-200 hover:bg-slate-800/80 hover:text-white'
                                            }`}
                                        >
                                            <span style={{ fontFamily: availableFonts[fontName] }}>{fontName}</span>
                                            {font === fontName && <span className="h-1.5 w-1.5 rounded-full bg-indigo-400"></span>}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Botón Importar */}
                        <button
                            type="button"
                            title="Importar Tema (.json)"
                            aria-label="Importar Tema (.json)"
                            onClick={() => importFileRef.current?.click()}
                            className="touch-target px-3 py-2 rounded-xl text-xs sm:text-sm font-medium border border-slate-700/60 hover:border-indigo-500/50 transition-all focus-ring"
                            style={controlsThemeStyle}
                        >
                            <Upload size={18} className="text-slate-300" />
                            <span className="hidden lg:inline ml-1.5 font-semibold">Importar</span>
                        </button>

                        {/* Botón Exportar */}
                        <button
                            type="button"
                            title="Exportar Tema Completo"
                            aria-label="Exportar Tema Completo"
                            onClick={onExport}
                            className="touch-target px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all focus-ring"
                        >
                            <Download size={18} />
                            <span className="hidden lg:inline ml-1.5">Exportar</span>
                        </button>

                        <div className="h-6 w-px bg-slate-800 mx-0.5"></div>

                        {/* Botón Reiniciar */}
                        <button
                            type="button"
                            title="Reiniciar a tema por defecto"
                            aria-label="Reiniciar a tema por defecto"
                            onClick={onReset}
                            className="touch-target px-3 py-2 rounded-xl text-xs sm:text-sm font-medium border border-slate-700/60 hover:border-indigo-500/50 hover:bg-slate-800/50 transition-all focus-ring"
                            style={controlsThemeStyle}
                        >
                            <RefreshCcw size={18} className="text-slate-300" />
                        </button>

                        {/* Botón Ayuda */}
                        <button
                            type="button"
                            title="Ayuda y Guía de Uso"
                            aria-label="Ayuda y Guía de Uso"
                            onClick={() => setIsHelpVisible(true)}
                            className="touch-target px-3 py-2 rounded-xl text-xs sm:text-sm font-medium border border-slate-700/60 hover:border-indigo-500/50 hover:bg-slate-800/50 transition-all focus-ring"
                            style={controlsThemeStyle}
                        >
                            <HelpCircle size={18} className="text-indigo-400" />
                        </button>
                    </div>
                )}
            </header>

            {isHelpVisible && <HelpModal onClose={() => setIsHelpVisible(false)} />}
        </>
    );
};

export default Header;