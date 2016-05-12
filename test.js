
var Prolog = require("./main.js");

function test (query, prolog) {
  var rules = Prolog.parse("prolog", prolog);
  var structure = Prolog.parse("query", query);
  console.log("RULES:");
  console.log(Prolog.print("prolog", rules));
  console.log("QUERY:");
  console.log(Prolog.print("query", structure));
  var search = Prolog.knowledge(rules);
  var index = 0;
  console.log("BEGIN SOLUTIONS");
  for (var solution of search(structure)) {
    index++;
    console.log(solution);
  }
  console.log("END SOLUTION (" + index + ")");
}

test("animal(X)", [
  "animal(X) :- mamal(X).",
  "mamal(X) :- cat(X).",
  "cat(tom).",
  "cat(felix).",
  "stone(rocky)."
].join(""));

test("member(felix, [tom, felix, fiora])", [
  "member(X, [X|_]).",
  "member(X, [_|XS]) :- member(X, XS)."
].join(""));
