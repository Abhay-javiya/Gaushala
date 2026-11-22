import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Beef, CirclePlus, Search, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { createAnimal, deleteAnimal, listAnimals, updateAnimal } from "../../services/animalService";

const emptyForm = { name: "", tagNumber: "", type: "cow", gender: "female", breed: "", dateOfBirth: "", motherId: "", fatherId: "", photo: "", status: "active", notes: "" };
const Animals = () => {
  const { admin } = useAuth();
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  const refresh = async () => {
    setLoading(true);
    setError("");
    try { setAnimals(await listAnimals()); }
    catch (e) { setError(e.response?.data?.message || "Animals could not be loaded. Check your connection and try again."); }
    finally { setLoading(false); }
  };
  useEffect(() => { refresh(); }, []);

  const visibleAnimals = useMemo(() => animals.filter((animal) => {
    const matchesSearch = `${animal.name} ${animal.tagNumber}`.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (type === "all" || animal.type === type) && (status === "all" || animal.status === status);
  }), [animals, search, type, status]);

  const save = async (event) => {
    event.preventDefault(); setSaving(true); setError("");
    const payload = {
      name: form.name,
      tagNumber: form.tagNumber,
      type: form.type,
      gender: form.gender,
      breed: form.breed || "",
      dateOfBirth: form.dateOfBirth || undefined,
      motherId: form.motherId || null,
      fatherId: form.fatherId || null,
      photo: form.photo || "",
      status: form.status || "active",
      notes: form.notes || ""
    };
    try {
      if (form._id) await updateAnimal(form._id, payload); else await createAnimal(payload);
      setForm(null); await refresh();
    } catch (e) { setError(e.response?.data?.message || "Animal could not be saved."); }
    finally { setSaving(false); }
  };

  const remove = async (animal) => {
    if (!window.confirm(`Delete ${animal.name} (${animal.tagNumber})?`)) return;
    setError("");
    try { await deleteAnimal(animal._id); await refresh(); }
    catch (e) { setError(e.response?.data?.message || "Animal could not be deleted."); }
  };

  return <div>
    <div className="page-heading"><div><div className="eyebrow">Herd</div><h1>Animals</h1><p>Find and manage the animals in your care.</p></div>
      {admin && <button className="primary-button" onClick={() => setForm({ ...emptyForm })}><CirclePlus size={18} /> Add animal</button>}
    </div>
    <div className="filter-bar">
      <label className="search-field"><Search size={18} /><input aria-label="Search animals" placeholder="Search name or tag number" value={search} onChange={(e) => setSearch(e.target.value)} /></label>
      <select aria-label="Filter by type" value={type} onChange={(e) => setType(e.target.value)}><option value="all">All types</option><option value="cow">Cows</option><option value="bull">Bulls</option><option value="calf">Calves</option></select>
      <select aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value)}><option value="all">All statuses</option><option value="active">Active</option><option value="sold">Sold</option><option value="deceased">Deceased</option></select>
    </div>
    {error && <div className="error-message" role="alert">{error}</div>}
    {admin && form && <AnimalForm value={form} animals={animals} saving={saving} onChange={setForm} onClose={() => setForm(null)} onSave={save} />}
    {loading ? <div className="loading-container" role="status">Loading...</div> : visibleAnimals.length === 0 ? <div className="empty-state"><Beef size={28} /><strong>{animals.length ? "No animals match these filters" : "No animals have been added"}</strong><span>{animals.length ? "Try changing your search or filters." : "Animal records will appear here once added."}</span></div> :
      <div className="animal-grid">{visibleAnimals.map((animal) => <article className="animal-card" key={animal._id}>
        <Link to={`/animals/${animal._id}`} className="animal-main">
          {animal.photo ? <img className="animal-photo" src={animal.photo} alt={animal.name} /> : <div className="animal-photo animal-photo-empty"><Beef size={25} /></div>}
          <div className="animal-copy"><span className={`status-pill ${animal.status}`}>{animal.status}</span><h2>{animal.name}</h2><p>{animal.tagNumber} · {animal.type} · {animal.gender}</p>{animal.breed && <small>{animal.breed}</small>}</div>
        </Link>
        {admin && <div className="card-actions"><button onClick={() => setForm({ ...emptyForm, ...animal, dateOfBirth: animal.dateOfBirth ? animal.dateOfBirth.slice(0, 10) : "", motherId: animal.motherId?._id || animal.motherId || "", fatherId: animal.fatherId?._id || animal.fatherId || "" })}>Edit</button><button className="danger-link" onClick={() => remove(animal)}>Delete</button></div>}
      </article>)}</div>}
  </div>;
};

const AnimalForm = ({ value, animals, saving, onChange, onClose, onSave }) => {
  const set = (key, next) => onChange((current) => ({ ...current, [key]: next }));
  return <div className="form-panel"><div className="panel-heading"><h2>{value._id ? "Edit animal" : "Add an animal"}</h2><button className="icon-button" aria-label="Close form" onClick={onClose}><X size={19} /></button></div>
    <form className="form-grid" onSubmit={onSave}>
      <label>Name<input required value={value.name} onChange={(e) => set("name", e.target.value)} /></label>
      <label>Tag number<input required value={value.tagNumber} onChange={(e) => set("tagNumber", e.target.value)} /></label>
      <label>Type<select value={value.type} onChange={(e) => set("type", e.target.value)}><option value="cow">Cow</option><option value="bull">Bull</option><option value="calf">Calf</option></select></label>
      <label>Gender<select value={value.gender} onChange={(e) => set("gender", e.target.value)}><option value="female">Female</option><option value="male">Male</option></select></label>
      <label>Breed<input value={value.breed || ""} onChange={(e) => set("breed", e.target.value)} /></label>
      <label>Date of birth<input type="date" value={value.dateOfBirth || ""} onChange={(e) => set("dateOfBirth", e.target.value)} /></label>
      <label>Mother<select value={value.motherId || ""} onChange={(e) => set("motherId", e.target.value)}><option value="">Not recorded</option>{animals.filter((a) => a.type === "cow" && a._id !== value._id).map((a) => <option key={a._id} value={a._id}>{a.name} · {a.tagNumber}</option>)}</select></label>
      <label>Father<select value={value.fatherId || ""} onChange={(e) => set("fatherId", e.target.value)}><option value="">Not recorded</option>{animals.filter((a) => a.type === "bull" && a._id !== value._id).map((a) => <option key={a._id} value={a._id}>{a.name} · {a.tagNumber}</option>)}</select></label>
      <label>Status<select value={value.status || "active"} onChange={(e) => set("status", e.target.value)}><option value="active">Active</option><option value="sold">Sold</option><option value="deceased">Deceased</option></select></label>
      <label>Photo URL<input type="url" value={value.photo || ""} onChange={(e) => set("photo", e.target.value)} /></label>
      <label className="full-field">Notes<textarea rows="3" value={value.notes || ""} onChange={(e) => set("notes", e.target.value)} /></label>
      <div className="form-actions full-field"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button" disabled={saving}>{saving ? "Saving…" : "Save animal"}</button></div>
    </form>
  </div>;
};

export default Animals;
