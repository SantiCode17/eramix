# DESIGN_SYSTEM.md — European Glass

Sistema de diseño propio de EraMix. Este documento es la referencia vinculante para todas las decisiones de interfaz, color, tipografía, animación y componentes de la aplicación.

## 1. Paleta Cromática

### Colores Base

| Token | Hex / RGBA | Uso |
|-------|-----------|-----|
| `eu-deep` | `#003399` | Fondo base, navegación, headers |
| `eu-mid` | `#1A4DB3` | Superficies de nivel intermedio |
| `eu-light` | `#3366CC` | Acentos secundarios, estados activos |
| `eu-star` | `#FFCC00` | CTAs, énfasis máximo, estado positivo |
| `eu-orange` | `#FF6B2B` | Notificaciones, alertas, energía |

### Colores Glass

| Token | RGBA | Uso |
|-------|------|-----|
| `glass-white` | `rgba(255, 255, 255, 0.12)` | Superficies de vidrio sobre fondos oscuros |
| `glass-border` | `rgba(255, 255, 255, 0.15)` | Bordes sutiles de vidrio |
| `glass-border-mid` | `rgba(255, 255, 255, 0.25)` | Bordes intermedios |
| `glass-border-strong` | `rgba(255, 255, 255, 0.35)` | Bordes de alta visibilidad |

### Colores de Texto

| Token | RGBA | Uso |
|-------|------|-----|
| `text-primary` | `rgba(255, 255, 255, 0.95)` | Texto principal |
| `text-secondary` | `rgba(255, 255, 255, 0.65)` | Texto secundario, placeholders |
| `text-disabled` | `rgba(255, 255, 255, 0.35)` | Texto deshabilitado |

### Gradientes

| Token | Definición | Uso |
|-------|-----------|-----|
| `gradient-primary` | `#003399` → `#1A1A2E` diagonal | Fondo base de todas las pantallas |
| `gradient-accent` | `#FFCC00` → `#FF6B2B` | Botones primarios, insignias |

### Estados

| Token | Hex | Uso |
|-------|-----|-----|
| `status-success` | `#4CAF50` | Confirmaciones, éxito |
| `status-error` | `#F44336` | Errores, destrucción |
| `status-warning` | `#FF9800` | Advertencias |

## 2. Sistema Tipográfico

### Familias

- **Heading:** Space Grotesk Bold — Títulos y encabezados
- **Subheading:** Space Grotesk SemiBold — Subtítulos
- **Body:** Inter Regular — Texto de cuerpo
- **Body Medium:** Inter Medium — Énfasis en cuerpo
- **Body Bold:** Inter Bold — Énfasis fuerte

### Escala Tipográfica

| Nivel | Tamaño | Line Height | Peso | Uso |
|-------|--------|-------------|------|-----|
| H1 | 32px | 40px | 700 | Títulos principales de pantalla |
| H2 | 24px | 32px | 700 | Títulos de sección |
| H3 | 20px | 28px | 600 | Subtítulos |
| Body | 16px | 24px | 400 | Texto general |
| Body Medium | 16px | 24px | 500 | Texto con énfasis |
| Body Bold | 16px | 24px | 700 | Texto destacado |
| Caption | 14px | 20px | 400 | Etiquetas, metadata |
| Small | 12px | 16px | 400 | Texto auxiliar |
| Button | 16px | 24px | 600 | Texto de botones |

## 3. Glassmorphism

### Principios de Superficie de Vidrio

Todos los contenedores principales usan fondos translúcidos con las siguientes propiedades:

| Propiedad | Valor Estándar | Variante Prominente |
|-----------|---------------|-------------------|
| Background | `rgba(255, 255, 255, 0.12)` | `rgba(255, 255, 255, 0.18)` |
| Blur | `20px` | `30px` |
| Border | `1px solid rgba(255, 255, 255, 0.15)` | `1px solid rgba(255, 255, 255, 0.25)` |
| Border Radius | `16px` | `24px` |
| Shadow Layer 1 | `0 8px 32px rgba(0, 0, 0, 0.3)` | — |
| Shadow Layer 2 | `0 2px 8px rgba(0, 0, 0, 0.2)` | — |

### Reflejo Superior

Los componentes glass aplican un borde superior ligeramente más brillante (`rgba(255, 255, 255, 0.25)`) para simular refracción lumínica. Esto se implementa con `borderTopColor` más claro que `borderColor`.

### Liquid Glass (elementos de alta prominencia)

Botones primarios y cards de perfil incorporan animación de tensión superficial:
- Duración del ciclo: 3000ms
- Tipo: `Animated.loop` con `Animated.sequence`
- Transformación: escala sutil entre `1.0` y `1.02`
- Opacidad del overlay: oscilación entre `0.1` y `0.2`

## 4. Espaciado

### Sistema de Spacing Tokens

| Token | Valor |
|-------|-------|
| `xs` | 4px |
| `sm` | 8px |
| `md` | 16px |
| `lg` | 24px |
| `xl` | 32px |
| `xxl` | 48px |

### Border Radius

| Token | Valor | Uso |
|-------|-------|-----|
| `sm` | 8px | Inputs, chips |
| `md` | 12px | Cards pequeñas |
| `lg` | 16px | Cards principales |
| `xl` | 24px | Modals, sheets |
| `full` | 9999px | Avatares, badges |

## 5. Animaciones y Microinteracciones

### Duraciones Estándar

| Token | Duración | Uso |
|-------|----------|-----|
| `fast` | 150ms | Feedback táctil, hover states |
| `normal` | 300ms | Transiciones de pantalla, toggles |
| `slow` | 500ms | Animaciones de entrada, celebraciones |

### Curvas de Easing

| Tipo | Valor | Uso |
|------|-------|-----|
| Spring | `damping: 15, stiffness: 150, mass: 1` | Movimientos naturales, rebote |
| Ease Out | `Easing.out(Easing.cubic)` | Entradas de elementos |
| Ease In Out | `Easing.inOut(Easing.cubic)` | Transiciones entre estados |

### Tipos de Microinteracción

1. **Press feedback:** Escala a `0.96` + haptic `impactLight` (duración: `fast`)
2. **Entrada escalonada:** Cada elemento se retrasa `50ms` respecto al anterior, fade + translateY de `20px` a `0`
3. **Match aceptado:** Escala de `0` a `1.1` a `1.0` + haptic `notificationSuccess` + partículas (gradient-accent)
4. **Mensaje recibido:** Slide desde la derecha + fade in (duración: `normal`)
5. **Solicitud de amistad:** Bounce scale + glow animado con `eu-star`

### Transiciones entre Pantallas

- **Stack forward:** Slide horizontal desde la derecha, duración `300ms`
- **Stack back:** Slide horizontal hacia la derecha, duración `250ms`
- **Modal:** Slide vertical desde abajo con overlay fade, duración `350ms`
- **Tab switch:** Crossfade, duración `200ms`

## 6. Arte Urbano e Ilustración

### Principios de Integración

- Las ilustraciones con estética de arte callejero y graffiti se integran en: splash screen, onboarding, estados vacíos y fondos decorativos
- Paleta limitada a los colores de European Glass con variaciones de opacidad
- Estilo: líneas fluidas, tipografía street art, elementos geométricos con textura urbana
- Los elementos decorativos nunca interfieren con la legibilidad del contenido
- Opacidad máxima de elementos decorativos de fondo: 15-25%

### Ubicaciones Específicas

| Contexto | Estilo | Opacidad |
|----------|--------|----------|
| Splash Screen | Ilustración central con logotipo integrado | 100% (elemento central) |
| Onboarding | Ilustraciones temáticas por slide | 60-80% |
| Estados vacíos | Ilustración centrada con mensaje | 40-60% |
| Fondos decorativos | Patterns y texturas | 10-20% |

## 7. Principios UX

- **Un foco por pantalla:** Cada pantalla tiene un único elemento de máximo peso visual
- **Touch targets:** Mínimo 44×44 puntos en todos los elementos interactivos
- **Contraste:** WCAG AA mínimo para texto primario sobre cualquier fondo
- **Feedback inmediato:** < 100ms para todas las interacciones táctiles
- **Estados completos:** Loading, error y vacío diseñados con el mismo cuidado que los estados activos
- **Sin scroll horizontal** salvo en carruseles explícitamente diseñados

## 8. Modo Oscuro

European Glass es inherentemente dark-first. El soporte a modo oscuro del sistema operativo se implementa ajustando:

| Propiedad | Light Mode Override | Dark Mode (default) |
|-----------|-------------------|-------------------|
| Glass background | `rgba(0, 0, 0, 0.08)` | `rgba(255, 255, 255, 0.12)` |
| Glass border | `rgba(0, 0, 0, 0.12)` | `rgba(255, 255, 255, 0.15)` |
| Text primary | `rgba(0, 0, 0, 0.87)` | `rgba(255, 255, 255, 0.95)` |
| Text secondary | `rgba(0, 0, 0, 0.60)` | `rgba(255, 255, 255, 0.65)` |
| Gradient base | `#E8EEF7` → `#FFFFFF` | `#003399` → `#1A1A2E` |
