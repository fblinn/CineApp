import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from '@/redux/store';
import IndexScreen from '@/screens/Index';

// TODO: cuando armemos la navegación, esto se reemplaza
// por <AppNavigator /> con el stack Cliente / Zona de Personal.
// Por ahora se muestra directo la pantalla de Gestión de Películas para probar el CRUD.
export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <IndexScreen />
        <StatusBar style="light" />
      </SafeAreaProvider>
    </Provider>
  );
}