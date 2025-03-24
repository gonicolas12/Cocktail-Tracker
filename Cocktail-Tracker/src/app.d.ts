// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

import type { User } from '$lib/types/user';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: User | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

/// <reference types="svelte" />
/// <reference types="vite/client" />

interface ImportMetaEnv {
    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

declare namespace App {
    interface Locals {
        user: User | null;
    }
    interface PageData {
        user: User | null;
    }
}

export {};