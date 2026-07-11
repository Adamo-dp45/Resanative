import { ScrollView, StyleSheet } from 'react-native';

import { formatMoney } from '@/core/format/formatters';
import { spacing } from '@/core/theme/theme';
import { SelectField } from '@/core/ui/SelectField';
import { Text } from '@/core/ui/Text';

import { useDestinations, useGares, useVilles } from '../../api/queries';
import { useBookingStore } from '../../store/bookingStore';

/** Étape 1 — choix du trajet : ville & gare de départ, puis destination. */
export function TronconStep() {
  const villeDepart = useBookingStore((s) => s.villeDepart);
  const gareDepart = useBookingStore((s) => s.gareDepart);
  const destination = useBookingStore((s) => s.destination);
  const setVilleDepart = useBookingStore((s) => s.setVilleDepart);
  const setGareDepart = useBookingStore((s) => s.setGareDepart);
  const setDestination = useBookingStore((s) => s.setDestination);

  const villes = useVilles();
  const gares = useGares(villeDepart?.id ?? null);
  const destinations = useDestinations(gareDepart?.id ?? null);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text variant="subtitle" bold>
        D&apos;où partez-vous ?
      </Text>

      <SelectField
        label="Ville de départ"
        placeholder="Choisir une ville"
        loading={villes.isFetching}
        value={villeDepart?.id ?? null}
        options={(villes.data ?? []).map((v) => ({ value: v.id, label: v.nom }))}
        onChange={(id) => {
          const ville = villes.data?.find((v) => v.id === id);
          if (ville) setVilleDepart(ville);
        }}
      />

      <SelectField
        label="Gare de départ"
        placeholder={
          villeDepart ? 'Choisir une gare' : "Choisissez d'abord une ville"
        }
        disabled={villeDepart == null}
        loading={gares.isFetching}
        value={gareDepart?.id ?? null}
        options={(gares.data ?? []).map((g) => ({ value: g.id, label: g.libelle }))}
        onChange={(id) => {
          const gare = gares.data?.find((g) => g.id === id);
          if (gare) setGareDepart(gare);
        }}
      />

      <Text variant="subtitle" bold style={styles.section}>
        Où allez-vous ?
      </Text>

      <SelectField
        label="Destination"
        placeholder={
          gareDepart ? 'Choisir une destination' : "Choisissez d'abord une gare"
        }
        disabled={gareDepart == null}
        loading={destinations.isFetching}
        value={destination?.gare.id ?? null}
        options={(destinations.data ?? []).map((d) => ({
          value: d.gare.id,
          label: `${d.gare.libelle} · ${formatMoney(d.montant)}`,
        }))}
        onChange={(id) => {
          const dest = destinations.data?.find((d) => d.gare.id === id);
          if (dest) setDestination(dest);
        }}
      />

      {destinations.data?.length === 0 && gareDepart ? (
        <Text tone="muted">Aucune destination desservie depuis cette gare.</Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.lg, padding: spacing.lg },
  section: { marginTop: spacing.sm },
});
