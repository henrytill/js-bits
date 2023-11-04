// @ts-check

/**
 * @typedef {Object} Test
 * @property {string} description
 * @property {(() => void) | (() => Promise<void>)} run
 */

/**
 * @param {string} description
 * @param {(() => void) | (() => Promise<void>)} run
 * @returns {Test}
 */
export const makeTest = (description, run) => {
  return { description, run };
};

/**
 * @param {HTMLElement} resultDiv
 * @param {string} description
 * @returns {HTMLElement}
 */
const addSuccess = (resultDiv, description) => {
  resultDiv.textContent = `${description}: PASSED`;
  resultDiv.className = 'passed';
  return resultDiv;
};

/**
 * @param {HTMLElement} resultDiv
 * @param {string} description
 * @param {any} err
 * @returns {HTMLElement}
 */
const addFailure = (resultDiv, description, err) => {
  if (err instanceof Error) {
    resultDiv.textContent = `${description}: FAILED - ${err.message}`;
    resultDiv.className = 'failed';
    if (err.stack !== undefined) {
      const stackTrace = document.createElement('pre');
      stackTrace.textContent = err.stack;
      resultDiv.appendChild(stackTrace);
    }
  } else {
    resultDiv.textContent = `${description}: FAILED - ${err}`;
    resultDiv.className = 'failed';
  }
  return resultDiv;
};

/**
 * @param {Test[]} tests
 * @param {HTMLElement} resultsDiv
 * @returns {Promise<void>}
 */
export const runner = async (tests, resultsDiv) => {
  if (resultsDiv === null) {
    throw new Error('No test results div found');
  }
  for (const testObj of tests) {
    const resultDiv = document.createElement('div');
    const description = testObj.description;
    try {
      await testObj.run();
      addSuccess(resultDiv, description);
    } catch (e) {
      addFailure(resultDiv, description, e);
    }
    resultsDiv.appendChild(resultDiv);
  }
};

/**
 * @param {boolean} expression
 * @param {string} [message]
 * @throws {Error}
 * @returns {void}
 */
export const assert = (expression, message) => {
  if (!expression) {
    throw new Error(message || 'Assertion failed');
  }
};

/**
 * Deeply compares two values for equality.
 *
 * @param {any} a
 * @param {any} b
 * @returns {boolean}
 */
export const deepEquals = (a, b) => {
  /** @type {[any, any][]} */
  const stack = [[a, b]];

  while (stack.length > 0) {
    const maybeTuple = stack.pop();
    if (maybeTuple === undefined) {
      return false;
    }
    const [x, y] = maybeTuple;
    if (x === y) {
      continue;
    }
    if (x == null || y == null) {
      return false;
    }
    if (typeof x !== typeof y) {
      return false;
    }
    if (typeof x === 'object') {
      if (Object.keys(x).length !== Object.keys(y).length) {
        return false;
      }
      for (const key in x) {
        stack.push([x[key], y[key]]);
      }
    }
    if (Array.isArray(x)) {
      if (x.length !== y.length) {
        return false;
      }
      for (let i = 0; i < x.length; i++) {
        stack.push([x[i], y[i]]);
      }
    }
  }

  return true;
};
