import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

import { radius, spacing, useTheme } from '../theme/theme';
import { Text } from './Text';

type Variant = 'primary' | 'outline' | 'text';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  /** Glyphe optionnel (émoji ou icône texte) affiché avant le libellé. */
  icon?: string;
  style?: ViewStyle;
}

/** Bouton unifié (primaire / contour / texte) avec état de chargement. */
export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  icon,
  style,
}: ButtonProps) {
  const { colors } = useTheme();
  const isDisabled = disabled || loading;

  const background =
    variant === 'primary' ? colors.primary : 'transparent';
  const borderColor =
    variant === 'outline' ? colors.border : 'transparent';
  const textTone = variant === 'primary' ? 'onPrimary' : 'primary';

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: background,
          borderColor,
          borderWidth: variant === 'outline' ? StyleSheet.hairlineWidth : 0,
          opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? colors.onPrimary : colors.primary}
        />
      ) : (
        <View style={styles.content}>
          {icon ? (
            <Text tone={textTone} bold style={styles.icon}>
              {icon}
            </Text>
          ) : null}
          <Text tone={textTone} bold>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  icon: { fontSize: 16 },
});
