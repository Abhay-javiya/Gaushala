import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Beef } from "lucide-react";
import { getAnimal, getAnimalBreedingHistory, getAnimalMilkHistory } from "../../services/animalService";

const readableDate = (value) => value ? new Date(value).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" }) : "Not recorded";
const AnimalDetails = () => {
    const { id } = useParams();
    const [animal, setAnimal] = useState(null);
    const [milk, setMilk] = useState([]);
    const [breeding, setBreeding] = useState([]);
    const [tab, setTab] = useState("overview");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    useEffect(() => {
        let active = true;
        Promise.allSettled([getAnimal(id), getAnimalMilkHistory(id), getAnimalBreedingHistory(id)]).then(([a, m, b]) => {
            if (!active) return;
            if (a.status === "fulfilled") setAnimal(a.value); else setError(a.reason.response?.data?.message || "Animal details could not be loaded.");
            if (m.status === "fulfilled") setMilk(m.value);
            if (b.status === "fulfilled") setBreeding(b.value);
        }).finally(() => active && setLoading(false));
        return () => { active = false; };
    }, [id]);

    if (loading) return <div className="loading-container" role="status">Loading...</div>;
    if (!animal) return <div className="empty-state"><strong>{error || "Animal not found"}</strong><Link className="text-link" to="/animals">Return to animals</Link></div>;
    const tabs = ["overview", "milk history", "breeding history"];
    return <div>
        <Link className="back-link" to="/animals"><ArrowLeft size={17} /> Animals</Link>
        <section className="animal-profile">
            {animal.photo ? <img src={animal.photo} alt={animal.name} /> : <div className="animal-photo animal-photo-empty profile-photo"><Beef size={34} /></div>}
            <div><span className={`status-pill ${animal.status}`}>{animal.status}</span><h1>{animal.name}</h1><p>{animal.tagNumber} · {animal.type} · {animal.gender}</p></div>
        </section>
        <div className="detail-tabs" role="tablist">{tabs.map((item) => <button key={item} className={tab === item ? "selected" : ""} onClick={() => setTab(item)} role="tab" aria-selected={tab === item}>{item}</button>)}</div>
        {tab === "overview" && <section className="detail-card"><h2>Animal information</h2><Detail label="Breed" value={animal.breed || "Not recorded"} /><Detail label="Date of birth" value={readableDate(animal.dateOfBirth)} /><Detail label="Type" value={animal.type} /><Detail label="Gender" value={animal.gender} /><Detail label="Mother" value={animal.motherId?.name ? `${animal.motherId.name} · ${animal.motherId.tagNumber}` : "Not recorded"} /><Detail label="Father" value={animal.fatherId?.name ? `${animal.fatherId.name} · ${animal.fatherId.tagNumber}` : "Not recorded"} /><Detail label="Status" value={animal.status} />{animal.notes && <Detail label="Notes" value={animal.notes} />}</section>}
        {tab === "milk history" && <section className="detail-card"><h2>Milk history</h2>{milk.length ? <div className="record-list">{milk.map((r) => <div className="record-row" key={r._id}><div><strong>{readableDate(r.date)}</strong><span>{r.session} session</span></div><b>{r.quantity} L</b></div>)}</div> : <p className="empty-inline">No milk records are available for this animal.</p>}</section>}
        {tab === "breeding history" && <section className="detail-card"><h2>Breeding history</h2>{breeding.length ? <div className="record-list">{breeding.map((r) => <div className="record-row" key={r._id}><div><strong>{readableDate(r.breedingDate)}</strong><span>Expected {readableDate(r.expectedDeliveryDate)}</span></div><b className="status-pill">{r.status}</b></div>)}</div> : <p className="empty-inline">No breeding records are available for this animal.</p>}</section>}
    </div>;
};

const Detail = ({ label, value }) => <div className="detail-row"><span>{label}</span><strong>{value}</strong></div>;
export default AnimalDetails;
