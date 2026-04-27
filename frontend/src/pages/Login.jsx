import React from "react";
import AuthLayout from "../components/AuthLayout";
import BrandingSection from "../components/BrandingSection";
import LoginForm from "../components/LoginForm";

const Login = () => {
  const loginStats = [
    { value: "50k+", label: "Active Professionals" },
    { value: "12k+", label: "Successful Hires" },
  ];

  const leftPanel = (
    <BrandingSection
      quote="The bridge between talent and opportunity is built on referrals."
      author="Global Talent Network"
      stats={loginStats}
    />
  );

  return (
    <AuthLayout leftPanel={leftPanel}>
      <LoginForm />
    </AuthLayout>
  );
};

export default Login;
