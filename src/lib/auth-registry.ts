import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const BCRYPT_SALT_ROUNDS = 12;

export interface AuthRecord {
    email: string;
    provider: 'google' | 'credentials';
    name?: string;
    passwordHash?: string;
    createdAt: string;
}

const REGISTRY_PATH = path.join(process.cwd(), '.auth-registry.json');

function getRegistry(): Record<string, AuthRecord> {
    try {
        if (fs.existsSync(REGISTRY_PATH)) {
            const data = fs.readFileSync(REGISTRY_PATH, 'utf-8');
            return JSON.parse(data);
        }
    } catch (e) {
        console.error('Error reading auth registry:', e);
    }
    return {};
}

function saveRegistry(registry: Record<string, AuthRecord>) {
    try {
        fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2), 'utf-8');
    } catch (e) {
        console.error('Error saving auth registry:', e);
    }
}

/**
 * Register a new user with optional password hashing.
 * STRICT: Google accounts can NEVER be downgraded to credentials.
 */
export async function registerUserRecord(email: string, provider: 'google' | 'credentials', name?: string, password?: string): Promise<AuthRecord> {
    const reg = getRegistry();
    const key = email.toLowerCase().trim();

    if (reg[key]) {
        // STRICT: If Google-locked, NEVER allow downgrade
        if (reg[key].provider === 'google' && provider === 'credentials') {
            return reg[key];
        }
        // Allow upgrade credentials → google
        if (provider === 'google' && reg[key].provider !== 'google') {
            reg[key].provider = 'google';
            reg[key].passwordHash = undefined; // Remove password on Google upgrade
            if (name) reg[key].name = name;
            saveRegistry(reg);
        }
        return reg[key];
    }

    const record: AuthRecord = {
        email: key,
        provider,
        name: name || key.split('@')[0],
        createdAt: new Date().toISOString()
    };

    // Hash and store password for credential registrations
    if (provider === 'credentials' && password) {
        record.passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    }

    reg[key] = record;
    saveRegistry(reg);
    return record;
}

/**
 * Verify a user's password against the stored bcrypt hash.
 * Returns true if valid, false if invalid or no hash stored.
 */
export async function verifyPassword(email: string, password: string): Promise<boolean> {
    const reg = getRegistry();
    const key = email.toLowerCase().trim();
    const record = reg[key];

    if (!record || !record.passwordHash) return false;
    return bcrypt.compare(password, record.passwordHash);
}

/**
 * Force-set a Google provider record. Used when we detect Google binding from cloud.
 */
export function syncGoogleUserRecord(email: string, name?: string): AuthRecord {
    const reg = getRegistry();
    const key = email.toLowerCase().trim();
    if (!reg[key] || reg[key].provider !== 'google') {
        reg[key] = {
            email: key,
            provider: 'google',
            name: name || (reg[key]?.name || key.split('@')[0]),
            createdAt: reg[key]?.createdAt || new Date().toISOString()
        };
        saveRegistry(reg);
    }
    return reg[key];
}

/**
 * Read-only lookup of a user record.
 */
export function getUserRecord(email: string): AuthRecord | null {
    if (!email) return null;
    const reg = getRegistry();
    return reg[email.toLowerCase().trim()] || null;
}
