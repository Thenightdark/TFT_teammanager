import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dataDir = path.join(root, "src", "data", "set-17");
const publicItemDir = path.join(root, "public", "sets", "set-17", "items");
const sourceBase = "https://raw.communitydragon.org/latest";
const slug = (value) => value
  .replace(/^TFT_?/, "tft-")
  .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
  .replace(/[^a-zA-Z0-9]+/g, "-")
  .replace(/^-|-$/g, "")
  .toLowerCase();
const normalized = (value) => value.toLowerCase().replace(/[’']/g, "").replace(/[^a-z0-9]+/g, " ").trim();
const assetUrl = (assetPath) => `${sourceBase}/game/${assetPath.toLowerCase().replace(/\.tex$/i, ".png")}`;

const [guides, champions, currentItems, currentComps] = await Promise.all([
  readFile(path.join(dataDir, "verified-guides.json"), "utf8").then(JSON.parse),
  readFile(path.join(dataDir, "champions.json"), "utf8").then(JSON.parse),
  readFile(path.join(dataDir, "items.json"), "utf8").then(JSON.parse),
  readFile(path.join(dataDir, "comps.json"), "utf8").then(JSON.parse),
]);

const wantedItemNames = new Set(guides.flatMap((guide) => guide.groups.flatMap((group) => group.items)));
const items = [...currentItems];
const availableNames = new Set(items.map((item) => item.name.toLowerCase()));
const missingNames = [...wantedItemNames].filter((name) => !availableNames.has(name.toLowerCase()));

if (missingNames.length) {
  const response = await fetch(`${sourceBase}/cdragon/tft/en_us.json`);
  if (!response.ok) throw new Error(`Could not load CommunityDragon item data: ${response.status}`);
  const raw = await response.json();
  await mkdir(publicItemDir, { recursive: true });
  for (const name of missingNames) {
    const entry = raw.items.find((candidate) => candidate.name?.toLowerCase() === name.toLowerCase());
    if (!entry) throw new Error(`Verified guide item not found in CommunityDragon: ${name}`);
    const id = slug(entry.apiName);
    const image = `/sets/set-17/items/${id}.png`;
    items.push({ id, apiName: entry.apiName, name: entry.name, type: "completed", image });
    const iconResponse = await fetch(assetUrl(entry.icon));
    if (!iconResponse.ok) throw new Error(`Could not download ${name} icon: ${iconResponse.status}`);
    await writeFile(path.join(publicItemDir, `${id}.png`), Buffer.from(await iconResponse.arrayBuffer()));
  }
}

const championByName = new Map(champions.map((champion) => [normalized(champion.name), champion]));
const championAliases = new Map([
  ["nunu", "nunu willump"], ["cho", "chogath"], ["reksai", "reksai"], ["asol", "aurelion sol"],
  ["lb", "leblanc"], ["yi", "master yi"], ["tf", "twisted fate"], ["mf", "miss fortune"],
]);
const resolveChampion = (name) => championByName.get(championAliases.get(normalized(name)) ?? normalized(name));
const itemByName = new Map(items.map((item) => [item.name.toLowerCase(), item]));
const guideByTitle = new Map(guides.map((guide) => [normalized(guide.title), guide]));
const tankItems = new Set([
  "adaptive helm", "bramble vest", "crownguard", "dragons claw", "evenshroud", "gargoyle stoneplate",
  "ionic spark", "protectors vow", "spirit visage", "steadfast heart", "sunfire cape", "warmogs armor",
]);
const tankScore = (group) => group.items.filter((name) => tankItems.has(normalized(name))).length;

const comps = currentComps.map((comp) => {
  const guide = guideByTitle.get(normalized(comp.name));
  if (!guide) throw new Error(`No verified guide matched ${comp.name}`);
  const roster = guide.roster
    .map(resolveChampion)
    .filter(Boolean)
    .filter((champion, index, all) => all.findIndex((candidate) => candidate.id === champion.id) === index)
    .slice(0, comp.units.length);
  if (roster.length !== comp.units.length) throw new Error(`${comp.name}: guide roster resolved ${roster.length}/${comp.units.length} units`);
  const groups = guide.groups.map((group) => {
    const champion = resolveChampion(group.champion);
    if (!champion || !roster.some((unit) => unit.id === champion.id)) throw new Error(`${comp.name}: invalid holder ${group.champion}`);
    const resolvedItems = group.items.map((name) => itemByName.get(name.toLowerCase()));
    if (resolvedItems.some((item) => !item)) throw new Error(`${comp.name}: unresolved item in ${group.champion}'s build`);
    return { source: group, champion, items: resolvedItems, tankScore: tankScore(group) };
  });
  const existingTank = groups.find((group) => group.champion.id === comp.mainTank && group.tankScore >= 2);
  const mainTankGroup = existingTank ?? [...groups].sort((a, b) => b.tankScore - a.tankScore)[0];
  const isUtilityOnly = (group) => group.items.length === 1 && (/thief's gloves/i.test(group.items[0].name) || / emblem$/i.test(group.items[0].name));
  const damageGroups = groups.filter((group) => group.champion.id !== mainTankGroup?.champion.id && group.tankScore < 2 && !isUtilityOnly(group));
  const carries = damageGroups.map((group) => group.champion.id);
  const recommendedItems = groups.map((group) => ({
    champion: group.champion.id,
    role: group.champion.id === mainTankGroup?.champion.id
      ? "main-tank"
        : group.tankScore >= 2
          ? "secondary-tank"
          : isUtilityOnly(group)
            ? / emblem$/i.test(group.items[0].name) ? "emblem-holder" : "utility"
            : damageGroups[0]?.champion.id === group.champion.id
              ? "main-carry"
              : "secondary-carry",
    items: group.items.map((item) => item.id),
  }));
  const requiredEmblems = groups.flatMap((group) => group.items
    .filter((item) => / emblem$/i.test(item.name))
    .map((item) => ({
      trait: item.name.replace(/ emblem$/i, ""), holder: group.champion.id, item: item.id,
      note: `The published Mobalytics board equips this emblem on ${group.champion.name}.`,
    })));
  const reachTargets = comp.id === "reach-for-the-stars"
    ? ["Lulu", "Jax", "Pantheon", "Milio"].map((name) => resolveChampion(name)?.id).filter(Boolean)
    : undefined;
  const coreUnits = [...new Set([...carries, mainTankGroup?.champion.id, ...(reachTargets ?? [])].filter(Boolean))];
  return {
    ...comp,
    units: roster.map((unit) => unit.id), coreUnits, carries,
    mainTank: mainTankGroup?.champion.id, recommendedItems,
    source: "Mobalytics", sourcePatch: "Patch 17.9 · Updated Aug 17", sourceGuideUrl: guide.url,
    ...(requiredEmblems.length ? { requiredEmblems } : { requiredEmblems: undefined }),
    ...(reachTargets ? { threeStarTargets: reachTargets } : {}),
  };
});

await Promise.all([
  writeFile(path.join(dataDir, "items.json"), `${JSON.stringify(items, null, 2)}\n`),
  writeFile(path.join(dataDir, "comps.json"), `${JSON.stringify(comps, null, 2)}\n`),
]);
console.log(`Applied ${guides.length} verified guide builds; ${missingNames.length} guide-only items imported.`);
