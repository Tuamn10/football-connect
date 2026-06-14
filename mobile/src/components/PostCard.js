import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import {
  formatCurrency,
  formatDateTime,
  formatFieldType,
  formatLevel,
  formatPostStatus,
  formatPostType,
} from "../utils/formatters";

import {
  colors,
  radius,
  shadows,
  spacing,
} from "../theme/theme";

function getStatusStyle(status) {
  const statusStyles = {
    open: {
      backgroundColor: colors.primaryLight,
      textColor: colors.success,
      dotColor: colors.success,
    },

    full: {
      backgroundColor: "#FEF3C7",
      textColor: "#B45309",
      dotColor: colors.warning,
    },

    cancelled: {
      backgroundColor: "#FEE2E2",
      textColor: colors.danger,
      dotColor: colors.danger,
    },

    expired: {
      backgroundColor: "#E5E7EB",
      textColor: colors.textSecondary,
      dotColor: colors.textLight,
    },
  };

  return (
    statusStyles[status] || {
      backgroundColor: colors.surfaceSoft,
      textColor: colors.textSecondary,
      dotColor: colors.textLight,
    }
  );
}

export default function PostCard({
  item,
  onPress,
}) {
  const statusStyle = getStatusStyle(item?.status);

  const neededPlayers =
    Number(item?.needed_players) || 0;

  const currentPlayers =
    Number(item?.current_players) || 0;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.postTypeBadge}>
          <Ionicons
            name="football-outline"
            size={15}
            color={colors.primaryDark}
          />

          <Text style={styles.postTypeText}>
            {formatPostType(item?.post_type)}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                statusStyle.backgroundColor,
            },
          ]}
        >
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor:
                  statusStyle.dotColor,
              },
            ]}
          />

          <Text
            style={[
              styles.statusText,
              {
                color: statusStyle.textColor,
              },
            ]}
          >
            {formatPostStatus(item?.status)}
          </Text>
        </View>
      </View>

      <Text
        style={styles.title}
        numberOfLines={2}
      >
        {item?.title || "Bài đăng bóng đá"}
      </Text>

      <Text
        style={styles.description}
        numberOfLines={2}
      >
        {item?.description ||
          "Bài đăng chưa có mô tả chi tiết."}
      </Text>

      <View style={styles.informationContainer}>
        <View style={styles.informationRow}>
          <View style={styles.informationIcon}>
            <Ionicons
              name="location-outline"
              size={18}
              color={colors.primary}
            />
          </View>

          <View style={styles.informationContent}>
            <Text style={styles.informationLabel}>
              Khu vực
            </Text>

            <Text
              style={styles.informationValue}
              numberOfLines={1}
            >
              {item?.area || "Chưa cập nhật"}
            </Text>
          </View>
        </View>

        <View style={styles.informationRow}>
          <View style={styles.informationIcon}>
            <Ionicons
              name="time-outline"
              size={18}
              color={colors.primary}
            />
          </View>

          <View style={styles.informationContent}>
            <Text style={styles.informationLabel}>
              Thời gian
            </Text>

            <Text
              style={styles.informationValue}
              numberOfLines={1}
            >
              {formatDateTime(item?.match_time)}
            </Text>
          </View>
        </View>

        <View style={styles.informationRow}>
          <View style={styles.informationIcon}>
            <Ionicons
              name="wallet-outline"
              size={18}
              color={colors.primary}
            />
          </View>

          <View style={styles.informationContent}>
            <Text style={styles.informationLabel}>
              Chi phí dự kiến
            </Text>

            <Text
              style={styles.informationValue}
              numberOfLines={1}
            >
              {formatCurrency(item?.cost)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.footerChip}>
          <Ionicons
            name="people-outline"
            size={15}
            color={colors.textSecondary}
          />

          <Text style={styles.footerChipText}>
            {currentPlayers}/{neededPlayers} người
          </Text>
        </View>

        <View style={styles.footerChip}>
          <Ionicons
            name="shield-outline"
            size={15}
            color={colors.textSecondary}
          />

          <Text style={styles.footerChipText}>
            {formatLevel(item?.required_level)}
          </Text>
        </View>

        <View style={styles.fieldTypeBadge}>
          <Text style={styles.fieldTypeText}>
            {formatFieldType(item?.field_type)}
          </Text>
        </View>
      </View>

      <View style={styles.viewDetailRow}>
        <Text style={styles.viewDetailText}>
          Xem chi tiết
        </Text>

        <Ionicons
          name="arrow-forward"
          size={17}
          color={colors.primaryDark}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: "#ECF1EE",
    ...shadows.card,
  },

  cardPressed: {
    opacity: 0.94,
    transform: [
      {
        scale: 0.994,
      },
    ],
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  postTypeBadge: {
    maxWidth: "58%",
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
  },

  statusBadge: {
    maxWidth: "40%",
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: radius.pill,
    flexDirection: "row",
    alignItems: "center",
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },

  statusText: {
    fontSize: 11,
    fontWeight: "800",
  },

  title: {
    marginTop: 14,
    color: colors.text,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "900",
  },

  description: {
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

  footer: {
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },

  footerChip: {
    marginRight: 7,
    marginBottom: 5,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceSoft,
    flexDirection: "row",
    alignItems: "center",
  },

  footerChipText: {
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

  viewDetailRow: {
    marginTop: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },

  viewDetailText: {
    marginRight: 5,
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: "800",
  },
});