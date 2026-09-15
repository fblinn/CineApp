import React from 'react';
import { View, Text, Image, FlatList, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { useAppSelector } from '@/redux/hooks';
import { funciones } from '@/data/funciones'; 
import { colors, radius, spacing, typography } from '@/theme';
import { posterMap } from '@/data/posterMap';
import { Pelicula } from '@/types/pelicula';

type Props = NativeStackScreenProps<RootStackParamList, 'DetallePelicula'>;

export default function DetallePeliculas({ route }: Props) {
  const { peliculaId } = route.params;

  const pelicula = useAppSelector((state) =>
    state.peliculas.lista.find((p) => p.id === peliculaId)
  );

  const funcionesDeLaPelicula = funciones.filter(
    (f) => f.peliculaId === peliculaId
  );

  const funcionesCreadas = useAppSelector((state) =>
    state.salas.funciones.filter((f) => f.peliculaId === peliculaId)
  );

  if (!pelicula) {
    return (
      <View style={styles.contenedor}>
        <Text style={styles.vacioTitulo}>Película no encontrada</Text>
      </View>
    );
  }
  const todasFunciones = [...funcionesDeLaPelicula, ...funcionesCreadas];

  return (
    <View style={styles.contenedor}>
      {pelicula.posterImage ? (
              <Image source={{ uri: pelicula.posterImage }} style={styles.poster} />
            ) : posterMap[pelicula.codigo] ? (
              <Image source={posterMap[pelicula.codigo]} style={styles.poster} />
            ) : (
              <View
                style={[
                  styles.poster,
                  styles.posterPlaceholder,
                  { backgroundColor: colorPorCodigo(pelicula.codigo) },
                ]}
              >
              </View>
            )}

      <Text style={styles.titulo}>{pelicula.nombre}</Text>
      <Text style={styles.subtitulo}>
        {pelicula.genero} · {pelicula.duracion} min
      </Text>

      <Text style={styles.seccionTitulo}>Funciones disponibles</Text>

      <FlatList
        data={todasFunciones}
        keyExtractor={(f) => f.id}
        scrollEnabled={false} // porque ya está dentro del scroll/view de la pantalla
        renderItem={({ item }) => (
          <View style={styles.funcionItem}>
            <Text style={styles.funcionTexto}>
              {item.hora}
            </Text>
            <Text style={styles.funcionSala}>{item.salaId}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.vacioTexto}>
            No hay funciones disponibles para esta película
          </Text>
        }
      />
    </View>
  );
}

function colorPorCodigo(codigo: string): string {
  const paleta = ['#e50914', '#7b2ff7', '#00c9a7', '#f5a623', '#1f6feb', '#c2185b'];
  let hash = 0;
  for (let i = 0; i < codigo.length; i++) {
    hash = codigo.charCodeAt(i) + ((hash << 5) - hash);
  }
  return paleta[Math.abs(hash) % paleta.length];
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    backgroundColor: colors.bgBase,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  poster: {
    width: '100%',
    height: 320,
    borderRadius: radius.md,
    marginBottom: spacing.md,
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
  sinopsis: {
    color: colors.textPrimary,
    fontSize: typography.body,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  seccionTitulo: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  funcionItem: {
    backgroundColor: colors.bgPanel,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  funcionTexto: {
    color: colors.textPrimary,
    fontSize: typography.small,
    fontWeight: '600',
  },
  funcionSala: {
    color: colors.textMuted,
    fontSize: typography.small,
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
  posterPlaceholder: {},
  posterTexto: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 36,
    fontWeight: '700',
  },
});