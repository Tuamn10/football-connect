import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import {
  colors,
  radius,
} from "../theme/theme";

export default function EmptyState({
  icon = "football-outline",
  title = "Chưa có dữ liệu",
  description = "Hiện tại chưa có nội dung để hiển thị.",
  actionTitle,
  onAction,
}) {
  return (
    <View style={styles.container}>
      <View style={styles.iconBox}>
        <Ionicons
          name={icon}
          size={44}
          color={colors.textLight}
        />
      </View>

      <Text style={styles.title}>{title}</Text>

      <Text style={styles.description}>{description}</Text>

      {actionTitle && onAction ? (
        <Pressable style={styles.actionButton} onPress={onAction}>
          <Text style={styles.actionText}>{actionTitle}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 36,
    paddingVertical: 44,
  },

  iconBox: {
    width: 88,
    height: 88,
    borderRadius: radius.xxl,
    backgroundColor: colors.surfaceSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    marginTop: 16,
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
  },

  description: {
    marginTop: 8,
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },

  actionButton: {
    marginTop: 18,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
  },

  actionText: {
    color: colors.primaryDark,
    fontSize: 14,
    fontWeight: "800",
  },
});