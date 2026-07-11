import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '@/core/theme/theme';
import { Button } from '@/core/ui/Button';
import { QueryBoundary } from '@/core/ui/QueryBoundary';
import { Screen } from '@/core/ui/Screen';
import { TextField } from '@/core/ui/TextField';

import { useSuivi } from '../api/queries';
import { ReservationDetails } from '../components/ReservationDetails';

/** Suivi d'une réservation par code + téléphone. */
export function TrackScreen() {
  const [code, setCode] = useState('');
  const [contact, setContact] = useState('');
  const [query, setQuery] = useState<{ code: string; contact: string } | null>(
    null,
  );

  const suivi = useSuivi(query?.code ?? '', query?.contact ?? '', query != null);

  const submit = () => {
    if (code.trim() && contact.trim().length >= 6) {
      setQuery({ code: code.trim(), contact: contact.trim() });
    }
  };

  return (
    <Screen>
      <View style={styles.form}>
        <TextField
          label="Code de réservation"
          value={code}
          onChangeText={setCode}
          autoCapitalize="characters"
          placeholder="RES-2026-42"
        />
        <TextField
          label="Téléphone"
          value={contact}
          onChangeText={setContact}
          keyboardType="phone-pad"
          placeholder="07 00 00 00 00"
        />
        <Button label="Rechercher" icon="🔎" onPress={submit} />
      </View>

      {query ? (
        <View style={styles.result}>
          <QueryBoundary query={suivi}>
            {(reservation) => <ReservationDetails reservation={reservation} />}
          </QueryBoundary>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.lg },
  result: { marginTop: spacing.xl },
});
