import React, { useState } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  VStack,
  HStack,
  Heading,
  Input,
  IconButton,
} from "@chakra-ui/react";
import {
  X,
  Copy,
  Check,
  Share2,
  Send,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const WhatsAppIcon = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);

const TwitterIcon = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const LinkedinIcon = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.74a1.63 1.63 0 1 0 0 3.26 1.63 1.63 0 0 0 0-3.26z"/>
  </svg>
);

const FacebookIcon = ({ size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.99 3.66 9.12 8.44 9.88v-6.99H7.9v-2.89h2.54V9.8c0-2.51 1.49-3.89 3.78-3.89 1.09 0 2.23.19 2.23.19v2.47h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.89h-2.34v6.99C18.34 21.12 22 16.99 22 12z"/>
  </svg>
);

const MotionBox = motion.create(Box);

const ShareModal = ({ isOpen, onClose, title = "", company = "", summary = "", url = "", type = "general" }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const targetUrl = url || window.location.href;
  
  // Format rich text message for WhatsApp with double newlines so URLs render as clickable blue links
  const formattedWhatsAppText = (() => {
    let msg = "";
    if (type === "job") {
      msg += `📢 *Job Opening: ${title}*\n`;
      if (company) msg += `🏢 *Company:* ${company}\n`;
      msg += `💼 *Platform:* Xanatz\n`;
      if (summary) msg += `\n📝 *Overview:* ${summary.trim()}...\n`;
      msg += `\nApply for this opportunity directly on Xanatz!\n\n`;
      msg += `🔗 *View & Apply Here:*\n${targetUrl}`;
    } else if (type === "rfp") {
      msg += `📋 *Request for Proposal (RFP): ${title}*\n`;
      if (company) msg += `🏢 *Issued By:* ${company}\n`;
      msg += `💼 *Platform:* Xanatz\n`;
      if (summary) msg += `\n📝 *Overview:* ${summary.trim()}...\n`;
      msg += `\nReview project requirements and express interest on Xanatz!\n\n`;
      msg += `🔗 *View RFP Details Here:*\n${targetUrl}`;
    } else {
      msg += `✨ *${title || "Xanatz"}*\n`;
      if (company) msg += `🏢 *Organization:* ${company}\n`;
      if (summary) msg += `📝 ${summary}\n`;
      msg += `\nCheck this out on Xanatz!\n\n`;
      msg += `🔗 *Link:*\n${targetUrl}`;
    }
    return msg;
  })();

  const shareText = title ? `${title} - ${summary || "Check this out on Xanatz"}` : "Check this out on Xanatz";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || "Xanatz",
          text: formattedWhatsAppText,
          url: targetUrl,
        });
      } catch (err) {
        console.log("Share cancelled or failed", err);
      }
    }
  };

  const socialPlatforms = [
    {
      name: "WhatsApp",
      icon: WhatsAppIcon,
      color: "#25D366",
      bg: "rgba(37, 211, 102, 0.12)",
      borderColor: "rgba(37, 211, 102, 0.3)",
      onClick: () => {
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(formattedWhatsAppText)}`;
        window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      },
    },
    {
      name: "X (Twitter)",
      icon: TwitterIcon,
      color: "#1DA1F2",
      bg: "rgba(29, 161, 242, 0.12)",
      borderColor: "rgba(29, 161, 242, 0.3)",
      onClick: () => {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(targetUrl)}`;
        window.open(twitterUrl, "_blank", "noopener,noreferrer");
      },
    },
    {
      name: "LinkedIn",
      icon: LinkedinIcon,
      color: "#0A66C2",
      bg: "rgba(10, 102, 194, 0.12)",
      borderColor: "rgba(10, 102, 194, 0.3)",
      onClick: () => {
        const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(targetUrl)}`;
        window.open(linkedinUrl, "_blank", "noopener,noreferrer");
      },
    },
    {
      name: "Facebook",
      icon: FacebookIcon,
      color: "#1877F2",
      bg: "rgba(24, 119, 242, 0.12)",
      borderColor: "rgba(24, 119, 242, 0.3)",
      onClick: () => {
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(targetUrl)}`;
        window.open(facebookUrl, "_blank", "noopener,noreferrer");
      },
    },
  ];

  return (
    <AnimatePresence>
      <Box
        position="fixed"
        top="0"
        left="0"
        right="0"
        bottom="0"
        zIndex={9999}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        {/* Backdrop */}
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="rgba(0,0,0,0.85)"
          backdropFilter="blur(16px)"
          onClick={onClose}
        />

        {/* Modal Card */}
        <MotionBox
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          p={{ base: 6, md: 8 }}
          borderRadius="3xl"
          maxW="480px"
          w="full"
          mx={4}
          border="1px solid var(--color-card-border)"
          style={{
            background: "var(--color-dropdown-bg, #0d1326)",
            backdropFilter: "blur(24px)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
          }}
          position="relative"
          zIndex={10000}
        >
          {/* Header */}
          <Flex justify="space-between" align="center" mb={6}>
            <VStack align="start" gap={1}>
              <HStack gap={2}>
                <Share2 size={18} color="var(--color-accent, #3b82f6)" />
                <Heading size="md" color="white" fontWeight="black" letterSpacing="tight">
                  Share
                </Heading>
              </HStack>
              {title && (
                <Text fontSize="xs" color="var(--color-text-muted, #9ca3af)" noOfLines={1} maxW="360px">
                  {title}
                </Text>
              )}
            </VStack>

            <button
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#9ca3af",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}
            >
              <X size={16} />
            </button>
          </Flex>

          {/* Social Platforms Grid */}
          <VStack gap={4} align="stretch" mb={6}>
            <Text fontSize="2xs" fontWeight="bold" color="var(--color-text-muted, #9ca3af)" letterSpacing="wider">
              SHARE VIA
            </Text>

            <Flex gap={3} wrap="wrap">
              {socialPlatforms.map((platform) => {
                const IconComp = platform.icon;
                return (
                  <Button
                    key={platform.name}
                    onClick={platform.onClick}
                    flex="1"
                    minW="100px"
                    h="44px"
                    borderRadius="xl"
                    variant="unstyled"
                    style={{
                      background: platform.bg,
                      border: `1px solid ${platform.borderColor}`,
                      color: platform.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    _hover={{
                      transform: "translateY(-2px)",
                      filter: "brightness(1.15)",
                    }}
                  >
                    <IconComp size={18} color={platform.color} />
                    <Text fontSize="xs" fontWeight="bold">
                      {platform.name}
                    </Text>
                  </Button>
                );
              })}
            </Flex>

            {typeof navigator !== "undefined" && navigator.share && (
              <Button
                onClick={handleNativeShare}
                w="full"
                h="40px"
                borderRadius="xl"
                variant="outline"
                borderColor="var(--color-card-border)"
                color="var(--color-text-secondary)"
                _hover={{ bg: "var(--color-card-border)", color: "white" }}
                fontSize="xs"
                fontWeight="bold"
              >
                <Send size={14} style={{ marginRight: "6px" }} />
                More Sharing Options (Device Native)
              </Button>
            )}
          </VStack>

          {/* Copy Link Section */}
          <VStack gap={2} align="stretch">
            <Text fontSize="2xs" fontWeight="bold" color="var(--color-text-muted, #9ca3af)" letterSpacing="wider">
              OR COPY DIRECT LINK
            </Text>

            <HStack gap={2}>
              <Input
                value={targetUrl}
                readOnly
                fontSize="xs"
                color="white"
                bg="rgba(255,255,255,0.03)"
                border="1px solid var(--color-card-border)"
                borderRadius="xl"
                h="44px"
                px={3}
                style={{ textOverflow: "ellipsis" }}
              />

              <Button
                onClick={handleCopyLink}
                h="44px"
                px={5}
                borderRadius="xl"
                fontWeight="bold"
                fontSize="xs"
                letterSpacing="wide"
                style={{
                  background: copied ? "rgba(72, 199, 116, 0.15)" : "var(--color-accent, #3b82f6)",
                  border: copied ? "1px solid rgba(72, 199, 116, 0.4)" : "none",
                  color: copied ? "#48C774" : "white",
                  flexShrink: 0,
                  transition: "all 0.25s ease",
                  cursor: "pointer",
                }}
                _hover={{
                  opacity: 0.9,
                  transform: "translateY(-1px)",
                }}
              >
                {copied ? (
                  <HStack gap={1.5}>
                    <Check size={16} color="#48C774" />
                    <Text>COPIED!</Text>
                  </HStack>
                ) : (
                  <HStack gap={1.5}>
                    <Copy size={16} />
                    <Text>COPY LINK</Text>
                  </HStack>
                )}
              </Button>
            </HStack>
          </VStack>
        </MotionBox>
      </Box>
    </AnimatePresence>
  );
};

export default ShareModal;
