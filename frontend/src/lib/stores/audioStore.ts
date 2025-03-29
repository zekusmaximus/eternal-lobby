import { writable, type Writable } from 'svelte/store';

interface AudioState {
    element: HTMLAudioElement | null;
    enabled: boolean;
}

export const ambientSound: Writable<AudioState> = writable({
    element: null,
    enabled: false
});

export const initializeAudio = () => {
    const audioElement = new Audio('/sounds/ambient.mp3');
    audioElement.loop = true;
    
    ambientSound.set({
        element: audioElement,
        enabled: false
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