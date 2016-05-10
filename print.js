
var atom = (x) => String(x);

var variable = (x) => x;

var structure = (x) => {
  if (Array.isArray(x)) {
    if (x.length === 1)
      return atom(x[0]);
    var s = atom(x[0]) + "(" + structure(x[1])
    for (var i=2; i<x.length; i++)
      s += ", " + structure(x[i]);
    return s + ")";
  }
  return variable(x);
}

var rule = (x) => {
  if (x.length === 1)
    return structure(x[0]) + ".\n";
  var s = structure(x[0]) + " :- " + structure(x[1]);
  for (var i=2; i<x.length; i++)
    s += ",\n    " + structure(x[i])
  return s + ".\n"; 
}

var rules = (x) => x.map(rule).join("");

var printers = {
  atom: atom,
  variable: variable,
  structure: structure,
  rule: rule,
  rules: rules,
  query: structure
}

module.exports = (label, x) => printers[label](x);
