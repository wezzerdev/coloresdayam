import React, { useState } from 'react';
import { 
    X, FileCode, Settings, Clipboard, Check, ArrowLeft,
    Zap, Paintbrush, FileText, Wind, FileJson2,
    Link, Share2, FileDown, Image, Code, Star, Heart
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

const ExportOptionCard = ({ icon, label, onClick, disabled = false }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className="p-4 w-full rounded-2xl border text-center transition-all duration-200 
                   flex flex-col items-center justify-center gap-2 aspect-square
                   bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-800
                   hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md hover:-translate-y-0.5
                   disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:bg-transparent"
    >
        {icon}
        <span className="font-bold text-xs text-zinc-800 dark:text-zinc-200">{label}</span>
    </button>
);

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
    const [view, setView] = useState('selection');
    const [selectedFormat, setSelectedFormat] = useState(null);
    const [copySuccess, setCopySuccess] = useState(false);

    const paletteColors = (themeData && themeData.explorerPalette) 
        ? themeData.explorerPalette 
        : (themeData && themeData.stylePalette && themeData.stylePalette.fullBackgroundColors)
        ? themeData.stylePalette.fullBackgroundColors.map(c => c.color)
        : ['#E012B1', '#EB280F', '#00C8EC', '#0EF0B7', '#63FF1C'];

    const getCode = () => {
        if (!themeData) return "// No hay datos de tema para exportar";
        
        switch(selectedFormat) {
            case 'powerfx': return generatePowerFxCode(themeData, fxSeparator, useFxQuotes);
            case 'css': return generateCssCode(themeData);
            case 'scss': return generateScssCode(themeData);
            case 'tailwind': return generateTailwindCode(themeData);
            case 'json': return generateJsonCode(themeData);
            default: return "// Selecciona un formato de exportación";
        }
    };
    
    const codeToDisplay = getCode();

    const handleCopy = () => {
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
    
    const handleSelectFormat = (format) => {
        setSelectedFormat(format);
        setView('code');
    };

    const handleBack = () => {
        setView('selection');
        setSelectedFormat(null);
        setCopySuccess(false);
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
        onCopy('¡Imagen SVG descargada!');
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
        onCopy('¡Exportación en PDF abierta para guardar!');
    };
    
    const formatLabels = {
        'powerfx': 'Power Fx',
        'css': 'CSS',
        'scss': 'SCSS',
        'tailwind': 'Tailwind',
        'json': 'JSON'
    };

    const handleSaveClick = () => {
        if (!user) {
            onCopy('Inicia sesión para guardar paletas', 'error');
            return;
        }
        onClose();
        onOpenSaveModal();
    };
    
    const handleShareClick = () => {
        if (handleSharePalette) {
            handleSharePalette();
        } else {
            navigator.clipboard.writeText(window.location.href);
            onCopy('¡Enlace de la paleta copiado!');
        }
        onClose();
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 max-w-2xl w-full relative flex flex-col max-h-[90vh] bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-5 flex-shrink-0">
                    <div className="flex items-center gap-2">
                        {view === 'code' && (
                            <button onClick={handleBack} className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                                <ArrowLeft size={20} strokeWidth={2} />
                            </button>
                        )}
                        <h2 className="text-lg font-extrabold font-heading flex items-center gap-2 text-zinc-900 dark:text-white uppercase tracking-tight">
                            <FileCode size={20} className="text-[#0BA5C7]" />
                            {view === 'selection' ? 'Exportar Paleta' : `Exportar ${formatLabels[selectedFormat]}`}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-1 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"><X size={20} /></button>
                </div>
                
                <div className="flex-grow overflow-y-auto pr-1">
                    {view === 'selection' && (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                            <ExportOptionCard
                                icon={<Link size={28} strokeWidth={2} className="text-[#0BA5C7]" />}
                                label="Enlace URL"
                                onClick={handleShareClick}
                            />
                            <ExportOptionCard
                                icon={<Share2 size={28} strokeWidth={2} className="text-emerald-500" />}
                                label="Compartir"
                                onClick={handleShareClick}
                            />
                            <ExportOptionCard
                                icon={<Image size={28} strokeWidth={2} className="text-purple-500" />}
                                label="Imagen PNG"
                                onClick={downloadPngExport}
                            />
                            <ExportOptionCard
                                icon={<Code size={28} strokeWidth={2} className="text-indigo-500" />}
                                label="Vector SVG"
                                onClick={downloadSvgExport}
                            />
                            <ExportOptionCard
                                icon={<FileDown size={28} strokeWidth={2} className="text-rose-500" />}
                                label="PDF"
                                onClick={downloadPdfExport}
                            />
                            <ExportOptionCard
                                icon={<Paintbrush size={28} strokeWidth={2} className="text-blue-500" />}
                                label="CSS"
                                onClick={() => handleSelectFormat('css')}
                            />
                            <ExportOptionCard
                                icon={<FileText size={28} strokeWidth={2} className="text-pink-500" />}
                                label="SCSS"
                                onClick={() => handleSelectFormat('scss')}
                            />
                            <ExportOptionCard
                                icon={<Wind size={28} strokeWidth={2} className="text-cyan-500" />}
                                label="Tailwind"
                                onClick={() => handleSelectFormat('tailwind')}
                            />
                            <ExportOptionCard
                                icon={<Zap size={28} strokeWidth={2} className="text-purple-500" />}
                                label="Power Fx"
                                onClick={() => handleSelectFormat('powerfx')}
                            />
                            <ExportOptionCard
                                icon={<FileJson2 size={28} strokeWidth={2} className="text-amber-500" />}
                                label="JSON"
                                onClick={() => handleSelectFormat('json')}
                            />
                            <ExportOptionCard
                                icon={<Heart size={28} strokeWidth={2} className="text-rose-500" />}
                                label="Mis Paletas"
                                onClick={handleMyPalettesClick}
                            />
                            <ExportOptionCard
                                icon={<Star size={28} strokeWidth={2} className="text-amber-400" />}
                                label="Guardar"
                                onClick={handleSaveClick}
                            />
                        </div>
                    )}
                    
                    {view === 'code' && (
                        <div>
                            {selectedFormat === 'powerfx' && (
                                <div className="p-3.5 border-b border-zinc-200 dark:border-zinc-800 mb-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl">
                                    <h4 className="text-xs font-bold mb-2.5 flex items-center gap-2 text-zinc-900 dark:text-white uppercase"><Settings size={14} /> Configuración de Salida</h4>
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-y-2 gap-x-6">
                                        <div className="flex items-center gap-2">
                                            <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400" htmlFor="fxSeparator">Separador:</label>
                                            <select id="fxSeparator" value={fxSeparator} onChange={(e) => setFxSeparator(e.target.value)} className="font-semibold text-xs px-2 py-1 rounded-lg border bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100">
                                                <option value=";">;</option>
                                                <option value=",">,</option>
                                                <option value=";;">;;</option>
                                            </select>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Usar comillas:</label>
                                            <Switch checked={useFxQuotes} onCheckedChange={setUseFxQuotes} />
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            <div className="relative mt-2">
                                <pre className="font-mono text-xs whitespace-pre-wrap break-all p-4 rounded-2xl h-64 md:h-80 overflow-auto bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200">
                                    <code>{codeToDisplay}</code>
                                </pre>
                            </div>
                        </div>
                    )}
                </div>

                {view === 'code' && (
                    <div className="mt-4 flex justify-end flex-shrink-0">
                        <button
                            onClick={handleCopy}
                            className={`flex items-center justify-center gap-2 w-full sm:w-auto font-extrabold py-2.5 px-6 rounded-xl transition-all text-white shadow-md active:scale-95 text-xs ${
                                copySuccess 
                                    ? 'bg-emerald-600' 
                                    : 'bg-[#0BA5C7] hover:bg-[#0993B3] shadow-[#0BA5C7]/20'
                            }`}
                        >
                            {copySuccess ? <><Check size={16} /> Copiado</> : <><Clipboard size={16} strokeWidth={2} /> Copiar Código</>}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExportModal;