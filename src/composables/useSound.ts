import { ref } from "vue";

const isSoundEnabled = ref(false);

const soundModules = import.meta.glob<{ default: string }>(
  "../assets/sound/*.mp3",
  { eager: true },
);

function getSoundUrl(soundName: string): string | null {
  const key = `../assets/sound/${soundName}.mp3`;
  const mod = soundModules[key];
  return mod ? mod.default : null;
}

export function useSound() {
  function enableSound() {
    isSoundEnabled.value = true;
  }

  async function playSound(soundName: string, volume = 1.0) {
    if (!isSoundEnabled.value) return;
    try {
      const url = getSoundUrl(soundName);
      if (!url) return;
      const audio = new Audio(url);
      audio.volume = volume;
      await audio.play();
    } catch (error) {
      console.warn("Error al reproducir sonido:", error);
    }
  }

  return {
    playSound,
    isSoundEnabled,
    enableSound,
  };
}
