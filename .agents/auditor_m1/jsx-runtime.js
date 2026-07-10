export function jsx(type, props, key) {
  if (typeof type === 'function') {
    return type(props);
  }
  return { type, props, key };
}
export const jsxs = jsx;
export const Fragment = 'Symbol(React.Fragment)';
