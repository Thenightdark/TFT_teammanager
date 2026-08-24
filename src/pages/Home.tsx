import { useEffect, useMemo, useState } from "react";
import { Crown, Gem, ListOrdered, PackageOpen, SearchCheck, Swords } from "lucide-react";
import AppHeader from "../components/AppHeader";
import AugmentSelector from "../components/AugmentSelector";
import ChampionSelector from "../components/ChampionSelector";
import CompositionDetail from "../components/CompositionDetail";
import InventoryOverview from "../components/InventoryOverview";
import InventoryActions from "../components/InventoryActions";
import ItemSelector from "../components/ItemSelector";
import ResultsView from "../components/ResultsView";
import SettingsMenu from "../components/SettingsMenu";
import SpecialItemGuide from "../components/SpecialItemGuide";
import TeamTierList from "../components/TeamTierList";
import { availableSets, loadSetData } from "../data/setLoader";
import type { Champion } from "../types/Champion";
import type { SelectedItem, TFTItem } from "../types/Item";
import type { AppScreen, ChampionGridSize, CostFilter, DisplayMode, InventoryView, ItemFilter } from "../types/UiState";
import { recommendComps, type Recommendation } from "../utils/recommendationEngine";
import { clearSavedData, readSavedJson, readSavedString, saveJson, saveString, storageKeys } from "../utils/savedState";

export default function Home() {
  const defaultSetId = availableSets[0]?.id ?? "";
  const savedSetId = readSavedString(storageKeys.set, defaultSetId);
  const [activeSetId, setActiveSetId] = useState(availableSets.some((set) => set.id === savedSetId) ? savedSetId : defaultSetId);
  const [screen, setScreen] = useState<AppScreen>("inventory");
  const [inventoryView, setInventoryView] = useState<InventoryView>("champions");
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    const saved = readSavedJson<unknown>(storageKeys.champions, []);
    return Array.isArray(saved) ? saved.filter((id): id is string => typeof id === "string") : [];
  });
  const [search, setSearch] = useState("");
  const [costFilter, setCostFilter] = useState<CostFilter>("all");
  const [itemFilter, setItemFilter] = useState<ItemFilter>("all");
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>(() => {
    const saved = readSavedJson<unknown>(storageKeys.items, {});
    if (!saved || typeof saved !== "object" || Array.isArray(saved)) return {};
    return Object.fromEntries(Object.entries(saved).filter(([, quantity]) => typeof quantity === "number" && Number.isFinite(quantity) && quantity > 0).map(([id, quantity]) => [id, Math.floor(quantity as number)]));
  });
  const savedGridSize = readSavedString(storageKeys.gridSize, "medium");
  const [gridSize, setGridSize] = useState<ChampionGridSize>((["small", "medium", "large"] as string[]).includes(savedGridSize) ? savedGridSize as ChampionGridSize : "medium");
  const [showChampionNames, setShowChampionNames] = useState(() => readSavedJson(storageKeys.showNames, true));
  const savedDisplayMode = readSavedString(storageKeys.displayMode, "beginner");
  const [displayMode, setDisplayMode] = useState<DisplayMode>(savedDisplayMode === "expert" ? "expert" : "beginner");
  const [selectedAugmentIds, setSelectedAugmentIds] = useState<string[]>(() => {
    const saved = readSavedJson<unknown>(storageKeys.augments, []);
    return Array.isArray(saved) ? saved.filter((id): id is string => typeof id === "string").slice(0, 3) : [];
  });
  const [targetCompId, setTargetCompId] = useState("");
  const [favoriteCompIds, setFavoriteCompIds] = useState<string[]>(() => {
    const saved = readSavedJson<unknown>(storageKeys.favoriteComps, []);
    return Array.isArray(saved) ? saved.filter((id): id is string => typeof id === "string") : [];
  });
  const [compNotes, setCompNotes] = useState<Record<string, string>>(() => {
    const saved = readSavedJson<unknown>(storageKeys.compNotes, {});
    return saved && typeof saved === "object" && !Array.isArray(saved) ? Object.fromEntries(Object.entries(saved).filter(([, value]) => typeof value === "string")) : {};
  });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [activeRecommendation, setActiveRecommendation] = useState<Recommendation | null>(null);
  const [detailReturnScreen, setDetailReturnScreen] = useState<"inventory" | "results">("results");
  const setData = useMemo(() => loadSetData(activeSetId), [activeSetId]);
  const { champions, augments, items, specialItems, traits, comps } = setData;

  useEffect(() => {
    const championIds = new Set(champions.map((champion) => champion.id));
    const itemIds = new Set(items.map((item) => item.id));
    const augmentIds = new Set(augments.map((augment) => augment.id));
    setSelectedIds((current) => current.filter((id) => championIds.has(id)));
    setItemQuantities((current) => Object.fromEntries(Object.entries(current).filter(([id, quantity]) => itemIds.has(id) && quantity > 0)));
    setSelectedAugmentIds((current) => current.filter((id) => augmentIds.has(id)).slice(0, 3));
  }, [champions, items, augments]);

  useEffect(() => { saveString(storageKeys.set, activeSetId); }, [activeSetId]);
  useEffect(() => { saveJson(storageKeys.champions, selectedIds); }, [selectedIds]);
  useEffect(() => { saveJson(storageKeys.items, itemQuantities); }, [itemQuantities]);
  useEffect(() => { saveString(storageKeys.gridSize, gridSize); }, [gridSize]);
  useEffect(() => { saveJson(storageKeys.showNames, showChampionNames); }, [showChampionNames]);
  useEffect(() => { saveString(storageKeys.displayMode, displayMode); }, [displayMode]);
  useEffect(() => { saveJson(storageKeys.augments, selectedAugmentIds); }, [selectedAugmentIds]);
  useEffect(() => { saveJson(storageKeys.favoriteComps, favoriteCompIds); }, [favoriteCompIds]);
  useEffect(() => { saveJson(storageKeys.compNotes, compNotes); }, [compNotes]);

  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        document.querySelector<HTMLInputElement>('.search-bar input')?.focus();
      }
    };
    window.addEventListener("keydown", focusSearch);
    return () => window.removeEventListener("keydown", focusSearch);
  }, []);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const selectedChampions = selectedIds
    .map((id) => champions.find((champion) => champion.id === id))
    .filter((champion): champion is Champion => Boolean(champion));
  const selectedItems = items
    .filter((item) => (itemQuantities[item.id] ?? 0) > 0)
    .map((item): SelectedItem => ({ ...item, quantity: itemQuantities[item.id] }));

  const visibleChampions = useMemo(() => {
    const query = search.trim().toLowerCase();
    return champions.filter((champion) => {
      const matchesCost = costFilter === "all" || champion.cost === costFilter;
      const matchesSearch = !query || champion.name.toLowerCase().includes(query) || champion.traits.some((trait) => trait.toLowerCase().includes(query));
      return matchesCost && matchesSearch;
    });
  }, [champions, costFilter, search]);

  const toggleChampion = (champion: Champion) => {
    setErrorMessage("");
    setSelectedIds((current) => current.includes(champion.id) ? current.filter((id) => id !== champion.id) : [...current, champion.id]);
  };

  const addItem = (item: TFTItem) => {
    setItemQuantities((current) => {
      const quantity = current[item.id] ?? 0;
      if (item.type === "completed" && quantity > 0) {
        const next = { ...current };
        delete next[item.id];
        return next;
      }
      return { ...current, [item.id]: quantity + 1 };
    });
  };

  const removeItem = (itemOrId: TFTItem | string) => {
    const id = typeof itemOrId === "string" ? itemOrId : itemOrId.id;
    setItemQuantities((current) => {
      const quantity = current[id] ?? 0;
      const next = { ...current };
      if (quantity <= 1) delete next[id];
      else next[id] = quantity - 1;
      return next;
    });
  };

  const itemTotal = Object.values(itemQuantities).reduce((sum, quantity) => sum + quantity, 0);

  const findComps = () => {
    if (!selectedIds.length) {
      setErrorMessage("Select some champions before searching for compositions.");
      setScreen("inventory");
      return;
    }
    setErrorMessage("");
    setRecommendations(recommendComps(selectedIds, selectedItems, comps, items, selectedAugmentIds).slice(0, 5));
    setActiveRecommendation(null);
    setScreen("results");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const viewComp = (recommendation: Recommendation) => {
    setDetailReturnScreen("results");
    setActiveRecommendation(recommendation);
    setScreen("detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const viewTierComp = (comp: (typeof comps)[number]) => {
    const recommendation = recommendComps(selectedIds, selectedItems, [comp], items, selectedAugmentIds)[0];
    if (!recommendation) return;
    setDetailReturnScreen("inventory");
    setActiveRecommendation(recommendation);
    setScreen("detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const changeSet = (setId: string) => {
    setActiveSetId(setId);
    setSelectedIds([]);
    setItemQuantities({});
    setSelectedAugmentIds([]);
    setTargetCompId("");
    setSearch("");
    setCostFilter("all");
    setRecommendations([]);
    setActiveRecommendation(null);
    setErrorMessage("");
    setScreen("inventory");
  };

  const returnToFreshInventory = () => {
    setSearch("");
    setCostFilter("all");
    setItemFilter("all");
    setRecommendations([]);
    setActiveRecommendation(null);
    setErrorMessage("");
    setScreen("inventory");
  };

  const clearChampions = () => { setSelectedIds([]); returnToFreshInventory(); };
  const clearItems = () => { setItemQuantities({}); returnToFreshInventory(); };
  const resetAll = () => {
    if ((selectedIds.length || itemTotal) && !window.confirm("Clear all selected champions and items?")) return;
    setSelectedIds([]);
    setItemQuantities({});
    setSelectedAugmentIds([]);
    returnToFreshInventory();
  };
  const startNewGame = () => {
    setSelectedIds([]);
    setItemQuantities({});
    setSelectedAugmentIds([]);
    try {
      window.localStorage.removeItem(storageKeys.champions);
      window.localStorage.removeItem(storageKeys.items);
      window.localStorage.removeItem(storageKeys.augments);
    } catch { /* State is still cleared in memory. */ }
    returnToFreshInventory();
  };
  const resetSavedData = () => {
    if (!window.confirm("Reset selections and all saved settings?")) return;
    clearSavedData();
    setActiveSetId(defaultSetId);
    setGridSize("medium");
    setShowChampionNames(true);
    setDisplayMode("beginner");
    setSelectedIds([]);
    setItemQuantities({});
    setSelectedAugmentIds([]);
    setFavoriteCompIds([]);
    setCompNotes({});
    setSettingsOpen(false);
    returnToFreshInventory();
  };

  return (
    <div className="app-shell">
      <AppHeader sets={availableSets} activeSetId={activeSetId} onSetChange={changeSet} onOpenSettings={() => setSettingsOpen(true)} />

      <SettingsMenu open={settingsOpen} sets={availableSets} activeSetId={activeSetId} gridSize={gridSize} showChampionNames={showChampionNames} displayMode={displayMode} onClose={() => setSettingsOpen(false)} onSetChange={changeSet} onGridSizeChange={setGridSize} onShowChampionNamesChange={setShowChampionNames} onDisplayModeChange={setDisplayMode} onResetSavedData={resetSavedData} />

      <main>
        {screen === "inventory" && (
          <>
            <div className="hero-copy">
              <p className="eyebrow">BUILD YOUR INVENTORY</p>
              <h1>{inventoryView === "champions" ? "What champions do you have?" : inventoryView === "items" ? "What items do you have?" : inventoryView === "augments" ? "What augments were you offered?" : inventoryView === "special" ? "Who should hold your special items?" : "What are the strongest team comps?"}</h1>
              <p>{inventoryView === "champions" ? "Pick the units on your bench and board. We’ll use them to find your strongest paths." : inventoryView === "items" ? "Add components as many times as needed, or select the completed items you own." : inventoryView === "augments" ? "Select up to three offers to rerank comps around their best augment fits." : inventoryView === "special" ? "Browse Radiant and Artifact items to see their best-fitting holders in the active TFT set." : "Compare current team tiers, carries, tanks, and full lineups."}</p>
            </div>

            <InventoryOverview
              champions={selectedChampions}
              items={selectedItems}
              traits={traits}
              onRemoveChampion={(id) => setSelectedIds((current) => current.filter((value) => value !== id))}
              onRemoveItem={removeItem}
            />

            <InventoryActions championCount={selectedIds.length} itemCount={itemTotal} onClearChampions={clearChampions} onClearItems={clearItems} onResetAll={resetAll} onStartNewGame={startNewGame} />

            {!!setData.issues.length && <div className="data-warning" role="status"><strong>Some set data was unavailable.</strong><span>{setData.issues.join(" ")}</span></div>}
            {!!errorMessage && <div className="validation-message" role="alert">{errorMessage}</div>}

            <nav className="inventory-tabs" aria-label="Inventory sections">
              <button type="button" className={inventoryView === "champions" ? "active" : ""} onClick={() => setInventoryView("champions")}>
                <Swords size={17} /><span><strong>Champions</strong><small>{selectedChampions.length} selected</small></span>
              </button>
              <button type="button" className={inventoryView === "items" ? "active" : ""} onClick={() => setInventoryView("items")}>
                <PackageOpen size={17} /><span><strong>Items</strong><small>{itemTotal} selected</small></span>
              </button>
              <button type="button" className={inventoryView === "augments" ? "active" : ""} onClick={() => setInventoryView("augments")}>
                <Gem size={17} /><span><strong>Augments</strong><small>{selectedAugmentIds.length}/3 offered</small></span>
              </button>
              <button type="button" className={inventoryView === "special" ? "active" : ""} onClick={() => setInventoryView("special")}>
                <Crown size={17} /><span><strong>Radiant &amp; Artifacts</strong><small>{specialItems.length} guides</small></span>
              </button>
              <button type="button" className={inventoryView === "tiers" ? "active" : ""} onClick={() => setInventoryView("tiers")}>
                <ListOrdered size={17} /><span><strong>Team tiers</strong><small>{comps.length} ranked comps</small></span>
              </button>
            </nav>

            {inventoryView === "champions" && <ChampionSelector champions={visibleChampions} selectedIds={selectedSet} search={search} costFilter={costFilter} gridSize={gridSize} showNames={showChampionNames} onSearchChange={setSearch} onCostFilterChange={setCostFilter} onToggle={toggleChampion} />}
            {inventoryView === "items" && <ItemSelector items={items} filter={itemFilter} quantities={itemQuantities} onFilterChange={setItemFilter} onAdd={addItem} onRemove={removeItem} />}
            {inventoryView === "augments" && <AugmentSelector augments={augments} comps={comps} targetCompId={targetCompId} onTargetCompChange={setTargetCompId} selectedIds={new Set(selectedAugmentIds)} onToggle={(augment) => setSelectedAugmentIds((current) => current.includes(augment.id) ? current.filter((id) => id !== augment.id) : current.length < 3 ? [...current, augment.id] : current)} />}
            {inventoryView === "special" && <SpecialItemGuide items={specialItems} champions={champions} selectedChampionIds={selectedSet} />}
            {inventoryView === "tiers" && <TeamTierList comps={comps} champions={champions} onViewComp={viewTierComp} setInfo={setData.info} favoriteIds={new Set(favoriteCompIds)} />}

            <section className="find-comps-panel">
              <div><p className="eyebrow">READY TO COMPARE</p><h2>Find your strongest paths</h2><span>{selectedChampions.length} champions · {itemTotal} items · {selectedAugmentIds.length} augments</span></div>
              <button type="button" className="find-comps-button" onClick={findComps}><SearchCheck size={19} /> Find comps</button>
            </section>
          </>
        )}

        {screen === "results" && <ResultsView recommendations={recommendations} champions={champions} items={items} selectedChampionCount={selectedChampions.length} selectedItemCount={itemTotal} onEditInventory={() => setScreen("inventory")} onViewComp={viewComp} />}

        {screen === "detail" && activeRecommendation && <CompositionDetail recommendation={activeRecommendation} champions={champions} items={items} augments={augments} traits={traits} selectedChampionIds={selectedIds} selectedItems={selectedItems} selectedAugmentCount={selectedAugmentIds.length} selectedAugmentIds={selectedAugmentIds} displayMode={displayMode} favorite={favoriteCompIds.includes(activeRecommendation.comp.id)} note={compNotes[activeRecommendation.comp.id] ?? ""} onFavoriteChange={(favorite) => setFavoriteCompIds((current) => favorite ? [...new Set([...current, activeRecommendation.comp.id])] : current.filter((id) => id !== activeRecommendation.comp.id))} onNoteChange={(note) => setCompNotes((current) => ({ ...current, [activeRecommendation.comp.id]: note }))} backLabel={detailReturnScreen === "inventory" ? "Back to team tiers" : "Back to results"} onBack={() => { setScreen(detailReturnScreen); if (detailReturnScreen === "inventory") setInventoryView("tiers"); }} />}
      </main>

      <footer><span><i /> Runs locally</span><p>No connection to League of Legends. Your selections stay on this device.</p><strong>v0.1.0</strong></footer>
    </div>
  );
}
