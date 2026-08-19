import React, { memo, useRef, useCallback, useState, useEffect } from 'react';
import { X, Check, SlidersHorizontal } from 'lucide-react';
import tinycolor from 'tinycolor2';

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
    box-shadow: 0 1px 4px rgba(0,0,0,0.3);
    margin-top: -4px;
  }
  .custom-slider::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #ffffff;
    cursor: pointer;
    border: 2px solid #0BA5C7;
    box-shadow: 0 1px 4px rgba(0,0,0,0.3);
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

const CustomSlider = ({ min, max, value, onChange, gradient }) => {
  const trackRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const getValueFromX = useCallback((clientX) => {
    const track = trackRef.current;
    if (!track) return value;
    
    const rect = track.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.round(min + percent * (max - min));
  }, [min, max, value]); 

  const handleMove = useCallback((clientX) => {
    const newValue = getValueFromX(clientX);
    onChange(newValue);
  }, [getValueFromX, onChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);
  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  }, [isDragging, handleMove]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);
  const handleTouchMove = useCallback((e) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  }, [isDragging, handleMove]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
    }
    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, handleTouchMove, handleTouchEnd]);

  const handleTrackMouseDown = (e) => {
    handleMove(e.clientX);
    setIsDragging(true);
  };
  const handleTrackTouchStart = (e) => {
    handleMove(e.touches[0].clientX);
    setIsDragging(true);
  };
  const handleThumbMouseDown = () => setIsDragging(true);
  const handleThumbTouchStart = () => setIsDragging(true);

  const percent = ((value - min) / (max - min)) * 100;

  return (
    <div 
      className="relative w-full h-5 flex items-center"
      onMouseDown={(e) => { e.stopPropagation(); }}
      onTouchStart={(e) => { e.stopPropagation(); }}
      onClick={(e) => { e.stopPropagation(); }}
    >
      <div
        ref={trackRef}
        className="relative w-full h-1.5 rounded-full cursor-pointer"
        style={{ background: gradient }} 
        onMouseDown={handleTrackMouseDown}
        onTouchStart={handleTrackTouchStart}
      >
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-md border-2 border-[#0BA5C7]"
          style={{ 
            left: `${percent}%`, 
            transform: `translate(-50%, -50%)`,
            touchAction: 'none'
          }}
          onMouseDown={handleThumbMouseDown}
          onTouchStart={handleThumbTouchStart}
        ></div>
      </div>
    </div>
  );
};

const SliderControl = ({ label, value, min, max, onChange, gradient, onInputChange }) => (
    <div 
      className="space-y-1.5" 
      onMouseDown={(e) => { e.stopPropagation(); }}
      onTouchStart={(e) => { e.stopPropagation(); }}
    >
        <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{label}</label>
            <input
                type="number"
                value={value}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '') {
                    onInputChange(0); 
                  } else {
                    onInputChange(parseInt(val, 10));
                  }
                }}
                onMouseDown={(e) => { e.stopPropagation(); }}
                onTouchStart={(e) => { e.stopPropagation(); }}
                className="w-14 px-1.5 py-0.5 rounded-lg border text-xs text-center font-mono font-bold bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#0BA5C7]"
            />
        </div>
        <div>
            <CustomSlider
              min={Number(min)}
              max={Number(max)}
              value={Number(value)}
              onChange={onChange}
              gradient={gradient}
            />
        </div>
    </div>
);

const PaletteAdjusterSidebar = ({
  paletteAdjustments,
  setPaletteAdjustments,
  commitPaletteAdjustments,
  cancelPaletteAdjustments,
  setIsAdjusterSidebarVisible,
  originalExplorerPalette,
  explorerPalette,
  lockedColors,
}) => {
  const sidebarRef = useRef();
  useOnClickOutside(sidebarRef, cancelPaletteAdjustments);

  const baseForGradient = (originalExplorerPalette || []).find(c => !(lockedColors || []).includes(c)) || (originalExplorerPalette || [])[0] || '#808080';
  const originalIndex = (originalExplorerPalette || []).indexOf(baseForGradient);
  const adjustedBase = (explorerPalette || [])[originalIndex] || baseForGradient;
  const previewColor = (lockedColors || []).includes(baseForGradient) ? baseForGradient : adjustedBase;

  const gradients = {
    hue: 'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)',
    saturation: `linear-gradient(to right, ${tinycolor(baseForGradient).desaturate(100).toHexString()}, ${tinycolor(baseForGradient).saturate(100).toHexString()})`,
    brightness: `linear-gradient(to right, #000, ${baseForGradient}, #fff)`,
    temperature: 'linear-gradient(to right, #66b3ff, #fff, #ffc966)'
  };

  const closeHandler = () => {
    cancelPaletteAdjustments();
    setIsAdjusterSidebarVisible(false);
  };

  const handleApply = () => {
    commitPaletteAdjustments();
    setIsAdjusterSidebarVisible(false);
  };

  const handleAdjustmentChange = (key, newValue) => {
    let clampedValue = newValue;
    if (key === 'hue') clampedValue = Math.max(-180, Math.min(180, newValue));
    else clampedValue = Math.max(-100, Math.min(100, newValue));

    if (isNaN(clampedValue)) clampedValue = 0;

    setPaletteAdjustments((prev) => ({
      ...prev,
      [key]: clampedValue,
    }));
  };

  return (
    <>
      <style>{sliderStyles}</style>
      
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden"
        onClick={closeHandler}
      />
      
      <aside
        ref={sidebarRef}
        className="fixed bottom-0 left-0 right-0 z-50 w-full max-h-[85vh] rounded-t-3xl md:rounded-t-none shadow-2xl transition-all
                   md:sticky md:top-[53px] md:h-[calc(100vh-53px)] md:max-h-[calc(100vh-53px)] md:w-72 lg:w-80 md:flex-shrink-0 md:z-10 border-t md:border-t-0 md:border-l
                   bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
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
              <SlidersHorizontal size={18} className="text-[#0BA5C7]" />
              Ajustar Paleta
            </h2>
            <button 
              onClick={closeHandler} 
              className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div 
            className="flex items-center justify-center h-16 rounded-2xl mb-4 border border-zinc-200 dark:border-zinc-700/60 shadow-inner flex-shrink-0"
            style={{ backgroundColor: previewColor }}
          >
            <span 
              className="font-mono font-bold text-xs px-2.5 py-1 rounded-lg bg-black/30 text-white backdrop-blur-sm shadow-sm"
              style={{ 
                color: tinycolor(previewColor).isLight() ? '#000' : '#FFF',
              }}
            >
              {tinycolor(previewColor).toHexString().substring(1).toUpperCase()}
            </span>
          </div>

          <div className="space-y-3.5 flex-grow overflow-y-auto pr-1">
            <SliderControl
              label="Matiz"
              value={paletteAdjustments.hue}
              min={-180}
              max={180}
              onChange={(v) => handleAdjustmentChange('hue', v)}
              onInputChange={(v) => handleAdjustmentChange('hue', v)}
              gradient={gradients.hue}
            />
            <SliderControl
              label="Saturación"
              value={paletteAdjustments.saturation}
              min={-100}
              max={100}
              onChange={(v) => handleAdjustmentChange('saturation', v)}
              onInputChange={(v) => handleAdjustmentChange('saturation', v)}
              gradient={gradients.saturation}
            />
            <SliderControl
              label="Brillo"
              value={paletteAdjustments.brightness}
              min={-100}
              max={100}
              onChange={(v) => handleAdjustmentChange('brightness', v)}
              onInputChange={(v) => handleAdjustmentChange('brightness', v)}
              gradient={gradients.brightness}
            />
            <SliderControl
              label="Temperatura"
              value={paletteAdjustments.temperature}
              min={-100}
              max={100}
              onChange={(v) => handleAdjustmentChange('temperature', v)}
              onInputChange={(v) => handleAdjustmentChange('temperature', v)}
              gradient={gradients.temperature}
            />
          </div>

          <div className="flex gap-2.5 pt-4 border-t border-zinc-200 dark:border-zinc-800 mt-4 flex-shrink-0">
            <button
              onClick={closeHandler}
              className="flex-1 font-extrabold py-2.5 px-4 rounded-xl text-xs text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700/60 transition-all active:scale-95"
            >
              Cancelar
            </button>
            <button
              onClick={handleApply}
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

export default memo(PaletteAdjusterSidebar);