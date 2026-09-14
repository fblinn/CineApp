import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { Pelicula } from '@/types/pelicula';
import { colors, radius, spacing, typography } from '@/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Catalogo'>;

export default function DetallePeliculas ( {navigation}: Props) {
    const peliculas = useAppSelector((state) => state.peliculas.lista);
    const dispatch = useAppDispatch();

    return (
        <View style={styles.contenedor}>
            <Text style={styles.titulo}>CineFlix </Text>
            <Text style={styles.subtitulo}>
                {peliculas.length} películas
            </Text>
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
