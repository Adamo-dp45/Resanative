/**
 * Formatage localisé (fr) des montants et dates. S'appuie sur `Intl` (présent
 * dans Hermes) avec un repli défensif si l'API n'est pas disponible.
 */

let moneyFormatter: Intl.NumberFormat | null = null;
let dateTimeFormatter: Intl.DateTimeFormat | null = null;

try {
  moneyFormatter = new Intl.NumberFormat('fr-FR');
  dateTimeFormatter = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
} catch {
  moneyFormatter = null;
  dateTimeFormatter = null;
}

/** Montant en francs CFA, ex. `5 000 FCFA`. */
export function formatMoney(amount: number | null | undefined): string {
  if (amount == null) return '—';
  const formatted = moneyFormatter
    ? moneyFormatter.format(amount)
    : String(amount);
  return `${formatted} FCFA`;
}

/** Date + heure courte, ex. `lun. 14 juil. 08:30`. */
export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return dateTimeFormatter ? dateTimeFormatter.format(date) : date.toISOString();
}
