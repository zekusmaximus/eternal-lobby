import { writable, derived } from 'svelte/store';

export const despairPoints = writable(0);

const DESPAIR_TIERS = [
    { level: 0, description: 'Hopeful' },
    { level: 10, description: 'Slightly Anxious' },
    { level: 25, description: 'Resigned' },
    { level: 50, description: 'Despairing' },
    { level: 100, description: 'Completely Apathetic' }
];

export const despairLevel = derived(
    despairPoints,
    ($dp) => {
        let currentLevel = DESPAIR_TIERS[0];
        for (const tier of DESPAIR_TIERS) {
            if ($dp >= tier.level) {
                currentLevel = tier;
            } else {
                break;
            }
        }
        return currentLevel;
    }
);

export function addDespair(amount: number) {
    despairPoints.update(dp => Math.min(dp + amount, 100)); // Cap at 100
}