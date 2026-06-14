import React from "react";
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { colors } from "../theme/theme";

export default function AppLoadingScreen() {
  return (
    <LinearGradient
      colors={[
        colors.primaryDark,
        "#064E3B",
        colors.secondary,
      ]}
      style={styles.container}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.primaryDark}
      />

      <View style={styles.logoCircle}>
        <Ionicons
          name="football"
          size={58}
          color={colors.white}
        />
      </View>

      <Text style={styles.brandName}>
        FOOTBALL{" "}
        <Text style={styles.brandAccent}>CONNECT</Text>
      </Text>

      <Text style={styles.slogan}>
        Kết nối đam mê bóng đá phong trào
      </Text>

      <ActivityIndicator
        size="large"
        color={colors.white}
        style={styles.indicator}
      />

      <Text style={styles.loadingText}>
        Đang khởi tạo ứng dụng...
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  logoCircle: {
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },

  brandName: {
    marginTop: 24,
    color: colors.white,
    fontSize: 27,
    fontWeight: "900",
    fontStyle: "italic",
    letterSpacing: 0.5,
  },

  brandAccent: {
    color: "#57DB84",
  },

  slogan: {
    marginTop: 9,
    color: "rgba(255,255,255,0.76)",
    fontSize: 13,
    textAlign: "center",
  },

  indicator: {
    marginTop: 36,
  },

  loadingText: {
    marginTop: 12,
    color: "rgba(255,255,255,0.68)",
    fontSize: 12,
  },
});