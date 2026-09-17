import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  VStack,
  HStack,
  Input,
  Textarea,
  Portal,
  DialogRoot as Dialog,
  DialogBackdrop,
  DialogPositioner,
  DialogContent,
  DialogCloseTrigger,
  SimpleGrid,
} from "@chakra-ui/react";
import {
  Image as ImageIcon,
  Video as VideoIcon,
  X,
  Save,
  Trash2,
  Plus,
  Upload,
  Link as LinkIcon,
  Film,
} from "lucide-react";
import { motion } from "framer-motion";
import api from "../../api";

const MotionBox = motion.create(Box);

const fieldStyle = {
  bg: "var(--color-glass)",
  color: "white",
  h: "11",
  borderRadius: "lg",
  border: "1px solid",
  borderColor: "var(--color-card-border)",
  _focus: { borderColor: "#34d399", boxShadow: "0 0 0 2px rgba(52,211,153,0.25)" },
  _placeholder: { color: "var(--color-card-border)" },
  fontSize: "sm",
  px: "4",
};

const labelStyle = {
  color: "var(--color-text-muted)",
  fontSize: "10px",
  fontWeight: "black",
  letterSpacing: "widest",
  mb: "2",
};

const CompanyMediaModal = ({ isOpen, onClose, companyId, existingMedia = [], onSaved }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("add"); // "add" | "manage"
  const [form, setForm] = useState({
    media_type: "image",
    title: "",
    caption: "",
    media_url: "",
  });
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setForm({
        media_type: "image",
        title: "",
        caption: "",
        media_url: "",
      });
      setFile(null);
      setPreviewUrl(null);
      setActiveTab("add");
    }
  }, [isOpen]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleSave = async () => {
    if (!form.media_url.trim() && !file) {
      alert("Please provide either a media file or a media URL.");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("company", companyId);
      formData.append("media_type", form.media_type);
      if (form.title) formData.append("title", form.title);
      if (form.caption) formData.append("caption", form.caption);
      if (form.media_url) formData.append("media_url", form.media_url);
      if (file) formData.append("file", file);

      await api.post("company-media/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (onSaved) onSaved();
      setForm({ media_type: "image", title: "", caption: "", media_url: "" });
      setFile(null);
      setPreviewUrl(null);
      setActiveTab("manage");
    } catch (err) {
      console.error("Error saving company media item:", err);
      alert("Failed to upload media item. Please check the inputs.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (mediaId) => {
    if (!window.confirm("Are you sure you want to delete this media item?")) return;
    try {
      await api.delete(`company-media/${mediaId}/`);
      if (onSaved) onSaved();
    } catch (err) {
      console.error("Error deleting media item:", err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <Portal>
        <DialogBackdrop style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)" }} />
        <DialogPositioner display="flex" align="center" justify="center" p={4}>
          <DialogContent
            style={{
              background: "var(--color-surface, #0d1322)",
              border: "1px solid var(--color-card-border, rgba(255,255,255,0.12))",
              borderRadius: "24px",
              boxShadow: "0 25px 60px -15px rgba(0,0,0,0.7)",
              maxWidth: "680px",
              width: "100%",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <Flex
              align="center"
              justify="space-between"
              px={6}
              py={5}
              style={{ borderBottom: "1px solid var(--color-card-border, rgba(255,255,255,0.08))" }}
            >
              <HStack gap={3}>
                <Flex
                  w="42px"
                  h="42px"
                  borderRadius="14px"
                  align="center"
                  justify="center"
                  style={{ background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.3)" }}
                >
                  <Film size={20} color="#34d399" />
                </Flex>
                <VStack align="flex-start" gap={0}>
                  <Text fontSize="lg" fontWeight="900" color="white">
                    Company Media Showcase
                  </Text>
                  <Text fontSize="xs" color="gray.400">
                    Add images and videos for your public company landing page
                  </Text>
                </VStack>
              </HStack>

              <DialogCloseTrigger asChild>
                <Box
                  as="button"
                  onClick={onClose}
                  w="36px"
                  h="36px"
                  borderRadius="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  cursor="pointer"
                  style={{ background: "rgba(255,255,255,0.06)", color: "gray" }}
                  _hover={{ background: "rgba(255,255,255,0.12)", color: "white" }}
                >
                  <X size={18} />
                </Box>
              </DialogCloseTrigger>
            </Flex>

            {/* Sub-navigation tabs */}
            <Flex px={6} pt={4} gap={3} style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <Box
                as="button"
                onClick={() => setActiveTab("add")}
                pb={3}
                px={3}
                fontSize="13px"
                fontWeight="700"
                cursor="pointer"
                style={{
                  color: activeTab === "add" ? "#34d399" : "gray",
                  borderBottom: activeTab === "add" ? "2px solid #34d399" : "2px solid transparent",
                }}
              >
                + Add New Media
              </Box>
              <Box
                as="button"
                onClick={() => setActiveTab("manage")}
                pb={3}
                px={3}
                fontSize="13px"
                fontWeight="700"
                cursor="pointer"
                style={{
                  color: activeTab === "manage" ? "#34d399" : "gray",
                  borderBottom: activeTab === "manage" ? "2px solid #34d399" : "2px solid transparent",
                }}
              >
                Manage Existing ({existingMedia.length})
              </Box>
            </Flex>

            {/* Modal Body */}
            <Box p={6} maxH="70vh" overflowY="auto">
              {activeTab === "add" ? (
                <VStack align="stretch" gap={5}>
                  {/* Type Switcher */}
                  <Box>
                    <Text {...labelStyle}>MEDIA TYPE</Text>
                    <HStack gap={3}>
                      <Box
                        as="button"
                        onClick={() => setForm({ ...form, media_type: "image" })}
                        flex={1}
                        py={2.5}
                        borderRadius="12px"
                        fontSize="13px"
                        fontWeight="700"
                        cursor="pointer"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        gap={2}
                        style={{
                          background: form.media_type === "image" ? "rgba(16, 185, 129, 0.2)" : "rgba(255,255,255,0.04)",
                          color: form.media_type === "image" ? "#34d399" : "gray",
                          border: form.media_type === "image" ? "1px solid rgba(16, 185, 129, 0.4)" : "1px solid rgba(255,255,255,0.08)",
                        }}
                      >
                        <ImageIcon size={16} /> Image / Photo
                      </Box>

                      <Box
                        as="button"
                        onClick={() => setForm({ ...form, media_type: "video" })}
                        flex={1}
                        py={2.5}
                        borderRadius="12px"
                        fontSize="13px"
                        fontWeight="700"
                        cursor="pointer"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        gap={2}
                        style={{
                          background: form.media_type === "video" ? "rgba(59, 130, 246, 0.2)" : "rgba(255,255,255,0.04)",
                          color: form.media_type === "video" ? "#60a5fa" : "gray",
                          border: form.media_type === "video" ? "1px solid rgba(59, 130, 246, 0.4)" : "1px solid rgba(255,255,255,0.08)",
                        }}
                      >
                        <VideoIcon size={16} /> Video Showcase
                      </Box>
                    </HStack>
                  </Box>

                  {/* Title */}
                  <Box>
                    <Text {...labelStyle}>TITLE (OPTIONAL)</Text>
                    <Input
                      placeholder="e.g. Headquarters Office, Product Launch, Company Event"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      {...fieldStyle}
                    />
                  </Box>

                  {/* Caption */}
                  <Box>
                    <Text {...labelStyle}>CAPTION / DESCRIPTION (OPTIONAL)</Text>
                    <Textarea
                      placeholder="Provide a short story or description about this photo or video..."
                      value={form.caption}
                      onChange={(e) => setForm({ ...form, caption: e.target.value })}
                      rows={3}
                      p={3}
                      borderRadius="lg"
                      bg="var(--color-glass)"
                      color="white"
                      borderColor="var(--color-card-border)"
                      _focus={{ borderColor: "#34d399" }}
                      fontSize="sm"
                    />
                  </Box>

                  {/* Upload File OR Media URL */}
                  <VStack align="stretch" gap={4}>
                    <Box>
                      <Text {...labelStyle}>FILE UPLOAD</Text>
                      <Box
                        as="label"
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                        p={5}
                        borderRadius="14px"
                        cursor="pointer"
                        style={{
                          background: "rgba(255,255,255,0.03)",
                          border: "2px dashed rgba(255,255,255,0.15)",
                        }}
                        _hover={{ background: "rgba(255,255,255,0.06)", borderColor: "#34d399" }}
                      >
                        <Upload size={24} color="#34d399" style={{ marginBottom: "8px" }} />
                        <Text fontSize="13px" fontWeight="700" color="white">
                          {file ? file.name : "Click to select a media file"}
                        </Text>
                        <Text fontSize="11px" color="gray.400" mt={1}>
                          Supports PNG, JPG, GIF, WEBP, MP4, MOV
                        </Text>
                        <input
                          type="file"
                          accept="image/*,video/*"
                          onChange={handleFileChange}
                          style={{ display: "none" }}
                        />
                      </Box>
                    </Box>

                    <Text textAlign="center" fontSize="11px" fontWeight="bold" color="gray.500">
                      — OR —
                    </Text>

                    <Box>
                      <Text {...labelStyle}>MEDIA / EMBED URL</Text>
                      <Input
                        placeholder={
                          form.media_type === "video"
                            ? "e.g. https://www.youtube.com/watch?v=... or Vimeo link"
                            : "e.g. https://images.unsplash.com/photo-..."
                        }
                        value={form.media_url}
                        onChange={(e) => setForm({ ...form, media_url: e.target.value })}
                        {...fieldStyle}
                      />
                    </Box>
                  </VStack>

                  {/* Media Preview Box */}
                  {(previewUrl || form.media_url) && (
                    <Box
                      p={3}
                      borderRadius="14px"
                      style={{ background: "rgba(17, 24, 39, 0.8)", border: "1px solid rgba(255,255,255,0.1)" }}
                    >
                      <Text fontSize="11px" fontWeight="bold" color="gray.400" mb={2}>
                        MEDIA PREVIEW
                      </Text>
                      {form.media_type === "image" ? (
                        <img
                          src={previewUrl || form.media_url}
                          alt="Preview"
                          style={{
                            width: "100%",
                            maxHeight: "180px",
                            objectFit: "cover",
                            borderRadius: "10px",
                          }}
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      ) : (
                        <Box
                          p={4}
                          borderRadius="10px"
                          textAlign="center"
                          style={{ background: "rgba(59, 130, 246, 0.1)", color: "#60a5fa" }}
                        >
                          <VideoIcon size={28} style={{ margin: "0 auto 6px" }} />
                          <Text fontSize="12px" fontWeight="bold">
                            Video Showcase Link Attached
                          </Text>
                          <Text fontSize="11px" color="gray.400" mt={0.5} wordBreak="break-all">
                            {form.media_url || file?.name}
                          </Text>
                        </Box>
                      )}
                    </Box>
                  )}
                </VStack>
              ) : (
                /* Manage Existing Items */
                <Box>
                  {existingMedia.length === 0 ? (
                    <Box textAlign="center" py={8} color="gray.400">
                      <Film size={32} style={{ margin: "0 auto 8px", opacity: 0.5 }} />
                      <Text fontSize="sm" fontWeight="bold" color="white">
                        No media uploaded yet
                      </Text>
                      <Text fontSize="xs" mt={1}>
                        Switch to "+ Add New Media" to post your first photos or videos.
                      </Text>
                    </Box>
                  ) : (
                    <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4}>
                      {existingMedia.map((item) => (
                        <Box
                          key={item.id}
                          p={3}
                          borderRadius="14px"
                          position="relative"
                          style={{
                            background: "rgba(17, 24, 39, 0.8)",
                            border: "1px solid rgba(255,255,255,0.08)",
                          }}
                        >
                          {item.media_type === "image" ? (
                            <img
                              src={item.file_url || item.file || item.media_url}
                              alt={item.title || "Media"}
                              style={{
                                width: "100%",
                                height: "130px",
                                objectFit: "cover",
                                borderRadius: "10px",
                              }}
                            />
                          ) : (
                            <Flex
                              h="130px"
                              borderRadius="10px"
                              align="center"
                              justify="center"
                              direction="column"
                              style={{ background: "linear-gradient(135deg, #1e293b, #0f172a)" }}
                            >
                              <VideoIcon size={32} color="#60a5fa" />
                              <Text fontSize="11px" fontWeight="bold" color="white" mt={2}>
                                Video Showcase
                              </Text>
                            </Flex>
                          )}

                          <Flex justify="space-between" align="center" mt={2.5}>
                            <VStack align="flex-start" gap={0} maxW="75%">
                              <Text fontSize="12px" fontWeight="bold" color="white" lineClamp={1}>
                                {item.title || "Untitled Media"}
                              </Text>
                              <Text fontSize="10px" color="gray.400" textTransform="uppercase">
                                {item.media_type}
                              </Text>
                            </VStack>

                            <Box
                              as="button"
                              onClick={() => handleDelete(item.id)}
                              p={2}
                              borderRadius="8px"
                              cursor="pointer"
                              style={{ background: "rgba(239, 68, 68, 0.15)", color: "#ef4444" }}
                              _hover={{ background: "rgba(239, 68, 68, 0.3)" }}
                            >
                              <Trash2 size={14} />
                            </Box>
                          </Flex>
                        </Box>
                      ))}
                    </SimpleGrid>
                  )}
                </Box>
              )}
            </Box>

            {/* Footer */}
            {activeTab === "add" && (
              <Flex
                justify="flex-end"
                gap={3}
                px={6}
                py={4}
                style={{ borderTop: "1px solid var(--color-card-border, rgba(255,255,255,0.08))" }}
              >
                <Button
                  onClick={onClose}
                  variant="ghost"
                  color="gray.400"
                  _hover={{ color: "white" }}
                  borderRadius="12px"
                  fontSize="13px"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  loading={isLoading}
                  style={{
                    background: "linear-gradient(135deg, #10b981, #059669)",
                    color: "white",
                    fontWeight: "bold",
                    borderRadius: "12px",
                    padding: "0 24px",
                    boxShadow: "0 4px 14px rgba(16, 185, 129, 0.35)",
                  }}
                  _hover={{ background: "#34d399" }}
                >
                  <Save size={16} style={{ marginRight: "6px" }} /> Save Media
                </Button>
              </Flex>
            )}
          </DialogContent>
        </DialogPositioner>
      </Portal>
    </Dialog>
  );
};

export default CompanyMediaModal;
