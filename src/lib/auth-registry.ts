import fs from 'fs';
import path from 'path';
import clientPromise from './mongodb';

export interface AuthRecord {
    email: string;
    provider: 'google' | 'credentials';
    name?: string;
    password?: string;
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

// Helper to also sync record to MongoDB collection asynchronously when attached
async function syncToMongoDB(record: AuthRecord) {
    if (!process.env.MONGODB_URI) return;
    try {
        const client = await clientPromise;
        const db = client.db();
        const usersCol = db.collection('users');
        await usersCol.updateOne(
            { email: record.email },
            { 
                $set: {
                    email: record.email,
                    provider: record.provider,
                    is_google: record.provider === 'google',
                    name: record.name || record.email.split('@')[0],
                    ...(record.password ? { password: record.password } : {}),
                    updatedAt: new Date().toISOString()
                },
                $setOnInsert: { createdAt: record.createdAt }
            },
            { upsert: true }
        );
    } catch (dbErr) {
        console.error('[MongoDB Sync Error]:', dbErr);
    }
}

// Helper to look up user from MongoDB if local file doesn't have them
export async function getMongoUserRecord(email: string): Promise<AuthRecord | null> {
    if (!email || !process.env.MONGODB_URI) return null;
    try {
        const client = await clientPromise;
        const db = client.db();
        const user = await db.collection('users').findOne({ email: email.toLowerCase().trim() });
        if (user) {
            return {
                email: user.email,
                provider: (user.provider === 'google' || user.is_google === true || user.auth_type === 'google') ? 'google' : 'credentials',
                name: user.name,
                password: user.password,
                createdAt: user.createdAt || new Date().toISOString()
            };
        }
    } catch (dbErr) {
        console.error('[MongoDB Lookup Error]:', dbErr);
    }
    return null;
}

export function registerUserRecord(email: string, provider: 'google' | 'credentials', name?: string, password?: string): AuthRecord {
    const reg = getRegistry();
    const key = email.toLowerCase().trim();
    
    if (reg[key]) {
        // STRICT SECURITY: If the account is locked to Google, NEVER allow downgrading or overwriting with credentials!
        if (reg[key].provider === 'google' && provider === 'credentials') {
            return reg[key];
        }
        if (provider === 'google' && reg[key].provider !== 'google') {
            reg[key].provider = 'google';
            if (name) reg[key].name = name;
            delete reg[key].password;
            saveRegistry(reg);
            syncToMongoDB(reg[key]);
        } else if (provider === 'credentials' && password) {
            reg[key].password = password;
            if (name) reg[key].name = name;
            saveRegistry(reg);
            syncToMongoDB(reg[key]);
        }
        return reg[key];
    }

    const record: AuthRecord = {
        email: key,
        provider,
        name: name || key.split('@')[0],
        ...(password ? { password } : {}),
        createdAt: new Date().toISOString()
    };
    reg[key] = record;
    saveRegistry(reg);
    syncToMongoDB(record);
    return record;
}

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
        syncToMongoDB(reg[key]);
    }
    return reg[key];
}

export function getUserRecord(email: string): AuthRecord | null {
    if (!email) return null;
    const reg = getRegistry();
    return reg[email.toLowerCase().trim()] || null;
}
