import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

import AppInput from "../../components/AppInput";
import PrimaryButton from "../../components/PrimaryButton";
import { useAuth } from "../../context/AuthContext";
import { getApiErrorMessage } from "../../utils/apiError";
import {
  colors,
  radius,
  shadows,
  spacing,
} from "../../theme/theme";

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const validateForm = () => {
    let valid = true;

    setEmailError("");
    setPasswordError("");

    if (!email.trim()) {
      setEmailError("Vui lòng nhập địa chỉ email.");
      valid = false;
    } else if (!email.includes("@")) {
      setEmailError("Địa chỉ email chưa hợp lệ.");
      valid = false;
    }

    if (!password) {
      setPasswordError("Vui lòng nhập mật khẩu.");
      valid = false;
    } else if (password.length < 6) {
      setPasswordError("Mật khẩu phải có ít nhất 6 ký tự.");
      valid = false;
    }

    return valid;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      await login(
        email.trim().toLowerCase(),
        password
      );
    } catch (error) {
      Alert.alert(
        "Đăng nhập thất bại",
        getApiErrorMessage(
          error,
          "Email hoặc mật khẩu không chính xác."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[
        colors.primaryDark,
        "#064E3B",
        colors.secondary,
      ]}
      style={styles.background}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.primaryDark}
      />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : undefined
          }
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.brandArea}>
              <View style={styles.logoCircle}>
                <Ionicons
                  name="football"
                  size={46}
                  color={colors.white}
                />
              </View>

              <Text style={styles.brandName}>
                FOOTBALL{" "}
                <Text style={styles.brandAccent}>
                  CONNECT
                </Text>
              </Text>

              <Text style={styles.brandDescription}>
                Kết nối cầu thủ, tìm kèo và khám phá
                sân bóng quanh bạn
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.title}>
                Xin chào trở lại! 👋
              </Text>

              <Text style={styles.subtitle}>
                Đăng nhập để tiếp tục hành trình
                bóng đá của bạn
              </Text>

              <View style={styles.form}>
                <AppInput
                  label="Địa chỉ email"
                  icon="mail-outline"
                  placeholder="Nhập email của bạn"
                  value={email}
                  onChangeText={(value) => {
                    setEmail(value);
                    setEmailError("");
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  error={emailError}
                />

                <AppInput
                  label="Mật khẩu"
                  icon="lock-closed-outline"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChangeText={(value) => {
                    setPassword(value);
                    setPasswordError("");
                  }}
                  secureTextEntry
                  error={passwordError}
                  onSubmitEditing={handleLogin}
                  returnKeyType="done"
                />

                <View style={styles.optionsRow}>
                  <View style={styles.rememberRow}>
                    <Ionicons
                      name="checkmark-circle"
                      size={19}
                      color={colors.primary}
                    />

                    <Text style={styles.rememberText}>
                      Ghi nhớ đăng nhập
                    </Text>
                  </View>

                  <Pressable onPress={() => navigation.navigate("ForgotPassword")}>
                    <Text style={styles.forgotText}>
                      Quên mật khẩu?
                    </Text>
                  </Pressable>
                </View>

                <PrimaryButton
                  title="Đăng nhập"
                  loading={loading}
                  disabled={loading}
                  onPress={handleLogin}
                  icon={
                    <Ionicons
                      name="log-in-outline"
                      size={21}
                      color={colors.white}
                    />
                  }
                />

                <View style={styles.dividerRow}>
                  <View style={styles.divider} />
                  <Text style={styles.dividerText}>
                    hoặc
                  </Text>
                  <View style={styles.divider} />
                </View>

                <Pressable
                  style={styles.registerRow}
                  onPress={() =>
                    navigation.navigate("Register")
                  }
                >
                  <Text
                    style={styles.registerDescription}
                  >
                    Chưa có tài khoản?
                  </Text>

                  <Text style={styles.registerLink}>
                    {" "}Đăng ký ngay
                  </Text>
                </Pressable>
              </View>
            </View>

            <Text style={styles.footerText}>
              Football Connect • Kết nối cộng đồng
              bóng đá phong trào
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  background: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 30,
  },

  brandArea: {
    alignItems: "center",
    marginBottom: 25,
  },

  logoCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  brandName: {
    color: colors.white,
    fontSize: 25,
    fontWeight: "900",
    fontStyle: "italic",
  },

  brandAccent: {
    color: "#57DB84",
  },

  brandDescription: {
    maxWidth: 310,
    marginTop: 8,
    color: "rgba(255,255,255,0.76)",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xxl,
    ...shadows.card,
  },

  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "900",
  },

  subtitle: {
    marginTop: 7,
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },

  form: {
    marginTop: 24,
  },

  optionsRow: {
    marginTop: -2,
    marginBottom: 21,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  rememberText: {
    marginLeft: 6,
    color: colors.textSecondary,
    fontSize: 13,
  },

  forgotText: {
    color: colors.primaryDark,
    fontSize: 13,
    fontWeight: "700",
  },

  dividerRow: {
    marginVertical: 22,
    flexDirection: "row",
    alignItems: "center",
  },

  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },

  dividerText: {
    paddingHorizontal: 12,
    color: colors.textLight,
    fontSize: 13,
  },

  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
  },

  registerDescription: {
    color: colors.textSecondary,
  },

  registerLink: {
    color: colors.primaryDark,
    fontWeight: "800",
  },

  footerText: {
    marginTop: 25,
    color: "rgba(255,255,255,0.62)",
    fontSize: 12,
    textAlign: "center",
  },
});