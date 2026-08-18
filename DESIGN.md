# DESIGN.md — Colores Dayam Design System & Impeccable Guidelines

## 1. Core Visual Principles
- **Color Studio Aesthetic**: Las superficies neutras no son gris puro (#808080); tienen un tinte cromatico sutil adaptativo.
- **Jerarquía Visual Clara**: Uso de *Plus Jakarta Sans* / *Outfit* para títulos prominentes y *Inter* para interfaz/lectura.
- **Glassmorphism & Elevación**: Capas flotantes con `backdrop-blur-md`, bordes sutiles con opacidad reducida (`border-white/10` o `border-slate-200/60`).
- **Anti-Patrones Prohibidos (Impeccable Rules)**:
  - NO usar Inter para absolutamente todo.
  - NO anidar tarjetas dentro de tarjetas sin diferenciación de jerarquía.
  - NO usar texto gris sobre fondos de color saturado (siempre usar alto contraste).
  - NO usar bordes negros duros de 1px sin suavizado.
  - NO dejar botones interactivos sin estado `hover`, `active` o `focus-visible`.

## 2. Accessibility (a11y) Standards
- **Móvil (Touch Target)**: Todo botón o control táctil debe tener un área de interacción mínima de `44x44px` (`min-h-[44px] min-w-[44px]`).
- **Anillos de Foco (Focus Rings)**: Todos los elementos interactivos incluyen `focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 focus-visible:outline-none`.
- **Lectores de Pantalla (Screen Readers)**: Etiquetado explícito con `aria-label`, `aria-expanded`, `aria-controls` y títulos `sr-only` para iconos sin texto visible.
- **Títulos Adaptativos**: Títulos concisos en móviles para optimizar el espacio útil y títulos extensos explicativos en escritorio.

## 3. Responsive Layout Strategy
- **Móvil (< 640px)**:
  - Navegación fija inferior/flotante de fácil acceso con el pulgar.
  - Modales convertidos en **Bottom Sheets** deslizantes con tirador visual (*drag handle*).
  - Swatches de color apilados verticalmente o en cuadrícula responsiva fluida.
- **Escritorio (>= 768px)**:
  - Barra superior horizontal con botones agrupados por contexto.
  - Diálogos centrados con fondo desenfocado y animaciones sutiles.
