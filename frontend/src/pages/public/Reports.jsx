import { useEffect, useState } from "react";
import { BarChart3, Beef, Milk } from "lucide-react";
import { getReportData } from "../../services/reportService";

const today = () => {
  const d = new Date();
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-");
};
const Reports = () => {
  const [date, setDate] = useState(today());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    getReportData(date).then((result) => {
      if (active) {
        setData(result);
        if (result.errors.length) setError("Some report data could not be loaded.");
      }
    }).catch(() => active && setError("Reports could not be loaded. Check your connection."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [date]);
  if (loading && !data) return <div className="loading-container" role="status">Loading...</div>;
  const animals = data?.animals || [];
  const types = ["cow", "bull", "calf"].map((type) => ({ type, count: animals.filter((a) => a.type === type).length }));
  const daily = data?.daily || [];
  const weekTotal = daily.reduce((sum, item) => sum + Number(item.dailyTotal || 0), 0);
  const maxDaily = Math.max(1, ...daily.map((item) => Number(item.dailyTotal || 0)));
  const statuses = ["bred", "pregnant", "delivered", "unsuccessful"].map((status) => ({ status, count: (data?.breeding || []).filter((r) => r.status === status).length }));
  return <div>
    <div className="page-heading"><div><div className="eyebrow">Farm overview</div><h1>Reports</h1><p>Production and herd summaries from your records.</p></div></div>
    <label className="date-control">Report date<input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
    {error && <p className="notice" role="status">{error}</p>}
    <div className="report-summary-grid">
      <Summary icon={Beef} label="Total animals" value={data?.animals ? data.animals.length : "—"} />
      <Summary icon={Milk} label="Last 7 days" value={data?.daily ? weekTotal.toLocaleString() + " L" : "—"} />
      <Summary icon={BarChart3} label={"Month total · " + date.slice(0, 7)} value={data?.monthly ? Number(data.monthly.monthlyTotal).toLocaleString() + " L" : "—"} />
    </div>
    <div className="report-grid">
      <section className="panel"><h2>Animal distribution</h2>{data?.animals ? <div className="distribution-list">{types.map(({ type, count }) => <div className="distribution-row" key={type}><div><span>{type}</span><strong>{count}</strong></div><div className="distribution-track"><i style={{ width: (animals.length ? (count / animals.length) * 100 : 0) + "%" }} /></div></div>)}</div> : <p className="empty-inline">Animal data is unavailable.</p>}</section>
      <section className="panel"><h2>Daily milk · last 7 days</h2>{data?.daily ? <div className="bar-chart" role="img" aria-label="Milk production for the last seven days">{daily.map((item) => <div className="bar-column" key={item.date}><strong>{item.dailyTotal || 0}</strong><div className="bar-track"><i style={{ height: Math.max(item.dailyTotal ? 6 : 0, (Number(item.dailyTotal || 0) / maxDaily) * 100) + "%" }} /></div><span>{new Date(item.date + "T00:00:00").toLocaleDateString(undefined, { weekday: "short" })}</span></div>)}</div> : <p className="empty-inline">Weekly milk data is unavailable.</p>}</section>
      <section className="panel"><h2>Monthly milk production</h2>{data?.monthly ? <><div className="report-total">{Number(data.monthly.monthlyTotal).toLocaleString()} <small>litres</small></div><div className="session-totals"><span>Morning <strong>{Number(data.monthly.morningTotal).toLocaleString()} L</strong></span><span>Evening <strong>{Number(data.monthly.eveningTotal).toLocaleString()} L</strong></span></div></> : <p className="empty-inline">Monthly milk data is unavailable.</p>}</section>
      <section className="panel"><h2>Breeding summary</h2>{data?.breeding ? <div className="breeding-summary">{statuses.map(({ status, count }) => <div key={status}><span className={"status-pill " + status}>{status}</span><strong>{count}</strong></div>)}</div> : <p className="empty-inline">Breeding data is unavailable.</p>}</section>
    </div>
  </div>;
};
const Summary = ({ icon: Icon, label, value }) => <article className="stat-card"><div className="stat-icon"><Icon size={20} /></div><div className="stat-info"><p>{label}</p><h2>{value}</h2></div></article>;
export default Reports;
