import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api";

const AccountContext = createContext();

export const AccountProvider = ({ children }) => {
  const [accountMode, setAccountModeState] = useState(() => {
    return localStorage.getItem("xanatz_account_mode") || "personal";
  });

  const [activeCompany, setActiveCompanyState] = useState(() => {
    try {
      const saved = localStorage.getItem("xanatz_active_company");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [userCompanies, setUserCompanies] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    const token = localStorage.getItem("access");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const [userRes, myCompRes] = await Promise.all([
        api.get("me/"),
        api.get("companies/my-companies/").catch(() => ({ data: [] }))
      ]);
      const userData = userRes.data;
      setUser(userData);
      
      const compMap = new Map();
      (userData.companies || []).forEach(c => {
        compMap.set(c.id, {
          id: c.id,
          name: c.name,
          company_id: c.company_id,
          public_id: c.public_id,
          logo_url: c.logo_url,
          is_owner: c.is_owner,
          access_role: c.access_role || (c.is_owner ? "super_admin" : "member")
        });
      });

      (myCompRes.data || []).forEach(c => {
        const isOwner = c.creator === userData.id || c.creator_email === userData.email;
        const existing = compMap.get(c.id);
        compMap.set(c.id, {
          id: c.id,
          name: c.name,
          company_id: c.company_id,
          public_id: c.public_id,
          logo_url: c.logo_url || c.logo || existing?.logo_url,
          is_owner: existing ? existing.is_owner : isOwner,
          access_role: c.user_permissions?.role || existing?.access_role || (isOwner ? "super_admin" : "member")
        });
      });
      
      const companies = Array.from(compMap.values());
      setUserCompanies(companies);

      // If user has companies and accountMode is company, validate activeCompany
      if (companies.length > 0) {
        const match = activeCompany && companies.find(c => String(c.id) === String(activeCompany.id));
        if (match) {
          setActiveCompanyState(match);
          localStorage.setItem("xanatz_active_company", JSON.stringify(match));
        } else {
          const defaultComp = companies[0];
          setActiveCompanyState(defaultComp);
          localStorage.setItem("xanatz_active_company", JSON.stringify(defaultComp));
        }
      } else if (accountMode === "company") {
        // If user has no companies, revert to personal mode
        setAccountModeState("personal");
        localStorage.setItem("xanatz_account_mode", "personal");
        setActiveCompanyState(null);
        localStorage.removeItem("xanatz_active_company");
      }
    } catch (err) {
      console.error("Failed to fetch user data in AccountContext", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();

    const handleCompanyUpdate = () => {
      fetchUserData();
    };

    window.addEventListener("xanatz_company_updated", handleCompanyUpdate);
    return () => {
      window.removeEventListener("xanatz_company_updated", handleCompanyUpdate);
    };
  }, []);

  const setAccountMode = (mode) => {
    setAccountModeState(mode);
    localStorage.setItem("xanatz_account_mode", mode);
    
    // Broadcast event so other tabs or non-react components update if needed
    window.dispatchEvent(new Event("xanatz_account_mode_change"));
  };

  const setActiveCompany = (companyObj) => {
    setActiveCompanyState(companyObj);
    if (companyObj) {
      localStorage.setItem("xanatz_active_company", JSON.stringify(companyObj));
    } else {
      localStorage.removeItem("xanatz_active_company");
    }
  };

  const switchAccountMode = (mode, companyObj = null) => {
    if (mode === "company") {
      const targetCompany = companyObj || (userCompanies.length > 0 ? userCompanies[0] : null);
      if (!targetCompany) {
        console.warn("Cannot switch to company mode: User has no registered companies");
        return;
      }
      setActiveCompany(targetCompany);
      setAccountMode("company");
    } else {
      setAccountMode("personal");
    }
  };

  return (
    <AccountContext.Provider
      value={{
        accountMode,
        activeCompany,
        userCompanies,
        user,
        loading,
        setAccountMode,
        setActiveCompany,
        switchAccountMode,
        refreshUserData: fetchUserData
      }}
    >
      {children}
    </AccountContext.Provider>
  );
};

export const useAccount = () => {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error("useAccount must be used within an AccountProvider");
  }
  return context;
};

export default AccountContext;
