import React, { useEffect, useState, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import apiClient from "../../services/apiClient";
import { getApiErrorMessage } from "../../utils/apiError";
import PrimaryButton from "../../components/PrimaryButton";
import { colors, radius, shadows, spacing } from "../../theme/theme";
import { useAuth } from "../../context/AuthContext";

export default function FieldDetailScreen({ route, navigation }) {
  const { fieldId } = route.params;
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [field, setField] = useState(null);
  const [summary, setSummary] = useState(null);
  const [reviews, setReviews] = useState([]);

  // Modal State
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  // Update state
  const [editingReviewId, setEditingReviewId] = useState(null);

  const loadData = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const [fieldRes, reviewsRes, summaryRes] = await Promise.all([
        apiClient.get(`/api/v1/fields/${fieldId}`),
        apiClient.get(`/api/v1/fields/${fieldId}/reviews`),
        apiClient.get(`/api/v1/fields/${fieldId}/reviews/summary`).catch(() => ({ data: { average_rating: 0, total_reviews: 0 } })),
      ]);

      setField(fieldRes.data);
      setReviews(reviewsRes.data || []);
      setSummary(summaryRes.data);
    } catch (error) {
      Alert.alert("Lỗi tải dữ liệu", getApiErrorMessage(error, "Không thể tải thông tin sân bóng."));
      if (showLoading) navigation.goBack();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fieldId, navigation]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData(false);
  };

  const openCreateReview = () => {
    setEditingReviewId(null);
    setRating(5);
    setComment("");
    setReviewModalVisible(true);
  };

  const openEditReview = (review) => {
    setEditingReviewId(review.id);
    setRating(review.rating);
    setComment(review.comment || "");
    setReviewModalVisible(true);
  };

  const handleSubmitReview = async () => {
    if (!rating || rating < 1 || rating > 5) {
      Alert.alert("Lỗi", "Vui lòng chọn số sao từ 1 đến 5.");
      return;
    }

    const trimmedComment = comment.trim();

    try {
      setSubmitting(true);
      const payload = {
        rating,
        comment: trimmedComment || null,
      };

      if (editingReviewId) {
        await apiClient.put(`/api/v1/field-reviews/${editingReviewId}`, payload);
        Alert.alert("Thành công", "Đã cập nhật đánh giá.");
      } else {
        await apiClient.post(`/api/v1/fields/${fieldId}/reviews`, payload);
        Alert.alert("Thành công", "Cảm ơn bạn đã gửi đánh giá.");
      }
      
      setReviewModalVisible(false);
      loadData(false);
    } catch (error) {
      Alert.alert("Không thể gửi", getApiErrorMessage(error, "Có lỗi xảy ra, vui lòng thử lại sau."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = (reviewId) => {
    Alert.alert("Xóa đánh giá?", "Bạn có chắc chắn muốn xóa đánh giá này không?", [
      { text: "Hủy", style: "cancel" },
      { 
        text: "Xóa", 
        style: "destructive", 
        onPress: async () => {
          try {
            await apiClient.delete(`/api/v1/field-reviews/${reviewId}`);
            Alert.alert("Đã xóa", "Đánh giá của bạn đã bị xóa.");
            loadData(false);
          } catch (error) {
            Alert.alert("Lỗi", getApiErrorMessage(error, "Không thể xóa đánh giá."));
          }
        } 
      }
    ]);
  };

  const renderReviewItem = ({ item }) => {
    const isMyReview = user && item.user_id === user.id;

    return (
      <View style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <View style={styles.reviewerInfo}>
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={16} color={colors.white} />
            </View>
            <Text style={styles.reviewerName}>Người dùng #{item.user_id}</Text>
          </View>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons 
                key={star} 
                name={star <= item.rating ? "star" : "star-outline"} 
                size={14} 
                color="#FBBF24" 
              />
            ))}
          </View>
        </View>

        {item.comment ? (
          <Text style={styles.reviewComment}>{item.comment}</Text>
        ) : null}

        {isMyReview && (
          <View style={styles.myReviewActions}>
            <Text style={styles.myReviewBadge}>Đánh giá của bạn</Text>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <Pressable onPress={() => openEditReview(item)}>
                <Text style={styles.actionTextEdit}>Sửa</Text>
              </Pressable>
              <Pressable onPress={() => handleDeleteReview(item.id)}>
                <Text style={styles.actionTextDelete}>Xóa</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 12, color: colors.textSecondary }}>Đang tải thông tin sân bóng...</Text>
      </View>
    );
  }

  if (!field) return null;

  const userHasReviewed = user && reviews.some(r => r.user_id === user.id);

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.primary]} />}
        ListHeaderComponent={
          <View style={styles.headerComponent}>
            <Text style={styles.title}>{field.name}</Text>
            
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={18} color={colors.textSecondary} />
              <Text style={styles.infoText}>{field.address || field.area || "Chưa có địa chỉ"}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="football-outline" size={18} color={colors.textSecondary} />
              <Text style={styles.infoText}>Loại sân: {field.field_type || "Không rõ"}</Text>
            </View>

            {field.price_per_hour !== null && field.price_per_hour !== undefined && (
              <View style={styles.infoRow}>
                <Ionicons name="cash-outline" size={18} color={colors.textSecondary} />
                <Text style={styles.infoText}>Giá: {Number(field.price_per_hour).toLocaleString("vi-VN")} đ/giờ</Text>
              </View>
            )}

            <View style={styles.summaryContainer}>
              <View style={styles.ratingBox}>
                <Text style={styles.ratingNumber}>{(summary?.average_rating || 0).toFixed(1)}</Text>
                <Ionicons name="star" size={24} color="#FBBF24" />
              </View>
              <View style={styles.summaryStats}>
                <Text style={styles.summaryTotalText}>{summary?.total_reviews || 0} lượt đánh giá</Text>
                <Text style={styles.summarySubText}>Từ cộng đồng Football Connect</Text>
              </View>
            </View>

            <View style={styles.reviewsHeader}>
              <Text style={styles.sectionTitle}>Đánh giá ({summary?.total_reviews || 0})</Text>
              {user && !userHasReviewed && (
                <Pressable style={styles.addReviewBtn} onPress={openCreateReview}>
                  <Ionicons name="create-outline" size={16} color={colors.primaryDark} />
                  <Text style={styles.addReviewBtnText}>Viết đánh giá</Text>
                </Pressable>
              )}
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={48} color={colors.textLight} />
            <Text style={styles.emptyTitle}>Chưa có đánh giá</Text>
            <Text style={styles.emptyText}>Sân bóng này chưa có lượt đánh giá nào. Hãy là người đầu tiên chia sẻ trải nghiệm của bạn!</Text>
          </View>
        }
        renderItem={renderReviewItem}
        contentContainerStyle={styles.listContent}
      />

      {/* MODAL VIẾT ĐÁNH GIÁ */}
      <Modal
        visible={reviewModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingReviewId ? "Sửa đánh giá" : "Viết đánh giá"}</Text>
            
            <View style={styles.starSelectContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Pressable key={star} onPress={() => setRating(star)} style={styles.starSelectBtn}>
                  <Ionicons 
                    name={star <= rating ? "star" : "star-outline"} 
                    size={36} 
                    color="#FBBF24" 
                  />
                </Pressable>
              ))}
            </View>
            <Text style={styles.ratingHint}>Nhấn vào sao để chọn điểm (1-5)</Text>

            <TextInput
              style={styles.textInput}
              placeholder="Chia sẻ cảm nhận của bạn về sân bóng này..."
              placeholderTextColor={colors.textLight}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={comment}
              onChangeText={setComment}
              maxLength={500}
            />

            <View style={styles.modalFooter}>
              <Pressable style={styles.cancelBtn} onPress={() => setReviewModalVisible(false)} disabled={submitting}>
                <Text style={styles.cancelBtnText}>Hủy</Text>
              </Pressable>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <PrimaryButton 
                  title="Gửi đánh giá" 
                  onPress={handleSubmitReview} 
                  loading={submitting} 
                  disabled={submitting} 
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: 40,
  },
  headerComponent: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    color: colors.text,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  summaryContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: radius.xl,
    marginTop: 16,
    marginBottom: 24,
    ...shadows.card,
  },
  ratingBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.lg,
  },
  ratingNumber: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.primaryDark,
    marginRight: 6,
  },
  summaryStats: {
    marginLeft: 16,
  },
  summaryTotalText: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.text,
  },
  summarySubText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  reviewsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.text,
  },
  addReviewBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  addReviewBtnText: {
    marginLeft: 4,
    fontSize: 13,
    fontWeight: "800",
    color: colors.primaryDark,
  },
  reviewCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: radius.lg,
    marginBottom: 12,
    ...shadows.small,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  reviewerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.textLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
  starsContainer: {
    flexDirection: "row",
  },
  reviewComment: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 10,
  },
  myReviewActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  myReviewBadge: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primary,
  },
  actionTextEdit: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
  },
  actionTextDelete: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.danger,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
    marginTop: 12,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 20,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: radius.xxl,
    padding: 20,
    ...shadows.card,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.text,
    textAlign: "center",
    marginBottom: 20,
  },
  starSelectContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 8,
  },
  starSelectBtn: {
    padding: 4,
  },
  ratingHint: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 20,
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
    marginBottom: 20,
  },
  modalFooter: {
    flexDirection: "row",
    alignItems: "center",
  },
  cancelBtn: {
    flex: 1,
    height: 50,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.textSecondary,
  },
});
