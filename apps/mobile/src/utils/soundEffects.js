import { Platform } from 'react-native';

const BEEP_UP = 'data:audio/wav;base64,UklGRlQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YTAAAAAAKzdQZGxwbWliX1xZSFBJQkA8ODQwLCgnIh8bGBYUEhAPDg0NDQ4PEBESFBUXGx8kKjA2PD9CSExUWWJpbXB0d31/f39+fXt3c2xkW1JIQDg0MC0qJyQhHhsaGBYVFBQTEhIREQ==';
const BEEP_DOWN = 'data:audio/wav;base64,UklGRlQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YTAAAAAAf39+fXt2b2dcVEtDPC8nIBsYFRQQDQwKCQoLDA4QExcbICUqLzU8QkhQWmNrcnV4e3x9fX18e3h0b2lkXFlSSEA4MCknJCEeGxgWFhUUExIREQ8ODQwLCwoKCgsM';
const BEEP_WIN = 'data:audio/wav;base64,UklGRmQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YUAAAAAAKTVQaXh/f39+fHl0b2pkXFdTUE1LTElHRkVEQ0NDRERFRkdIS0xPU1daXmNna2+AgICAgH9+fHp2cXBqZF1YUlFQT05NTEtKSUhHRkVEQ0JBQUFBQkNERUZHSElKS0xN';

let enabled = true;

export function setSoundEnabled(value) {
  enabled = Boolean(value);
}

async function play(uri) {
  if (!enabled || Platform.OS === 'web') return;
  try {
    const { Audio } = await import('expo-av');
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: true, volume: 0.35 });
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  } catch {
    // best-effort sound
  }
}

export function playXpGainSound() {
  return play(BEEP_UP);
}

export function playXpLossSound() {
  return play(BEEP_DOWN);
}

export function playAchievementSound() {
  return play(BEEP_WIN);
}
