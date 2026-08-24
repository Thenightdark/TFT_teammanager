import { Save, Star } from "lucide-react";
import { useEffect, useState } from "react";

interface FavoriteNotesProps { favorite: boolean; note: string; onFavoriteChange: (favorite: boolean) => void; onNoteChange: (note: string) => void; }

export default function FavoriteNotes({ favorite, note, onFavoriteChange, onNoteChange }: FavoriteNotesProps) {
  const [draft, setDraft] = useState(note);
  useEffect(() => setDraft(note), [note]);
  return <section className="detail-panel favorite-notes"><div className="detail-section-title"><Star size={17} /><h2>My comp</h2></div><button type="button" className={favorite ? "favorite active" : "favorite"} onClick={() => onFavoriteChange(!favorite)}><Star size={15} fill={favorite ? "currentColor" : "none"} />{favorite ? "Saved to favorites" : "Add to favorites"}</button><label><span>Personal notes</span><textarea value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Example: Only play with a Bow opener…" maxLength={500} /></label><button type="button" className="save-note" onClick={() => onNoteChange(draft)}><Save size={14} /> Save note</button></section>;
}
