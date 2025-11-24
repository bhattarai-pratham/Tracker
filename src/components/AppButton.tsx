import React from "react";
import {
  GestureResponderEvent,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { COLORS } from "../assets/colors";

type Variant = "primary" | "outline" | "ghost" | "danger" | "success";
type Size = "sm" | "md" | "lg";
type Shape = "default" | "rounded" | "circle";

interface AppButtonProps {
  children: React.ReactNode;
  onPress?: (e: GestureResponderEvent) => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
  shape?: Shape; // NEW
}

const sizeStyles = {
  sm: { paddingVertical: 6, paddingHorizontal: 12, fontSize: 14 } as const,
  md: { paddingVertical: 10, paddingHorizontal: 16, fontSize: 16 } as const,
  lg: { paddingVertical: 14, paddingHorizontal: 20, fontSize: 18 } as const,
};

const circleSize = { sm: 36, md: 44, lg: 56 } as const; // NEW

export default function AppButton({
  children,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  style,
  textStyle,
  testID,
  shape = "default", // NEW
}: AppButtonProps) {
  const s = sizeStyles[size];

  const base: ViewStyle = {
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    elevation: 2,
  };

  const variants: Record<Variant, ViewStyle> = {
    primary: { backgroundColor: COLORS.primary },
    outline: {
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: COLORS.primary,
      elevation: 0,
    },
    ghost: { backgroundColor: "transparent", elevation: 0 },
    danger: { backgroundColor: COLORS.danger },
    success: { backgroundColor: COLORS.success },
  };

  const textVariants: Record<
    Variant,
    { color: string; fontWeight?: TextStyle["fontWeight"] }
  > = {
    primary: { color: "#fff", fontWeight: "600" },
    outline: { color: COLORS.primary, fontWeight: "600" },
    ghost: { color: COLORS.primary, fontWeight: "600" },
    danger: { color: "#fff", fontWeight: "600" },
    success: { color: "#fff", fontWeight: "600" },
  };

  const disabledStyle: ViewStyle = disabled
    ? {
        opacity: 0.6,
        backgroundColor:
          variant === "outline" || variant === "ghost"
            ? "transparent"
            : COLORS.primaryDark,
      }
    : {};

  // NEW: shape styles
  const shapeStyle: ViewStyle =
    shape === "rounded"
      ? { borderRadius: 999 }
      : shape === "circle"
      ? {
          width: circleSize[size],
          height: circleSize[size],
          borderRadius: 999,
          paddingVertical: 0,
          paddingHorizontal: 0,
        }
      : {};

  const paddingStyle =
    shape === "circle"
      ? {}
      : {
          paddingVertical: s.paddingVertical,
          paddingHorizontal: s.paddingHorizontal,
        };

  return (
    <TouchableOpacity
      testID={testID}
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={[
        base,
        variants[variant],
        disabledStyle,
        paddingStyle,
        shapeStyle,
        style,
      ]}
    >
      <Text
        style={[
          {
            color: textVariants[variant].color,
            fontSize: s.fontSize,
            fontWeight: textVariants[variant].fontWeight,
          },
          textStyle,
        ]}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );
}
