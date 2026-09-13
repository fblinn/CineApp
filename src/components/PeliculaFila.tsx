import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Pelicula } from '@/types/pelicula';
import { colors, radius, spacing, typography } from '@/theme';
import { posterMap } from '@/data/posterMap';

interface PeliculaFilaProps {
  pelicula: Pelicula;
  onEditar: (pelicula: Pelicula) => void;
  onEliminar: (pelicula: Pelicula) => void;
  onToggleEstado: (id: string) => void;
}

export default function PeliculaFila({
  pelicula,
  onEditar,
  onEliminar,
  onToggleEstado,
}: PeliculaFilaProps) {
  const disponible = pelicula.estado === 'disponible';
  const inicial = pelicula.nombre.charAt(0).toUpperCase();

  return (
    <View style={styles.fila}>
      {pelicula.posterImage ? (
        // Imagen elegida por el usuario desde la galería
        <Image source={{ uri: pelicula.posterImage }} style={styles.poster} />
      ) : posterMap[pelicula.codigo] ? (
        // Poster de las películas de ejemplo (viene de assets/posters vía require())
        <Image source={posterMap[pelicula.codigo]} style={styles.poster} />
      ) : (
        <View style={[styles.poster, { backgroundColor: colorPorCodigo(pelicula.codigo) }]}>
          <Text style={styles.posterTexto}>{inicial}</Text>
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.nombre} numberOfLines={1}>
          {pelicula.nombre}
        </Text>
        <Text style={styles.detalle} numberOfLines={1}>
          {pelicula.codigo} · {pelicula.genero} · {pelicula.duracion} min
        </Text>
        <Text style={styles.detalle}>
          {pelicula.salaAsignada} · ${pelicula.precio.toFixed(2)}
        </Text>

        <TouchableOpacity onPress={() => onToggleEstado(pelicula.id)}>
          <View style={[styles.badge, disponible ? styles.badgeOn : styles.badgeOff]}>
            <View style={[styles.badgeDot, disponible ? styles.dotOn : styles.dotOff]} />
            <Text style={styles.badgeTexto}>
              {disponible ? 'Disponible' : 'No disponible'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.acciones}>
        <TouchableOpacity style={styles.botonIcono} onPress={() => onEditar(pelicula)}>
          <Text style={styles.iconoTexto}>✎</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.botonIcono, styles.botonPeligro]}
          onPress={() => onEliminar(pelicula)}
        >
          <Text style={[styles.iconoTexto, styles.iconoPeligro]}>🗑</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Genera un color por si una peli no tiene poster
function colorPorCodigo(codigo: string): string {
  const paleta = ['#e50914', '#7b2ff7', '#00c9a7', '#f5a623', '#1f6feb', '#c2185b'];
  let hash = 0;
  for (let i = 0; i < codigo.length; i++) {
    hash = codigo.charCodeAt(i) + ((hash << 5) - hash);
  }
  return paleta[Math.abs(hash) % paleta.length];
}

const styles = StyleSheet.create({
  fila: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    alignItems: 'center',
  },
  poster: {
    width: 48,
    height: 64,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  posterTexto: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 22,
    fontWeight: '700',
  },
  info: {
    flex: 1,
    gap: 4,
  },
  nombre: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: '700',
  },
  detalle: {
    color: colors.textMuted,
    fontSize: typography.small,
  },
  badge: {
    marginTop: 4,
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
  acciones: {
    gap: spacing.sm,
  },
  botonIcono: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonPeligro: {
    borderColor: 'rgba(229, 9, 20, 0.4)',
  },
  iconoTexto: {
    color: colors.textMuted,
    fontSize: 14,
  },
  iconoPeligro: {
    color: colors.red,
  },
});
