import React, { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import api from "../api";

const Login = () => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setCredentials({ ...credentials, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await api.post("auth/login/", credentials);
      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid credentials, please try again.");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await api.post("auth/google/", {
        credential: credentialResponse.credential,
      });
      localStorage.setItem("access", response.data.tokens.access);
      localStorage.setItem("refresh", response.data.tokens.refresh);
      navigate("/dashboard");
    } catch (err) {
      setError("Google Login failed.");
    }
  };

  return (
    <div className="h-screen flex flex-col md:flex-row bg-primary overflow-hidden">
      {/* Left Panel: Branding & Quotes */}
      <div className="hidden md:flex md:w-1/2 bg-primary relative items-center justify-center p-12 overflow-hidden border-r border-secondary/20">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-accent/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-lg">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
          >
            <h1 className="text-6xl font-black text-white mb-6 tracking-tighter">
              Xanatz<span className="text-accent">.</span>
            </h1>
            <div className="space-y-8">
              <div className="p-1 px-4 border-l-4 border-accent bg-secondary/10 backdrop-blur-sm rounded-r-xl">
                <p className="text-2xl font-light text-slate-100 leading-relaxed italic">
                  "The bridge between talent and opportunity is built on
                  referrals."
                </p>
                <p className="text-accent font-semibold mt-4">
                  — Global Talent Network
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6 mt-12">
                <div className="p-4 rounded-lg bg-secondary/20 border border-secondary/30">
                  <h3 className="text-3xl font-bold text-white mb-1">50k+</h3>
                  <p className="text-slate-400 text-sm">Active Professionals</p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/20 border border-secondary/30">
                  <h3 className="text-3xl font-bold text-white mb-1">12k+</h3>
                  <p className="text-slate-400 text-sm">Successful Hires</p>
                </div>
              </div>

              <div className="mt-12 flex items-center space-x-4">
                <div className="flex -space-x-4 overflow-hidden">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="inline-block h-10 w-10 rounded-full ring-2 ring-primary bg-secondary/50"
                    />
                  ))}
                </div>
                <p className="text-slate-300 text-sm font-medium">
                  Join 50,000+ experts today
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <div className="absolute inset-0 md:hidden bg-primary overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[80vw] h-[80vw] bg-accent/20 rounded-full blur-[100px] pointer-events-none" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-sm z-10 p-8 rounded-lg bg-secondary/5 border border-secondary/20 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
        >
          <div className="text-center mb-8">
            <div className="md:hidden mb-6">
              <h1 className="text-4xl font-black text-white tracking-tighter">
                Xanatz<span className="text-accent">.</span>
              </h1>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 leading-tight">
              Welcome Back
            </h2>
            <p className="text-slate-400 text-sm">
              Access your referral dashboard
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3 mb-6 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-[0.7rem] text-center font-medium uppercase tracking-wider"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 group-focus-within:text-accent transition-all duration-300 w-4 h-4" />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                required
                className="w-full bg-secondary/10 border border-secondary/20 rounded-lg py-3.5 pl-11 pr-4 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/5 transition-all duration-500"
                onChange={handleChange}
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 group-focus-within:text-accent transition-all duration-300 w-4 h-4" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                required
                className="w-full bg-secondary/10 border border-secondary/20 rounded-lg py-3.5 pl-11 pr-4 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/5 transition-all duration-500"
                onChange={handleChange}
              />
            </div>

            <div className="flex items-center justify-end px-1">
              <a
                href="#"
                className="text-[0.7rem] font-bold text-slate-500 hover:text-accent transition-colors tracking-wide"
              >
                FORGOT PASSWORD?
              </a>
            </div>

            <motion.button
              whileHover={{ scale: 1.01, translateY: -1 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-accent hover:bg-accent/90 text-white font-bold py-3.5 rounded-lg transition-all duration-300 shadow-xl shadow-accent/20 flex items-center justify-center gap-2 text-sm"
            >
              Sign In
            </motion.button>
          </form>

          <div className="my-7 flex items-center gap-4">
            <div className="flex-1 h-[1px] bg-secondary/20" />
            <span className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em]">
              or
            </span>
            <div className="flex-1 h-[1px] bg-secondary/20" />
          </div>

          <div className="flex justify-center px-2">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError("Google Login Failed")}
              theme="outline"
              shape="rectangular"
              text="signin_with"
              width="100%"
            />
          </div>

          <div className="mt-8 text-center">
            <p className="text-slate-500 text-xs font-medium">
              New to Xanatz?{" "}
              <Link
                to="/register"
                className="text-accent hover:text-accent/80 font-bold ml-1 transition-colors"
              >
                Create Account
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
