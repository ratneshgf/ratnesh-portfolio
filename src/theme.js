// Three.js requires resolved colors rather than CSS var() expressions.
// Read the shared stylesheet palette once when the lazy scene modules load.
const styles = getComputedStyle(document.documentElement)
export const sceneColors = Object.fromEntries(
  ['red-deep', 'red-dark', 'text-secondary', 'text-muted', 'green-dark'].map((token) => [token, styles.getPropertyValue('--' + token).trim()]),
)
