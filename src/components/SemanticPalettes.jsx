import React, { useState } from 'react';
import tinycolor from 'tinycolor2';
import { Layers, Info, CheckCircle2, AlertTriangle, AlertOctagon, Sparkles, Eye, ShieldCheck, Copy, Check, MousePointerClick, Code2, Sparkle } from 'lucide-react';

// Etiquetas para los modos de fondo de esta sección
const backgroundModeLabels = {
    'card': 'Fondo Tarjeta',
    'white': 'Fondo Blanco',
    'T950': 'Fondo T950',
    'black': 'Fondo Negro',
    'T0': 'Fondo T0',
};

// Función helper para obtener el color de fondo correcto
const getPreviewBgColor = (mode, themeData) => {
    const { grayShades, stylePalette } = themeData || {};
    if (!grayShades || grayShades.length < 20) return '#FFFFFF'; 
    switch (mode) {
        case 'white': return '#FFFFFF';
        case 'T950': return grayShades[19]; 
        case 'black': return '#000000';
        case 'T0': return grayShades[0]; 
        case 'card':
        default:
            const cardBg = stylePalette?.fullBackgroundColors?.find(c => c.name === 'Apagado')?.color;
            return cardBg || grayShades[1];
    }
};

const SemanticPalettes = ({ stylePalette, onCopy, themeData, previewMode, onCyclePreviewMode, simulationMode }) => {
    const bgColor = getPreviewBgColor(previewMode, themeData);
    const isLight = tinycolor(bgColor).isLight();
    const textColor = isLight ? '#18181b' : '#f4f4f5';
    const textMuted = isLight ? '#71717a' : '#a1a1aa';
    const buttonBg = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.08)';
    const cardBorder = isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.12)';

    // Estado para la combinación activa en la Vista Previa en Vivo
    const [selectedTab, setSelectedTab] = useState('info'); // 'info' | 'exito' | 'atencion' | 'critico' | 'base'
    const [copiedToken, setCopiedToken] = useState(false);

    // Obtener los arreglos semánticos o fallbacks
    const bgColors = stylePalette?.fullBackgroundColors || [];
    const fgColors = stylePalette?.fullForegroundColors || [];
    const borderColors = stylePalette?.fullBorderColors || [];
    const actionColors = stylePalette?.fullActionColors || [];
    const decorateColors = stylePalette?.decorateColors || [];

    // Helper para buscar color por nombre en arreglos semánticos
    const findColor = (arr, name) => arr.find(c => c.name.toLowerCase() === name.toLowerCase())?.color || '#888888';

    // Definición de las 5 combinaciones semánticas predefinidas
    const rawPresets = {
        info: {
            id: 'info',
            title: 'Información',
            badgeText: 'Info Sistema',
            icon: <Info size={18} className="shrink-0 text-cyan-500" />,
            bgName: 'InfoDebil',
            rawBgColor: findColor(bgColors, 'InfoDebil'),
            textName: 'Info',
            rawTextColor: findColor(fgColors, 'Info'),
            borderName: 'InfoFuerte',
            rawBorderColor: findColor(borderColors, 'InfoFuerte'),
            sampleTitle: 'Actualización Disponible',
            sampleBody: 'Hemos optimizado tus paletas cromáticas para cumplir los estándares WCAG 2.1.',
            inputPlaceholder: 'usuario@dominio.com',
            buttonLabel: 'Ver Detalles',
            badgeClass: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
        },
        exito: {
            id: 'exito',
            title: 'Éxito / Confirmación',
            badgeText: 'Operación Exitosa',
            icon: <CheckCircle2 size={18} className="shrink-0 text-emerald-500" />,
            bgName: 'ExitoDebil',
            rawBgColor: findColor(bgColors, 'ExitoDebil'),
            textName: 'Exito',
            rawTextColor: findColor(fgColors, 'Exito'),
            borderName: 'ExitoFuerte',
            rawBorderColor: findColor(borderColors, 'ExitoFuerte'),
            sampleTitle: 'Paleta Guardada con Éxito',
            sampleBody: 'Tus tokens CSS y JSON fueron exportados nativamente a tu espacio de trabajo.',
            inputPlaceholder: 'Código verificado ✓',
            buttonLabel: 'Descargar Assets',
            badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
        },
        atencion: {
            id: 'atencion',
            title: 'Atención / Advertencia',
            badgeText: 'Advertencia WCAG',
            icon: <AlertTriangle size={18} className="shrink-0 text-amber-500" />,
            bgName: 'AtencionDebil',
            rawBgColor: findColor(bgColors, 'AtencionDebil'),
            textName: 'Atencion',
            rawTextColor: findColor(fgColors, 'Atencion'),
            borderName: 'AtencionFuerte',
            rawBorderColor: findColor(borderColors, 'AtencionFuerte'),
            sampleTitle: 'Verifica el Contraste del Texto',
            sampleBody: 'El texto en segundo plano requiere una relación de contraste mínima de 4.5:1.',
            inputPlaceholder: 'Advertencia: Nombre corto',
            buttonLabel: 'Auditar Ahora',
            badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
        },
        critico: {
            id: 'critico',
            title: 'Crítico / Peligro',
            badgeText: 'Error Grave',
            icon: <AlertOctagon size={18} className="shrink-0 text-red-500" />,
            bgName: 'CriticoDebil',
            rawBgColor: findColor(bgColors, 'CriticoDebil'),
            textName: 'Critico',
            rawTextColor: findColor(fgColors, 'Critico'),
            borderName: 'CriticoFuerte',
            rawBorderColor: findColor(borderColors, 'CriticoFuerte'),
            sampleTitle: '¿Eliminar Paleta de Forma Permanente?',
            sampleBody: 'Esta acción borrará todas las variables guardadas. Esta acción no se puede deshacer.',
            inputPlaceholder: 'Error: Contraseña incorrecta',
            buttonLabel: 'Confirmar Borrado',
            badgeClass: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30',
        },
        base: {
            id: 'base',
            title: 'Base / Neutro',
            badgeText: 'Estándar UI',
            icon: <Sparkles size={18} className="shrink-0 text-zinc-500 dark:text-zinc-400" />,
            bgName: 'Apagado',
            rawBgColor: findColor(bgColors, 'Apagado'),
            textName: 'Predeterminado',
            rawTextColor: findColor(fgColors, 'Predeterminado'),
            borderName: 'Predeterminado',
            rawBorderColor: findColor(borderColors, 'Predeterminado'),
            sampleTitle: 'Tarjeta de Contenido General',
            sampleBody: 'Representación neutra para módulos de interfaz, listas y paneles informativos.',
            inputPlaceholder: 'Ingresa una búsqueda...',
            buttonLabel: 'Guardar Borrador',
            badgeClass: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/30',
        }
    };

    const rawActive = rawPresets[selectedTab] || rawPresets.info;

    // --- CÁLCULO DE TEXTO ALTO CONTRASTE (Punto 3 del Usuario) ---
    // En lugar de usar texto saturado que provoca "Falla" en WCAG sobre fondos claros/oscuros,
    // calculamos dinámicamente el color de texto blanco/negro/oscuro óptimo.
    const activeBgColor = rawActive.rawBgColor;
    const activeBorderColor = rawActive.rawBorderColor;
    const isBgLight = tinycolor(activeBgColor).isLight();
    
    // Texto blanco o negro según legibilidad garantizada (Cumple WCAG AAA/AA siempre)
    const activeTextColor = tinycolor.mostReadable(activeBgColor, ['#09090b', '#ffffff', '#18181b', '#f4f4f5']).toHexString();
    const activeMutedColor = isBgLight ? 'rgba(9, 9, 11, 0.75)' : 'rgba(255, 255, 255, 0.8)';

    // Auditoría de contraste real
    const contrastRatio = tinycolor.readability(activeBgColor, activeTextColor).toFixed(2);
    const passesAA = contrastRatio >= 4.5;
    const passesAAA = contrastRatio >= 7.0;

    const handleCopyCSSVars = () => {
        const cssSnippet = `--bg-semantic: ${activeBgColor};\n--text-semantic: ${activeTextColor};\n--border-semantic: ${activeBorderColor};`;
        navigator.clipboard.writeText(cssSnippet);
        setCopiedToken(true);
        onCopy(activeBgColor, `Variables CSS de ${rawActive.title} copiadas al portapapeles!`);
        setTimeout(() => setCopiedToken(false), 2000);
    };

    // --- ALINEACIÓN EN MATRIZ DE 10 COLUMNAS ---
    const columnHeaders = [
        'Predeterminado', 'Apagado', 'Débil', 'Fuerte', 'Inverso', 'Marca', 'Info', 'Éxito', 'Atención', 'Crítico'
    ];

    const alignedFondos = [
        bgColors[0], bgColors[1], bgColors[2], bgColors[3], bgColors[4],
        bgColors[5], bgColors[6], bgColors[7], bgColors[8], bgColors[9]
    ].filter(Boolean);

    const alignedTextos = [
        fgColors[0], fgColors[1], fgColors[2], fgColors[3], fgColors[4],
        fgColors[9], fgColors[5], fgColors[8], fgColors[7], fgColors[6]
    ].filter(Boolean);

    const alignedBordes = [
        findColor(borderColors, 'Predeterminado') ? { name: 'Predeterminado', color: findColor(borderColors, 'Predeterminado') } : null,
        null,
        findColor(borderColors, 'Fuerte') ? { name: 'Fuerte', color: findColor(borderColors, 'Fuerte') } : null,
        null,
        findColor(borderColors, 'Inverso') ? { name: 'Inverso', color: findColor(borderColors, 'Inverso') } : null,
        null,
        findColor(borderColors, 'InfoFuerte') ? { name: 'InfoFuerte', color: findColor(borderColors, 'InfoFuerte') } : null,
        findColor(borderColors, 'ExitoFuerte') ? { name: 'ExitoFuerte', color: findColor(borderColors, 'ExitoFuerte') } : null,
        findColor(borderColors, 'AtencionFuerte') ? { name: 'AtencionFuerte', color: findColor(borderColors, 'AtencionFuerte') } : null,
        findColor(borderColors, 'CriticoFuerte') ? { name: 'CriticoFuerte', color: findColor(borderColors, 'CriticoFuerte') } : null,
    ];

    const simulationFilterStyle = {
        filter: simulationMode !== 'none' ? `url(#${simulationMode})` : 'none'
    };

    return (
        <section className="p-3 sm:p-6 transition-colors duration-200" style={{ backgroundColor: bgColor, ...simulationFilterStyle }}>
            
            {/* Header explicativo e intuitivo (Punto 1 y 4 del usuario) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b" style={{ borderColor: cardBorder }}>
                <div>
                    <div className="flex items-center gap-2">
                        <span className="p-2 rounded-xl bg-[#0BA5C7]/10 text-[#0BA5C7] border border-[#0BA5C7]/20">
                            <Sparkles size={20} />
                        </span>
                        <div>
                            <h2 className="font-heading font-extrabold text-lg sm:text-xl uppercase tracking-tight" style={{ color: textColor }}>
                                Paletas Semánticas — Guía Visual & Uso en Interfaz
                            </h2>
                            <p className="text-xs font-medium mt-0.5" style={{ color: textMuted }}>
                                Asigna significados funcionales a tus colores (Éxito, Errores, Advertencias, Información) y pruébalos en componentes reales.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 self-start md:self-auto">
                    <span className="text-xs font-mono px-3 py-1.5 rounded-xl border font-semibold shadow-xs" style={{ backgroundColor: buttonBg, color: textColor, borderColor: cardBorder }}>
                        {backgroundModeLabels[previewMode]}
                    </span>
                    <button
                        onClick={onCyclePreviewMode}
                        className="text-xs font-bold py-1.5 px-3.5 rounded-xl flex items-center gap-2 border transition-all active:scale-95 shadow-xs"
                        style={{ backgroundColor: buttonBg, color: textColor, borderColor: cardBorder }}
                        title="Alternar entre fondo claro, oscuro, negro o tarjeta"
                    >
                        <Layers size={15} className="text-[#0BA5C7]" />
                        <span>Alternar Fondo</span>
                    </button>
                </div>
            </div>

            {/* --- SECCIÓN DESAPLASTADA DE PESTAÑAS DE ESTADO (Punto 2 del Usuario) --- */}
            <div className="mb-4">
                <p className="text-xs font-extrabold uppercase tracking-wider font-heading mb-2.5" style={{ color: textMuted }}>
                    1. Selecciona un Rol Semántico para Inspeccionar su Comportamiento:
                </p>

                {/* Filas de pestañas holgadas sin compresión ni barras de desplazamiento incómodas */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                    {Object.keys(rawPresets).map((key) => {
                        const preset = rawPresets[key];
                        const isActive = selectedTab === key;
                        return (
                            <button
                                key={key}
                                onClick={() => setSelectedTab(key)}
                                className={`px-4 py-3 rounded-2xl text-xs font-extrabold transition-all flex items-center justify-between border shadow-xs ${
                                    isActive 
                                        ? 'bg-[#0BA5C7] text-white border-[#0BA5C7] shadow-md shadow-[#0BA5C7]/20 scale-[1.02]' 
                                        : 'hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'
                                }`}
                                style={!isActive ? { backgroundColor: buttonBg, color: textColor, borderColor: cardBorder } : {}}
                            >
                                <div className="flex items-center gap-2.5">
                                    {preset.icon}
                                    <span className="font-heading uppercase tracking-tight">{preset.title.split('/')[0]}</span>
                                </div>
                                {isActive && <Check size={16} className="text-white shrink-0" />}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* --- VISTA PREVIA INTERACTIVA DE COMPONENTES REALES (Punto 1, 3 y 4 del Usuario) --- */}
            <div className="mb-8 p-5 sm:p-7 rounded-3xl border shadow-xl transition-all duration-300 relative overflow-hidden" style={{ backgroundColor: isLight ? 'rgba(0,0,0,0.02)' : 'rgba(255,255,255,0.02)', borderColor: cardBorder }}>
                
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-4 border-b" style={{ borderColor: cardBorder }}>
                    <div>
                        <div className="flex items-center gap-2">
                            <Eye size={18} className="text-[#0BA5C7]" />
                            <h3 className="text-sm font-black uppercase tracking-wider font-heading" style={{ color: textColor }}>
                                Demostración de Interfaz Real — {rawActive.title}
                            </h3>
                        </div>
                        <p className="text-xs font-medium mt-0.5" style={{ color: textMuted }}>
                            Así es exactamente como se ven juntos el <strong>Fondo ({rawActive.bgName})</strong>, el <strong>Texto ({rawActive.textName})</strong> y el <strong>Borde ({rawActive.borderName})</strong> en tu aplicación.
                        </p>
                    </div>

                    {/* Auditoría WCAG en Vivo (Punto 3 del Usuario: Contraste Garantizado) */}
                    <div className="flex items-center gap-2 self-start lg:self-auto">
                        <div className={`px-3 py-1.5 rounded-xl text-xs font-extrabold uppercase border flex items-center gap-2 ${
                            passesAA 
                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' 
                                : 'bg-red-500/15 text-red-700 dark:text-red-300 border-red-500/30'
                        }`}>
                            <ShieldCheck size={16} />
                            <span>Ratio {contrastRatio}:1 — {passesAAA ? 'AAA Excepcional' : 'AA Cumple WCAG'}</span>
                        </div>

                        <button
                            onClick={handleCopyCSSVars}
                            className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wider bg-[#0BA5C7] text-white hover:bg-[#0993B3] transition-all shadow-sm active:scale-95 flex items-center gap-1.5"
                            title="Copiar Variables CSS de este Estado"
                        >
                            {copiedToken ? <Check size={15} /> : <Copy size={15} />}
                            <span>{copiedToken ? '¡Copiado!' : 'Copiar Tokens'}</span>
                        </button>
                    </div>
                </div>

                {/* Rejilla de Componentes Reales */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                    
                    {/* Componente 1: Tarjeta de Notificación / Alerta */}
                    <div 
                        className="p-5 rounded-2xl border-2 shadow-md transition-all duration-300 flex flex-col justify-between"
                        style={{
                            backgroundColor: activeBgColor,
                            color: activeTextColor,
                            borderColor: activeBorderColor,
                        }}
                    >
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2 font-bold text-xs">
                                    {rawActive.icon}
                                    <span className="font-heading uppercase tracking-wider">{rawActive.badgeText}</span>
                                </div>
                                <span 
                                    className="px-2 py-0.5 rounded-md text-[10px] font-mono font-extrabold border"
                                    style={{
                                        borderColor: activeBorderColor,
                                        color: activeTextColor
                                    }}
                                >
                                    Banner UI
                                </span>
                            </div>

                            <h4 className="text-sm font-black font-heading tracking-tight mb-1">
                                {rawActive.sampleTitle}
                            </h4>
                            <p className="text-xs leading-relaxed font-medium" style={{ color: activeMutedColor }}>
                                {rawActive.sampleBody}
                            </p>
                        </div>

                        <div className="mt-4 pt-3 border-t flex items-center justify-between" style={{ borderColor: activeBorderColor }}>
                            <span className="text-[10px] font-mono opacity-80">
                                {activeBgColor.toUpperCase()}
                            </span>
                            <button 
                                className="px-3 py-1 rounded-lg text-xs font-extrabold transition-transform active:scale-95 border"
                                style={{
                                    backgroundColor: activeBorderColor,
                                    color: tinycolor(activeBorderColor).isLight() ? '#000' : '#FFF',
                                    borderColor: activeBorderColor
                                }}
                            >
                                {rawActive.buttonLabel}
                            </button>
                        </div>
                    </div>

                    {/* Componente 2: Campo de Formulario (Input) con Validación Semántica */}
                    <div className="p-5 rounded-2xl border flex flex-col justify-between" style={{ backgroundColor: buttonBg, borderColor: cardBorder }}>
                        <div>
                            <span className="text-[11px] font-extrabold uppercase tracking-wider font-heading block mb-2" style={{ color: textMuted }}>
                                Campo de Entrada de Datos
                            </span>
                            <label className="block text-xs font-bold mb-1.5" style={{ color: textColor }}>
                                Estado de Campo ({rawActive.title})
                            </label>
                            
                            <div 
                                className="w-full px-3.5 py-2.5 rounded-xl border-2 text-xs font-medium flex items-center justify-between shadow-xs transition-colors"
                                style={{
                                    backgroundColor: activeBgColor,
                                    color: activeTextColor,
                                    borderColor: activeBorderColor
                                }}
                            >
                                <span className="truncate">{rawActive.inputPlaceholder}</span>
                                {rawActive.icon}
                            </div>

                            <p className="text-[11px] font-medium mt-2 flex items-center gap-1" style={{ color: textMuted }}>
                                <span>Borde y resalte ajustados con el token:</span>
                                <strong style={{ color: textColor }}>{rawActive.borderName}</strong>
                            </p>
                        </div>

                        <div className="pt-3 mt-4 border-t flex items-center justify-between text-[11px] font-mono" style={{ borderColor: cardBorder, color: textMuted }}>
                            <span>Borde: {activeBorderColor.toUpperCase()}</span>
                            <span className="text-emerald-500 font-bold">Valido ✓</span>
                        </div>
                    </div>

                    {/* Componente 3: Desglose Técnico & Tokens CSS Copiables */}
                    <div className="p-5 rounded-2xl border flex flex-col justify-between text-xs space-y-3" style={{ backgroundColor: buttonBg, borderColor: cardBorder }}>
                        <div>
                            <div className="flex items-center gap-2 mb-3 pb-2 border-b" style={{ borderColor: cardBorder }}>
                                <Code2 size={16} className="text-[#0BA5C7]" />
                                <span className="font-extrabold font-heading uppercase tracking-wider" style={{ color: textColor }}>
                                    Tokens de la Combinación
                                </span>
                            </div>

                            <div className="space-y-2 font-mono text-[11px]">
                                <div className="p-2 rounded-xl border flex items-center justify-between" style={{ backgroundColor: bgColor, borderColor: cardBorder }}>
                                    <span className="flex items-center gap-2" style={{ color: textMuted }}>
                                        <span className="h-3.5 w-3.5 rounded-md border shadow-xs" style={{ backgroundColor: activeBgColor, borderColor: cardBorder }}></span>
                                        Fondo ({rawActive.bgName})
                                    </span>
                                    <span className="font-bold" style={{ color: textColor }}>{activeBgColor.toUpperCase()}</span>
                                </div>

                                <div className="p-2 rounded-xl border flex items-center justify-between" style={{ backgroundColor: bgColor, borderColor: cardBorder }}>
                                    <span className="flex items-center gap-2" style={{ color: textMuted }}>
                                        <span className="h-3.5 w-3.5 rounded-md border shadow-xs" style={{ backgroundColor: activeTextColor, borderColor: cardBorder }}></span>
                                        Texto (Contraste Alto)
                                    </span>
                                    <span className="font-bold" style={{ color: textColor }}>{activeTextColor.toUpperCase()}</span>
                                </div>

                                <div className="p-2 rounded-xl border flex items-center justify-between" style={{ backgroundColor: bgColor, borderColor: cardBorder }}>
                                    <span className="flex items-center gap-2" style={{ color: textMuted }}>
                                        <span className="h-3.5 w-3.5 rounded-md border shadow-xs" style={{ backgroundColor: activeBorderColor, borderColor: cardBorder }}></span>
                                        Borde ({rawActive.borderName})
                                    </span>
                                    <span className="font-bold" style={{ color: textColor }}>{activeBorderColor.toUpperCase()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-2.5 rounded-xl border bg-zinc-950 text-white font-mono text-[10px] space-y-0.5 border-zinc-800">
                            <p className="text-zinc-400">// Copy-paste ready CSS variables</p>
                            <p><span className="text-cyan-400">--bg-semantic</span>: {activeBgColor};</p>
                            <p><span className="text-emerald-400">--text-semantic</span>: {activeTextColor};</p>
                            <p><span className="text-amber-400">--border-semantic</span>: {activeBorderColor};</p>
                        </div>
                    </div>

                </div>
            </div>

            {/* --- MATRIZ DE COLUMNAS ALINEADAS PARA LAS PALETAS SEMÁNTICAS --- */}
            <div className="pt-6 border-t" style={{ borderColor: cardBorder }}>
                <div className="mb-3">
                    <h3 className="text-sm font-extrabold uppercase tracking-wider font-heading" style={{ color: textColor }}>
                        2. Matriz Completa de Paletas Semánticas (Alineada por Rol)
                    </h3>
                    <p className="text-xs mt-0.5 font-medium" style={{ color: textMuted }}>
                        Cada columna representa un rol semántico único. Haz clic en cualquier muestra para copiar su código HEX.
                    </p>
                </div>

                {/* Encabezados de Columna Alineados */}
                <div className="hidden md:grid grid-cols-10 gap-1.5 mb-2 text-center text-[11px] font-extrabold uppercase tracking-wider font-heading" style={{ color: textMuted }}>
                    {columnHeaders.map((header, idx) => (
                        <div key={idx} className="py-1 px-0.5 bg-zinc-100/60 dark:bg-zinc-800/40 rounded-lg border border-zinc-200/60 dark:border-zinc-800/60">
                            {header}
                        </div>
                    ))}
                </div>

                {/* FILA 1: FONDOS (10 Columnas Perfectamente Alineadas) */}
                <SemanticAlignedRow 
                    title="Fondos Semánticos" 
                    items={alignedFondos} 
                    onColorCopy={onCopy} 
                    textColor={textColor}
                    textMuted={textMuted}
                    cardBorder={cardBorder}
                />

                {/* FILA 2: TEXTOS (10 Columnas Perfectamente Alineadas) */}
                <SemanticAlignedRow 
                    title="Textos Semánticos" 
                    items={alignedTextos} 
                    onColorCopy={onCopy} 
                    textColor={textColor}
                    textMuted={textMuted}
                    cardBorder={cardBorder}
                />

                {/* FILA 3: BORDES (Alineados con sus respectivas columnas semánticas) */}
                <SemanticAlignedRow 
                    title="Bordes Semánticos" 
                    items={alignedBordes} 
                    onColorCopy={onCopy} 
                    textColor={textColor}
                    textMuted={textMuted}
                    cardBorder={cardBorder}
                />

                {/* FILA 4: ACCIONES */}
                <SemanticPaletteFlexRow 
                    title="Acciones / Estados de Botón" 
                    items={actionColors} 
                    onColorCopy={onCopy} 
                    textColor={textColor}
                    textMuted={textMuted}
                    cardBorder={cardBorder}
                />

                {/* FILA 5: DECORATIVOS */}
                <SemanticPaletteFlexRow 
                    title="Colores Decorativos" 
                    items={decorateColors} 
                    onColorCopy={onCopy} 
                    textColor={textColor}
                    textMuted={textMuted}
                    cardBorder={cardBorder}
                />
            </div>
        </section>
    );
};

// Componente para filas con 10 columnas perfectamente alineadas
const SemanticAlignedRow = ({ title, items, onColorCopy, textColor, textMuted, cardBorder }) => {
    return (
        <div className="mb-5">
            <h4 className="text-xs font-black uppercase tracking-wider font-heading mb-2" style={{ color: textColor }}>
                {title}
            </h4>

            <div className="grid grid-cols-5 md:grid-cols-10 gap-1.5">
                {items.map((item, idx) => {
                    if (!item) {
                        return (
                            <div key={idx} className="h-10 rounded-xl border border-dashed flex items-center justify-center opacity-30 text-[9px] font-mono" style={{ borderColor: cardBorder, color: textMuted }}>
                                -
                            </div>
                        );
                    }

                    const isLightColor = tinycolor(item.color).isLight();
                    const itemTextColor = isLightColor ? '#000000' : '#FFFFFF';

                    return (
                        <div 
                            key={idx}
                            onClick={() => onColorCopy(item.color, `${title}: ${item.name} (${item.color.toUpperCase()}) copiado!`)}
                            className="group cursor-pointer transition-all hover:scale-[1.05] hover:z-10 focus-ring"
                            title={`${item.name} - ${item.color.toUpperCase()}`}
                        >
                            <div 
                                className="h-10 rounded-xl border shadow-xs flex items-center justify-center relative overflow-hidden group-hover:shadow-md transition-shadow"
                                style={{ backgroundColor: item.color, borderColor: cardBorder }}
                            >
                                <span className="text-[10px] font-mono font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-150" style={{ color: itemTextColor }}>
                                    {item.color.substring(1).toUpperCase()}
                                </span>
                            </div>
                            <p className="text-[10px] text-center font-semibold truncate mt-1" style={{ color: textMuted }} title={item.name}>
                                {item.name}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// Componente para filas de flujo flexible (Acciones y Decorativos)
const SemanticPaletteFlexRow = ({ title, items, onColorCopy, textColor, textMuted, cardBorder }) => {
    if (!items || items.length === 0) return null;

    return (
        <div className="mb-5">
            <h4 className="text-xs font-black uppercase tracking-wider font-heading mb-2" style={{ color: textColor }}>
                {title}
            </h4>

            <div className="grid grid-cols-4 sm:grid-cols-7 md:grid-cols-8 lg:grid-cols-14 gap-1.5">
                {items.map((item, idx) => {
                    const isLightColor = tinycolor(item.color).isLight();
                    const itemTextColor = isLightColor ? '#000000' : '#FFFFFF';

                    return (
                        <div 
                            key={idx}
                            onClick={() => onColorCopy(item.color, `${title}: ${item.name} (${item.color.toUpperCase()}) copiado!`)}
                            className="group cursor-pointer transition-all hover:scale-[1.05] hover:z-10 focus-ring"
                            title={`${item.name} - ${item.color.toUpperCase()}`}
                        >
                            <div 
                                className="h-10 rounded-xl border shadow-xs flex items-center justify-center relative overflow-hidden group-hover:shadow-md transition-shadow"
                                style={{ backgroundColor: item.color, borderColor: cardBorder }}
                            >
                                <span className="text-[10px] font-mono font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-150" style={{ color: itemTextColor }}>
                                    {item.color.substring(1).toUpperCase()}
                                </span>
                            </div>
                            <p className="text-[10px] text-center font-semibold truncate mt-1" style={{ color: textMuted }} title={item.name}>
                                {item.name}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SemanticPalettes;