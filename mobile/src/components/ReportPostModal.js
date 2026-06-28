import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import apiClient from "../services/apiClient";
import { getApiErrorMessage } from "../utils/apiError";
import PrimaryButton from "./PrimaryButton";
import { colors, radius, shadows, spacing } from "../theme/theme";

const REPORT_REASONS = [
  { key: "false_information", label: "Nội dung sai sự thật" },
  { key: "scam", label: "Lừa đảo hoặc thu phí bất thường" },
  { key: "inappropriate", label: "Nội dung không phù hợp" },
  { key: "spam", label: "Spam hoặc đăng bài trùng lặp" },
  { key: "other", label: "Lý do khác" },
];

export default function ReportPostModal({ visible, onClose, postId }) {
  const [selectedReason, setSelectedReason] = useState(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    if (loading) return;
    setSelectedReason(null);
    setDescription("");
    onClose();
  };

  const handleSubmit = async () => {
    if (!selectedReason) {
      Alert.alert("Chưa chọn lý do", "Vui lòng chọn một lý do báo cáo.");
      return;
    }

    const trimmedDescription = description.trim();
    if (selectedReason === "other" && !trimmedDescription) {
      Alert.alert("Thiếu thông tin", "Vui lòng nhập mô tả cho lý do báo cáo của bạn.");
      return;
    }

    try {
      setLoading(true);
      
      const payload = {
        reason: selectedReason,
        description: trimmedDescription || null,
      };

      await apiClient.post(`/api/v1/posts/${postId}/reports`, payload);

      Alert.alert(
        "Đã gửi báo cáo", 
        "Cảm ơn bạn. Báo cáo sẽ được quản trị viên xem xét.",
        [{ text: "Đóng", onPress: handleClose }]
      );

    } catch (error) {
      Alert.alert(
        "Không thể gửi báo cáo",
        getApiErrorMessage(error, "Có lỗi xảy ra, vui lòng thử lại sau.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Báo cáo bài viết</Text>
            <Pressable onPress={handleClose} hitSlop={10} disabled={loading}>
              <Ionicons name="close" size={24} color={colors.textLight} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollArea}>
            <Text style={styles.instructionText}>
              Hãy cho chúng tôi biết vấn đề của bài viết này. Điều này giúp cộng đồng Football Connect an toàn hơn.
            </Text>

            <View style={styles.reasonList}>
              {REPORT_REASONS.map((item) => {
                const isSelected = selectedReason === item.key;
                return (
                  <Pressable
                    key={item.key}
                    style={[styles.reasonItem, isSelected && styles.reasonItemActive]}
                    onPress={() => setSelectedReason(item.key)}
                  >
                    <Ionicons 
                      name={isSelected ? "radio-button-on" : "radio-button-off"} 
                      size={20} 
                      color={isSelected ? colors.primary : colors.textLight} 
                    />
                    <Text style={[styles.reasonText, isSelected && styles.reasonTextActive]}>
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.inputLabel}>Mô tả bổ sung {selectedReason === "other" && "(Bắt buộc)"}</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Nhập chi tiết vấn đề..."
              placeholderTextColor={colors.textLight}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={description}
              onChangeText={setDescription}
              maxLength={500}
            />
          </ScrollView>

          <View style={styles.footer}>
            <Pressable style={styles.cancelButton} onPress={handleClose} disabled={loading}>
              <Text style={styles.cancelButtonText}>Hủy</Text>
            </Pressable>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <PrimaryButton 
                title="Gửi báo cáo" 
                onPress={handleSubmit} 
                loading={loading}
                disabled={loading || !selectedReason}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xxl,
    borderTopRightRadius: radius.xxl,
    paddingHorizontal: spacing.lg,
    paddingTop: 20,
    paddingBottom: 30,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
  },
  scrollArea: {
    marginBottom: 20,
  },
  instructionText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  reasonList: {
    marginBottom: 16,
  },
  reasonItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  reasonItemActive: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    borderBottomWidth: 0,
    paddingHorizontal: 10,
    marginHorizontal: -10,
  },
  reasonText: {
    marginLeft: 10,
    fontSize: 15,
    color: colors.text,
  },
  reasonTextActive: {
    fontWeight: "700",
    color: colors.primaryDark,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 12,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.surfaceSoft,
    minHeight: 100,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
  },
  cancelButton: {
    flex: 1,
    height: 50,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.textSecondary,
  },
});
