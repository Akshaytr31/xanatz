import React, { useState, useEffect } from "react";
import { Box, Flex, Text, Button, VStack, HStack, Container, Spinner, Badge, Grid, GridItem } from "@chakra-ui/react";
import { Building2, ArrowLeft, Globe, MapPin, Users, Calendar, Link2, AtSign, Settings2, Briefcase, TrendingUp, Award, ExternalLink, Plus, FileText, CreditCard, Zap, Share2, Check, Star, Flag, ShieldAlert, CheckCircle2, HelpCircle, Edit, Trash2, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import CompanyProfileModal from "../components/company/CompanyProfileModal";
import CompanyMembersList from "../components/company/CompanyMembersList";
import JobOpeningModal from "../components/company/JobOpeningModal";
import RFPModal from "../components/company/RFPModal";
import PricingPlansModal from "../components/company/PricingPlansModal";
import CompanyFAQModal from "../components/company/CompanyFAQModal";
import api from "../api";


const MotionBox = motion.create(Box);

const INDUSTRY_LABELS = {
  technology: "Technology", finance: "Finance", healthcare: "Healthcare",
  education: "Education", retail: "Retail & E-commerce", manufacturing: "Manufacturing",
  media: "Media & Entertainment", real_estate: "Real Estate", consulting: "Consulting",
  logistics: "Logistics", hospitality: "Hospitality", energy: "Energy", other: "Other",
};
const SIZE_LABELS = {
  "1-10": "1–10", "11-50": "11–50", "51-200": "51–200",
  "201-500": "201–500", "501-1000": "501–1000", "1001+": "1001+",
};

const INDUSTRY_COLORS = {
  technology: "#3b82f6", finance: "#10b981", healthcare: "#ef4444",
  education: "#f59e0b", retail: "#8b5cf6", manufacturing: "#6b7280",
  media: "#ec4899", real_estate: "#f97316", consulting: "#06b6d4",
  logistics: "#84cc16", hospitality: "#a78bfa", energy: "#fbbf24", other: "#9ca3af",
};

const StatCard = ({ icon: Icon, label, value, color = "rgba(66,153,225,0.8)", delay = 0 }) => (
  <MotionBox
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay, type: "spring", stiffness: 80 }}
    whileHover={{ y: -6, scale: 1.02 }}
    flex={1}
    minW="160px"
    p={6}
    borderRadius="2xl"
    border="1px solid var(--color-card-border)"
    position="relative"
    overflow="hidden"
    style={{
      background: "var(--color-surface)",
      backdropFilter: "blur(24px)",
      boxShadow: "0 8px 32px 0 rgba(0,0,0,0.08)"
    }}
    _hover={{ 
      borderColor: `${color}40`,
      boxShadow: `0 12px 40px ${color}15, 0 0 0 1px ${color}20`,
    }}
    textAlign="center"
  >
    {/* Top glowing accent border */}
    <Box position="absolute" top={0} left={0} right={0} h="2px" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />

    {/* Subtle glow behind the icon */}
    <Box position="absolute" top="10%" left="50%" transform="translateX(-50%)" w="60px" h="60px" borderRadius="full"
      style={{ background: color, filter: "blur(25px)", opacity: 0.18 }} pointerEvents="none" />
      
    <Flex
      w="48px" h="48px" borderRadius="xl" align="center" justify="center"
      mx="auto" mb={4} position="relative" zIndex={1}
      style={{ background: `linear-gradient(135deg, ${color}25, ${color}05)`, border: `1px solid ${color}35` }}
    >
      <Icon size={20} color={color} />
    </Flex>
    <Text color="var(--color-text-primary)" fontWeight="black" fontSize="2xl" lineHeight="1" letterSpacing="tight" position="relative" zIndex={1}>{value || "—"}</Text>
    <Text color="var(--color-text-muted)" fontSize="9px" fontWeight="black" letterSpacing="widest" mt={2} position="relative" zIndex={1}>{label.toUpperCase()}</Text>
  </MotionBox>
);

const CompanyDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [rfps, setRfps] = useState([]);
  const [rfpInterests, setRfpInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isRfpModalOpen, setIsRfpModalOpen] = useState(false);
  const [selectedRfp, setSelectedRfp] = useState(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState(null);
  const [expandedFaqId, setExpandedFaqId] = useState(null);
  const [copied, setCopied] = useState(false);
  const [reviewTab, setReviewTab] = useState("employee");
  const [flagModal, setFlagModal] = useState({
    isOpen: false,
    reviewId: null,
    status: 'confirm', // 'confirm' | 'success' | 'error'
    loading: false
  });

  const handleShare = () => {
    if (!company) return;
    const shareUrl = `${window.location.origin}/c/${company.public_id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenFlagModal = (reviewId) => {
    setFlagModal({
      isOpen: true,
      reviewId,
      status: 'confirm',
      loading: false
    });
  };

  const handleCloseFlagModal = () => {
    setFlagModal({
      isOpen: false,
      reviewId: null,
      status: 'confirm',
      loading: false
    });
  };

  const handleConfirmFlag = async () => {
    const { reviewId } = flagModal;
    if (!reviewId) return;

    setFlagModal(prev => ({ ...prev, loading: true }));
    try {
      await api.post(`reviews/${reviewId}/flag/`);
      
      setCompany(prev => {
        if (!prev) return prev;
        const updatedEmployeeReviews = (prev.employee_reviews || []).map(r => 
          r.id === reviewId ? { ...r, is_flagged: true } : r
        );
        const updatedPartnerReviews = (prev.partner_reviews || []).map(r => 
          r.id === reviewId ? { ...r, is_flagged: true } : r
        );
        return {
          ...prev,
          employee_reviews: updatedEmployeeReviews,
          partner_reviews: updatedPartnerReviews
        };
      });

      setFlagModal(prev => ({ ...prev, loading: false, status: 'success' }));
    } catch (err) {
      console.error("Error flagging review:", err);
      setFlagModal(prev => ({ ...prev, loading: false, status: 'error' }));
    }
  };

  const fetchCompany = async () => {
    try {
      const [cRes, uRes, jRes, aRes, rRes, riRes] = await Promise.all([
        api.get(`companies/${id}/`),
        api.get("me/"),
        api.get(`jobs/?company_id=${id}`),
        api.get(`applications/?company_id=${id}`).catch(() => ({ data: [] })),
        api.get(`rfps/?company_id=${id}`).catch(() => ({ data: [] })),
        api.get(`rfp-interests/?company_id=${id}`).catch(() => ({ data: [] }))
      ]);
      setCompany(cRes.data);
      setCurrentUser(uRes.data);
      setJobs(jRes.data);
      setApplications(aRes.data);
      setRfps(rRes.data);
      setRfpInterests(riRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };


  useEffect(() => { fetchCompany(); }, [id]);

  const handleLogout = () => { localStorage.clear(); navigate("/login"); };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job opening?")) return;
    try {
      await api.delete(`jobs/${jobId}/`);
      fetchCompany();
    } catch (err) {
      console.error("Failed to delete job", err);
    }
  };

  const handleEditJob = (job) => {
    setSelectedJob(job);
    setIsJobModalOpen(true);
  };

  const handleAddJob = () => {
    // Check if company has active subscription with remaining credits
    const sub = company?.active_subscription;
    if (!sub || sub.is_credits_exhausted) {
      setIsPlanModalOpen(true);
      return;
    }
    setSelectedJob(null);
    setIsJobModalOpen(true);
  };

  const handleAddRfp = () => {
    setSelectedRfp(null);
    setIsRfpModalOpen(true);
  };

  const handleAddFaq = () => {
    setSelectedFaq(null);
    setIsFaqModalOpen(true);
  };

  const handleEditFaq = (faq) => {
    setSelectedFaq(faq);
    setIsFaqModalOpen(true);
  };

  const handleDeleteFaq = async (faqId) => {
    if (!window.confirm("Are you sure you want to delete this FAQ?")) return;
    try {
      await api.delete(`faqs/${faqId}/`);
      fetchCompany();
    } catch (err) {
      console.error("Failed to delete FAQ", err);
    }
  };

  const toggleFaq = (faqId) => {
    setExpandedFaqId(expandedFaqId === faqId ? null : faqId);
  };

  const isOwner = currentUser && company && company.creator === currentUser.id;
  const currentUserMemberInfo = company?.members_details?.find(m => m.id === currentUser?.id);
  const isAdmin = currentUserMemberInfo?.access_role === 'admin';
  const hasAccess = isOwner || isAdmin;
  const accentColor = "#CD2426"; // Red accent from index.css

  if (loading) return (
    <Flex h="100vh" align="center" justify="center" bg="var(--color-primary)">
      <VStack gap={4}>
        <Spinner size="xl" thickness="4px" color="var(--color-accent)" />
        <Text color="var(--color-text-muted)" fontSize="xs" fontWeight="black" letterSpacing="widest">LOADING...</Text>
      </VStack>
    </Flex>
  );

  if (!company) return (
    <Flex h="100vh" align="center" justify="center" bg="var(--color-primary)">
      <Text color="var(--color-text-primary)">Company not found.</Text>
    </Flex>
  );

  return (
    <Box minH="100vh" bg="var(--color-primary)" position="relative" overflow="hidden" pb="60px">
      {/* Sleek aesthetic background glows */}
      <Box position="fixed" inset={0} zIndex={0} pointerEvents="none">
        <Box position="absolute" top="-10%" left="-5%" w="600px" h="600px" borderRadius="full"
          style={{ background: `radial-gradient(circle, ${accentColor}12 0%, transparent 70%)`, filter: "blur(80px)" }}
        />
        <Box position="absolute" bottom="-15%" right="-10%" w="550px" h="550px" borderRadius="full"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)", filter: "blur(80px)" }}
        />
      </Box>

      <Box position="relative" zIndex={1}>
        <Navbar handleLogout={handleLogout} />

        {/* ── HERO BANNER ── */}
        <Box position="relative" h="300px" overflow="hidden">
          {/* Banner bg */}
          <Box position="absolute" inset={0}
            style={{
              background: `linear-gradient(180deg, ${accentColor}18 0%, var(--color-primary) 100%)`,
            }}
          />
          {/* Grid pattern overlay */}
          <Box position="absolute" inset={0} opacity={0.12}
            style={{
              backgroundImage: `linear-gradient(${accentColor}55 1px, transparent 1px), linear-gradient(90deg, ${accentColor}55 1px, transparent 1px)`,
              backgroundSize: "45px 45px",
            }}
          />
          {/* Glow orb */}
          <Box position="absolute" top="-80px" left="50%" transform="translateX(-50%)" w="450px" h="450px" borderRadius="full"
            style={{ background: `radial-gradient(circle, ${accentColor}20 0%, transparent 65%)`, filter: "blur(40px)" }}
          />

          {/* Back button */}
          <Box position="absolute" top="95px" left={0} right={0}>
            <Container maxW="1000px" px={6}>
              <MotionBox initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
                <Button 
                  variant="ghost" 
                  color="var(--color-text-muted)" 
                  fontWeight="black" 
                  fontSize="2xs"
                  letterSpacing="widest" 
                  px={4} 
                  py={4}
                  borderRadius="full"
                  border="1px solid var(--color-card-border)"
                  bg="var(--color-input-bg)"
                  backdropFilter="blur(10px)"
                  _hover={{ color: "var(--color-text-primary)", bg: "var(--color-card-hover-bg)", transform: "translateX(-3px)", borderColor: "var(--color-card-border)" }} 
                  transition="all 0.3s"
                  onClick={() => navigate("/profile")}
                >
                  <ArrowLeft size={12} style={{ marginRight: "6px" }} />
                  PERSONAL PROFILE
                </Button>
              </MotionBox>
            </Container>
          </Box>
        </Box>

        <Container maxW="1000px" px={6} mt="-100px" position="relative" zIndex={2}>
          {/* ── PROFILE ROW ── */}
          <MotionBox initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Flex align="flex-end" justify="space-between" mb={8} gap={4} flexWrap="wrap">
              {/* Logo + identity */}
              <HStack align="flex-end" gap={6}>
                {/* Logo */}
                <Box position="relative">
                  <Box w="110px" h="110px" borderRadius="2xl" overflow="hidden" flexShrink={0}
                    border="3px solid var(--color-card-border)"
                    style={{
                      background: `linear-gradient(135deg, ${accentColor}10, var(--color-surface))`,
                      boxShadow: "0 20px 50px rgba(0,0,0,0.05)",
                    }}
                  >
                    {company.logo_url ? (
                      <Box as="img" src={company.logo_url} alt={company.name} w="full" h="full" style={{ objectFit: "cover" }} />
                    ) : (
                      <Flex w="full" h="full" align="center" justify="center">
                        <Text fontWeight="black" fontSize="4xl" letterSpacing="tight" style={{ color: accentColor }}>
                          {company.name.charAt(0).toUpperCase()}
                        </Text>
                      </Flex>
                    )}
                  </Box>
                  {/* Active dot */}
                  {company.is_active && (
                    <Box position="absolute" bottom="5px" right="5px" w="15px" h="15px" borderRadius="full" bg="green.400"
                      border="2px solid var(--color-primary)"
                      style={{ boxShadow: "0 0 12px rgba(72,199,116,0.5)" }}
                    />
                  )}
                </Box>

                <VStack align="start" gap={1.5} pb={1}>
                  <HStack gap={2} flexWrap="wrap">
                    {isOwner && (
                      <Badge px={2.5} py={0.5} fontSize="3xs" fontWeight="black" borderRadius="full"
                        style={{ background: `${accentColor}10`, color: accentColor, border: `1px solid ${accentColor}20` }}>
                        OWNER
                      </Badge>
                    )}
                    {isAdmin && !isOwner && (
                      <Badge px={2.5} py={0.5} fontSize="3xs" fontWeight="black" borderRadius="full"
                        style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
                        ADMIN
                      </Badge>
                    )}
                    {company.industry && (
                      <Badge px={2.5} py={0.5} fontSize="3xs" fontWeight="black" borderRadius="full"
                        style={{ background: "var(--color-card-bg)", color: "var(--color-text-secondary)", border: "1px solid var(--color-card-border)" }}>
                        {INDUSTRY_LABELS[company.industry] || company.industry}
                      </Badge>
                    )}
                  </HStack>
                  <Text color="var(--color-text-primary)" fontWeight="black" fontSize="3xl" letterSpacing="tight" lineHeight="1">
                    {company.name}
                  </Text>
                  {company.tagline && (
                    <Text color="var(--color-text-muted)" fontSize="sm" fontStyle="italic" fontWeight="medium">
                      "{company.tagline}"
                    </Text>
                  )}
                </VStack>
              </HStack>

              {/* Actions */}
              <HStack gap={3} pb={2}>
                {company.website && (
                  <Box as="a" href={company.website} target="_blank" rel="noopener noreferrer"
                    w="44px" h="44px" borderRadius="full" display="flex" alignItems="center" justifyContent="center"
                    border="1px solid var(--color-card-border)"
                    style={{ background: "var(--color-card-bg)", backdropFilter: "blur(10px)", cursor: "pointer", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)" }}
                    _hover={{ borderColor: "var(--color-text-muted)", background: "var(--color-card-hover-bg)", transform: "translateY(-3px)" }}
                    title="Visit Website"
                  >
                    <Globe size={18} color="var(--color-text-muted)" />
                  </Box>
                )}
                {isOwner && (
                  <Box as="button" onClick={() => setIsModalOpen(true)}
                    w="44px" h="44px" borderRadius="full" display="flex" alignItems="center" justifyContent="center"
                    border="1px solid var(--color-card-border)"
                    style={{ background: "var(--color-card-bg)", backdropFilter: "blur(10px)", cursor: "pointer", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)" }}
                    _hover={{ 
                      borderColor: accentColor, 
                      background: `${accentColor}10`, 
                      transform: "translateY(-3px)",
                    }}
                    title="Edit Profile"
                  >
                    <Settings2 size={18} color="var(--color-text-primary)" />
                  </Box>
                )}
                <Box as="button" onClick={handleShare}
                  w="44px" h="44px" borderRadius="full" display="flex" alignItems="center" justifyContent="center"
                  border="1px solid var(--color-card-border)"
                  style={{ background: "var(--color-card-bg)", backdropFilter: "blur(10px)", cursor: "pointer", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)" }}
                  _hover={{ 
                    borderColor: copied ? "#4ade80" : "rgba(139,92,246,0.6)", 
                    background: copied ? "rgba(74,222,128,0.1)" : "rgba(139,92,246,0.08)", 
                    transform: "translateY(-3px)",
                  }}
                  title="Share Company Profile"
                >
                  {copied ? <Check size={18} color="#4ade80" /> : <Share2 size={18} color="var(--color-text-primary)" />}
                </Box>
              </HStack>
            </Flex>
          </MotionBox>

          {/* ── STATS ROW ── */}
          <MotionBox initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }} mb={6}>
            <Flex gap={4} flexWrap="wrap">
              <StatCard icon={Users} label="MEMBERS" value={company.members.length} color={accentColor} delay={0.1} />
              {hasAccess && (
                <MotionBox
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.12, type: "spring", stiffness: 80 }}
                  whileHover={{ y: -6, scale: 1.02 }}
                  flex={1}
                  minW="160px"
                  p={6}
                  borderRadius="2xl"
                  border={company.active_subscription ? "1px solid var(--color-card-border)" : "1px dashed rgba(245,158,11,0.4)"}
                  position="relative"
                  overflow="hidden"
                  style={{
                    background: company.active_subscription
                      ? "var(--color-surface)"
                      : "linear-gradient(135deg, rgba(245,158,11,0.05) 0%, var(--color-surface) 100%)",
                    backdropFilter: "blur(24px)",
                    boxShadow: "0 8px 32px 0 rgba(0,0,0,0.08)",
                    cursor: "pointer",
                  }}
                  onClick={() => setIsPlanModalOpen(true)}
                  _hover={{
                    borderColor: company.active_subscription ? "rgba(59,130,246,0.3)" : "rgba(245,158,11,0.6)",
                    boxShadow: company.active_subscription
                      ? "0 12px 40px rgba(59,130,246,0.1)"
                      : "0 12px 40px rgba(245,158,11,0.15)",
                  }}
                  textAlign="center"
                >
                  {/* Top accent */}
                  <Box position="absolute" top={0} left={0} right={0} h="2px"
                    style={{
                      background: company.active_subscription
                        ? `linear-gradient(90deg, transparent, rgba(59,130,246,0.6), transparent)`
                        : `linear-gradient(90deg, transparent, rgba(245,158,11,0.8), transparent)`
                    }}
                  />

                  {company.active_subscription ? (
                    <>
                      <Flex w="48px" h="48px" borderRadius="xl" align="center" justify="center" mx="auto" mb={3}
                        style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)" }}>
                        <CreditCard size={20} color="#3b82f6" />
                      </Flex>
                      <Text color="var(--color-text-primary)" fontWeight="black" fontSize="lg" lineHeight="1" letterSpacing="tight">
                        {company.active_subscription.jobs_remaining}/{company.active_subscription.max_jobs}
                      </Text>
                      <Text color="var(--color-text-muted)" fontSize="9px" fontWeight="black" letterSpacing="widest" mt={1.5}>
                        CREDITS LEFT
                      </Text>
                      <Badge mt={2} px={2} py={0.5} fontSize="7px" fontWeight="black" borderRadius="full"
                        style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6", border: "1px solid rgba(59,130,246,0.2)" }}>
                        {company.active_subscription.plan_display_name.toUpperCase()} PLAN
                      </Badge>
                    </>
                  ) : (
                    <>
                      <Flex w="48px" h="48px" borderRadius="xl" align="center" justify="center" mx="auto" mb={3}
                        style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)" }}>
                        <Zap size={20} color="#f59e0b" />
                      </Flex>
                      <Text color="var(--color-text-primary)" fontWeight="black" fontSize="sm" lineHeight="1.3" letterSpacing="tight">
                        No Plan
                      </Text>
                      <Text color="rgba(245,158,11,0.8)" fontSize="9px" fontWeight="black" letterSpacing="widest" mt={1.5}>
                        SUBSCRIBE TO POST
                      </Text>
                    </>
                  )}
                </MotionBox>
              )}
              {company.founded_year && (
                <StatCard icon={Calendar} label="FOUNDED" value={company.founded_year} color="rgba(139,92,246,0.6)" delay={0.15} />
              )}
              {company.company_size && (
                <StatCard icon={TrendingUp} label="TEAM SIZE" value={SIZE_LABELS[company.company_size]} color="rgba(16,185,129,0.6)" delay={0.2} />
              )}
              {company.location && (
                <StatCard icon={MapPin} label="LOCATION" value={company.location} color="rgba(245,158,11,0.6)" delay={0.25} />
              )}
            </Flex>
          </MotionBox>

          {/* ── MAIN CONTENT GRID ── */}
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
            {/* Pair 1: About Card & Quick Info Card */}
            {company.description && (
              <GridItem colSpan={{ base: 2, md: 1 }}>
                <MotionBox initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
                  h="full"
                  p={7} borderRadius="2xl" border="1px solid var(--color-card-border)"
                  style={{ background: "var(--color-surface)" }}
                >
                  <HStack gap={3} mb={5}>
                    <Box w="3px" h="18px" borderRadius="full" style={{ background: accentColor }} />
                    <Text color="var(--color-text-muted)" fontSize="10px" fontWeight="black" letterSpacing="widest">ABOUT</Text>
                  </HStack>
                  <Text color="var(--color-text-secondary)" fontSize="sm" lineHeight="1.95" fontWeight="normal">
                    {company.description}
                  </Text>
                </MotionBox>
              </GridItem>
            )}

            <GridItem colSpan={{ base: 2, md: company.description ? 1 : 2 }}>
              <MotionBox initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
                h="full"
                p={6} borderRadius="2xl" border="1px solid var(--color-card-border)"
                style={{ background: "var(--color-surface)" }}
              >
                <Text color="var(--color-text-muted)" fontSize="10px" fontWeight="black" letterSpacing="widest" mb={5}>COMPANY INFO</Text>
                <VStack align="stretch" gap={4.5}>
                  {[
                    { icon: Briefcase, label: "Industry", value: INDUSTRY_LABELS[company.industry] },
                    { icon: MapPin, label: "Location", value: company.location },
                    { icon: TrendingUp, label: "Size", value: SIZE_LABELS[company.company_size] },
                    { icon: Calendar, label: "Founded", value: company.founded_year },
                  ].filter(i => i.value).map(({ icon: Icon, label, value }) => (
                    <Flex key={label} align="center" gap={3.5}>
                      <Box w="36px" h="36px" borderRadius="xl" display="flex" alignItems="center" justifyContent="center" flexShrink={0}
                      style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-card-border)" }}>
                        <Icon size={14} color="var(--color-text-muted)" />
                      </Box>
                      <VStack align="start" gap={0.5}>
                        <Text color="var(--color-text-muted)" fontSize="9px" fontWeight="black" letterSpacing="widest">{label.toUpperCase()}</Text>
                        <Text color="var(--color-text-primary)" fontSize="xs" fontWeight="bold">{value}</Text>
                      </VStack>
                    </Flex>
                  ))}
                </VStack>
              </MotionBox>
            </GridItem>

            {/* Pair 2: Job Openings & Job Applications */}
            <GridItem colSpan={{ base: 2, md: hasAccess ? 1 : 2 }}>
              <MotionBox initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.22 }}
                h="full"
                p={7} borderRadius="2xl" border="1px solid var(--color-card-border)"
                style={{ background: "var(--color-surface)" }}
              >
                <HStack gap={3} mb={5} justify="space-between">
                  <HStack gap={3}>
                    <Box w="3px" h="18px" borderRadius="full" style={{ background: accentColor }} />
                    <Text color="var(--color-text-muted)" fontSize="10px" fontWeight="black" letterSpacing="widest">JOB OPENINGS</Text>
                    <Box px={2} py={0.5} borderRadius="full" style={{ background: `${accentColor}10`, border: `1px solid ${accentColor}20` }}>
                      <Text fontSize="10px" fontWeight="black" style={{ color: accentColor }}>{jobs.length}</Text>
                    </Box>
                  </HStack>
                  
                  <HStack gap={2.5}>
                    <Button h="7" px={3.5} borderRadius="full" fontWeight="black" fontSize="3xs" letterSpacing="widest"
                      color="var(--color-text-secondary)"
                      border="1px solid var(--color-card-border)"
                      bg="var(--color-card-bg)"
                      _hover={{ bg: "var(--color-card-hover-bg)", color: "var(--color-text-primary)", borderColor: "var(--color-card-border)" }}
                      transition="all 0.2s"
                      onClick={() => navigate(`/company/${id}/openings`)}
                    >
                      MANAGE
                    </Button>
                    {hasAccess && (
                      <Button h="7" px={3.5} borderRadius="full" fontWeight="black" fontSize="3xs" letterSpacing="widest" color="white"
                        onClick={handleAddJob}
                        style={{
                          background: accentColor,
                          border: `1px solid ${accentColor}`
                        }}
                        _hover={{ transform: "translateY(-1px)", filter: "brightness(1.1)" }}
                        transition="all 0.2s"
                        leftIcon={<Plus size={11} />}
                      >
                        ADD
                      </Button>
                    )}
                  </HStack>
                </HStack>

                {jobs.length === 0 ? (
                  <Flex direction="column" align="center" py={8} gap={3}>
                    <Box w="60px" h="60px" borderRadius="xl" display="flex" alignItems="center" justifyContent="center"
                      style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-card-border)" }}>
                      <Briefcase size={22} color="var(--color-text-muted)" />
                    </Box>
                    <Text color="var(--color-text-muted)" fontSize="sm" fontWeight="medium">No job openings posted yet</Text>
                  </Flex>
                ) : (
                  <Flex
                    align="center" gap={6} p={5} borderRadius="xl"
                    border="1px solid var(--color-card-border)"
                    style={{ background: "var(--color-card-bg)" }}
                  >
                    {/* Big count */}
                    <Box textAlign="center" flexShrink={0}>
                      <Text fontWeight="black" fontSize="4xl" lineHeight="1" letterSpacing="tight" style={{ color: accentColor }}>
                        {jobs.length}
                      </Text>
                      <Text color="var(--color-text-muted)" fontSize="9px" fontWeight="black" letterSpacing="widest" mt={1.5}>
                        {jobs.length === 1 ? "OPENING" : "OPENINGS"}
                      </Text>
                    </Box>

                    {/* Divider */}
                    <Box w="1px" h="48px" borderRadius="full" bg="var(--color-card-border)" flexShrink={0} />

                    {/* Active vs Inactive breakdown */}
                    <HStack gap={6} flex={1} flexWrap="wrap">
                      <VStack align="start" gap={0.5}>
                        <HStack gap={1.5} align="center">
                          <Box w="6px" h="6px" borderRadius="full" bg="green.500" />
                          <Text fontWeight="black" fontSize="xl" lineHeight="1" color="var(--color-text-primary)">
                            {jobs.filter(j => j.is_active).length}
                          </Text>
                        </HStack>
                        <Text color="var(--color-text-muted)" fontSize="9px" fontWeight="black" letterSpacing="widest">ACTIVE</Text>
                      </VStack>
                      {jobs.filter(j => !j.is_active).length > 0 && (
                        <VStack align="start" gap={0.5}>
                          <HStack gap={1.5} align="center">
                            <Box w="6px" h="6px" borderRadius="full" bg="var(--color-text-muted)" />
                            <Text fontWeight="black" fontSize="xl" lineHeight="1" color="var(--color-text-muted)">
                              {jobs.filter(j => !j.is_active).length}
                            </Text>
                          </HStack>
                          <Text color="var(--color-text-muted)" fontSize="9px" fontWeight="black" letterSpacing="widest">INACTIVE</Text>
                        </VStack>
                      )}
                    </HStack>
                  </Flex>
                )}
              </MotionBox>
            </GridItem>

            {hasAccess && (
              <GridItem colSpan={{ base: 2, md: 1 }}>
                <MotionBox initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.24 }}
                  h="full"
                  p={7} borderRadius="2xl" border="1px solid var(--color-card-border)"
                  style={{ background: "var(--color-surface)" }}
                >
                  <HStack gap={3} mb={5} justify="space-between">
                    <HStack gap={3}>
                      <Box w="3px" h="18px" borderRadius="full" style={{ background: "var(--color-accent)" }} />
                      <Text color="var(--color-text-muted)" fontSize="10px" fontWeight="black" letterSpacing="widest">JOB APPLICATIONS</Text>
                      <Box px={2} py={0.5} borderRadius="full" style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}>
                        <Text fontSize="10px" fontWeight="black" color="var(--color-accent)">{applications.length}</Text>
                      </Box>
                    </HStack>
                    
                    <Button h="7" px={3.5} borderRadius="full" fontWeight="black" fontSize="3xs" letterSpacing="widest"
                      color="var(--color-text-secondary)"
                      border="1px solid var(--color-card-border)"
                      bg="var(--color-card-bg)"
                      _hover={{ bg: "var(--color-card-hover-bg)", color: "var(--color-text-primary)", borderColor: "var(--color-card-border)" }}
                      transition="all 0.2s"
                      onClick={() => navigate(`/company/${id}/applications`)}
                    >
                      MANAGE APPLICATIONS
                    </Button>
                  </HStack>

                  {applications.length === 0 ? (
                    <Flex direction="column" align="center" py={8} gap={3}>
                      <Box w="60px" h="60px" borderRadius="xl" display="flex" alignItems="center" justifyContent="center"
                        style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-card-border)" }}>
                        <FileText size={22} color="var(--color-text-muted)" />
                      </Box>
                      <Text color="var(--color-text-muted)" fontSize="sm" fontWeight="medium">No applications received yet</Text>
                    </Flex>
                  ) : (
                    <Flex
                      align="center" gap={6} p={5} borderRadius="xl"
                      border="1px solid var(--color-card-border)"
                      style={{ background: "var(--color-card-bg)" }}
                    >
                      <Box textAlign="center" flexShrink={0}>
                        <Text fontWeight="black" fontSize="4xl" lineHeight="1" letterSpacing="tight" color="var(--color-accent)">
                          {applications.length}
                        </Text>
                        <Text color="var(--color-text-muted)" fontSize="9px" fontWeight="black" letterSpacing="widest" mt={1.5}>
                          {applications.length === 1 ? "APPLICATION" : "APPLICATIONS"}
                        </Text>
                      </Box>

                      <Box w="1px" h="48px" borderRadius="full" bg="var(--color-card-border)" flexShrink={0} />

                      <HStack gap={6} flex={1} flexWrap="wrap">
                        <VStack align="start" gap={0.5}>
                          <Text fontWeight="black" fontSize="xl" lineHeight="1" color="#3b82f6">
                            {applications.filter(a => a.status === "applied").length}
                          </Text>
                          <Text color="var(--color-text-muted)" fontSize="9px" fontWeight="black" letterSpacing="widest">NEW</Text>
                        </VStack>
                        <VStack align="start" gap={0.5}>
                          <Text fontWeight="black" fontSize="xl" lineHeight="1" color="#8b5cf6">
                            {applications.filter(a => ["shortlisted", "accepted"].includes(a.status)).length}
                          </Text>
                          <Text color="var(--color-text-muted)" fontSize="9px" fontWeight="black" letterSpacing="widest">SHORTLISTED</Text>
                        </VStack>
                        <VStack align="start" gap={0.5}>
                          <Text fontWeight="black" fontSize="xl" lineHeight="1" color="#ef4444">
                            {applications.filter(a => a.status === "rejected").length}
                          </Text>
                          <Text color="var(--color-text-muted)" fontSize="9px" fontWeight="black" letterSpacing="widest">REJECTED</Text>
                        </VStack>
                      </HStack>
                    </Flex>
                  )}
                </MotionBox>
              </GridItem>
            )}

            {/* Pair 3: Public RFPs & RFP Proposals */}
            <GridItem colSpan={{ base: 2, md: hasAccess ? 1 : 2 }}>
              <MotionBox initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.23 }}
                h="full"
                p={7} borderRadius="2xl" border="1px solid var(--color-card-border)"
                style={{ background: "var(--color-surface)" }}
              >
                <HStack gap={3} mb={5} justify="space-between">
                  <HStack gap={3}>
                    <Box w="3px" h="18px" borderRadius="full" style={{ background: `linear-gradient(to bottom, #8b5cf6, transparent)` }} />
                    <Text color="var(--color-text-muted)" fontSize="10px" fontWeight="black" letterSpacing="widest">PUBLIC RFPs</Text>
                    <Box px={2} py={0.5} borderRadius="full" style={{ background: `rgba(139,92,246,0.18)`, border: `1px solid rgba(139,92,246,0.30)` }}>
                      <Text fontSize="10px" fontWeight="black" style={{ color: "#8b5cf6" }}>{rfps.length}</Text>
                    </Box>
                  </HStack>
                  
                  <HStack gap={2.5}>
                    <Button h="7" px={3.5} borderRadius="full" fontWeight="black" fontSize="3xs" letterSpacing="widest"
                      color="var(--color-text-secondary)"
                      border="1px solid var(--color-card-border)"
                      bg="var(--color-card-bg)"
                      _hover={{ bg: "var(--color-card-hover-bg)", color: "var(--color-text-primary)", borderColor: "var(--color-card-border)" }}
                      transition="all 0.2s"
                      onClick={() => navigate(`/company/${id}/rfps`)}
                    >
                      MANAGE
                    </Button>
                    {hasAccess && (
                      <Button h="7" px={3.5} borderRadius="full" fontWeight="black" fontSize="3xs" letterSpacing="widest" color="white"
                        onClick={handleAddRfp}
                        style={{
                          background: `linear-gradient(135deg, #8b5cf6 95%, rgba(139,92,246,0.5))`,
                          border: `1px solid rgba(139,92,246,0.40)`
                        }}
                        _hover={{ transform: "translateY(-1px)", background: `#8b5cf6` }}
                        transition="all 0.2s"
                        leftIcon={<Plus size={11} />}
                      >
                        ADD
                      </Button>
                    )}
                  </HStack>
                </HStack>

                {rfps.length === 0 ? (
                  <Flex direction="column" align="center" py={8} gap={3}>
                    <Box w="60px" h="60px" borderRadius="xl" display="flex" alignItems="center" justify="center"
                      style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-card-border)" }}>
                      <FileText size={22} color="var(--color-text-muted)" />
                    </Box>
                    <Text color="var(--color-text-muted)" fontSize="sm" fontWeight="medium">No active RFPs posted yet</Text>
                  </Flex>
                ) : (
                  <Flex
                    align="center" gap={6} p={5} borderRadius="xl"
                    border="1px solid var(--color-card-border)"
                    style={{ background: "var(--color-card-bg)" }}
                  >
                    {/* Big count */}
                    <Box textAlign="center" flexShrink={0}>
                      <Text fontWeight="black" fontSize="4xl" lineHeight="1" letterSpacing="tight" style={{ color: "#8b5cf6" }}>
                        {rfps.length}
                      </Text>
                      <Text color="var(--color-text-muted)" fontSize="9px" fontWeight="black" letterSpacing="widest" mt={1.5}>
                        {rfps.length === 1 ? "PUBLIC RFP" : "PUBLIC RFPs"}
                      </Text>
                    </Box>

                    {/* Divider */}
                    <Box w="1px" h="48px" borderRadius="full" bg="var(--color-card-border)" flexShrink={0} />

                    {/* Active vs Inactive breakdown */}
                    <HStack gap={6} flex={1} flexWrap="wrap">
                      <VStack align="start" gap={0.5}>
                        <HStack gap={1.5} align="center">
                          <Box w="6px" h="6px" borderRadius="full" bg="purple.400" />
                          <Text fontWeight="black" fontSize="xl" lineHeight="1" color="var(--color-text-primary)">
                            {rfps.filter(r => r.is_active).length}
                          </Text>
                        </HStack>
                        <Text color="var(--color-text-muted)" fontSize="9px" fontWeight="black" letterSpacing="widest">ACTIVE</Text>
                      </VStack>
                      {rfps.filter(r => !r.is_active).length > 0 && (
                        <VStack align="start" gap={0.5}>
                          <HStack gap={1.5} align="center">
                            <Box w="6px" h="6px" borderRadius="full" bg="var(--color-text-muted)" />
                            <Text fontWeight="black" fontSize="xl" lineHeight="1" color="var(--color-text-muted)">
                              {rfps.filter(r => !r.is_active).length}
                            </Text>
                          </HStack>
                          <Text color="var(--color-text-muted)" fontSize="9px" fontWeight="black" letterSpacing="widest">INACTIVE</Text>
                        </VStack>
                      )}
                    </HStack>
                  </Flex>
                )}
              </MotionBox>
            </GridItem>

            {hasAccess && (
              <GridItem colSpan={{ base: 2, md: 1 }}>
                <MotionBox initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }}
                  h="full"
                  p={7} borderRadius="2xl" border="1px solid var(--color-card-border)"
                  style={{ background: "var(--color-surface)" }}
                >
                  <HStack gap={3} mb={5} justify="space-between">
                    <HStack gap={3}>
                      <Box w="3px" h="18px" borderRadius="full" style={{ background: `linear-gradient(to bottom, #10b981, transparent)` }} />
                      <Text color="var(--color-text-muted)" fontSize="10px" fontWeight="black" letterSpacing="widest">RFP PROPOSALS</Text>
                      <Box px={2} py={0.5} borderRadius="full" style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)" }}>
                        <Text fontSize="10px" fontWeight="black" color="#10b981">{rfpInterests.length}</Text>
                      </Box>
                    </HStack>
                    
                    <Button h="7" px={3.5} borderRadius="full" fontWeight="black" fontSize="3xs" letterSpacing="widest"
                      color="var(--color-text-secondary)"
                      border="1px solid var(--color-card-border)"
                      bg="var(--color-card-bg)"
                      _hover={{ bg: "var(--color-card-hover-bg)", color: "var(--color-text-primary)", borderColor: "var(--color-card-border)" }}
                      transition="all 0.2s"
                      onClick={() => navigate(`/company/${id}/rfp-interests`)}
                    >
                      MANAGE PROPOSALS
                    </Button>
                  </HStack>

                  {rfpInterests.length === 0 ? (
                    <Flex direction="column" align="center" py={8} gap={3}>
                      <Box w="60px" h="60px" borderRadius="xl" display="flex" alignItems="center" justify="center"
                        style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-card-border)" }}>
                        <FileText size={22} color="var(--color-text-muted)" />
                      </Box>
                      <Text color="var(--color-text-muted)" fontSize="sm" fontWeight="medium">No proposals received yet</Text>
                    </Flex>
                  ) : (
                    <Flex
                      align="center" gap={6} p={5} borderRadius="xl"
                      border="1px solid var(--color-card-border)"
                      style={{ background: "var(--color-card-bg)" }}
                    >
                      {/* Big count */}
                      <Box textAlign="center" flexShrink={0}>
                        <Text fontWeight="black" fontSize="4xl" lineHeight="1" letterSpacing="tight" color="#10b981">
                          {rfpInterests.length}
                        </Text>
                        <Text color="var(--color-text-muted)" fontSize="9px" fontWeight="black" letterSpacing="widest" mt={1.5}>
                          {rfpInterests.length === 1 ? "PROPOSAL" : "PROPOSALS"}
                        </Text>
                      </Box>

                      {/* Divider */}
                      <Box w="1px" h="48px" borderRadius="full" bg="var(--color-card-border)" flexShrink={0} />

                      {/* Description of latest proposals */}
                      <Flex direction="column" align="start" gap={0.5}>
                        <Text color="var(--color-text-primary)" fontSize="xs" fontWeight="bold">
                          Latest: {rfpInterests[0].company_name}
                        </Text>
                        <Text color="var(--color-text-muted)" fontSize="2xs" noOfLines={1}>
                          {rfpInterests[0].proposal_summary}
                        </Text>
                      </Flex>
                    </Flex>
                  )}
                </MotionBox>
              </GridItem>
            )}


            {/* Pair 3: Social Connect & Owner Account Badge */}
            {(company.linkedin_url || company.twitter_url || company.website) && (
              <GridItem colSpan={{ base: 2, md: isOwner ? 1 : 2 }}>
                <MotionBox initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }}
                  h="full"
                  p={6} borderRadius="2xl" border="1px solid var(--color-card-border)"
                  style={{ background: "var(--color-surface)" }}
                >
                  <Text color="var(--color-text-muted)" fontSize="10px" fontWeight="black" letterSpacing="widest" mb={4}>CONNECT</Text>
                  <VStack align="stretch" gap={3}>
                    {company.website && (
                      <Box as="a" href={company.website} target="_blank" rel="noopener noreferrer"
                        px={4} py={3} borderRadius="xl" border="1px solid var(--color-card-border)"
                        style={{ background: "var(--color-card-bg)" }}
                        _hover={{ borderColor: `${accentColor}40`, background: `${accentColor}08` }}
                        transition="all 0.2s"
                      >
                        <HStack gap={3}>
                          <Globe size={14} color={accentColor} />
                          <Text fontSize="xs" fontWeight="bold" color="var(--color-text-secondary)">
                            {company.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                          </Text>
                          <ExternalLink size={10} color="var(--color-card-border)" style={{ marginLeft: "auto" }} />
                        </HStack>
                      </Box>
                    )}
                    {company.linkedin_url && (
                      <Box as="a" href={company.linkedin_url} target="_blank" rel="noopener noreferrer"
                        px={4} py={3} borderRadius="xl" border="1px solid rgba(66,153,225,0.12)"
                        style={{ background: "var(--color-card-bg)" }}
                        _hover={{ borderColor: "rgba(66,153,225,0.35)", background: "rgba(66,153,225,0.07)" }}
                        transition="all 0.2s"
                      >
                        <HStack gap={3}>
                          <Link2 size={14} color="rgba(66,153,225,0.8)" />
                          <Text fontSize="xs" fontWeight="bold" color="rgba(66,153,225,0.8)">LinkedIn</Text>
                          <ExternalLink size={10} color="rgba(66,153,225,0.25)" style={{ marginLeft: "auto" }} />
                        </HStack>
                      </Box>
                    )}
                    {company.twitter_url && (
                      <Box as="a" href={company.twitter_url} target="_blank" rel="noopener noreferrer"
                        px={4} py={3} borderRadius="xl" border="1px solid rgba(100,200,255,0.12)"
                        style={{ background: "var(--color-card-bg)" }}
                        _hover={{ borderColor: "rgba(100,200,255,0.35)", background: "rgba(100,200,255,0.07)" }}
                        transition="all 0.2s"
                      >
                        <HStack gap={3}>
                          <AtSign size={14} color="rgba(100,200,255,0.8)" />
                          <Text fontSize="xs" fontWeight="bold" color="rgba(100,200,255,0.8)">Twitter / X</Text>
                          <ExternalLink size={10} color="rgba(100,200,255,0.25)" style={{ marginLeft: "auto" }} />
                        </HStack>
                      </Box>
                    )}
                  </VStack>
                </MotionBox>
              </GridItem>
            )}

            {/* Ratings & Reviews */}
            <GridItem colSpan={2}>
              <MotionBox
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.26 }}
                p={7}
                borderRadius="2xl"
                border="1px solid var(--color-card-border)"
                style={{ background: "var(--color-surface)" }}
              >
                <HStack justify="space-between" mb={6} borderBottom="1px solid var(--color-card-border)" pb={4}>
                  <HStack gap={4}>
                    <Button
                      variant="link"
                      onClick={() => setReviewTab("employee")}
                      style={{
                        color: reviewTab === "employee" ? "white" : "var(--color-text-muted)",
                        fontWeight: "black",
                        fontSize: "11px",
                        letterSpacing: "0.1em",
                        textDecoration: "none",
                        position: "relative",
                        paddingBottom: "4px"
                      }}
                    >
                      EMPLOYEE REVIEWS
                      <Box as="span" ml={2} px={2} py={0.5} borderRadius="full" style={{ background: reviewTab === "employee" ? `${accentColor}15` : "rgba(255,255,255,0.05)", border: reviewTab === "employee" ? `1px solid ${accentColor}30` : "1px solid transparent" }}>
                        <Text as="span" fontSize="10px" fontWeight="bold" style={{ color: reviewTab === "employee" ? accentColor : "var(--color-text-muted)" }}>{company.employee_reviews_count || 0}</Text>
                      </Box>
                      {reviewTab === "employee" && (
                        <Box position="absolute" bottom="-5px" left="0" right="0" h="2px" bg={accentColor} />
                      )}
                    </Button>

                    <Button
                      variant="link"
                      onClick={() => setReviewTab("partner")}
                      style={{
                        color: reviewTab === "partner" ? "white" : "var(--color-text-muted)",
                        fontWeight: "black",
                        fontSize: "11px",
                        letterSpacing: "0.1em",
                        textDecoration: "none",
                        position: "relative",
                        paddingBottom: "4px"
                      }}
                    >
                      CLIENT & PARTNER REVIEWS
                      <Box as="span" ml={2} px={2} py={0.5} borderRadius="full" style={{ background: reviewTab === "partner" ? `${accentColor}15` : "rgba(255,255,255,0.05)", border: reviewTab === "partner" ? `1px solid ${accentColor}30` : "1px solid transparent" }}>
                        <Text as="span" fontSize="10px" fontWeight="bold" style={{ color: reviewTab === "partner" ? accentColor : "var(--color-text-muted)" }}>{company.partner_reviews_count || 0}</Text>
                      </Box>
                      {reviewTab === "partner" && (
                        <Box position="absolute" bottom="-5px" left="0" right="0" h="2px" bg={accentColor} />
                      )}
                    </Button>
                  </HStack>
                </HStack>

                {(() => {
                  const activeReviews = reviewTab === "employee" ? (company.employee_reviews || []) : (company.partner_reviews || []);
                  const activeCount = reviewTab === "employee" ? (company.employee_reviews_count || 0) : (company.partner_reviews_count || 0);
                  const activeAvg = reviewTab === "employee" ? (company.employee_average_rating || 0.0) : (company.partner_average_rating || 0.0);
                  const noReviewsMsg = reviewTab === "employee"
                    ? "No employee reviews received yet"
                    : "No partner or client reviews received yet";

                  if (activeCount === 0) {
                    return (
                      <Flex direction="column" align="center" py={8} gap={3}>
                        <Box w="60px" h="60px" borderRadius="xl" display="flex" alignItems="center" justify="center"
                          style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-card-border)" }}>
                          <Star size={22} color="var(--color-text-muted)" />
                        </Box>
                        <Text color="var(--color-text-muted)" fontSize="sm" fontWeight="medium">{noReviewsMsg}</Text>
                      </Flex>
                    );
                  }

                  return (
                    <Grid templateColumns={{ base: "1fr", md: "250px 1fr" }} gap={8}>
                      {/* Summary statistics */}
                      <Box p={6} borderRadius="xl" border="1px solid var(--color-card-border)" style={{ background: "var(--color-card-bg)" }} textAlign="center">
                        <Text fontSize="5xl" fontWeight="black" lineHeight="1" style={{ color: accentColor }}>
                          {activeAvg}
                        </Text>
                        <HStack justify="center" my={3} gap={1}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={16}
                              style={{
                                fill: star <= Math.round(activeAvg) ? "#F59E0B" : "none",
                                stroke: star <= Math.round(activeAvg) ? "#F59E0B" : "var(--color-text-muted)",
                              }}
                            />
                          ))}
                        </HStack>
                        <Text color="var(--color-text-muted)" fontSize="xs" fontWeight="semibold">
                          Based on {activeCount} {activeCount === 1 ? "review" : "reviews"}
                        </Text>

                        {/* Simple visual bar breakdown */}
                        <VStack mt={6} gap={2} w="full">
                          {[5, 4, 3, 2, 1].map((ratingVal) => {
                            const count = activeReviews.filter(r => r.rating === ratingVal).length;
                            const pct = activeCount > 0 ? (count / activeCount) * 100 : 0;
                            return (
                              <HStack key={ratingVal} w="full" fontSize="2xs" gap={2}>
                                <Text color="var(--color-text-muted)" w="12px" fontWeight="bold">{ratingVal}★</Text>
                                <Box flex={1} h="6px" borderRadius="full" bg="var(--color-card-border)" overflow="hidden">
                                  <Box h="full" bg="#F59E0B" w={`${pct}%`} borderRadius="full" />
                                </Box>
                                <Text color="var(--color-text-muted)" w="20px" textAlign="right">{count}</Text>
                              </HStack>
                            );
                          })}
                        </VStack>
                      </Box>

                      {/* Scrollable list of reviews */}
                      <VStack align="stretch" gap={4} maxH="400px" overflowY="auto" pr={2} css={{
                        "&::-webkit-scrollbar": { width: "5px" },
                        "&::-webkit-scrollbar-track": { background: "transparent" },
                        "&::-webkit-scrollbar-thumb": { background: "var(--color-card-border)", borderRadius: "10px" }
                      }}>
                        {activeReviews.map((review) => (
                          <Box
                            key={review.id}
                            p={5}
                            borderRadius="xl"
                            border="1px solid var(--color-card-border)"
                            style={{ background: "var(--color-card-bg)" }}
                          >
                            <Flex justify="space-between" align="start" mb={3} gap={4} flexWrap="wrap">
                              <HStack gap={3}>
                                {/* Avatar circle */}
                                <Flex
                                  w="36px"
                                  h="36px"
                                  borderRadius="full"
                                  bg="var(--color-surface)"
                                  border="1px solid var(--color-card-border)"
                                  align="center"
                                  justify="center"
                                  overflow="hidden"
                                >
                                  {review.reviewer_profile_picture ? (
                                    <Box as="img" src={review.reviewer_profile_picture} w="full" h="full" style={{ objectFit: "cover" }} />
                                  ) : (
                                    <Text fontSize="xs" fontWeight="bold" color="var(--color-text-primary)">
                                      {review.reviewer_name.charAt(0).toUpperCase()}
                                    </Text>
                                  )}
                                </Flex>
                                <VStack align="start" gap={0}>
                                  <Text fontSize="xs" fontWeight="bold" color="var(--color-text-primary)">
                                    {review.reviewer_name}
                                  </Text>
                                  <Text fontSize="3xs" color="var(--color-text-muted)">
                                    {new Date(review.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                  </Text>
                                </VStack>
                              </HStack>
                              <HStack gap={2} align="center">
                                <HStack gap={0.5}>
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      size={12}
                                      style={{
                                        fill: star <= review.rating ? "#F59E0B" : "none",
                                        stroke: star <= review.rating ? "#F59E0B" : "var(--color-text-muted)",
                                      }}
                                    />
                                  ))}
                                </HStack>
                                <button
                                  onClick={() => handleOpenFlagModal(review.id)}
                                  title={review.is_flagged ? "Review flagged" : "Flag inappropriate review"}
                                  style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    color: review.is_flagged ? "#EF4444" : "#6b7280",
                                    display: "flex",
                                    alignItems: "center",
                                    padding: "2px",
                                    borderRadius: "4px",
                                    transition: "all 0.2s"
                                  }}
                                >
                                  <Flag size={14} fill={review.is_flagged ? "#EF4444" : "none"} />
                                </button>
                              </HStack>
                            </Flex>
                            <Text fontSize="xs" color="var(--color-text-secondary)" lineHeight="1.6" style={{ whiteSpace: "pre-line" }}>
                              {review.review_text}
                            </Text>
                          </Box>
                        ))}
                      </VStack>
                    </Grid>
                  );
                })()}
              </MotionBox>
            </GridItem>

            {/* Frequently Asked Questions */}
            <GridItem colSpan={2}>
              <MotionBox
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.27 }}
                p={7}
                borderRadius="2xl"
                border="1px solid var(--color-card-border)"
                style={{ background: "var(--color-surface)" }}
              >
                <HStack justify="space-between" mb={6} borderBottom="1px solid var(--color-card-border)" pb={4}>
                  <HStack gap={3}>
                    <Box w="3px" h="18px" borderRadius="full" style={{ background: `linear-gradient(to bottom, ${accentColor}, transparent)` }} />
                    <Text color="var(--color-text-muted)" fontSize="10px" fontWeight="black" letterSpacing="widest">COMPANY FAQS</Text>
                    <Box px={2} py={0.5} borderRadius="full" style={{ background: `${accentColor}15`, border: `1px solid ${accentColor}25` }}>
                      <Text fontSize="10px" fontWeight="black" color={accentColor}>{company.faqs?.length || 0}</Text>
                    </Box>
                  </HStack>

                  {hasAccess && (
                    <Button h="7" px={3.5} borderRadius="full" fontWeight="black" fontSize="3xs" letterSpacing="widest"
                      color="white"
                      bg={accentColor}
                      _hover={{ bg: `${accentColor}cc`, transform: "translateY(-1px)" }}
                      transition="all 0.2s"
                      onClick={handleAddFaq}
                    >
                      <Plus size={10} style={{ marginRight: "4px" }} /> ADD FAQ
                    </Button>
                  )}
                </HStack>

                {!company.faqs || company.faqs.length === 0 ? (
                  <Flex direction="column" align="center" py={8} gap={3}>
                    <Box w="60px" h="60px" borderRadius="xl" display="flex" alignItems="center" justify="center"
                      style={{ background: "var(--color-card-bg)", border: "1px solid var(--color-card-border)" }}>
                      <HelpCircle size={22} color="var(--color-text-muted)" />
                    </Box>
                    <Text color="var(--color-text-muted)" fontSize="sm" fontWeight="medium">No FAQs posted yet</Text>
                  </Flex>
                ) : (
                  <VStack align="stretch" gap={3}>
                    {company.faqs.map((faq) => {
                      const isOpen = expandedFaqId === faq.id;
                      return (
                        <Box
                          key={faq.id}
                          borderRadius="xl"
                          border="1px solid"
                          borderColor={isOpen ? `${accentColor}30` : "var(--color-card-border)"}
                          style={{ background: isOpen ? "rgba(255, 255, 255, 0.02)" : "var(--color-card-bg)" }}
                          transition="all 0.2s"
                          overflow="hidden"
                        >
                          <Flex align="center" justify="space-between" p={4} cursor="pointer" onClick={() => toggleFaq(faq.id)}>
                            <HStack gap={3} flex={1}>
                              <HelpCircle size={15} color={isOpen ? accentColor : "var(--color-text-muted)"} />
                              <Text fontSize="xs" fontWeight="bold" color="white" textAlign="left">
                                {faq.question}
                              </Text>
                            </HStack>
                            <HStack gap={3} onClick={(e) => e.stopPropagation()}>
                              {hasAccess && (
                                <HStack gap={1.5}>
                                  <Button
                                    h="6"
                                    w="6"
                                    minW="6"
                                    p={0}
                                    borderRadius="md"
                                    bg="var(--color-surface)"
                                    border="1px solid var(--color-card-border)"
                                    _hover={{ bg: "var(--color-card-hover-bg)", borderColor: "rgba(255,255,255,0.2)" }}
                                    onClick={() => handleEditFaq(faq)}
                                  >
                                    <Edit size={10} color="var(--color-text-secondary)" />
                                  </Button>
                                  <Button
                                    h="6"
                                    w="6"
                                    minW="6"
                                    p={0}
                                    borderRadius="md"
                                    bg="var(--color-surface)"
                                    border="1px solid var(--color-card-border)"
                                    _hover={{ bg: "rgba(239, 68, 68, 0.1)", borderColor: "rgba(239, 68, 68, 0.2)" }}
                                    onClick={() => handleDeleteFaq(faq.id)}
                                  >
                                    <Trash2 size={10} color="#EF4444" />
                                  </Button>
                                </HStack>
                              )}
                              <Box
                                style={{
                                  transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                                  transition: "transform 0.2s"
                                }}
                                color="var(--color-text-muted)"
                              >
                                <ChevronDown size={14} />
                              </Box>
                            </HStack>
                          </Flex>

                          <AnimatePresence initial={false}>
                            {isOpen && (
                              <MotionBox
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <Box px={4} pb={4} pt={1} borderTop="1px solid" borderColor="var(--color-card-border)">
                                  <Text fontSize="xs" color="var(--color-text-secondary)" lineHeight="1.6" textAlign="left" style={{ whiteSpace: "pre-line" }}>
                                    {faq.answer}
                                  </Text>
                                </Box>
                              </MotionBox>
                            )}
                          </AnimatePresence>
                        </Box>
                      );
                    })}
                  </VStack>
                )}
              </MotionBox>
            </GridItem>

            {/* Row 4: Wide Full Width Members Grid */}
            <GridItem colSpan={2}>
              <CompanyMembersList members={company.members_details || []} accentColor={accentColor} companyId={company.id} isOwner={hasAccess} />
            </GridItem>
          </Grid>
        </Container>
      </Box>

      <CompanyProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        company={company}
        onSaved={fetchCompany}
      />

      <JobOpeningModal
        isOpen={isJobModalOpen}
        onClose={() => setIsJobModalOpen(false)}
        companyId={company.id}
        company={company}
        job={selectedJob}
        onSaved={fetchCompany}
        onCreditExhausted={() => setIsPlanModalOpen(true)}
      />

      <RFPModal
        isOpen={isRfpModalOpen}
        onClose={() => setIsRfpModalOpen(false)}
        companyId={company.id}
        rfp={selectedRfp}
        onSaved={fetchCompany}
      />

      <PricingPlansModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        companyId={company.id}
        currentPlan={company.active_subscription?.plan_name}
        onSubscribed={fetchCompany}
      />

      <CompanyFAQModal
        isOpen={isFaqModalOpen}
        onClose={() => setIsFaqModalOpen(false)}
        companyId={company.id}
        faq={selectedFaq}
        onSaved={fetchCompany}
      />

      {/* Premium Flag Confirmation Modal */}
      {flagModal.isOpen && (
        <div
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            backdropFilter: "blur(8px)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem"
          }}
        >
          <div
            style={{
              backgroundColor: "#0f172a",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "1.5rem",
              padding: "2rem",
              width: "100%",
              maxWidth: "400px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center"
            }}
          >
            {flagModal.status === 'confirm' && (
              <>
                <div style={{ width: "3.5rem", height: "3.5rem", borderRadius: "50%", backgroundColor: "rgba(239, 68, 68, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem" }}>
                  <ShieldAlert size={28} color="#EF4444" />
                </div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", color: "white", marginBottom: "0.75rem", fontFamily: "'Outfit', sans-serif" }}>
                  Flag this review?
                </h3>
                <p style={{ fontSize: "0.875rem", color: "#9ca3af", lineHeight: "1.5", marginBottom: "1.5rem" }}>
                  Are you sure you want to flag this review as inappropriate? It will be sent to the administrator for moderation.
                </p>
                <div style={{ display: "flex", gap: "0.75rem", width: "100%" }}>
                  <button
                    onClick={handleConfirmFlag}
                    disabled={flagModal.loading}
                    style={{
                      flex: 1,
                      backgroundColor: "#CD2426",
                      color: "white",
                      border: "none",
                      borderRadius: "0.75rem",
                      padding: "0.75rem",
                      fontWeight: "bold",
                      fontSize: "0.875rem",
                      cursor: "pointer",
                      transition: "opacity 0.2s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = 0.9}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = 1}
                  >
                    {flagModal.loading ? "Flagging..." : "Yes, Flag"}
                  </button>
                  <button
                    onClick={handleCloseFlagModal}
                    disabled={flagModal.loading}
                    style={{
                      flex: 1,
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                      color: "white",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "0.75rem",
                      padding: "0.75rem",
                      fontWeight: "bold",
                      fontSize: "0.875rem",
                      cursor: "pointer",
                      transition: "background-color 0.2s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)"}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}

            {flagModal.status === 'success' && (
              <>
                <div style={{ width: "3.5rem", height: "3.5rem", borderRadius: "50%", backgroundColor: "rgba(16, 185, 129, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem" }}>
                  <CheckCircle2 size={28} color="#10B981" />
                </div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", color: "white", marginBottom: "0.75rem", fontFamily: "'Outfit', sans-serif" }}>
                  Review Flagged
                </h3>
                <p style={{ fontSize: "0.875rem", color: "#9ca3af", lineHeight: "1.5", marginBottom: "1.5rem" }}>
                  Thank you. This review has been successfully flagged and sent to system administration for moderation.
                </p>
                <button
                  onClick={handleCloseFlagModal}
                  style={{
                    width: "100%",
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    color: "white",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "0.75rem",
                    padding: "0.75rem",
                    fontWeight: "bold",
                    fontSize: "0.875rem",
                    cursor: "pointer",
                    transition: "background-color 0.2s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)"}
                >
                  Close
                </button>
              </>
            )}

            {flagModal.status === 'error' && (
              <>
                <div style={{ width: "3.5rem", height: "3.5rem", borderRadius: "50%", backgroundColor: "rgba(239, 68, 68, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem" }}>
                  <ShieldAlert size={28} color="#EF4444" />
                </div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "bold", color: "white", marginBottom: "0.75rem", fontFamily: "'Outfit', sans-serif" }}>
                  Action Failed
                </h3>
                <p style={{ fontSize: "0.875rem", color: "#9ca3af", lineHeight: "1.5", marginBottom: "1.5rem" }}>
                  Failed to flag this review. Please try again later.
                </p>
                <button
                  onClick={handleCloseFlagModal}
                  style={{
                    width: "100%",
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    color: "white",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "0.75rem",
                    padding: "0.75rem",
                    fontWeight: "bold",
                    fontSize: "0.875rem",
                    cursor: "pointer",
                    transition: "background-color 0.2s"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)"}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)"}
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      )}

    </Box>
  );
};

export default CompanyDashboard;
