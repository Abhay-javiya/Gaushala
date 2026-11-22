import { useEffect, useMemo, useState } from "react";
import { CalendarHeart, CirclePlus, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { listAnimals } from "../../services/animalService";
import { createBreedingRecord, deleteBreedingRecord, listBreedingRecords, registerCalf, updateBreedingRecord, updateBreedingStatus } from "../../services/breedingService";

const dateText = (value) => value ? new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "Not set";
const Breeding = () => {
  const { admin } = useAuth();
  const [records, setRecords] = useState([]); const [animals, setAnimals] = useState([]);
  const [search, setSearch] = useState(""); const [filter, setFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false); const [motherId, setMotherId] = useState(""); const [fatherId, setFatherId] = useState(""); const [breedingDate, setBreedingDate] = useState(""); const [notes, setNotes] = useState("");
  const [calfFor, setCalfFor] = useState(null); const [calf, setCalf] = useState({ name: "", tagNumber: "", gender: "female", breed: "", dateOfBirth: "", notes: "" });
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [error, setError] = useState(""); const [success, setSuccess] = useState("");
  const [editing, setEditing] = useState(null);

  const refresh = async () => { setLoading(true); try { setRecords(await listBreedingRecords()); } catch (e) { setError(e.response?.data?.message || "Breeding records could not be loaded."); } finally { setLoading(false); } };
  useEffect(() => { refresh(); listAnimals().then(setAnimals).catch(() => setAnimals([])); }, []);
  const mothers = animals.filter((a) => a.type === "cow" && a.gender === "female" && a.status === "active");
  const fathers = animals.filter((a) => a.type === "bull" && a.gender === "male" && a.status === "active");
  const visible = useMemo(() => records.filter((r) => {
    const names = `${r.motherId?.name || ""} ${r.motherId?.tagNumber || ""} ${r.fatherId?.name || ""} ${r.fatherId?.tagNumber || ""}`.toLowerCase();
    return names.includes(search.toLowerCase()) && (filter === "all" || r.status === filter);
  }), [records, search, filter]);

  const submitRecord = async (event) => {
    event.preventDefault(); setError(""); setSuccess(""); setSaving(true);
    try { await createBreedingRecord({ motherId, fatherId: fatherId || null, breedingDate, notes }); setSuccess("Breeding record added."); setFormOpen(false); setMotherId(""); setFatherId(""); setBreedingDate(""); setNotes(""); await refresh(); }
    catch (e) { setError(e.response?.data?.message || "Breeding record could not be saved."); }
    finally { setSaving(false); }
  };
  const changeStatus = async (record, status) => {
    setError(""); try { await updateBreedingStatus(record._id, status, record.notes); await refresh(); } catch (e) { setError(e.response?.data?.message || "Status could not be updated."); }
  };
  const submitCalf = async (event) => {
    event.preventDefault(); setError(""); setSaving(true);
    try { await registerCalf(calfFor._id, calf); setSuccess("Calf registered and linked to its parents."); setCalfFor(null); await refresh(); }
    catch (e) { setError(e.response?.data?.message || "Calf could not be registered."); }
    finally { setSaving(false); }
  };
  const saveEdit = async (event) => {
    event.preventDefault(); setSaving(true); setError(""); setSuccess("");
    try { await updateBreedingRecord(editing._id, { motherId: editing.motherId?._id || editing.motherId, fatherId: editing.fatherId?._id || editing.fatherId || null, breedingDate: editing.breedingDate, expectedDeliveryDate: editing.expectedDeliveryDate, status: editing.status, notes: editing.notes }); setEditing(null); setSuccess("Breeding record updated."); await refresh(); }
    catch (e) { setError(e.response?.data?.message || "Breeding record could not be updated."); }
    finally { setSaving(false); }
  };
  const removeRecord = async (record) => {
    if (!window.confirm(`Delete the breeding record for ${record.motherId?.name || "this cow"}?`)) return;
    try { await deleteBreedingRecord(record._id); setSuccess("Breeding record deleted."); await refresh(); }
    catch (e) { setError(e.response?.data?.message || "Breeding record could not be deleted."); }
  };
  const expectedDate = (value) => { if (!value) return ""; const date = new Date(`${value}T00:00:00`); date.setDate(date.getDate() + 283); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; };
  const pregnantCount = records.filter((record) => record.status === "pregnant").length;
  const upcomingCount = records.filter((record) => record.expectedDeliveryDate && !["delivered", "unsuccessful"].includes(record.status) && new Date(record.expectedDeliveryDate) >= new Date()).length;

  return <div>
    <div className="page-heading"><div><div className="eyebrow">Herd health</div><h1>Breeding</h1><p>Track breeding records and expected delivery dates.</p></div>{admin && <button className="primary-button" onClick={() => setFormOpen((v) => !v)}><CirclePlus size={18} /> Add record</button>}</div>
    {error && <p className="error-message" role="alert">{error}</p>}{success && <p className="success-message" role="status">{success}</p>}
    <section className="stats-grid breeding-overview" aria-label="Breeding overview">
      <Overview label="Total records" value={records.length} /><Overview label="Pregnant" value={pregnantCount} /><Overview label="Delivered" value={records.filter((r) => r.status === "delivered").length} /><Overview label="Unsuccessful" value={records.filter((r) => r.status === "unsuccessful").length} /><Overview label="Upcoming deliveries" value={upcomingCount} />
    </section>
    {admin && formOpen && <form className="form-panel form-grid" onSubmit={submitRecord}><h2 className="full-field">New breeding record</h2>
      <label>Mother cow<select required value={motherId} onChange={(e) => setMotherId(e.target.value)}><option value="">Select a cow</option>{mothers.map((a) => <option key={a._id} value={a._id}>{a.name} · {a.tagNumber}</option>)}</select></label>
      <label>Father bull <span className="optional">Optional</span><select value={fatherId} onChange={(e) => setFatherId(e.target.value)}><option value="">Unknown / not recorded</option>{fathers.map((a) => <option key={a._id} value={a._id}>{a.name} · {a.tagNumber}</option>)}</select></label>
      <label>Breeding date<input type="date" required value={breedingDate} onChange={(e) => setBreedingDate(e.target.value)} /></label>
      <label>Expected delivery<input type="date" value={expectedDate(breedingDate)} readOnly /></label>
      <label>Notes<textarea rows="2" value={notes} onChange={(e) => setNotes(e.target.value)} /></label>
      <div className="form-actions full-field"><button type="button" className="secondary-button" onClick={() => setFormOpen(false)}>Cancel</button><button className="primary-button" disabled={saving}>{saving ? "Saving…" : "Save record"}</button></div>
    </form>}
    {admin && editing && <form className="form-panel form-grid" onSubmit={saveEdit}><h2 className="full-field">Edit breeding record</h2>
      <label>Mother cow<select required value={editing.motherId?._id || editing.motherId} onChange={(e) => setEditing({ ...editing, motherId: e.target.value })}>{mothers.map((a) => <option key={a._id} value={a._id}>{a.name} · {a.tagNumber}</option>)}</select></label>
      <label>Father bull<select value={editing.fatherId?._id || editing.fatherId || ""} onChange={(e) => setEditing({ ...editing, fatherId: e.target.value })}><option value="">Unknown</option>{fathers.map((a) => <option key={a._id} value={a._id}>{a.name} · {a.tagNumber}</option>)}</select></label>
      <label>Breeding date<input type="date" required value={editing.breedingDate?.slice(0, 10)} onChange={(e) => setEditing({ ...editing, breedingDate: e.target.value, expectedDeliveryDate: expectedDate(e.target.value) })} /></label>
      <label>Expected delivery<input type="date" required value={editing.expectedDeliveryDate?.slice(0, 10) || ""} onChange={(e) => setEditing({ ...editing, expectedDeliveryDate: e.target.value })} /></label>
      <label>Status<select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })}><option value="bred">Bred</option><option value="pregnant">Pregnant</option><option value="unsuccessful">Unsuccessful</option></select></label>
      <label>Notes<textarea rows="2" value={editing.notes || ""} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} /></label>
      <div className="form-actions full-field"><button type="button" className="secondary-button" onClick={() => setEditing(null)}>Cancel</button><button className="primary-button" disabled={saving}>{saving ? "Saving…" : "Update record"}</button></div>
    </form>}
    {admin && calfFor && <form className="form-panel form-grid" onSubmit={submitCalf}><h2 className="full-field">Register calf for {calfFor.motherId?.name || "mother cow"}</h2>
      <label>Calf name<input required value={calf.name} onChange={(e) => setCalf({ ...calf, name: e.target.value })} /></label><label>Tag number<input required value={calf.tagNumber} onChange={(e) => setCalf({ ...calf, tagNumber: e.target.value })} /></label>
      <label>Gender<select value={calf.gender} onChange={(e) => setCalf({ ...calf, gender: e.target.value })}><option value="female">Female</option><option value="male">Male</option></select></label><label>Breed<input value={calf.breed} onChange={(e) => setCalf({ ...calf, breed: e.target.value })} /></label>
      <label>Date of birth<input type="date" required value={calf.dateOfBirth} onChange={(e) => setCalf({ ...calf, dateOfBirth: e.target.value })} /></label><label>Notes<input value={calf.notes} onChange={(e) => setCalf({ ...calf, notes: e.target.value })} /></label>
      <p className="helper-text full-field">The backend will link this calf to the recorded mother and father.</p><div className="form-actions full-field"><button type="button" className="secondary-button" onClick={() => setCalfFor(null)}>Cancel</button><button className="primary-button" disabled={saving}>{saving ? "Saving…" : "Register calf"}</button></div>
    </form>}
    <div className="filter-bar"><input className="plain-filter" placeholder="Search animal name or tag" value={search} onChange={(e) => setSearch(e.target.value)} /><select value={filter} onChange={(e) => setFilter(e.target.value)}><option value="all">All statuses</option><option value="bred">Bred</option><option value="pregnant">Pregnant</option><option value="delivered">Delivered</option><option value="unsuccessful">Unsuccessful</option></select></div>
    {loading ? <div className="loading-container" role="status">Loading...</div> : visible.length ? <div className="breeding-list">{visible.map((r) => <article className="breeding-card" key={r._id}>
      <div className="breeding-card-top"><div className="breeding-icon"><CalendarHeart size={20} /></div><div className="breeding-title"><h2>{r.motherId?.name || "Mother cow"}</h2><p>{r.motherId?.tagNumber || ""}{r.fatherId ? ` · ${r.fatherId.name}` : " · Father not recorded"}</p></div><span className={`status-pill ${r.status}`}>{r.status}</span></div>
      <div className="breeding-dates"><div><span>Breeding date</span><strong>{dateText(r.breedingDate)}</strong></div><div><span>Expected delivery</span><strong>{dateText(r.expectedDeliveryDate)}</strong></div>{r.actualDeliveryDate && <div><span>Actual delivery</span><strong>{dateText(r.actualDeliveryDate)}</strong></div>}</div>
      {r.calfId && <p className="calf-note">Calf registered: {r.calfId.name} · {r.calfId.tagNumber}</p>}{r.notes && <p className="record-notes">{r.notes}</p>}
      {admin && <div className="breeding-actions">{!['delivered', 'unsuccessful'].includes(r.status) && <select aria-label="Update breeding status" value={r.status} onChange={(e) => changeStatus(r, e.target.value)}><option value="bred">Bred</option><option value="pregnant">Pregnant</option><option value="unsuccessful">Unsuccessful</option></select>}{r.status !== "delivered" && <button className="secondary-button" onClick={() => { setCalfFor(r); setCalf({ name: "", tagNumber: "", gender: "female", breed: "", dateOfBirth: "", notes: "" }); }}>Register calf</button>}{!r.calfId && r.status !== "delivered" && <button className="secondary-button" onClick={() => setEditing({ ...r })}><Pencil size={15} /> Edit</button>}<button className="danger-link" onClick={() => removeRecord(r)}><Trash2 size={15} /> Delete</button></div>}
    </article>)}</div> : <div className="empty-state"><CalendarHeart size={28} /><strong>No breeding records found</strong><span>Breeding records will appear here when added.</span></div>}
  </div>;
};
const Overview = ({ label, value }) => <article className="stat-card"><div className="stat-info"><p>{label}</p><h2>{value}</h2></div></article>;
export default Breeding;
