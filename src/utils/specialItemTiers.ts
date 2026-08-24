import type { SpecialItem } from "../types/SpecialItem";

export type SpecialItemTier = "S" | "A" | "B" | "C" | "D" | "F" | "U";

export const specialItemTierSource = {
  label: "MetaBot Set 17 item statistics",
  updated: "23 Aug 2026",
  url: "https://metabot.gg/en/TFT/17/items/tier-list",
} as const;

const tierNames: Record<Exclude<SpecialItemTier, "U">, string[]> = {
  S: [],
  A: ["Radiant Hextech Gunblade", "Radiant Sterak's Gage", "Radiant Striker's Flail", "Radiant Quicksilver", "Radiant Red Buff"],
  B: ["Sympathetic Implant", "Radiant Giant Slayer", "Radiant Jeweled Gauntlet", "Radiant Infinity Edge", "Radiant Ionic Spark", "Radiant Protector's Vow", "Radiant Warmog's Armor", "Malware Matrix", "Zhonya's Paradox", "Radiant Last Whisper", "Radiant Bramble Vest", "Radiant Archangel's Staff"],
  C: ["Radiant Kraken's Fury", "Radiant Deathblade", "Radiant Crownguard", "Wit's End", "Fishbones", "Radiant Thief's Gloves", "Radiant Titan's Resolve", "Soraka's Miracle", "Lightshield Crest", "Radiant Nashor's Tooth", "Target-Lock Optics", "Radiant Rabadon's Deathcap", "The Indomitable", "Death's Defiance", "Lich Bane", "Prowler's Claw", "Mittens", "Titanic Hydra"],
  D: ["Infinity Force", "Radiant Gargoyle Stoneplate", "Radiant Void Staff", "Biomatter Preserver", "Radiant Adaptive Helm", "Radiant Blue Buff", "Silvermere Dawn", "Aegis of Dawn", "Drone Uplink", "Rapid Firecannon", "Radiant Edge of Night", "Evelynn's Instinct", "Mogul's Mail", "Radiant Morellonomicon", "Gold Collector", "Varus's Obsession", "Radiant Hand of Justice", "Blighting Jewel", "Cappa Juice", "Dawncore"],
  F: ["Radiant Spear of Shojin", "Radiant Guinsoo's Rageblade", "Ahri's Aura", "Thresh's Lantern", "Gambler's Blade", "Sniper's Focus", "Hullcrusher", "Flickerblades", "Radiant Evenshroud", "Void Gauntlet", "Radiant Sunfire Cape", "Radiant Dragon's Claw", "Radiant Steadfast Heart", "Aegis of Dusk", "Luden's Tempest", "Seeker's Armguard", "Hellfire Hatchet", "Yasuo's Bladework", "Talisman Of Ascension", "Statikk Shiv", "Radiant Bloodthirster", "Radiant Spirit Visage", "Eternal Pact"],
};

const tierByName = new Map<string, SpecialItemTier>(
  Object.entries(tierNames).flatMap(([tier, names]) => names.map((name) => [name.toLowerCase(), tier as SpecialItemTier])),
);

export function getSpecialItemTier(item: SpecialItem): SpecialItemTier {
  return tierByName.get(item.name.toLowerCase()) ?? "U";
}

export const specialItemTierLabels: Record<SpecialItemTier, string> = {
  S: "Meta defining",
  A: "Strong",
  B: "Good",
  C: "Average",
  D: "Below average",
  F: "Niche / weak stats",
  U: "Unranked",
};
