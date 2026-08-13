import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useTheme } from "../theme/ThemeProvider";
import { Surface } from "./Surface";
import { Text } from "./Text";

type ToastVariant = "default" | "success" | "error";

interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  show: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let nextToastId = 1;
const TOAST_DURATION_MS = 2600;

/**
 * Transient, non-blocking feedback ("Treino salvo", "Post publicado") — no
 * native Alert dialogs, per the "don't interrupt with a traditional alert
 * for routine confirmations" principle. One toast at a time; a new one
 * replaces whatever's showing rather than queuing, since stacking multiple
 * confirmations is more noise than signal for this kind of message.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastItem | null>(null);

  const show = useCallback((message: string, variant: ToastVariant = "default") => {
    setToast({ id: nextToastId++, message, variant });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toast ? <ToastView key={toast.id} toast={toast} /> : null}
    </ToastContext.Provider>
  );
}

function ToastView({ toast }: { toast: ToastItem }) {
  const theme = useTheme();
  const translateY = useSharedValue(40);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const duration = theme.reducedMotion ? 0 : theme.motion.duration.standard;
    translateY.value = withTiming(0, { duration });
    opacity.value = withTiming(1, { duration });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- entrance animation runs once per toast instance (keyed by id)
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const accentColor =
    toast.variant === "success"
      ? theme.colors.feedback.success
      : toast.variant === "error"
        ? theme.colors.feedback.danger
        : theme.colors.accent.primary;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        { position: "absolute", left: theme.space.lg, right: theme.space.lg, bottom: 100, alignItems: "center" },
        animatedStyle,
      ]}
    >
      <Surface
        level="raised"
        bordered
        style={{
          paddingVertical: theme.space.sm,
          paddingHorizontal: theme.space.md,
          flexDirection: "row",
          alignItems: "center",
          gap: theme.space.sm,
          maxWidth: "100%",
        }}
      >
        <View style={{ width: 6, height: 6, borderRadius: theme.radius.pill, backgroundColor: accentColor }} />
        <Text variant="bodyStrong" style={{ flexShrink: 1 }}>
          {toast.message}
        </Text>
      </Surface>
    </Animated.View>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
