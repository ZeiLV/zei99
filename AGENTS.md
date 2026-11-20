# Project Rules

- Keep catalog, authentication, VIP, reviews, and roles in Lovable Cloud; store only media URLs in records because media files are hosted on Zeilab CDN.
- New or replaced posters, banners, and episode videos must use direct HTTPS URLs on `cdn.zeilab.uz`; preserve legacy URLs already stored until an admin replaces them.
- Reuse Index for collection pages so newest and trending share catalog filters and content details.
- Render catalog navigation only outside content details; render shared navigation for other visitor pages at the app level to keep the player unobstructed.
- Keep device-local saved-title IDs in an auth-scoped shared provider, not catalog copies; this keeps all bookmark controls synchronized without moving Cloud records.
- Reuse Index for saved-title collections so filters, sorting, and detail playback follow the same catalog flow.