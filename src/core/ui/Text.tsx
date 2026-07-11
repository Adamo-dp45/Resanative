import { StyleSheet, Text as RNText, TextProps as RNTextProps } from 'react-native';

import { useTheme } from '../theme/theme';

type Variant = 'display' | 'title' | 'subtitle' | 'body' | 'caption' | 'label';
type Tone = 'default' | 'muted' | 'primary' | 'onPrimary' | 'danger' | 'success';

interface TextProps extends RNTextProps {
  variant?: Variant;
  tone?: Tone;
  bold?: boolean;
  center?: boolean;
}

/**
 * Texte thématisé : gère typographie (variant) et couleur (tone) de façon
 * cohérente, pour éviter les styles dispersés dans les écrans.
 */
export function Text({
  variant = 'body',
  tone = 'default',
  bold,
  center,
  style,
  ...rest
}: TextProps) {
  const { colors } = useTheme();

  const toneColor: Record<Tone, string> = {
    default: colors.text,
    muted: colors.textMuted,
    primary: colors.primary,
    onPrimary: colors.onPrimary,
    danger: colors.danger,
    success: colors.success,
  };

  return (
    <RNText
      style={[
        variantStyles[variant],
        { color: toneColor[tone] },
        bold && styles.bold,
        center && styles.center,
        style,
      ]}
      {...rest}
    />
  );
}

const variantStyles = StyleSheet.create({
  display: { fontSize: 30, fontWeight: '700', letterSpacing: 0.5 },
  title: { fontSize: 22, fontWeight: '700' },
  subtitle: { fontSize: 17, fontWeight: '600' },
  body: { fontSize: 15, lineHeight: 21 },
  caption: { fontSize: 13 },
  label: { fontSize: 11, letterSpacing: 0.4 },
});

const styles = StyleSheet.create({
  bold: { fontWeight: '700' },
  center: { textAlign: 'center' },
});
