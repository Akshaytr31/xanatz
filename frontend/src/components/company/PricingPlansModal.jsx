import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  VStack,
  HStack,
  Spinner,
} from "@chakra-ui/react";
import {
  X,
  Check,
  Zap,
  Crown,
  Rocket,
  Sparkles,
  CreditCard,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api";

const MotionBox = motion.create(Box);

const PLAN_ICONS = {
  basic: Zap,
  standard: Rocket,
  premium: Crown,
};

const PLAN_COLORS = {
  basic: {
    primary: "#10b981",
    gradient: "linear-gradient(135deg, #10b981, #059669)",
    glow: "rgba(16,185,129,0.3)",
  },
  standard: {
    primary: "#3b82f6",
    gradient: "linear-gradient(135deg, #3b82f6, #2563eb)",
    glow: "rgba(59,130,246,0.3)",
  },
  premium: {
    primary: "#f59e0b",
    gradient: "linear-gradient(135deg, #f59e0b, #d97706)",
    glow: "rgba(245,158,11,0.3)",
  },
};

const PricingPlansModal = ({
  isOpen,
  onClose,
  companyId,
  currentPlan,
  onSubscribed,
}) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchPlans();
    }
  }, [isOpen]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await api.get("plans/");
      setPlans(res.data);
    } catch (err) {
      console.error("Failed to fetch plans", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId) => {
    try {
      setSubscribing(planId);
      await api.post(`companies/${companyId}/subscribe_plan/`, {
        plan_id: planId,
      });
      if (onSubscribed) onSubscribed();
      onClose();
    } catch (err) {
      console.error("Failed to subscribe", err);
    } finally {
      setSubscribing(null);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <Box
          position="fixed"
          inset={0}
          zIndex={9999}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {/* Backdrop */}
          <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            position="fixed"
            inset={0}
            bg="rgba(0,0,0,0.65)"
            backdropFilter="blur(12px)"
            onClick={onClose}
          />

          {/* Modal content */}
          <MotionBox
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            transition={{
              duration: 0.35,
              type: "spring",
              stiffness: 200,
              damping: 25,
            }}
            position="relative"
            zIndex={10000}
            w="full"
            maxW="900px"
            
            mx={4}
            px={{ base: 4, md: 12 }}
            py={{ base: 4, md: 4 }}
            borderRadius="2xl"
            border="1px solid var(--color-card-border)"
            overflow="hidden"
            style={{
              background: "var(--color-surface)",
              boxShadow:
                "0 40px 100px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.05)",
            }}
          >
            {/* Background decorations */}
            <Box
              position="absolute"
              top="-100px"
              right="-80px"
              w="300px"
              h="300px"
              borderRadius="full"
              style={{
                background:
                  "radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)",
                filter: "blur(50px)",
              }}
              pointerEvents="none"
            />
            <Box
              position="absolute"
              bottom="-80px"
              left="-60px"
              w="250px"
              h="250px"
              borderRadius="full"
              style={{
                background:
                  "radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)",
                filter: "blur(50px)",
              }}
              pointerEvents="none"
            />

            {/* Close button */}
            <Box
              as="button"
              position="absolute"
              top={5}
              right={5}
              w="36px"
              h="36px"
              borderRadius="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
              border="1px solid var(--color-card-border)"
              bg="var(--color-card-bg)"
              color="var(--color-text-muted)"
              onClick={onClose}
              cursor="pointer"
              _hover={{
                bg: "var(--color-card-hover-bg)",
                color: "var(--color-text-primary)",
              }}
              transition="all 0.2s"
              zIndex={2}
            >
              <X size={16} />
            </Box>

            {/* Header */}
            <Flex
              direction={{ base: "column", md: "row" }}
              justify="space-between"
              align={{ base: "flex-start", md: "center" }}
              gap={4}
              mb={5}
              pb={4}
              borderBottom="1px solid var(--color-card-border)"
              position="relative"
              zIndex={1}
            >
              <VStack align="flex-start" gap={0.5}>
                <HStack gap={2}>
                  <CreditCard size={13} color="var(--color-text-muted)" />
                  <Text
                    fontSize="9px"
                    fontWeight="black"
                    letterSpacing="widest"
                    color="var(--color-text-muted)"
                  >
                    JOB POSTING PLANS
                  </Text>
                </HStack>
                <Text
                  fontSize={{ base: "lg", md: "xl" }}
                  fontWeight="black"
                  color="var(--color-text-primary)"
                  letterSpacing="tight"
                >
                  Choose Your Plan
                </Text>
              </VStack>
              <Text
                fontSize="xs"
                color="var(--color-text-muted)"
                textAlign={{ base: "left", md: "right" }}
                maxW={{ base: "100%", md: "280px" }}
              >
                Select a plan to start posting jobs for your company
              </Text>
            </Flex>

            {/* Plans */}
            {loading ? (
              <Flex justify="center" py={12}>
                <Spinner
                  size="lg"
                  thickness="3px"
                  color="var(--color-accent)"
                />
              </Flex>
            ) : (
              <Flex
                gap={4}
                direction={{ base: "column", md: "row" }}
                align="stretch"
                position="relative"
                zIndex={1}
              >
                {plans.map((plan, index) => {
                  const colors = PLAN_COLORS[plan.name] || PLAN_COLORS.basic;
                  const Icon = PLAN_ICONS[plan.name] || Zap;
                  const isCurrentPlan = currentPlan === plan.name;
                  const isPopular = plan.name === "standard";

                  return (
                    <MotionBox
                      display={"flex"}
                      flexDirection={"column"}
                      justifyContent={"space-between"}
                      key={plan.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      flex={1}
                      p={5}
                      borderRadius="xl"
                      border={
                        isPopular
                          ? `2px solid ${colors.primary}40`
                          : "1px solid var(--color-card-border)"
                      }
                      position="relative"
                      overflow="hidden"
                      style={{
                        background: isPopular
                          ? `linear-gradient(170deg, ${colors.primary}08 0%, var(--color-card-bg) 100%)`
                          : "var(--color-card-bg)",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                      _hover={{
                        transform: "translateY(-4px)",
                        boxShadow: `0 20px 40px ${colors.glow}`,
                        borderColor: `${colors.primary}50`,
                      }}
                    >
                      {/* Popular badge */}
                      <Box>
                        {isPopular && (
                          <Box
                            position="absolute"
                            top={4}
                            right={4}
                            px={2.5}
                            py={1}
                            borderRadius="full"
                            style={{
                              background: colors.gradient,
                              boxShadow: `0 4px 12px ${colors.glow}`,
                            }}
                          >
                            <HStack gap={1}>
                              <Sparkles size={10} color="white" />
                              <Text
                                fontSize="8px"
                                fontWeight="black"
                                color="white"
                                letterSpacing="wider"
                              >
                                POPULAR
                              </Text>
                            </HStack>
                          </Box>
                        )}

                        {/* Top accent bar */}
                        <Box
                          position="absolute"
                          top={0}
                          left={0}
                          right={0}
                          h="3px"
                          style={{ background: colors.gradient }}
                        />

                        {/* Plan icon */}
                        <Flex
                          w="40px"
                          h="40px"
                          borderRadius="lg"
                          align="center"
                          justify="center"
                          mb={3}
                          style={{
                            background: `linear-gradient(135deg, ${colors.primary}20, ${colors.primary}05)`,
                            border: `1px solid ${colors.primary}30`,
                          }}
                        >
                          <Icon size={18} color={colors.primary} />
                        </Flex>

                        {/* Plan name */}
                        <Text
                          fontSize="md"
                          fontWeight="black"
                          color="var(--color-text-primary)"
                          letterSpacing="tight"
                          mb={0.5}
                        >
                          {plan.display_name}
                        </Text>

                        {/* Price */}
                        <HStack gap={1} align="baseline" mb={3}>
                          {parseFloat(plan.price) > 0 ? (
                            <>
                              <Text
                                fontSize="2xl"
                                fontWeight="black"
                                style={{ color: colors.primary }}
                                lineHeight="1"
                              >
                                ₹{Math.floor(parseFloat(plan.price))}
                              </Text>
                              <Text
                                fontSize="xs"
                                color="var(--color-text-muted)"
                                fontWeight="bold"
                              >
                                /plan
                              </Text>
                            </>
                          ) : (
                            <Text
                              fontSize="2xl"
                              fontWeight="black"
                              style={{ color: colors.primary }}
                              lineHeight="1"
                            >
                              Free
                            </Text>
                          )}
                        </HStack>

                        {/* Description */}
                        <Text
                          fontSize="2xs"
                          color="var(--color-text-muted)"
                          mb={3}
                        >
                          {plan.description}
                        </Text>

                        {/* Plan Limits Info */}
                        <HStack
                          gap={3}
                          mb={4}
                          py={2}
                          borderY="1px solid"
                          borderColor="whiteAlpha.100"
                          justify="space-around"
                        >
                          <VStack align="center" gap={0} flex={1}>
                            <Text
                              fontSize="8px"
                              fontWeight="black"
                              color="var(--color-text-muted)"
                              letterSpacing="wider"
                            >
                              MAX JOBS
                            </Text>
                            <Text fontSize="xs" fontWeight="bold" color="white">
                              {plan.max_jobs}
                            </Text>
                          </VStack>
                          <Box w="1px" h="20px" bg="whiteAlpha.100" />
                          <VStack align="center" gap={0} flex={1}>
                            <Text
                              fontSize="8px"
                              fontWeight="black"
                              color="var(--color-text-muted)"
                              letterSpacing="wider"
                            >
                              DURATION
                            </Text>
                            <Text fontSize="xs" fontWeight="bold" color="white">
                              {plan.job_duration_days} Days
                            </Text>
                          </VStack>
                        </HStack>

                        {/* Features */}
                        <VStack align="start" gap={2} mb={4}>
                          {(plan.features || []).map((feature, i) => (
                            <HStack key={i} gap={2}>
                              <Flex
                                w="16px"
                                h="16px"
                                borderRadius="full"
                                align="center"
                                justify="center"
                                flexShrink={0}
                                style={{
                                  background: `${colors.primary}15`,
                                  border: `1px solid ${colors.primary}30`,
                                }}
                              >
                                <Check size={9} color={colors.primary} />
                              </Flex>
                              <Text
                                fontSize="xs"
                                color="var(--color-text-secondary)"
                                fontWeight="medium"
                              >
                                {feature}
                              </Text>
                            </HStack>
                          ))}
                        </VStack>
                      </Box>

                      {/* CTA Button */}
                      <Button
                        w="full"
                        h="38px"
                        borderRadius="xl"
                        fontWeight="black"
                        fontSize="xs"
                        letterSpacing="wider"
                        color={
                          isCurrentPlan ? "var(--color-text-muted)" : "white"
                        }
                        disabled={isCurrentPlan || subscribing === plan.id}
                        onClick={() => handleSubscribe(plan.id)}
                        style={{
                          background: isCurrentPlan
                            ? "var(--color-card-border)"
                            : colors.gradient,
                          boxShadow: isCurrentPlan
                            ? "none"
                            : `0 4px 16px ${colors.glow}`,
                          cursor: isCurrentPlan ? "default" : "pointer",
                          transition: "all 0.3s",
                        }}
                        _hover={
                          !isCurrentPlan
                            ? {
                                transform: "translateY(-2px)",
                                boxShadow: `0 8px 24px ${colors.glow}`,
                                filter: "brightness(1.1)",
                              }
                            : {}
                        }
                      >
                        {subscribing === plan.id ? (
                          <Spinner size="sm" color="white" />
                        ) : isCurrentPlan ? (
                          "CURRENT PLAN"
                        ) : (
                          <HStack gap={2}>
                            <Text>
                              {parseFloat(plan.price) > 0
                                ? "ACTIVATE"
                                : "GET STARTED"}
                            </Text>
                            <ArrowRight size={14} />
                          </HStack>
                        )}
                      </Button>
                    </MotionBox>
                  );
                })}
              </Flex>
            )}

            {/* Footer note */}
            <Text
              fontSize="2xs"
              color="var(--color-text-muted)"
              textAlign="center"
              mt={4}
              position="relative"
              zIndex={1}
            >
              Test Mode — All plans activate instantly without payment
            </Text>
          </MotionBox>
        </Box>
      )}
    </AnimatePresence>
  );
};

export default PricingPlansModal;
