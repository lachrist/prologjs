
var unify = (struct1, struct2, binding) => {
  var workers = [struct1, struct2];
  while (workers.length) {
    (struct1 = workers.pop(), struct2 = workers.pop());
    if (Array.isArray(struct1) && Array.isArray(struct2)) {
      if (struct1[0] !== struct2[0] || struct1.length !== struct2.length)
        return false;
      for (var i=1, l=struct1.length; i<l; i++)
        workers.push(struct1[i], struct2[i]);
    } else {
      if (Array.isArray(struct1))
        var tmp = struct1, struct1 = struct2, struct2 = tmp;
      if (contain(struct2, struct1)) {
        if (struct1 !== struct2)
          return false;
      } else {
        var eliminate = (x) => x === struct1 ? struct2 : x;
        for (var i=0, l=workers.length; i<l; i++)
          workers[i] = substitute(workers[i], eliminate);
        merge(binding, eliminate, binding);
        binding[struct1] = struct2;
      }
    }
  }
  return true;
}

var contain = (struct, variable) => {
  if (Array.isArray(struct))
    for (var i=1, l=struct.length; i<l; i++)
      if (contain(struct[i], variable))
        return true;
  return struct === variable;
}

var substitute = (struct, map) => {
  if (Array.isArray(struct)) {
    var result = [struct[0]];
    for (var i=1, l=struct.length; i<l; i++)
      result.push(substitute(struct[i], map));
    return result;
  }
  return map(struct);
}

var merge = (binding, map, result) => {
  var ks = Object.getOwnPropertyNames(binding);
  Array.prototype.push.apply(ks, Object.getOwnPropertySymbols(binding));
  for (var i=0, l=ks.length; i<l; i++)
    result[ks[i]] = substitute(binding[ks[i]], map);
  return result;
}

var identifier = 0;
var rename = (fresh) => (x) => fresh[x] || (fresh[x] = Symbol(++identifier));

module.exports = (rules) => {
  function* disjunction (goal) {
    debugger;
    var fresh = Object.create(null);
    goal = substitute(goal, rename(fresh));
    for (var i=0, l=rules.length; i<l; i++) {
      var binding = Object.create(null);
      if (unify(goal, rules[i][0], binding))
        yield* conjunction(rules[i], 1, binding, fresh);
    }
  }
  function* conjunction (rule, index, binding, fresh) {
    if (index === rule.length) {
      var map = rename(Object.create(null));
      yield merge(fresh, (x) => (x in binding) ? substitute(binding[x], map) : map(x), Object.create(null));
    } else {
      for (var solution of disjunction(substitute(rule[index], (x) => binding[x] || x)))
        yield* conjunction(rule, index+1, merge(binding, (x) => solution[x] || x, solution), fresh);
    }
  }
  return disjunction;
}
