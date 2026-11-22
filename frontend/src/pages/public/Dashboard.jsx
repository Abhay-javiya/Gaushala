import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Activity, Beef, CalendarDays, CirclePlus, Heart, Milk, Sunrise, Sunset } from "lucide-react";
import { getDashboardData } from "../../services/dashboardService";
import { useAuth } from "../../context/AuthContext";

const localDate = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

const formatDate = (value) => new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
  day: "numeric", month: "short", year: "numeric"
});

const Dashboard = () => {
  const { admin } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getDashboardData(localDate())
      .then((result) => {
        if (active) {
          setData(result);
          if (result.errors.length) setError("Some dashboard information could not be loaded. Check your connection and refresh.");
        }
      })
      .catch(() => {
        if (active) setError("Dashboard data could not be loaded. Check your connection and refresh.");
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const animals = data?.animals;
  const cows = animals?.filter((animal) => animal.type === "cow") ?? [];
  const bulls = animals?.filter((animal) => animal.type === "bull") ?? [];
  const breedingEvents = (data?.breeding ?? [])
    .filter((record) => record.expectedDeliveryDate && !["delivered", "unsuccessful"].includes(record.status))
    .filter((record) => new Date(record.expectedDeliveryDate) >= new Date(`${localDate()}T00:00:00`))
    .sort((a, b) => new Date(a.expectedDeliveryDate) - new Date(b.expectedDeliveryDate))
    .slice(0, 4);

  if (loading) return <div className="loading-container" role="status">Loading...</div>;

  return (
    <div>
      <section className="dashboard-welcome">
        <p>Govardhan Gaushala overview</p>
        <h1>Good day, let’s care for the herd.</h1>
        <p className="welcome-date">{new Date().toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
      </section>

      {error && <div className="notice" role="status">{error}</div>}

      <div className="stats-grid" aria-label="Farm statistics">
        <Stat title="Total animals" value={animals?.length ?? "—"} icon={Beef} />
        <Stat title="Cows" value={animals ? cows.length : "—"} icon={Beef} />
        <Stat title="Bulls" value={animals ? bulls.length : "—"} icon={Beef} />
        <Stat title="Today’s milk" value={data?.milk ? `${Number(data.milk.dailyTotal).toLocaleString()} L` : "—"} icon={Milk} tone="orange" />
        <Stat title="Morning milk" value={data?.milk ? `${Number(data.milk.morning).toLocaleString()} L` : "—"} icon={Sunrise} />
        <Stat title="Evening milk" value={data?.milk ? `${Number(data.milk.evening).toLocaleString()} L` : "—"} icon={Sunset} />
      </div>

      {admin && <><h2 className="section-title">Quick actions</h2>
      <div className="quick-actions">
        <Link className="quick-action" to="/animals"><CirclePlus size={21} /><span>Add animal</span></Link>
        <Link className="quick-action" to="/milk"><Milk size={21} /><span>Add milk record</span></Link>
        <Link className="quick-action" to="/breeding"><Heart size={21} /><span>Add breeding record</span></Link>
      </div></>}

      {admin ? <div className="dashboard-columns">
        <section className="panel">
          <div className="panel-heading"><h2>Upcoming breeding events</h2><CalendarDays size={19} color="var(--primary)" /></div>
          {!data?.breeding ? <p className="empty-inline">Breeding events are unavailable right now.</p> : breedingEvents.length ? (
            <div className="event-list">
              {breedingEvents.map((record) => (
                <div className="event-row" key={record._id}>
                  <div><strong>{record.motherId?.name || "Mother cow"}</strong><span>{record.status}</span></div>
                  <time dateTime={record.expectedDeliveryDate}>{formatDate(record.expectedDeliveryDate)}</time>
                </div>
              ))}
            </div>
          ) : <p className="empty-inline">No upcoming delivery dates recorded.</p>}
          <Link className="text-link" to="/breeding">View breeding records</Link>
        </section>

        <section className="panel">
          <div className="panel-heading"><h2>Recent activity</h2><Activity size={19} color="var(--primary)" /></div>
          <p className="empty-inline">Activity history is not provided by the current API.</p>
          <Link className="text-link" to="/animals">View animals</Link>
        </section>
      </div> : <section className="viewer-overview">
        <div><p className="eyebrow">Quick access</p><h2>Explore your Gaushala</h2><p>Browse herd, milk, and breeding information whenever you need it.</p></div>
        <div className="viewer-links">
          <Link to="/animals"><Beef size={19} /><span><strong>Animals</strong><small>View herd records</small></span></Link>
          <Link to="/milk"><Milk size={19} /><span><strong>Milk records</strong><small>Review daily collection</small></span></Link>
          <Link to="/breeding"><Heart size={19} /><span><strong>Breeding</strong><small>See breeding history</small></span></Link>
        </div>
      </section>}
    </div>
  );
};

const Stat = ({ title, value, icon: Icon, tone }) => (
  <article className="stat-card">
    <div className={`stat-icon${tone ? ` ${tone}` : ""}`}><Icon size={20} /></div>
    <div className="stat-info"><p>{title}</p><h2>{value}</h2></div>
  </article>
);

export default Dashboard;
