import React, { memo, useRef, useEffect } from 'react';
import { X, Check, Eye } from 'lucide-react';

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

const simulationOptions = [
    { value: "none", label: "Normal" },
    { value: "protanopia", label: "Protanopia" },
    { value: "deuteranopia", label: "Deuteranopia" },
    { value: "tritanopia", label: "Tritanopia" },
    { value: "achromatopsia", label: "Acromatopsia" },
    { value: "protanomaly", label: "Protanomalía" },
    { value: "deuteranomaly", label: "Deuteranomalía" },
    { value: "tritanomaly", label: "Tritanomalía" },
    { value: "achromatomaly", label: "Acromatomalía" }
];

const SimulationOption = ({ label, value, isActive, onClick }) => (
    <button
        onClick={() => onClick(value)}
        className={`w-full text-left flex justify-between items-center px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all
            ${isActive 
                ? 'bg-[#0BA5C7] text-white shadow-sm shadow-[#0BA5C7]/20 font-bold' 
                : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
    >
        <span>{label}</span>
        {isActive && <Check size={16} strokeWidth={2.5} />}
    </button>
);

const ColorBlindnessSidebar = ({
  simulationMode,
  setSimulationMode,
  onCancel,
  onApply,
}) => {
  const sidebarRef = useRef();
  useOnClickOutside(sidebarRef, onCancel);

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden"
        onClick={onCancel}
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
              <Eye size={18} className="text-[#0BA5C7]" />
              Daltonismo
            </h2>
            <button 
              onClick={onCancel} 
              className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3 flex-shrink-0 font-medium">
            Selecciona un tipo de simulación para previsualizar cómo se vería tu paleta.
          </p>
          
          <div className="space-y-1.5 flex-grow overflow-y-auto pr-1">
            {simulationOptions.map(opt => (
                <SimulationOption 
                    key={opt.value}
                    label={opt.label}
                    value={opt.value}
                    isActive={simulationMode === opt.value}
                    onClick={setSimulationMode}
                />
            ))}
          </div>

          <div className="flex gap-2.5 pt-4 border-t border-zinc-200 dark:border-zinc-800 mt-4 flex-shrink-0">
            <button
              onClick={onCancel}
              className="flex-1 font-extrabold py-2.5 px-4 rounded-xl text-xs text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700/60 transition-all active:scale-95"
            >
              Cancelar
            </button>
            <button
              onClick={onApply}
              disabled={simulationMode === 'none'}
              className="flex-1 font-extrabold py-2.5 px-4 rounded-xl text-xs text-white bg-[#0BA5C7] hover:bg-[#0993B3] shadow-md shadow-[#0BA5C7]/20 flex items-center justify-center gap-1.5 disabled:opacity-50 active:scale-95 transition-all"
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

export default memo(ColorBlindnessSidebar);