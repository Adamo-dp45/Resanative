# resanative — App mobile de réservation (Expo / React Native)

Application Expo permettant à un **client invité** (sans compte) de réserver une
place sur un trajet, de payer (simulé), puis de suivre sa réservation et de
télécharger son **bon en PDF**. Elle consomme l'**API publique** du backend
(`/api/reservation/*`, périmètre entreprise porté par `?slug=`).

> Version React Native du parcours livré aussi en Flutter (dossier `resaflutter`).

## Lancer

```bash
cp .env.example .env      # renseigner API_BASE_URL + COMPANY_SLUG
npm install
npx expo start            # puis « a » (Android), « i » (iOS) ou « w » (web)
```

Config via variables d'environnement Expo (`.env`) :

- `EXPO_PUBLIC_API_BASE_URL` : racine du backend (sans `/api`).
  `10.0.2.2` = l'hôte local vu depuis l'émulateur Android ; sur appareil
  physique, mettre l'IP LAN de la machine (`http://192.168.x.x:8000`).
- `EXPO_PUBLIC_COMPANY_SLUG` : slug de la compagnie (`entreprise.slug`).

## Stack

- **Expo SDK 57** · **expo-router** (navigation par fichiers, `src/app`) · **TypeScript strict**
- **@tanstack/react-query** — état serveur (cache, chargement, erreurs)
- **axios** — client HTTP + intercepteur d'erreurs normalisées (`ApiError`)
- **zustand** — état du tunnel de réservation
- **expo-print + expo-sharing** — bon PDF (réutilise le HTML du bon web)

## Architecture

Découpage **feature-first en couches** :

```
src/
├── app/                      # routes expo-router (écrans fins → features)
│   ├── _layout.tsx           # providers globaux (React Query, SafeArea, gestes)
│   ├── index.tsx  booking.tsx  track.tsx  history.tsx
├── core/                     # transverse (sans métier)
│   ├── config/               # env (EXPO_PUBLIC_*)
│   ├── api/                  # axios + ApiError
│   ├── query/                # QueryClient
│   ├── format/               # FCFA + dates (Intl fr)
│   ├── theme/                # couleurs light/dark, spacing
│   └── ui/                   # Screen, Button, Card, Text, SelectField, QueryBoundary…
└── features/reservation/
    ├── api/                  # types, appels axios, hooks React Query, mutations
    ├── store/                # bookingStore (zustand)
    ├── pdf/                  # génération du bon (expo-print/sharing)
    ├── components/           # StatusBadge, DepartCard, ReservationDetails, steps/…
    └── screens/              # Home, Booking, Track, History
```

Règle de dépendance : `app → features → core`. L'UI dépend de types/hooks,
jamais d'axios directement (erreurs normalisées, testable).

## Parcours

Accueil → **tunnel** (trajet → départ → passager → paiement) → confirmation
(le « bon » + PDF). Plus : **suivi** (code + téléphone) et **historique**
(téléphone). Le bon PDF est téléchargeable dès que la réservation est payée.

> ⚠️ Paiement **simulé** côté backend : l'app déclenche elle-même le webhook.
> Le branchement d'un vrai Mobile Money viendra plus tard.

## Qualité

```bash
npx tsc --noEmit     # type-check strict
npx expo lint        # ESLint
```

Après ajout/déplacement d'une route, relancer `npx expo start` régénère les
types de routes (`.expo/types`).
