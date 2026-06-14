import React, {
  useEffect,
  useState,
} from "react";

import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

import ScreenLoader from "../../components/ScreenLoader";
import PrimaryButton from "../../components/PrimaryButton";

import apiClient from "../../services/apiClient";
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

export default function PostDetailScreen({
  route,
}) {
  const { postId } = route.params || {};

  const [post, setPost] = useState(null);
  const [loading, setLoading] =
    useState(true);

  const fetchPostDetail = async () => {
    try {
      setLoading(true);

      const response = await apiClient.get(
        `/api/v1/posts/${postId}`
      );

      setPost(response.data);
    } catch (error) {
      Alert.alert(
        "Không thể tải bài đăng",
        getApiErrorMessage(error)
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (postId) {
      fetchPostDetail();
    }
  }, [postId]);

  const handleJoin = async () => {
    try {
      await apiClient.post(
        `/api/v1/posts/${postId}/join`,
        {
          note: "Tôi muốn tham gia trận này.",
        }
      );

      Alert.alert(
        "Thành công",
        "Đã gửi yêu cầu tham gia trận."
      );
    } catch (error) {
      Alert.alert(
        "Không thể tham gia",
        getApiErrorMessage(error)
      );
    }
  };

  if (loading) {
    return (
      <ScreenLoader message="Đang tải chi tiết bài đăng..." />
    );
  }

  if (!post) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.emptyContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={52}
            color={colors.textLight}
          />

          <Text style={styles.emptyTitle}>
            Không tìm thấy bài đăng
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={["bottom"]}
      style={styles.safeArea}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.typeRow}>
          <View style={styles.typeBadge}>
            <Ionicons
              name="football-outline"
              size={16}
              color={colors.primaryDark}
            />

            <Text style={styles.typeText}>
              {formatPostType(post.post_type)}
            </Text>
          </View>

          <Text style={styles.statusText}>
            {formatPostStatus(post.status)}
          </Text>
        </View>

        <Text style={styles.title}>
          {post.title}
        </Text>

        <Text style={styles.description}>
          {post.description ||
            "Bài đăng chưa có mô tả chi tiết."}
        </Text>

        <View style={styles.card}>
          <InformationRow
            icon="location-outline"
            label="Khu vực"
            value={post.area || "Chưa cập nhật"}
          />

          <InformationRow
            icon="time-outline"
            label="Thời gian"
            value={formatDateTime(
              post.match_time
            )}
          />

          <InformationRow
            icon="football-outline"
            label="Loại sân"
            value={formatFieldType(
              post.field_type
            )}
          />

          <InformationRow
            icon="shield-outline"
            label="Trình độ"
            value={formatLevel(
              post.required_level
            )}
          />

          <InformationRow
            icon="people-outline"
            label="Số người cần"
            value={`${post.current_players || 0}/${post.needed_players || 0} người`}
          />

          <InformationRow
            icon="wallet-outline"
            label="Chi phí"
            value={formatCurrency(post.cost)}
            last
          />
        </View>

        <PrimaryButton
          title="Tham gia trận"
          onPress={handleJoin}
          icon={
            <Ionicons
              name="football-outline"
              size={20}
              color={colors.white}
            />
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function InformationRow({
  icon,
  label,
  value,
  last = false,
}) {
  return (
    <View
      style={[
        styles.informationRow,
        last && styles.lastRow,
      ]}
    >
      <View style={styles.iconBox}>
        <Ionicons
          name={icon}
          size={20}
          color={colors.primary}
        />
      </View>

      <View style={styles.informationContent}>
        <Text style={styles.informationLabel}>
          {label}
        </Text>

        <Text style={styles.informationValue}>
          {value}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    padding: spacing.lg,
    paddingBottom: 40,
  },

  typeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  typeBadge: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
    flexDirection: "row",
    alignItems: "center",
  },

  typeText: {
    marginLeft: 5,
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: "800",
  },

  statusText: {
    color: colors.success,
    fontSize: 12,
    fontWeight: "800",
  },

  title: {
    marginTop: 18,
    color: colors.text,
    fontSize: 25,
    lineHeight: 32,
    fontWeight: "900",
  },

  description: {
    marginTop: 10,
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },

  card: {
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    ...shadows.card,
  },

  informationRow: {
    minHeight: 68,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
  },

  lastRow: {
    borderBottomWidth: 0,
  },

  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  informationContent: {
    flex: 1,
  },

  informationLabel: {
    color: colors.textLight,
    fontSize: 11,
  },

  informationValue: {
    marginTop: 3,
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyTitle: {
    marginTop: 14,
    color: colors.text,
    fontSize: 18,
    fontWeight: "800",
  },
});