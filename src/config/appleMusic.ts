/**
 * Apple Music API configuration.
 *
 * How to get a developer token:
 *   1. Sign in to https://developer.apple.com and create a MusicKit identifier
 *      (Certificates, Identifiers & Profiles → Identifiers → Music IDs).
 *   2. Create a private key for MusicKit in the same portal, download the .p8 file.
 *   3. Generate a signed JWT (ES256) on your server or locally using the key ID,
 *      team ID, and .p8 file. The token expires in up to 6 months.
 *      Reference: https://developer.apple.com/documentation/applemusicapi/generating_developer_tokens
 *   4. Paste the resulting JWT string below.
 *
 * NOTE: Do NOT commit a real token to version control — store it in an env var.
 *       For Expo, add EXPO_PUBLIC_APPLE_MUSIC_TOKEN=<token> to a .env file and
 *       replace the value below with: process.env.EXPO_PUBLIC_APPLE_MUSIC_TOKEN ?? ''
 */
export const APPLE_MUSIC_DEVELOPER_TOKEN: string =
  process.env.EXPO_PUBLIC_APPLE_MUSIC_TOKEN ?? 'YOUR_DEVELOPER_TOKEN_HERE';

/** ISO 3166-1 alpha-2 storefront (determines catalog country). */
export const APPLE_MUSIC_STOREFRONT = 'us';
