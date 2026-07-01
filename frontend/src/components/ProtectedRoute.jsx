import React, { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import api from "../api";

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const token = localStorage.getItem("access");
  const isAuthenticated = token && token !== "null" && token !== "undefined";
  const location = useLocation();

  useEffect(() => {
    const fetchUser = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      try {
        const response = await api.get("me/");
        setUser(response.data);
      } catch (err) {
        console.error("Auth check failed", err);
        localStorage.clear();
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (loading) {
    return null; // Or a loading spinner
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Admin access check
  if (requireAdmin && !user.is_staff) {
    return <Navigate to="/dashboard" replace />;
  }

  // Regular user access check (prevent staff from accessing regular dashboard)
  if (!requireAdmin && user.is_staff) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default ProtectedRoute;
