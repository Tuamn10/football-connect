import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import {
  colors,
  layout,
  radius,
  shadows,
} from "../theme/theme";

export default function PrimaryButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  icon = null,
  style,
}) {
  const isDisabled = loading || disabled;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.wrapper,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.button}
      >
        {loading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <>
            {icon}
            <Text style={[styles.text, icon && styles.textWithIcon]}>
              {title}
            </Text>
          </>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    borderRadius: radius.lg,
    overflow: "hidden",
    ...shadows.card,
  },

  button: {
    minHeight: layout.buttonHeight,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  text: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "800",
  },

  textWithIcon: {
    marginLeft: 8,
  },

  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.992 }],
  },

  disabled: {
    opacity: 0.55,
  },
});