import React from 'react';
import { View, Text, Image, FlatList, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { useAppSelector } from '@/redux/hooks';
import { funciones } from '@/data/funciones'; 
import { colors, radius, spacing, typography } from '@/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'DetallePelicula'>;

export default function DetallePeliculas({ route }: Props) {
  const { peliculaId } = route.params;

  const pelicula = useAppSelector((state) =>
    state.peliculas.lista.find((p) => p.id === peliculaId)
  );

  // Filtras directo aquí, sin necesidad de navegar a otra pantalla
  const funcionesDeLaPelicula = funciones.filter(
    (f) => f.peliculaId === peliculaId
  );

  if (!pelicula) {
    return (
      <View style={styles.contenedor}>
        <Text style={styles.vacioTitulo}>Película no encontrada</Text>
      </View>
    );
  }

  return (
    <View style={styles.contenedor}>
      {pelicula.posterImage && (
        <Image source={{ uri: pelicula.posterImage }} style={styles.poster} />
      )}

      <Text style={styles.titulo}>{pelicula.nombre}</Text>
      <Text style={styles.subtitulo}>
        {pelicula.genero} · {pelicula.duracion} min
      </Text>

      <Text style={styles.seccionTitulo}>Funciones disponibles</Text>

      <FlatList
        data={funcionesDeLaPelicula}
        keyExtractor={(f) => f.id}
        scrollEnabled={false} // porque ya está dentro del scroll/view de la pantalla
        renderItem={({ item }) => (
          <View style={styles.funcionItem}>
            <Text style={styles.funcionTexto}>
              {item.hora} · {item.formato} · {item.idioma}
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
});