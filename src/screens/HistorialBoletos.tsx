import React, { useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { useAppSelector } from '@/redux/hooks';
import { colors, radius, spacing, typography } from '@/theme';
import type { Reserva } from '@/types/reserva';

type Props = NativeStackScreenProps<RootStackParamList, 'HistorialBoletos'>;

export default function HistorialBoletos({ navigation }: Props) {
  const reservas = useAppSelector((state) => state.reservas.lista);
  const peliculas = useAppSelector((state) => state.peliculas.lista);

  // Mapa rápido id → nombre, para no hacer .find() en cada fila del FlatList
  const nombresPorPeliculaId = useMemo(() => {
    const mapa: Record<string, string> = {};
    peliculas.forEach((p) => {
      mapa[p.id] = p.nombre;
    });
    return mapa;
  }, [peliculas]);

  const reservasOrdenadas = useMemo(() => [...reservas].reverse(), [reservas]);

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>Mis Boletos</Text>
      <Text style={styles.subtitulo}>
        {reservas.length} {reservas.length === 1 ? 'compra' : 'compras'}
      </Text>

      {reservasOrdenadas.length === 0 ? (
        <View style={styles.vacio}>
          <Text style={styles.vacioTitulo}>Aún no tienes boletos</Text>
          <Text style={styles.vacioTexto}>
            Cuando compres una entrada, aparecerá aquí junto a su código QR.
          </Text>
        </View>
      ) : (
        <FlatList
          data={reservasOrdenadas}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.lista}
          renderItem={({ item }) => (
            <BoletoFila
              reserva={item}
              nombrePelicula={nombresPorPeliculaId[item.peliculaId] ?? 'Película no disponible'}
              onPress={() =>
                navigation.navigate('GeneradorQR', { reservaId: item.id })
              }
            />
          )}
        />
      )}
    </View>
  );
}

function BoletoFila({
  reserva,
  nombrePelicula,
  onPress,
}: {
  reserva: Reserva;
  nombrePelicula: string;
  onPress: () => void;
}) {

  return (
    <TouchableOpacity style={styles.fila} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.filaInfo}>
        <Text style={styles.filaPelicula} numberOfLines={1}>
          {nombrePelicula}
        </Text>
        <Text style={styles.filaFechaHora}>
           Sala {reserva.sala}
        </Text>
        <Text style={styles.filaAsientos}>
          {reserva.asientos.length} asiento{reserva.asientos.length > 1 ? 's' : ''}:{' '}
          {reserva.asientos.join(', ')}
        </Text>
        <Text style={styles.filaMonto}>${reserva.monto.toFixed(2)}</Text>
      </View>

    </TouchableOpacity>
  );
}


const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: colors.bgBase,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  titulo: {
    color: colors.textPrimary,
    fontSize: typography.hero,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitulo: {
    color: colors.textMuted,
    fontSize: typography.small,
    marginTop: 2,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  lista: {
    paddingBottom: spacing.xl,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgPanel,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  filaInfo: {
    flex: 1,
    gap: 2,
  },
  filaPelicula: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: '700',
  },
  filaFechaHora: {
    color: colors.textMuted,
    fontSize: typography.tiny,
  },
  filaAsientos: {
    color: colors.textMuted,
    fontSize: typography.tiny,
  },
  filaMonto: {
    color: colors.textPrimary,
    fontSize: typography.small,
    fontWeight: '600',
    marginTop: 2,
  },
  badge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  badgeTexto: {
    color: colors.textPrimary,
    fontSize: typography.tiny,
    fontWeight: '700',
  },
  vacio: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  vacioTitulo: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: '700',
    marginBottom: 4,
  },
  vacioTexto: {
    color: colors.textMuted,
    fontSize: typography.small,
    textAlign: 'center',
  },
});