import { readFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const registry = JSON.parse(await readFile(path.join(root, "src", "data", "sets.json"), "utf8"));
const requestedSet = process.argv[2];
const sets = requestedSet ? registry.filter((entry) => entry.id === requestedSet) : registry;
if (!sets.length) throw new Error(`Unknown set: ${requestedSet}`);

for (const set of sets) {
  const directory = path.join(root, "src", "data", set.id);
  const [champions, items, traits, comps, augments] = await Promise.all([
    "champions", "items", "traits", "comps", "augments",
  ].map(async (name) => JSON.parse(await readFile(path.join(directory, `${name}.json`), "utf8"))));
  const championIds = new Set(champions.map((entry) => entry.id));
  const itemIds = new Set(items.map((entry) => entry.id));
  const augmentIds = new Set(augments.map((entry) => entry.id));
  const problems = [];
  for (const comp of comps) {
    for (const unit of comp.units) if (!championIds.has(unit)) problems.push(`${comp.name}: missing champion ${unit}`);
    for (const group of comp.recommendedItems ?? []) {
      if (!comp.units.includes(group.champion)) problems.push(`${comp.name}: item holder is not on the board`);
      for (const item of group.items ?? []) if (!itemIds.has(item)) problems.push(`${comp.name}: missing item ${item}`);
    }
    for (const augment of comp.recommendedAugments ?? []) if (!augmentIds.has(augment.augmentId)) problems.push(`${comp.name}: missing augment ${augment.augmentId}`);
  }
  if (problems.length) throw new Error(`${set.name} failed validation:\n${problems.join("\n")}`);
  console.log(`${set.name}: ${champions.length} champions, ${traits.length} traits, ${items.length} items, ${augments.length} augments, ${comps.length} comps — valid.`);
}
