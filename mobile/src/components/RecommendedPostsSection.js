import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../services/apiClient';
import { colors, radius, shadows, spacing } from '../theme/theme';
import {
  formatCurrency,
  formatDateTime,
  formatFieldType,
  formatLevel,
  formatPostType,
} from "../utils/formatters";

export default function RecommendedPostsSection({ navigation }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/v1/recommendations/posts?limit=5');
      setRecommendations(response.data || []);
    } catch (error) {
      console.log('Error fetching recommendations:', error);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="sparkles" size={18} color={colors.warning} />
        <Text style={styles.title}>Kèo bóng phù hợp cho bạn</Text>
      </View>
      <Text style={styles.subtitle}>Gợi ý dựa trên hồ sơ và vị trí của bạn</Text>

      <FlatList
        data={recommendations}
        keyExtractor={(item) => String(item.post?.id)}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
        renderItem={({ item }) => {
          const post = item.post;
          const matchPercent = Number(item.match_percentage ?? 0).toFixed(2).replace(".", ",");
          const neededPlayers = Number(post?.needed_players) || 0;
          const currentPlayers = Number(post?.current_players) || 0;
          const isFieldPost = post?.post_type === "pass_field" || post?.post_type === "find_field";

          return (
            <Pressable
              onPress={() => navigation.navigate("PostDetail", { postId: post.id })}
              style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed,
              ]}
            >
              <View style={styles.topRow}>
                <View style={styles.postTypeBadge}>
                  <Ionicons name="football-outline" size={15} color={colors.primaryDark} />
                  <Text style={styles.postTypeText} numberOfLines={1}>
                    {formatPostType(post?.post_type)}
                  </Text>
                </View>

                <View style={styles.matchBadge}>
                  <Text style={styles.matchText}>{matchPercent}% phù hợp</Text>
                </View>
              </View>

              <Text style={styles.cardTitle} numberOfLines={2}>
                {post?.title || "Bài đăng bóng đá"}
              </Text>

              <Text style={styles.cardDescription} numberOfLines={2}>
                {post?.description || "Bài đăng chưa có mô tả chi tiết."}
              </Text>

              <View style={styles.informationContainer}>
                <View style={styles.informationRow}>
                  <View style={styles.informationIcon}>
                    <Ionicons name="person-outline" size={18} color={colors.primary} />
                  </View>
                  <View style={styles.informationContent}>
                    <Text style={styles.informationLabel}>Người đăng</Text>
                    <Text style={styles.informationValue} numberOfLines={1}>
                      {post?.owner_name || "Thành viên Football Connect"}
                    </Text>
                  </View>
                </View>

                <View style={styles.informationRow}>
                  <View style={styles.informationIcon}>
                    <Ionicons name="location-outline" size={18} color={colors.primary} />
                  </View>
                  <View style={styles.informationContent}>
                    <Text style={styles.informationLabel}>Khu vực</Text>
                    <Text style={styles.informationValue} numberOfLines={1}>
                      {post?.area || "Chưa cập nhật"}
                    </Text>
                  </View>
                </View>

                <View style={styles.informationRow}>
                  <View style={styles.informationIcon}>
                    <Ionicons name="time-outline" size={18} color={colors.primary} />
                  </View>
                  <View style={styles.informationContent}>
                    <Text style={styles.informationLabel}>Thời gian</Text>
                    <Text style={styles.informationValue} numberOfLines={1}>
                      {formatDateTime(post?.match_time)}
                    </Text>
                  </View>
                </View>

                <View style={styles.informationRow}>
                  <View style={styles.informationIcon}>
                    <Ionicons name="wallet-outline" size={18} color={colors.primary} />
                  </View>
                  <View style={styles.informationContent}>
                    <Text style={styles.informationLabel}>Chi phí dự kiến</Text>
                    <Text style={styles.informationValue} numberOfLines={1}>
                      {formatCurrency(post?.cost)}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.badgeRow}>
                {!isFieldPost && (
                  <>
                    <View style={styles.badgeChip}>
                      <Ionicons name="people-outline" size={14} color={colors.textSecondary} />
                      <Text style={styles.badgeChipText}>{currentPlayers}/{neededPlayers} người</Text>
                    </View>
                    <View style={styles.badgeChip}>
                      <Ionicons name="shield-outline" size={14} color={colors.textSecondary} />
                      <Text style={styles.badgeChipText}>{formatLevel(post?.required_level)}</Text>
                    </View>
                  </>
                )}
                {post?.contact_phone && (
                  <View style={styles.badgeChip}>
                    <Ionicons name="call-outline" size={14} color={colors.textSecondary} />
                    <Text style={styles.badgeChipText}>{post.contact_phone}</Text>
                  </View>
                )}
                <View style={styles.fieldTypeBadge}>
                  <Text style={styles.fieldTypeText}>{formatFieldType(post?.field_type)}</Text>
                </View>
              </View>

              <View style={styles.footerRow}>
                <View style={styles.reasonContainer}>
                  {item.reasons?.length > 0 && (
                    <View style={styles.reasonChip}>
                      <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
                      <Text style={styles.reasonText} numberOfLines={1}>
                        {item.reasons[0]}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.viewDetailBox}>
                  <Text style={styles.viewDetailText}>Xem chi tiết</Text>
                  <Ionicons name="arrow-forward" size={16} color={colors.primaryDark} />
                </View>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginLeft: 6,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    paddingHorizontal: spacing.lg,
    marginBottom: 12,
    marginTop: 2,
  },
  listContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 8,
  },
  card: {
    width: 300,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: "#ECF1EE",
    overflow: "hidden",
    ...shadows.card,
  },
  cardPressed: {
    opacity: 0.94,
    transform: [{ scale: 0.994 }],
  },
  topRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  postTypeBadge: {
    flexShrink: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
    flexDirection: "row",
    alignItems: "center",
  },
  postTypeText: {
    marginLeft: 5,
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: "800",
    flexShrink: 1,
  },
  matchBadge: {
    flexShrink: 1,
    backgroundColor: colors.warning,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  matchText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#fff',
  },
  cardTitle: {
    marginTop: 14,
    color: colors.text,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "900",
  },
  cardDescription: {
    marginTop: 7,
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  informationContainer: {
    marginTop: 16,
  },
  informationRow: {
    marginBottom: 11,
    flexDirection: "row",
    alignItems: "center",
  },
  informationIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  informationContent: {
    flex: 1,
  },
  informationLabel: {
    color: colors.textLight,
    fontSize: 11,
  },
  informationValue: {
    marginTop: 2,
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 14,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  badgeChip: {
    marginRight: 7,
    marginBottom: 5,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSoft,
    flexDirection: "row",
    alignItems: "center",
  },
  badgeChipText: {
    marginLeft: 4,
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: "600",
  },
  fieldTypeBadge: {
    marginLeft: "auto",
    marginBottom: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.secondary,
  },
  fieldTypeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: "800",
  },
  footerRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 14,
  },
  reasonContainer: {
    flex: 1,
    minWidth: 0,
  },
  reasonChip: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    maxWidth: "100%",
  },
  reasonText: {
    flexShrink: 1,
    color: colors.primaryDark,
    fontSize: 12,
  },
  viewDetailBox: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewDetailText: {
    color: colors.primaryDark,
    fontWeight: "700",
    fontSize: 13,
    marginRight: 4,
  }
});
