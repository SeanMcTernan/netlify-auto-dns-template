// State store backed by Netlify DB, accessed via the official @netlify/database
// driver. The connection string is provisioned and injected automatically — no
// manual config. Schema lives in netlify/database/migrations/ and is applied on
// deploy, so there is no runtime DDL here.

import { getDatabase } from "@netlify/database";

export type SiteAction = "seeded" | "assigned" | "skipped_existing_domain";

// Lazily created: don't run driver setup at module top level.
let _db: ReturnType<typeof getDatabase> | undefined;
function db() {
  return (_db ??= getDatabase());
}

/** Has the initial seed pass run? Used so a team that starts with zero sites
 *  still leaves first-run mode (an empty processed_sites table can't tell us). */
export async function hasSeeded(): Promise<boolean> {
  const rows = await db().sql`SELECT 1 FROM sync_meta WHERE key = 'seeded' LIMIT 1`;
  return rows.length > 0;
}

export async function markSeeded(): Promise<void> {
  await db().sql`
    INSERT INTO sync_meta (key, value) VALUES ('seeded', 'true')
    ON CONFLICT (key) DO NOTHING
  `;
}

export async function getProcessedIds(): Promise<Set<string>> {
  const rows = await db().sql`SELECT site_id FROM processed_sites`;
  return new Set(rows.map((r) => r.site_id as string));
}

export async function markProcessed(
  siteId: string,
  name: string,
  customDomain: string | null,
  action: SiteAction,
): Promise<void> {
  await db().sql`
    INSERT INTO processed_sites (site_id, name, custom_domain, action)
    VALUES (${siteId}, ${name}, ${customDomain}, ${action})
    ON CONFLICT (site_id) DO NOTHING
  `;
}
