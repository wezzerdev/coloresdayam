import React, { memo, useRef, useEffect, useState } from 'react';
import { 
    X, Loader2, FolderOpen, AlertTriangle, MoreHorizontal, Download, Play, 
    Copy, Edit, XCircle, Search, Plus, Trash2, ChevronDown 
} from 'lucide-react';
import { PopoverMenu, MenuButton } from './Explorer.jsx'; 

const styleOptions = [
    { label: "Cálido", value: "warm" }, { label: "Frío", value: "cold" },
    { label: "Claro", value: "light" }, { label: "Oscuro", value: "dark" },
    { label: "Brillante", value: "bright" }, { label: "Silenciado", value: "muted" },
    { label: "Pastel", value: "pastel" }, { label: "Vintage", value: "vintage" },
    { label: "Monocromo", value: "monochromatic" }, { label: "Gradiente", value: "gradient" }
];

const colorOptions = [
    { label: "Rojo", value: "red", color: "#e11d48" },
    { label: "Naranja", value: "orange", color: "#f97316" },
    { label: "Marrón", value: "brown", color: "#78350f" },
    { label: "Amarillo", value: "yellow", color: "#facc15" },
    { label: "Verde", value: "green", color: "#22c55e" },
    { label: "Azul", value: "blue", color: "#3b82f6" },
    { label: "Púrpura", value: "purple", color: "#a855f7" },
    { label: "Rosa", value: "pink", color: "#ec4899" },
    { label: "Gris", value: "gray", color: "#6b7280" }
];

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

const PaletteCard = ({ 
    palette, 
    onLoad, 
    onDelete, 
    onDuplicate,
    onExport,
    onUpdateName,
    isDeleting 
}) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(palette.name);

    const handleNameUpdate = () => {
        if (name.trim() && name.trim() !== palette.name) {
            onUpdateName(palette.id, name.trim());
        }
        setIsEditing(false);
    };

    return (
        <div className="w-full bg-zinc-50 dark:bg-zinc-800/40 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
            <div 
                className="flex-1 cursor-pointer h-10 rounded-lg overflow-hidden flex shadow-sm hover:shadow-md transition-shadow"
                onClick={() => onLoad(palette)}
                title={`Cargar paleta "${palette.name}"`}
            >
                {(palette.explorerPalette || []).map((color, i) => (
                    <div 
                        key={i} 
                        style={{ backgroundColor: color }} 
                        className="h-full flex-1"
                        title={color} 
                    />
                ))}
            </div>
            
            <div className="flex items-center justify-between gap-2 pt-2 px-1">
                {isEditing ? (
                    <input
                        type="text"
                        value={name}
                        autoFocus
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => setName(e.target.value)}
                        onBlur={handleNameUpdate}
                        onKeyDown={(e) => e.key === 'Enter' && handleNameUpdate()}
                        onClick={(e) => e.stopPropagation()}
                        className="font-semibold text-xs p-1 bg-transparent border-b border-[#0BA5C7] focus:outline-none flex-1 w-full text-zinc-900 dark:text-zinc-100"
                    />
                ) : (
                    <p 
                        className="font-semibold text-xs truncate flex-1 cursor-pointer text-zinc-900 dark:text-zinc-100 hover:text-[#0BA5C7] dark:hover:text-[#0BA5C7]"
                        onClick={() => onLoad(palette)}
                        title={palette.name}
                    >
                        {palette.name}
                    </p>
                )}
                
                <div className="relative">
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        disabled={isDeleting}
                        className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
                        title="Opciones"
                    >
                        {isDeleting ? (
                            <Loader2 size={14} className="animate-spin text-[#0BA5C7]" />
                        ) : (
                            <MoreHorizontal size={14} />
                        )}
                    </button>
                    
                    {menuOpen && (
                        <PopoverMenu onClose={() => setMenuOpen(false)}>
                            <MenuButton 
                                icon={<Play size={14} />} 
                                label="Cargar" 
                                onClick={() => { onLoad(palette); setMenuOpen(false); }} 
                            />
                            <MenuButton 
                                icon={<Edit size={14} />} 
                                label="Renombrar" 
                                onClick={() => { setIsEditing(true); setMenuOpen(false); }} 
                            />
                            <MenuButton 
                                icon={<Copy size={14} />} 
                                label="Duplicar" 
                                onClick={() => { onDuplicate(palette); setMenuOpen(false); }} 
                            />
                            <MenuButton 
                                icon={<Download size={14} />} 
                                label="Exportar" 
                                onClick={() => { onExport(palette); setMenuOpen(false); }} 
                            />
                            <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-1" />
                            <MenuButton 
                                icon={<Trash2 size={14} className="text-rose-500" />} 
                                label="Eliminar" 
                                onClick={() => { onDelete(palette.id, palette.name); setMenuOpen(false); }}
                                className="text-rose-500 hover:bg-rose-500/10" 
                            />
                        </PopoverMenu>
                    )}
                </div>
            </div>
        </div>
    );
};

const SectionHeader = ({ 
    title, 
    items, 
    activeItemId, 
    onSelectItem, 
    onCreateItem, 
    onDeleteItem,
    onUpdateItem 
}) => {
    const [isOpen, setIsOpen] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [newItemName, setNewItemName] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editingName, setEditingName] = useState("");

    const handleAddNew = () => {
        if (newItemName.trim()) {
            onCreateItem(newItemName.trim());
            setNewItemName("");
            setIsAdding(false);
        }
    };

    const handleUpdate = () => {
        if (editingName.trim() && editingId) {
            onUpdateItem(editingId, editingName.trim());
            setEditingId(null);
        }
    };

    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 px-2 py-1">
                <button 
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-1.5 hover:text-zinc-900 dark:hover:text-white"
                >
                    <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-0' : '-rotate-90'}`} />
                    <span>{title}</span>
                </button>
                <button 
                    onClick={() => setIsAdding(true)}
                    className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    title={`Añadir ${title.slice(0, -1)}`}
                >
                    <Plus size={14} />
                </button>
            </div>
            
            {isOpen && (
                <div className="pl-3 pr-1 space-y-1">
                    {title === "Proyectos" && (
                         <button
                            onClick={() => onSelectItem(null)}
                            className={`w-full text-left px-3 py-1.5 text-xs rounded-xl transition-all ${!activeItemId ? 'font-bold bg-[#0BA5C7] text-white shadow-xs' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                        >
                            Todas las paletas
                        </button>
                    )}
                    
                    {items && items.map(item => (
                        <div
                            key={item.id}
                            className={`group flex items-center justify-between w-full text-left px-3 py-1.5 text-xs rounded-xl transition-all ${activeItemId === item.id ? 'font-bold bg-[#0BA5C7] text-white shadow-xs' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                        >
                            {editingId === item.id ? (
                                <input
                                    type="text"
                                    value={editingName}
                                    autoFocus
                                    onFocus={(e) => e.target.select()}
                                    onChange={(e) => setEditingName(e.target.value)}
                                    onBlur={handleUpdate}
                                    onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
                                    className="flex-1 p-0 m-0 bg-transparent border-b border-[#0BA5C7] focus:outline-none"
                                />
                            ) : (
                                <span className="flex-1 truncate cursor-pointer" onClick={() => onSelectItem(item.id)}>
                                    {item.name}
                                </span>
                            )}
                            
                            <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => { setEditingId(item.id); setEditingName(item.name); }}
                                    className="p-1 rounded-md hover:text-zinc-900 dark:hover:text-white"
                                    title="Renombrar"
                                >
                                    <Edit size={12} />
                                </button>
                                <button 
                                    onClick={() => onDeleteItem(item.id, item.name)}
                                    className="p-1 rounded-md text-rose-500 hover:bg-rose-500/10"
                                    title="Eliminar"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        </div>
                    ))}
                    
                    {isAdding && (
                        <div className="px-3 py-1">
                            <input
                                type="text"
                                value={newItemName}
                                autoFocus
                                onChange={(e) => setNewItemName(e.target.value)}
                                onBlur={handleAddNew}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddNew()}
                                placeholder={`Nuevo ${title.slice(0, -1)}...`}
                                className="w-full text-xs p-1.5 rounded-lg border bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-[#0BA5C7]"
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const MyPalettesSidebar = ({ 
    onClose, 
    palettes, 
    isLoading, 
    onLoadPalette, 
    onDeletePalette,
    onDuplicatePalette,
    onExportPalette,
    onUpdatePaletteName,
    deletingId,
    projects,
    collections,
    filters,
    setFilters,
    onCreateProject,
    onUpdateProject,
    onDeleteProject,
    onCreateCollection,
    onUpdateCollection,
    onDeleteCollection
}) => {
    const sidebarRef = useRef();
    useOnClickOutside(sidebarRef, onClose);

    const safeFilters = filters || { projectId: null, collectionId: null, style: null, color: null, search: '' };

    return (
        <>
            <div 
                className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden"
                onClick={onClose}
            />
            
            <aside
                ref={sidebarRef}
                className="fixed bottom-0 left-0 right-0 z-50 w-full max-h-[85vh] rounded-t-3xl md:rounded-t-none shadow-2xl transition-all
                           md:sticky md:top-[53px] md:h-[calc(100vh-53px)] md:max-h-[calc(100vh-53px)] md:w-80 lg:w-96 md:flex-shrink-0 md:z-10 border-t md:border-t-0 md:border-l
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
                            <FolderOpen size={18} className="text-[#0BA5C7]" />
                            Mis Paletas
                        </h2>
                        <button 
                            onClick={onClose} 
                            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="relative mb-3 flex-shrink-0">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input
                            type="text"
                            value={safeFilters.search}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            placeholder="Buscar por nombre..."
                            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0BA5C7]"
                        />
                    </div>

                    <div className="space-y-3 mb-3 flex-shrink-0 border-b border-zinc-200 dark:border-zinc-800 pb-3">
                        <SectionHeader 
                            title="Proyectos" 
                            items={projects}
                            activeItemId={safeFilters.projectId}
                            onSelectItem={(id) => setFilters(prev => ({ ...prev, projectId: id, collectionId: null }))}
                            onCreateItem={onCreateProject}
                            onUpdateItem={onUpdateProject}
                            onDeleteItem={onDeleteProject}
                        />
                        <SectionHeader 
                            title="Colecciones" 
                            items={collections}
                            activeItemId={safeFilters.collectionId}
                            onSelectItem={(id) => setFilters(prev => ({ ...prev, collectionId: id, projectId: null }))}
                            onCreateItem={onCreateCollection}
                            onUpdateItem={onUpdateCollection}
                            onDeleteItem={onDeleteCollection}
                        />
                    </div>

                    <div className="space-y-2 flex-grow overflow-y-auto pr-1">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12 text-zinc-400 gap-2">
                                <Loader2 size={18} className="animate-spin text-[#0BA5C7]" />
                                <span className="text-xs font-semibold">Cargando paletas...</span>
                            </div>
                        ) : palettes && palettes.length > 0 ? (
                            palettes.map(p => (
                                <PaletteCard
                                    key={p.id}
                                    palette={p}
                                    onLoad={onLoadPalette}
                                    onDelete={onDeletePalette}
                                    onDuplicate={onDuplicatePalette}
                                    onExport={onExportPalette}
                                    onUpdateName={onUpdatePaletteName}
                                    isDeleting={deletingId === p.id}
                                />
                            ))
                        ) : (
                            <div className="text-center py-12 px-4 text-zinc-400">
                                <FolderOpen size={36} className="mx-auto mb-2 opacity-40 text-zinc-400" />
                                <p className="text-xs font-semibold">No se encontraron paletas guardadas.</p>
                            </div>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
};

export default memo(MyPalettesSidebar);