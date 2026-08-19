import React, { useState, useRef, useEffect } from 'react';
import { 
    X, FileCode, Settings, Clipboard, Check, ArrowLeft,
    Zap, Paintbrush, FileText, Wind, FileJson2,
    Link, Share2, FileDown, Image, Code, Star, Heart, Download, Clock, FolderOpen
} from 'lucide-react';
import tinycolor from 'tinycolor2';
import { 
    generatePowerFxCode, 
    generateCssCode, 
    generateTailwindCode,
    generateJsonCode,
    generateScssCode 
} from '../../utils/codeGenUtils.js';
import { findClosestColorName } from '../../utils/colorUtils.js';
import Switch from '../ui/Switch.jsx';

function useOnClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      if (window.innerWidth >= 768) return;
      if (!ref.current || ref.current.contains(event.target)) return;
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

const ExportModal = ({
    onClose,
    themeData,
    fxSeparator,
    setFxSeparator,
    useFxQuotes,
    setUseFxQuotes,
    onCopy,
    user,
    onOpenSaveModal,
    onOpenMyPalettes,
    handleSharePalette
}) => {
    const sidebarRef = useRef();
    useOnClickOutside(sidebarRef, onClose);

    const [activeTab, setActiveTab] = useState('quick'); // 'quick', 'code', 'save'
    const [selectedFormat, setSelectedFormat] = useState('css'); // 'css', 'scss', 'tailwind', 'powerfx', 'json'
    const [copySuccess, setCopySuccess] = useState(false);
    const [urlCopySuccess, setUrlCopySuccess] = useState(false);

    const paletteColors = (themeData && themeData.explorerPalette) 
        ? themeData.explorerPalette 
        : (themeData && themeData.stylePalette && themeData.stylePalette.fullBackgroundColors)
        ? themeData.stylePalette.fullBackgroundColors.map(c => c.color)
        : ['#E012B1', '#EB280F', '#00C8EC', '#0EF0B7', '#63FF1C'];

    const cleanColorsStr = paletteColors.map(c => c.replace('#', '')).join('-');
    const shareable24hUrl = `${window.location.origin}${window.location.pathname}?colors=${cleanColorsStr}&t=${Date.now()}`;

    const getCode = () => {
        if (!themeData) return "// No hay datos de tema para exportar";
        
        switch(selectedFormat) {
            case 'powerfx': return generatePowerFxCode(themeData, fxSeparator, useFxQuotes);
            case 'css': return generateCssCode(themeData);
            case 'scss': return generateScssCode(themeData);
            case 'tailwind': return generateTailwindCode(themeData);
            case 'json': return generateJsonCode(themeData);
            default: return generateCssCode(themeData);
        }
    };
    
    const codeToDisplay = getCode();

    const handleCopyCode = () => {
        try {
            const textArea = document.createElement("textarea");
            textArea.value = codeToDisplay;
            textArea.style.position = "fixed"; 
            textArea.style.top = "-9999px";
            textArea.style.left = "-9999px";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            onCopy('¡Código copiado al portapapeles!');
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            console.error('Error al copiar:', err);
            onCopy('Error al copiar', 'error');
        }
    };

    const handleCopy24hUrl = () => {
        try {
            navigator.clipboard.writeText(shareable24hUrl).then(() => {
                onCopy('¡Enlace de 24h copiado al portapapeles!');
                setUrlCopySuccess(true);
                setTimeout(() => setUrlCopySuccess(false), 2000);
            }).catch(() => {
                onCopy(`Enlace 24h: ${shareable24hUrl}`);
            });
        } catch (e) {
            onCopy(`Enlace 24h: ${shareable24hUrl}`);
        }
    };

    const downloadSvgExport = () => {
        const width = 1000;
        const height = 500;
        const barWidth = width / paletteColors.length;
        
        let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">`;
        paletteColors.forEach((hex, i) => {
            const x = i * barWidth;
            const colorName = findClosestColorName(hex);
            const isLight = tinycolor(hex).isLight();
            const textColor = isLight ? '#000000' : '#FFFFFF';
            svgContent += `<rect x="${x}" y="0" width="${barWidth}" height="${height}" fill="${hex}" />`;
            svgContent += `<text x="${x + barWidth / 2}" y="${height / 2 - 10}" fill="${textColor}" font-family="sans-serif" font-size="28" font-weight="bold" text-anchor="middle">${hex.replace('#','').toUpperCase()}</text>`;
            svgContent += `<text x="${x + barWidth / 2}" y="${height / 2 + 25}" fill="${textColor}" opacity="0.8" font-family="sans-serif" font-size="16" text-anchor="middle">${colorName}</text>`;
        });
        svgContent += `</svg>`;

        const blob = new Blob([svgContent], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `paleta-coloresdayam.svg`;
        a.click();
        URL.revokeObjectURL(url);
        onCopy('¡Vector SVG descargado!');
    };

    const downloadPngExport = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1200;
        canvas.height = 630;
        const ctx = canvas.getContext('2d');
        const barWidth = canvas.width / paletteColors.length;

        paletteColors.forEach((hex, i) => {
            const x = i * barWidth;
            const colorName = findClosestColorName(hex);
            const isLight = tinycolor(hex).isLight();
            const textColor = isLight ? '#000000' : '#FFFFFF';

            ctx.fillStyle = hex;
            ctx.fillRect(x, 0, barWidth, canvas.height);

            ctx.fillStyle = textColor;
            ctx.textAlign = 'center';
            ctx.font = 'bold 36px sans-serif';
            ctx.fillText(hex.replace('#', '').toUpperCase(), x + barWidth / 2, canvas.height / 2 - 10);

            ctx.font = '500 20px sans-serif';
            ctx.globalAlpha = 0.85;
            ctx.fillText(colorName, x + barWidth / 2, canvas.height / 2 + 30);
            ctx.globalAlpha = 1.0;
        });

        const url = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url;
        a.download = `paleta-coloresdayam.png`;
        a.click();
        onCopy('¡Imagen PNG descargada!');
    };

    const downloadPdfExport = () => {
        const win = window.open('', '_blank');
        if (!win) return;
        const barsHtml = paletteColors.map(hex => {
            const name = findClosestColorName(hex);
            const isLight = tinycolor(hex).isLight();
            const textColor = isLight ? '#000000' : '#ffffff';
            return `
                <div style="flex:1; background:${hex}; color:${textColor}; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:20px;">
                    <h1 style="font-family:sans-serif; font-size:32px; font-weight:bold; margin:0;">${hex.replace('#','').toUpperCase()}</h1>
                    <p style="font-family:sans-serif; font-size:18px; opacity:0.8; margin:8px 0 0 0;">${name}</p>
                </div>
            `;
        }).join('');

        win.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Paleta - Colores Dayam</title>
                <style>
                    body { margin: 0; padding: 0; height: 100vh; display: flex; flex-direction: column; }
                    .palette { flex: 1; display: flex; width: 100%; height: 100%; }
                    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
                </style>
            </head>
            <body>
                <div class="palette">${barsHtml}</div>
                <script>
                    window.onload = function() { window.print(); }
                </script>
            </body>
            </html>
        `);
        win.document.close();
        onCopy('¡Exportación PDF generada!');
    };

    const handleSaveClick = () => {
        if (!user) {
            onCopy('Inicia sesión para guardar paletas', 'error');
            return;
        }
        onClose();
        onOpenSaveModal();
    };
    
    const handleMyPalettesClick = () => {
        if (!user) {
            onCopy('Inicia sesión para ver tus paletas', 'error');
            return;
        }
        onClose();
        onOpenMyPalettes();
    };

    return (
        <>
            <div 
                className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden"
                onClick={onClose}
            />
            
            <aside
                ref={sidebarRef}
                className="fixed bottom-0 left-0 right-0 z-50 w-full max-h-[85vh] rounded-t-3xl md:rounded-t-none shadow-2xl transition-all
                           md:sticky md:top-[53px] md:h-[calc(100vh-53px)] md:max-h-[calc(100vh-53px)] md:w-72 lg:w-80 md:flex-shrink-0 md:z-10 border-t md:border-t-0 md:border-l
                           bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
            >
                <div 
                    className="h-full px-4 py-4 flex flex-col justify-between overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                >
                    <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-3 md:hidden flex-shrink-0" />
                    
                    <div className="flex justify-between items-center mb-3 flex-shrink-0">
                        <h2 className="text-base font-extrabold font-heading flex items-center gap-2 text-zinc-900 dark:text-white uppercase tracking-tight">
                            <Download size={18} className="text-[#0BA5C7]" />
                            Exportar Paleta
                        </h2>
                        <button onClick={onClose} className="p-1 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Segmented Control / Tabs */}
                    <div className="flex bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl mb-3 flex-shrink-0 border border-zinc-200 dark:border-zinc-700/60">
                        <button
                            onClick={() => setActiveTab('quick')}
                            className={`flex-1 py-1.5 text-xs font-extrabold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                                activeTab === 'quick' 
                                    ? 'bg-white dark:bg-zinc-900 text-[#0BA5C7] shadow-xs' 
                                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                            }`}
                        >
                            <Zap size={14} className="text-amber-500" />
                            <span>Rápido</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('code')}
                            className={`flex-1 py-1.5 text-xs font-extrabold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                                activeTab === 'code' 
                                    ? 'bg-white dark:bg-zinc-900 text-[#0BA5C7] shadow-xs' 
                                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                            }`}
                        >
                            <Code size={14} className="text-[#0BA5C7]" />
                            <span>Código</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('save')}
                            className={`flex-1 py-1.5 text-xs font-extrabold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                                activeTab === 'save' 
                                    ? 'bg-white dark:bg-zinc-900 text-[#0BA5C7] shadow-xs' 
                                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                            }`}
                        >
                            <FolderOpen size={14} className="text-emerald-500" />
                            <span>Guardar</span>
                        </button>
                    </div>

                    {/* TAB 1: RÁPIDO (ENLACE 24H & ARCHIVOS) */}
                    {activeTab === 'quick' && (
                        <div className="space-y-3 flex-grow overflow-y-auto pr-0.5">
                            {/* CÁPSULA DE ENLACE DE 24 HORAS */}
                            <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-extrabold text-zinc-900 dark:text-white flex items-center gap-1.5">
                                        <Link size={14} className="text-[#0BA5C7]" />
                                        Enlace Compartible (24h)
                                    </span>
                                    <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-500/20">
                                        <Clock size={10} /> 24 hrs
                                    </span>
                                </div>
                                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                    Enlace público que expira en 24h. Ideal para compartir rápido.
                                </p>
                                <div className="flex items-center gap-1.5">
                                    <input 
                                        type="text" 
                                        readOnly 
                                        value={shareable24hUrl} 
                                        className="flex-1 font-mono text-[10px] p-2 rounded-xl border bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 truncate focus:outline-none"
                                    />
                                    <button
                                        onClick={handleCopy24hUrl}
                                        className="p-2 rounded-xl text-xs font-bold bg-[#0BA5C7] text-white hover:bg-[#0993B3] transition-colors flex-shrink-0 flex items-center gap-1 shadow-xs"
                                    >
                                        {urlCopySuccess ? <Check size={14} /> : <Clipboard size={14} />}
                                    </button>
                                </div>
                            </div>

                            {/* OPCIONES DE ARCHIVOS */}
                            <div className="grid grid-cols-1 gap-2">
                                <button
                                    onClick={downloadPngExport}
                                    className="p-3 rounded-2xl border text-left bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex items-center justify-between group active:scale-98"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                                            <Image size={18} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-extrabold text-zinc-900 dark:text-white">Imagen PNG</p>
                                            <p className="text-[10px] text-zinc-500">Alta resolución 1200x630px</p>
                                        </div>
                                    </div>
                                    <Download size={14} className="text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white" />
                                </button>

                                <button
                                    onClick={downloadSvgExport}
                                    className="p-3 rounded-2xl border text-left bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex items-center justify-between group active:scale-98"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                                            <Code size={18} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-extrabold text-zinc-900 dark:text-white">Vector SVG</p>
                                            <p className="text-[10px] text-zinc-500">Ideal para Figma, Illustrator o web</p>
                                        </div>
                                    </div>
                                    <Download size={14} className="text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white" />
                                </button>

                                <button
                                    onClick={downloadPdfExport}
                                    className="p-3 rounded-2xl border text-left bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex items-center justify-between group active:scale-98"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
                                            <FileDown size={18} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-extrabold text-zinc-900 dark:text-white">Documento PDF</p>
                                            <p className="text-[10px] text-zinc-500">Listo para imprimir o enviar</p>
                                        </div>
                                    </div>
                                    <Download size={14} className="text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: CÓDIGO */}
                    {activeTab === 'code' && (
                        <div className="space-y-2 flex-grow overflow-y-auto pr-0.5 flex flex-col justify-between">
                            <div className="flex gap-1 overflow-x-auto pb-1 flex-shrink-0">
                                {['css', 'scss', 'tailwind', 'powerfx', 'json'].map(fmt => (
                                    <button
                                        key={fmt}
                                        onClick={() => setSelectedFormat(fmt)}
                                        className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold uppercase transition-all whitespace-nowrap ${
                                            selectedFormat === fmt 
                                                ? 'bg-[#0BA5C7] text-white shadow-xs' 
                                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                                        }`}
                                    >
                                        {fmt === 'powerfx' ? 'Power Fx' : fmt}
                                    </button>
                                ))}
                            </div>

                            {selectedFormat === 'powerfx' && (
                                <div className="p-2.5 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl flex-shrink-0 text-xs">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-[11px] text-zinc-700 dark:text-zinc-300">Separador:</span>
                                        <select value={fxSeparator} onChange={(e) => setFxSeparator(e.target.value)} className="font-semibold text-xs px-2 py-0.5 rounded-lg border bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100">
                                            <option value=";">;</option>
                                            <option value=",">,</option>
                                            <option value=";;">;;</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            <div className="relative flex-grow">
                                <pre className="font-mono text-[11px] whitespace-pre-wrap break-all p-3 rounded-2xl h-56 overflow-auto bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200">
                                    <code>{codeToDisplay}</code>
                                </pre>
                            </div>

                            <button
                                onClick={handleCopyCode}
                                className={`w-full font-extrabold py-2 px-4 rounded-xl transition-all text-white shadow-md active:scale-95 text-xs flex items-center justify-center gap-1.5 flex-shrink-0 mt-2 ${
                                    copySuccess 
                                        ? 'bg-emerald-600' 
                                        : 'bg-[#0BA5C7] hover:bg-[#0993B3] shadow-[#0BA5C7]/20'
                                }`}
                            >
                                {copySuccess ? <><Check size={14} /> Copiado</> : <><Clipboard size={14} /> Copiar Código {selectedFormat.toUpperCase()}</>}
                            </button>
                        </div>
                    )}

                    {/* TAB 3: GUARDAR & MIS PALETAS */}
                    {activeTab === 'save' && (
                        <div className="space-y-3 flex-grow overflow-y-auto pr-0.5">
                            <button
                                onClick={handleSaveClick}
                                className="p-3.5 rounded-2xl border text-left bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex items-center justify-between group active:scale-98 w-full"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
                                        <Star size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-extrabold text-zinc-900 dark:text-white">Guardar Paleta</p>
                                        <p className="text-[10px] text-zinc-500">Almacenar en tu cuenta con etiquetas y proyectos</p>
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={handleMyPalettesClick}
                                className="p-3.5 rounded-2xl border text-left bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex items-center justify-between group active:scale-98 w-full"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500">
                                        <Heart size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-extrabold text-zinc-900 dark:text-white">Mis Paletas Guardadas</p>
                                        <p className="text-[10px] text-zinc-500">Ver y gestionar tus colecciones anteriores</p>
                                    </div>
                                </div>
                            </button>
                        </div>
                    )}

                    <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 mt-3 flex-shrink-0">
                        <button
                            onClick={onClose}
                            className="w-full font-extrabold py-2 px-4 rounded-xl text-xs text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700/60 transition-all active:scale-95"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default ExportModal;