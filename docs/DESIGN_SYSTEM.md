# 🇪🇺 European Glass — Design System v2.0

> Sistema de diseño propietario de **EraMix**. Glassmorphism como identidad central.  
> Versión 2.0 · Abril 2026

---

## 1. Filosofía

European Glass transforma la interfaz de EraMix en una experiencia visual que evoca el cristal europeo: superficies translúcidas con profundidad, reflejos sutiles y movimiento líquido. Cada píxel comunica **sofisticación, juventud y conectividad**.

**Tres pilares:**
1. **Glassmorphism** — Fondos translúcidos, blur pronunciado, bordes luminosos
2. **Liquid Glass** — Elementos de alta prominencia con movimiento interno
3. **Arte Urbano** — Ilustraciones con estética street art europea

---

## 2. Paleta Cromática

### Colores EU Base
| Token | Hex | Uso |
|-------|-----|-----|
| `eu.deep` | `#003399` | Fondos base, navegación, headers |
| `eu.mid` | `#1A4DB3` | Superficies nivel intermedio |
| `eu.light` | `#3366CC` | Acentos secundarios, estados activos |
| `eu.star` | `#FFD700` | CTA, énfasis máximo, estrellas EU |
| `eu.orange` | `#FF6B2B` | Notificaciones, alertas, energía |

### Superficies Glass
| Token | Valor | Uso |
|-------|-------|-----|
| `glass.white` | `rgba(255,255,255,0.08)` | Superficie base |
| `glass.whiteMid` | `rgba(255,255,255,0.14)` | Superficie elevada |
| `glass.whiteStrong` | `rgba(255,255,255,0.22)` | Superficie prominente |

### Texto
| Token | Valor |
|-------|-------|
| `text.primary` | `rgba(255,255,255,0.95)` |
| `text.secondary` | `rgba(255,255,255,0.60)` |
| `text.tertiary` | `rgba(255,255,255,0.40)` |
| `text.accent` | `#FFD700` |

---

## 3. Tipografía

- **Headings:** Space Grotesk 700 Bold
- **Subheadings:** Space Grotesk 600 SemiBold
- **Body:** Inter 400 Regular
- **Body Medium:** Inter 500 Medium

---

## 4. Glassmorphism Spec

- Blur surface: 20px | elevated: 40px | prominent: 60px | overlay: 80px
- Border highlight top para efecto refracción
- Ningún elemento principal tiene fondo sólido opaco

## 5. Liquid Glass Effect

Botones CTA y cards de perfil: superficie con movimiento interno sutil mediante Animated.Value encadenadas.

## 6. Animaciones

- Feedback < 100ms | Spring presets: default, bouncy, snappy, gentle
- Staggered entries: 60ms entre items
- Press: scale 0.965 + haptic

## 7. UX No Negociable

1. Jerarquía visual clara por pantalla
2. Touch targets mínimo 44×44
3. Contraste WCAG AA
4. Estados: loading, error, vacío diseñados
5. Sin scroll horizontal (excepto carruseles)

---

*European Glass es la identidad visual de EraMix.*
