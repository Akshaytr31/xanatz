import React, { useState, useEffect } from "react";
import AuthLayout from "../components/AuthLayout";
import BrandingSection from "../components/BrandingSection";
import LoginForm from "../components/LoginForm";
import api from "../api";

const Login = () => {
  const [stats, setStats] = useState({
    total_companies: null,
    total_users: null,
    total_rfps: null,
  });

  useEffect(() => {
    let isMounted = true;
    api
      .get("public-stats/")
      .then((res) => {
        if (isMounted && res.data) {
          setStats(res.data);
        }
      })
      .catch((err) => {
        console.warn("Could not fetch public stats:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const loginStats = [
    {
      value: stats.total_companies !== null ? stats.total_companies.toLocaleString() : "—",
      label: "Total Companies",
    },
    {
      value: stats.total_users !== null ? stats.total_users.toLocaleString() : "—",
      label: "Total Users",
    },
    {
      value: stats.total_rfps !== null ? stats.total_rfps.toLocaleString() : "—",
      label: "Total RFPs",
    },
  ];

  const leftPanel = (
    <BrandingSection
      quote="The bridge between talent and opportunity is built on referrals."
      author="Global Talent Network"
      stats={loginStats}
      randomUsers={stats.random_users}
      communityText={
        stats.total_users !== null
          ? `Join ${stats.total_users.toLocaleString()}+ verified members today`
          : "Join our verified platform today"
      }
    />
  );

  return (
    <AuthLayout leftPanel={leftPanel}>
      <LoginForm />
    </AuthLayout>
  );
};

export default Login;
