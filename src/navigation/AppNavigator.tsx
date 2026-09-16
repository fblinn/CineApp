import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Pelicula } from '@/types/pelicula';
import { colors } from '@/theme';
import TabNavigator from './TabNavigator';

export type RootStackParamList = {
  Catalogo: undefined;
  GestionPeliculas: undefined;
  CrearFuncion: undefined;
  Dashboard: undefined;
  Escaner: undefined;
  Funciones: { peliculaId: string };
  DetallePelicula: { peliculaId: string };
  SeleccionAsientos: { funcionId: string; pelicula: Pelicula; fecha: string; hora: string };
  FormularioVenta: {
    funcionId: string;
    pelicula: Pelicula;
    asientos: string[];
    total: number;
    fecha: string;
    hora: string;
    sala: string;
  };
  GeneradorQR: { reservaId: string };
  HistorialBoletos: undefined;
};

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
      <TabNavigator />
    </NavigationContainer>
  );
}