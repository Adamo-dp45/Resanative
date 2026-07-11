import { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { spacing, useTheme } from '../theme/theme';

interface ScreenProps {
  children: ReactNode;
  /** Enveloppe le contenu dans un ScrollView (défaut : true). */
  scroll?: boolean;
  /** Padding horizontal/vertical par défaut (désactivable pour les listes). */
  padded?: boolean;
  contentStyle?: ViewStyle;
}

/**
 * Conteneur d'écran : zone sûre + fond thématique + padding standard, avec ou
 * sans défilement. Uniformise la mise en page de tous les écrans.
 */
export function Screen({
  children,
  scroll = true,
  padded = true,
  contentStyle,
}: ScreenProps) {
  const { colors } = useTheme();
  const padding = padded ? { padding: spacing.lg } : undefined;

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
      edges={['top', 'left', 'right']}
    >
      {scroll ? (
        <ScrollView
          contentContainerStyle={[padding, contentStyle]}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flex, padding, contentStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
});
