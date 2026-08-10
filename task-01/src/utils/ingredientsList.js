/**
 * Ingredient rows shown on the card back's "INGREDIENTS (PER BUILDER)" table.
 * Percentages are user-customizable via sliders on the form; barClass maps
 * to the color modifiers already defined on .bar-fill in cardStyles.css.
 */
export const INGREDIENTS = [
  { key: 'shipVelocity', label: 'SHIP VELOCITY', defaultValue: 62, barClass: '' },
  { key: 'chaos', label: 'CONTROLLED CHAOS', defaultValue: 18, barClass: 'p' },
  { key: 'coffee', label: 'BLACK COFFEE (ARABICA)', defaultValue: 10, barClass: 'y' },
  { key: 'sunlight', label: 'GOA SUNLIGHT (UV-GRADE)', defaultValue: 7, barClass: 'g' },
  { key: 'ideas', label: 'QUESTIONABLE IDEAS (TRACE)', defaultValue: 3, barClass: 'b' },
];

export const DEFAULT_INGREDIENTS = Object.fromEntries(
  INGREDIENTS.map((ingredient) => [ingredient.key, ingredient.defaultValue])
);

export default INGREDIENTS;
