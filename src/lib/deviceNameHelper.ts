// Smart Android Model Decoder & Device Name Formatter

const KNOWN_HARDWARE_MODELS: Record<string, string> = {
    // Xiaomi / Redmi Note 14 Series
    '24116RACCG': 'Redmi Note 14 Pro 5G',
    '24116RACC1': 'Redmi Note 14 Pro 5G',
    '24090RA29G': 'Redmi Note 14 5G',
    '24090RA29C': 'Redmi Note 14 5G',
    '24115RA8EG': 'Redmi Note 14 Pro+ 5G',
    '24115RA8EC': 'Redmi Note 14 Pro+ 5G',

    // Xiaomi / Redmi Note 13 Series
    '2312DRA50G': 'Redmi Note 13 Pro+ 5G',
    '2312DRA50C': 'Redmi Note 13 Pro+ 5G',
    '2312DRAABG': 'Redmi Note 13 Pro 5G',
    '23129RAA4G': 'Redmi Note 13 5G',
    '23124RA7EO': 'Redmi Note 13 4G',
    '23117RA68G': 'Redmi Note 13 Pro 4G',

    // Xiaomi / Redmi Note 12 Series
    '22111317G': 'Redmi Note 12 Pro+ 5G',
    '22101316G': 'Redmi Note 12 Pro 5G',
    '23021RAAEG': 'Redmi Note 12 4G',
    '23028RA60G': 'Redmi Note 12S',

    // Xiaomi Poco Series
    '2311DRK48G': 'Poco X6 Pro 5G',
    '23122PCD1G': 'Poco X6 5G',
    '24069PC21G': 'Poco M6 Pro',
    '23049PCD8G': 'Poco F5',
    '24053PY09G': 'Poco F6',
    '24069PC21I': 'Poco M6 5G',

    // Xiaomi Flagships
    '24030PN60G': 'Xiaomi 14 Ultra',
    '23127PN0CG': 'Xiaomi 14',
    '23116PN5BC': 'Xiaomi 14 Pro',
    '2211133G': 'Xiaomi 13',
    '2210132G': 'Xiaomi 13 Pro',

    // Samsung Galaxy S Series
    'SM-S928B': 'Galaxy S24 Ultra',
    'SM-S928U': 'Galaxy S24 Ultra',
    'SM-S926B': 'Galaxy S24+',
    'SM-S921B': 'Galaxy S24',
    'SM-S918B': 'Galaxy S23 Ultra',
    'SM-S916B': 'Galaxy S23+',
    'SM-S911B': 'Galaxy S23',
    'SM-S908B': 'Galaxy S22 Ultra',
    'SM-S901B': 'Galaxy S22',

    // Samsung Galaxy A Series
    'SM-A556B': 'Galaxy A55 5G',
    'SM-A546B': 'Galaxy A54 5G',
    'SM-A536B': 'Galaxy A53 5G',
    'SM-A356B': 'Galaxy A35 5G',
    'SM-A346B': 'Galaxy A34 5G',
    'SM-A256B': 'Galaxy A25 5G',
    'SM-A155F': 'Galaxy A15',
    'SM-A145F': 'Galaxy A14',
    'SM-A055F': 'Galaxy A05',

    // OnePlus
    'CPH2581': 'OnePlus 12',
    'CPH2609': 'OnePlus 12R',
    'CPH2449': 'OnePlus 11',
    'CPH2493': 'OnePlus Nord 3',
    'CPH2513': 'OnePlus Nord CE 3 Lite',
    'CPH2411': 'OnePlus 10 Pro',

    // Realme
    'RMX3840': 'Realme 12 Pro+ 5G',
    'RMX3842': 'Realme 12 Pro 5G',
    'RMX3850': 'Realme GT 6',
    'RMX3740': 'Realme 11 Pro+ 5G',
    'RMX3760': 'Realme C53',
    'RMX3834': 'Realme 12 5G',

    // Vivo / iQOO
    'V2324A': 'Vivo X100 Pro',
    'V2318': 'Vivo V30 Pro',
    'V2310': 'Vivo V30',
    'V2344': 'Vivo Y200',
    'I2220': 'iQOO 12',

    // Oppo
    'CPH2525': 'Oppo Reno 10 Pro+ 5G',
    'CPH2531': 'Oppo Reno 10 Pro 5G',
    'CPH2607': 'Oppo Reno 11 Pro 5G',
    'CPH2599': 'Oppo Find X7 Ultra',

    // Tecno / Infinix
    'X6833B': 'Infinix Note 30 Pro',
    'X6836': 'Infinix Note 40 Pro',
    'X6850': 'Infinix GT 20 Pro',
    'CK7n': 'Tecno Camon 20 Pro 5G',
    'CL7': 'Tecno Spark 20 Pro+'
};

export function getCleanDeviceName(device: any): string {
    if (!device) return 'Android Device';

    const devId = device.deviceId || device.id || device._id || '';

    // 1. Check if user set a custom nickname for this device in localStorage
    if (typeof window !== 'undefined' && devId) {
        try {
            const customName = localStorage.getItem(`dev_name_${devId}`);
            if (customName && customName.trim().length > 0) {
                return customName.trim();
            }
        } catch { }
    }

    const rawName = (device.name || device.deviceName || '').trim();
    const rawModel = (device.model || '').trim();
    const rawBrand = (device.brand || device.manufacturer || '').trim();

    // 2. Check if rawModel or rawName matches a known hardware code (e.g. 24116RACCG)
    if (rawModel && KNOWN_HARDWARE_MODELS[rawModel]) {
        return KNOWN_HARDWARE_MODELS[rawModel];
    }
    if (rawName && KNOWN_HARDWARE_MODELS[rawName]) {
        return KNOWN_HARDWARE_MODELS[rawName];
    }

    // Check uppercase variants
    const upperModel = rawModel.toUpperCase();
    if (KNOWN_HARDWARE_MODELS[upperModel]) {
        return KNOWN_HARDWARE_MODELS[upperModel];
    }
    const upperName = rawName.toUpperCase();
    if (KNOWN_HARDWARE_MODELS[upperName]) {
        return KNOWN_HARDWARE_MODELS[upperName];
    }

    // 3. If rawName is already user-friendly (contains spaces and is not just a hardware code)
    if (rawName && rawName.length > 2 && rawName !== 'Android' && !/^[0-9A-Z]{8,14}$/i.test(rawName)) {
        return rawName;
    }

    // 4. Combine Brand + Model cleanly if available
    if (rawBrand && rawModel) {
        const cleanBrand = rawBrand.charAt(0).toUpperCase() + rawBrand.slice(1);
        if (rawModel.toLowerCase().startsWith(rawBrand.toLowerCase())) {
            return rawModel;
        }
        return `${cleanBrand} ${rawModel}`;
    }

    if (rawName) return rawName;
    if (rawModel) return rawModel;
    return 'Android Device';
}
