import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { radius, spacing, useTheme } from '../theme/theme';

interface CardProps {
  children: ReactNode;
  /** Couleur de fond alternative (ex. mise en avant). */
  background?: string;
  borderColor?: string;
  style?: ViewStyle;
}

/** Carte de contenu au style homogène (fond, coins arrondis, padding). */
export function Card({ children, background, borderColor, style }: CardProps) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: background ?? colors.surface,
          borderColor: borderColor ?? colors.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
  },
});
