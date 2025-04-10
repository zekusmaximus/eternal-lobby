import { writable, type Writable } from 'svelte/store';

interface AudioState {
    element: HTMLAudioElement | null;
    enabled: boolean;
    volume: number; // Added volume property
}

export const ambientSound: Writable<AudioState> = writable({
    element: null,
    enabled: false,
    volume: 0.5 // Initial volume
});

// Array of sound effect file paths
const soundEffects: string[] = [
    '/sounds/sfx_creak.mp3',
    '/sounds/sfx_flicker.mp3',
    '/sounds/sfx_footstep.mp3'
];

export const initializeAudio = () => {
    const audioElement = new Audio('/sounds/ambient_loop.mp3');
    audioElement.loop = true;
    audioElement.volume = 0.5; // Set initial volume

    ambientSound.set({
        element: audioElement,
        enabled: false,
        volume: 0.5
    });
};

export const toggleAudio = () => {
    ambientSound.update(state => {
        if (state.element) {
            state.enabled ? state.element.pause() : state.element.play();
        }
        return { ...state, enabled: !state.enabled };
    });
};

// Function to play a random sound effect
export function playRandomSoundEffect() {
    ambientSound.update(state => {
        if (state.element) {
            // Choose a random sound effect
            const randomIndex = Math.floor(Math.random() * soundEffects.length);
            const soundEffectPath = soundEffects[randomIndex];

            // Create a new audio element for the sound effect
            const soundEffect = new Audio(soundEffectPath);

            // Play the sound effect
            soundEffect.volume = state.volume;
            soundEffect.play();
            console.log(`Playing sound effect: ${soundEffectPath}`);
            // No need to pause the ambient sound; the new sound effect will
            // briefly overlap, which is fine for these short effects.
        }
        return state;
    });
};

// Function to update the ambient volume
export const updateAmbientVolume = (volume: number) => {
    ambientSound.update(state => {
        if (state.element) {
            state.element.volume = volume;
        }
        return { ...state, volume };
    });
};