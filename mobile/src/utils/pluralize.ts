/**
 * ════════════════════════════════════════════════════
 *  pluralize — Helper global de pluralización
 *  Uso: pluralize(count, 'estudiante', 'estudiantes')
 * ════════════════════════════════════════════════════
 */

/**
 * Returns a pluralized string based on the count.
 * @example pluralize(1, 'miembro', 'miembros') → "1 miembro"
 * @example pluralize(5, 'evento', 'eventos') → "5 eventos"
 */
export const pluralize = (
  count: number,
  singular: string,
  plural: string,
): string => (count === 1 ? `1 ${singular}` : `${count} ${plural}`);

/**
 * Same as pluralize but returns only the noun without the count.
 * @example pluralizeNoun(1, 'miembro', 'miembros') → "miembro"
 */
export const pluralizeNoun = (
  count: number,
  singular: string,
  plural: string,
): string => (count === 1 ? singular : plural);
