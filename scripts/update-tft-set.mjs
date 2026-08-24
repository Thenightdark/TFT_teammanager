import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const args = {};
const cliArgs = process.argv.slice(2);
for (let index = 0; index < cliArgs.length; index += 1) {
  const arg = cliArgs[index];
  if (!arg.startsWith("--") || arg === "--") continue;
  const key = arg.slice(2);
  const next = cliArgs[index + 1];
  if (!next || next.startsWith("--")) args[key] = true;
  else {
    args[key] = next;
    index += 1;
  }
}

const setNumber = Number(args.set);
if (!Number.isInteger(setNumber)) {
  throw new Error("Usage: node scripts/update-tft-set.mjs --set 17 [--name \"Set 17: Space Gods\"]");
}

const root = process.cwd();
const setId = String(args.id || `set-${setNumber}`);
const setName = String(args.name || `Set ${setNumber}`);
const locale = String(args.locale || "en_us");
const cdragonBase = String(args.source || "https://raw.communitydragon.org/latest");
const dataUrl = `${cdragonBase}/cdragon/tft/${locale}.json`;
const versionsUrl = "https://ddragon.leagueoflegends.com/api/versions.json";
const dataDir = path.join(root, "src", "data", setId);
const publicDir = path.join(root, "public", "sets", setId);

const slug = (value) => value
  .replace(/^TFT_?/, "tft-")
  .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
  .replace(/[^a-zA-Z0-9]+/g, "-")
  .replace(/^-|-$/g, "")
  .toLowerCase();

const assetUrl = (assetPath) => `${cdragonBase}/game/${assetPath.toLowerCase().replace(/\.tex$/i, ".png")}`;
const breakpointLabel = (style) => ({ 1: "Bronze", 3: "Silver", 4: "Unique", 5: "Gold", 6: "Prismatic" }[style] || "Active");
const cleanDescription = (value = "") => String(value ?? "")
  .replace(/<br\s*\/?>/gi, " ")
  .replace(/<[^>]+>/g, "")
  .replace(/\{\{[^}]+\}\}/g, "")
  .replace(/@[A-Za-z0-9_.:{}*+-]+@%?/g, "scaling")
  .replace(/&amp;/g, "&")
  .replace(/&nbsp;/gi, " ")
  .replace(/&lt;/g, "<")
  .replace(/&gt;/g, ">")
  .replace(/%i:[^%]+%/gi, "")
  .replace(/\s+/g, " ")
  .trim();

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.status}`);
  return response.json();
}

async function download(url, destination) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to download ${url}: ${response.status}`);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, Buffer.from(await response.arrayBuffer()));
}

const [raw, versions] = await Promise.all([fetchJson(dataUrl), fetchJson(versionsUrl)]);
const patch = versions[0];
const setData = raw.setData.find((entry) => entry.mutator === `TFTSet${setNumber}`);
if (!setData) throw new Error(`Set ${setNumber} was not found in the latest TFT data`);

const playable = setData.champions
  .filter((entry) => entry.apiName.startsWith(`TFT${setNumber}_`) && entry.cost >= 1 && entry.cost <= 5 && entry.traits.length)
  .sort((a, b) => a.cost - b.cost || a.name.localeCompare(b.name));
const usedTraitNames = new Set(playable.flatMap((entry) => entry.traits));
const traitEntries = setData.traits
  .filter((entry) => usedTraitNames.has(entry.name))
  .filter((entry, index, all) => all.findIndex((candidate) => candidate.name === entry.name) === index)
  .sort((a, b) => a.name.localeCompare(b.name));

const componentApiNames = [
  "TFT_Item_BFSword", "TFT_Item_RecurveBow", "TFT_Item_NeedlesslyLargeRod", "TFT_Item_TearOfTheGoddess",
  "TFT_Item_ChainVest", "TFT_Item_NegatronCloak", "TFT_Item_GiantsBelt", "TFT_Item_SparringGloves",
];
const itemEntries = raw.items
  .filter((entry) => setData.items.includes(entry.apiName))
  .filter((entry) => entry.apiName === "TFT17_Item_SummonTraitEmblemItem" || componentApiNames.includes(entry.apiName) || (
    entry.composition.length === 2 && entry.composition.every((component) => componentApiNames.includes(component))
  ))
  .filter((entry, index, all) => all.findIndex((candidate) => candidate.apiName === entry.apiName) === index)
  .sort((a, b) => (a.composition.length - b.composition.length) || a.name.localeCompare(b.name));

const specialItemEntries = raw.items
  .filter((entry) => setData.items.includes(entry.apiName))
  .filter((entry) => (
    (/^TFT5_Item_.*Radiant$/i.test(entry.apiName) && /^Radiant\s/i.test(entry.name)) ||
    /^(TFT_Item_Artifact_|TFT4_Item_Ornn|TFT9_Item_Ornn|TFT17_Item_Artifact_)/i.test(entry.apiName)
  ))
  .filter((entry) => entry.name && !entry.name.startsWith("tft_item_name_"))
  .filter((entry, index, all) => all.findIndex((candidate) => candidate.apiName === entry.apiName) === index)
  .sort((a, b) => a.name.localeCompare(b.name));

const championId = (apiName) => slug(apiName);
const itemId = (apiName) => slug(apiName);
const traitId = (apiName) => slug(apiName);
const augmentId = (apiName) => slug(apiName);

function augmentName(entry) {
  const quest = entry.apiName.match(/AurelionSolGodAugment_(Small|Medium|Large)Quest$/i)?.[1];
  if (quest) return `Aurelion Sol's Boon — ${quest[0].toUpperCase()}${quest.slice(1).toLowerCase()} Quest`;
  if (entry.apiName === "TFT_Augment_GainGold") return "Gain Gold";
  return cleanDescription(entry.name);
}

function championRole(entry) {
  const traitsText = entry.traits.join(" ");
  if (/bastion|vanguard|brawler|bruiser|guardian|warden|defender|juggernaut|behemoth/i.test(traitsText)) return "frontline";
  if (/rogue|slayer|warrior|edgelord|pit fighter|reaper|marauder/i.test(traitsText) && entry.stats.range <= 2) return "melee-carry";
  if (entry.stats.range >= 3 || /sniper|ranger|gunslinger|blaster|executioner/i.test(traitsText)) return "backline-carry";
  if (/shepherd|mystic|enchanter|strategist|invoker|conduit|replicator|scholar/i.test(traitsText)) return "support";
  return entry.stats.range <= 1 ? "frontline" : "backline-carry";
}

const champions = playable.map((entry) => ({
  id: championId(entry.apiName), apiName: entry.apiName, name: entry.name, cost: entry.cost, traits: entry.traits,
  image: `/sets/${setId}/champions/${championId(entry.apiName)}.png`,
  range: entry.stats.range,
  role: championRole(entry),
}));
const items = itemEntries.map((entry) => ({
  id: itemId(entry.apiName), apiName: entry.apiName, name: entry.name,
  type: entry.composition.length ? "completed" : "component",
  image: `/sets/${setId}/items/${itemId(entry.apiName)}.png`,
  ...(entry.composition.length ? { components: entry.composition.map(itemId) } : {}),
}));
const traits = traitEntries.map((entry) => ({
  id: traitId(entry.apiName), apiName: entry.apiName, name: entry.name,
  description: entry.desc || "",
  breakpoints: entry.effects.filter((effect) => effect.minUnits > 0).map((effect) => ({ minimum: effect.minUnits, label: breakpointLabel(effect.style) })),
  image: `/sets/${setId}/traits/${traitId(entry.apiName)}.png`,
}));

const traitRolePatterns = {
  attack: /sniper|challenger|marauder|ranger|quickstriker|gunslinger|duelist|blaster|executioner/i,
  magic: /conduit|invoker|fateweaver|replicator|sorcerer|arcanist|visionary|dynamo|technician/i,
  tank: /bastion|vanguard|brawler|bruiser|guardian|warden|defender|juggernaut|behemoth/i,
  fighter: /rogue|slayer|warrior|edgelord|pit fighter|reaper/i,
  utility: /shepherd|mystic|enchanter|strategist|incantor|scholar/i,
};

function specialItemFit(entry) {
  const keys = Object.keys(entry.effects || {}).join(" ");
  const description = entry.desc || "";
  const attack = (keys.match(/(^|\s)(AD|AS|Attack|Crit|Damage)(\s|$)/gi) || []).length;
  const magic = (keys.match(/AP|Mana|Spell/gi) || []).length;
  const tank = (keys.match(/Armor|MagicResist|Health|Durability|Shield|Resist/gi) || []).length;
  const sustain = (keys.match(/Omnivamp|LifeSteal|Heal/gi) || []).length;
  const utility = (/allies|adjacent ally|shred|sunder/i.test(description) ? 3 : 0);
  if (sustain && (attack || magic) && tank) return "fighter";
  const scores = { attack, magic, tank, fighter: sustain + Math.min(attack + magic, tank), utility };
  return Object.entries(scores).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0][0];
}

function championFitScore(champion, fit, item) {
  const stats = champion.stats || {};
  const traitsText = (champion.traits || []).join(" ");
  const traitBonus = traitRolePatterns[fit].test(traitsText) ? 18 : 0;
  const costBonus = champion.cost * 1.5;
  const manaRatio = stats.mana > 0 ? (stats.initialMana || 0) / stats.mana : 0;
  const effectKeys = Object.keys(item.effects || {}).join(" ");
  const description = item.desc || "";
  let itemSpecific = 0;
  if (/(^|\s)AD(\s|$)/i.test(effectKeys)) itemSpecific += (stats.damage || 0) * .08;
  if (/(^|\s)AS(\s|$)|AttackSpeed/i.test(effectKeys)) itemSpecific += (stats.attackSpeed || 0) * 10;
  if (/Crit/i.test(effectKeys)) itemSpecific += (stats.damage || 0) * .035 + (stats.range || 1);
  if (/(^|\s)AP(\s|$)/i.test(effectKeys)) itemSpecific += manaRatio * 7 + (stats.mana > 0 ? 3 : 0);
  if (/Mana/i.test(effectKeys)) itemSpecific += manaRatio * 10 + (stats.mana > 0 ? Math.max(0, 110 - stats.mana) * .04 : 0);
  if (/Health/i.test(effectKeys)) itemSpecific += (stats.hp || 0) * .006;
  if (/Armor/i.test(effectKeys)) itemSpecific += (stats.armor || 0) * .07;
  if (/MagicResist|MRPerEnemy/i.test(effectKeys)) itemSpecific += (stats.magicResist || 0) * .07;
  if (/attack|every hit/i.test(description)) itemSpecific += (stats.attackSpeed || 0) * 5;
  if (/when.*hit|being hit|attacked|nearby enemies/i.test(description)) itemSpecific += ((stats.range || 1) <= 1 ? 7 : 0) + (stats.hp || 0) * .003;
  if (/range|hexes away/i.test(description)) itemSpecific += (stats.range || 1) * 2;
  if (fit === "attack") return costBonus + traitBonus + itemSpecific + (stats.damage || 0) * .13 + (stats.attackSpeed || 0) * 14 + (stats.range || 1) * 2;
  if (fit === "magic") return costBonus + traitBonus + itemSpecific + manaRatio * 14 + (stats.range || 1) * 2 + (stats.mana > 0 ? 5 : 0);
  if (fit === "tank") return costBonus + traitBonus + itemSpecific + (stats.hp || 0) * .018 + (stats.armor || 0) * .16 + (stats.magicResist || 0) * .16 + ((stats.range || 1) <= 1 ? 6 : 0);
  if (fit === "fighter") return costBonus + traitBonus + itemSpecific + (stats.damage || 0) * .08 + (stats.attackSpeed || 0) * 10 + (stats.hp || 0) * .008 + ((stats.range || 1) <= 2 ? 6 : 0);
  return costBonus + traitBonus + itemSpecific + manaRatio * 13 + (stats.range || 1) * 1.5;
}

const fitReasons = {
  attack: "Best on ranged or high-output attack carries.",
  magic: "Best on ability-focused carries with reliable casting.",
  tank: "Best on durable frontline champions.",
  fighter: "Best on sustained-damage melee or hybrid carries.",
  utility: "Best on support champions who apply team-wide effects.",
};

const specialItems = specialItemEntries.map((entry) => {
  const fit = specialItemFit(entry);
  const recommendedChampionIds = [...playable]
    .sort((a, b) => championFitScore(b, fit, entry) - championFitScore(a, fit, entry) || b.cost - a.cost || a.name.localeCompare(b.name))
    .map((champion) => championId(champion.apiName));
  return {
    id: itemId(entry.apiName), apiName: entry.apiName, name: entry.name,
    category: /^TFT5_Item_.*Radiant$/i.test(entry.apiName) ? "radiant" : "artifact",
    image: `/sets/${setId}/special-items/${itemId(entry.apiName)}.png`,
    fit, fitReason: fitReasons[fit], description: cleanDescription(entry.desc), recommendedChampionIds,
  };
});

const completedItems = items.filter((item) => item.type === "completed");
const suggestedItems = ["Infinity Edge", "Spear of Shojin", "Guinsoo's Rageblade", "Giant Slayer", "Warmog's Armor"]
  .map((name) => completedItems.find((item) => item.name === name)?.id)
  .filter(Boolean);
const traitGroups = [...usedTraitNames]
  .map((trait) => ({ trait, units: champions.filter((champion) => champion.traits.includes(trait)) }))
  .filter((group) => group.units.length >= 6)
  .sort((a, b) => b.units.length - a.units.length || a.trait.localeCompare(b.trait))
  .slice(0, 5);
let baseComps = traitGroups.map((group, index) => {
  const units = [...group.units].sort((a, b) => b.cost - a.cost || a.name.localeCompare(b.name)).slice(0, 8);
  while (units.length < 8) {
    const representedTraits = new Set(units.flatMap((unit) => unit.traits));
    const next = playable
      .filter((candidate) => !units.some((unit) => unit.id === championId(candidate.apiName)))
      .sort((a, b) => {
        const aSynergy = a.traits.filter((trait) => representedTraits.has(trait)).length;
        const bSynergy = b.traits.filter((trait) => representedTraits.has(trait)).length;
        return bSynergy - aSynergy || b.cost - a.cost || a.name.localeCompare(b.name);
      })[0];
    if (!next) break;
    units.push(champions.find((unit) => unit.id === championId(next.apiName)));
  }
  const carries = units.slice(0, 2).map((unit) => unit.id);
  return {
    id: `${slug(group.trait)}-starter`, name: `${group.trait} Starter`, units: units.map((unit) => unit.id),
    coreUnits: units.slice(0, 3).map((unit) => unit.id), carries,
    mainTank: units.find((unit) => unit.role === "frontline")?.id,
    tier: ["S", "A", "A", "B", "B"][index] || "C",
    playstyle: "Generated starter",
    recommendedItems: carries.slice(0, 1).map((carry) => ({ champion: carry, role: "main-carry", items: suggestedItems.slice(index % 3, index % 3 + 3) })),
    traits: [group.trait],
    description: `A starter template generated from real Set ${setNumber} ${group.trait} units. It is not a live-meta or win-rate recommendation.`,
  };
});

let metaDefinitions = [];
for (const filename of ["meta-comps.json", "meta-comps-ab.json"]) {
  try { metaDefinitions.push(...JSON.parse(await readFile(path.join(dataDir, filename), "utf8"))); } catch {}
}
if (metaDefinitions.length) {
  const byName = new Map(champions.map((champion) => [champion.name.toLowerCase(), champion]));
  const itemByName = new Map(items.map((item) => [item.name.toLowerCase(), item.id]));
  const idsFor = (names) => names.map((name) => itemByName.get(name.toLowerCase())).filter(Boolean);
  const attackItems = idsFor(["Infinity Edge", "Last Whisper", "Giant Slayer", "Guinsoo's Rageblade", "Deathblade", "Red Buff"]);
  const magicItems = idsFor(["Spear of Shojin", "Jeweled Gauntlet", "Rabadon's Deathcap", "Archangel's Staff", "Blue Buff", "Morellonomicon"]);
  const meleeItems = idsFor(["Bloodthirster", "Titan's Resolve", "Hand Of Justice", "Sterak's Gage", "Edge of Night", "Quicksilver"]);
  const tankItems = idsFor(["Warmog's Armor", "Gargoyle Stoneplate", "Bramble Vest", "Dragon's Claw", "Steadfast Heart", "Sunfire Cape"]);
  const carryItems = (champion, offset = 0) => {
    const traitsText = champion.traits.join(" ");
    const pool = champion.role === "melee-carry" ? meleeItems : /conduit|fateweaver|replicator|sorcerer|arcanist|technician|psionic/i.test(traitsText) ? magicItems : attackItems;
    return [...pool.slice(offset, offset + 3), ...pool].filter((id, index, all) => all.indexOf(id) === index).slice(0, 3);
  };
  baseComps = metaDefinitions.flatMap((definition) => {
    const units = definition.unitNames.map((name) => byName.get(name.toLowerCase())).filter(Boolean);
    const carries = definition.carryNames.map((name) => byName.get(name.toLowerCase())).filter(Boolean);
    const mainTank = byName.get(definition.tankName.toLowerCase());
    if (units.length < 6 || !carries.length || !mainTank) return [];
    const recommendedItems = definition.recommendedItems?.flatMap((group) => {
      const holder = byName.get(group.championName.toLowerCase());
      return holder ? [{ champion: holder.id, role: group.role, items: idsFor(group.itemNames) }] : [];
    }) ?? [
      ...carries.slice(0, 2).map((carry, index) => ({ champion: carry.id, role: index ? "secondary-carry" : "main-carry", items: carryItems(carry, index) })),
      { champion: mainTank.id, role: "main-tank", items: tankItems.slice(0, 3) },
    ];
    const boardPositions = definition.boardPositions
      ? Object.fromEntries(Object.entries(definition.boardPositions).flatMap(([name, position]) => {
        const unit = byName.get(name.toLowerCase());
        return unit ? [[unit.id, position]] : [];
      }))
      : undefined;
    const requiredEmblems = definition.requiredEmblems?.flatMap((emblem) => {
      const holder = byName.get(emblem.holderName.toLowerCase());
      const item = itemByName.get(emblem.itemName.toLowerCase());
      return holder && item ? [{ trait: emblem.trait, holder: holder.id, item, note: emblem.note }] : [];
    });
    return [{
      id: definition.id, name: definition.name, tier: definition.tier, playstyle: definition.playstyle,
      source: definition.source, sourcePatch: definition.sourcePatch,
      units: units.map((unit) => unit.id), coreUnits: [...carries.map((unit) => unit.id), mainTank.id],
      carries: carries.map((unit) => unit.id), mainTank: mainTank.id, recommendedItems,
      ...(boardPositions ? { boardPositions } : {}),
      ...(definition.positioningNote ? { positioningNote: definition.positioningNote } : {}),
      ...(requiredEmblems?.length ? { requiredEmblems } : {}),
      traits: definition.traits || [], description: definition.description,
    }];
  });
}

const augmentEntries = raw.items
  .filter((entry) => entry.isAugment && setData.augments.includes(entry.apiName))
  .filter((entry) => entry.name && !entry.name.startsWith("tft_") && entry.name !== "-")
  .filter((entry, index, all) => all.findIndex((candidate) => candidate.apiName === entry.apiName) === index);
const playableNames = playable.map((champion) => champion.name.toLowerCase()).filter((name) => name.length >= 3);

function augmentMatch(comp, entry) {
  const text = `${entry.name} ${entry.desc || ""}`.toLowerCase();
  const compUnits = comp.units.map((id) => champions.find((champion) => champion.id === id)).filter(Boolean);
  const unitNames = compUnits.map((unit) => unit.name.toLowerCase());
  const traitCounts = compUnits.flatMap((unit) => unit.traits).reduce((counts, trait) => counts.set(trait, (counts.get(trait) || 0) + 1), new Map());
  const mainTrait = comp.traits.find((trait) => text.includes(trait.toLowerCase()));
  const secondaryTrait = [...traitCounts.entries()]
    .filter(([trait, count]) => count >= 2 && !comp.traits.includes(trait) && text.includes(trait.toLowerCase()))
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0];
  const matchedTrait = mainTrait || secondaryTrait;
  const matchedUnit = compUnits.find((unit) => unit.name.length >= 3 && text.includes(unit.name.toLowerCase()));
  const mentionsOutsideUnit = playableNames.some((name) => !unitNames.includes(name) && text.includes(name));
  const carryRoles = compUnits.filter((unit) => comp.carries.includes(unit.id)).map((unit) => unit.role);
  const attackTeam = carryRoles.some((role) => role === "backline-carry" || role === "melee-carry");
  const tankCount = compUnits.filter((unit) => unit.role === "frontline").length;
  let score = mainTrait ? 165 : secondaryTrait ? 105 : 0;
  score += matchedUnit ? 85 : 0;
  if (mentionsOutsideUnit && !matchedUnit) score -= 100;
  if (attackTeam && /attack damage|attack speed|critical|attacks deal|damage amp/i.test(text)) score += 15;
  if (/ability power|mana|casts|ability damage/i.test(text)) score += carryRoles.some((role) => role === "support" || role === "backline-carry") ? 13 : 5;
  if (tankCount >= 3 && /health|armor|magic resist|shield|durability/i.test(text)) score += 12;
  if (/experience|level|gold|shop|reroll|team size/i.test(text)) score += 4;
  const reason = matchedTrait
    ? `Directly supports ${matchedTrait}.`
    : matchedUnit
      ? `Directly strengthens ${matchedUnit.name} in this board.`
      : tankCount >= 3 && /health|armor|magic resist|shield|durability/i.test(text)
        ? "Matches this team's frontline-heavy setup."
        : /ability power|mana|casts|ability damage/i.test(text)
          ? "Supports this team's ability and casting pattern."
          : attackTeam && /attack damage|attack speed|critical|damage/i.test(text)
            ? "Supports this team's primary damage carries."
            : "Provides flexible economy or board-strength value.";
  return { score, reason };
}

const comps = baseComps.map((comp) => {
  const recommendedAugments = augmentEntries
    .map((entry) => ({ entry, ...augmentMatch(comp, entry) }))
    .sort((a, b) => b.score - a.score || a.entry.name.localeCompare(b.entry.name))
    .slice(0, 5)
    .map(({ entry, reason }) => ({ augmentId: augmentId(entry.apiName), reason }));
  return { ...comp, recommendedAugments };
});
const augments = augmentEntries
  .map((entry) => ({ id: augmentId(entry.apiName), apiName: entry.apiName, name: augmentName(entry), description: cleanDescription(entry.desc) }))
  .sort((a, b) => a.name.localeCompare(b.name));

await mkdir(dataDir, { recursive: true });
if (args["augments-only"]) {
  await writeFile(path.join(dataDir, "augments.json"), `${JSON.stringify(augments, null, 2)}\n`);
  console.log(`Imported ${augments.length} available Set ${setNumber} augments without changing other set data.`);
  process.exit(0);
}
await Promise.all([
  writeFile(path.join(dataDir, "champions.json"), `${JSON.stringify(champions, null, 2)}\n`),
  writeFile(path.join(dataDir, "augments.json"), `${JSON.stringify(augments, null, 2)}\n`),
  writeFile(path.join(dataDir, "items.json"), `${JSON.stringify(items, null, 2)}\n`),
  writeFile(path.join(dataDir, "special-items.json"), `${JSON.stringify(specialItems, null, 2)}\n`),
  writeFile(path.join(dataDir, "traits.json"), `${JSON.stringify(traits, null, 2)}\n`),
  writeFile(path.join(dataDir, "comps.json"), `${JSON.stringify(comps, null, 2)}\n`),
]);

const assetJobs = [
  ...playable.map((entry) => () => download(assetUrl(entry.squareIcon || entry.icon), path.join(publicDir, "champions", `${championId(entry.apiName)}.png`))),
  ...itemEntries.map((entry) => () => download(assetUrl(entry.icon), path.join(publicDir, "items", `${itemId(entry.apiName)}.png`))),
  ...specialItemEntries.map((entry) => () => download(assetUrl(entry.icon), path.join(publicDir, "special-items", `${itemId(entry.apiName)}.png`))),
  ...traitEntries.map((entry) => () => download(assetUrl(entry.icon), path.join(publicDir, "traits", `${traitId(entry.apiName)}.png`))),
];
for (let index = 0; index < assetJobs.length; index += 12) await Promise.all(assetJobs.slice(index, index + 12).map((job) => job()));

const registryPath = path.join(root, "src", "data", "sets.json");
let registry = [];
try { registry = JSON.parse(await readFile(registryPath, "utf8")); } catch {}
const existingInfo = registry.find((entry) => entry.id === setId) || {};
const info = { ...existingInfo, id: setId, name: setName, number: setNumber, patch, source: existingInfo.source || dataUrl };
registry = [info, ...registry.filter((entry) => entry.id !== setId)].sort((a, b) => b.number - a.number);
await writeFile(registryPath, `${JSON.stringify(registry, null, 2)}\n`);

console.log(`Imported ${setName}: ${champions.length} champions, ${items.length} standard items, ${specialItems.length} special items, ${augments.length} available augments, ${traits.length} traits, ${comps.length} starter comps.`);
