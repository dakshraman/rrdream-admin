// Encode ID to Base64
export const encodeId = (id) => {
    if (!id) return null;
    try {
        // Add a salt for extra obfuscation
        const saltedId = `${id}_RDream_${Date.now().toString(36)}`;
        return btoa(saltedId);
    } catch (error) {
        console.error('Error encoding ID:', error);
        return id;
    }
};

// Decode Base64 to ID
export const decodeId = (encodedId) => {
    if (!encodedId) return null;
    try {
        const decoded = atob(encodedId);
        // Extract the ID from the salted string
        const id = decoded.split('_RDream_')[0];
        return id;
    } catch (error) {
        console.error('Error decoding ID:', error);
        return encodedId;
    }
};

// Simpler version without timestamp (more consistent)
export const encodeIdSimple = (id) => {
    if (!id) return null;
    try {
        return btoa(`RDream_${id}_prop`);
    } catch (error) {
        console.error('Error encoding ID:', error);
        return id;
    }
};

export const decodeIdSimple = (encodedId) => {
    if (!encodedId) return null;
    try {
        const decoded = atob(encodedId);
        const match = decoded.match(/RDream_(\d+)_prop/);
        return match ? match[1] : null;
    } catch (error) {
        console.error('Error decoding ID:', error);
        return null;
    }
};