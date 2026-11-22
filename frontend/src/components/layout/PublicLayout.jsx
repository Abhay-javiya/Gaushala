import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { BarChart3, Beef, ChevronUp, Home, LogIn, LogOut, Milk, MoreHorizontal, PanelLeftClose, PanelLeftOpen, Heart, UserRound } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const PublicLayout = () => {
  const [moreOpen, setMoreOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const closeMore = () => setMoreOpen(false);
  const handleLogout = () => { logout(); closeMore(); navigate("/admin/login"); };

  return <div className="public-shell">
    <header className="public-header">
      <Link to="/" className="brand" onClick={closeMore}>Govardhan Gaushala</Link>
      <button className="sidebar-toggle" aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"} onClick={() => setSidebarCollapsed((value) => !value)}>
        {sidebarCollapsed ? <PanelLeftOpen size={19} /> : <PanelLeftClose size={19} />}
      </button>
      <div className="header-account">{admin ? <><span>{admin.name || "Admin"}</span><button onClick={handleLogout}><LogOut size={17} /> Log out</button></> : <Link to="/admin/login"><LogIn size={17} /> Admin</Link>}</div>
    </header>

    <div className={"desktop-layout" + (sidebarCollapsed ? " sidebar-collapsed" : "")}>
      <aside className="desktop-sidebar">
        <div className="sidebar-label">MENU</div>
        <nav aria-label="Main navigation">
          <NavLink to="/" end title="Home"><Home size={19} /><span>Home</span></NavLink>
          <NavLink to="/animals" title="Animals"><Beef size={19} /><span>Animals</span></NavLink>
          <NavLink to="/milk" title="Milk"><Milk size={19} /><span>Milk</span></NavLink>
          <NavLink to="/breeding" title="Breeding"><Heart size={19} /><span>Breeding</span></NavLink>
          <NavLink to="/reports" title="Reports"><BarChart3 size={19} /><span>Reports</span></NavLink>
        </nav>
        <div className="sidebar-bottom">{admin ? <><Link to="/profile" title="Profile"><UserRound size={19} /><span>Profile</span></Link><button onClick={handleLogout} title="Log out"><LogOut size={19} /><span>Log out</span></button></> : <Link to="/admin/login" title="Admin login"><LogIn size={19} /><span>Admin login</span></Link>}</div>
      </aside>
      <div className="desktop-main">
        <main className="public-content"><Outlet /></main>
        <footer className="public-footer">© {new Date().getFullYear()} Govardhan Gaushala</footer>
      </div>
    </div>

    {moreOpen && <>
      <button className="more-dismiss" aria-label="Close menu" onClick={closeMore} />
      <div className="mobile-more-menu">
        <div className="more-menu-title">More</div>
        <NavLink to="/reports" onClick={closeMore}><BarChart3 size={18} />Reports</NavLink>
        {admin ? <><Link to="/profile" onClick={closeMore}><UserRound size={18} />Profile</Link><button onClick={handleLogout}><LogOut size={18} />Log out</button></> : <Link to="/admin/login" onClick={closeMore}><LogIn size={18} />Admin login</Link>}
      </div>
    </>}

    <nav className="mobile-bottom-nav" aria-label="Bottom navigation">
      <NavLink to="/" end onClick={closeMore}><Home size={20} /><span>Home</span></NavLink>
      <NavLink to="/animals" onClick={closeMore}><Beef size={20} /><span>Animals</span></NavLink>
      <NavLink to="/milk" onClick={closeMore}><Milk size={20} /><span>Milk</span></NavLink>
      <NavLink to="/breeding" onClick={closeMore}><Heart size={20} /><span>Breeding</span></NavLink>
      <button className={moreOpen ? "active" : ""} aria-expanded={moreOpen} onClick={() => setMoreOpen((open) => !open)}>{moreOpen ? <ChevronUp size={20} /> : <MoreHorizontal size={20} />}<span>More</span></button>
    </nav>
  </div>;
};
export default PublicLayout;
