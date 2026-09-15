import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { agregarFuncion, selectSalas, selectHorarioOcupadoEnSala } from '@/redux/slices/salasSlice';
import SelectorModal from '@/components/SelectorModal';
import { colors, radius, spacing, typography } from '@/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'CrearFuncion'>;

// Convierte una fecha a "YYYY-MM-DD" en horario local.
function formatearFecha(fecha: Date): string {
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, '0');
  const d = String(fecha.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatearHora(fecha: Date): string {
  const h = String(fecha.getHours()).padStart(2, '0');
  const min = String(fecha.getMinutes()).padStart(2, '0');
  return `${h}:${min}`;
}

export default function CrearFuncionScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const peliculas = useAppSelector((state) => state.peliculas.lista);
  const salas = useAppSelector(selectSalas);

  const peliculasDisponibles = peliculas.filter((p) => p.estado === 'disponible');

  const [peliculaId, setPeliculaId] = useState(peliculasDisponibles[0]?.id ?? '');
  const [salaId, setSalaId] = useState(salas[0]?.id ?? '');
  const [fechaObj, setFechaObj] = useState(new Date());
  const [horaObj, setHoraObj] = useState(new Date());
  const [mostrarFecha, setMostrarFecha] = useState(false);
  const [mostrarHora, setMostrarHora] = useState(false);
  const [error, setError] = useState('');

  // Si la película seleccionada ya no existe o se agregó una, se actualiza sola
  React.useEffect(() => {
    const sigueExistiendo = peliculasDisponibles.some((p) => p.id === peliculaId);
    if (!sigueExistiendo) {
      setPeliculaId(peliculasDisponibles[0]?.id ?? '');
    }
  }, [peliculasDisponibles]);
  
  const fecha = formatearFecha(fechaObj);
  const hora = formatearHora(horaObj);

  const horarioOcupado = useAppSelector(selectHorarioOcupadoEnSala(salaId, fecha, hora));

  const ahora = new Date();
  const fechaHoyStr = formatearFecha(ahora);

  const handleCambiarFecha = (event: any, seleccionada?: Date) => {
    setMostrarFecha(Platform.OS === 'ios');
    if (seleccionada) {
      setFechaObj(seleccionada);
      setError('');
    }
  };

  const handleCambiarHora = (event: any, seleccionada?: Date) => {
    setMostrarHora(Platform.OS === 'ios');
    if (seleccionada) {
      setHoraObj(seleccionada);
      setError('');
    }
  };

  const handleGuardar = () => {
    if (!peliculaId || !salaId) {
      setError('Selecciona una película y una sala.');
      return;
    }

    // No permitir una fecha anterior a hoy
    if (fecha < fechaHoyStr) {
      setError('No puedes registrar una función en una fecha anterior a hoy.');
      return;
    }

    // Si la fecha elegida es hoy, la hora no puede ser anterior a la hora actual
    if (fecha === fechaHoyStr) {
      const horaActual = formatearHora(new Date());
      if (hora < horaActual) {
        setError('No puedes registrar una función a una hora que ya pasó.');
        return;
      }
    }

    // No permitir horario repetido en la misma sala
    if (horarioOcupado) {
      setError('Ya existe una función registrada en esa sala, fecha y hora.');
      return;
    }

    setError('');

    dispatch(
      agregarFuncion({
        peliculaId,
        salaId,
        fecha,
        hora,
      })
    );

    navigation.goBack();
  };

  if (peliculasDisponibles.length === 0) {
    return (
      <SafeAreaView style={styles.contenedor}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.volver}>← Volver</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.vacio}>
          <Text style={styles.vacioTexto}>
            No hay películas disponibles. Agrega o activa una película primero.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.contenedor}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.volver}>← Volver</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.titulo}>Crear función</Text>
        <Text style={styles.subtitulo}>
          Asigna una sala, fecha y hora
        </Text>

        {error !== '' && (
          <View style={styles.alerta}>
            <Text style={styles.alertaTexto}>{error}</Text>
          </View>
        )}

        <SelectorModal
          etiqueta="Película"
          opciones={peliculasDisponibles.map((p) => ({ id: p.id, etiqueta: p.nombre }))}
          valorSeleccionado={peliculaId}
          onSeleccionar={(id) => {
            setPeliculaId(id);
            setError('');
          }}
        />

        <SelectorModal
          etiqueta="Sala"
          opciones={salas.map((s) => ({ id: s.id, etiqueta: s.nombre }))}
          valorSeleccionado={salaId}
          onSeleccionar={(id) => {
            setSalaId(id);
            setError('');
          }}
        />

        <View style={styles.campo}>
          <Text style={styles.etiqueta}>Fecha</Text>
          <TouchableOpacity style={styles.selector} onPress={() => setMostrarFecha(true)}>
            <Text style={styles.selectorTexto}>{fecha}</Text>
          </TouchableOpacity>
          {mostrarFecha && (
            <DateTimePicker
              value={fechaObj}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              minimumDate={new Date()}
              onChange={handleCambiarFecha}
            />
          )}
        </View>

        <View style={styles.campo}>
          <Text style={styles.etiqueta}>Hora</Text>
          <TouchableOpacity style={styles.selector} onPress={() => setMostrarHora(true)}>
            <Text style={styles.selectorTexto}>{hora}</Text>
          </TouchableOpacity>
          {mostrarHora && (
            <DateTimePicker
              value={horaObj}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleCambiarHora}
            />
          )}
        </View>

        <TouchableOpacity style={styles.botonGuardar} onPress={handleGuardar}>
          <Text style={styles.botonGuardarTexto}>Guardar función</Text>
        </TouchableOpacity>
      </ScrollView>
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
  scroll: {
    padding: spacing.md,
  },
  titulo: {
    color: colors.textPrimary,
    fontSize: typography.hero,
    fontWeight: '700',
  },
  subtitulo: {
    color: colors.textMuted,
    fontSize: typography.small,
    marginTop: 4,
    marginBottom: spacing.lg,
  },
  alerta: {
    backgroundColor: 'rgba(229, 9, 20, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.4)',
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  alertaTexto: {
    color: '#ff6b6b',
    fontSize: typography.small,
  },
  campo: {
    marginBottom: spacing.md,
  },
  etiqueta: {
    color: colors.textMuted,
    fontSize: typography.small,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  pickerBox: {
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  picker: {
    color: colors.textPrimary,
  },
  selector: {
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.sm,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
  },
  selectorTexto: {
    color: colors.textPrimary,
    fontSize: typography.body,
  },
  botonGuardar: {
    backgroundColor: colors.red,
    borderRadius: radius.sm,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  botonGuardarTexto: {
    color: '#fff',
    fontWeight: '700',
    fontSize: typography.body,
  },
  vacio: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  vacioTexto: {
    color: colors.textMuted,
    fontSize: typography.small,
    textAlign: 'center',
  },
});
