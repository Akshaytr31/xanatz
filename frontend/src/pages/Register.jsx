import React, { useState, useEffect } from "react";
import AuthLayout from "../components/AuthLayout";
import BrandingSection from "../components/BrandingSection";
import RegisterWizard from "../components/RegisterWizard";
import api from "../api";

const Register = () => {
  const [randomUsers, setRandomUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(null);

  useEffect(() => {
    let isMounted = true;
    api
      .get("public-stats/")
      .then((res) => {
        if (isMounted && res.data) {
          setRandomUsers(res.data.random_users || []);
          setTotalUsers(res.data.total_users ?? null);
        }
      })
      .catch((err) => {
        console.warn("Could not fetch public stats:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const registerStats = [
    { value: "Verify", label: "Instant OTP Security" },
    { value: "Connect", label: "Join the Elite Circle" },
  ];

  const leftPanel = (
    <BrandingSection
      quote="Success is not just about who you know, it's about who trusts you enough to refer you."
      author="The Referral Economy"
      stats={registerStats}
      randomUsers={randomUsers}
      communityText={
        totalUsers !== null
          ? `Join ${totalUsers.toLocaleString()}+ verified members today`
          : "Join our verified platform today"
      }
    />
  );

  return (
    <AuthLayout leftPanel={leftPanel}>
      <RegisterWizard />
    </AuthLayout>
  );
};

export default Register;
