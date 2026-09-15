import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { cambiarEstadoPelicula } from '@/redux/slices/peliculasSlice';
import { colors, radius, spacing, typography } from '@/theme';
import PeliculaCard from '@/components/PeliculaCard'; 
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Catalogo'>;

const TODOS = 'Todos';

export default function IndexScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const peliculas = useAppSelector((state) => state.peliculas.lista);

  const [busqueda, setBusqueda] = useState('');
  const [filtroGenero, setFiltroGenero] = useState(TODOS);
  const [filtroClasificacion, setFiltroClasificacion] = useState(TODOS);
  const [filtroSala, setFiltroSala] = useState(TODOS);

  const generos = useMemo(
    () => Array.from(new Set(peliculas.map((p) => p.genero))).sort(),
    [peliculas]
  );
  const clasificaciones = useMemo(
    () => Array.from(new Set(peliculas.map((p) => p.clasificacion))).sort(),
    [peliculas]
  );
  const salas = useMemo(
    () => Array.from(new Set(peliculas.map((p) => p.salaAsignada))).sort(),
    [peliculas]
  );

  const peliculasFiltradas = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

    return peliculas.filter((p) => {
      const coincideBusqueda =
        termino === '' ||
        p.nombre.toLowerCase().includes(termino) ||
        p.genero.toLowerCase().includes(termino) ||
        p.salaAsignada.toLowerCase().includes(termino) ||
        p.clasificacion.toLowerCase().includes(termino);

      const coincideGenero = filtroGenero === TODOS || p.genero === filtroGenero;
      const coincideClasificacion =
        filtroClasificacion === TODOS || p.clasificacion === filtroClasificacion;
      const coincideSala = filtroSala === TODOS || p.salaAsignada === filtroSala;

      return coincideBusqueda && coincideGenero && coincideClasificacion && coincideSala;
    });
  }, [peliculas, busqueda, filtroGenero, filtroClasificacion, filtroSala]);

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>CineFlix </Text>
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

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtrosScroll}
        contentContainerStyle={styles.filtrosFila}
      >
        <FiltroChip
          etiqueta="Género"
          valor={filtroGenero}
          opciones={generos}
          onChange={setFiltroGenero}
        />
        <FiltroChip
          etiqueta="Clasificación"
          valor={filtroClasificacion}
          opciones={clasificaciones}
          onChange={setFiltroClasificacion}
        />
        <FiltroChip
          etiqueta="Sala"
          valor={filtroSala}
          opciones={salas}
          onChange={setFiltroSala}
        />
      </ScrollView>

      <TouchableOpacity style={styles.botonSiguiente} onPress={() => navigation.navigate('GestionPeliculas')}>
        <Text>Vista de admin</Text>
      </TouchableOpacity>

      {peliculasFiltradas.length === 0 ? (
        <View style={styles.vacio}>
          <Text style={styles.vacioTitulo}>No se encontraron películas</Text>
          <Text style={styles.vacioTexto}>
            Prueba con otros filtros o términos de búsqueda.
          </Text>
        </View>
      ) : (
        <FlatList
          data={peliculasFiltradas}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ gap: spacing.sm, paddingHorizontal: spacing.sm }}
          contentContainerStyle={styles.lista}
          renderItem={({ item }) => (
              <PeliculaCard
              pelicula={item}
              onToggleEstado={(id) => dispatch(cambiarEstadoPelicula(id))}
              onPress={() =>
                navigation.navigate('DetallePelicula', { peliculaId: item.id })
              }
              />
          )}
        />
      )}
    </View>
  );
}

function FiltroChip({
  etiqueta,
  valor,
  opciones,
  onChange,
}: {
  etiqueta: string;
  valor: string;
  opciones: string[];
  onChange: (v: string) => void;
}) {
  const [abierto, setAbierto] = useState(false);
  const activo = valor !== TODOS;

  return (
    <View>
      <TouchableOpacity
        style={[styles.chip, activo && styles.chipActivo]}
        onPress={() => setAbierto(true)}
      >
        <Text
          style={[styles.chipTexto, activo && styles.chipTextoActivo]}
          numberOfLines={1}
        >
          {activo ? valor : etiqueta} ▾
        </Text>
      </TouchableOpacity>

      <Modal visible={abierto} transparent animationType="fade" onRequestClose={() => setAbierto(false)}>
        <TouchableOpacity
          style={styles.chipOverlay}
          activeOpacity={1}
          onPress={() => setAbierto(false)}
        >
          <View style={styles.chipTarjeta} onStartShouldSetResponder={() => true}>
            <Text style={styles.chipTitulo}>{etiqueta}</Text>
            <TouchableOpacity
              style={styles.chipOpcion}
              onPress={() => {
                onChange(TODOS);
                setAbierto(false);
              }}
            >
              <Text style={styles.chipOpcionTexto}>Todos</Text>
            </TouchableOpacity>
            {opciones.map((op) => (
              <TouchableOpacity
                key={op}
                style={styles.chipOpcion}
                onPress={() => {
                  onChange(op);
                  setAbierto(false);
                }}
              >
                <Text style={styles.chipOpcionTexto}>{op}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flex: 1,                  
    justifyContent: 'center', 
    alignItems: 'center',     
  },
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
  filtrosScroll: {
    marginBottom: spacing.sm,
    maxHeight:45,
  },
  filtrosFila: {
    gap: spacing.sm,
    paddingRight: spacing.md,
    flexGrow: 1,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  chip: {
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 16,
    minWidth: 90,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  chipActivo: {
    backgroundColor: colors.red,
    borderColor: colors.red,
  },
  chipTexto: {
    color: colors.textPrimary,
    fontSize: typography.tiny,
    fontWeight: '700',
  },
  chipTextoActivo: {
    color: '#fff',
  },
  chipOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  chipTarjeta: {
    width: '100%',
    maxHeight: '70%',
    backgroundColor: colors.bgPanel,
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  chipTitulo: {
    color: colors.textPrimary,
    fontSize: typography.title,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  chipOpcion: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  chipOpcionTexto: {
    color: colors.textPrimary,
    fontSize: typography.body,
  },
  botonSiguiente:{
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
  lista : {
    paddingBottom: spacing.xl,
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
