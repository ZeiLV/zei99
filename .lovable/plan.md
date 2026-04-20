
# ZEI DUBBING — Premium VIP Media Portal

A single-page Uzbek-language anime/media portal with a cinematic intro, neon-on-black aesthetic, custom Google Drive video player, VIP gating, and a hidden admin dashboard.

## 1. Visual System
- **Palette**: Matte black `#000000`, neon blue `#00E5FF` accents, white `#FFFFFF` text, soft inner glows + outer neon shadows.
- **Surfaces**: Glassmorphism cards (`backdrop-blur`, 1px neon-blue border at low opacity, subtle gradient).
- **Typography**: Modern geometric sans (e.g. Space Grotesk / Orbitron for the logo, Inter for body).
- **Motion**: Smooth fade/scale transitions, neon pulse on interactive elements, liquid dissolves between major scenes.
- **Language**: Uzbek throughout (e.g. "Qidirish", "Epizodlar", "VIP Obuna Bo'ling").

## 2. Cinematic Intro (~5s, plays once per session)
1. Pure black void.
2. Thin neon horizontal loading bar fills 0 → 100%.
3. "ZEI DUBBING" assembles via wireframe/hologram lines snapping into solid neon letters with glow.
4. Typewriter line: *"Zei Dubbing ga xush kelibsiz"*.
5. Liquid dissolve into the main content grid.
- Skippable on tap; replays only once (stored in `sessionStorage`).

## 3. Header (Fixed)
- Left: "ZEI DUBBING" neon logo (glow on hover).
- Right: Search icon that expands inline into a glassmorphism search field, filtering the grid live by title/genre.
- **Hidden admin trigger**: long-press (≥1.2s) the logo → glassmorphism modal with single password field. Correct password silently signs into a hidden Supabase admin account and routes to `/admin`.

## 4. Home Grid
- Responsive grid of clean **9:16 vertical posters** (2 cols mobile → up to 6 cols desktop).
- Hover/tap: poster lifts with neon glow, title fades in.
- No sliders, no carousels, no bottom nav.
- Tap poster → content detail view.

## 5. Content Detail View
- Full-width banner with dark gradient overlay.
- Title, genres (neon chips), description.
- Episode list as glass cards: number, title, VIP badge if locked.
- Selecting an episode opens the player view.

## 6. Premium Video Player
- **Source**: Google Drive share links converted to a streamable URL via the player (extracts file ID, uses Drive's preview/stream endpoint).
- **Frame**: Neon-blue glossy border with pulsating outer glow.
- **Controls**: Glassmorphism bar — play/pause, smooth volume slider, time scrubber, quality labels (720p / 1080p / 4K, cosmetic), fullscreen.
- **Gestures**:
  - Double-tap right 20% → +5s skip with neon ">> 5s" overlay.
  - Double-tap left 20% → −5s rewind with neon "<< 5s" overlay.
- **Buffering**: Custom neon spinning ring loader.
- **VIP Lock**: If `is_vip = true` and viewer is not VIP → player is blurred, overlay shows *"VIP Obuna Bo'ling"* CTA linking to `https://t.me/m/QoYHq2A0Nzgy`. No preview — instant lock.

## 7. Data Model (Lovable Cloud)
- **content**: id, title, description, genre (text[]), poster_url, banner_url, created_at.
- **episodes**: id, content_id (FK), episode_number, title, gdrive_url, is_vip (bool), created_at.
- **user_roles**: id, user_id, role (`admin` enum) — used for admin gating via a `has_role()` security-definer function.
- **RLS**:
  - Public read on `content` and `episodes`.
  - Insert/update/delete on `content`, `episodes`, `user_roles` restricted to `admin` role.

## 8. Hidden Admin Access (Secure)
- A pre-provisioned hidden Supabase user (admin) with the `admin` role in `user_roles`.
- Long-press logo → password modal. On password match (`ZEI99`), the app silently calls `signInWithPassword` using the hidden admin credentials stored as Cloud secrets, then routes to `/admin`.
- `/admin` route is guarded: requires an active session **and** verified `admin` role via `has_role()`. Unauthorized visits redirect home.
- Logout button in admin clears the session.

## 9. Admin Dashboard (`/admin`)
- Glassmorphism layout matching the main app.
- **Content manager**: list all titles; create/edit/delete with fields for Title, Description, Genres (manual text input, comma-separated), Poster URL, Banner URL.
- **Episodes manager**: per-content episode list; add/edit/delete with Episode #, Title, Google Drive URL, VIP toggle switch.
- **Freemium pattern**: easy to mark Episode 1 free and the rest VIP via the toggle.
- All writes via Supabase client; RLS ensures only the admin session can mutate.

## 10. Routing
- `/` — Intro → home grid → content detail → player (all in one page with smooth transitions).
- `/admin` — Protected admin dashboard.
- `*` — NotFound.

## 11. Out of Scope (this build)
- End-user signup/login (none — VIP unlock is via Telegram link only).
- Payment processing (handled externally on Telegram).
- Real DRM / quality switching (quality labels are cosmetic as specified).
