import React from "react";
import { Pressable, Share, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { StackScreenProps } from "@react-navigation/stack";
import { useQuery } from "@tanstack/react-query";

import { ScreenBackground } from "@/design-system";
import { colors, radii, spacing, typography } from "@/design-system/tokens";
import { FlipUserCard, FLIP_CARD_HEIGHT } from "@/screens/discover/components";
import type { ProfileStackParamList } from "@/types";
import { useMyProfile } from "@/hooks/useProfileQuery";
import { toProfileCardUser } from "../utils/profileCardUser";
import { getProfileCardSettings } from "../data/cardSettings";

type Props = StackScreenProps<ProfileStackParamList, "AugmentedProfile">;

export default function AugmentedProfileScreenV2({ navigation }: Props): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const profileQuery = useMyProfile();
  const cardSettingsQuery = useQuery({ queryKey: ["profileCardSettings"], queryFn: getProfileCardSettings });

  const cardUser = toProfileCardUser(profileQuery.data);

  const onShare = async () => {
    await Share.share({
      message: `Perfil de ${cardUser.firstName} ${cardUser.lastName} en Eramix`,
    });
  };

  return (
    <ScreenBackground>
      <View style={[s.header, { paddingTop: insets.top + 8 }]}> 
        <Pressable style={s.headerBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={20} color={colors.text.primary} />
        </Pressable>
        <Text style={s.headerTitle}>Vista holográfica</Text>
        <Pressable style={s.headerBtn} onPress={() => navigation.navigate("CardCustomize")}>
          <Ionicons name="color-palette-outline" size={20} color={colors.eu.star} />
        </Pressable>
      </View>

      <View style={s.content}>
        <View style={[s.frame, { borderColor: cardSettingsQuery.data?.accentColor ?? "rgba(255,215,0,0.45)" }]}>
          <View style={s.cardWrap}>
            <FlipUserCard user={cardUser} />
          </View>
        </View>

        {!!cardSettingsQuery.data?.headline?.trim() && (
          <Text style={[s.headline, { color: cardSettingsQuery.data.accentColor }]}>{cardSettingsQuery.data.headline}</Text>
        )}

        <Pressable style={s.shareBtn} onPress={onShare}>
          <Ionicons name="share-social-outline" size={16} color="#0A1628" />
          <Text style={s.shareText}>Compartir perfil</Text>
        </Pressable>
      </View>
    </ScreenBackground>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  headerTitle: {
    fontFamily: typography.families.heading,
    fontSize: 18,
    color: colors.text.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  frame: {
    width: "100%",
    borderRadius: radii.xl,
    borderWidth: 1.5,
    padding: 6,
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  cardWrap: {
    width: "100%",
    height: FLIP_CARD_HEIGHT,
  },
  headline: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 14,
  },
  shareBtn: {
    borderRadius: radii.full,
    backgroundColor: colors.eu.star,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  shareText: {
    fontFamily: typography.families.bodyMedium,
    fontSize: 13,
    color: "#0A1628",
  },
});
