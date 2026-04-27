import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import api from "../api";

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const token = localStorage.getItem("access");

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
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
  }, [token]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return null; // Or a loading spinner
  }

  if (!user) {
    return <Navigate to="/login" replace />;
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
