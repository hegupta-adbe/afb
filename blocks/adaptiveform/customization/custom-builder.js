// eslint-disable-next-line import/no-cycle
import { createLabel as cl } from '../libs/default-builder.js';

/**
 * Example of overriding to inlcude start
 * @param {*} state
 * @param {*} bemBlock
 * @returns
 */
// eslint-disable-next-line import/prefer-default-export
export const createLabel = (state, bemBlock) => {
  const label = cl(state, bemBlock);
  if (label) {
    label.textContent = state?.required ? `${label?.textContent} *` : label?.textContent;
  }
  return label;
};
