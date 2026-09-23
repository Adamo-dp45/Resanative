import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { formatDateTime, formatMoney } from '@/core/format/formatters';

import { heureEmbarquement, isPaid, type Compagnie, type Reservation } from '../api/types';

/** Échappe le texte dynamique inséré dans le HTML du bon. */
function escapeHtml(value: string | null | undefined): string {
  if (!value) return '—';
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Construit le HTML du « bon de réservation » (ticket 80 mm), aligné sur le bon
 * web du backend. Rendu par un moteur HTML → accents et flèches gérés nativement.
 */
function buildVoucherHtml(
  reservation: Reservation,
  compagnie?: Compagnie | null,
): string {
  const titre = compagnie?.sigle ?? compagnie?.libelle ?? 'RESERVATION';
  const paid = isPaid(reservation);
  const badgeLabel = paid
    ? reservation.billetEmis
      ? 'BILLET ÉMIS'
      : 'PAYÉ'
    : 'EN ATTENTE';
  const badgeColor = paid ? '#137a3f' : '#b26a00';

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, Roboto, 'Helvetica Neue', sans-serif; color: #111; font-size: 12px; width: 80mm; padding: 8mm 6mm; }
  .center { text-align: center; }
  .sigle { font-size: 18px; font-weight: bold; letter-spacing: 1px; }
  .sub { font-size: 11px; color: #555; margin-top: 2px; }
  .title { margin-top: 8px; font-size: 13px; font-weight: bold; letter-spacing: 2px; }
  .code { margin: 10px 0; font-size: 22px; font-weight: bold; letter-spacing: 3px; text-align: center; }
  .badge { display: inline-block; border: 1.5px solid ${badgeColor}; color: ${badgeColor}; padding: 2px 10px; border-radius: 10px; font-size: 11px; font-weight: bold; }
  .hr { border-top: 1px dashed #999; margin: 10px 0; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 4px 0; vertical-align: top; font-size: 12px; }
  td.k { color: #666; }
  td.v { text-align: right; font-weight: bold; }
  .route { text-align: center; font-size: 14px; font-weight: bold; margin: 8px 0; }
  .note { margin-top: 10px; font-size: 10px; color: #444; line-height: 1.4; }
  .foot { margin-top: 12px; text-align: center; font-size: 9px; color: #999; }
</style>
</head>
<body>
  <div class="center">
    <div class="sigle">${escapeHtml(titre)}</div>
    ${compagnie?.libelle ? `<div class="sub">${escapeHtml(compagnie.libelle)}</div>` : ''}
    ${compagnie?.contact ? `<div class="sub">${escapeHtml(compagnie.contact)}</div>` : ''}
    <div class="title">BON DE RÉSERVATION</div>
  </div>

  <div class="code">${escapeHtml(reservation.code)}</div>
  <div class="center"><span class="badge">${badgeLabel}</span></div>

  <div class="hr"></div>
  <div class="route">${escapeHtml(reservation.montee)} → ${escapeHtml(reservation.descente)}</div>
  <div class="hr"></div>

  <table>
    <tr><td class="k">Passager</td><td class="v">${escapeHtml(reservation.nomclient)}</td></tr>
    <tr><td class="k">Téléphone</td><td class="v">${escapeHtml(reservation.contactclient)}</td></tr>
    <tr><td class="k">Voyage</td><td class="v">${escapeHtml(reservation.codevoyage)}</td></tr>
    <!-- Le client présentera ce bon au guichet : le numéro de départ est ce qu'on lui appellera. -->
    <tr><td class="k">N° de départ</td><td class="v">${reservation.numerodepart ?? '—'}</td></tr>
    <tr><td class="k">Départ prévu</td><td class="v">${formatDateTime(heureEmbarquement(reservation))}</td></tr>
    <tr><td class="k">Montant</td><td class="v">${formatMoney(reservation.montant)}</td></tr>
  </table>

  <div class="hr"></div>
  <div class="note">
    Présentez ce bon (code <strong>${escapeHtml(reservation.code)}</strong>) à la gare de départ pour
    retirer votre billet et obtenir un siège. Le retrait doit se faire avant l'heure limite, sans quoi
    la place est libérée (non remboursable).
  </div>
  <div class="foot">Bon généré le ${formatDateTime(new Date())}</div>
</body>
</html>`;
}

/**
 * Génère le bon PDF et ouvre la feuille système de partage/enregistrement.
 * Lève si la génération échoue ; l'appelant gère le retour utilisateur.
 */
export async function downloadVoucher(
  reservation: Reservation,
  compagnie?: Compagnie | null,
): Promise<void> {
  const html = buildVoucherHtml(reservation, compagnie);
  // 80 mm ≈ 227 pt de large ; la hauteur se pagine selon le contenu.
  const { uri } = await Print.printToFileAsync({ html, width: 227, height: 650 });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: `Bon ${reservation.code}`,
      UTI: 'com.adobe.pdf',
    });
  }
}
