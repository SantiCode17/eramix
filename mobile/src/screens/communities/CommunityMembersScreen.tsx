import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, FlatList, ActivityIndicator, Image } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ScreenBackground } from "@/design-system/components";
import { colors, typography, spacing, radii, borders } from "@/design-system/tokens";
import { getCommunityMembers } from "@/api/communities";
import type { CommunityMemberPreview } from "@/types/communities";

type RouteType = RouteProp<{ CommunityMembers: { communityId: number } }, "CommunityMembers">;

export default function CommunityMembersScreen(): React.JSX.Element {
  const route = useRoute<RouteType>();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { communityId } = route.params;

  const [members, setMembers] = useState<CommunityMemberPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCommunityMembers(communityId)
      .then(setMembers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [communityId]);

  return (
    <ScreenBackground>
      <View style={{ flex: 1, paddingTop: insets.top }}>
        <View style={st.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </Pressable>
          <Text style={st.title}>Miembros</Text>
          <View style={{ width: 24 }} />
        </View>

        {loading ? (
          <ActivityIndicator color={colors.eu.star} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={members}
            keyExtractor={item => String(item.userId)}
            contentContainerStyle={st.list}
            renderItem={({ item }) => (
              <View style={st.memberItem}>
                {item.profilePhotoUrl ? (
                  <Image source={{ uri: item.profilePhotoUrl }} style={st.avatar} />
                ) : (
                  <View style={st.avatarFallback}>
                    <Text style={st.avatarInitial}>{item.firstName?.charAt(0) || "U"}</Text>
                  </View>
                )}
                <Text style={st.memberName}>{item.firstName} {item.lastName}</Text>
              </View>
            )}
            ListEmptyComponent={
              <Text style={st.emptyText}>No hay miembros que mostrar.</Text>
            }
          />
        )}
      </View>
    </ScreenBackground>
  );
}

const st = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: borders.hairline,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  title: {
    fontFamily: typography.families.heading,
    fontSize: typography.sizes.h4.fontSize,
    color: colors.text.primary,
  },
  list: {
    padding: spacing.lg,
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    borderBottomWidth: borders.hairline,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: spacing.md,
  },
  avatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  avatarInitial: {
    fontFamily: typography.families.heading,
    fontSize: 20,
    color: colors.eu.star,
  },
  memberName: {
    fontFamily: typography.families.bodyMedium,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.primary,
  },
  emptyText: {
    fontFamily: typography.families.body,
    fontSize: typography.sizes.body.fontSize,
    color: colors.text.secondary,
    textAlign: "center",
    marginTop: 40,
  }
});
