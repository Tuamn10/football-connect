import React, {
  useCallback,
  useMemo,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";

import PrimaryButton from "../../components/PrimaryButton";
import apiClient from "../../services/apiClient";
import { useAuth } from "../../context/AuthContext";
import { getApiErrorMessage } from "../../utils/apiError";

import {
  formatCurrency,
  formatDateTime,
  formatFieldType,
  formatLevel,
  formatPostStatus,
  formatPostType,
} from "../../utils/formatters";

import {
  colors,
  radius,
  shadows,
  spacing,
} from "../../theme/theme";

function normalizeList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function getPostOwnerId(post) {
  return post?.user_id ?? post?.owner_id ?? post?.created_by_id ?? post?.author?.id ?? post?.user?.id ?? null;
}

function getParticipantUserId(item) {
  return item?.user_id ?? item?.user?.id ?? item?.participant?.id ?? null;
}

function getParticipantPostId(item) {
  return item?.post_id ?? item?.post?.id ?? item?.match_post_id ?? null;
}

function getParticipantStatus(item) {
  return item?.status ?? item?.participation_status ?? null;
}

function getSavedPostId(item) {
  return item?.post_id ?? item?.post?.id ?? item?.saved_post?.id ?? item?.id ?? null;
}

function getPostStatusStyle(status) {
  const styles = {
    open: { backgroundColor: colors.primaryLight, textColor: colors.success },
    full: { backgroundColor: "#FEF3C7", textColor: "#B45309" },
    cancelled: { backgroundColor: "#FEE2E2", textColor: colors.danger },
    expired: { backgroundColor: "#E5E7EB", textColor: colors.textSecondary },
  };
  return styles[status] || { backgroundColor: colors.surfaceSoft, textColor: colors.textSecondary };
}

async function loadMyParticipations() {
  try {
    const response = await apiClient.get("/api/v1/participants/my");
    return normalizeList(response.data);
  } catch (error) {
    return [];
  }
}

async function loadSavedStatus(postId) {
  try {
    const response = await apiClient.get("/api/v1/saved-posts");
    return normalizeList(response.data).some((item) => Number(getSavedPostId(item)) === Number(postId));
  } catch (error) {
    return false;
  }
}

export default function PostDetailScreen({ route }) {
  const postId = route?.params?.postId;
  const { user } = useAuth();

  const [post, setPost] = useState(null);
  const [participations, setParticipations] = useState([]);
  const [postParticipants, setPostParticipants] = useState([]);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const loadData = useCallback(async ({ showPageLoading = true } = {}) => {
    if (!postId) {
      setErrorMessage("Không tìm thấy mã bài đăng.");
      setLoading(false);
      return;
    }

    try {
      if (showPageLoading) setLoading(true);
      setErrorMessage("");

      const postResponse = await apiClient.get(`/api/v1/posts/${postId}`);
      const fetchedPost = postResponse.data;
      setPost(fetchedPost);

      const ownerId = getPostOwnerId(fetchedPost);
      const isPostOwner = (ownerId !== null && user?.id !== undefined && Number(ownerId) === Number(user.id));

      const promises = [
        loadMyParticipations(),
        loadSavedStatus(postId),
      ];

      if (isPostOwner) {
        promises.push(apiClient.get(`/api/v1/posts/${postId}/participants`).catch(() => ({ data: [] })));
      }

      const results = await Promise.all(promises);

      setParticipations(Array.isArray(results[0]) ? results[0] : []);
      setIsSaved(Boolean(results[1]));
      
      if (isPostOwner && results[2]) {
        setPostParticipants(normalizeList(results[2].data));
      }

    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "Không thể tải chi tiết bài đăng."));
    } finally {
      if (showPageLoading) setLoading(false);
    }
  }, [postId, user?.id]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const currentParticipation = useMemo(() => {
    const safeParticipations = Array.isArray(participations) ? participations : [];
    const matchingItems = safeParticipations.filter((item) => {
      const itemPostId = getParticipantPostId(item);
      return itemPostId !== null && Number(itemPostId) === Number(postId);
    });

    if (matchingItems.length === 0) return null;
    return [...matchingItems].sort((a, b) => Number(b?.id || 0) - Number(a?.id || 0))[0];
  }, [participations, postId]);

  const participationStatus = getParticipantStatus(currentParticipation);

  const isOwner = useMemo(() => {
    const ownerId = getPostOwnerId(post);
    if (ownerId === null || user?.id === undefined) return false;
    return Number(ownerId) === Number(user.id);
  }, [post, user?.id]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadData({ showPageLoading: false });
    } finally {
      setRefreshing(false);
    }
  };

  const executeJoin = async () => {
    try {
      setActionLoading("join");
      await apiClient.post(`/api/v1/posts/${postId}/join`, { note: "Xin chào, cho mình tham gia trận đấu này với nhé!" });
      Alert.alert("Gửi yêu cầu thành công", "Yêu cầu tham gia đang chờ chủ bài đăng duyệt.");
      await loadData({ showPageLoading: false });
    } catch (error) {
      Alert.alert("Không thể tham gia", getApiErrorMessage(error, "Không thể gửi yêu cầu tham gia."));
    } finally {
      setActionLoading("");
    }
  };

  const handleJoin = () => {
    Alert.alert("Xác nhận tham gia", "Bạn có chắc chắn muốn gửi yêu cầu tham gia trận đấu này?", [
      { text: "Để sau", style: "cancel" },
      { text: "Tham gia", onPress: executeJoin },
    ]);
  };

  const executeCancelJoin = async () => {
    try {
      setActionLoading("cancel");
      await apiClient.delete(`/api/v1/posts/${postId}/join`);
      Alert.alert("Đã hủy tham gia", "Bạn đã hủy yêu cầu tham gia trận đấu.");
      await loadData({ showPageLoading: false });
    } catch (error) {
      Alert.alert("Không thể hủy", getApiErrorMessage(error, "Không thể hủy yêu cầu tham gia."));
    } finally {
      setActionLoading("");
    }
  };

  const handleCancelJoin = () => {
    Alert.alert("Hủy tham gia", "Bạn có chắc chắn muốn hủy tham gia trận đấu này?", [
      { text: "Không", style: "cancel" },
      { text: "Hủy tham gia", style: "destructive", onPress: executeCancelJoin },
    ]);
  };

  const handleToggleSave = async () => {
    if (actionLoading) return;
    const previousValue = isSaved;
    try {
      setActionLoading("save");
      setIsSaved(!previousValue);
      if (previousValue) {
        await apiClient.delete(`/api/v1/posts/${postId}/save`);
      } else {
        await apiClient.post(`/api/v1/posts/${postId}/save`);
      }
    } catch (error) {
      setIsSaved(previousValue);
      Alert.alert(previousValue ? "Không thể bỏ lưu" : "Không thể lưu bài", getApiErrorMessage(error));
    } finally {
      setActionLoading("");
    }
  };

  // 🔴 ĐÃ FIX: Đồng bộ chặt chẽ tên biến participantId
  const handleUpdateParticipantStatus = async (participantId, newStatus) => {
    if (!participantId) {
      Alert.alert("Lỗi", "Không tìm thấy mã ID của yêu cầu này.");
      return;
    }

    try {
      setActionLoading(`update_${participantId}`);
      
      // Sử dụng đúng participantId vào URL
      await apiClient.put(`/api/v1/participants/${participantId}/status`, { status: newStatus });
      
      Alert.alert("Thành công", newStatus === "approved" ? "Đã duyệt người chơi này vào sân!" : "Đã từ chối yêu cầu.");
      await loadData({ showPageLoading: false }); 
    } catch (error) {
      Alert.alert("Lỗi thao tác", getApiErrorMessage(error, "Không thể cập nhật trạng thái."));
    } finally {
      setActionLoading("");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingIconBox}>
          <Ionicons name="football-outline" size={44} color={colors.primary} />
        </View>
        <ActivityIndicator size="large" color={colors.primary} style={styles.loadingIndicator} />
        <Text style={styles.loadingText}>Đang tải chi tiết bài đăng...</Text>
      </View>
    );
  }

  if (errorMessage || !post) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorIconBox}>
          <Ionicons name="alert-circle-outline" size={46} color={colors.danger} />
        </View>
        <Text style={styles.errorTitle}>Không thể hiển thị bài đăng</Text>
        <Text style={styles.errorDescription}>{errorMessage || "Bài đăng không tồn tại hoặc đã bị xóa."}</Text>
        <Pressable style={styles.retryButton} onPress={() => loadData()}>
          <Ionicons name="refresh-outline" size={18} color={colors.white} />
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </Pressable>
      </View>
    );
  }

  const statusStyle = getPostStatusStyle(post.status);
  const authorName = post?.author?.name || post?.user?.name || post?.owner_name || post?.created_by_name || "Thành viên Football Connect";
  const matchTime = post?.match_time || post?.match_at || post?.start_time;
  const currentPlayers = Number(post?.current_players) || 0;
  const neededPlayers = Number(post?.needed_players) || 0;
  const joinablePostTypes = ["find_player", "find_goalkeeper"];
  const supportsJoining = joinablePostTypes.includes(post?.post_type);

  const canJoin = supportsJoining && post?.status === "open" && !isOwner && (!participationStatus || participationStatus === "cancelled" || participationStatus === "rejected");
  const canCancel = !isOwner && (participationStatus === "pending" || participationStatus === "approved");

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
      >
        <LinearGradient colors={[colors.primaryDark, colors.primary]} style={styles.hero}>
          <View style={styles.heroTopRow}>
            <View style={styles.postTypeBadge}>
              <Ionicons name="football-outline" size={16} color={colors.primaryDark} />
              <Text style={styles.postTypeText}>{formatPostType(post.post_type)}</Text>
            </View>
            <Pressable style={styles.heroSaveButton} onPress={handleToggleSave} disabled={actionLoading === "save"}>
              {actionLoading === "save" ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Ionicons name={isSaved ? "bookmark" : "bookmark-outline"} size={23} color={colors.white} />
              )}
            </Pressable>
          </View>
          <Text style={styles.heroTitle}>{post.title || "Bài đăng bóng đá"}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
            <View style={[styles.statusDot, { backgroundColor: statusStyle.textColor }]} />
            <Text style={[styles.statusText, { color: statusStyle.textColor }]}>{formatPostStatus(post.status)}</Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.authorCard}>
            <View style={styles.authorAvatar}>
              <Ionicons name="person" size={24} color={colors.primaryDark} />
            </View>
            <View style={styles.authorInformation}>
              <Text style={styles.authorLabel}>Người đăng</Text>
              <Text style={styles.authorName}>{authorName}</Text>
            </View>
            <View style={styles.memberBadge}>
              <Ionicons name="checkmark-circle" size={17} color={colors.primary} />
              <Text style={styles.memberText}>Thành viên</Text>
            </View>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Thông tin trận đấu</Text>
            <DetailRow icon="location-outline" label="Khu vực" value={post.area || post.location || "Chưa cập nhật"} />
            <DetailRow icon="time-outline" label="Thời gian" value={formatDateTime(matchTime)} />
            <DetailRow icon="people-outline" label="Số người" value={`${currentPlayers}/${neededPlayers} người`} />
            <DetailRow icon="football-outline" label="Loại sân" value={formatFieldType(post.field_type)} />
            <DetailRow icon="shield-outline" label="Trình độ" value={formatLevel(post.required_level)} />
            <DetailRow icon="wallet-outline" label="Chi phí" value={formatCurrency(post.cost)} last />
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Nội dung bài đăng</Text>
            <Text style={styles.description}>{post.description || "Người đăng chưa bổ sung mô tả."}</Text>
          </View>

          {isOwner ? (
            <NoticeCard icon="person-circle-outline" title="Đây là bài đăng của bạn" description="Bạn không thể tự tham gia bài đăng do mình tạo." backgroundColor={colors.primarySoft} iconColor={colors.primary} />
          ) : null}

          {/* KHU VỰC QUẢN LÝ NGƯỜI XIN VÀO */}
          {isOwner && (
            <View style={[styles.sectionCard, { borderColor: colors.primary, borderWidth: 1 }]}>
              <View style={{flexDirection: "row", alignItems: "center", marginBottom: 15}}>
                <Ionicons name="people-circle-outline" size={24} color={colors.primary} />
                <Text style={[styles.sectionTitle, {marginBottom: 0, marginLeft: 8}]}>Quản lý người xin vào</Text>
              </View>

              {postParticipants.length === 0 ? (
                <Text style={styles.description}>Hiện chưa có ai gửi yêu cầu tham gia.</Text>
              ) : (
                postParticipants.map((p) => {
                  const pUserId = getParticipantUserId(p);
                  const pStatus = getParticipantStatus(p);
                  const displayName = p.user?.name || `Cầu thủ #${pUserId}`;
                  
                  return (
                    <View key={p.id || pUserId} style={styles.participantRow}>
                      <View style={styles.participantInfo}>
                        <View style={styles.participantAvatar}>
                          <Ionicons name="person" size={20} color={colors.primaryDark} />
                        </View>
                        <View style={{ marginLeft: 12, flex: 1 }}>
                          <Text style={styles.participantName}>{displayName}</Text>
                          <Text style={styles.participantStatusText}>
                            Trạng thái: <Text style={{fontWeight: "bold", color: pStatus === "pending" ? colors.warning : pStatus === "approved" ? colors.success : colors.danger}}>{pStatus}</Text>
                          </Text>
                          {p.note ? <Text style={{fontSize: 12, fontStyle: "italic", color: colors.textLight, marginTop: 2}}>"{p.note}"</Text> : null}
                        </View>
                      </View>

                      {pStatus === "pending" && (
                        <View style={styles.actionButtons}>
                          <Pressable 
                            style={styles.btnApprove} 
                            // 🔴 ĐÃ FIX: Truyền chuẩn p.id vào hàm và check loading đúng biến
                            onPress={() => handleUpdateParticipantStatus(p.id, "approved")}
                            disabled={actionLoading === `update_${p.id}`}
                          >
                            {actionLoading === `update_${p.id}` ? (
                              <ActivityIndicator size="small" color={colors.white} />
                            ) : (
                              <Text style={styles.btnApproveText}>Duyệt</Text>
                            )}
                          </Pressable>
                          
                          <Pressable 
                            style={styles.btnReject} 
                            // 🔴 ĐÃ FIX: Truyền chuẩn p.id vào hàm và check loading đúng biến
                            onPress={() => handleUpdateParticipantStatus(p.id, "rejected")}
                            disabled={actionLoading === `update_${p.id}`}
                          >
                            <Ionicons name="close" size={18} color={colors.danger} />
                          </Pressable>
                        </View>
                      )}
                    </View>
                  );
                })
              )}
            </View>
          )}

          {!isOwner && participationStatus === "pending" ? (
            <NoticeCard icon="time-outline" title="Đang chờ chủ bài duyệt" description="Yêu cầu tham gia của bạn đã được gửi." backgroundColor="#FFF8E1" iconColor={colors.warning} />
          ) : null}

          {!isOwner && participationStatus === "approved" ? (
            <NoticeCard icon="checkmark-circle-outline" title="Bạn đã được chấp nhận" description="Hãy đến đúng giờ và liên hệ với chủ bài khi cần." backgroundColor={colors.primaryLight} iconColor={colors.success} />
          ) : null}

          {!isOwner && participationStatus === "rejected" ? (
            <NoticeCard icon="close-circle-outline" title="Yêu cầu đã bị từ chối" description="Bạn có thể gửi lại yêu cầu tham gia." backgroundColor="#FEE2E2" iconColor={colors.danger} />
          ) : null}
        </View>
      </ScrollView>

      <SafeAreaView edges={["bottom"]} style={styles.bottomSafeArea}>
        <View style={styles.bottomBar}>
          <Pressable style={[styles.saveButton, isSaved && styles.saveButtonActive]} onPress={handleToggleSave} disabled={actionLoading === "save"}>
            {actionLoading === "save" ? <ActivityIndicator size="small" color={colors.primaryDark} /> : <Ionicons name={isSaved ? "bookmark" : "bookmark-outline"} size={22} color={colors.primaryDark} />}
            <Text style={styles.saveButtonText}>{isSaved ? "Đã lưu" : "Lưu bài"}</Text>
          </Pressable>

          {isOwner ? (
            <View style={styles.ownerButton}>
              <Text style={styles.ownerButtonText}>Bài đăng của bạn</Text>
            </View>
          ) : null}

          {canJoin ? (
            <View style={styles.actionWrapper}>
              <PrimaryButton title={participationStatus === "rejected" ? "Gửi lại yêu cầu" : "Tham gia trận"} loading={actionLoading === "join"} disabled={Boolean(actionLoading)} onPress={handleJoin} icon={<Ionicons name="person-add-outline" size={20} color={colors.white} />} />
            </View>
          ) : null}

          {canCancel ? (
            <Pressable style={styles.cancelButton} onPress={handleCancelJoin} disabled={Boolean(actionLoading)}>
              {actionLoading === "cancel" ? <ActivityIndicator size="small" color={colors.danger} /> : <Ionicons name="close-circle-outline" size={21} color={colors.danger} />}
              <Text style={styles.cancelButtonText}>Hủy tham gia</Text>
            </Pressable>
          ) : null}

          {!isOwner && !canJoin && !canCancel ? (
            <View style={styles.unavailableButton}>
              <Text style={styles.unavailableButtonText}>{!supportsJoining ? "Bài đăng không hỗ trợ tham gia" : post?.status !== "open" ? "Bài đăng đã đóng" : "Không thể tham gia"}</Text>
            </View>
          ) : null}
        </View>
      </SafeAreaView>
    </View>
  );
}

function DetailRow({ icon, label, value, last = false }) {
  return (
    <View style={[styles.detailRow, last && styles.detailRowLast]}>
      <View style={styles.detailIcon}><Ionicons name={icon} size={20} color={colors.primary} /></View>
      <View style={styles.detailContent}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

function NoticeCard({ icon, title, description, backgroundColor, iconColor }) {
  return (
    <View style={[styles.noticeCard, { backgroundColor }]}>
      <Ionicons name={icon} size={28} color={iconColor} />
      <View style={styles.noticeContent}>
        <Text style={styles.noticeTitle}>{title}</Text>
        <Text style={styles.noticeDescription}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 28,
  },
  hero: {
    paddingHorizontal: spacing.lg,
    paddingTop: 22,
    paddingBottom: 27,
    borderBottomLeftRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  postTypeBadge: {
    maxWidth: "75%",
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
    flexDirection: "row",
    alignItems: "center",
  },
  postTypeText: {
    marginLeft: 6,
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: "800",
  },
  heroSaveButton: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.17)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: {
    marginTop: 19,
    color: colors.white,
    fontSize: 25,
    lineHeight: 32,
    fontWeight: "900",
  },
  statusBadge: {
    alignSelf: "flex-start",
    marginTop: 14,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: radius.pill,
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 7,
    height: 7,
    marginRight: 6,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "800",
  },
  content: {
    padding: spacing.lg,
  },
  authorCard: {
    padding: 15,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
    ...shadows.card,
  },
  authorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  authorInformation: {
    flex: 1,
    marginLeft: 11,
  },
  authorLabel: {
    color: colors.textLight,
    fontSize: 11,
  },
  authorName: {
    marginTop: 3,
    color: colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  memberBadge: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    flexDirection: "row",
    alignItems: "center",
  },
  memberText: {
    marginLeft: 4,
    color: colors.primaryDark,
    fontSize: 10,
    fontWeight: "800",
  },
  sectionCard: {
    marginTop: 16,
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    ...shadows.small,
  },
  sectionTitle: {
    marginBottom: 13,
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
  },
  detailRow: {
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
  },
  detailRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 2,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  detailContent: {
    flex: 1,
    marginLeft: 11,
  },
  detailLabel: {
    color: colors.textLight,
    fontSize: 11,
  },
  detailValue: {
    marginTop: 3,
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },
  description: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 23,
  },
  noticeCard: {
    marginTop: 16,
    padding: 15,
    borderRadius: radius.xl,
    flexDirection: "row",
    alignItems: "center",
  },
  noticeContent: {
    flex: 1,
    marginLeft: 12,
  },
  noticeTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
  },
  noticeDescription: {
    marginTop: 4,
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  bottomSafeArea: {
    backgroundColor: colors.white,
  },
  bottomBar: {
    minHeight: 76,
    paddingHorizontal: spacing.lg,
    paddingTop: 11,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
    ...shadows.card,
  },
  saveButton: {
    width: 76,
    minHeight: 54,
    marginRight: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  saveButtonText: {
    marginTop: 3,
    color: colors.primaryDark,
    fontSize: 10,
    fontWeight: "800",
  },
  actionWrapper: {
    flex: 1,
  },
  cancelButton: {
    flex: 1,
    minHeight: 54,
    borderWidth: 1,
    borderColor: "#F3B5B5",
    borderRadius: radius.lg,
    backgroundColor: "#FFF7F7",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    marginLeft: 7,
    color: colors.danger,
    fontSize: 14,
    fontWeight: "800",
  },
  ownerButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  ownerButtonText: {
    color: colors.primaryDark,
    fontSize: 14,
    fontWeight: "900",
  },
  unavailableButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  unavailableButtonText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: "800",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingIconBox: {
    width: 86,
    height: 86,
    borderRadius: 28,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingIndicator: {
    marginTop: 18,
  },
  loadingText: {
    marginTop: 12,
    color: colors.textSecondary,
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    paddingHorizontal: 35,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  errorIconBox: {
    width: 90,
    height: 90,
    borderRadius: 30,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
  },
  errorTitle: {
    marginTop: 18,
    color: colors.text,
    fontSize: 19,
    fontWeight: "900",
    textAlign: "center",
  },
  errorDescription: {
    marginTop: 8,
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
  },
  retryButtonText: {
    marginLeft: 7,
    color: colors.white,
    fontSize: 14,
    fontWeight: "800",
  },

  // CSS QUẢN LÝ NGƯỜI CHƠI
  participantRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  participantInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  participantAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  participantName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "bold",
  },
  participantStatusText: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  btnApprove: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    marginRight: 8,
    minWidth: 60,
    alignItems: "center",
  },
  btnApproveText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  btnReject: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
});