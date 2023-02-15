import functions from './functions.js';

export default class Runtime {
  constructor(debug, toNumber, customFunctions = {}) {
    this.toNumber = toNumber;
    this.functionTable = functions(debug);

    Object.entries(customFunctions).forEach(([fname, func]) => {
      if (!this.functionTable[fname]) {
        this.functionTable[fname] = func;
      }
    });
  }

  // eslint-disable-next-line class-methods-use-this
  validateArgs(argName, args, signature) {
    // Validating the args requires validating
    // the correct arity and the correct type of each arg.
    // If the last argument is declared as variadic, then we need
    // a minimum number of args to be required.  Otherwise it has to
    // be an exact amount.
    if (signature.length === 0) {
      return;
    }
    let pluralized;
    const argsNeeded = signature.filter((arg) => !arg.optional).length;
    if (signature[signature.length - 1].variadic) {
      if (args.length < signature.length) {
        pluralized = signature.length === 1 ? ' argument' : ' arguments';
        throw new Error(`ArgumentError: ${argName}() `
          + `takes at least${signature.length}${pluralized
          } but received ${args.length}`);
      }
    } else if (args.length < argsNeeded || args.length > signature.length) {
      pluralized = signature.length === 1 ? ' argument' : ' arguments';
      throw new Error(`ArgumentError: ${argName}() `
        + `takes ${signature.length}${pluralized
        } but received ${args.length}`);
    }
  }

  callFunction(name, resolvedArgs, data, interpreter) {
    // this check will weed out 'valueOf', 'toString' etc
    if (!Object.prototype.hasOwnProperty.call(this.functionTable, name)) throw new Error(`Unknown function: ${name}()`);

    const functionEntry = this.functionTable[name];
    this.validateArgs(name, resolvedArgs, functionEntry.signature);
    return functionEntry.func.call(this, resolvedArgs, data, interpreter);
  }
}
