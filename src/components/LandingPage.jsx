import React, { useState, useEffect } from 'react';
import { Palette, Feather, Zap, LogIn, User, UserPlus, ArrowRight, Mouse, Code, CheckCircle, Image as ImageIcon, TestTube2, ShieldCheck, Sun, Moon } from 'lucide-react';


// Componente para las formas abstractas del fondo con efecto parallax
const ParallaxShape = ({ className, speed = 0.1 }) => {
    const [offsetY, setOffsetY] = useState(0);
    const handleScroll = () => setOffsetY(window.pageYOffset);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div 
            className={`absolute -z-10 rounded-full bg-gradient-to-br opacity-15 dark:opacity-25 filter blur-3xl ${className}`} 
            style={{ transform: `translateY(${offsetY * speed}px)` }}
        />
    );
};

// Componente de tarjeta de característica mejorado
const FeatureCard = ({ icon, title, children }) => (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full">
        <div className="flex items-center gap-4 mb-3">
            <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {icon}
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white font-heading">{title}</h3>
        </div>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">{children}</p>
    </div>
);


const LandingPage = ({ onNavigate, onToggleTheme, theme }) => {
    const isDarkMode = theme === 'dark';

    return (
        <div 
            className="w-full flex flex-col relative text-zinc-900 dark:text-zinc-100 font-sans overflow-hidden transition-colors duration-200"
            style={{ backgroundColor: isDarkMode ? '#09090b' : '#ffffff', color: isDarkMode ? '#f4f4f5' : '#09090b' }}
        >

            {/* Fondos Neutros con destellos estilo Supabase (Verde Esmeralda + Cian + Azul) */}
            <ParallaxShape className="from-emerald-500/20 via-teal-500/15 to-blue-600/20 w-96 h-96 top-10 left-[-10rem]" speed={0.2} />
            <ParallaxShape className="from-blue-600/15 via-cyan-500/15 to-emerald-500/20 w-[30rem] h-[30rem] top-[35rem] right-[-15rem]" speed={0.15} />

            {/* Header */}
            <header className="sticky top-0 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl z-20 border-b border-zinc-200 dark:border-zinc-800/90 transition-colors duration-200">
                <nav className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-3.5">
                    <div 
                        className="flex items-center gap-3 cursor-pointer group"
                        onClick={() => onNavigate('landing')}
                    >
                        <div className="h-10 w-10 rounded-2xl supabase-gradient text-white flex items-center justify-center p-2 group-hover:scale-105 transition-transform shadow-md shadow-emerald-500/20">
                            <Palette size={22} strokeWidth={2} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-heading font-extrabold text-lg tracking-tight text-zinc-900 dark:text-white block uppercase">
                                    COLORES DAYAM
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                    v3.1
                                </span>
                            </div>
                            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 tracking-wider uppercase block font-semibold">Color Studio Pro</span>
                        </div>
                    </div>

                    
                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* Conmutador de tema claro / oscuro */}
                        <button
                            type="button"
                            onClick={onToggleTheme}
                            className="p-2.5 rounded-xl text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition-colors flex items-center gap-1.5 text-xs font-semibold"
                            title={isDarkMode ? "Cambiar a Modo Claro" : "Cambiar a Modo Oscuro"}
                        >
                            {isDarkMode ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-zinc-700" />}
                        </button>

                        <button
                            type="button"
                            onClick={() => onNavigate('auth')}
                            className="text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-xl text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                            Iniciar Sesión
                        </button>
                        <button
                            type="button"
                            onClick={() => onNavigate('auth')}
                            className="touch-target text-xs sm:text-sm font-extrabold px-4 py-2 rounded-xl text-white supabase-gradient supabase-gradient-hover shadow-md shadow-emerald-500/20 transition-all transform hover:scale-[1.02] focus-ring flex items-center gap-1.5"
                        >
                            <User size={16} />
                            <span>Crear Cuenta</span>
                        </button>
                    </div>
                </nav>
            </header>

            
            <div className="flex-grow">
                {/* Hero Section */}
                <main className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-28 text-center">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold mb-6">
                        <Zap size={14} />
                        <span>Supabase-Style Color Studio System</span>
                    </div>
                    <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight font-heading max-w-4xl mx-auto">
                        Crea Sistemas de Color <br />
                        <span className="text-rainbow-gradient">Impresionantes y Accesibles</span>
                    </h1>
                    <p className="mt-6 max-w-2xl mx-auto text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
                        Genera, audita accesibilidad WCAG y exporta paletas de color armónicas para web, iOS y Android en segundos con inteligencia cromática.
                    </p>
                    <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button 
                            type="button"
                            onClick={() => onNavigate('generator')}
                            className="touch-target w-full sm:w-auto text-base font-extrabold text-white supabase-gradient supabase-gradient-hover px-8 py-3.5 rounded-2xl transition-all transform hover:scale-[1.02] flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/25 focus-ring"
                        >
                            <span>Explorar Estudio de Color</span>
                            <ArrowRight size={20} />
                        </button>
                    </div>
                </main>


                {/* NUEVA SECCIÓN: Muestra de la Galería de Paletas */}
                <section className="relative z-10 py-20">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl sm:text-5xl font-extrabold text-zinc-900 dark:text-white font-heading">Infinitas Posibilidades de Color</h2>
                        <p className="mt-4 max-w-2xl mx-auto text-zinc-600 dark:text-zinc-400 text-sm sm:text-base">De tonos pastel suaves a neones vibrantes, encuentra la inspiración que necesitas.</p>
                    </div>
                    {/* Animación de scroll infinito con paletas de ejemplo */}
                    <div className="relative h-48 [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)] group">
                        <div className="absolute top-0 flex items-center animate-scroll group-hover:pause">
                             {[...Array(2)].map((_, i) => (
                                <div key={i} className="flex-shrink-0 flex items-center justify-around w-max mx-4">
                                    <div className="w-48 h-32 rounded-xl flex overflow-hidden shadow-lg mx-4"><div className="w-full h-full bg-[#fecaca]"></div><div className="w-full h-full bg-[#fca5a5]"></div><div className="w-full h-full bg-[#ef4444]"></div><div className="w-full h-full bg-[#b91c1c]"></div></div>
                                    <div className="w-48 h-32 rounded-xl flex overflow-hidden shadow-lg mx-4"><div className="w-full h-full bg-[#dbeafe]"></div><div className="w-full h-full bg-[#93c5fd]"></div><div className="w-full h-full bg-[#3b82f6]"></div><div className="w-full h-full bg-[#1e40af]"></div></div>
                                    <div className="w-48 h-32 rounded-xl flex overflow-hidden shadow-lg mx-4"><div className="w-full h-full bg-[#d1fae5]"></div><div className="w-full h-full bg-[#6ee7b7]"></div><div className="w-full h-full bg-[#10b981]"></div><div className="w-full h-full bg-[#047857]"></div></div>
                                    <div className="w-48 h-32 rounded-xl flex overflow-hidden shadow-lg mx-4"><div className="w-full h-full bg-[#f5d0fe]"></div><div className="w-full h-full bg-[#e879f9]"></div><div className="w-full h-full bg-[#c026d3]"></div><div className="w-full h-full bg-[#86198f]"></div></div>
                                    <div className="w-48 h-32 rounded-xl flex overflow-hidden shadow-lg mx-4"><div className="w-full h-full bg-[#fef3c7]"></div><div className="w-full h-full bg-[#fcd34d]"></div><div className="w-full h-full bg-[#f59e0b]"></div><div className="w-full h-full bg-[#b45309]"></div></div>
                                    <div className="w-48 h-32 rounded-xl flex overflow-hidden shadow-lg mx-4"><div className="w-full h-full bg-[#ccfbf1]"></div><div className="w-full h-full bg-[#5eead4]"></div><div className="w-full h-full bg-[#0d9488]"></div><div className="w-full h-full bg-[#0f766e]"></div></div>
                                </div>
                             ))}
                        </div>
                    </div>
                </section>


                {/* Features Section Ampliada */}
                <section id="features" className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-20">
                     <div className="text-center mb-16">
                         <h2 className="text-3xl sm:text-5xl font-extrabold text-zinc-900 dark:text-white font-heading">Un Conjunto de Herramientas de Diseño Completo</h2>
                         <p className="mt-4 max-w-3xl mx-auto text-zinc-600 dark:text-zinc-400">Colores Dayam está diseñado para acelerar tu flujo de trabajo, desde la concepción de la idea hasta la implementación final.</p>
                    </div>
                     <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard icon={<Zap size={24} />} title="Generación con IA">
                            Describe un concepto como "atardecer en el bosque" y deja que la IA cree una paleta de colores única para ti.
                        </FeatureCard>
                        <FeatureCard icon={<ImageIcon size={24} />} title="Extractor de Imágenes">
                            Sube cualquier imagen y extrae automáticamente su paleta de colores para usarla como punto de partida.
                        </FeatureCard>
                        <FeatureCard icon={<Palette size={24} />} title="Armonías de Color">
                            Genera paletas basadas en reglas de la teoría del color como análogas, complementarias, triádicas y más.
                        </FeatureCard>
                        <FeatureCard icon={<TestTube2 size={24} />} title="Previsualización en Vivo">
                           Mira cómo se ven tus colores aplicados a componentes de UI reales antes de exportar, en modo claro y oscuro.
                        </FeatureCard>
                         <FeatureCard icon={<ShieldCheck size={24} />} title="Análisis de Accesibilidad">
                            Comprueba al instante los ratios de contraste de tu paleta para asegurar que tu diseño sea legible para todos.
                        </FeatureCard>
                         <FeatureCard icon={<Feather size={24} />} title="Exportación Flexible">
                            Obtén tu código listo para copiar y pegar en Power Fx, CSS con variables, o como una extensión de Tailwind.
                        </FeatureCard>
                    </div>
                </section>
                
                {/* How it Works Section */}
                <section className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl sm:text-5xl font-extrabold text-zinc-900 dark:text-white leading-tight font-heading">De la Idea al Código en 3 Simples Pasos</h2>
                            <p className="mt-4 text-zinc-600 dark:text-zinc-400">Nuestro flujo de trabajo intuitivo te permite concentrarte en la creatividad mientras nosotros nos encargamos de la parte técnica.</p>
                            <ul className="mt-8 space-y-6">
                                <li className="flex items-start gap-4">
                                    <div className="bg-blue-100 dark:bg-blue-900/40 p-3 rounded-xl text-blue-600 dark:text-blue-400"><span className="font-bold text-xl">1</span></div>
                                    <div>
                                        <h4 className="font-bold text-zinc-900 dark:text-white">Genera tu Paleta Base</h4>
                                        <p className="text-zinc-600 dark:text-zinc-400 text-sm">Usa nuestras herramientas inteligentes (IA, imagen, aleatorio) para obtener una paleta inicial armónica.</p>
                                    </div>
                                </li>
                                 <li className="flex items-start gap-4">
                                    <div className="bg-emerald-100 dark:bg-emerald-900/40 p-3 rounded-xl text-emerald-600 dark:text-emerald-400"><span className="font-bold text-xl">2</span></div>
                                    <div>
                                        <h4 className="font-bold text-zinc-900 dark:text-white">Ajusta y Previsualiza</h4>
                                        <p className="text-zinc-600 dark:text-zinc-400 text-sm">Refina tu paleta, comprueba la accesibilidad y mira cómo se ve en componentes de UI reales.</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <div className="bg-sky-100 dark:bg-sky-900/40 p-3 rounded-xl text-sky-600 dark:text-sky-400"><span className="font-bold text-xl">3</span></div>
                                    <div>
                                        <h4 className="font-bold text-zinc-900 dark:text-white">Copia y Pega el Código</h4>
                                        <p className="text-zinc-600 dark:text-zinc-400 text-sm">Exporta el sistema de diseño completo en el formato que necesites y acelera tu desarrollo.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-2xl">
                           <div className="flex items-center gap-2 mb-4">
                               <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                               <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                               <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                           </div>
                            <pre className="font-mono text-sm text-blue-300 bg-transparent overflow-x-auto">
                                <code>
{`ClearCollect(
    colDesignSystem,
    {
        Tema: "Claro",
        Colores: {
            Marca: {
                t0: ColorValue("#032A3A"),
                ...
            },
            Acciones: {
                Primario: ColorValue("#009FDB"),
                ...
            }
        }
    }
);`}
                                </code>
                            </pre>
                        </div>
                    </div>
                </section>

                {/* Final CTA Section */}
                <section className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                     <h2 className="text-3xl sm:text-5xl font-extrabold text-zinc-900 dark:text-white font-heading">¿Listo para Crear?</h2>
                     <p className="mt-4 max-w-xl mx-auto text-zinc-600 dark:text-zinc-400">Únete a cientos de desarrolladores que ya están creando mejores interfaces, más rápido.</p>
                     <div className="mt-8">
                        <button 
                            onClick={() => onNavigate('generator')}
                            className="text-lg font-extrabold text-white bg-blue-600 hover:bg-blue-500 px-8 py-4 rounded-2xl transition-transform transform hover:scale-105 flex items-center gap-3 shadow-xl shadow-blue-600/30 mx-auto"
                        >
                            <span>Empieza Gratis Ahora</span>
                            <ArrowRight size={20} />
                        </button>
                    </div>
                </section>
            </div>


             {/* Footer */}
            <footer className="border-t border-zinc-200 dark:border-zinc-800 relative z-10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
                    <p>&copy; {new Date().getFullYear()} Colores Dayam — Color Studio Pro.</p>
                    
                    <div className="mt-4 flex justify-center items-center gap-3">
                      <button 
                        onClick={() => onNavigate('privacy')}
                        className="text-xs text-zinc-500 dark:text-zinc-400 hover:underline"
                      >
                        Política de Privacidad
                      </button>
                      <span className="text-zinc-400">|</span>
                      <button 
                        onClick={() => onNavigate('terms')}
                        className="text-xs text-zinc-500 dark:text-zinc-400 hover:underline"
                      >
                        Términos y Condiciones
                      </button>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;