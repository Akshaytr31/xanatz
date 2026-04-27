import React from "react";
import AuthLayout from "../components/AuthLayout";
import BrandingSection from "../components/BrandingSection";
import RegisterWizard from "../components/RegisterWizard";

const Register = () => {
  const registerStats = [
    { value: "Verify", label: "Instant OTP Security" },
    { value: "Connect", label: "Join the Elite Circle" },
  ];

  const leftPanel = (
    <BrandingSection
      quote="Success is not just about who you know, it's about who trusts you enough to refer you."
      author="The Referral Economy"
      stats={registerStats}
    />
  );

  return (
    <AuthLayout leftPanel={leftPanel}>
      <RegisterWizard />
    </AuthLayout>
  );
};

export default Register;
