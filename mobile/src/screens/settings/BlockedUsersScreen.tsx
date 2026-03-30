import React, { useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import {
  GlassCard,
  Header,
  LoadingSpinner,
  EmptyState,
} from "@/design-system/components";
import { colors, typography, spacing, radii } from "@/design-system/tokens";
import { useProfileStore } from "@/store";
import type { BlockedUser } from "@/types";

export default function BlockedUsersScreen(): React.JSX.Element {
  const navigation = useNavigation();
  const { blockedUsers, isLoadingBlocked, fetchBlockedUsers, unblockUser } =
    useProfileStore();

  useEffect(() => {
    fetchBlockedUsers();
  }, [fetchBlockedUsers]);

  const handleUnblock = useCallback(
    (user: BlockedUser) => {
      Alert.alert(
        "Desbloquear usuario",
        `¿Desbloquear a ${user.receiverFirstName} ${user.receiverLastName}?`,
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Desbloquear",
            onPress: async () => {
              try {
                await unblockUser(user.receiverId);
              } catch (error: unknown) {
                const message =
                  error instanceof Error
                    ? error.message
                    : "Error al desbloquear";
                Alert.alert("Error", message);
              }
            },
          },
        ],
      );
    },
    [unblockUser],
  );

  const renderItem = useCallback(
    ({ item }: { item: BlockedUser }) => (
      <GlassCard variant="surface" style={styles.card}>
        <View style={styles.row}>
          {item.receiverProfilePhotoUrl ? (
            <Image
              source={{ uri: item.receiverProfilePhotoUrl }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarInitial}>
                {item.receiverFirstName?.[0]?.toUpperCase() ?? "?"}
              </Text>
            </View>
          )}
          <View style={styles.info}>
            <Text style={styles.name}>
              {item.receiverFirstName} {item.receiverLastName}
            </Text>
          </View>
          <Pressable
            style={styles.unblockBtn}
            onPress={() => handleUnblock(item)}
          >
            <Text style={styles.unblockText}>Desbloquear</Text>
          </Pressable>
        </View>
      </GlassCard>
    ),
    [handleUnblock],
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.background.start, colors.background.end]}
        style={StyleSheet.absoluteFill}
      />

      <Header
        title="Usuarios bloqueados"
        onBack={() => navigation.goBack()}
      />

      {isLoadingBlocked && blockedUsers.length === 0 ? (
        <View style={styles.loadingContainer}>
          <LoadingSpinner size={48} />
        </View>
      ) : (
        <FlatList
          data={blockedUsers}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <EmptyState
              icon="🕊️"
              title="Sin bloqueos"
              message="No tienes usuarios bloqueados"
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  card: { marginBottom: spacing.sm },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: spacing.md,
  },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.eu.deep,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  avatarInitial: {
    fontFamily: typography.families.subheading,
    fontSize: 18,
    color: colors.text.primary,
  },
  info: { flex: 1 },
  name: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.primary,
  },
  unblockBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.full,
    borderWidth: 1,
    borderColor: colors.status.warning,
    backgroundColor: "rgba(255,152,0,0.1)",
  },
  unblockText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.small.fontSize,
    color: colors.status.warning,
  },
});
