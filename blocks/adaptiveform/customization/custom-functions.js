/**
 *
 * @param str {string} json string to convert custom function to object
 * @return {object} JSON Object after parsing the string as json. In case of
 * exceptions empty object is returned
 */
function toObject(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return {};
  }
}

// eslint-disable-next-line import/prefer-default-export
export const customFunctions = {
  toObject,
};
