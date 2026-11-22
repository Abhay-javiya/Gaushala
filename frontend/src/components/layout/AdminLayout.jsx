
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Beef,
  Milk,
  Heart,
  LogOut,
  BarChart3
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

const AdminLayout = () => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2>Govardhan Gaushala</h2>
        <p className="sidebar-label">ADMIN PANEL</p>

        <NavLink to="/admin">
          <LayoutDashboard size={19} /> Dashboard
        </NavLink>

        <NavLink to="/animals">
          <Beef size={19} /> Animals
        </NavLink>

        <NavLink to="/milk">
          <Milk size={19} /> Milk Records
        </NavLink>

        <NavLink to="/breeding">
          <Heart size={19} /> Breeding
        </NavLink>

        <NavLink to="/reports">
          <BarChart3 size={19} /> Reports
        </NavLink>

        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={19} /> Logout
        </button>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar">
          <span>Administration</span>
          <span>{admin?.name || "Admin"}</span>
        </header>

        <div className="admin-content">
          <Outlet />
        </div>
      </section>
    </div>
  );
};

export default AdminLayout;
