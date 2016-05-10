
var Prolog = require("./main.js");

var rules = Prolog.parse("rules", [
  "animal(X) :- mamal(X).",
  "mamal(X) :- cat(X).",
  "cat(tom).",
  "cat(felix).",
  "stone(rocky)."
].join(""));
console.log(Prolog.print("rules", rules));
var query = Prolog.parse("query", "animal(X)");
console.log(Prolog.print("query", query));
var search = Prolog.knowledge(rules);
for (var solution of search(query))
  console.log(solution);
