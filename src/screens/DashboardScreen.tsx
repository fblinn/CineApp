import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { useAppSelector } from '@/redux/hooks';
import { selectFunciones, selectSalas } from '@/redux/slices/salasSlice';
import { colors, radius, spacing, typography, fontDisplay } from '@/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

// constante para grafica
const ALTURA_MAX_BARRA = 110;

// Fecha usando la hora local del dispositivo,
// no UTC )evita el desfase de toISOString() según la zona horaria=
function formatearFechaLocal(fecha: Date): string {
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, '0');
  const d = String(fecha.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

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
    () => reservas.reduce((acc, r) => acc + (Number(r.monto) || 0), 0),
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

  // Ventas (ingresos) de los últimos 7 días, agrupadas por fecha.
  // "reserva.fecha" se guarda como ISO completo (new Date().toISOString()),
  // así que solo tomamos la parte "YYYY-MM-DD" para agrupar por día.
  const ventasPorDia = useMemo(() => {
    const hoy = new Date();
    const dias: { clave: string; etiqueta: string; monto: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(hoy);
      d.setDate(hoy.getDate() - i);
      dias.push({
        clave: formatearFechaLocal(d),
        etiqueta: d.toLocaleDateString('es', { weekday: 'short' }).replace('.', ''),
        monto: 0,
      });
    }

    reservas.forEach((r) => {
      if (r.estado === 'cancelada') return;
      if (!r.fecha) return; // reserva vieja/incompleta sin fecha, se ignora
      const clave = r.fecha.includes('T') ? r.fecha.split('T')[0] : r.fecha;
      const dia = dias.find((d) => d.clave === clave);
      if (dia) dia.monto += Number(r.monto) || 0;
    });

    return dias;
  }, [reservas]);

  const maxVentaDia = Math.max(...ventasPorDia.map((d) => d.monto), 1);

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

        {/* Gráfico de ventas de los últimos 7 días */}
        <View style={styles.tarjetaGrafica}>
          <Text style={styles.tarjetaGraficaTitulo}>Ventas de los últimos 7 días</Text>

          <View style={styles.grafica}>
            {ventasPorDia.map((dia) => {
              const alturaBarra =
                dia.monto === 0 ? 2 : Math.max((dia.monto / maxVentaDia) * ALTURA_MAX_BARRA, 4);
              const esHoy = dia.clave === formatearFechaLocal(new Date());

              return (
                <View key={dia.clave} style={styles.columnaBarra}>
                  {dia.monto > 0 && (
                    <Text style={styles.valorBarra}>${dia.monto.toFixed(0)}</Text>
                  )}
                  <View style={styles.pistaBarra}>
                    <View
                      style={[
                        styles.barra,
                        { height: alturaBarra },
                        esHoy && styles.barraHoy,
                      ]}
                    />
                  </View>
                  <Text style={[styles.etiquetaBarra, esHoy && styles.etiquetaBarraHoy]}>
                    {dia.etiqueta}
                  </Text>
                </View>
              );
            })}
          </View>
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
   tarjetaGrafica: {
    marginTop: spacing.sm,
    backgroundColor: colors.bgPanel,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  tarjetaGraficaTitulo: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  grafica: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  columnaBarra: {
    alignItems: 'center',
    flex: 1,
  },
  valorBarra: {
    color: colors.textDim,
    fontSize: 9,
    marginBottom: 2,
  },
  pistaBarra: {
    height: ALTURA_MAX_BARRA,
    justifyContent: 'flex-end',
  },
  barra: {
    width: 18,
    backgroundColor: colors.bgElevated,
    borderRadius: 4,
  },
  barraHoy: {
    backgroundColor: colors.red,
  },
  etiquetaBarra: {
    color: colors.textMuted,
    fontSize: typography.tiny,
    marginTop: spacing.xs,
    textTransform: 'capitalize',
  },
  etiquetaBarraHoy: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
});
