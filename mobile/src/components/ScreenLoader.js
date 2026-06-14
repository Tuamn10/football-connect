import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import {
  colors,
  radius,
} from "../theme/theme";

export default function ScreenLoader({
  message = "Đang tải dữ liệu...",
}) {
  return (
    <View style={styles.container}>
      <View style={styles.iconBox}>
        <Ionicons
          name="football-outline"
          size={40}
          color={colors.primary}
        />
      </View>

      <ActivityIndicator
        size="large"
        color={colors.primary}
        style={styles.indicator}
      />

      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 300,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },

  iconBox: {
    width: 82,
    height: 82,
    borderRadius: radius.xxl,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  indicator: {
    marginTop: 18,
  },

  message: {
    marginTop: 12,
    color: colors.textSecondary,
    fontSize: 14,
  },
});
