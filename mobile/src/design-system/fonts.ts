import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import {
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from "@expo-google-fonts/space-grotesk";

export function useAppFonts() {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
  });

  return { loaded, error };
}

export {
  Inter_400Regular,
  Inter_500Medium,
  Inter_700Bold,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
};
