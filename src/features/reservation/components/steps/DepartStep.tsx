import { FlatList, StyleSheet, View } from 'react-native';

import { spacing } from '@/core/theme/theme';
import { EmptyView } from '@/core/ui/StateView';
import { QueryBoundary } from '@/core/ui/QueryBoundary';

import { useDeparts } from '../../api/queries';
import { useBookingStore } from '../../store/bookingStore';
import { DepartCard } from '../DepartCard';

/** Étape 2 — sélection d'un départ daté sur le tronçon choisi. */
export function DepartStep() {
  const gareDepart = useBookingStore((s) => s.gareDepart);
  const destination = useBookingStore((s) => s.destination);
  const selectedDepart = useBookingStore((s) => s.depart);
  const setDepart = useBookingStore((s) => s.setDepart);

  const departs = useDeparts(
    gareDepart?.id ?? null,
    destination?.gare.id ?? null,
  );

  return (
    <QueryBoundary query={departs}>
      {(list) =>
        list.length === 0 ? (
          <EmptyView
            icon="🚍"
            message="Aucun départ réservable sur ce trajet pour le moment."
          />
        ) : (
          <FlatList
            data={list}
            keyExtractor={(item) => String(item.voyageId)}
            contentContainerStyle={styles.list}
            ItemSeparatorComponent={() => <View style={styles.sep} />}
            renderItem={({ item }) => (
              <DepartCard
                depart={item}
                selected={selectedDepart?.voyageId === item.voyageId}
                onPress={() => setDepart(item)}
              />
            )}
          />
        )
      }
    </QueryBoundary>
  );
}

const styles = StyleSheet.create({
  list: { padding: spacing.lg },
  sep: { height: spacing.md },
});
