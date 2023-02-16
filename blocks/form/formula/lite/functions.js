import dataTypes from './dataTypes.js';
import { getTypeName } from './matchType.js';
import {
  getValueOf, getToNumber,
} from './utils.js';

const {
  TYPE_NUMBER,
  TYPE_ARRAY,
  TYPE_ARRAY_NUMBER,
  TYPE_ARRAY_STRING,
} = dataTypes;

export default function functions(debug) {
  const toNumber = getToNumber(debug);
  const fnMap = {
    and: {
      func: (resolvedArgs) => {
        let result = !!getValueOf(resolvedArgs[0]);
        resolvedArgs.slice(1).forEach((arg) => {
          result = result && !!getValueOf(arg);
        });
        return result;
      },
      signature: [{ types: [dataTypes.TYPE_ANY], variadic: true }],
    },

    false: {
      func: () => false,
      signature: [],
    },

    if: {
      func: (unresolvedArgs, data, interpreter) => {
        const conditionNode = unresolvedArgs[0];
        const leftBranchNode = unresolvedArgs[1];
        const rightBranchNode = unresolvedArgs[2];
        const condition = interpreter.visit(conditionNode, data);
        if (getValueOf(condition)) {
          return interpreter.visit(leftBranchNode, data);
        }
        return interpreter.visit(rightBranchNode, data);
      },
      signature: [
        { types: [dataTypes.TYPE_ANY] },
        { types: [dataTypes.TYPE_ANY] },
        { types: [dataTypes.TYPE_ANY] }],
    },

    not: {
      func: (resolveArgs) => !getValueOf(resolveArgs[0]),
      signature: [{ types: [dataTypes.TYPE_ANY] }],
    },

    or: {
      func: (resolvedArgs) => {
        let result = !!getValueOf(resolvedArgs[0]);
        resolvedArgs.slice(1).forEach((arg) => {
          result = result || !!getValueOf(arg);
        });
        return result;
      },
      signature: [{ types: [dataTypes.TYPE_ANY], variadic: true }],
    },

    true: {
      func: () => true,
      signature: [],
    },

    power: {
      func: (args) => {
        const base = toNumber(args[0]);
        const power = toNumber(args[1]);
        return base ** power;
      },
      signature: [
        { types: [dataTypes.TYPE_NUMBER] },
        { types: [dataTypes.TYPE_NUMBER] },
      ],
    },
    ceiling: {
      func: (args) => {
        const num = toNumber(args[0]);
        const significance = toNumber(args[1]);
        return Math.ceil(num / significance) * significance;
      },
      signature: [
        { types: [dataTypes.TYPE_NUMBER] },
        { types: [dataTypes.TYPE_NUMBER] },
      ],
    },

    round: {
      func: (args) => {
        const num = toNumber(args[0]);
        const digits = toNumber(args[1]);
        const precision = 10 ** digits;
        return Math.round(num * precision) / precision;
      },
      signature: [
        { types: [dataTypes.TYPE_NUMBER] },
        { types: [dataTypes.TYPE_NUMBER] },
      ],
    },

    min: {
      func: (args) => {
        // flatten the args into a single array
        const array = args.reduce((prev, cur) => {
          if (Array.isArray(cur)) prev.push(...cur);
          else prev.push(cur);
          return prev;
        }, []);

        const first = array.find((r) => r !== null);
        if (array.length === 0 || first === undefined) return null;
        // use the first value to determine the comparison type
        const isNumber = getTypeName(first, true) === TYPE_NUMBER;
        const compare = isNumber
          ? (prev, cur) => {
            const current = toNumber(cur);
            return prev <= current ? prev : current;
          }
          : (prev, cur) => {
            const current = toString(cur);
            return prev.localeCompare(current) === 1 ? current : prev;
          };

        return array.reduce(compare, isNumber ? toNumber(first) : toString(first));
      },
      signature: [{ types: [TYPE_ARRAY, TYPE_ARRAY_NUMBER, TYPE_ARRAY_STRING], variadic: true }],
    },
  };
  return fnMap;
}
