import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from '@/redux/store';
import IndexScreen from '@/screens/Index';
import PeliculasScreen from '@/screens/PeliculasScreen';

export default function App() {
  const [pantalla, setPantalla] = useState<'index' | 'peliculas'>('index');

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        {pantalla === 'index' ? (
          <IndexScreen onIrAPeliculas={() => setPantalla('peliculas')} />
        ) : (
          <PeliculasScreen />
        )}
        <StatusBar style="light" />
      </SafeAreaProvider>
    </Provider>
  );
}