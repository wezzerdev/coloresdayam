import React, { memo, useRef, useEffect, useState } from 'react';
import { X, Check, Pipette, Palette } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import tinycolor from 'tinycolor2';
import { findClosestColorName } from '../../utils/colorUtils.js';

const sliderStyles = `
  .custom-slider {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 6px;
    border-radius: 3px;
    outline: none;
    opacity: 0.9;
    transition: opacity .2s;
  }
  .custom-slider:hover {
    opacity: 1;
  }
  .custom-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #ffffff;
    cursor: pointer;
    border: 2px solid #0BA5C7;
    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
    margin-top: -4px;
  }
  .custom-slider::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #ffffff;
    cursor: pointer;
    border: 2px solid #0BA5C7;
    box-shadow: 0 1px 3px rgba(0,0,0,0.3);
  }
`;

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

const ColorSlider = ({ label, value, min, max, onChange, gradientStyle }) => {
    const handleSliderChange = (e) => {
        onChange(parseFloat(e.target.value));
    };
    const handleInputChange = (e) => {
        let val = parseFloat(e.target.value);
        if (isNaN(val)) val = min;
        if (val < min) val = min;
        if (val > max) val = max;
        onChange(val);
    };

    return (
        <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 w-8 flex-shrink-0" title={label}>
                {label}
            </label>
            <div className="relative h-4 flex-1 flex items-center">
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={value}
                    onChange={handleSliderChange}
                    className="w-full h-1.5 rounded-lg appearance-none cursor-pointer custom-slider"
                    style={{ background: gradientStyle }}
                />
            </div>
            <input
                type="number"
                value={Math.round(value)}
                onChange={handleInputChange}
                min={min}
                max={max}
                className="w-14 text-center font-mono text-xs font-bold py-1 px-1 rounded-lg border bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#0BA5C7]"
            />
        </div>
    );
};

const ColorPickerSidebar = ({
  initialColor,
  onClose,
  onConfirm,
  onRealtimeChange,
}) => {
  const sidebarRef = useRef();
  
  const [localColor, setLocalColor] = useState(initialColor);
  const [inputMode, setInputMode] = useState('picker'); 
  const [isPicking, setIsPicking] = useState(false);

  const tabs = [
    { id: 'picker', label: 'Picker' },
    { id: 'hex', label: 'HEX' },
    { id: 'hsb', label: 'HSB' },
    { id: 'hsl', label: 'HSL' },
    { id: 'rgb', label: 'RGB' },
    { id: 'name', label: 'Nombre' },
  ];

  useEffect(() => {
    setLocalColor(initialColor);
  }, [initialColor]);

  const handlePickerChange = (newColor) => {
    setLocalColor(newColor);
    if (onRealtimeChange) {
      onRealtimeChange(newColor);
    }
  };

  const handleTextChange = (e) => {
    const newColorStr = e.target.value;
    setLocalColor(newColorStr);
    if (tinycolor(newColorStr).isValid() && onRealtimeChange) {
      onRealtimeChange(newColorStr);
    }
  };
  const handleTextBlur = (e) => {
    if (!tinycolor(e.target.value).isValid()) {
      setLocalColor(initialColor);
      if (onRealtimeChange) onRealtimeChange(initialColor);
    }
  };
  const handleTextKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (tinycolor(e.target.value).isValid()) {
        onConfirm(e.target.value);
      } else {
        setLocalColor(initialColor);
        if (onRealtimeChange) onRealtimeChange(initialColor);
      }
    }
  };
  
  const getFormattedColor = (mode) => {
    const c = tinycolor(localColor);
    if (!c.isValid()) return localColor;
    if (mode === 'hex') {
      return c.toHexString().substring(1).toUpperCase();
    }
    if (mode === 'name') {
      return findClosestColorName(localColor);
    }
    if (mode === 'rgb') return c.toRgbString();
    if (mode === 'hsl') return c.toHslString();
    if (mode === 'hsv') return c.toHsvString();
    
    return c.toHexString().substring(1).toUpperCase();
  };

  const colorTiny = tinycolor(localColor);
  const rgb = colorTiny.toRgb();
  const hsl = colorTiny.toHsl();
  const hsv = colorTiny.toHsv();

  const handleSliderChange = (mode, channel, value) => {
    let newColor;
    if (mode === 'rgb') {
      const newRgb = { ...rgb, [channel]: value };
      newColor = tinycolor(newRgb);
    } else if (mode === 'hsl') {
      const newHsl = { ...hsl, [channel]: value / (channel === 'h' ? 1 : 100) };
      newColor = tinycolor(newHsl);
    } else if (mode === 'hsv') {
      const newHsv = { ...hsv, [channel]: value / (channel === 'h' ? 1 : 100) };
      newColor = tinycolor(newHsv);
    }
    
    if (newColor && newColor.isValid()) {
      const newHex = newColor.toHexString();
      handlePickerChange(newHex);
    }
  };
  
  const gradients = {
    hue: 'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)',
    saturationHsl: `linear-gradient(to right, ${tinycolor({h: hsl.h, s: 0, l: 0.5}).toHexString()}, ${tinycolor({h: hsl.h, s: 1, l: 0.5}).toHexString()})`,
    luminance: `linear-gradient(to right, #000, ${tinycolor({h: hsl.h, s: hsl.s, l: 0.5}).toHexString()}, #fff)`,
    saturationHsv: `linear-gradient(to right, ${tinycolor({h: hsv.h, s: 0, v: hsv.v}).toHexString()}, ${tinycolor({h: hsv.h, s: 1, v: hsv.v}).toHexString()})`,
    brightness: `linear-gradient(to right, #000, ${tinycolor({h: hsv.h, s: hsv.s, v: 1}).toHexString()})`,
    red: `linear-gradient(to right, ${tinycolor({...rgb, r: 0}).toHexString()}, ${tinycolor({...rgb, r: 255}).toHexString()})`,
    green: `linear-gradient(to right, ${tinycolor({...rgb, g: 0}).toHexString()}, ${tinycolor({...rgb, g: 255}).toHexString()})`,
    blue: `linear-gradient(to right, ${tinycolor({...rgb, b: 0}).toHexString()}, ${tinycolor({...rgb, b: 255}).toHexString()})`,
  };

  const openEyedropper = async () => {
    if (!('EyeDropper' in window)) {
      alert('Tu navegador no soporta la API EyeDropper.');
      return;
    }
    try {
      const eyeDropper = new window.EyeDropper();
      setIsPicking(true);
      if (sidebarRef.current) sidebarRef.current.style.visibility = 'hidden';
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const { sRGBHex } = await eyeDropper.open();
      
      if (sidebarRef.current) sidebarRef.current.style.visibility = 'visible';
      setIsPicking(false);
      handlePickerChange(sRGBHex);
    } catch (e) {
      if (sidebarRef.current) sidebarRef.current.style.visibility = 'visible';
      setIsPicking(false);
    }
  };

  const handleCancel = () => {
    onRealtimeChange(initialColor);
    onClose();
  };
  
  const handleConfirm = () => {
    onConfirm(localColor);
  };
  
  useOnClickOutside(sidebarRef, handleCancel);

  return (
    <>
      <style>{sliderStyles}</style>
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden"
        onClick={handleCancel}
        style={{ visibility: isPicking ? 'hidden' : 'visible' }}
      />
      
      <aside
        ref={sidebarRef}
        className="fixed bottom-0 left-0 right-0 z-50 w-full max-h-[85vh] rounded-t-3xl md:rounded-t-none shadow-2xl transition-all
                   md:sticky md:top-[53px] md:h-[calc(100vh-53px)] md:max-h-[calc(100vh-53px)] md:w-72 lg:w-80 md:flex-shrink-0 md:z-10 border-t md:border-t-0 md:border-l
                   bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
        style={{
          visibility: isPicking ? 'hidden' : 'visible'
        }}
      >
        <div 
          className="h-full px-5 py-4 flex flex-col justify-between overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-4 md:hidden flex-shrink-0" />
          
          <div className="flex justify-between items-center mb-3 flex-shrink-0">
            <h2 className="text-base font-extrabold font-heading flex items-center gap-2 text-zinc-900 dark:text-white uppercase tracking-tight">
              <Palette size={18} className="text-[#0BA5C7]" />
              Editar Color
            </h2>
            <button 
              onClick={handleCancel} 
              className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-shrink-0 border-b border-zinc-200 dark:border-zinc-800 mb-3 overflow-x-auto">
            <nav className="flex gap-1" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setInputMode(tab.id)}
                  className={`
                    ${
                      inputMode === tab.id
                        ? 'border-[#0BA5C7] text-[#0BA5C7] font-extrabold'
                        : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white font-semibold'
                    }
                    whitespace-nowrap py-2 px-2.5 border-b-2 text-xs transition-colors
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex-grow space-y-3 overflow-y-auto pr-1">
            {inputMode === 'picker' && (
              <div className="space-y-3">
                <div className="w-full relative rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700/60 shadow-sm" style={{ height: '150px' }}>
                  <HexColorPicker 
                    color={localColor} 
                    onChange={handlePickerChange} 
                    className="!absolute !h-full !w-full"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-8 h-8 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm flex-shrink-0" 
                    style={{ backgroundColor: localColor }}
                  />
                  <button
                    onClick={openEyedropper}
                    className="p-2 rounded-xl border bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
                    title="Seleccionar color (Eyedropper)"
                  >
                    <Pipette size={16} />
                  </button>
                  <input 
                    type="text"
                    value={getFormattedColor('hex')}
                    onChange={handleTextChange}
                    onBlur={handleTextBlur}
                    onKeyDown={handleTextKeyDown}
                    className="flex-1 w-full font-mono text-sm font-bold px-3 py-1.5 rounded-xl border bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0BA5C7]"
                  />
                </div>
              </div>
            )}
            
            {inputMode === 'hex' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">HEX (sin #)</label>
                <input 
                    type="text"
                    value={getFormattedColor('hex')}
                    onChange={handleTextChange}
                    onBlur={handleTextBlur}
                    onKeyDown={handleTextKeyDown}
                    className="w-full font-mono text-lg font-bold p-2.5 rounded-xl border bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0BA5C7]"
                />
              </div>
            )}
            
            {inputMode === 'name' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">Nombre aproximado</label>
                <input 
                    type="text"
                    value={getFormattedColor('name')}
                    readOnly
                    className="w-full text-base font-semibold p-2.5 rounded-xl border bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 cursor-default"
                />
              </div>
            )}

            {inputMode === 'rgb' && (
              <div className="space-y-2">
                <ColorSlider label="R" min={0} max={255} value={rgb.r} onChange={(v) => handleSliderChange('rgb', 'r', v)} gradientStyle={gradients.red} />
                <ColorSlider label="G" min={0} max={255} value={rgb.g} onChange={(v) => handleSliderChange('rgb', 'g', v)} gradientStyle={gradients.green} />
                <ColorSlider label="B" min={0} max={255} value={rgb.b} onChange={(v) => handleSliderChange('rgb', 'b', v)} gradientStyle={gradients.blue} />
              </div>
            )}
            {inputMode === 'hsl' && (
              <div className="space-y-2">
                <ColorSlider label="H" min={0} max={360} value={Math.round(hsl.h)} onChange={(v) => handleSliderChange('hsl', 'h', v)} gradientStyle={gradients.hue} />
                <ColorSlider label="S" min={0} max={100} value={Math.round(hsl.s * 100)} onChange={(v) => handleSliderChange('hsl', 's', v)} gradientStyle={gradients.saturationHsl} />
                <ColorSlider label="L" min={0} max={100} value={Math.round(hsl.l * 100)} onChange={(v) => handleSliderChange('hsl', 'l', v)} gradientStyle={gradients.luminance} />
              </div>
            )}
            {inputMode === 'hsv' && (
              <div className="space-y-2">
                <ColorSlider label="H" min={0} max={360} value={Math.round(hsv.h)} onChange={(v) => handleSliderChange('hsv', 'h', v)} gradientStyle={gradients.hue} />
                <ColorSlider label="S" min={0} max={100} value={Math.round(hsv.s * 100)} onChange={(v) => handleSliderChange('hsv', 's', v)} gradientStyle={gradients.saturationHsv} />
                <ColorSlider label="V" min={0} max={100} value={Math.round(hsv.v * 100)} onChange={(v) => handleSliderChange('hsv', 'v', v)} gradientStyle={gradients.brightness} />
              </div>
            )}
          </div>
          
          <div className="flex gap-2.5 pt-4 border-t border-zinc-200 dark:border-zinc-800 mt-4 flex-shrink-0">
            <button
              onClick={handleCancel}
              className="flex-1 font-extrabold py-2.5 px-4 rounded-xl text-xs text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700/60 transition-all active:scale-95"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 font-extrabold py-2.5 px-4 rounded-xl text-xs text-white bg-[#0BA5C7] hover:bg-[#0993B3] shadow-md shadow-[#0BA5C7]/20 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              <Check size={16} strokeWidth={2.5} />
              Aplicar
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default memo(ColorPickerSidebar);