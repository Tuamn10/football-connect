import React, { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import {
  colors,
  layout,
  radius,
} from "../theme/theme";

export default function AppInput({
  label,
  icon,
  error,
  secureTextEntry = false,
  multiline = false,
  containerStyle,
  inputStyle,
  onFocus,
  onBlur,
  ...textInputProps
}) {
  const [focused, setFocused] = useState(false);
  const [passwordHidden, setPasswordHidden] = useState(secureTextEntry);

  const handleFocus = (event) => {
    setFocused(true);
    onFocus?.(event);
  };

  const handleBlur = (event) => {
    setFocused(false);
    onBlur?.(event);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <View
        style={[
          styles.inputWrapper,
          multiline && styles.multilineWrapper,
          focused && styles.focused,
          error && styles.errorBorder,
        ]}
      >
        {icon ? (
          <Ionicons
            name={icon}
            size={21}
            color={focused ? colors.primary : colors.textLight}
            style={multiline ? styles.multilineIcon : null}
          />
        ) : null}

        <TextInput
          {...textInputProps}
          style={[
            styles.input,
            multiline && styles.multilineInput,
            inputStyle,
          ]}
          placeholderTextColor={colors.textLight}
          secureTextEntry={secureTextEntry && passwordHidden}
          multiline={multiline}
          textAlignVertical={multiline ? "top" : "center"}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />

        {secureTextEntry ? (
          <Pressable
            onPress={() => setPasswordHidden((current) => !current)}
            hitSlop={10}
          >
            <Ionicons
              name={
                passwordHidden
                  ? "eye-off-outline"
                  : "eye-outline"
              }
              size={21}
              color={colors.textSecondary}
            />
          </Pressable>
        ) : null}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 16,
  },

  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },

  inputWrapper: {
    minHeight: layout.inputHeight,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "center",
  },

  multilineWrapper: {
    minHeight: 120,
    alignItems: "flex-start",
    paddingTop: 14,
  },

  multilineIcon: {
    marginTop: 1,
  },

  focused: {
    borderColor: colors.primary,
    borderWidth: 1.5,
  },

  errorBorder: {
    borderColor: colors.danger,
  },

  input: {
    flex: 1,
    paddingVertical: 13,
    marginLeft: 10,
    color: colors.text,
    fontSize: 15,
  },

  multilineInput: {
    minHeight: 90,
    paddingTop: 0,
  },

  errorText: {
    marginTop: 6,
    color: colors.danger,
    fontSize: 12,
  },
});
