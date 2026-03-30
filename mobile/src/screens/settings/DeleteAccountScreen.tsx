import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import {
  GlassInput,
  GlassButton,
  GlassCard,
  Header,
} from "@/design-system/components";
import { colors, typography, spacing } from "@/design-system/tokens";
import { accountApi } from "@/api";
import { useAuthStore } from "@/store";

export default function DeleteAccountScreen(): React.JSX.Element {
  const navigation = useNavigation();
  const clearSession = useAuthStore((s) => s.clearSession);
  const [password, setPassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = useCallback(async () => {
    if (!password.trim()) {
      Alert.alert("Error", "Introduce tu contraseña para confirmar");
      return;
    }

    Alert.alert(
      "⚠️ Eliminar cuenta",
      "Esta acción es IRREVERSIBLE. Se eliminarán todos tus datos, fotos, amigos y mensajes. ¿Estás absolutamente seguro?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sí, eliminar mi cuenta",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            try {
              await accountApi.deleteAccount(password);
              clearSession();
            } catch (error: unknown) {
              const message =
                error instanceof Error
                  ? error.message
                  : "Error al eliminar cuenta";
              Alert.alert("Error", message);
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ],
    );
  }, [password, clearSession]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.background.start, colors.background.end]}
        style={StyleSheet.absoluteFill}
      />

      <Header title="Eliminar cuenta" onBack={() => navigation.goBack()} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <View style={styles.content}>
          {/* Warning card */}
          <GlassCard variant="prominent" style={styles.warningCard}>
            <Text style={styles.warningEmoji}>⚠️</Text>
            <Text style={styles.warningTitle}>Zona peligrosa</Text>
            <Text style={styles.warningText}>
              Al eliminar tu cuenta se borrarán permanentemente:
            </Text>
            <View style={styles.warningList}>
              <Text style={styles.warningItem}>• Tu perfil y fotos</Text>
              <Text style={styles.warningItem}>• Todos tus amigos</Text>
              <Text style={styles.warningItem}>• Historial de chat</Text>
              <Text style={styles.warningItem}>• Eventos creados</Text>
              <Text style={styles.warningItem}>
                • Todas las interacciones
              </Text>
            </View>
          </GlassCard>

          {/* Password confirmation */}
          <GlassCard variant="surface" style={styles.formCard}>
            <Text style={styles.formLabel}>
              Confirma tu contraseña para continuar:
            </Text>
            <GlassInput
              label="Contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </GlassCard>

          <GlassButton
            title="Eliminar mi cuenta permanentemente"
            variant="secondary"
            onPress={handleDelete}
            loading={isDeleting}
            disabled={!password.trim()}
            style={styles.deleteButton}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    justifyContent: "center",
  },
  warningCard: {
    alignItems: "center",
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(244,67,54,0.4)",
  },
  warningEmoji: { fontSize: 48, marginBottom: spacing.sm },
  warningTitle: {
    fontFamily: typography.families.heading,
    fontSize: typography.sizes.h3.fontSize,
    color: colors.status.error,
    marginBottom: spacing.sm,
  },
  warningText: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.secondary,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  warningList: { alignSelf: "flex-start" },
  warningItem: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  formCard: { marginBottom: spacing.lg },
  formLabel: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.caption.fontSize,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  deleteButton: {
    backgroundColor: "rgba(244,67,54,0.2)",
    borderWidth: 1,
    borderColor: colors.status.error,
  },
});
