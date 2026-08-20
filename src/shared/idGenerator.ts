import { randomInt } from 'crypto';

export class DynamicIdGenerator {
    private readonly minDigits: number;
    private readonly maxRisk: number;

    /**
     * @param initialDigits Jumlah digit awal (default: 6)
     * @param maxCollisionRisk Ambang batas risiko collision (default: 0.00001 / 0.001%)
     */
    constructor(initialDigits: number = 6, maxCollisionRisk: number = 0.00001) {
        this.minDigits = initialDigits;
        this.maxRisk = maxCollisionRisk;
    }

    /**
     * Menghitung panjang digit berdasarkan Birthday Paradox: P ≈ (N^2) / (2 * H)
     */
    public calculateRequiredDigits(totalExistingIds: number): number {
        let digits = this.minDigits;

        while (true) {
            const possibleCombinations = Math.pow(10, digits);
            const collisionRisk = Math.pow(totalExistingIds, 2) / (2 * possibleCombinations);

            if (collisionRisk < this.maxRisk) {
                return digits;
            }
            digits++;
        }
    }

    /**
     * Generates a cryptographically secure random ID string.
     */
    public generateId(totalExistingIds: number): string {
        const digits = this.calculateRequiredDigits(totalExistingIds);

        // Menentukan batas bawah dan atas angka
        const min = Math.pow(10, digits - 1);
        const max = Math.pow(10, digits) - 1;
        const range = max - min + 1;

        // randomInt dari module 'crypto' bersifat Cryptographically Secure (CSPRNG)
        const randomNum = min + randomInt(0, range);
        return randomNum.toString();
    }
}

// --- Contoh Penggunaan ---
export const idGenerator6Digit = new DynamicIdGenerator(6, 0.00001);

// const id1: string = idGenerator.generateId(100);    // Output 6 digit (e.g., "482910")
// const id2: string = idGenerator.generateId(5000);   // Output 7 digit (e.g., "7392014")
// const id3: string = idGenerator.generateId(50000);  // Output 8 digit (e.g., "91827304")

// console.log({ id1, id2, id3 });
