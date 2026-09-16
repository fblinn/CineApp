import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/AppNavigator';

import QRCode from 'react-native-qrcode-svg';

import { useAppSelector } from '@/redux/hooks';
import { colors, radius, spacing, typography } from '@/theme';
import type { Reserva } from '@/types/reserva';

type Props = NativeStackScreenProps<RootStackParamList, 'HistorialBoletos'>;

export default function HistorialBoletos({ navigation }: Props) {
  const reservas = useAppSelector((state) => state.reservas.lista);
  const peliculas = useAppSelector((state) => state.peliculas.lista);

  // Reserva seleccionada para mostrar su QR
  const [reservaSeleccionada, setReservaSeleccionada] =
    useState<Reserva | null>(null);

  // Mapa rápido id → nombre
  const nombresPorPeliculaId = useMemo(() => {
    const mapa: Record<string, string> = {};

    peliculas.forEach((p) => {
      mapa[p.id] = p.nombre;
    });

    return mapa;
  }, [peliculas]);

  const reservasOrdenadas = useMemo(
    () => [...reservas].reverse(),
    [reservas]
  );

  // Función que abre el QR de la reserva seleccionada
  const mostrarQR = (reserva: Reserva) => {
    setReservaSeleccionada(reserva);
  };

  // Función para cerrar el QR
  const cerrarQR = () => {
    setReservaSeleccionada(null);
  };

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>Mis Boletos</Text>

      <Text style={styles.subtitulo}>
        {reservas.length}{' '}
        {reservas.length === 1 ? 'compra' : 'compras'}
      </Text>

      {reservasOrdenadas.length === 0 ? (
        <View style={styles.vacio}>
          <Text style={styles.vacioTitulo}>
            Aún no tienes boletos
          </Text>

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
              nombrePelicula={
                nombresPorPeliculaId[item.peliculaId] ??
                'Película no disponible'
              }
              onPress={() => mostrarQR(item)}
            />
          )}
        />
      )}

      {/* MODAL DEL QR */}
      <Modal
        visible={reservaSeleccionada !== null}
        transparent
        animationType="fade"
        onRequestClose={cerrarQR}
      >
        <View style={styles.modalFondo}>
          <View style={styles.modalContenido}>
            {reservaSeleccionada && (
              <>
                <Text style={styles.tituloModal}>
                  Compra confirmada
                </Text>

                <Text style={styles.subtituloModal}>
                  {reservaSeleccionada.asientos.length} asiento
                  {reservaSeleccionada.asientos.length > 1
                    ? 's'
                    : ''}{' '}
                  · ${reservaSeleccionada.monto.toFixed(2)}
                </Text>

                <Text style={styles.lineaModal}>
                  Asientos:{' '}
                  {reservaSeleccionada.asientos.join(', ')}
                </Text>

                <Text style={styles.lineaModal}>
                  {reservaSeleccionada.fecha} ·{' '}
                  {reservaSeleccionada.hora}
                </Text>

                {/* QR */}
                <View style={styles.qrBox}>
                  <QRCode
                    value={reservaSeleccionada.id}
                    size={200}
                  />
                </View>

                <Text style={styles.codigo} selectable>
                  Código: {reservaSeleccionada.id}
                </Text>

                {/* Cerrar */}
                <TouchableOpacity
                  style={styles.botonSecundario}
                  onPress={cerrarQR}
                >
                  <Text style={styles.botonSecundarioTexto}>
                    Cerrar
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
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
    <TouchableOpacity
      style={styles.fila}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.filaInfo}>
        <Text
          style={styles.filaPelicula}
          numberOfLines={1}
        >
          {nombrePelicula}
        </Text>

        <Text style={styles.filaFechaHora}>
          Sala {reserva.sala}
        </Text>

        <Text style={styles.filaAsientos}>
          {reserva.asientos.length} asiento
          {reserva.asientos.length > 1 ? 's' : ''}:{' '}
          {reserva.asientos.join(', ')}
        </Text>

        <Text style={styles.filaMonto}>
          ${reserva.monto.toFixed(2)}
        </Text>
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

  // MODAL

  modalFondo: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },

  modalContenido: {
    width: '100%',
    backgroundColor: colors.bgPanel,
    borderRadius: radius.md,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
  },

  tituloModal: {
    color: colors.textPrimary,
    fontSize: typography.title,
    fontWeight: '700',
  },

  subtituloModal: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: '600',
  },

  lineaModal: {
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
    marginTop: spacing.sm,
  },

  botonSecundarioTexto: {
    color: colors.textPrimary,
    fontSize: typography.small,
    fontWeight: '600',
  },
});
