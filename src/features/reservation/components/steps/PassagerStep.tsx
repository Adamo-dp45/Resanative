import { ScrollView, StyleSheet } from 'react-native';

import { spacing } from '@/core/theme/theme';
import { Text } from '@/core/ui/Text';
import { TextField } from '@/core/ui/TextField';

import { useBookingStore } from '../../store/bookingStore';
import { TripSummary } from '../TripSummary';

/** Étape 3 — identité du passager (nom + téléphone), avec récap du trajet. */
export function PassagerStep() {
  const nom = useBookingStore((s) => s.nom);
  const contact = useBookingStore((s) => s.contact);
  const setPassenger = useBookingStore((s) => s.setPassenger);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <TripSummary />

      <Text variant="subtitle" bold style={styles.title}>
        Vos informations
      </Text>

      <TextField
        label="Nom complet"
        value={nom}
        onChangeText={(text) => setPassenger(text, contact)}
        autoCapitalize="words"
        placeholder="Awa Koné"
      />

      <TextField
        label="Téléphone"
        value={contact}
        onChangeText={(text) => setPassenger(nom, text)}
        keyboardType="phone-pad"
        placeholder="07 00 00 00 00"
        helper="Sert à retrouver et payer votre réservation"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.lg, padding: spacing.lg },
  title: { marginTop: spacing.sm },
});
