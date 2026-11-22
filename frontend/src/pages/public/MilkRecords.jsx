import { useEffect, useMemo, useState } from "react";
import { Milk, Sunrise, Sunset, Pencil, Trash2, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { listAnimals } from "../../services/animalService";
import { createMilkRecord, deleteMilkRecord, getDailyMilkSummary, listMilkRecords, updateMilkRecord } from "../../services/milkService";

const localDate = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };

const MilkRecords = () => {
  const { admin } = useAuth();
  const [date, setDate] = useState(localDate());
  const [animalFilter, setAnimalFilter] = useState("");
  const [session, setSession] = useState("morning");
  const [animalId, setAnimalId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [animals, setAnimals] = useState([]);
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editing, setEditing] = useState(null);

  useEffect(() => { listAnimals().then((all) => setAnimals(all.filter((a) => a.type === "cow" && a.gender === "female" && a.status === "active"))).catch(() => setAnimals([])); }, []);

  const refresh = async () => {
    const [nextRecords, nextSummary] = await Promise.all([listMilkRecords({ date, ...(animalFilter ? { animalId: animalFilter } : {}) }), getDailyMilkSummary(date)]);
    setRecords(nextRecords);
    setSummary(nextSummary);
  };

  useEffect(() => {
    let active = true;
    setLoading(true); setError("");
    Promise.allSettled([listMilkRecords({ date, ...(animalFilter ? { animalId: animalFilter } : {}) }), getDailyMilkSummary(date)])
      .then(([r, s]) => {
        if (!active) return;
        if (r.status === "fulfilled") setRecords(r.value); else setError(r.reason.response?.data?.message || "Milk records could not be loaded.");
        setSummary(s.status === "fulfilled" ? s.value : null);
      }).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [date, animalFilter]);

  const submit = async (event) => {
    event.preventDefault(); setError(""); setSuccess("");
    const amount = Number(quantity);
    if (!animalId || !Number.isFinite(amount) || amount < 0) { setError("Choose a cow and enter a valid non-negative quantity."); return; }
    setSaving(true);
    try {
      await createMilkRecord({ animalId, date, session, quantity: amount, notes });
      setSuccess("Milk record saved."); setQuantity(""); setNotes(""); await refresh();
    } catch (e) { setError(e.response?.data?.message || "Milk record could not be saved."); }
    finally { setSaving(false); }
  };

  const saveEdit = async (event) => {
    event.preventDefault(); setSaving(true); setError(""); setSuccess("");
    try {
      await updateMilkRecord(editing._id, { animalId: editing.animalId?._id || editing.animalId, date: editing.date, session: editing.session, quantity: Number(editing.quantity), notes: editing.notes || "" });
      setEditing(null); setSuccess("Milk record updated."); await refresh();
    } catch (e) { setError(e.response?.data?.message || "Milk record could not be updated."); }
    finally { setSaving(false); }
  };

  const removeRecord = async (record) => {
    if (!window.confirm(`Delete the ${record.session} milk record for ${record.animalId?.name || "this cow"}?`)) return;
    setError(""); setSuccess("");
    try { await deleteMilkRecord(record._id); setSuccess("Milk record deleted."); await refresh(); }
    catch (e) { setError(e.response?.data?.message || "Milk record could not be deleted."); }
  };

  const animalOptions = useMemo(() => animals.map((animal) => <option key={animal._id} value={animal._id}>{animal.name} · {animal.tagNumber}</option>), [animals]);
  return <div>
    <div className="page-heading"><div><div className="eyebrow">Daily collection</div><h1>Milk records</h1><p>Record and review daily milking.</p></div></div>
    <label className="date-control">Record date<input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
    <div className="milk-summary-grid">
      <MilkStat title="Morning milk" value={summary ? `${summary.morning} L` : "—"} icon={Sunrise} />
      <MilkStat title="Evening milk" value={summary ? `${summary.evening} L` : "—"} icon={Sunset} />
      <MilkStat title="Daily total" value={summary ? `${summary.dailyTotal} L` : "—"} icon={Milk} />
    </div>
    {admin && <form className="milk-entry panel" onSubmit={submit}>
      <h2>Add milk record</h2>
      <div className="session-choice" aria-label="Choose milking session">
        <button type="button" className={session === "morning" ? "chosen" : ""} onClick={() => setSession("morning")}><Sunrise size={19} />Morning</button>
        <button type="button" className={session === "evening" ? "chosen" : ""} onClick={() => setSession("evening")}><Sunset size={19} />Evening</button>
      </div>
      <label className="field-label">Cow<select required value={animalId} onChange={(e) => setAnimalId(e.target.value)}><option value="">Select a cow</option>{animalOptions}</select></label>
      <label className="field-label quantity-label">Quantity (litres)<input required type="number" inputMode="decimal" min="0" step="0.1" placeholder="0.0" value={quantity} onChange={(e) => setQuantity(e.target.value)} /></label>
      <label className="field-label">Notes (optional)<textarea rows="2" value={notes} onChange={(e) => setNotes(e.target.value)} /></label>
      {!animals.length && <p className="helper-text">Add an active female cow before recording milk.</p>}
      <button className="primary-button save-milk" disabled={saving || !animals.length}>{saving ? "Saving…" : "Save milk record"}</button>
    </form>}
    {!admin && <p className="notice">You can view milk records. An administrator can add entries.</p>}
    {error && <p className="error-message" role="alert">{error}</p>}{success && <p className="success-message" role="status">{success}</p>}
    <section className="panel milk-history-panel">
      <div className="panel-heading"><div><h2>Records for {new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { day: "numeric", month: "long" })}</h2><p className="panel-subtitle">{records.length} {records.length === 1 ? "entry" : "entries"}</p></div>
        <select aria-label="Filter milk records by animal" value={animalFilter} onChange={(e) => setAnimalFilter(e.target.value)}><option value="">All cows</option>{animalOptions}</select>
      </div>
      {admin && editing && <form className="form-grid milk-edit-form" onSubmit={saveEdit}>
        <div className="panel-heading full-field"><h2>Edit milk record</h2><button type="button" className="icon-button" aria-label="Cancel editing" onClick={() => setEditing(null)}><X size={18} /></button></div>
        <label className="field-label">Cow<select required value={editing.animalId?._id || editing.animalId} onChange={(e) => setEditing({ ...editing, animalId: e.target.value })}>{animals.map((animal) => <option key={animal._id} value={animal._id}>{animal.name} · {animal.tagNumber}</option>)}</select></label>
        <label className="field-label">Date<input required type="date" value={editing.date} onChange={(e) => setEditing({ ...editing, date: e.target.value })} /></label>
        <label className="field-label">Session<select value={editing.session} onChange={(e) => setEditing({ ...editing, session: e.target.value })}><option value="morning">Morning</option><option value="evening">Evening</option></select></label>
        <label className="field-label">Quantity (litres)<input required type="number" min="0" step="0.1" value={editing.quantity} onChange={(e) => setEditing({ ...editing, quantity: e.target.value })} /></label>
        <label className="field-label full-field">Notes<textarea rows="2" value={editing.notes || ""} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} /></label>
        <div className="form-actions full-field"><button type="button" className="secondary-button" onClick={() => setEditing(null)}>Cancel</button><button className="primary-button" disabled={saving}>{saving ? "Saving…" : "Update record"}</button></div>
      </form>}
      {loading ? <div className="loading-container" role="status">Loading...</div> : records.length ? <div className="record-list">{records.map((record) => <div className="record-row" key={record._id}><div><strong>{record.animalId?.name || "Cow"}</strong><span>{record.animalId?.tagNumber} · {record.session}{record.notes ? ` · ${record.notes}` : ""}</span></div><b>{record.quantity} L</b>{admin && <div className="card-actions"><button onClick={() => setEditing({ ...record, date: record.date?.slice(0, 10), quantity: String(record.quantity) })}><Pencil size={16} /> Edit</button><button className="danger-link" onClick={() => removeRecord(record)}><Trash2 size={16} /> Delete</button></div>}</div>)}</div> : <p className="empty-inline">No milk entries for this date.</p>}
    </section>
  </div>;
};

const MilkStat = ({ title, value, icon: Icon }) => <article className="stat-card"><div className="stat-icon"><Icon size={20} /></div><div className="stat-info"><p>{title}</p><h2>{value}</h2></div></article>;
export default MilkRecords;
