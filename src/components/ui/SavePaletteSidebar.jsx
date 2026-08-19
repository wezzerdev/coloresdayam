import React, { memo, useRef, useEffect, useState } from 'react';
import { X, Loader2, Plus, ChevronDown, Save } from 'lucide-react';

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

const ItemSelector = ({ 
    label, 
    items, 
    selectedId, 
    onSelect, 
    onCreate 
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [newItemName, setNewItemName] = useState("");
    const dropdownRef = useRef(null);

    const selectedItemName = items.find(item => item.id === selectedId)?.name || `Seleccionar ${label}`;

    const handleCreate = () => {
        if (newItemName.trim()) {
            onCreate(newItemName.trim());
            setNewItemName("");
            setIsAdding(false);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <label className="text-xs font-semibold mb-1.5 block text-zinc-700 dark:text-zinc-300">
                {label}
            </label>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center text-left p-2.5 rounded-xl border text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
            >
                <span className="truncate">{selectedItemName}</span>
                <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
            </button>
            
            {isOpen && (
                <div 
                    className="absolute z-10 top-full mt-1.5 w-full max-h-52 overflow-y-auto p-1.5 rounded-xl border shadow-xl bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
                >
                    <button
                        type="button"
                        onClick={() => { onSelect(null); setIsOpen(false); }}
                        className="w-full text-left px-3 py-1.5 text-xs rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                    >
                        Ninguno
                    </button>
                    {items.map(item => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => { onSelect(item.id); setIsOpen(false); }}
                            className={`w-full text-left px-3 py-1.5 text-xs rounded-lg ${selectedId === item.id ? 'font-bold bg-[#0BA5C7] text-white' : 'hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100'}`}
                        >
                            {item.name}
                        </button>
                    ))}
                    <div className="h-px bg-zinc-200 dark:bg-zinc-700 my-1" />
                    {isAdding ? (
                        <div className="p-1.5">
                            <input
                                type="text"
                                value={newItemName}
                                autoFocus
                                onChange={(e) => setNewItemName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                                placeholder={`Nuevo ${label}...`}
                                className="w-full text-xs p-1.5 bg-transparent border-b border-[#0BA5C7] focus:outline-none text-zinc-900 dark:text-zinc-100"
                            />
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={() => setIsAdding(true)}
                            className="w-full text-left px-3 py-1.5 text-xs rounded-lg flex items-center gap-1.5 text-[#0BA5C7] font-semibold"
                        >
                            <Plus size={14} /> Crear nuevo
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

const TagManager = ({ 
    allTags, 
    selectedTagNames, 
    onTagNamesChange, 
    onCreateTag 
}) => {
    const [inputValue, setInputValue] = useState("");
    
    const handleAddTag = (tagName) => {
        const name = tagName.trim();
        if (name && !selectedTagNames.includes(name)) {
            onTagNamesChange([...selectedTagNames, name]);
            onCreateTag(name);
        }
        setInputValue("");
    };
    
    const handleRemoveTag = (tagToRemove) => {
        onTagNamesChange(selectedTagNames.filter(tag => tag !== tagToRemove));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            handleAddTag(inputValue);
        }
    };
    
    return (
        <div>
            <label className="text-xs font-semibold mb-1.5 block text-zinc-700 dark:text-zinc-300">
                Etiquetas
            </label>
            <div 
                className="w-full flex flex-wrap items-center gap-1.5 p-2 rounded-xl border bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
            >
                {selectedTagNames.map(tag => (
                    <div 
                        key={tag} 
                        className="flex items-center gap-1 bg-[#0BA5C7]/20 text-[#0BA5C7] dark:text-[#0BA5C7] text-xs font-bold px-2 py-0.5 rounded-lg border border-[#0BA5C7]/30"
                    >
                        <span>{tag}</span>
                        <button type="button" onClick={() => handleRemoveTag(tag)}>
                            <X size={12} />
                        </button>
                    </div>
                ))}
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={() => handleAddTag(inputValue)}
                    placeholder="Añadir tag..."
                    className="flex-1 bg-transparent p-1 focus:outline-none text-xs text-zinc-900 dark:text-zinc-100"
                />
            </div>
        </div>
    );
};

const SavePaletteSidebar = ({ 
    onClose, 
    onSave, 
    isSaving, 
    initialName,
    currentPaletteId,
    projects,
    collections,
    tags, 
    onCreateProject,
    onCreateCollection,
    onCreateTag 
}) => {
    const sidebarRef = useRef();
    useOnClickOutside(sidebarRef, onClose);

    const [name, setName] = useState(initialName || "Mi Nueva Paleta");
    const [description, setDescription] = useState("");
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [selectedCollectionId, setSelectedCollectionId] = useState(null);
    const [selectedTagNames, setSelectedTagNames] = useState([]);

    useEffect(() => {
        setName(initialName || "Mi Nueva Paleta");
    }, [initialName, currentPaletteId]);

    const handleSaveClick = (e) => {
        e.preventDefault();
        onSave({
            name: name.trim() || "Paleta Sin Título",
            description: description.trim(),
            projectId: selectedProjectId,
            collectionId: selectedCollectionId,
            tags: selectedTagNames
        });
    };

    return (
        <>
            <div 
                className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden"
                onClick={onClose}
            />
            
            <aside
                ref={sidebarRef}
                className="fixed bottom-0 left-0 right-0 z-50 w-full max-h-[85vh] rounded-t-3xl md:rounded-t-none shadow-2xl transition-transform transform
                           md:transform-none md:relative md:w-80 lg:w-96 md:flex-shrink-0 md:sticky md:top-0 md:max-h-full md:z-10 border-t md:border-t-0 md:border-l
                           bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100"
            >
                <form 
                    className="h-full px-5 py-4 overflow-y-auto flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onSubmit={handleSaveClick}
                >
                    <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-4 md:hidden flex-shrink-0" />
                    
                    <div className="flex justify-between items-center mb-4 flex-shrink-0">
                        <h2 className="text-base font-extrabold font-heading flex items-center gap-2 text-zinc-900 dark:text-white uppercase tracking-tight">
                            <Save size={18} className="text-[#0BA5C7]" />
                            {currentPaletteId ? "Actualizar Paleta" : "Guardar Paleta"}
                        </h2>
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="space-y-3.5 flex-grow overflow-y-auto pr-0.5">
                        <div>
                            <label htmlFor="palette-name" className="text-xs font-semibold mb-1.5 block text-zinc-700 dark:text-zinc-300">
                                Nombre
                            </label>
                            <input
                                id="palette-name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Mi Nueva Paleta"
                                required
                                className="w-full p-2.5 rounded-xl border text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0BA5C7]"
                            />
                        </div>

                        <div>
                            <label htmlFor="palette-desc" className="text-xs font-semibold mb-1.5 block text-zinc-700 dark:text-zinc-300">
                                Descripción (Opcional)
                            </label>
                            <textarea
                                id="palette-desc"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={2}
                                placeholder="Una breve descripción..."
                                className="w-full p-2.5 rounded-xl border text-xs bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#0BA5C7]"
                            />
                        </div>
                        
                        <ItemSelector
                            label="Proyecto"
                            items={projects}
                            selectedId={selectedProjectId}
                            onSelect={setSelectedProjectId}
                            onCreate={onCreateProject}
                        />
                        
                        <ItemSelector
                            label="Colección"
                            items={collections}
                            selectedId={selectedCollectionId}
                            onSelect={setSelectedCollectionId}
                            onCreate={onCreateCollection}
                        />
                        
                        <TagManager
                            allTags={tags}
                            selectedTagNames={selectedTagNames}
                            onTagNamesChange={setSelectedTagNames}
                            onCreateTag={onCreateTag}
                        />
                    </div>

                    <div className="flex gap-2.5 pt-4 border-t border-zinc-200 dark:border-zinc-800 mt-4 flex-shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 font-extrabold py-2.5 px-4 rounded-xl text-xs text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700/60 transition-all active:scale-95"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex-1 font-extrabold py-2.5 px-4 rounded-xl text-xs text-white bg-[#0BA5C7] hover:bg-[#0993B3] shadow-md shadow-[#0BA5C7]/20 flex items-center justify-center gap-1.5 disabled:opacity-50 active:scale-95 transition-all"
                        >
                            {isSaving ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                currentPaletteId ? "Actualizar" : "Guardar"
                            )}
                        </button>
                    </div>
                </form>
            </aside>
        </>
    );
};

export default memo(SavePaletteSidebar);