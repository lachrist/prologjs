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

//////////
// Atom //
//////////

var atom = debug(Parsec.then(Parsec.Spaces, Parsec.choice([
  Parsec.Number,
  Parsec.DoubleQuotedString,
  Parsec.regexp(/^[a-z][_0-9A-Za-z]*/)])), "atom");

///////////////
// Structure //
///////////////

var structures = [];

var structure = debug(Parsec.choice(structures), "structure");

//////////////
// Variable //
//////////////

var variable = debug(Parsec.then(Parsec.Spaces, Parsec.regexp(/^[_A-Z][_0-9A-Za-z]*/)), "variable");

structures.push(variable);

//////////////
// Compound //
//////////////

var compound = debug(Parsec.bind(atom,
  (functor) => Parsec.choice([
    Parsec.then(Parsec.keyword("("), Parsec.bind(Parsec.separate(structure, Parsec.keyword(",")),
      (arguments) => Parsec.then(Parsec.keyword(")"), Parsec.return([functor].concat(arguments))))),
    Parsec.return([functor])])), "compound");

structures.push(compound);

/////////////////////////////////////////////////////
// List (syntactic sugar for nested calls to cons) //
/////////////////////////////////////////////////////

var desugar = (elements) => (tail) => {
  var result = tail;
  for (var i=elements.length-1; i>=0; i--)
    result = ["cons", elements[i], result];
  return result;
}

var tail = debug(Parsec.choice([
  Parsec.then(Parsec.keyword("]"), Parsec.return(["nil"])),
  Parsec.then(Parsec.keyword("|"), Parsec.bind(structure,
    (tail) => Parsec.then(Parsec.keyword("]"), Parsec.return(tail))))]), "tail")

var list = debug(Parsec.then(Parsec.keyword("["), Parsec.bind(Parsec.separate(structure, Parsec.keyword(",")),
  (elements) => Parsec.lift(tail, desugar(elements)))), "list");

structures.push(list);

//////////
// Rule //
//////////

var body = debug(Parsec.choice([
  Parsec.then(Parsec.keyword("."), Parsec.return([])),
  Parsec.then(Parsec.keyword(":-"), Parsec.bind(Parsec.separate(compound, Parsec.keyword(",")),
    (compounds) => Parsec.then(Parsec.keyword("."), Parsec.return(compounds))))]), "body");

var rule = debug(Parsec.bind(compound,
  (head) => Parsec.lift(body, Array.prototype.concat.bind([head]))), "rule");

///////////////
// Top level //
///////////////

var rules = debug(Parsec.many(rule), "rules");

var parsers = {
  variable: variable,
  atom: atom,
  compound: compound,
  structure: structure,
  rule: rule,
  rules: rules,
  prolog: rules,
  query: compound
};

module.exports = (label, input) => Parsec.run(parsers[label], input);
