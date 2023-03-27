/**
 * @template T, U
 * @param {T} value
 * @param {(value: T) => U} render
 * @returns {() => U}
 */
export const makeLazy = (value, render) => {
  let rendered = false;
  /** @type {U} */
  let ret;
  return () => {
    if (rendered) {
      return ret;
    } else {
      ret = render(value);
      rendered = true;
      return ret;
    }
  };
};

/**
 * @typedef {{ tag: string }} HasTag
 */

/**
 * Creates a pattern matching function.
 *
 * @template {HasTag} T
 * @template U
 * @param {Record<string, (value: any) => U>} patterns - An object containing patterns as functions.
 * @returns {(value: T) => U} A function that takes a value and applies the corresponding pattern to it.
 */
export const match = (patterns) => (value) => {
  const pattern = patterns[value.tag] || patterns._;
  if (typeof pattern === 'function') {
    return pattern(value);
  } else {
    throw new Error(`No matching pattern for value: ${JSON.stringify(value)}`);
  }
};
