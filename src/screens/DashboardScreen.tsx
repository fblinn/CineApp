import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { useAppSelector } from '@/redux/hooks';
import { selectFunciones } from '@/redux/slices/salasSlice';
import { colors, radius, spacing, typography, fontDisplay } from '@/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

export default function DashboardScreen({ navigation }: Props) {
  const peliculas = useAppSelector((state) => state.peliculas.lista);
  const funciones = useAppSelector(selectFunciones);

  // ya pueden calcularse con el avance momentaneo
  const totalPeliculas = peliculas.length;
  const totalFunciones = funciones.length;

  // estos 5 dependen del slice de "reservas" 
  const boletosVendidos: number | null = null;
  const asientosDisponibles: number | null = null;
  const asientosOcupados: number | null = null;
  const ingresosGenerados: number | null = null;
  const peliculaMasReservada: string | null = null;

  return (
    <SafeAreaView style={styles.contenedor} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.volver}>← Volver</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.titulo}>Dashboard</Text>
        <Text style={styles.subtitulo}>Resumen general del cine</Text>

        <View style={styles.grid}>
          <TarjetaStat etiqueta="Total películas" valor={totalPeliculas} />
          <TarjetaStat etiqueta="Total funciones" valor={totalFunciones} />
          <TarjetaStat etiqueta="Boletos vendidos" valor={boletosVendidos} />
          <TarjetaStat etiqueta="Asientos disponibles" valor={asientosDisponibles} />
          <TarjetaStat etiqueta="Asientos ocupados" valor={asientosOcupados} />
          <TarjetaStat
            etiqueta="Ingresos generados"
            valor={ingresosGenerados}
            prefijo="$"
          />
        </View>

        <View style={styles.tarjetaAncha}>
          <Text style={styles.tarjetaAnchaEtiqueta}>Película más reservada</Text>
          <Text style={styles.tarjetaAnchaValor}>
            {peliculaMasReservada ?? 'Pendiente'}
          </Text>
          {peliculaMasReservada === null && (
            <Text style={styles.pendienteNota}>
              Pendiente
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function TarjetaStat({
  etiqueta,
  valor,
  prefijo = '',
}: {
  etiqueta: string;
  valor: number | null;
  prefijo?: string;
}) {
  const pendiente = valor === null;

  return (
    <View style={styles.tarjeta}>
      <Text style={styles.tarjetaEtiqueta}>{etiqueta}</Text>
      <Text style={[styles.tarjetaValor, pendiente && styles.tarjetaValorPendiente]}>
        {pendiente ? '—' : `${prefijo}${valor.toLocaleString()}`}
      </Text>
      {pendiente && <Text style={styles.pendienteNota}>Pendiente</Text>}
    </View>
  );
}

const ANCHO_TARJETA = '47%';

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
  scroll: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  titulo: {
    fontFamily: fontDisplay,
    color: colors.textPrimary,
    fontSize: 36,
    letterSpacing: 1,
  },
  subtitulo: {
    color: colors.textMuted,
    fontSize: typography.small,
    marginTop: 2,
    marginBottom: spacing.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tarjeta: {
    width: ANCHO_TARJETA,
    backgroundColor: colors.bgPanel,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  tarjetaEtiqueta: {
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: '600',
    marginBottom: 6,
  },
  tarjetaValor: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: '700',
  },
  tarjetaValorPendiente: {
    color: colors.textDim,
  },
  pendienteNota: {
    color: colors.textDim,
    fontSize: 10,
    marginTop: 4,
    fontStyle: 'italic',
  },
  tarjetaAncha: {
    marginTop: spacing.sm,
    backgroundColor: colors.bgPanel,
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.35)',
    borderRadius: radius.md,
    padding: spacing.md,
  },
  tarjetaAnchaEtiqueta: {
    color: colors.textMuted,
    fontSize: typography.tiny,
    fontWeight: '600',
    marginBottom: 6,
  },
  tarjetaAnchaValor: {
    color: colors.textPrimary,
    fontSize: typography.title,
    fontWeight: '700',
  },
});
