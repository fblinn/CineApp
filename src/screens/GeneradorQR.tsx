import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { useAppSelector } from '@/redux/hooks';
import { colors, radius, spacing, typography } from '@/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'GeneradorQR'>;

export default function GeneradorQR({ route, navigation }: Props) {
  const { reservaId } = route.params;
  const reserva = useAppSelector((state) =>
    state.reservas.lista.find((r) => r.id === reservaId)
  );

  if (!reserva) {
    return (
      <View style={styles.contenedor}>
        <Text style={styles.titulo}>No se encontró la reserva</Text>
      </View>
    );
  }

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>Compra confirmada</Text>
      <Text style={styles.subtitulo}>
        {reserva.asientos.length} asiento{reserva.asientos.length > 1 ? 's' : ''} · ${reserva.monto.toFixed(2)}
      </Text>
      <Text style={styles.linea}>Asientos: {reserva.asientos.join(', ')}</Text>
      <Text style={styles.linea}>{reserva.fecha} · {reserva.hora}</Text>

      <View style={styles.qrBox}>
        <QRCode value={reserva.id} size={200} />
      </View>

      <Text style={styles.codigo} selectable>
        Código: {reserva.id}
      </Text>

      <TouchableOpacity
        style={styles.botonSecundario}
        onPress={() => navigation.goBack()}>
        <Text style={styles.botonSecundarioTexto}>Volver</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    backgroundColor: colors.bgPanel,
    gap: spacing.sm,
  },
  titulo: {
    color: colors.textPrimary,
    fontSize: typography.title,
    fontWeight: '700',
  },
  subtitulo: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: '600',
  },
  linea: {
    color: colors.textMuted,
    fontSize: typography.small,
  },
  qrBox: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: radius.sm,
    marginVertical: spacing.md,
  },
  codigo: {
    color: colors.textMuted,
    fontSize: typography.tiny,
  },
  botonSecundario: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  botonSecundarioTexto: {
    color: colors.textPrimary,
    fontSize: typography.small,
    fontWeight: '600',
  },
});