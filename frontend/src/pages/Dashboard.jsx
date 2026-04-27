import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { LogOut, User, Settings, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("access")) {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-primary p-6 md:p-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[60vw] h-[60vw] bg-secondary rounded-full blur-[150px] mix-blend-screen pointer-events-none" />

      <header className="flex justify-between items-center mb-12 relative z-10 glass-panel p-4 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg">
            <User className="text-white w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">My Dashboard</h2>
            <p className="text-xs text-secondary">
              Welcome to your secure space
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary border border-secondary rounded-lg transition-colors text-sm text-secondary"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </header>

      <main className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel p-6 rounded-lg md:col-span-2 shadow-xl"
        >
          <h3 className="text-xl font-semibold mb-4 text-secondary">
            Account Overview
          </h3>
          <p className="text-secondary">
            This is your private dashboard. Your application successfully
            authenticated with the Django backend. From here you can manage your
            profile, security settings, and connect other applications.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel p-6 rounded-lg bg-gradient-to-br from-primary/20 to-transparent border border-secondary shadow-xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <Shield className="text-secondary w-5 h-5" />
            <h3 className="text-lg font-semibold text-white">
              Security Status
            </h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-secondary">Email Verification</span>
              <span className="text-green-400 bg-secondary px-2 py-1 rounded-md">
                Verified
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-secondary">Privacy Policy</span>
              <span className="text-green-400 bg-secondary px-2 py-1 rounded-md">
                Accepted
              </span>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
