import updateCellNames from './ExcelToJsonFormula.js';
import Formula from './lite/Formula.js';

const SHEET_NAME_REGEX = /('.{1,31}'|[\w.]{1,31}?)!([$]?[A-Z]+[$]?([0-9]+))/g;

export const getFieldType = (formTag, fieldName) => {
  const element = formTag.elements[fieldName];
  if (element?.type) {
    return element.type;
  } if (element instanceof NodeList) {
    return element.item(0).type;
  }
  return '';
};

export class RuleCompiler {
  rules = {};

  deps = {};

  addRule(fieldName, rule) {
    const { propName, expression } = rule;
    const excelExpression = expression?.slice(1);// ?.replaceAll('"', "'");
    const sheetNames = new Set();
    const updatedExpression = excelExpression.replace(SHEET_NAME_REGEX, (match, g1, g2, g3) => {
      const sheetName = g1.startsWith("'") ? g1.replace(/'/g, '') : g1;
      sheetNames.add(sheetName);
      return `'${sheetName}_${g3}'`;
    });
    this.rules[fieldName] = this.rules[fieldName] || {};
    this.rules[fieldName][propName] = updatedExpression;
    return sheetNames;
  }

  canChange(fieldName, formTag) {
    const fieldType = getFieldType(formTag, fieldName);
    return this.rules?.[fieldName] || (fieldType !== 'hidden' && fieldType !== 'output');
  }

  transform(fieldToCellMap, formTag) {
    const entries = Object.entries(this.rules).map(([fieldName, rules]) => {
      const compiledRules = Object.entries(rules).map(([prop, rule]) => {
        const formula = new Formula();
        const ast = formula.compile(rule);
        const deps = updateCellNames(ast, fieldToCellMap);
        deps.forEach((d) => {
          const trackDeps = this.canChange(d, formTag);
          if (trackDeps) {
            this.deps[d] = this.deps[d] || { incoming: [], outgoing: [] };
            this.deps[d].outgoing.push([fieldName, prop]);
            this.deps[fieldName] = this.deps[fieldName] || { incoming: [], outgoing: [] };
            this.deps[fieldName].incoming.push(d);
          }
        });
        return [prop, ast];
      });
      return [fieldName, Object.fromEntries(compiledRules)];
    });
    this.rules = Object.fromEntries(entries);
  }
}
