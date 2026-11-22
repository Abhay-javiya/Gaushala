import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";

import PublicLayout from "./components/layout/PublicLayout";
import AdminLayout from "./components/layout/AdminLayout";

import Dashboard from "./pages/public/Dashboard";
import Animals from "./pages/public/Animals";
import AnimalDetails from "./pages/public/AnimalDetails";
import MilkRecords from "./pages/public/MilkRecords";
import Breeding from "./pages/public/Breeding";
import Reports from "./pages/public/Reports";
import Profile from "./pages/public/Profile";

import Login from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/animals" element={<Animals />} />
            <Route path="/animals/:id" element={<AnimalDetails />} />
            <Route path="/milk" element={<MilkRecords />} />
            <Route path="/breeding" element={<Breeding />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Admin Login */}
          <Route path="/admin/login" element={<Login />} />

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />

        </Routes>
        <div className="app-watermark" aria-label="Built by Abhay Javiya">Built by Abhay Javiya</div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
