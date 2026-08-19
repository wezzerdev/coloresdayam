import React, { useEffect, useState, memo, useCallback, useRef } from 'react';
import tinycolor from 'tinycolor2';
import useThemeGenerator from './hooks/useThemeGenerator.js';
import { availableFonts, generationMethods } from './utils/colorUtils.js';
import Explorer from './components/ui/Explorer.jsx';
import ColorPreviewer from './components/ColorPreviewer.jsx';
import SemanticPalettes from './components/SemanticPalettes.jsx';
import { 
    ExportModal, AccessibilityModal, ComponentPreviewModal, 
    HistoryModal, HelpModal, ConfirmDeleteModal,
    AIPaletteModal, ImagePaletteModal, VariationsModal, PaletteContrastChecker
} from './components/modals/index.jsx';
import ProfileModal from './components/modals/ProfileModal.jsx';

import { 
    Settings, Type, Upload, Download, RefreshCcw, HelpCircle, 
    User, LogOut, LogIn, Save, FolderOpen,
    Undo2, Redo2, Clock, Sun, Moon, FileCode, Sparkles,
    Wand2, Image as ImageIcon, 
    SlidersHorizontal, Eye, 
    MoreHorizontal, Palette, ShieldCheck, Accessibility, TestTube2,
    Columns3, Rows3, Home
} from 'lucide-react';

import ColorBlindnessSidebar from './components/ui/ColorBlindnessSidebar.jsx';
import SavePaletteSidebar from './components/ui/SavePaletteSidebar.jsx';
import MyPalettesSidebar from './components/ui/MyPalettesSidebar.jsx';
import ColorPickerSidebar from './components/ui/ColorPickerSidebar.jsx';
import PaletteAdjusterSidebar from './components/ui/PaletteAdjusterSidebar.jsx';

import ColorActionMenu from './components/ui/ColorActionMenu.jsx'; 
import { generatePoeticPaletteName } from './utils/userTasteEngine.js';


import AuthPage from './components/AuthPage.jsx';
import LandingPage from './components/LandingPage.jsx';
import GoogleAdBanner from './components/GoogleAdBanner.jsx';
import PrivacyPolicyPage from './components/PrivacyPolicyPage.jsx';
import TermsOfServicePage from './components/TermsOfServicePage.jsx';
import { supabase } from './apiClient.js';


const PopoverMenu = ({ children, onClose, align = 'right' }) => {
    const menuRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                onClose();
            }
        };
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [onClose]);

    return (
        <div
            ref={menuRef}
            role="menu"
            tabIndex={-1}
            className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} bottom-full mb-2 md:top-full md:mt-2 md:bottom-auto w-60 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 p-2 space-y-1 max-h-[60vh] overflow-y-auto backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 text-zinc-900 dark:text-zinc-100`}
            onClick={(e) => { e.stopPropagation(); }}
        >
            {children}
        </div>
    );
};

const MenuButton = ({ icon, label, onClick, className = "" }) => (
    <button
        type="button"
        role="menuitem"
        onClick={onClick}
        className={`flex items-center w-full px-3 py-2.5 text-xs sm:text-sm rounded-xl font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white transition-colors focus-ring ${className}`}
    >
        <span className="text-[#0BA5C7] dark:text-[#0BA5C7]">{icon}</span>
        <span className="ml-3 font-semibold">{label}</span>
    </button>
);


// --- Funciones simuladas para Capacitor (sin cambios) ---
const Capacitor = {
  isNativePlatform: () => false
};
const Share = {
  share: async () => {
    console.warn("La función de compartir nativa solo está disponible en dispositivos móviles.");
    return Promise.resolve();
  }
};
// --- Fin de funciones simuladas ---

// --- Lógica movida de Explorer (sin cambios) ---
const backgroundModeLabels = {
    'T950': 'Fondo T950',
    'T0': 'Fondo T0',
    'white': 'Fondo Blanco',
    'black': 'Fondo Negro',
    'default': 'Fondo Armonía',
    'card': 'Fondo Tarjeta'
};
// --- FIN LÓGICA MOVIDA ---

const MainApp = memo(({ hook, theme, isNative, user, onLogout, onNavigate }) => {
  const { 
    themeData, 

    font, 
    brandColor, 
    grayColor, 
    isGrayAuto, 
    explorerMethod, 
    updateBrandColor, 
    confirmBrandColor, 
    replaceColorInPalette, 
    confirmColorInPalette, 
    saveCurrentStateToHistory, 
    cancelBrandColorUpdate, 
    setGrayColor, setIsGrayAuto, setFont,
    handleImport, handleReset, showNotification, 
    handleRandomTheme, handleThemeToggle, 
    handleUndo, handleRedo, history, historyIndex, goToHistoryState,
    lightPreviewMode, setLightPreviewMode, 
    darkPreviewMode, setDarkPreviewMode,
    semanticPreviewMode, setSemanticPreviewMode,
    fxSeparator, setFxSeparator, useFxQuotes, setUseFxQuotes,
    simulationMode, cyclePreviewMode, 
    explorerPalette, 
    originalExplorerPalette, 
    reorderExplorerPalette, 
    explorerGrayShades, 
    handleExplorerColorPick, 
    paletteAdjustments,
    setPaletteAdjustments,
    commitPaletteAdjustments,
    cancelPaletteAdjustments,
    insertColorInPalette, 
    removeColorFromPalette, 
    insertMultipleColors, 
    setExplorerMethod, 
    setSimulationMode, 
    generatePaletteWithAI, 
    applySimulationToPalette, 
    lockedColors,
    toggleLockColor,
    savedPalettes,
    currentPaletteId,
    isLoadingPalettes,
    isSavingPalette,
    deletingPaletteId,
    handleSavePalette,
    handleLoadPalette,
    handleDeletePalette,
    handleSharePalette,
    handleDuplicatePalette,
    handleUpdatePaletteName,
    handleLoadSpecificPalette,
    projects,
    collections,
    filters,
    setFilters,
    handleCreateProject,
    handleUpdateProjectName,
    handleDeleteProject,
    handleCreateCollection,
    handleUpdateCollectionName,
    handleDeleteCollection,
    tags, 
    handleCreateTag 
  } = hook;

  // --- (Estado de Modales sin cambios) ---
  const [isVariationsVisible, setIsVariationsVisible] = useState(false);
  const [isContrastCheckerVisible, setIsContrastCheckerVisible] = useState(false);
  const [colorModePreview, setColorModePreview] = useState('card');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isImageModalVisible, setIsImageModalVisible] = useState(false);
  const [isAIModalVisible, setIsAIModalVisible] = useState(false);
  const [isAccessibilityModalVisible, setIsAccessibilityModalVisible] = useState(false);
  const [isComponentPreviewModalVisible, setIsComponentPreviewModalVisible] = useState(false);
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
  const [isHelpModalVisible, setIsHelpModalVisible] = useState(false);
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);

  // Estados para Menús desplegables en Header
  const [isMethodMenuVisible, setIsMethodMenuVisible] = useState(false);
  const [isViewMenuVisible, setIsViewMenuVisible] = useState(false);
  const [isToolsMenuVisible, setIsToolsMenuVisible] = useState(false);
  const [isExportModalVisible, setIsExportModalVisible] = useState(false);

  // Estado para la disposición de la paleta ('vertical' u 'horizontal')
  const [paletteLayout, setPaletteLayout] = useState('vertical');
  const [isSimulationSidebarVisible, setIsSimulationSidebarVisible] = useState(false);
  // Menú de acciones flotante sobre los colores de la paleta
  const [activeColorMenu, setActiveColorMenu] = useState(null);




  const [isAdjusterSidebarVisible, setIsAdjusterSidebarVisible] = useState(false);
  const [isSaveSidebarVisible, setIsSaveSidebarVisible] = useState(false);
  const [isMyPalettesSidebarVisible, setIsMyPalettesSidebarVisible] = useState(false);
  
  const [isColorPickerSidebarVisible, setIsColorPickerSidebarVisible] = useState(false);
  const [colorPickerSidebarData, setColorPickerSidebarData] = useState(null); 
  const [isSplitViewActive, setIsSplitViewActive] = useState(false); 
  
  const [exportingPaletteData, setExportingPaletteData] = useState(null);
  
  const [confirmModalState, setConfirmModalState] = useState({
      isOpen: false,
      title: '',
      message: '',
      onConfirm: () => {}
  });

  const [isConfigMenuVisible, setIsConfigMenuVisible] = useState(false);
  const [isFontMenuVisible, setIsFontMenuVisible] = useState(false);
  const [isUserMenuVisible, setIsUserMenuVisible] = useState(false);
  const importFileRef = useRef(null); 

  // ... (useEffect de 'barra espaciadora' sin cambios) ...
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code !== 'Space') return;
      const activeElement = document.activeElement;
      if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'BUTTON')) {
        return;
      }
      e.preventDefault();
      handleRandomTheme();
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleRandomTheme]);

  // ... (handleCyclePreviewMode sin cambios) ...
  const handleCyclePreviewMode = () => {
    const options = ['card', 'white', 'black', 'T0', 'T950'];
    const currentIndex = options.indexOf(colorModePreview);
    const nextIndex = (currentIndex + 1) % options.length;
    setColorModePreview(options[nextIndex]);
  };

  // ... (handleNativeExport y handleWebExport sin cambios) ...
  const handleNativeExport = async () => {
    const data = { 
      brandColor: brandColor, 
      grayColor: grayColor, 
      font: font, 
      theme: themeData.theme, 
      isGrayAuto: isGrayAuto,
      explorerPalette: originalExplorerPalette,
      lockedColors: lockedColors,
    };
    try {
      const jsonString = JSON.stringify(data, null, 2);
      const base64Data = btoa(unescape(encodeURIComponent(jsonString)));
      await Share.share({
        title: 'Mi Tema de Color',
        text: 'Aquí está el archivo JSON de mi tema de color.',
        url: `data:application/json;name=mi-tema.json;base64,${base64Data}`,
        dialogTitle: 'Exportar Tema',
      });
    } catch (error) {
       console.log('Share API no disponible o cancelado', error);
       showNotification('La exportación nativa no está disponible en la web.', 'error');
    }
  };
  const handleWebExport = () => {
    const data = { 
      brandColor: brandColor, 
      grayColor: grayColor, 
      font: font, 
      theme: themeData.theme, 
      isGrayAuto: isGrayAuto,
      explorerPalette: originalExplorerPalette,
      lockedColors: lockedColors,
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = "mi-tema.json";
    link.click();
  };

  // ... (Handlers de menú de config sin cambios) ...
  const handleFontSelect = (fontName) => {
      setFont(fontName);
      setIsFontMenuVisible(false);
      setIsConfigMenuVisible(false);
  };
  const handleImportClick = () => {
      importFileRef.current.click();
      setIsConfigMenuVisible(false);
  };
  const handleExportClick = () => {
      setExportingPaletteData(themeData);
      setIsExportModalVisible(true);
      setIsConfigMenuVisible(false);
  };
  const handleResetClick = () => {
      handleReset();
      setIsConfigMenuVisible(false);
  };
  const handleHelpClick = () => {
      setIsHelpModalVisible(true);
      setIsConfigMenuVisible(false);
  };
  const handleLogoutClick = () => {
      onLogout();
      setIsUserMenuVisible(false);
  };
  
  // ... (closeAllSidebars sin cambios) ...
  const closeAllSidebars = (isConfirming = false) => {
    setIsAdjusterSidebarVisible(false); 
    setIsSimulationSidebarVisible(false);
    setIsSaveSidebarVisible(false);
    setIsMyPalettesSidebarVisible(false);
    setIsColorPickerSidebarVisible(false); 
    setIsSplitViewActive(false); 
    
    if (isColorPickerSidebarVisible && colorPickerSidebarData && !isConfirming) {
      if (colorPickerSidebarData.index === null) {
        hook.cancelBrandColorUpdate(); 
      } else {
        replaceColorInPalette(colorPickerSidebarData.index, colorPickerSidebarData.originalColor);
      }
    }
    
    setColorPickerSidebarData(null); 
    
    if(isAdjusterSidebarVisible) {
        cancelPaletteAdjustments();
    }
    
    setSimulationMode('none'); 
  };

  // ... (handleOpenBrandColorPicker sin cambios) ...
  const handleOpenBrandColorPicker = () => {
    closeAllSidebars();
    setIsAdjusterSidebarVisible(true); 
    setIsSplitViewActive(true); 
  };
  
  // ... (onOpenColorPickerSidebar sin cambios) ...
  const onOpenColorPickerSidebar = (index, originalColor) => {
    closeAllSidebars();
    setColorPickerSidebarData({
        index: index,
        originalColor: originalColor
    });
    setIsColorPickerSidebarVisible(true);
    setIsSplitViewActive(false); 
  };

  // ... (Resto de handlers de sidebars sin cambios) ...
  const handleOpenSimulationSidebar = () => {
    closeAllSidebars();
    setIsSimulationSidebarVisible(true);
  };
  const handleOpenSaveSidebar = () => {
    if (!user) {
      hook.showNotification('Debes iniciar sesión para guardar paletas', 'error');
      onNavigate('auth');
      return;
    }
    closeAllSidebars();
    setIsSaveSidebarVisible(true);
  };
  const handleOpenMyPalettesSidebar = () => {
    if (!user) {
      hook.showNotification('Debes iniciar sesión para ver tus paletas guardadas', 'error');
      onNavigate('auth');
      return;
    }
    closeAllSidebars();
    setIsMyPalettesSidebarVisible(true);
  };
  const handleOpenExportSidebar = () => {
    if (!user) {
      hook.showNotification('Debes iniciar sesión para exportar paletas', 'error');
      onNavigate('auth');
      return;
    }
    setExportingPaletteData(themeData);
    setIsExportModalVisible(true);
  };
  const handleCancelSimulation = () => {
    setSimulationMode('none');
    setIsSimulationSidebarVisible(false);
  };
  const handleApplySimulation = () => {
    applySimulationToPalette();
    setSimulationMode('none');
    setIsSimulationSidebarVisible(false);
  };
  
  // ... (Lógica de Supabase sin cambios) ...
  const onSavePalette = async (saveData) => {
    const success = await handleSavePalette(saveData);
    if (success) {
        setIsSaveSidebarVisible(false); 
    }
  };
  const onLoadPalette = (palette) => {
    handleLoadPalette(palette);
    setIsMyPalettesSidebarVisible(false); 
  };
  const onDeletePalette = (paletteId) => {
    const palette = savedPalettes.find(p => p.id === paletteId);
    setConfirmModalState({
        isOpen: true,
        title: "Eliminar Paleta",
        message: `¿De verdad quieres eliminar la paleta "${palette?.name || 'seleccionada'}"? Esta acción no se puede deshacer.`,
        onConfirm: () => {
            handleDeletePalette(paletteId);
            setConfirmModalState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
        }
    });
  };
  const handleExportSpecificPalette = (palette) => {
    const specificThemeData = handleLoadSpecificPalette(palette);
    setExportingPaletteData(specificThemeData);
    setIsExportModalVisible(true);
  };
  const handleDuplicateClick = (paletteId) => {
    handleDuplicatePalette(paletteId);
  };
  const handleUpdateNameClick = (paletteId, newName) => {
    handleUpdatePaletteName(paletteId, newName);
  };
  const onDeleteProject = (projectId, projectName) => {
    setConfirmModalState({
        isOpen: true,
        title: "Eliminar Proyecto",
        message: `¿De verdad quieres eliminar el proyecto "${projectName}"? Las paletas dentro de este proyecto NO serán eliminadas, solo desasociadas.`,
        onConfirm: () => {
            handleDeleteProject(projectId);
            setConfirmModalState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
        }
    });
  };
  const onDeleteCollection = (collectionId, collectionName) => {
    setConfirmModalState({
        isOpen: true,
        title: "Eliminar Colección",
        message: `¿De verdad quieres eliminar la colección "${collectionName}"? Las paletas dentro de esta colección NO serán eliminadas, solo desasociadas.`,
        onConfirm: () => {
            handleDeleteCollection(collectionId);
            setConfirmModalState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
        }
    });
  };
  // --- FIN LÓGICA SUPABASE ---


  // ... (fallback de 'Cargando...' sin cambios) ...
  if (!themeData || !themeData.stylePalette || !themeData.stylePalette.fullActionColors) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-purple-500"></div>
        <p className="mt-4 text-lg">Generando sistema de diseño...</p>
      </div>
    );
  }

  const pageThemeStyle = {
    backgroundColor: theme === 'light' ? '#FFFFFF' : '#09090b', 
    color: theme === 'light' ? '#09090b' : '#f4f4f5', 
    transition: 'background-color 0.2s ease, color 0.2s ease',
    fontFamily: availableFonts[font],
  };


  return (
    <div 
      className="flex flex-col min-h-screen w-full text-zinc-900 dark:text-zinc-100 transition-colors duration-200" 
      style={{ backgroundColor: theme === 'light' ? '#FFFFFF' : '#09090b', color: theme === 'light' ? '#09090b' : '#f4f4f5', transition: 'background-color 0.2s ease, color 0.2s ease', fontFamily: availableFonts[font] }}
    >

      {/* --- (Filtros SVG sin cambios) --- */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id="protanopia"><feColorMatrix in="SourceGraphic" type="matrix" values="0.567, 0.433, 0, 0, 0, 0.558, 0.442, 0, 0, 0, 0, 0.242, 0.758, 0, 0, 0, 0, 0, 1, 0" /></filter>
          <filter id="deuteranopia"><feColorMatrix in="SourceGraphic" type="matrix" values="0.625, 0.375, 0, 0, 0, 0.7, 0.3, 0, 0, 0, 0, 0.3, 0.7, 0, 0, 0, 0, 0, 1, 0" /></filter>
          <filter id="tritanopia"><feColorMatrix in="SourceGraphic" type="matrix" values="0.95, 0.05, 0, 0, 0, 0, 0.433, 0.567, 0, 0, 0, 0.475, 0.525, 0, 0, 0, 0, 0, 1, 0" /></filter>
          <filter id="achromatopsia"><feColorMatrix in="SourceGraphic" type="matrix" values="0.299, 0.587, 0.114, 0, 0, 0.299, 0.587, 0.114, 0, 0, 0.299, 0.587, 0.114, 0, 0, 0, 0, 0, 1, 0" /></filter>
          <filter id="protanomaly"><feColorMatrix in="SourceGraphic" type="matrix" values="0.817, 0.183, 0, 0, 0, 0.333, 0.667, 0, 0, 0, 0, 0.125, 0.875, 0, 0, 0, 0, 0, 1, 0" /></filter>
          <filter id="deuteranomaly"><feColorMatrix in="SourceGraphic" type="matrix" values="0.8, 0.2, 0, 0, 0, 0.258, 0.742, 0, 0, 0, 0, 0.142, 0.858, 0, 0, 0, 0, 0, 1, 0" /></filter>
          <filter id="tritanomaly"><feColorMatrix in="SourceGraphic" type="matrix" values="0.967, 0.033, 0, 0, 0, 0, 0.733, 0.267, 0, 0, 0, 0.183, 0.817, 0, 0, 0, 0, 0, 1, 0" /></filter>
          <filter id="achromatomaly"><feColorMatrix in="SourceGraphic" type="matrix" values="0.618, 0.320, 0.062, 0, 0, 0.163, 0.775, 0.062, 0, 0, 0.163, 0.320, 0.516, 0, 0, 0, 0, 0, 1, 0" /></filter>
        </defs>
      </svg>
      
      <input type="file" ref={importFileRef} onChange={handleImport} accept=".json" className="hidden"/>
      
      {/* --- ENCABEZADO STUDIO PRO v3.9 --- */}
      <header 
        className="flex justify-between items-center py-2.5 px-4 md:px-6 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800/90 sticky top-0 z-50 text-zinc-900 dark:text-zinc-100 shadow-sm transition-colors duration-200"
      >
        {/* --- SECCIÓN IZQUIERDA: IDENTIDAD & PALETA ACTIVA --- */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div 
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={() => onNavigate('landing')}
          >
            <div className="h-9 w-9 rounded-xl supabase-gradient p-0.5 shadow-sm shadow-[#0BA5C7]/20 group-hover:scale-105 transition-transform flex items-center justify-center text-white">
              <Palette size={18} strokeWidth={2} />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-extrabold text-sm tracking-tight text-zinc-900 dark:text-white uppercase">
                Colores Dayam
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 dark:bg-emerald-500/20 text-[#0BA5C7] dark:text-[#0BA5C7] border border-emerald-500/20">
                v3.9
              </span>
            </div>
          </div>

          <div className="hidden xl:block h-4 w-px bg-zinc-200 dark:bg-zinc-800"></div>

          {/* CÁPSULA FIJA DE NOMBRE DE PALETA E IA ESTÉTICA */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-semibold w-56 shrink-0">
            <Sparkles size={14} className="text-[#0BA5C7] dark:text-[#0BA5C7] shrink-0" />
            <span className="text-zinc-800 dark:text-zinc-200 truncate flex-1 font-mono text-[11px]" title={generatePoeticPaletteName(explorerPalette)}>
              {generatePoeticPaletteName(explorerPalette)}
            </span>
            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold tracking-wider uppercase bg-emerald-500/10 dark:bg-emerald-500/20 text-[#0BA5C7] dark:text-[#0BA5C7] border border-emerald-500/20 shrink-0">
              Afinidad IA
            </span>
          </div>

          {/* BANNER DE PUBLICIDAD PEQUEÑO DENTRO DEL ENCABEZADO */}
          <div className="hidden 2xl:flex items-center justify-center max-w-[200px] max-h-[32px] overflow-hidden opacity-90">
            <GoogleAdBanner
              dataAdSlot="3746326433"
              style={{ display: 'block', maxHeight: '32px', overflow: 'hidden' }}
              dataAdFormat="horizontal"
            />
          </div>
        </div>

        {/* --- SECCIÓN CENTRAL: GENERADOR PRINCIPAL FIJO --- */}
        <div className="hidden md:flex items-center justify-center shrink-0">
          <button
            onClick={handleRandomTheme}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl supabase-gradient supabase-gradient-hover text-white font-extrabold text-xs shadow-md shadow-[#0BA5C7]/20 active:scale-95 transition-all ring-1 ring-white/10 shrink-0"
            title="Generar nueva paleta (Barra Espaciadora)"
          >
            <RefreshCcw size={14} />
            <span>Generar Paleta</span>
            <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[9px] font-black bg-black/20 border border-white/20 rounded-md text-white uppercase ml-1">
              Espacio
            </kbd>
          </button>
        </div>

        {/* --- SECCIÓN DERECHA: GRUPOS DE HERRAMIENTAS ORGANIZADAS --- */}
        <div className="flex items-center gap-2">
          
          {/* GRUPO 1: CREACIÓN E IA */}
          <div className="hidden md:flex items-center bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 gap-0.5">
            <button 
              onClick={() => {
                if (!user) {
                  hook.showNotification('Debes iniciar sesión para generar paletas con IA', 'error');
                  onNavigate('auth');
                  return;
                }
                setIsAIModalVisible(true);
              }} 
              className="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors"
              title="Generar con IA"
            >
              <Sparkles size={16} className="text-[#0BA5C7] dark:text-[#0BA5C7]" />
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setIsMethodMenuVisible(p => !p)} 
                className="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1"
                title="Método de Armonía"
              >
                <Wand2 size={16} className="text-[#0BA5C7] dark:text-[#0BA5C7]" />
              </button>
              {isMethodMenuVisible && (
                <PopoverMenu onClose={() => setIsMethodMenuVisible(false)}>
                  {generationMethods.map(method => (
                    method.isHeader ? (
                      <div key={method.name} className="px-3 pt-2 pb-1 text-[10px] font-extrabold uppercase text-zinc-400 dark:text-zinc-500 tracking-wider">
                        {method.name}
                      </div>
                    ) : (
                      <button 
                        key={method.id} 
                        onClick={() => { setExplorerMethod(method.id); setIsMethodMenuVisible(false); }} 
                        className={`w-full text-left px-3 py-1.5 text-xs ${explorerMethod === method.id ? 'font-bold text-[#0BA5C7] dark:text-[#0BA5C7] bg-emerald-500/10' : 'text-zinc-800 dark:text-zinc-200'} hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md`}
                      >
                        {method.name}
                      </button>
                    )
                  ))}
                </PopoverMenu>
              )}
            </div>

            <button 
              onClick={() => {
                if (!user) {
                  hook.showNotification('Debes iniciar sesión para extraer paletas de imágenes', 'error');
                  onNavigate('auth');
                  return;
                }
                setIsImageModalVisible(true);
              }} 
              className="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors"
              title="Extraer de Imagen"
            >
              <ImageIcon size={16} />
            </button>
            
            <button 
              onClick={handleOpenBrandColorPicker} 
              className="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors"
              title="Ajustar Paleta"
            >
              <SlidersHorizontal size={16} />
            </button>
          </div>

          {/* GRUPO 2: HERRAMIENTAS & VISTA */}
          <div className="hidden md:flex items-center bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 gap-0.5">
            <button 
              onClick={() => setPaletteLayout(p => p === 'vertical' ? 'horizontal' : 'vertical')} 
              className="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors"
              title={paletteLayout === 'vertical' ? "Vista Horizontal" : "Vista Vertical"}
            >
              {paletteLayout === 'vertical' ? <Rows3 size={16} /> : <Columns3 size={16} />}
            </button>

            <button 
              onClick={handleOpenSimulationSidebar} 
              className="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors"
              title="Simulación Daltonismo"
            >
              <Eye size={16} />
            </button>

            <div className="relative">
              <button 
                onClick={() => setIsToolsMenuVisible(p => !p)}
                className="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors"
                title="Más Herramientas"
              >
                <MoreHorizontal size={16}/>
              </button>
              {isToolsMenuVisible && (
                <PopoverMenu onClose={() => setIsToolsMenuVisible(false)}>
                  <MenuButton icon={<Accessibility size={16}/>} label="Accesibilidad" onClick={() => { setIsAccessibilityModalVisible(true); setIsToolsMenuVisible(false); }} />
                  <MenuButton icon={<TestTube2 size={16}/>} label="Componentes" onClick={() => { setIsComponentPreviewModalVisible(true); setIsToolsMenuVisible(false); }} />
                  <MenuButton icon={<Palette size={16}/>} label="Variaciones" onClick={() => { setIsVariationsVisible(true); setIsToolsMenuVisible(false); }} />
                  <MenuButton icon={<ShieldCheck size={16}/>} label="Matriz de Contraste" onClick={() => { setIsContrastCheckerVisible(true); setIsToolsMenuVisible(false); }} />
                  <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-1"></div>
                  <MenuButton icon={<FileCode size={16}/>} label="Exportar Código" onClick={() => { handleOpenExportSidebar(); setIsToolsMenuVisible(false); }} />
                </PopoverMenu>
              )}
            </div>
          </div>

          {/* GRUPO 3: HISTORIAL */}
          <div className="hidden lg:flex items-center bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl border border-zinc-200 dark:border-zinc-800 gap-0.5">
            <button 
              onClick={handleUndo} 
              disabled={!history || historyIndex <= 0}
              className="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white disabled:opacity-40 disabled:hover:bg-transparent hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors"
              title="Deshacer"
            >
              <Undo2 size={16} />
            </button>
            <button 
              onClick={handleRedo} 
              disabled={!history || historyIndex >= history.length - 1}
              className="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white disabled:opacity-40 disabled:hover:bg-transparent hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors"
              title="Rehacer"
            >
              <Redo2 size={16} />
            </button>
            <button 
              onClick={() => {
                if (!user) {
                  hook.showNotification('Debes iniciar sesión para ver el historial', 'error');
                  onNavigate('auth');
                  return;
                }
                setIsHistoryModalVisible(true);
              }} 
              className="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors"
              title="Historial de Paletas"
            >
              <Clock size={16} />
            </button>
          </div>

          {/* BOTÓN IR A LANDING / INICIO */}
          <button 
            onClick={() => onNavigate('landing')} 
            className="p-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            title="Ir a la Página de Inicio (Landing Page)"
          >
            <Home size={16} className="text-[#0BA5C7]" />
            <span className="hidden sm:inline">Inicio</span>
          </button>

          {/* CONMUTADOR DE TEMA CLARO / OSCURO (SOLO UN CLIC) */}
          <button 
            onClick={handleThemeToggle} 
            className="p-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition-colors flex items-center gap-1.5 text-xs font-semibold"
            title={theme === 'light' ? "Cambiar a Modo Oscuro" : "Cambiar a Modo Claro"}
          >
            {theme === 'light' ? <Moon size={16} className="text-zinc-700" /> : <Sun size={16} className="text-amber-400" />}
          </button>


          {/* GRUPO 4: ACCIONES PRINCIPALES (GUARDAR & PERFIL) */}
          <div className="flex items-center gap-1.5 ml-1">
            <button 
              onClick={handleOpenMyPalettesSidebar}
              className="p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition-colors hidden sm:flex"
              title="Mis Paletas Guardadas"
            >
              <FolderOpen size={16} />
            </button>

            <button 
              onClick={handleOpenExportSidebar}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-extrabold text-xs border border-zinc-200 dark:border-zinc-800 shadow-xs transition-all active:scale-95"
              title="Exportar Paleta Rápidamente (CSS, PNG, SVG, PDF, Tailwind, Power Fx, JSON)"
            >
              <Download size={15} className="text-[#0BA5C7]" />
              <span className="hidden sm:inline">Exportar</span>
            </button>

            <button 
              onClick={handleOpenSaveSidebar}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl supabase-gradient supabase-gradient-hover text-white font-extrabold text-xs shadow-sm transition-all active:scale-95"
              title="Guardar Paleta Actual"
            >
              <Save size={15} />
              <span className="hidden sm:inline">Guardar</span>
            </button>

            {user ? (
              <div className="relative">
                <button 
                  onClick={() => setIsUserMenuVisible(p => !p)}
                  className="p-1.5 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition-colors flex items-center gap-1.5"
                  title="Mi Cuenta"
                >
                  <div className="h-6 w-6 rounded-lg bg-emerald-500/20 text-[#0BA5C7] dark:text-[#0BA5C7] flex items-center justify-center text-xs font-extrabold uppercase">
                    {user.name ? user.name.charAt(0) : 'U'}
                  </div>
                </button>
                {isUserMenuVisible && (
                  <PopoverMenu onClose={() => setIsUserMenuVisible(false)}>
                    <div className="px-3 py-2">
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">{user.name || user.email}</p>
                      <p className="text-xs text-[#0BA5C7] dark:text-[#0BA5C7] font-medium">Cuenta Activa</p>
                    </div>
                    <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-1"></div>
                    <MenuButton icon={<User size={16}/>} label="Mi Perfil" onClick={() => { setIsProfileModalVisible(true); setIsUserMenuVisible(false); }} />
                    <MenuButton icon={<LogOut size={16}/>} label="Cerrar Sesión" onClick={handleLogoutClick} />
                  </PopoverMenu>
                )}
              </div>
            ) : (
              <button 
                onClick={() => onNavigate('auth')}
                className="p-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition-colors flex items-center gap-1.5 text-xs font-semibold"
                title="Iniciar Sesión"
              >
                <LogIn size={15} />
                <span className="hidden sm:inline">Entrar</span>
              </button>
            )}
          </div>

        </div>
      </header>




      
      {/* --- ¡CONTENIDO PRINCIPAL MODIFICADO! --- */}
      {/* Añadido padding-bottom dinámico:
        - pb-20 (normal) para la barra de navegación.
        - pb-[60vh] (cuando el picker está abierto) para empujar el contenido hacia arriba.
      */}
      <div 
        className={`flex-grow md:pb-0 transition-all duration-300 ${
          isColorPickerSidebarVisible ? 'pb-[45vh]' : 'pb-20'
        }`}
      >
        <div className="flex flex-col md:flex-row">
          
          <div className="flex-grow w-full min-w-0">
            <main>
              {/* Se pasa 'paletteLayout' a Explorer */}
              <Explorer 
                explorerPalette={explorerPalette} 
                originalExplorerPalette={originalExplorerPalette} 
                reorderExplorerPalette={reorderExplorerPalette}
                explorerGrayShades={explorerGrayShades}
                handleExplorerColorPick={handleExplorerColorPick}
                setGrayColor={setGrayColor}
                brandColor={brandColor}
                updateBrandColor={updateBrandColor} 
                themeData={themeData}
                insertColorInPalette={insertColorInPalette}
                insertMultipleColors={insertMultipleColors} 
                removeColorFromPalette={removeColorFromPalette}
                explorerMethod={explorerMethod}
                setExplorerMethod={setExplorerMethod}
                replaceColorInPalette={replaceColorInPalette} 
                handleUndo={handleUndo}
                handleRedo={handleRedo}
                history={history}
                historyIndex={historyIndex}
                simulationMode={simulationMode}
                generatePaletteWithAI={generatePaletteWithAI}
                showNotification={showNotification}
                applySimulationToPalette={applySimulationToPalette}
                onOpenAccessibilityModal={() => setIsAccessibilityModalVisible(true)}
                onOpenComponentPreviewModal={() => setIsComponentPreviewModalVisible(true)}
                lockedColors={lockedColors}
                toggleLockColor={toggleLockColor}
                isSimulationSidebarVisible={isSimulationSidebarVisible}
                onOpenSimulationSidebar={handleOpenSimulationSidebar}
                isExpanded={isExpanded}
                setIsExpanded={setIsExpanded}
                colorModePreview={colorModePreview}
                onOpenColorPickerSidebar={onOpenColorPickerSidebar}
                isSplitViewActive={isSplitViewActive}
                paletteLayout={paletteLayout}
                setActiveColorMenu={setActiveColorMenu}
                isColorPickerSidebarVisible={isColorPickerSidebarVisible}
              />
              
              {/* ... (ColorPreviewer y SemanticPalettes sin cambios) ... */}
              <div className="">
                <div className="">
                  <ColorPreviewer 
                    title="Modo Claro" 
                    themeOverride="light" 
                    previewMode={lightPreviewMode} 
                    onCyclePreviewMode={() => cyclePreviewMode(lightPreviewMode, setLightPreviewMode, ['white', 'T950'])} 
                    onShadeCopy={showNotification}
                    brandColor={brandColor}
                    grayColor={grayColor}
                    isGrayAuto={isGrayAuto}
                    themeData={themeData}
                    updateBrandColor={updateBrandColor} 
                    setGrayColor={setGrayColor}
                    setIsGrayAuto={setIsGrayAuto}
                    simulationMode={simulationMode}
                    handleRandomTheme={handleRandomTheme}
                  />
                  <ColorPreviewer 
                    title="Modo Oscuro" 
                    themeOverride="dark" 
                    previewMode={darkPreviewMode} 
                    onCyclePreviewMode={() => cyclePreviewMode(darkPreviewMode, setDarkPreviewMode, ['black', 'T0'])} 
                    onShadeCopy={showNotification}
                    brandColor={brandColor}
                    grayColor={grayColor}
                    isGrayAuto={isGrayAuto}
                    themeData={themeData}
                    updateBrandColor={updateBrandColor} 
                    setGrayColor={setGrayColor}
                    setIsGrayAuto={setIsGrayAuto}
                    simulationMode={simulationMode}
                    handleRandomTheme={handleRandomTheme}
                  />
                </div>
                <SemanticPalettes 
                  stylePalette={themeData.stylePalette} 
                  onCopy={showNotification} 
                  themeData={themeData} 
                  previewMode={semanticPreviewMode} 
                  onCyclePreviewMode={() => cyclePreviewMode(semanticPreviewMode, setSemanticPreviewMode, ['card', 'white', 'T950', 'black', 'T0'])} 
                  simulationMode={simulationMode} 
                />
              </div>
            </main>
          </div>
          
          {/* --- (Lógica de Sidebars sin cambios) --- */}
          {isAdjusterSidebarVisible && (
            <PaletteAdjusterSidebar
                paletteAdjustments={paletteAdjustments}
                setPaletteAdjustments={setPaletteAdjustments}
                commitPaletteAdjustments={() => {
                    commitPaletteAdjustments();
                    closeAllSidebars(true); 
                }}
                cancelPaletteAdjustments={() => {
                    cancelPaletteAdjustments();
                    closeAllSidebars(false); 
                }}
                setIsAdjusterSidebarVisible={setIsAdjusterSidebarVisible}
                originalExplorerPalette={originalExplorerPalette}
                explorerPalette={explorerPalette}
                lockedColors={lockedColors}
            />
          )}
          {isColorPickerSidebarVisible && colorPickerSidebarData && (
            <ColorPickerSidebar
              key={colorPickerSidebarData.index === null ? 'brand' : colorPickerSidebarData.index}
              initialColor={colorPickerSidebarData.originalColor}
              onClose={() => closeAllSidebars(false)} 
              onRealtimeChange={(newColor) => {
                if (colorPickerSidebarData.index === null) {
                  hook.updateBrandColor(newColor); 
                } else {
                  replaceColorInPalette(colorPickerSidebarData.index, newColor);
                }
              }}
              onConfirm={(newColor) => {
                if (colorPickerSidebarData.index === null) {
                  hook.confirmBrandColor(newColor); 
                } else {
                  confirmColorInPalette(colorPickerSidebarData.index, newColor);
                }
                closeAllSidebars(true); 
              }}
            />
          )}
          {isSimulationSidebarVisible && (
            <ColorBlindnessSidebar
              simulationMode={simulationMode}
              setSimulationMode={setSimulationMode}
              onCancel={closeAllSidebars}
              onApply={handleApplySimulation}
            />
          )}
          {isSaveSidebarVisible && (
            <SavePaletteSidebar
              onClose={closeAllSidebars}
              onSave={onSavePalette}
              isSaving={isSavingPalette}
              initialName={savedPalettes.find(p => p.id === currentPaletteId)?.name || ''}
              currentPaletteId={currentPaletteId}
              projects={projects}
              collections={collections}
              tags={tags} 
              onCreateProject={handleCreateProject}
              onCreateCollection={handleCreateCollection}
              onCreateTag={handleCreateTag} 
            />
          )}
          {isMyPalettesSidebarVisible && (
            <MyPalettesSidebar
              onClose={closeAllSidebars}
              palettes={savedPalettes} 
              isLoading={isLoadingPalettes}
              onLoadPalette={onLoadPalette}
              onDeletePalette={onDeletePalette}
              onDuplicatePalette={handleDuplicateClick}
              onExportPalette={handleExportSpecificPalette}
              onUpdatePaletteName={handleUpdateNameClick}
              deletingId={deletingPaletteId}
              projects={projects}
              collections={collections}
              filters={filters}
              setFilters={setFilters}
              onCreateProject={handleCreateProject}
              onUpdateProject={handleUpdateProjectName}
              onDeleteProject={onDeleteProject}
              onCreateCollection={handleCreateCollection}
              onUpdateCollection={handleUpdateCollectionName}
              onDeleteCollection={onDeleteCollection}
            />
          )}
          {isExportModalVisible && (
            <ExportModal 
                onClose={() => {
                  setIsExportModalVisible(false);
                  setExportingPaletteData(null); 
                }}
                themeData={exportingPaletteData || themeData}
                fxSeparator={fxSeparator} 
                setFxSeparator={setFxSeparator} 
                useFxQuotes={useFxQuotes} 
                setUseFxQuotes={setUseFxQuotes} 
                onCopy={showNotification}
                user={user}
                onOpenSaveModal={handleOpenSaveSidebar}
                onOpenMyPalettes={handleOpenMyPalettesSidebar}
                handleSharePalette={handleSharePalette}
            />
          )}
        </div>
      </div>

      {/* ... (Banner de Google Ad sin cambios) ... */}
        <div className="my-8 flex justify-center">
          <GoogleAdBanner
            dataAdSlot="3746326433"
            style={{ display: 'block' }}
            dataAdFormat="fluid"
            dataAdLayoutKey="-gw-3+1f-3d+2z"
          />
        </div>

      {/* ... (Footer sin cambios) ... */}
        <footer className="text-center py-8 px-4 md:px-8 border-t text-gray-500" style={{ borderColor: 'var(--border-default)'}}>
            <p className="text-sm">Creado por JD_DM.</p>
            <p className="text-xs mt-1">Un proyecto de código abierto para la comunidad de Power Apps.</p>
            <div className="mt-4 flex justify-center items-center gap-3">
              <button 
                onClick={() => onNavigate('privacy')}
                className="text-xs text-gray-500 hover:underline"
              >
                Política de Privacidad
              </button>
              <span className="text-gray-500">|</span>
              <button 
                onClick={() => onNavigate('terms')}
                className="text-xs text-gray-500 hover:underline"
              >
                Términos y Condiciones
              </button>
            </div>
        </footer>

      {/* ... (Notificación y Modales sin cambios) ... */}
        {hook.notification.message && (
          <div className="fixed bottom-5 right-5 text-white text-sm font-bold py-2 px-4 rounded-lg shadow-lg flex items-center gap-2" style={{ backgroundColor: hook.notification.type === 'error' ? '#EF4444' : '#10B981'}}>{hook.notification.message}</div>
        )}
        {/* --- DOCK FLOTANTE ERGONÓMICO EN MÓVIL (SOPORTE CLARO/OSCURO NEUTRO) --- */}
        <div className="md:hidden fixed bottom-3 left-3 right-3 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-2xl p-2 shadow-xl flex items-center justify-around gap-1 animate-in slide-in-from-bottom duration-300">
            <button
                type="button"
                onClick={() => setIsMethodMenuVisible(p => !p)}
                className="flex flex-col items-center justify-center p-2 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white rounded-xl active:scale-95 transition-all text-[10px] font-bold gap-0.5"
            >
                <Wand2 size={18} className="text-blue-600 dark:text-blue-400" />
                <span>Método</span>
            </button>

            <button
                type="button"
                onClick={() => setIsAIModalVisible(true)}
                className="flex flex-col items-center justify-center p-2 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white rounded-xl active:scale-95 transition-all text-[10px] font-bold gap-0.5"
            >
                <Sparkles size={18} className="text-blue-500 dark:text-blue-400" />
                <span>IA</span>
            </button>

            {/* BOTÓN PRINCIPAL GENERAR (FAB AZUL ELÉCTRICO) */}
            <button
                type="button"
                onClick={handleRandomTheme}
                className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl supabase-gradient supabase-gradient-hover text-white font-extrabold text-xs shadow-md shadow-[#0BA5C7]/30 active:scale-95 transition-all"
            >
                <RefreshCcw size={15} />
                <span>Generar</span>
            </button>

            <button
                type="button"
                onClick={() => setIsImageModalVisible(true)}
                className="flex flex-col items-center justify-center p-2 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white rounded-xl active:scale-95 transition-all text-[10px] font-bold gap-0.5"
            >
                <ImageIcon size={18} className="text-[#0BA5C7] dark:text-[#0BA5C7]" />
                <span>Imagen</span>
            </button>

            <button
                type="button"
                onClick={() => setIsToolsMenuVisible(p => !p)}
                className="flex flex-col items-center justify-center p-2 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white rounded-xl active:scale-95 transition-all text-[10px] font-bold gap-0.5"
            >
                <MoreHorizontal size={18} />
                <span>Más</span>
            </button>
        </div>


        {isAccessibilityModalVisible && <AccessibilityModal onClose={() => setIsAccessibilityModalVisible(false)} accessibility={themeData.accessibility} colors={themeData.accessibilityColors} onCopy={showNotification} />}

        {isComponentPreviewModalVisible && <ComponentPreviewModal onClose={() => setIsComponentPreviewModalVisible(false)} primaryButtonTextColor={themeData.primaryButtonTextColor} />}
        {isHistoryModalVisible && <HistoryModal history={history} onSelect={goToHistoryState} onClose={() => setIsHistoryModalVisible(false)} />}
        {isHelpModalVisible && <HelpModal onClose={() => setIsHelpModalVisible(false)} />}
        {isProfileModalVisible && (
            <ProfileModal 
                user={user} 
                onClose={() => setIsProfileModalVisible(false)} 
                onUserUpdated={(updatedUser) => {
                    if (user && updatedUser?.name) {
                        user.name = updatedUser.name;
                    }
                    showNotification('Perfil actualizado correctamente.');
                }} 
            />
        )}

        
        {confirmModalState.isOpen && (
            <ConfirmDeleteModal
                title={confirmModalState.title}
                message={confirmModalState.message}
                onClose={() => setConfirmModalState({ isOpen: false, title: '', message: '', onConfirm: () => {} })}
                onConfirm={confirmModalState.onConfirm}
                isDeleting={deletingPaletteId === confirmModalState.onConfirm.toString()}
            />
        )}
        
        {isAIModalVisible && ( <AIPaletteModal onClose={() => setIsAIModalVisible(false)} onGenerate={generatePaletteWithAI} /> )}
        {isImageModalVisible && ( <ImagePaletteModal onColorSelect={confirmBrandColor} onClose={() => setIsImageModalVisible(false)} /> )}
        {isVariationsVisible && <VariationsModal explorerPalette={explorerPalette} onClose={() => setIsVariationsVisible(false)} onColorSelect={confirmBrandColor} />}
        {isContrastCheckerVisible && <PaletteContrastChecker palette={explorerPalette} onClose={() => setIsContrastCheckerVisible(false)} onCopy={(hex, msg) => showNotification(msg)} />}

        {/* --- ¡NUEVO! --- Renderizar el Menú de Acciones aquí, en la raíz */}
        {activeColorMenu && (
            <ColorActionMenu
                style={activeColorMenu.style}
                color={explorerPalette[activeColorMenu.index]} // Muestra el color en tiempo real
                isLocked={lockedColors.includes(originalExplorerPalette[activeColorMenu.index])} // Bloquea el original
                onClose={() => setActiveColorMenu(null)}
                onSetAsBrand={() => {
                    handleExplorerColorPick(explorerPalette[activeColorMenu.index]);
                    setActiveColorMenu(null);
                }}
                onOpenPicker={() => {
                    onOpenColorPickerSidebar(activeColorMenu.index, originalExplorerPalette[activeColorMenu.index]);
                    setActiveColorMenu(null);
                }}
                onAddAfter={() => {
                    insertColorInPalette(activeColorMenu.index);
                    setActiveColorMenu(null);
                }}
                onRemove={() => {
                    removeColorFromPalette(activeColorMenu.index);
                    setActiveColorMenu(null);
                }}
                onCopy={() => {
                    const color = explorerPalette[activeColorMenu.index];
                    // --- ¡CORRECCIÓN! ---
                    // Usar la función getHexValue que ya tenemos
                    const hexValue = tinycolor(color).toHexString().substring(1).toUpperCase();
                    // --- FIN CORRECCIÓN ---
                    navigator.clipboard.writeText(hexValue);
                    showNotification(`H E X ${hexValue} copiado!`);
                    setActiveColorMenu(null);
                }}
                onToggleLock={() => {
                    toggleLockColor(originalExplorerPalette[activeColorMenu.index]);
                    // No cerramos el menú al bloquear, permitiendo múltiples acciones
                }}
            />
        )}

        {/* --- ¡BLOQUE DE FAB ELIMINADO! --- */}
        {/* El botón de 'Sparkles' ahora está en la barra de menú inferior en móvil */}

    </div>
  );
});


// --- (Función App() principal sin cambios) ---
function App() {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  
  const hook = useThemeGenerator(user); 
  
  const [isNative, setIsNative] = useState(false);
  const urlParams = new URLSearchParams(window.location.search);
  const hasSharedLink = urlParams.has('colors') || urlParams.has('palette');
  const [route, setRoute] = useState(hasSharedLink ? 'generator' : 'landing'); 

  useEffect(() => {
    setLoadingAuth(true);
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoadingAuth(false);
      
      if (session) {
        if (route !== 'generator') {
           setRoute('generator');
        }
      } else {
         const currentParams = new URLSearchParams(window.location.search);
         const isShared = currentParams.has('colors') || currentParams.has('palette');
         if (isShared) {
           setRoute('generator');
         } else if (route !== 'landing' && route !== 'auth' && route !== 'privacy' && route !== 'terms') {
           setRoute('landing');
         }
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoadingAuth(false);
        
        if (session) {
            setRoute('generator');
        } else {
            const currentParams = new URLSearchParams(window.location.search);
            const isShared = currentParams.has('colors') || currentParams.has('palette');
            if (!isShared && route === 'generator') {
                setRoute('landing');
            }
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []); 

  useEffect(() => {
    setIsNative(Capacitor.isNativePlatform());
    if (hook.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [hook.theme]);
  
  const handleNavigate = useCallback((newRoute) => {
      setRoute(newRoute);
  }, []);

  const handleLogout = useCallback(async () => {
      const { error } = await supabase.auth.signOut();
      if (error) {
          hook.showNotification(`Error al cerrar sesión: ${error.message}`, 'error');
      } else {
          setUser(null);
          setSession(null);
          setRoute('landing');
          hook.showNotification('Has cerrado sesión.');
      }
  }, [hook]);
  
  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-white">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-emerald-500"></div>
        <p className="mt-4 text-lg">Cargando sesión...</p>
      </div>
    );
  }
  
  return (
    <div 
      className="w-full min-h-screen flex flex-col"
      style={{ backgroundColor: hook.theme === 'light' ? '#FFFFFF' : '#09090b', transition: 'background-color 0.2s ease' }}
    >
      {(() => {
        switch (route) {
          case 'landing':
            return <LandingPage onNavigate={handleNavigate} onToggleTheme={hook.handleThemeToggle} theme={hook.theme} />;
          case 'auth':
            return <AuthPage onNavigate={handleNavigate} onToggleTheme={hook.handleThemeToggle} theme={hook.theme} />;
          case 'generator':
            return <MainApp hook={hook} theme={hook.theme} isNative={isNative} user={user} onLogout={handleLogout} onNavigate={handleNavigate}/>;
          
          case 'privacy':
            return <PrivacyPolicyPage onNavigate={handleNavigate} />;
          case 'terms':
            return <TermsOfServicePage onNavigate={handleNavigate} />;
          
          default:
            return <LandingPage onNavigate={handleNavigate} onToggleTheme={hook.handleThemeToggle} theme={hook.theme} />;
        }
      })()}


    </div>

  );
}

export default App;
