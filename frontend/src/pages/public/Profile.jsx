import { Navigate, useNavigate } from "react-router-dom";
import { LogOut, ShieldCheck, UserRound } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Profile = () => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  if (!admin) return <Navigate to="/admin/login" replace />;
  const handleLogout = () => { logout(); navigate("/admin/login"); };
  return <div className="profile-page">
    <div className="page-heading"><div><div className="eyebrow">Account</div><h1>Profile</h1><p>Your signed-in account details.</p></div></div>
    <section className="profile-card">
      <div className="profile-avatar"><UserRound size={30} /></div>
      <div className="profile-identity"><h2>{admin.name || "Administrator"}</h2><p>{admin.email}</p></div>
      <div className="profile-info-row"><span>Role</span><strong><ShieldCheck size={16} /> {admin.role}</strong></div>
      <button className="secondary-button profile-logout" onClick={handleLogout}><LogOut size={17} /> Log out</button>
    </section>
  </div>;
};
export default Profile;
