import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { eliminarPelicula, cambiarEstadoPelicula } from '@/redux/slices/peliculasSlice';
import { Pelicula } from '@/types/pelicula';
import PeliculaFila from '@/components/PeliculaFila';
import FormularioPeliculaScreen from './FormularioPeliculaScreen';
import { colors, radius, spacing, typography } from '@/theme';

export default function PeliculasScreen() {
  const dispatch = useAppDispatch();
  const peliculas = useAppSelector((state) => state.peliculas.lista);

  const [busqueda, setBusqueda] = useState('');
  const [formularioVisible, setFormularioVisible] = useState(false);
  const [peliculaEditar, setPeliculaEditar] = useState<Pelicula | null>(null);
  const [peliculaEliminar, setPeliculaEliminar] = useState<Pelicula | null>(null);

  const peliculasFiltradas = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return peliculas;

    return peliculas.filter(
      (p) =>
        p.nombre.toLowerCase().includes(termino) ||
        p.genero.toLowerCase().includes(termino) ||
        p.salaAsignada.toLowerCase().includes(termino) ||
        p.clasificacion.toLowerCase().includes(termino)
    );
  }, [peliculas, busqueda]);

  const abrirAgregar = () => {
    setPeliculaEditar(null);
    setFormularioVisible(true);
  };

  const abrirEditar = (pelicula: Pelicula) => {
    setPeliculaEditar(pelicula);
    setFormularioVisible(true);
  };

  const confirmarEliminar = () => {
    if (peliculaEliminar) {
      dispatch(eliminarPelicula(peliculaEliminar.id));
    }
    setPeliculaEliminar(null);
  };

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>Gestión de Películas</Text>
      <Text style={styles.subtitulo}>
        {peliculasFiltradas.length} de {peliculas.length} películas
      </Text>

      <TextInput
        style={styles.buscador}
        placeholder="Buscar por nombre, género, sala..."
        placeholderTextColor={colors.textDim}
        value={busqueda}
        onChangeText={setBusqueda}
      />

      <TouchableOpacity style={styles.botonAgregar} onPress={abrirAgregar}>
        <Text style={styles.botonAgregarTexto}>+ Agregar película</Text>
      </TouchableOpacity>

      <FlatList
        data={peliculasFiltradas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PeliculaFila
            pelicula={item}
            onEditar={abrirEditar}
            onEliminar={setPeliculaEliminar}
            onToggleEstado={(id) => dispatch(cambiarEstadoPelicula(id))}
          />
        )}
        ListEmptyComponent={
          <View style={styles.vacio}>
            <Text style={styles.vacioTitulo}>No hay películas que coincidan</Text>
            <Text style={styles.vacioTexto}>
              Ajusta la búsqueda o agrega una nueva película.
            </Text>
          </View>
        }
        contentContainerStyle={peliculasFiltradas.length === 0 && styles.listaVacia}
      />

      <FormularioPeliculaScreen
        visible={formularioVisible}
        peliculaEditar={peliculaEditar}
        onClose={() => setFormularioVisible(false)}
      />

      {/* Confirmación de eliminar */}
      <Modal
        visible={peliculaEliminar !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPeliculaEliminar(null)}
      >
        <View style={styles.confirmOverlay}>
          <View style={styles.confirmTarjeta}>
            <Text style={styles.confirmTitulo}>Eliminar película</Text>
            <Text style={styles.confirmTexto}>
              ¿Seguro que quieres eliminar{' '}
              <Text style={styles.confirmNombre}>{peliculaEliminar?.nombre}</Text>? Esta
              acción no se puede deshacer.
            </Text>

            <View style={styles.confirmAcciones}>
              <TouchableOpacity
                style={styles.botonSecundario}
                onPress={() => setPeliculaEliminar(null)}
              >
                <Text style={styles.botonSecundarioTexto}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.botonPeligro} onPress={confirmarEliminar}>
                <Text style={styles.botonPrimarioTexto}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
  },
  subtitulo: {
    color: colors.textMuted,
    fontSize: typography.small,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  buscador: {
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.sm,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    color: colors.textPrimary,
    fontSize: typography.body,
    marginBottom: spacing.sm,
  },
  botonAgregar: {
    backgroundColor: colors.red,
    borderRadius: radius.sm,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  botonAgregarTexto: {
    color: '#fff',
    fontWeight: '700',
    fontSize: typography.small,
  },
  vacio: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
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
  },
  listaVacia: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  confirmTarjeta: {
    width: '100%',
    backgroundColor: colors.bgPanel,
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  confirmTitulo: {
    color: colors.textPrimary,
    fontSize: typography.title,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  confirmTexto: {
    color: colors.textMuted,
    fontSize: typography.small,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  confirmNombre: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  confirmAcciones: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
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
  botonPeligro: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: radius.sm,
    backgroundColor: colors.red,
  },
  botonPrimarioTexto: {
    color: '#fff',
    fontSize: typography.small,
    fontWeight: '700',
  },
});
