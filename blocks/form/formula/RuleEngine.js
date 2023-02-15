import Formula from './lite/Formula.js';

function coerceValue(val) {
  if (val === 'true') return true;
  if (val === 'false') return false;
  return val;
}

function constructPayload(form) {
  const payload = {};
  [...form.elements].forEach((fe) => {
    if (fe.type === 'checkbox' || fe.type === 'radio') {
      if (fe.checked) payload[fe.name] = coerceValue(fe.value);
    } else if (fe.id) {
      payload[fe.id] = coerceValue(fe.value);
    }
  });
  return payload;
}

export default class RuleEngine {
  #rules;

  #deps;

  #formTag;

  #ruleOrder = {};

  #data;

  #formula;

  #formatter;

  constructor(rules, deps, formTag, formatter) {
    this.#rules = rules;
    this.#deps = deps;
    this.#formTag = formTag;
    this.#data = constructPayload(formTag);
    this.#formula = new Formula();
    this.#formatter = formatter;
  }

  listRules(fieldName) {
    const explored = new Set();
    explored.add(fieldName);
    const stack = [fieldName];
    const pending = new Set();
    let element = fieldName;
    const nonValueRules = [];
    while (element) {
      (this.#deps[element]?.outgoing || []).forEach((x) => {
        if (x[1] === 'Value') {
          pending.add(x[0]);
        } else {
          nonValueRules.push(x[0]);
        }
      });
      const entries = Array.from(pending.entries());
      const res = entries.find((entry) => {
        const d = entry[1];
        const dependsOn = this.#deps[d].incoming;
        return (
          // no deps
          dependsOn.length === 0
          // all deps already explored
          || dependsOn.every((x) => explored.has(x[0]))
          // no deps in the pending list
          || dependsOn.every((x) => entries.findIndex((e) => x[0] === e[1]) === -1)
        );
      });
      if (res) {
        const [entryKey, entryValue] = res;
        element = entryValue;
        explored.add(entryValue);
        stack.push(entryValue);
        pending.delete(entryKey);
      } else if (entries.length > 0) {
        element = null;
        // eslint-disable-next-line no-console
        console.log('there is a cyclic dependency in your form');
        break;
      } else {
        element = null;
      }
    }
    return stack.slice(1).concat(nonValueRules);
  }

  updateValue(fieldName, value) {
    const element = this.#formTag.elements[fieldName];
    if (!(element instanceof NodeList)) {
      this.#data[fieldName] = coerceValue(value);
      const { displayFormat } = element.dataset;
      this.#formatter(value, displayFormat).then((fValue) => {
        element.value = fValue;
      });
    }
  }

  updateHidden(fieldName, value) {
    const element = this.#formTag.elements[fieldName];
    const wrapper = element.closest('.field-wrapper');
    wrapper.dataset.hidden = value;
  }

  applyRules() {
    this.#formTag.addEventListener('input', (e) => {
      const fieldName = e.target.name;
      if (e.target.type === 'checkbox') {
        this.#data[fieldName] = e.target.checked ? coerceValue(e.target.value) : undefined;
      } else {
        this.#data[fieldName] = coerceValue(e.target.value);
      }
      if (!this.#ruleOrder[fieldName]) {
        this.#ruleOrder[fieldName] = this.listRules(fieldName);
      }
      const rules = this.#ruleOrder[fieldName];
      rules.forEach((fName) => {
        Object.entries(this.#rules[fName]).forEach(([propName, rule]) => {
          const newValue = this.#formula.evaluate(rule, this.#data);
          const handler = this[`update${propName}`];
          if (handler instanceof Function) {
            handler.apply(this, [fName, newValue]);
          }
        });
      });
    });
  }
}
