import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { useAppSelector } from '@/redux/hooks';
import { selectFunciones, selectSalas } from '@/redux/slices/salasSlice';
import { colors, radius, spacing, typography, fontDisplay } from '@/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

export default function DashboardScreen({ navigation }: Props) {
  const peliculas = useAppSelector((state) => state.peliculas.lista);
  const funciones = useAppSelector(selectFunciones);
  const salas = useAppSelector(selectSalas);
  const reservas = useAppSelector((state) => state.reservas.lista);
  const ocupadosPorFuncion = useAppSelector(
    (state) => state.asientos.ocupadosPorFuncion
  );

  const totalPeliculas = peliculas.length;
  const totalFunciones = funciones.length;

   // Cada asiento reservado cuenta como un boleto vendido
  const boletosVendidos = useMemo(
    () => reservas.reduce((acc, r) => acc + r.asientos.length, 0),
    [reservas]
  );

  // Suma de todos los asientos marcados como ocupados en cualquier función
  const asientosOcupados = useMemo(
    () =>
      Object.values(ocupadosPorFuncion).reduce((acc, arr) => acc + arr.length, 0),
    [ocupadosPorFuncion]
  );

  // Capacidad total = suma de la capacidad de la sala de cada función creada
  // (cada función "reserva" toda la sala en su horario)
  const capacidadTotal = useMemo(
    () =>
      funciones.reduce((acc, f) => {
        const sala = salas.find((s) => s.id === f.salaId);
        return acc + (sala?.capacidad ?? 0);
      }, 0),
    [funciones, salas]
  );

  const asientosDisponibles = Math.max(capacidadTotal - asientosOcupados, 0);

  const ingresosGenerados = useMemo(
    () => reservas.reduce((acc, r) => acc + r.monto, 0),
    [reservas]
  );

  // Película con más reservas (por cantidad de reservas, no de asientos)
  const peliculaMasReservada = useMemo(() => {
    if (reservas.length === 0) return null;

    const conteoPorPelicula: Record<string, number> = {};
    reservas.forEach((r) => {
      conteoPorPelicula[r.peliculaId] = (conteoPorPelicula[r.peliculaId] ?? 0) + 1;
    });

    let mejorId: string | null = null;
    let mejorConteo = 0;
    Object.entries(conteoPorPelicula).forEach(([id, conteo]) => {
      if (conteo > mejorConteo) {
        mejorConteo = conteo;
        mejorId = id;
      }
    });

    if (!mejorId) return null;
    return peliculas.find((p) => p.id === mejorId)?.nombre ?? 'Desconocida';
  }, [reservas, peliculas]);

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
            {peliculaMasReservada ?? 'Aún no hay reservas'}
          </Text>
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
  valor: number;
  prefijo?: string;
}) {
  return (
    <View style={styles.tarjeta}>
      <Text style={styles.tarjetaEtiqueta}>{etiqueta}</Text>
      <Text style={styles.tarjetaValor}>
        {prefijo}
        {valor.toLocaleString()}
      </Text>
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
