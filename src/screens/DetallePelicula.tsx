import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { colors, radius, spacing, typography } from '@/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'DetallePelicula'>;

export default function DetallePelicula({ route, navigation }: Props) {
  const { peliculaId } = route.params;

  const pelicula = useAppSelector((state) =>
    state.peliculas.lista.find((p) => p.id === peliculaId)
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
      
      <View style={styles.metaFila}>
        <Text style={styles.metaTexto}>{pelicula.salaAsignada}</Text>
        <Text style={styles.metaTexto}>${pelicula.precio.toFixed(2)}</Text>
      </View>

      <TouchableOpacity
        style={styles.botonAgregar}
        onPress={() => navigation.navigate('Funciones', { peliculaId })}
      >
        <Text style={styles.botonAgregarTexto}>Ver funciones disponibles</Text>
      </TouchableOpacity>
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
    marginBottom: spacing.md,
  },
  metaFila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  metaTexto: {
    color: colors.textMuted,
    fontSize: typography.small,
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
  vacioTitulo: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: '700',
    marginBottom: 4,
  },
});