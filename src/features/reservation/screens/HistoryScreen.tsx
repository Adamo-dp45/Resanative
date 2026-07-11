import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { spacing } from '@/core/theme/theme';
import { Button } from '@/core/ui/Button';
import { QueryBoundary } from '@/core/ui/QueryBoundary';
import { Screen } from '@/core/ui/Screen';
import { EmptyView } from '@/core/ui/StateView';
import { TextField } from '@/core/ui/TextField';

import { useHistorique } from '../api/queries';
import { ReservationDetails } from '../components/ReservationDetails';

/** Historique des réservations d'un client, retrouvé par son téléphone. */
export function HistoryScreen() {
  const [contact, setContact] = useState('');
  const [query, setQuery] = useState<string | null>(null);

  const history = useHistorique(query ?? '', query != null);

  const submit = () => {
    if (contact.trim().length >= 6) setQuery(contact.trim());
  };

  return (
    <Screen scroll={false}>
      <View style={styles.form}>
        <TextField
          label="Votre téléphone"
          value={contact}
          onChangeText={setContact}
          keyboardType="phone-pad"
          placeholder="07 00 00 00 00"
        />
        <Button label="Rechercher" icon="🔎" onPress={submit} />
      </View>

      <View style={styles.results}>
        {query == null ? (
          <EmptyView
            icon="🕘"
            message="Entrez votre téléphone pour retrouver vos réservations."
          />
        ) : (
          <QueryBoundary query={history}>
            {(list) =>
              list.length === 0 ? (
                <EmptyView message="Aucune réservation trouvée pour ce numéro." />
              ) : (
                <FlatList
                  data={list}
                  keyExtractor={(item) => item.code}
                  contentContainerStyle={styles.list}
                  ItemSeparatorComponent={() => <View style={styles.sep} />}
                  renderItem={({ item }) => (
                    <ReservationDetails reservation={item} />
                  )}
                />
              )
            }
          </QueryBoundary>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.lg },
  results: { flex: 1, marginTop: spacing.lg },
  list: { paddingBottom: spacing.xl },
  sep: { height: spacing.lg },
});
