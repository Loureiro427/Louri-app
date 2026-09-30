import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: "com.loureiro.louri",
  appName: "Louri",
  webDir: "dist",
  plugins: {
    Keyboard: {
      resize: 'None', // Desliga o sistema automático falho do Android
      style: 'DARK',
    }
  }
};

export default config;