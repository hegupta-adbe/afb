const numberRegEx = /(.+?_\d+)$|[^_]+?(\d+)$/;

function visit(n, nameMap, fields) {
  if (n.type === 'Field') {
    const name = n?.name;
    const match = numberRegEx.exec(name);
    let field;
    if (match?.[1]) {
      field = nameMap[match[1]];
    } else {
      field = nameMap[match[2]];
    }
    if (!field) {
      // eslint-disable-next-line no-console
      console.log(`Unknown column used in excel formula ${n.name}`);
    }
    n.name = field;
    fields.add(field);
  } else if (n.type === 'Function') {
    n.name = n.name.toLowerCase();
  }
  n.children?.forEach((c) => visit(c, nameMap, fields));
}

export default function updateCellNames(ast, rowNumberFieldMap) {
  const fields = new Set();
  visit(ast, rowNumberFieldMap, fields);
  return Array.from(fields);
}
