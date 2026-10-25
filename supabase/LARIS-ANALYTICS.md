# LARIS analytics

Project: zanzicore-prod (`qmnpwinlvewbnjbruril`). This integration uses only isolated `laris_*` tables and functions. It does not read existing application accounts or business data.

The browser sends action names, a random browser token, language and viewport category to the `laris-analytics` Edge Function. The function hashes the token before storage. No CV/letter text, photo, phone, email, date of birth or gender is accepted. A name is accepted only in a separate explicit consent request. Withdrawing consent clears that stored name. Importing another profile resets name consent.

Counts represent browser/device identifiers and self-reported actions, not verified people. One generation creates separate CV and letter events. A new letter wording adds one letter event; a style/language change does not. Print events mean opening Print/PDF, not a verified download. Email events mean a click, not sending or delivery. Offline events retain their UUID and retry; received time is the reporting timestamp. The database ignores repeated event UUIDs and caps events per device/day.

`laris-analytics.sql` corresponds to migration `add_isolated_laris_usage_analytics`. RLS is enabled and all table/RPC permissions are revoked from anon/authenticated. Only the Edge Function's built-in service-role credential can call these RPCs. The public config contains a public anon key only. The function retains platform JWT verification and permits the production custom domain, the project's public vercel.app alias and the fixed local test origin.

Admin page: `/careers/laris/admin/`. Its high-entropy access code is kept in page memory only and is never committed. The database stores the SHA-256 digest in `laris_admin_access` (`name = 'owner'`). Provision/rotate the code with a securely generated 32-byte random value; update only the digest through a trusted administrative channel, and deliver the code privately. No existing Supabase users are needed or queried. There is no public account-registration flow for analytics.

The dashboard has date filters, totals, a consented-name activity list, pagination and CSV export of displayed rows. CSV fields protect against formula injection. Untrusted names are inserted as text, not HTML. The admin route and its API responses are not cached by the service worker.

Verified against the real endpoint and browser UI: event collection, no name before consent, consent/revocation, duplicate-delivery protection, rejected extra personal fields, admin code rejection/acceptance, CSV export, mobile layout, language toggle, offline queue synchronization, opt-out and clearing dashboard data on logout. Test records are removed by their synthetic device hashes after validation.
