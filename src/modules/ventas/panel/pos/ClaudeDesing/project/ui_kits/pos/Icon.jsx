// ─── Icon ───────────────────────────────────────────────────────────────────
// Builds a Lucide line icon from window.lucide.icons node data.
// Matches Orbita's icon treatment: strokeWidth 1.5, currentColor, line style.
// Usage: <Icon name="credit-card" size={18} />  (kebab-case OR PascalCase)

function toPascal(name) {
  return name.replace(/(^\w|-\w)/g, s => s.replace('-', '').toUpperCase());
}

function Icon({ name, size = 18, strokeWidth = 1.5, color = 'currentColor', style }) {
  const lib = (window.lucide && window.lucide.icons) || {};
  const key = lib[name] ? name : toPascal(name);
  let node = lib[key];

  // Some lucide builds wrap the node array; normalize to an array of [tag, attrs].
  if (node && !Array.isArray(node) && node.iconNode) node = node.iconNode;
  const parts = Array.isArray(node) ? node : [];

  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, display: 'block', ...style }}
    >
      {parts.map(([tag, attrs], i) => React.createElement(tag, { key: i, ...attrs }))}
    </svg>
  );
}

window.Icon = Icon;
