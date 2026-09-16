import React, { useState, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { marcarBoletoValidado } from '@/redux/slices/reservasSlice';
import { colors, spacing, typography, fontDisplay } from '@/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Escaner'>;

type ResultadoValidacion =
  | { tipo: 'valido'; mensaje: string }
  | { tipo: 'ya_usado'; mensaje: string }
  | { tipo: 'cancelado'; mensaje: string }
  | { tipo: 'no_encontrado'; mensaje: string };

export default function EscanerScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const reservas = useAppSelector((state) => state.reservas.lista);

  const [permiso, solicitarPermiso] = useCameraPermissions();
  const [escaneando, setEscaneando] = useState(true);
  const [resultado, setResultado] = useState<ResultadoValidacion | null>(null);
  // Evita que un mismo frame dispare la validación varias veces
  const bloqueado = useRef(false);

  const manejarEscaneo = useCallback(
    (evento: BarcodeScanningResult) => {
      if (bloqueado.current) return;
      bloqueado.current = true;
      setEscaneando(false);

      const codigo = evento.data;
      const reserva = reservas.find((r) => r.id === codigo);

      if (!reserva) {
        setResultado({ tipo: 'no_encontrado', mensaje: 'Este código no corresponde a ninguna compra.' });
        return;
      }

      if (reserva.estado === 'cancelada') {
        setResultado({ tipo: 'cancelado', mensaje: 'Esta reserva fue cancelada.' });
        return;
      }

      if (reserva.validado) {
        setResultado({
          tipo: 'ya_usado',
          mensaje: `Boleto ya validado antes. Asientos: ${reserva.asientos.join(', ')}`,
        });
        return;
      }

      dispatch(marcarBoletoValidado({ id: reserva.id }));
      setResultado({
        tipo: 'valido',
        mensaje: `Acceso concedido. ${reserva.asientos.length} asiento(s): ${reserva.asientos.join(', ')}`,
      });
    },
    [reservas, dispatch]
  );

  const escanearOtro = () => {
    bloqueado.current = false;
    setResultado(null);
    setEscaneando(true);
  };

  if (!permiso) {
    return <View style={styles.contenedor} />;
  }

  if (!permiso.granted) {
    return (
      <SafeAreaView style={styles.contenedor} edges={['top']}>
        <View style={styles.cuerpo}>
          <Text style={styles.titulo}>Escáner QR</Text>
          <Text style={styles.subtitulo}>
            Necesitamos acceso a la cámara para escanear boletos.
          </Text>
          <TouchableOpacity style={styles.boton} onPress={solicitarPermiso}>
            <Text style={styles.botonTexto}>Dar permiso</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.contenedor} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.volver}>← Volver</Text>
        </TouchableOpacity>
      </View>

      {escaneando ? (
        <View style={styles.camaraContenedor}>
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={manejarEscaneo}
          />
          <View style={styles.marco} />
          <Text style={styles.instruccion}>Apunta la cámara al código QR del boleto</Text>
        </View>
      ) : (
        <View style={styles.cuerpo}>
          <Text style={[styles.resultadoIcono, resultado?.tipo !== 'valido' && styles.resultadoIconoError]}>
            {resultado?.tipo === 'valido' ? '✓' : '✕'}
          </Text>
          <Text style={styles.titulo}>
            {resultado?.tipo === 'valido' && 'Boleto válido'}
            {resultado?.tipo === 'ya_usado' && 'Ya utilizado'}
            {resultado?.tipo === 'cancelado' && 'Reserva cancelada'}
            {resultado?.tipo === 'no_encontrado' && 'Código inválido'}
          </Text>
          <Text style={styles.subtitulo}>{resultado?.mensaje}</Text>

          <TouchableOpacity style={styles.boton} onPress={escanearOtro}>
            <Text style={styles.botonTexto}>Escanear otro boleto</Text>
          </TouchableOpacity>
        </View>
      )}
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
  camaraContenedor: { flex: 1, position: 'relative' },
  marco: {
    position: 'absolute',
    top: '30%',
    left: '15%',
    width: '70%',
    height: '35%',
    borderWidth: 2,
    borderColor: '#fff',
    borderRadius: 20,
  },
  instruccion: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    color: '#fff',
    fontSize: typography.small,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  resultadoIcono: {
    fontSize: 64,
    color: '#22c55e',
    marginBottom: spacing.sm,
  },
  resultadoIconoError: {
    color: '#ef4444',
  },
  boton: {
    backgroundColor: colors.textPrimary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  botonTexto: {
    color: colors.bgBase,
    fontSize: typography.small,
    fontWeight: '700',
  },
  
});