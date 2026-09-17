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
} from "@chakra-ui/react";
import {
  Image as ImageIcon,
  Video as VideoIcon,
  X,
  Save,
  Upload,
  Film,
} from "lucide-react";
import api from "../../api";

const fieldStyle = {
  bg: "var(--color-glass, rgba(255,255,255,0.05))",
  color: "white",
  h: "11",
  borderRadius: "lg",
  border: "1px solid",
  borderColor: "var(--color-card-border, rgba(255,255,255,0.1))",
  _focus: { borderColor: "#34d399", boxShadow: "0 0 0 2px rgba(52,211,153,0.25)" },
  _placeholder: { color: "gray.500" },
  fontSize: "sm",
  px: "4",
};

const labelStyle = {
  color: "var(--color-text-muted, #9ca3af)",
  fontSize: "10px",
  fontWeight: "black",
  letterSpacing: "widest",
  mb: "2",
};

const UploadCompanyMediaModal = ({ isOpen, onClose, companyId, onSaved }) => {
  const [isLoading, setIsLoading] = useState(false);
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
      alert("Please select a media file or provide a media URL.");
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
      onClose();
    } catch (err) {
      console.error("Error uploading media:", err);
      alert("Failed to upload media item. Please check inputs.");
    } finally {
      setIsLoading(false);
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
              maxWidth: "620px",
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
                    Upload Company Media
                  </Text>
                  <Text fontSize="xs" color="gray.400">
                    Add photos or video showcases for your public landing page
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

            {/* Modal Body */}
            <Box p={6} maxH="75vh" overflowY="auto">
              <VStack align="stretch" gap={5}>
                {/* Media Type Switcher */}
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
                    placeholder="Provide a short description..."
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

                {/* Preview Box */}
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
            </Box>

            {/* Footer */}
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
                <Save size={16} style={{ marginRight: "6px" }} /> Upload Media
              </Button>
            </Flex>
          </DialogContent>
        </DialogPositioner>
      </Portal>
    </Dialog>
  );
};

export default UploadCompanyMediaModal;
