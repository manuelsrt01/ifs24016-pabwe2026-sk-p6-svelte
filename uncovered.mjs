import fs from "node:fs";

const coverage = JSON.parse(
  fs.readFileSync("coverage/coverage-final.json", "utf8"),
);

for (const [file, data] of Object.entries(coverage)) {
  const lines = fs.existsSync(file)
    ? fs.readFileSync(file, "utf8").split("\n")
    : [];
  const show = (kind, loc) => {
    console.log(
      `[${kind}] ${file}:${loc.start.line}:${loc.start.column} -> ${loc.end.line}:${loc.end.column}`,
    );
    console.log(
      "    " + (lines[loc.start.line - 1] ?? "(sumber tidak ditemukan)").trim(),
    );
  };

  for (const [id, hits] of Object.entries(data.s)) {
    if (hits === 0) show("statement", data.statementMap[id]);
  }
  for (const [id, counts] of Object.entries(data.b)) {
    counts.forEach((hits, index) => {
      if (hits === 0) show("branch", data.branchMap[id].locations[index]);
    });
  }
}
console.log("selesai");
