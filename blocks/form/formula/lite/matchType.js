import dataTypes from './dataTypes.js';

const {
  TYPE_NUMBER,
  TYPE_STRING,
  TYPE_ARRAY,
  TYPE_OBJECT,
  TYPE_BOOLEAN,
  TYPE_NULL,
} = dataTypes;

export function getTypeName(inputObj, useValueOf = true) {
  if (inputObj === null) return TYPE_NULL;
  let obj = inputObj;
  if (useValueOf) {
    // check for the case where there's a child named 'valueOf' that's not a function
    // if so, then it's an object...
    if (typeof inputObj.valueOf === 'function') obj = inputObj.valueOf.call(inputObj);
    else return TYPE_OBJECT;
  }
  switch (Object.prototype.toString.call(obj)) {
    case '[object String]':
      return TYPE_STRING;
    case '[object Number]':
      return TYPE_NUMBER;
    case '[object Array]':
      return TYPE_ARRAY;
    case '[object Boolean]':
      return TYPE_BOOLEAN;
    case '[object Null]':
      return TYPE_NULL;
    case '[object Object]':
      return TYPE_OBJECT;
    default:
      return TYPE_OBJECT;
  }
}

export function getTypeNames(inputObj) {
  // return the types with and without using valueOf
  // needed for the cases where we really need an object passed to a function -- not it's value
  const type1 = getTypeName(inputObj);
  const type2 = getTypeName(inputObj, false);
  return [type1, type2];
}
