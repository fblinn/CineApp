import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import IndexScreen from '@/screens/Index';
import PeliculasScreen from '@/screens/PeliculasScreen';
import CrearFuncionScreen from '@/screens/CrearFuncionScreen';
import DashboardScreen from '@/screens/DashboardScreen';
import { colors } from '@/theme';
import DetallePelicula from '@/screens/DetallePelicula';

// Rutas de la app. Cuando se agregue la biometría, el paso de "Catalogo" a
// "GestionPeliculas" se intercepta ahí antes de navegar.
export type RootStackParamList = {
  Catalogo: undefined;
  GestionPeliculas: undefined;
  CrearFuncion: undefined;
<<<<<<< HEAD
  Dashboard: undefined;
=======
  Funciones: { peliculaId: string };
  DetallePelicula: { peliculaId: string };
>>>>>>> 98a9693b689c3375abbddba5470f1f0ee402473f
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer
      theme={{
        dark: true,
        colors: {
          primary: colors.red,
          background: colors.bgBase,
          card: colors.bgPanel,
          text: colors.textPrimary,
          border: colors.borderSubtle,
          notification: colors.red,
        },
        fonts: {
          regular: { fontFamily: 'System', fontWeight: '400' },
          medium: { fontFamily: 'System', fontWeight: '500' },
          bold: { fontFamily: 'System', fontWeight: '700' },
          heavy: { fontFamily: 'System', fontWeight: '900' },
        },
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Catalogo" component={IndexScreen} />
        <Stack.Screen name="GestionPeliculas" component={PeliculasScreen} />
        <Stack.Screen name="CrearFuncion" component={CrearFuncionScreen} />
<<<<<<< HEAD
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
=======
        <Stack.Screen name="DetallePelicula" component={DetallePelicula} />
>>>>>>> 98a9693b689c3375abbddba5470f1f0ee402473f
      </Stack.Navigator>
    </NavigationContainer>
  );
}
