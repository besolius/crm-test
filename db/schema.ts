import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
// A contact aggregate keeps independent tracks, actions, append-only audit events,
// messages, pause episodes, meetings and command receipts in one atomic version.
export const contacts = sqliteTable('contacts', { id:text('id').primaryKey(), version:integer('version').notNull(), payload:text('payload').notNull(), updatedAt:text('updated_at').notNull() });
