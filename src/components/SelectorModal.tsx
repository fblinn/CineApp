import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import { colors, radius, spacing, typography } from '@/theme';

interface Opcion {
  id: string;
  etiqueta: string;
}

interface SelectorModalProps {
  etiqueta: string;
  opciones: Opcion[];
  valorSeleccionado: string;
  onSeleccionar: (id: string) => void;
  placeholder?: string;
}

// Selector propio: botón que abre una lista dentro de un modal con propios colores.
export default function SelectorModal({
  etiqueta,
  opciones,
  valorSeleccionado,
  onSeleccionar,
  placeholder = 'Selecciona una opción',
}: SelectorModalProps) {
  const [abierto, setAbierto] = useState(false);

  const opcionActual = opciones.find((o) => o.id === valorSeleccionado);

  return (
    <View style={styles.campo}>
      <Text style={styles.etiqueta}>{etiqueta}</Text>

      <TouchableOpacity style={styles.selector} onPress={() => setAbierto(true)}>
        <Text style={opcionActual ? styles.selectorTexto : styles.selectorPlaceholder}>
          {opcionActual ? opcionActual.etiqueta : placeholder}
        </Text>
        <Text style={styles.flecha}>▾</Text>
      </TouchableOpacity>

      <Modal visible={abierto} transparent animationType="fade" onRequestClose={() => setAbierto(false)}>
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setAbierto(false)}
        >
          <View style={styles.tarjeta} onStartShouldSetResponder={() => true}>
            <Text style={styles.tarjetaTitulo}>{etiqueta}</Text>

            <FlatList
              data={opciones}
              keyExtractor={(item) => item.id}
              style={styles.lista}
              renderItem={({ item }) => {
                const activo = item.id === valorSeleccionado;
                return (
                  <TouchableOpacity
                    style={[styles.opcion, activo && styles.opcionActiva]}
                    onPress={() => {
                      onSeleccionar(item.id);
                      setAbierto(false);
                    }}
                  >
                    <Text style={[styles.opcionTexto, activo && styles.opcionTextoActivo]}>
                      {item.etiqueta}
                    </Text>
                    {activo && <Text style={styles.check}>✓</Text>}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <Text style={styles.vacioTexto}>No hay opciones disponibles.</Text>
              }
            />

            <TouchableOpacity style={styles.cerrar} onPress={() => setAbierto(false)}>
              <Text style={styles.cerrarTexto}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  campo: {
    marginBottom: spacing.md,
  },
  etiqueta: {
    color: colors.textMuted,
    fontSize: typography.small,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  selectorPlaceholder: {
    color: colors.textDim,
    fontSize: typography.body,
  },
  flecha: {
    color: colors.textMuted,
    fontSize: 14,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  tarjeta: {
    width: '100%',
    maxHeight: '70%',
    backgroundColor: colors.bgPanel,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  tarjetaTitulo: {
    color: colors.textPrimary,
    fontSize: typography.title,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  lista: {
    flexGrow: 0,
  },
  opcion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
  },
  opcionActiva: {
    backgroundColor: colors.bgElevated,
  },
  opcionTexto: {
    color: colors.textPrimary,
    fontSize: typography.body,
  },
  opcionTextoActivo: {
    fontWeight: '700',
  },
  check: {
    color: colors.red,
    fontWeight: '700',
  },
  vacioTexto: {
    color: colors.textMuted,
    fontSize: typography.small,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
  cerrar: {
    marginTop: spacing.sm,
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  cerrarTexto: {
    color: colors.textMuted,
    fontSize: typography.small,
    fontWeight: '600',
  },
});
