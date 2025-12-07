export const kgToLb = (kg: number) => kg * 2.2046226218;
export const lbToKg = (lb: number) => lb / 2.2046226218;

export function normalizePercentage(value: number | null | undefined): number | null {
    if (value == null) return null;
    // Some APIs return 0..1, others 0..100
    if (value <= 1) return Number((value * 100).toFixed(2));
    return Number(value.toFixed(2));
}

export function latest<T>(arr: T[], getTime: (x: T) => string | Date | undefined): T | undefined {
    return [...arr].sort((a, b) => {
        const ta = getTime(a) ? +new Date(getTime(a)!) : 0;
        const tb = getTime(b) ? +new Date(getTime(b)!) : 0;
        return tb - ta;
    })[0];
}