// components/PeliculaCard.tsx
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Pelicula } from '@/types/pelicula';
import { colors, radius, spacing, typography } from '@/theme';
import { posterMap } from '@/data/posterMap';

interface Props {
  pelicula: Pelicula;
  onToggleEstado?: (id: string) => void;
  onPress: () => void;
}

export default function PeliculaCard({ pelicula, onToggleEstado, onPress }: Props) {
  const disponible = pelicula.estado === 'disponible';
  const inicial = pelicula.nombre.charAt(0).toUpperCase();

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
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
          <Text style={styles.posterTexto}>{inicial}</Text>
        </View>
      )}

      <Text style={styles.nombre} numberOfLines={1}>
        {pelicula.nombre}
      </Text>
      <Text style={styles.detalle} numberOfLines={1}>
        {pelicula.genero} · {pelicula.duracion} min
      </Text>
      <Text style={styles.detalle}>
        {pelicula.salaAsignada} · ${pelicula.precio.toFixed(2)}
      </Text>

      {onToggleEstado ? (
        <TouchableOpacity onPress={() => onToggleEstado(pelicula.id)}>
          <View style={[styles.badge, disponible ? styles.badgeOn : styles.badgeOff]}>
            <View style={[styles.badgeDot, disponible ? styles.dotOn : styles.dotOff]} />
            <Text style={styles.badgeTexto}>
              {disponible ? 'Disponible' : 'No disponible'}
            </Text>
          </View>
        </TouchableOpacity>
      ) : (
        <View style={[styles.badge, disponible ? styles.badgeOn : styles.badgeOff]}>
          <View style={[styles.badgeDot, disponible ? styles.dotOn : styles.dotOff]} />
          <Text style={styles.badgeTexto}>
            {disponible ? 'Disponible' : 'No disponible'}
          </Text>
        </View>
      )}
    </TouchableOpacity>
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
  card: {
    flex: 1,
    margin: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.bgPanel ?? '#141414',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  poster: {
    width: '100%',
    height: 160,
    borderRadius: radius.sm,
    marginBottom: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  posterPlaceholder: {},
  posterTexto: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 36,
    fontWeight: '700',
  },
  nombre: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: '700',
  },
  detalle: {
    color: colors.textMuted,
    fontSize: typography.small,
    marginTop: 2,
  },
  badge: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  badgeOn: {
    backgroundColor: 'rgba(46, 204, 113, 0.15)',
  },
  badgeOff: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotOn: {
    backgroundColor: colors.green,
  },
  dotOff: {
    backgroundColor: colors.textDim,
  },
  badgeTexto: {
    color: colors.textPrimary,
    fontSize: typography.tiny,
    fontWeight: '600',
  },
});