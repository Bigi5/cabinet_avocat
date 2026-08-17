export function sanitizeInput(value: unknown): unknown {
    if (Array.isArray(value)) {
        return value.map(sanitizeInput);
    }

    if (value && typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value).map(([key, val]) => [key, sanitizeInput(val)]),
        );
    }

    if (typeof value === 'string') {
        return value.trim();
    }

    return value;
}
