import fs from 'fs';
import path from 'path';

export interface AuthRecord {
    email: string;
    provider: 'google' | 'credentials';
    name?: string;
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

export function registerUserRecord(email: string, provider: 'google' | 'credentials', name?: string): AuthRecord {
    const reg = getRegistry();
    const key = email.toLowerCase().trim();
    
    // If already registered, return existing or update if switching from credentials to google
    if (reg[key]) {
        if (provider === 'google' && reg[key].provider !== 'google') {
            // Google linking is allowed if they authenticate with Google OAuth
            reg[key].provider = 'google';
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
    reg[key] = record;
    saveRegistry(reg);
    return record;
}

export function getUserRecord(email: string): AuthRecord | null {
    if (!email) return null;
    const reg = getRegistry();
    return reg[email.toLowerCase().trim()] || null;
}
