import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { Alert, BackHandler, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { formatMoney } from '@/core/format/formatters';
import { spacing, useTheme } from '@/core/theme/theme';
import { Button } from '@/core/ui/Button';

import { useCreateReservation, usePayReservation } from '../api/mutations';
import { ApiError } from '@/core/api/apiError';
import { isPaid } from '../api/types';
import { ConfirmationStep } from '../components/steps/ConfirmationStep';
import { DepartStep } from '../components/steps/DepartStep';
import { PaiementStep } from '../components/steps/PaiementStep';
import { PassagerStep } from '../components/steps/PassagerStep';
import { TronconStep } from '../components/steps/TronconStep';
import {
  BookingStep,
  isPassagerComplete,
  isTronconComplete,
  selectedMontant,
  useBookingStore,
} from '../store/bookingStore';

const STEP_TITLES: Record<BookingStep, string> = {
  troncon: 'Votre trajet',
  depart: 'Choisir un départ',
  passager: 'Vos informations',
  paiement: 'Paiement',
  termine: 'Confirmation',
};

const STEP_INDEX: Record<BookingStep, number> = {
  troncon: 1,
  depart: 2,
  passager: 3,
  paiement: 4,
  termine: 5,
};

function errorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Une erreur est survenue.';
}

/** Tunnel de réservation : orchestre les étapes au-dessus du store zustand. */
export function BookingScreen() {
  const { colors } = useTheme();
  const step = useBookingStore((s) => s.step);
  const goTo = useBookingStore((s) => s.goTo);
  const back = useBookingStore((s) => s.back);

  // Retour matériel Android : recule d'une étape (sauf 1re / confirmation).
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (step !== 'troncon' && step !== 'termine') {
        back();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [step, back]);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: STEP_TITLES[step] }} />

      {step !== 'termine' ? <ProgressBar step={step} /> : null}

      <View style={styles.body}>{renderStep(step)}</View>

      <BottomBar step={step} onNext={goTo} />
    </View>
  );
}

function renderStep(step: BookingStep) {
  switch (step) {
    case 'troncon':
      return <TronconStep />;
    case 'depart':
      return <DepartStep />;
    case 'passager':
      return <PassagerStep />;
    case 'paiement':
      return <PaiementStep />;
    case 'termine':
      return <ConfirmationStep />;
  }
}

function ProgressBar({ step }: { step: BookingStep }) {
  const { colors } = useTheme();
  const progress = STEP_INDEX[step] / 4; // 4 étapes avant la confirmation
  return (
    <View style={[styles.progressTrack, { backgroundColor: colors.surfaceAlt }]}>
      <View
        style={[
          styles.progressFill,
          { backgroundColor: colors.primary, width: `${Math.min(progress, 1) * 100}%` },
        ]}
      />
    </View>
  );
}

function BottomBar({
  step,
  onNext,
}: {
  step: BookingStep;
  onNext: (step: BookingStep) => void;
}) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const setReservation = useBookingStore((s) => s.setReservation);
  const store = useBookingStore();
  const montant = useBookingStore(selectedMontant);

  const createMut = useCreateReservation();
  const payMut = usePayReservation();
  const submitting = createMut.isPending || payMut.isPending;

  if (step === 'termine') return null;

  const submitReservation = () => {
    const { gareDepart, destination, depart, nom, contact } = store;
    if (!gareDepart || !destination || !depart) return;
    createMut.mutate(
      {
        nom: nom.trim(),
        contact: contact.trim(),
        voyage: depart.voyageId,
        montee: gareDepart.id,
        descente: destination.gare.id,
      },
      {
        onSuccess: (reservation) => {
          setReservation(reservation);
          onNext('paiement');
        },
        onError: (error) => Alert.alert('Réservation', errorMessage(error)),
      },
    );
  };

  const pay = () => {
    const reservation = store.reservation;
    const reference = reservation?.paiement?.reference;
    if (!reservation || !reference) return;
    payMut.mutate(
      { reference, code: reservation.code, contact: store.contact.trim() },
      {
        onSuccess: (refreshed) => {
          setReservation(refreshed);
          if (isPaid(refreshed)) {
            onNext('termine');
          } else {
            Alert.alert('Paiement', "Le paiement n'a pas été confirmé. Réessayez.");
          }
        },
        onError: (error) => Alert.alert('Paiement', errorMessage(error)),
      },
    );
  };

  const action = resolveAction();

  function resolveAction(): { label: string; onPress?: () => void } {
    switch (step) {
      case 'troncon':
        return {
          label: 'Continuer',
          onPress: isTronconComplete(store) ? () => onNext('depart') : undefined,
        };
      case 'depart':
        return {
          label: 'Continuer',
          onPress: store.depart ? () => onNext('passager') : undefined,
        };
      case 'passager':
        return {
          label: 'Réserver ma place',
          onPress: isPassagerComplete(store) ? submitReservation : undefined,
        };
      case 'paiement':
        return { label: `Payer ${formatMoney(montant)}`, onPress: pay };
      default:
        return { label: '' };
    }
  }

  return (
    <View
      style={[
        styles.bottomBar,
        {
          paddingBottom: insets.bottom + spacing.md,
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
      ]}
    >
      <Button
        label={action.label}
        onPress={action.onPress ?? (() => {})}
        disabled={!action.onPress}
        loading={submitting}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { flex: 1 },
  progressTrack: { height: 4, width: '100%' },
  progressFill: { height: 4 },
  bottomBar: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
