// Rule ::= [Compound Compounds]
// Compounds ::= , Compound Compounds | empty
//
// Structure ::= Variable | Compound
// Variable ::= string | symbol
// Compound ::= [Atom Structures]
// Structure ::= , Structure Structures | empty
// Atom ::= string | number

var Parsec = require("parsecjs");
var debug = Parsec.debug();

var variable = debug(Parsec.then(Parsec.Spaces, Parsec.regex(/^[A-Z][_0-9A-Za-z]*/)), "variable");

var atom = debug(Parsec.then(Parsec.Spaces, Parsec.choice([Parsec.Number, Parsec.DoubleQuotedString, Parsec.regex(/^[a-z][_0-9A-Za-z]*/)])), "atom");

var compound = debug(Parsec.bind(atom,
  (functor) => Parsec.choice([
    Parsec.then(Parsec.keyword("("), Parsec.bind(Parsec.separate(structure, Parsec.keyword(",")),
      (arguments) => Parsec.then(Parsec.keyword(")"), Parsec.return([functor].concat(arguments))))),
    Parsec.return([functor])])), "compound");

var structure = debug(Parsec.choice([variable, compound]), "structure");

var body1 = debug(Parsec.then(Parsec.keyword("."), Parsec.return([])), "body1")
var body2 = debug(Parsec.then(Parsec.keyword(":-"), Parsec.bind(Parsec.separate(compound, Parsec.keyword(",")),
    (compounds) => Parsec.then(Parsec.keyword("."), Parsec.return(compounds)))), "body2");

var body = debug(Parsec.choice([body1, body2]), "body");

var rule = debug(Parsec.bind(compound,
  (head) => Parsec.lift(body, Array.prototype.concat.bind([head]))), "rule");

var rules = debug(Parsec.many(rule), "rules");

var parsers = {
  variable: variable,
  atom: atom,
  compound: compound,
  structure: structure,
  rule: rule,
  rules: rules,
  query: compound
};

module.exports = (label, input) => Parsec.run(parsers[label], input);
