import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

import Profile from "./pages/Profile";
import PublicProfile from "./pages/PublicProfile";
import PublicCompanyProfile from "./pages/PublicCompanyProfile";
import FreelancerDashboard from "./pages/FreelancerDashboard";
import CompanyDashboard from "./pages/CompanyDashboard";
import CompanyMembersPage from "./pages/CompanyMembersPage";
import ManageOpeningsPage from "./pages/ManageOpeningsPage";
import ApplyJobPage from "./pages/ApplyJobPage";
import ManageApplicationsPage from "./pages/ManageApplicationsPage";
import MyApplicationsPage from "./pages/MyApplicationsPage";
import RFPsPage from "./pages/RFPsPage";
import ManageRFPsPage from "./pages/ManageRFPsPage";
import ManageRFPInterestsPage from "./pages/ManageRFPInterestsPage";
import MessagesPage from "./pages/MessagesPage";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <MessagesPage />
            </ProtectedRoute>
          }
        />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/freelancer-dashboard"
          element={
            <ProtectedRoute>
              <FreelancerDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/p/:publicId" element={<PublicProfile />} />
        <Route path="/c/:publicId" element={<PublicCompanyProfile />} />
        <Route
          path="/company/:id"
          element={
            <ProtectedRoute>
              <CompanyDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/:id/members"
          element={
            <ProtectedRoute>
              <CompanyMembersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/:id/openings"
          element={
            <ProtectedRoute>
              <ManageOpeningsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/:id/applications"
          element={
            <ProtectedRoute>
              <ManageApplicationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs/:id/apply"
          element={
            <ProtectedRoute>
              <ApplyJobPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-applications"
          element={
            <ProtectedRoute>
              <MyApplicationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rfps"
          element={
            <ProtectedRoute>
              <RFPsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/:id/rfps"
          element={
            <ProtectedRoute>
              <ManageRFPsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/:id/rfp-interests"
          element={
            <ProtectedRoute>
              <ManageRFPInterestsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
