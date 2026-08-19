import React, { useState } from 'react';
import tinycolor from 'tinycolor2';
import { Layers, Info, CheckCircle2, AlertTriangle, AlertOctagon, Sparkles, Eye, ShieldCheck, Check } from 'lucide-react';

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
    const buttonBg = isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.1)';
    const cardBorder = isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.12)';

    // Estado para la combinación activa en la Vista Previa en Vivo
    const [selectedTab, setSelectedTab] = useState('info'); // 'info' | 'exito' | 'atencion' | 'critico' | 'base'

    // Obtener los arreglos semánticos o fallbacks
    const bgColors = stylePalette?.fullBackgroundColors || [];
    const fgColors = stylePalette?.fullForegroundColors || [];
    const borderColors = stylePalette?.fullBorderColors || [];
    const actionColors = stylePalette?.fullActionColors || [];
    const decorateColors = stylePalette?.decorateColors || [];

    // Helper para buscar color por nombre en arreglos semánticos
    const findColor = (arr, name) => arr.find(c => c.name.toLowerCase() === name.toLowerCase())?.color || '#888888';

    // Definición de las 5 combinaciones semánticas predefinidas para la vista previa
    const semanticPresets = {
        info: {
            title: 'Información',
            icon: <Info size={18} className="shrink-0" />,
            bgName: 'InfoDebil',
            bgColor: findColor(bgColors, 'InfoDebil'),
            textName: 'Info',
            textColor: findColor(fgColors, 'Info'),
            borderName: 'InfoFuerte',
            borderColor: findColor(borderColors, 'InfoFuerte'),
            badgeText: 'Novedad',
            sampleTitle: 'Actualización del Sistema Disponible',
            sampleBody: 'Hemos optimizado las paletas cromáticas con soporte WCAG AAA.',
        },
        exito: {
            title: 'Éxito / Confirmación',
            icon: <CheckCircle2 size={18} className="shrink-0" />,
            bgName: 'ExitoDebil',
            bgColor: findColor(bgColors, 'ExitoDebil'),
            textName: 'Exito',
            textColor: findColor(fgColors, 'Exito'),
            borderName: 'ExitoFuerte',
            borderColor: findColor(borderColors, 'ExitoFuerte'),
            badgeText: 'Completado',
            sampleTitle: 'Paleta Guardada Correctamente',
            sampleBody: 'Los tokens CSS y JSON han sido exportados exitosamente.',
        },
        atencion: {
            title: 'Atención / Advertencia',
            icon: <AlertTriangle size={18} className="shrink-0" />,
            bgName: 'AtencionDebil',
            bgColor: findColor(bgColors, 'AtencionDebil'),
            textName: 'Atencion',
            textColor: findColor(fgColors, 'Atencion'),
            borderName: 'AtencionFuerte',
            borderColor: findColor(borderColors, 'AtencionFuerte'),
            badgeText: 'Revisar',
            sampleTitle: 'Ratio de Contraste Bajo',
            sampleBody: 'El elemento puede ser difícil de leer para usuarios con visión baja.',
        },
        critico: {
            title: 'Crítico / Danger',
            icon: <AlertOctagon size={18} className="shrink-0" />,
            bgName: 'CriticoDebil',
            bgColor: findColor(bgColors, 'CriticoDebil'),
            textName: 'Critico',
            textColor: findColor(fgColors, 'Critico'),
            borderName: 'CriticoFuerte',
            borderColor: findColor(borderColors, 'CriticoFuerte'),
            badgeText: 'Error 404',
            sampleTitle: 'Acción Destructiva Requerida',
            sampleBody: 'La paleta guardada será eliminada de forma permanente.',
        },
        base: {
            title: 'Base / Neutro',
            icon: <Sparkles size={18} className="shrink-0" />,
            bgName: 'Apagado',
            bgColor: findColor(bgColors, 'Apagado'),
            textName: 'Predeterminado',
            textColor: findColor(fgColors, 'Predeterminado'),
            borderName: 'Predeterminado',
            borderColor: findColor(borderColors, 'Predeterminado'),
            badgeText: 'Evolutivo',
            sampleTitle: 'Contenedor Estándar de la Aplicación',
            sampleBody: 'Fondo y tipografía base neutra para tarjetas de contenido general.',
        }
    };

    const activePreset = semanticPresets[selectedTab] || semanticPresets.info;
    const contrastRatio = tinycolor.readability(activePreset.bgColor, activePreset.textColor).toFixed(2);
    const passesAA = contrastRatio >= 4.5;
    const passesAAA = contrastRatio >= 7.0;

    // --- ALINEACIÓN EN MATRIZ DE 10 COLUMNAS ---
    // Columnas semánticas estandarizadas:
    // 0: Predeterminado | 1: Apagado | 2: Débil | 3: Fuerte | 4: Inverso | 5: Marca | 6: Info | 7: Éxito | 8: Atención | 9: Crítico
    const columnHeaders = [
        'Predeterminado', 'Apagado', 'Débil', 'Fuerte', 'Inverso', 'Marca', 'Info', 'Éxito', 'Atención', 'Crítico'
    ];

    // Mapeo alineado de Fondos (10 elementos exactos)
    const alignedFondos = [
        bgColors[0], bgColors[1], bgColors[2], bgColors[3], bgColors[4],
        bgColors[5], bgColors[6], bgColors[7], bgColors[8], bgColors[9]
    ].filter(Boolean);

    // Mapeo alineado de Textos (10 elementos exactos)
    const alignedTextos = [
        fgColors[0], fgColors[1], fgColors[2], fgColors[3], fgColors[4],
        fgColors[9], fgColors[5], fgColors[8], fgColors[7], fgColors[6]
    ].filter(Boolean);

    // Mapeo alineado de Bordes (colocando cada borde en su columna semántica exacta)
    const alignedBordes = [
        findColor(borderColors, 'Predeterminado') ? { name: 'Predeterminado', color: findColor(borderColors, 'Predeterminado') } : null,
        null, // Col 1: Apagado
        findColor(borderColors, 'Fuerte') ? { name: 'Fuerte', color: findColor(borderColors, 'Fuerte') } : null, // Col 2
        null, // Col 3
        findColor(borderColors, 'Inverso') ? { name: 'Inverso', color: findColor(borderColors, 'Inverso') } : null, // Col 4
        null, // Col 5: Marca
        findColor(borderColors, 'InfoFuerte') ? { name: 'InfoFuerte', color: findColor(borderColors, 'InfoFuerte') } : null, // Col 6: Info
        findColor(borderColors, 'ExitoFuerte') ? { name: 'ExitoFuerte', color: findColor(borderColors, 'ExitoFuerte') } : null, // Col 7: Éxito
        findColor(borderColors, 'AtencionFuerte') ? { name: 'AtencionFuerte', color: findColor(borderColors, 'AtencionFuerte') } : null, // Col 8: Atención
        findColor(borderColors, 'CriticoFuerte') ? { name: 'CriticoFuerte', color: findColor(borderColors, 'CriticoFuerte') } : null, // Col 9: Crítico
    ];

    const simulationFilterStyle = {
        filter: simulationMode !== 'none' ? `url(#${simulationMode})` : 'none'
    };

    return (
        <section className="p-3 sm:p-6 transition-colors duration-200" style={{ backgroundColor: bgColor, ...simulationFilterStyle }}>
            {/* Header de la sección */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h2 className="font-heading font-extrabold text-lg sm:text-xl uppercase tracking-tight" style={{ color: textColor }}>
                        Paletas Semánticas & Matriz de Uso
                    </h2>
                    <p className="text-xs mt-0.5" style={{ color: textMuted }}>
                        Visualiza y combina armónicamente Fondos, Textos y Bordes para UI en tiempo real
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs font-mono px-2.5 py-1 rounded-lg border font-semibold" style={{ backgroundColor: buttonBg, color: textColor, borderColor: cardBorder }}>
                        {backgroundModeLabels[previewMode]}
                    </span>
                    <button
                        onClick={onCyclePreviewMode}
                        className="text-xs font-bold py-1.5 px-3 rounded-lg flex items-center gap-1.5 border transition-all active:scale-95 shadow-xs"
                        style={{ backgroundColor: buttonBg, color: textColor, borderColor: cardBorder }}
                    >
                        <Layers size={14} className="text-[#0BA5C7]" />
                        <span>Alternar Fondo</span>
                    </button>
                </div>
            </div>

            {/* --- HERO LIVE SEMANTIC COMBINATION PREVIEW (VISTA PREVIA EN VIVO DE COMBINACIÓN) --- */}
            <div className="mb-8 p-4 sm:p-6 rounded-3xl border shadow-lg transition-all duration-300" style={{ backgroundColor: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.03)', borderColor: cardBorder }}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-3 border-b" style={{ borderColor: cardBorder }}>
                    <div className="flex items-center gap-2">
                        <Eye size={18} className="text-[#0BA5C7]" />
                        <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider font-heading" style={{ color: textColor }}>
                            Vista Previa de Componente Real (Fondo + Texto + Borde)
                        </span>
                    </div>

                    {/* Selector de pestañas de estado semántico */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                        {Object.keys(semanticPresets).map((key) => {
                            const preset = semanticPresets[key];
                            const isActive = selectedTab === key;
                            return (
                                <button
                                    key={key}
                                    onClick={() => setSelectedTab(key)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                                        isActive 
                                            ? 'bg-[#0BA5C7] text-white border-[#0BA5C7] shadow-md shadow-[#0BA5C7]/20 scale-105' 
                                            : 'hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'
                                    }`}
                                    style={!isActive ? { backgroundColor: buttonBg, color: textColor, borderColor: cardBorder } : {}}
                                >
                                    {preset.icon}
                                    <span>{preset.title.split('/')[0]}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Banner interactivo que demuestra la combinación semántica real */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                    {/* Tarjeta de Demostración del Componente */}
                    <div className="lg:col-span-2 p-5 sm:p-6 rounded-2xl border-2 transition-all duration-300 shadow-md flex flex-col justify-between"
                        style={{
                            backgroundColor: activePreset.bgColor,
                            color: activePreset.textColor,
                            borderColor: activePreset.borderColor,
                        }}
                    >
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2 font-bold text-sm">
                                    {activePreset.icon}
                                    <span className="font-heading uppercase tracking-wide">{activePreset.title}</span>
                                </div>
                                <span 
                                    className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase border shadow-xs"
                                    style={{
                                        backgroundColor: activePreset.borderColor,
                                        color: tinycolor(activePreset.borderColor).isLight() ? '#000' : '#FFF',
                                        borderColor: activePreset.textColor
                                    }}
                                >
                                    {activePreset.badgeText}
                                </span>
                            </div>

                            <h3 className="text-base sm:text-lg font-black tracking-tight font-heading mb-1.5">
                                {activePreset.sampleTitle}
                            </h3>
                            <p className="text-xs sm:text-sm opacity-90 leading-relaxed font-medium">
                                {activePreset.sampleBody}
                            </p>
                        </div>

                        {/* Botones de acción demostrativos dentro de la tarjeta */}
                        <div className="mt-5 pt-3 border-t flex flex-wrap items-center gap-2.5 opacity-95" style={{ borderColor: activePreset.borderColor }}>
                            <button 
                                className="px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition-transform active:scale-95"
                                style={{
                                    backgroundColor: activePreset.borderColor,
                                    color: tinycolor(activePreset.borderColor).isLight() ? '#000' : '#FFF'
                                }}
                            >
                                Confirmar Acción
                            </button>
                            <span className="text-xs font-mono opacity-85">
                                Fondo: <strong>{activePreset.bgName}</strong> | Texto: <strong>{activePreset.textName}</strong> | Borde: <strong>{activePreset.borderName}</strong>
                            </span>
                        </div>
                    </div>

                    {/* Desglose Técnico & Auditoría WCAG */}
                    <div className="p-4 sm:p-5 rounded-2xl border flex flex-col justify-between text-xs space-y-4" style={{ backgroundColor: buttonBg, borderColor: cardBorder }}>
                        <div>
                            <div className="flex items-center justify-between mb-3 pb-2 border-b" style={{ borderColor: cardBorder }}>
                                <span className="font-extrabold font-heading uppercase text-zinc-500 dark:text-zinc-400">
                                    Auditoría de Contraste
                                </span>
                                <span className={`px-2 py-0.5 rounded-md text-[11px] font-black uppercase ${passesAA ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30'}`}>
                                    {contrastRatio}:1 ({passesAAA ? 'AAA Excepcional' : passesAA ? 'AA Aceptable' : 'Falla WCAG'})
                                </span>
                            </div>

                            {/* Detalle de los 3 colores seleccionados */}
                            <div className="space-y-2 font-mono">
                                <div className="flex items-center justify-between p-2 rounded-xl border" style={{ backgroundColor: bgColor, borderColor: cardBorder }}>
                                    <span className="flex items-center gap-2" style={{ color: textMuted }}>
                                        <span className="h-3.5 w-3.5 rounded-full border shadow-xs" style={{ backgroundColor: activePreset.bgColor, borderColor: cardBorder }}></span>
                                        Fondo ({activePreset.bgName})
                                    </span>
                                    <span className="font-extrabold uppercase" style={{ color: textColor }}>{activePreset.bgColor}</span>
                                </div>

                                <div className="flex items-center justify-between p-2 rounded-xl border" style={{ backgroundColor: bgColor, borderColor: cardBorder }}>
                                    <span className="flex items-center gap-2" style={{ color: textMuted }}>
                                        <span className="h-3.5 w-3.5 rounded-full border shadow-xs" style={{ backgroundColor: activePreset.textColor, borderColor: cardBorder }}></span>
                                        Texto ({activePreset.textName})
                                    </span>
                                    <span className="font-extrabold uppercase" style={{ color: textColor }}>{activePreset.textColor}</span>
                                </div>

                                <div className="flex items-center justify-between p-2 rounded-xl border" style={{ backgroundColor: bgColor, borderColor: cardBorder }}>
                                    <span className="flex items-center gap-2" style={{ color: textMuted }}>
                                        <span className="h-3.5 w-3.5 rounded-full border shadow-xs" style={{ backgroundColor: activePreset.borderColor, borderColor: cardBorder }}></span>
                                        Borde ({activePreset.borderName})
                                    </span>
                                    <span className="font-extrabold uppercase" style={{ color: textColor }}>{activePreset.borderColor}</span>
                                </div>
                            </div>
                        </div>

                        <p className="text-[11px] leading-tight" style={{ color: textMuted }}>
                            💡 Haz clic en cualquier muestra de color en las filas inferiores para copiar el HEX o inspeccionar su código semántico.
                        </p>
                    </div>
                </div>
            </div>

            {/* --- MATRIZ DE COLUMNAS ALINEADAS PARA LAS PALETAS SEMÁNTICAS --- */}
            <div className="pt-4 border-t" style={{ borderColor: cardBorder }}>
                {/* Encabezados de Columna Alineados */}
                <div className="hidden md:grid grid-cols-10 gap-1.5 mb-2 text-center text-[11px] font-extrabold uppercase tracking-wider font-heading" style={{ color: textMuted }}>
                    {columnHeaders.map((header, idx) => (
                        <div key={idx} className="py-1 px-0.5 bg-zinc-100/50 dark:bg-zinc-800/40 rounded-lg border border-zinc-200/50 dark:border-zinc-800/50">
                            {header}
                        </div>
                    ))}
                </div>

                {/* FILA 1: FONDOS (10 Columnas Perfectamente Alineadas) */}
                <SemanticAlignedRow 
                    title="Fondos" 
                    items={alignedFondos} 
                    onColorCopy={onCopy} 
                    textColor={textColor}
                    textMuted={textMuted}
                    cardBorder={cardBorder}
                />

                {/* FILA 2: TEXTOS (10 Columnas Perfectamente Alineadas) */}
                <SemanticAlignedRow 
                    title="Textos" 
                    items={alignedTextos} 
                    onColorCopy={onCopy} 
                    textColor={textColor}
                    textMuted={textMuted}
                    cardBorder={cardBorder}
                />

                {/* FILA 3: BORDES (Alineados con sus respectivas columnas semánticas) */}
                <SemanticAlignedRow 
                    title="Bordes" 
                    items={alignedBordes} 
                    onColorCopy={onCopy} 
                    textColor={textColor}
                    textMuted={textMuted}
                    cardBorder={cardBorder}
                />

                {/* FILA 4: ACCIONES */}
                <SemanticPaletteFlexRow 
                    title="Acciones" 
                    items={actionColors} 
                    onColorCopy={onCopy} 
                    textColor={textColor}
                    textMuted={textMuted}
                    cardBorder={cardBorder}
                />

                {/* FILA 5: DECORATIVOS */}
                <SemanticPaletteFlexRow 
                    title="Decorativos" 
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
            <h3 className="text-xs font-black uppercase tracking-wider font-heading mb-2" style={{ color: textColor }}>
                {title}
            </h3>

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
            <h3 className="text-xs font-black uppercase tracking-wider font-heading mb-2" style={{ color: textColor }}>
                {title}
            </h3>

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