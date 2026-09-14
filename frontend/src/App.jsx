import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AccountProvider } from "./context/AccountContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import HomePage from "./pages/HomePage";
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
import RFPDetailPage from "./pages/RFPDetailPage";
import ManageRFPsPage from "./pages/ManageRFPsPage";
import ManageRFPInterestsPage from "./pages/ManageRFPInterestsPage";
import MySubmittedRFPInterestsPage from "./pages/MySubmittedRFPInterestsPage";
import MessagesPage from "./pages/MessagesPage";
import NotificationsPage from "./pages/NotificationsPage";
import FreelancersPage from "./pages/FreelancersPage";


function App() {
  return (
    <AccountProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
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
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <HomePage />
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
          <Route path="/profile/:publicId" element={<PublicProfile />} />
          <Route path="/company/:publicId" element={<PublicCompanyProfile />} />
          <Route
            path="/freelancer/dashboard"
            element={
              <ProtectedRoute>
                <FreelancerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/freelancers"
            element={<FreelancersPage />}
          />
          <Route
            path="/company/:id/dashboard"
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
            path="/company/:id/openings/:jobId/applications"
            element={
              <ProtectedRoute>
                <ManageApplicationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jobs/:jobId/apply"
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
            element={<RFPsPage />}
          />
          <Route
            path="/rfps/:rfpId"
            element={<RFPDetailPage />}
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
            path="/my-rfp-interests"
            element={
              <ProtectedRoute>
                <MySubmittedRFPInterestsPage />
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
          <Route
            path="/admin/moderation"
            element={
              <ProtectedRoute requireAdmin>
                <Navigate to="/admin?tab=flagged_reviews" replace />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AccountProvider>
  );
}

export default App;
