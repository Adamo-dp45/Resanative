import { Pressable, StyleSheet, View } from 'react-native';

import { formatDateTime, formatMoney } from '@/core/format/formatters';
import { radius, spacing, useTheme } from '@/core/theme/theme';
import { Text } from '@/core/ui/Text';

import { heureEmbarquement, type Depart } from '../api/types';

interface DepartCardProps {
  depart: Depart;
  selected: boolean;
  onPress: () => void;
}

/** Carte sélectionnable d'un départ (date, places indicatives, prix). */
export function DepartCard({ depart, selected, onPress }: DepartCardProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: selected ? colors.primaryContainer : colors.surface,
          borderColor: selected ? colors.primary : colors.border,
          borderWidth: selected ? 1.5 : StyleSheet.hairlineWidth,
        },
      ]}
    >
      <Text style={styles.radio} tone={selected ? 'primary' : 'muted'}>
        {selected ? '◉' : '◯'}
      </Text>
      <View style={styles.body}>
        <Text variant="subtitle" bold>
          {formatDateTime(heureEmbarquement(depart))}
        </Text>
        <Text variant="caption" tone="muted">
          {depart.placesDisponibles} place(s) · {depart.codevoyage ?? ''}
        </Text>
      </View>
      <Text variant="subtitle" bold tone="primary">
        {formatMoney(depart.montant)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  radio: { fontSize: 18 },
  body: { flex: 1, gap: 2 },
});
