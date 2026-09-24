import { env } from 'cloudflare:workers';
export function db():D1Database { const binding=(env as unknown as {DB?:D1Database}).DB; if(!binding)throw new Error('Salvarea este temporar indisponibilă. Încearcă din nou.');return binding; }
