import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../hooks/useAuth";

// =====================================================
// CONFIGURA TUS COLORES AQUÍ
// =====================================================
const customColors = {
  // Color primario (botones, links, iconos activos)
  primary: '#6750A4',
  onPrimary: '#FFFFFF',
  primaryContainer: '#EADDFF',
  onPrimaryContainer: '#21005D',
  
  // Color secundario
  secondary: '#625B71',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#E8DEF8',
  onSecondaryContainer: '#1D192B',
  
  // Color terciario (acentos adicionales)
  tertiary: '#7D5260',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#FFD8E4',
  onTertiaryContainer: '#31111D',
  
  // Error
  error: '#B3261E',
  onError: '#FFFFFF',
  errorContainer: '#F9DEDC',
  onErrorContainer: '#410E0B',
  
  // Fondos y superficies (modo claro)
  background: '#FFFBFE',
  onBackground: '#1C1B1F',
  surface: '#FFFBFE',
  onSurface: '#1C1B1F',
  surfaceVariant: '#E7E0EC',
  onSurfaceVariant: '#49454F',
  
  // Bordes
  outline: '#79747E',
  outlineVariant: '#CAC4D0',
};

const customColorsDark = {
  // Color primario (botones, links, iconos activos)
  primary: '#D0BCFF',
  onPrimary: '#381E72',
  primaryContainer: '#4F378B',
  onPrimaryContainer: '#EADDFF',
  
  // Color secundario
  secondary: '#CCC2DC',
  onSecondary: '#332D41',
  secondaryContainer: '#4A4458',
  onSecondaryContainer: '#E8DEF8',
  
  // Color terciario
  tertiary: '#EFB8C8',
  onTertiary: '#492532',
  tertiaryContainer: '#633B48',
  onTertiaryContainer: '#FFD8E4',
  
  // Error
  error: '#F2B8B5',
  onError: '#601410',
  errorContainer: '#8C1D18',
  onErrorContainer: '#F9DEDC',
  
  // Fondos y superficies (modo oscuro)
  background: '#1C1B1F',
  onBackground: '#E6E1E5',
  surface: '#1C1B1F',
  onSurface: '#E6E1E5',
  surfaceVariant: '#49454F',
  onSurfaceVariant: '#CAC4D0',
  
  // Bordes
  outline: '#938F99',
  outlineVariant: '#49454F',
};
// =====================================================

export default function RootLayout() {
  const colorScheme = useColorScheme();
  
  const paperTheme = colorScheme === "dark" 
    ? { ...MD3DarkTheme, colors: { ...MD3DarkTheme.colors, ...customColorsDark } }
    : { ...MD3LightTheme, colors: { ...MD3LightTheme.colors, ...customColors } };

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <PaperProvider theme={paperTheme}>
          <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
          <Slot />
        </PaperProvider>
      </SafeAreaProvider>
    </AuthProvider>
  );
}

