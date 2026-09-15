import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { colors, spacing, typography, fontDisplay } from '@/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Escaner'>;

// TODO (Módulo 7= queda pendiente hasta que el mod ventas este listo
export default function EscanerScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.contenedor} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.volver}>← Volver</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cuerpo}>
        <Text style={styles.titulo}>Escáner QR</Text>
        <Text style={styles.subtitulo}>
          Aquí se va a validar el boleto del cliente 
        </Text>
        <Text style={styles.nota}>
          Pendiente hasta que el módulo de venta genere boletos por el momento solo para poner boton
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: colors.bgBase,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  volver: {
    color: colors.textMuted,
    fontSize: typography.body,
    fontWeight: '600',
  },
  cuerpo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  icono: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  titulo: {
    fontFamily: fontDisplay,
    color: colors.textPrimary,
    fontSize: 34,
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  subtitulo: {
    color: colors.textMuted,
    fontSize: typography.small,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  nota: {
    color: colors.textDim,
    fontSize: typography.tiny,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});