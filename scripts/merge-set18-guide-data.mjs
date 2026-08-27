import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dataDirectory = path.join(root, "src", "data", "set-18");
const [comps, champions, items] = await Promise.all([
  readFile(path.join(dataDirectory, "comps.json"), "utf8").then(JSON.parse),
  readFile(path.join(dataDirectory, "champions.json"), "utf8").then(JSON.parse),
  readFile(path.join(dataDirectory, "items.json"), "utf8").then(JSON.parse),
]);

const guideData = [{"name":"Blossom Spellweavers","tier":"S","style":"Fast 8","units":["Karma","Yorick","Vi","Ahri","Sett","Sivir","Ashe","Gnar"],"items":[["Ahri",["Jeweled Gauntlet","Nashor's Tooth","Nashor's Tooth"]],["Sett",["Ionic Spark","Sunfire Cape","Warmog's Armor"]]],"early":["Karma","Rakan","Yorick","Yunara","Azir"],"positions":{"Yorick":2,"Vi":3,"Gnar":4,"Sett":5,"Ashe":21,"Sivir":23,"Karma":25,"Ahri":27},"options":[{"in":["Zyra","Lux (Blossom)"],"out":[]},{"in":["Zyra","Lux (Blossom)"],"out":["Gnar"]},{"in":["Yunara","Master Yi"],"out":["Vi","Sivir"]}]},{"name":"Caustic Adaptors","tier":"S","style":"Slow Roll (7) Emblem","units":["Yorick","Kogmaw","Krug","Master Yi","Vi","Nidalee","Sett","Gnar"],"items":[["Kogmaw",["Infinity Edge","Red Buff","Spear of Shojin"]],["Master Yi",["Brawler Emblem","Edge of Night","Guinsoo's Rageblade"]]],"early":["Yorick","Karma","Gromp","Master Yi","Vi"],"positions":{"Sett":1,"Yorick":2,"Vi":3,"Master Yi":4,"Krug":5,"Gnar":11,"Nidalee":26,"Kogmaw":27},"options":[{"in":["Gromp"],"out":[]},{"in":["Alistar","Gromp"],"out":["Gnar"]}]},{"name":"Consuming Flora","tier":"S","style":"Slow Roll (5) Augment","units":["Kobuko","RekSai","Veigar","Teemo","Fiddlesticks","Rammus","Sett","Gnar"],"items":[["RekSai",["Gargoyle Stoneplate","Sunfire Cape","Warmog's Armor"]],["Veigar",["Blue Buff","Jeweled Gauntlet"]]],"early":["Kobuko","RekSai","Veigar","Teemo","Fiddlesticks"],"positions":{"Kobuko":1,"Rammus":2,"Sett":3,"Gnar":4,"RekSai":5,"Fiddlesticks":17,"Teemo":21,"Veigar":27},"options":[{"in":["Ivern"],"out":[]},{"in":["Tristana"],"out":["Gnar"]}]},{"name":"Coven Invokers","tier":"S","style":"Fast 8","units":["Pebbles","Diana","Hecarim","Kogmaw","Brambleback","Morgana","Sentinel","Taric"],"items":[["Morgana",["Blue Buff","Morellonomicon","Void Staff"]],["Sentinel",["Gargoyle Stoneplate","Spirit Visage","Warmog's Armor"]]],"early":["Camille","Rakan","Caitlyn","Elise","Cassiopeia"],"positions":{"Taric":1,"Diana":2,"Hecarim":3,"Brambleback":4,"Sentinel":5,"Morgana":11,"Pebbles":21,"Kogmaw":27},"options":[{"in":["Alune","Ivern"],"out":[]},{"in":["Elise"],"out":["Taric"]}]},{"name":"Elderwood Rapidfire","tier":"S","style":"Fast 8","units":["Ornn","Xayah","Alistar","Leblanc","Aphelios","Lillia","Alune","Gnar"],"items":[["Aphelios",["Guinsoo's Rageblade","Infinity Edge","Kraken's Fury"]],["Lillia",["Gargoyle Stoneplate","Spirit Visage","Warmog's Armor"]]],"early":["Ornn","Varus","Xayah","Alistar","Shen"],"positions":{"Ornn":2,"Alistar":3,"Gnar":4,"Lillia":5,"Leblanc":21,"Alune":25,"Xayah":26,"Aphelios":27},"options":[{"in":["Diana","Ivern","Taric"],"out":[]},{"in":["Hecarim"],"out":["Alistar","Gnar"]}]},{"name":"Invoker Vanguards","tier":"S","style":"Fast 8","units":["Rakan","Diana","Kogmaw","Vi","Morgana","Nidalee","Sentinel","Taric"],"items":[["Morgana",["Morellonomicon","Void Staff"]],["Nidalee",["Guinsoo's Rageblade","Jeweled Gauntlet"]],["Sentinel",["Gargoyle Stoneplate","Warmog's Armor"]]],"early":["Camille","Rakan","Caitlyn","Elise","Kogmaw"],"positions":{"Taric":1,"Rakan":2,"Vi":3,"Diana":4,"Sentinel":5,"Morgana":11,"Kogmaw":26,"Nidalee":27},"options":[{"in":["Teemo","Alune","Ivern"],"out":[]},{"in":["Hecarim"],"out":["Taric"]}]},{"name":"Lunar Rapidfire","tier":"S","style":"Fast 8","units":["Diana","Hecarim","Mama Beak","Aphelios","Brambleback","Sentinel","Zyra","Taric"],"items":[["Aphelios",["Deathblade","Guinsoo's Rageblade","Infinity Edge"]],["Sentinel",["Gargoyle Stoneplate","Sunfire Cape","Warmog's Armor"]]],"early":["Ornn","Rakan","Varus","Xayah","Hecarim"],"positions":{"Taric":1,"Diana":2,"Hecarim":3,"Brambleback":4,"Sentinel":5,"Mama Beak":21,"Zyra":26,"Aphelios":27},"options":[{"in":["Alune","Ivern"],"out":[]},{"in":["Rakan","Elise"],"out":["Taric"]}]},{"name":"Two Tanky","tier":"S","style":"Slow Roll (7) Augment","units":["Cassiopeia","Cassiopeia","Fiddlesticks","Fiddlesticks","Rammus","Rammus","Soraka","Ivern"],"items":[["Cassiopeia",["Hextech Gunblade","Rabadon's Deathcap","Spear of Shojin"]],["Rammus",["Gargoyle Stoneplate","Spirit Visage","Sunfire Cape"]]],"early":["Leona","Ornn","Shen","Cassiopeia","Fiddlesticks"],"positions":{"Rammus":5,"Fiddlesticks":4,"Ivern":21,"Soraka":25,"Cassiopeia":27},"options":[{"in":["Soraka","Kennen"],"out":[]},{"in":["Soraka","Kennen"],"out":["Ivern"]}]},{"name":"Unrivaled","tier":"S","style":"Slow Roll (7) Augment","units":["Leblanc","Diana","Hecarim","Khazix","Rengar","Aphelios","Ezreal","Alune"],"items":[["Hecarim",["Gargoyle Stoneplate"]],["Khazix",["Edge of Night","Hand of Justice","Rabadon's Deathcap"]],["Rengar",["Edge of Night","Guinsoo's Rageblade","Titan's Resolve"]]],"early":["Ornn","Alistar","Leblanc","Khazix","Rengar"],"positions":{"Hecarim":2,"Diana":3,"Khazix":14,"Rengar":15,"Aphelios":21,"Ezreal":22,"Leblanc":26,"Alune":27},"options":[{"in":["Soraka","Kennen"],"out":[]},{"in":["Soraka","Kennen"],"out":["Alune"]}]},{"name":"Apex Predator","tier":"A","style":"Fast 9","units":["Amumu","Sentinel","Draven","Elder Dragon","Ivern","Kennen","Maokai","Taric"],"items":[["Elder Dragon",["Infinity Edge","Last Whisper","Striker's Flail"]],["Maokai",["Gargoyle Stoneplate","Protector's Vow","Spirit Visage"]]],"early":["Akali","Gromp","Murkwolf","Shen","Krug"],"positions":{"Taric":1,"Sentinel":2,"Amumu":3,"Kennen":4,"Maokai":5,"Elder Dragon":20,"Ivern":21,"Draven":27},"options":[{"in":["Kogmaw","Soraka","Ashe","Lux (Inferno)"],"out":["Draven"]}]},{"name":"Blackthorn Sprykin","tier":"A","style":"Slow Roll (5)","units":["Kobuko","RekSai","Veigar","Fiddlesticks","Rammus","Tristana","Sett","Gnar"],"items":[["RekSai",["Gargoyle Stoneplate","Sunfire Cape","Warmog's Armor"]],["Veigar",["Jeweled Gauntlet","Nashor's Tooth","Nashor's Tooth"]]],"early":["Kobuko","RekSai","Veigar","Leblanc","Rammus"],"positions":{"Kobuko":1,"Rammus":2,"Fiddlesticks":3,"Sett":4,"RekSai":5,"Gnar":11,"Tristana":21,"Veigar":27},"options":[{"in":["Ivern"],"out":[]},{"in":["Soraka"],"out":["Sett","Gnar"]}]},{"name":"Blossom Executioners","tier":"A","style":"Slow Roll (6)","units":["Alistar","Leblanc","Yunara","Ahri","Ezreal","Sett","Soraka","Kennen"],"items":[["Alistar",["Gargoyle Stoneplate","Sunfire Cape","Warmog's Armor"]],["Yunara",["Deathblade","Spear of Shojin","Striker's Flail"]],["Ezreal",["Last Whisper"]]],"early":["Rakan","Yorick","Karma","Leblanc","Yunara"],"positions":{"Sett":2,"Kennen":3,"Alistar":4,"Leblanc":21,"Ahri":22,"Soraka":25,"Ezreal":26,"Yunara":27},"options":[{"in":["Amumu","Ivern"],"out":[]},{"in":["Azir"],"out":["Kennen"]}]},{"name":"Elderwood","tier":"A","style":"Standard","units":["Ornn","Xayah","Alistar","Leblanc","Hecarim","Ezreal","Soraka","Gnar"],"items":[["Hecarim",["Gargoyle Stoneplate","Warmog's Armor","Sunfire Cape"]],["Ezreal",["Deathblade","Infinity Edge","Spear of Shojin"]]],"early":["Ornn","Xayah","Alistar","Leblanc","Hecarim"],"positions":{"Ornn":2,"Alistar":3,"Gnar":4,"Hecarim":5,"Leblanc":21,"Xayah":23,"Soraka":25,"Ezreal":27},"options":[{"in":["Lux (Elderwood)","Taric"],"out":[]},{"in":["Kennen"],"out":["Soraka"]}]},{"name":"Elderwood Executioners","tier":"A","style":"Fast 9","units":["Alistar","Amumu","Ezreal","Draven","Gnar","Ivern","Kennen","Maokai","Taric"],"items":[["Ezreal",["Deathblade","Infinity Edge","Spear of Shojin"]],["Maokai",["Gargoyle Stoneplate","Protector's Vow","Spirit Visage"]]],"early":["Ornn","Varus","Xayah","Alistar","Shen"],"positions":{"Taric":1,"Alistar":2,"Amumu":3,"Gnar":4,"Maokai":5,"Kennen":6,"Ivern":21,"Draven":26,"Ezreal":27},"options":[{"in":["Sentinel","Lux (Elderwood)"],"out":["Draven","Ivern"]}]},{"name":"Fae Hunters","tier":"A","style":"Slow Roll (7)","units":["Rakan","Xayah","Rammus","Tristana","Vi","Sivir","Lillia","Gnar"],"items":[["Rammus",["Gargoyle Stoneplate","Sunfire Cape","Warmog's Armor"]],["Tristana",["Giant Slayer","Guinsoo's Rageblade","Kraken's Fury"]],["Sivir",["Last Whisper"]]],"early":["Kobuko","Rakan","Xayah","Rammus","Tristana"],"positions":{"Rakan":1,"Vi":2,"Lillia":3,"Gnar":4,"Rammus":5,"Xayah":21,"Sivir":26,"Tristana":27},"options":[{"in":["Ivern","Taric"],"out":[]},{"in":["Kobuko"],"out":["Gnar"]}]},{"name":"Fae Spellweavers","tier":"A","style":"Fast 8","units":["Karma","Rakan","Yorick","Diana","Fiddlesticks","Ahri","Lillia","Alune"],"items":[["Ahri",["Jeweled Gauntlet","Nashor's Tooth","Nashor's Tooth"]],["Lillia",["Ionic Spark","Sunfire Cape","Warmog's Armor"]]],"early":["Karma","Rakan","Yorick","Yunara","Azir"],"positions":{"Rakan":1,"Yorick":2,"Fiddlesticks":3,"Diana":4,"Lillia":5,"Karma":21,"Alune":26,"Ahri":27},"options":[{"in":["Zyra"],"out":[]}]},{"name":"Flora Executioners","tier":"A","style":"Fast 8","units":["Fiddlesticks","Amumu","Lillia","Malphite","Soraka","Ivern","Kennen","Maokai"],"items":[["Malphite",["Gargoyle Stoneplate","Spirit Visage","Warmog's Armor"]],["Soraka",["Jeweled Gauntlet","Nashor's Tooth","Nashor's Tooth"]]],"early":["Akali","Varus","Leblanc","Shen","Fiddlesticks"],"positions":{"Malphite":3,"Fiddlesticks":16,"Amumu":17,"Maokai":18,"Lillia":19,"Kennen":20,"Ivern":21,"Soraka":27},"options":[{"in":["Azir","Lux (Inferno)","Taric"],"out":[]}]},{"name":"Juggernaut Hunters","tier":"A","style":"Slow Roll (6)","units":["Rakan","Caitlyn","Scuttlecrab","Sejuani","Tristana","Vi","Sivir","Ashe"],"items":[["Caitlyn",["Guinsoo's Rageblade","Kraken's Fury","Kraken's Fury"]],["Scuttlecrab",["Gargoyle Stoneplate","Sunfire Cape","Warmog's Armor"]],["Sivir",["Last Whisper"]]],"early":["Rakan","Caitlyn","Sejuani","Scuttlecrab","Vi"],"positions":{"Sejuani":2,"Rakan":3,"Vi":4,"Scuttlecrab":5,"Tristana":21,"Ashe":25,"Sivir":26,"Caitlyn":27},"options":[{"in":["Cinderling","Taric"],"out":[]},{"in":["Cinderling","Taric"],"out":["Ashe"]}]},{"name":"Juggernaut Summoners","tier":"A","style":"Fast 8","units":["Yorick","Azir","Malphite","Soraka","Zyra","Ivern","Kennen","Maokai"],"items":[["Malphite",["Gargoyle Stoneplate","Protector's Vow","Warmog's Armor"]],["Zyra",["Morellonomicon","Spear of Shojin","Void Staff"]]],"early":["Karma","Yorick","Sejuani","Yunara","Fiddlesticks"],"positions":{"Malphite":3,"Maokai":16,"Yorick":17,"Kennen":18,"Soraka":21,"Azir":23,"Ivern":25,"Zyra":27},"options":[{"in":["Fiddlesticks","Ezreal","Taric"],"out":[]}]},{"name":"Primal Adaptors","tier":"A","style":"Fast 8","units":["Akali","Diana","Kogmaw","Master Yi","Vi","Amumu","Nidalee","Sentinel"],"items":[["Amumu",["Gargoyle Stoneplate","Spirit Visage","Warmog's Armor"]],["Nidalee",["Jeweled Gauntlet","Nashor's Tooth","Nashor's Tooth"]]],"early":["Akali","Ornn","Varus","Shen","Master Yi"],"positions":{"Diana":1,"Vi":2,"Sentinel":3,"Master Yi":4,"Amumu":5,"Akali":6,"Kogmaw":26,"Nidalee":27},"options":[{"in":["Ivern","Lux (Blossom)","Taric"],"out":[]},{"in":["Gromp","Scuttlecrab","Taric"],"out":["Akali","Diana","Amumu"]}]},{"name":"Primal Hunters","tier":"A","style":"Fast 8","units":["Shen","Tristana","Vi","Amumu","Lillia","Sivir","Ashe","Kennen"],"items":[["Amumu",["Gargoyle Stoneplate","Spirit Visage","Warmog's Armor"]],["Sivir",["Deathblade","Infinity Edge","Striker's Flail"]]],"early":["Camille","Rakan","Caitlyn","Elise","Tristana"],"positions":{"Shen":1,"Vi":2,"Lillia":3,"Kennen":4,"Amumu":5,"Tristana":21,"Ashe":26,"Sivir":27},"options":[{"in":["Ivern"],"out":[]},{"in":["Ivern"],"out":["Kennen"]}]},{"name":"Riftbeast Ravagers","tier":"A","style":"Fast 8","units":["Pebbles","Murkwolf","Krug","Sentinel","Brambleback","Elder Dragon","Taric"],"items":[["Sentinel",["Gargoyle Stoneplate","Protector's Vow","Warmog's Armor"]],["Brambleback",["Edge of Night","Giant Slayer","Quicksilver"]]],"early":["Cinderling","Pebbles","Murkwolf","Scuttlecrab","Krug"],"positions":{"Krug":1,"Pebbles":2,"Taric":3,"Brambleback":4,"Sentinel":5,"Murkwolf":6,"Elder Dragon":12},"options":[{"in":["Gnar","Ivern"],"out":[]}]},{"name":"Rivals Khazix","tier":"A","style":"Slow Roll (7)","units":["Diana","Hecarim","Mama Beak","Khazix","Aphelios","Brambleback","Sentinel","Taric"],"items":[["Hecarim",["Gargoyle Stoneplate","Sunfire Cape","Warmog's Armor"]],["Khazix",["Edge of Night","Hand of Justice","Jeweled Gauntlet"]]],"early":["Akali","Gromp","Murkwolf","Scuttlecrab","Khazix"],"positions":{"Taric":1,"Diana":2,"Sentinel":3,"Khazix":4,"Hecarim":5,"Aphelios":21,"Mama Beak":27},"options":[{"in":["Zyra","Alune","Ivern"],"out":[]},{"in":["Rakan","Elise"],"out":["Taric"]}]},{"name":"Rivals Rengar","tier":"A","style":"Slow Roll (7)","units":["Diana","Hecarim","Mama Beak","Rengar","Aphelios","Brambleback","Sentinel","Taric"],"items":[["Hecarim",["Gargoyle Stoneplate","Sunfire Cape","Warmog's Armor"]],["Rengar",["Edge of Night","Guinsoo's Rageblade","Titan's Resolve"]]],"early":["Akali","Gromp","Murkwolf","Scuttlecrab","Rengar"],"positions":{"Taric":1,"Diana":2,"Sentinel":3,"Rengar":4,"Hecarim":5,"Aphelios":21,"Mama Beak":27},"options":[{"in":["Zyra","Alune","Ivern"],"out":[]},{"in":["Rakan","Elise"],"out":["Taric"]}]},{"name":"Solar Rapidfire","tier":"A","style":"Slow Roll (6)","units":["Leona","Varus","Kayle","Sejuani","Shen","Diana","Aphelios","Alune"],"items":[["Kayle",["Guinsoo's Rageblade","Guinsoo's Rageblade","Jeweled Gauntlet"]],["Sejuani",["Gargoyle Stoneplate","Spirit Visage","Warmog's Armor"]]],"early":["Leona","Varus","Kayle","Sejuani","Shen"],"positions":{"Leona":2,"Shen":3,"Diana":4,"Sejuani":5,"Aphelios":21,"Varus":23,"Alune":25,"Kayle":27},"options":[{"in":["Amumu"],"out":[]},{"in":["Amumu","Kennen"],"out":["Alune"]}]},{"name":"Sprykin Hunters","tier":"A","style":"Slow Roll (7)","units":["Kobuko","Teemo","Rammus","Tristana","Sentinel","Lillia","Ashe","Gnar"],"items":[["Rammus",["Gargoyle Stoneplate","Sunfire Cape","Warmog's Armor"]],["Tristana",["Guinsoo's Rageblade","Infinity Edge","Kraken's Fury"]]],"early":["Kobuko","Veigar","Teemo","Rammus","Tristana"],"positions":{"Kobuko":1,"Sentinel":2,"Lillia":3,"Gnar":4,"Rammus":5,"Teemo":21,"Ashe":26,"Tristana":27},"options":[{"in":["Ivern","Taric"],"out":[]},{"in":["Sivir"],"out":["Ashe"]},{"in":["Vi","Sivir"],"out":["Sentinel","Ashe"]}]},{"name":"Sprykin Invokers","tier":"A","style":"Slow Roll (6)","units":["Kobuko","Teemo","Rammus","Tristana","Sentinel","Lillia","Gnar","Taric"],"items":[["Teemo",["Jeweled Gauntlet","Nashor's Tooth","Nashor's Tooth"]],["Sentinel",["Gargoyle Stoneplate","Sunfire Cape","Warmog's Armor"]]],"early":["Kobuko","Pebbles","Shen","Teemo","Rammus"],"positions":{"Taric":1,"Kobuko":2,"Sentinel":3,"Lillia":4,"Rammus":5,"Gnar":11,"Tristana":21,"Teemo":27},"options":[{"in":["Morgana","Ivern"],"out":[]}]},{"name":"Blackthorn Ravagers","tier":"B","style":"Slow Roll (6)","units":["RekSai","Murkwolf","Warwick","Azir","Diana","Krug","Brambleback","Malphite"],"items":[["Warwick",["Spear of Shojin","Sterak's Gage","Titan's Resolve"]],["Malphite",["Gargoyle Stoneplate","Sunfire Cape","Warmog's Armor"]]],"early":["RekSai","Veigar","Murkwolf","Warwick","Azir"],"positions":{"Malphite":3,"Brambleback":14,"Diana":15,"RekSai":16,"Murkwolf":18,"Krug":19,"Warwick":20,"Azir":27},"options":[{"in":["Alune","Ivern","Taric"],"out":[]},{"in":["Akali"],"out":["Diana"]}]},{"name":"Eclipse Rapidfire","tier":"B","style":"Fast 8","units":["Leona","Rakan","Kayle","Sejuani","Diana","Aphelios","Lillia","Alune"],"items":[["Aphelios",["Deathblade","Guinsoo's Rageblade","Infinity Edge"]],["Lillia",["Protector's Vow","Sunfire Cape","Warmog's Armor"]]],"early":["Leona","Rakan","Xayah","Kayle","Sejuani"],"positions":{"Rakan":1,"Leona":2,"Sejuani":3,"Diana":4,"Lillia":5,"Alune":21,"Kayle":26,"Aphelios":27},"options":[{"in":["Ivern","Lux (Lunar)"],"out":[]},{"in":["Maokai","Taric"],"out":["Rakan","Lillia"]}]},{"name":"Fae Rapidfire","tier":"B","style":"Slow Roll (5)","units":["Ornn","Rakan","Varus","Xayah","Hecarim","Tristana","Amumu","Lillia"],"items":[["Ornn",["Gargoyle Stoneplate","Spirit Visage","Warmog's Armor"]],["Xayah",["Guinsoo's Rageblade","Infinity Edge","Kraken's Fury"]]],"early":["Ornn","Rakan","Varus","Xayah","Shen"],"positions":{"Hecarim":1,"Rakan":2,"Amumu":3,"Lillia":4,"Ornn":5,"Varus":21,"Tristana":26,"Xayah":27},"options":[{"in":["Aphelios","Ivern"],"out":[]}]},{"name":"Riftbeast Summoners","tier":"B","style":"Slow Roll (7)","units":["Yorick","Diana","Krug","Mama Beak","Sentinel","Aphelios","Sett","Zyra"],"items":[["Krug",["Gargoyle Stoneplate","Sunfire Cape","Warmog's Armor"]],["Mama Beak",["Deathblade","Guinsoo's Rageblade","Infinity Edge"]]],"early":["Cinderling","Pebbles","Scuttlecrab","Krug","Mama Beak"],"positions":{"Sentinel":1,"Yorick":2,"Sett":3,"Diana":4,"Krug":5,"Zyra":25,"Aphelios":26,"Mama Beak":27},"options":[{"in":["Ashe","Ivern","Maokai"],"out":[]},{"in":["Alistar","Gnar"],"out":["Diana"]},{"in":["Xayah","Alistar","Gnar"],"out":["Yorick","Diana","Aphelios"]}]},{"name":"Solar Riftbeasts","tier":"B","style":"Slow Roll (6)","units":["Akali","Leona","Gromp","Kayle","Murkwolf","Scuttlecrab","Sejuani","Shen"],"items":[["Gromp",["Jeweled Gauntlet","Nashor's Tooth","Nashor's Tooth"]],["Scuttlecrab",["Gargoyle Stoneplate","Spirit Visage","Warmog's Armor"]]],"early":["Cinderling","Gromp","Murkwolf","Scuttlecrab","Krug"],"positions":{"Sejuani":1,"Leona":2,"Shen":3,"Murkwolf":4,"Scuttlecrab":5,"Akali":6,"Kayle":21,"Gromp":27},"options":[{"in":["Nidalee","Ivern"],"out":[]},{"in":["Varus"],"out":["Shen"]}]}];

const normalized = (value) => value.toLowerCase().replace(/[^a-z0-9]/g, "");
const slug = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const championByName = new Map(champions.map((entry) => [normalized(entry.name), entry]));
const itemByName = new Map(items.map((entry) => [normalized(entry.name), entry]));
const aliases = new Map([
  ["sentinel", "ancientsentinel"],
  ["elderdragon", "theelderdragon"],
  ["luxblossom", "luxelderwood"],
  ["luxlunar", "luxelderwood"],
  ["reksai", "reksai"],
  ["kogmaw", "kogmaw"],
  ["khazix", "khazix"],
]);
const championFor = (name) => championByName.get(aliases.get(normalized(name)) ?? normalized(name));
const itemFor = (name) => itemByName.get(normalized(name));

const mappedGuideNames = {
  "Blossom Spellweavers": "Wispful Thinking",
  "Caustic Adaptors": "Adapt or Die",
  "Consuming Flora": "Kill, Stack, Repeat",
  "Coven Invokers": "Mana Go Brrr",
  "Elderwood Rapidfire": "Wrath of the Woods",
  "Invoker Vanguards": "Primal Spear",
  "Lunar Rapidfire": "Apheliguards",
  "Two Tanky": "Double Trouble Cass",
  "Unrivaled": "Unrivaled",
  "Apex Predator": "AD Exodia",
  "Blossom Executioners": "Yunalistar",
  "Elderwood Executioners": "The Final Forest",
  "Fae Hunters": "Fae and Furious",
  "Fae Spellweavers": "Weave Got This",
  "Flora Executioners": "AP 8-4",
  "Juggernaut Hunters": "Crablyn",
  "Rivals Rengar": "Thrill of the Hunt",
  "Solar Rapidfire": "Solar Flare",
  "Sprykin Hunters": "The Spry Squad",
  "Blackthorn Ravagers": "Warwick’s Wolf Pack",
  "Fae Rapidfire": "Feather & Forge",
  "Riftbeast Ravagers": "Riftbeast Ascension",
};

const tierOverrides = {
  "AD Exodia": "S",
  "AP 8-4": "S",
  "Kill, Stack, Repeat": "S",
  "The Final Forest": "A",
  "The Spry Squad": "A",
  "Riftbeast Ascension": "A",
};

const defaultCarryItems = ["tft-item-guinsoos-rageblade", "tft-item-jeweled-gauntlet", "tft-item-spear-of-shojin"];
const defaultTankItems = ["tft-item-gargoyle-stoneplate", "tft-item-red-buff", "tft-item-warmogs-armor"];

function roleFor(champion, itemNames, index) {
  const tankSignals = new Set(["gargoylestoneplate", "spiritvisage", "sunfirecape", "warmogsarmor", "protectorsvow"]);
  if (itemNames.some((name) => tankSignals.has(normalized(name))) && champion.role === "frontline") return index === 0 ? "main-tank" : "secondary-tank";
  return index === 0 ? "main-carry" : "secondary-carry";
}

function itemGroups(guide, fallback) {
  return guide.items.map(([holderName, itemNames], index) => {
    const champion = championFor(holderName);
    if (!champion) throw new Error(`${guide.name}: unknown item holder ${holderName}`);
    const prior = fallback?.recommendedItems?.find((group) => group.champion === champion.id)?.items ?? [];
    const resolved = itemNames.map((name) => itemFor(name)?.id).filter(Boolean);
    const role = roleFor(champion, itemNames, index);
    const defaults = role.includes("tank") ? defaultTankItems : defaultCarryItems;
    for (const candidate of [...prior, ...defaults]) {
      if (resolved.length >= 3) break;
      if (!resolved.includes(candidate)) resolved.push(candidate);
    }
    return { champion: champion.id, role, items: resolved.slice(0, 3) };
  });
}

function boardPositions(guide) {
  return Object.fromEntries(Object.entries(guide.positions).flatMap(([name, index]) => {
    const champion = championFor(name);
    return champion ? [[champion.id, [Math.floor(index / 7), index % 7]]] : [];
  }));
}

function guideOptions(guide) {
  return guide.options.map((option) => ({
    add: option.in.map((name) => championFor(name)?.id).filter(Boolean),
    remove: option.out.map((name) => championFor(name)?.id).filter(Boolean),
  })).filter((option) => option.add.length);
}

function requiredEmblems(groups) {
  return groups.flatMap((group) => group.items.flatMap((itemId) => {
    const item = items.find((entry) => entry.id === itemId);
    if (!item?.name.endsWith(" Emblem")) return [];
    const trait = item.name.replace(/ Emblem$/, "");
    return [{ trait, holder: group.champion, item: item.id, note: `${trait} Emblem is required for the listed trait breakpoint.` }];
  }));
}

function nearestComp(unitIds) {
  const target = new Set(unitIds);
  return comps.map((comp) => {
    const current = new Set(comp.units);
    const overlap = [...target].filter((id) => current.has(id)).length;
    return { comp, score: overlap / new Set([...target, ...current]).size };
  }).sort((a, b) => b.score - a.score)[0]?.comp;
}

function buildComp(guide, existing) {
  const units = guide.units.map((name) => championFor(name)?.id);
  if (units.some((id) => !id)) throw new Error(`${guide.name}: unknown board unit`);
  const groups = itemGroups(guide, existing);
  const coreUnits = [...new Set([...groups.map((group) => group.champion), ...units.slice(0, 3)])];
  const mainTank = groups.find((group) => group.role === "main-tank")?.champion;
  const carries = groups.filter((group) => group.role?.includes("carry")).map((group) => group.champion);
  const traits = [...new Set(units.flatMap((id) => champions.find((entry) => entry.id === id)?.traits ?? []))];
  const earlyUnits = guide.early.map((name) => championFor(name)?.id).filter(Boolean);
  const recommendations = existing?.recommendedAugments ?? nearestComp(units)?.recommendedAugments ?? [];
  const name = existing?.name ?? guide.name;
  const result = {
    ...(existing ?? {}),
    id: existing?.id ?? slug(guide.name),
    name,
    tier: tierOverrides[name] ?? (existing?.tier === "S" && guide.tier === "A" ? "S" : guide.tier),
    playstyle: guide.style,
    source: "Curated Set 18",
    sourcePatch: "Set 18 · Cross-checked Aug 27",
    units,
    coreUnits,
    carries,
    ...(mainTank ? { mainTank } : {}),
    threeStarTargets: /slow roll/i.test(guide.style) ? [...new Set(units.filter((id) => (champions.find((entry) => entry.id === id)?.cost ?? 6) <= 3))] : [],
    boardPositions: boardPositions(guide),
    earlyUnits,
    guideOptions: guideOptions(guide),
    requiredEmblems: requiredEmblems(groups),
    recommendedItems: groups,
    recommendedAugments: recommendations,
    traits,
    description: existing?.description ?? `A current Set 18 ${guide.style.toLowerCase()} composition built around ${groups.map((group) => champions.find((entry) => entry.id === group.champion)?.name).filter(Boolean).join(" and ")}.`,
    positioningNote: "Use the displayed hex plan as the default board, including frontline Gnar where shown. Scout opponents and mirror the board only when needed.",
  };
  if (!result.requiredEmblems.length) delete result.requiredEmblems;
  if (!result.threeStarTargets.length) delete result.threeStarTargets;
  return result;
}

const guideByName = new Map(guideData.map((entry) => [entry.name, entry]));
const existingByName = new Map(comps.map((entry) => [entry.name, entry]));
const mappedAppNames = new Set(Object.values(mappedGuideNames));
const merged = comps.map((comp) => {
  if (!mappedAppNames.has(comp.name)) return comp;
  const guideName = Object.entries(mappedGuideNames).find(([, appName]) => appName === comp.name)?.[0];
  return buildComp(guideByName.get(guideName), comp);
});
for (const guide of guideData) {
  if (mappedGuideNames[guide.name]) continue;
  if (existingByName.has(guide.name)) continue;
  merged.push(buildComp(guide));
}

await writeFile(path.join(dataDirectory, "comps.json"), `${JSON.stringify(merged, null, 2)}\n`);
console.log(`Merged ${guideData.length} verified guide boards into ${merged.length} Set 18 comps.`);


