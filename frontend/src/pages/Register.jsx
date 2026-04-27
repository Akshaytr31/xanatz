import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  KeyRound,
  Lock,
  User,
  Phone,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import api from "../api";

const slideVariants = {
  enter: (direction) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction) => ({ x: direction < 0 ? 300 : -300, opacity: 0 }),
};

const Register = () => {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    password: "",
    confirm_password: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    accepted_privacy_policy: false,
  });

  const handleChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const nextStep = () => {
    setDirection(1);
    setStep((prev) => prev + 1);
    setError("");
  };
  const prevStep = () => {
    setDirection(-1);
    setStep((prev) => prev - 1);
    setError("");
  };

  // Step 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("auth/send-otp/", { email: formData.email });
      nextStep();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to send OTP. Email may exist.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("auth/verify-otp/", {
        email: formData.email,
        otp: formData.otp,
      });
      nextStep();
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP code.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Password Validation
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match");
      return;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    nextStep();
  };

  // Step 4: Final Registration
  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await api.post("auth/register/", formData);
      localStorage.setItem("access", response.data.tokens.access);
      localStorage.setItem("refresh", response.data.tokens.refresh);
      navigate("/dashboard");
    } catch (err) {
      setError("Registration failed. Please check details.");
    } finally {
      setLoading(false);
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
      setError("Google Sign In failed.");
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
                  "Success is not just about who you know, it's about who trusts
                  you enough to refer you."
                </p>
                <p className="text-accent font-semibold mt-4">
                  — The Referral Economy
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6 mt-12">
                <div className="p-4 rounded-lg bg-secondary/20 border border-secondary/30">
                  <h3 className="text-3xl font-bold text-white mb-1">Verify</h3>
                  <p className="text-slate-400 text-sm">Instant OTP Security</p>
                </div>
                <div className="p-4 rounded-lg bg-secondary/20 border border-secondary/30">
                  <h3 className="text-3xl font-bold text-white mb-1">
                    Connect
                  </h3>
                  <p className="text-slate-400 text-sm">
                    Join the Elite Circle
                  </p>
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
                  Be part of the next big thing.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel: Registration Form */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        <div className="absolute inset-0 md:hidden bg-primary overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[80vw] h-[80vw] bg-accent/20 rounded-full blur-[100px] pointer-events-none" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-sm z-10 p-8 rounded-lg bg-secondary/5 border border-secondary/20 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] backdrop-blur-2xl overflow-hidden relative"
        >
          {/* Progress Bar */}
          <div className="flex gap-1.5 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= i ? "bg-accent shadow-[0_0_12px_rgba(205,36,38,0.4)]" : "bg-secondary/20"}`}
              />
            ))}
          </div>

          <div className="text-center mb-6">
            <div className="md:hidden mb-4">
              <h1 className="text-4xl font-black text-white tracking-tighter">
                Xanatz<span className="text-accent">.</span>
              </h1>
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">
              {step === 1 && "Start Journey"}
              {step === 2 && "Verification"}
              {step === 3 && "Security First"}
              {step === 4 && "About You"}
            </h2>
            <p className="text-slate-400 text-xs tracking-wide">
              Step {step} of 4
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

          <div className="relative min-h-[300px]">
            <AnimatePresence custom={direction} mode="wait">
              {step === 1 && (
                <motion.form
                  key="step1"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.4 }}
                  onSubmit={handleSendOTP}
                  className="absolute w-full space-y-5"
                >
                  <p className="text-slate-400 text-xs text-center leading-relaxed">
                    Enter your email. We'll send a <br /> one-time verification
                    code.
                  </p>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 group-focus-within:text-accent transition-all duration-300 w-4 h-4" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Email Address"
                      required
                      className="w-full bg-secondary/10 border border-secondary/20 rounded-lg py-3.5 pl-11 pr-4 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/5 transition-all duration-500"
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.01, translateY: -1 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full bg-accent hover:bg-accent/90 text-white font-bold py-3.5 rounded-lg transition-all duration-300 shadow-xl shadow-accent/20 flex justify-center items-center gap-2 text-sm"
                  >
                    {loading ? (
                      "SENDING..."
                    ) : (
                      <>
                        SEND CODE <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>

                  <div className="my-7 flex items-center gap-4">
                    <div className="flex-1 h-[1px] bg-secondary/20" />
                    <span className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em]">
                      OR
                    </span>
                    <div className="flex-1 h-[1px] bg-secondary/20" />
                  </div>

                  <div className="flex justify-center px-2">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => setError("Google Sign In failed")}
                      theme="outline"
                      shape="rectangular"
                      text="continue_with"
                      width="100%"
                    />
                  </div>
                </motion.form>
              )}

              {step === 2 && (
                <motion.form
                  key="step2"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.4 }}
                  onSubmit={handleVerifyOTP}
                  className="absolute w-full space-y-6"
                >
                  <p className="text-slate-400 text-xs text-center leading-relaxed">
                    Check your inbox at <br />
                    <span className="text-accent font-bold">
                      {formData.email}
                    </span>
                  </p>
                  <div className="relative group">
                    <KeyRound className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 group-focus-within:text-accent transition-all duration-300 w-4 h-4" />
                    <input
                      type="text"
                      name="otp"
                      value={formData.otp}
                      onChange={handleChange}
                      placeholder="6-DIGIT CODE"
                      maxLength={6}
                      required
                      className="w-full bg-secondary/10 border border-secondary/20 rounded-lg py-3.5 pl-11 pr-4 text-white text-center tracking-[1em] text-lg font-mono focus:outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/5 transition-all duration-500"
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.01, translateY: -1 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full bg-accent hover:bg-accent/90 text-white font-bold py-3.5 rounded-lg transition-all duration-300 shadow-xl shadow-accent/20 text-sm"
                  >
                    {loading ? "VERIFYING..." : "VERIFY CODE"}
                  </motion.button>
                  <button
                    type="button"
                    onClick={prevStep}
                    className="w-full text-slate-500 hover:text-accent transition-colors text-[0.7rem] font-bold uppercase tracking-tight"
                  >
                    wrong email? go back
                  </button>
                </motion.form>
              )}

              {step === 3 && (
                <motion.form
                  key="step3"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.4 }}
                  onSubmit={handlePasswordSubmit}
                  className="absolute w-full space-y-4"
                >
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 group-focus-within:text-accent transition-all duration-300 w-4 h-4" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="NEW PASSWORD"
                      required
                      className="w-full bg-secondary/10 border border-secondary/20 rounded-lg py-3.5 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/5 transition-all duration-500"
                    />
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 group-focus-within:text-accent transition-all duration-300 w-4 h-4" />
                    <input
                      type="password"
                      name="confirm_password"
                      value={formData.confirm_password}
                      onChange={handleChange}
                      placeholder="CONFIRM PASSWORD"
                      required
                      className="w-full bg-secondary/10 border border-secondary/20 rounded-lg py-3.5 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/5 transition-all duration-500"
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.01, translateY: -1 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full bg-accent hover:bg-accent/90 text-white font-bold py-3.5 rounded-lg transition-all duration-300 shadow-xl shadow-accent/20 text-sm mt-2"
                  >
                    CONTINUE
                  </motion.button>
                </motion.form>
              )}

              {step === 4 && (
                <motion.form
                  key="step4"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.4 }}
                  onSubmit={handleFinalSubmit}
                  className="absolute w-full space-y-4"
                >
                  <div className="flex gap-3">
                    <div className="relative flex-1 group">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 group-focus-within:text-accent transition-all duration-300 w-4 h-4" />
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        placeholder="FIRST"
                        required
                        className="w-full bg-secondary/10 border border-secondary/20 rounded-lg py-3.5 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/5"
                      />
                    </div>
                    <div className="relative flex-1 group">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 group-focus-within:text-accent transition-all duration-300 w-4 h-4" />
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        placeholder="LAST"
                        required
                        className="w-full bg-secondary/10 border border-secondary/20 rounded-lg py-3.5 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/5"
                      />
                    </div>
                  </div>

                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 group-focus-within:text-accent transition-all duration-300 w-4 h-4" />
                    <input
                      type="tel"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleChange}
                      placeholder="PHONE NUMBER"
                      className="w-full bg-secondary/10 border border-secondary/20 rounded-lg py-3.5 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/5"
                    />
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-secondary/5 rounded-lg border border-secondary/10">
                    <input
                      type="checkbox"
                      name="accepted_privacy_policy"
                      checked={formData.accepted_privacy_policy}
                      onChange={handleChange}
                      required
                      id="privacy"
                      className="mt-0.5 w-3.5 h-3.5 rounded border-secondary/40 bg-primary checked:bg-accent focus:ring-accent"
                    />
                    <label
                      htmlFor="privacy"
                      className="text-[0.65rem] text-slate-500 leading-tight"
                    >
                      I agree to the{" "}
                      <a
                        href="#"
                        className="text-slate-300 underline font-bold"
                      >
                        Privacy Policy
                      </a>{" "}
                      and network terms.
                    </label>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01, translateY: -1 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading || !formData.accepted_privacy_policy}
                    className="w-full bg-accent hover:bg-accent/90 text-white font-bold py-4 rounded-lg transition-all duration-300 shadow-xl shadow-accent/20 flex justify-center items-center gap-2 text-sm disabled:opacity-50"
                  >
                    {loading ? (
                      "CREATING..."
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5" /> JOIN XANATZ
                      </>
                    )}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {step === 1 && (
            <div className="mt-8 text-center">
              <p className="text-slate-500 text-xs font-medium">
                Member already?{" "}
                <Link
                  to="/login"
                  className="text-accent hover:text-accent/80 font-bold ml-1 transition-colors"
                >
                  Sign In
                </Link>
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
