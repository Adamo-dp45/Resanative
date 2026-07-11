import {
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

import { radius, spacing, useTheme } from '../theme/theme';
import { Text } from './Text';

interface TextFieldProps extends TextInputProps {
  label: string;
  helper?: string;
}

/** Champ de saisie étiqueté, au style homogène et thématisé. */
export function TextField({ label, helper, style, ...rest }: TextFieldProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <Text variant="caption" tone="muted" style={styles.label}>
        {label}
      </Text>
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={[
          styles.input,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            color: colors.text,
          },
          style,
        ]}
        {...rest}
      />
      {helper ? (
        <Text variant="caption" tone="muted" style={styles.helper}>
          {helper}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  label: { marginLeft: spacing.xs },
  input: {
    minHeight: 52,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    fontSize: 15,
  },
  helper: { marginLeft: spacing.xs },
});
