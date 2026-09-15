import { useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import type { RootStackParamList } from '@/navigation/AppNavigator';

// ---------- Tipos ----------

type EstadoAsiento = "disponible" | "ocupado" | "seleccionado";

interface Asiento {
  id: string; // ej: "A1"
  fila: string; // ej: "A"
  numero: number; // ej: 1
  estado: EstadoAsiento;
}

type SeleccionAsientosRouteProp = RouteProp<
  RootStackParamList,
  "SeleccionAsientos"
>;

const FILAS = 7;
const COLUMNAS = 10;

const OCUPADOS_POR_DEFECTO = [
  "A3", "A4", "C5", "C6", "C7", "D2", "F8", "F9", "G1",
];

// ---------- Generación de la sala ----------
// (función pura, sin hooks — solo arma la matriz de asientos)

function generarSala(
  filas: number,
  columnas: number,
  ocupados: Set<string>
): Asiento[][] {
  const letras = Array.from({ length: filas }, (_, i) =>
    String.fromCharCode(65 + i) // A, B, C, ...
  );

  return letras.map((fila) => {
    const asientos: Asiento[] = [];
    for (let n = 1; n <= columnas; n++) {
      const id = `${fila}${n}`;
      asientos.push({
        id,
        fila,
        numero: n,
        estado: ocupados.has(id) ? "ocupado" : "disponible",
      });
    }
    return asientos;
  });
}

// ---------- Componente / Pantalla ----------

export default function SeleccionAsientosScreen() {
  // Aquí SÍ va el hook: dentro del componente, no dentro de generarSala.
  const route = useRoute<SeleccionAsientosRouteProp>();
  const { funcionId, pelicula } = route.params;

  // TODO: cuando tengas backend, reemplaza esto por un fetch usando funcionId
  // para traer los asientos ocupados de ESA función específica.
  const asientosOcupados = OCUPADOS_POR_DEFECTO;

  const noDisponible = pelicula.estado === "no disponible";

  const [sala, setSala] = useState<Asiento[][]>(() =>
    generarSala(FILAS, COLUMNAS, new Set(asientosOcupados))
  );

  const seleccionados = useMemo(
    () => sala.flat().filter((a) => a.estado === "seleccionado"),
    [sala]
  );

  const total = useMemo(
    () => seleccionados.length * pelicula.precio,
    [seleccionados, pelicula.precio]
  );

  function alternarAsiento(id: string) {
    if (noDisponible) return;
    setSala((prev) =>
      prev.map((fila) =>
        fila.map((asiento) => {
          if (asiento.id !== id || asiento.estado === "ocupado") return asiento;
          return {
            ...asiento,
            estado:
              asiento.estado === "seleccionado" ? "disponible" : "seleccionado",
          };
        })
      )
    );
  }

  function confirmarCompra() {
    if (seleccionados.length === 0) return;
    const ids = seleccionados.map((a) => a.id);
    setSala((prev) =>
      prev.map((fila) =>
        fila.map((asiento) =>
          asiento.estado === "seleccionado"
            ? { ...asiento, estado: "ocupado" }
            : asiento
        )
      )
    );
    console.log("Función:", funcionId, "Asientos:", ids, "Total:", total);
    // Aquí llamarías a tu API para guardar la compra.
  }

  return (
    <ScrollView contentContainerStyle={styles.contenedor}>
      <View style={styles.encabezado}>
        <Text style={styles.titulo}>
          {pelicula.salaAsignada} — {pelicula.nombre}
        </Text>
        <Text style={styles.subtitulo}>
          {pelicula.genero} · {pelicula.duracion} min · Clasificación{" "}
          {pelicula.clasificacion} · ${pelicula.precio.toFixed(2)} c/u
        </Text>
        {noDisponible && (
          <Text style={styles.avisoNoDisponible}>
            Esta función no está disponible por el momento.
          </Text>
        )}
      </View>

      <View style={styles.pantallaContenedor}>
        <View style={styles.pantalla} />
        <Text style={styles.pantallaTexto}>Pantalla</Text>
      </View>

      <View
        style={[styles.sala, noDisponible && styles.salaDeshabilitada]}
        pointerEvents={noDisponible ? "none" : "auto"}
      >
        {sala.map((fila) => (
          <View key={fila[0].fila} style={styles.filaContenedor}>
            <Text style={styles.filaEtiqueta}>{fila[0].fila}</Text>
            <View style={styles.filaAsientos}>
              {fila.map((asiento, idx) => {
                const esPasillo = idx === Math.floor(COLUMNAS / 2) - 1;
                return (
                  <Pressable
                    key={asiento.id}
                    disabled={asiento.estado === "ocupado"}
                    onPress={() => alternarAsiento(asiento.id)}
                    style={[
                      styles.asiento,
                      esPasillo && styles.asientoPasillo,
                      asiento.estado === "ocupado" && styles.asientoOcupado,
                      asiento.estado === "seleccionado" &&
                        styles.asientoSeleccionado,
                    ]}
                  >
                    <Text
                      style={[
                        styles.asientoTexto,
                        asiento.estado === "ocupado" &&
                          styles.asientoTextoOcupado,
                        asiento.estado === "seleccionado" &&
                          styles.asientoTextoSeleccionado,
                      ]}
                    >
                      {asiento.numero}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
      </View>

      <View style={styles.leyenda}>
        <ItemLeyenda color="#232530" texto="Disponible" />
        <ItemLeyenda color="#d97757" texto="Seleccionado" />
        <ItemLeyenda color="#2a2a35" texto="Ocupado" />
      </View>

      <View style={styles.resumen}>
        <View>
          <Text style={styles.resumenTexto}>
            {seleccionados.length === 0
              ? "Ningún asiento seleccionado"
              : `${seleccionados.length} asiento${
                  seleccionados.length > 1 ? "s" : ""
                }: ${seleccionados.map((a) => a.id).join(", ")}`}
          </Text>
          <Text style={styles.total}>${total.toFixed(2)}</Text>
        </View>
        <Pressable
          onPress={confirmarCompra}
          disabled={seleccionados.length === 0 || noDisponible}
          style={[
            styles.botonConfirmar,
            (seleccionados.length === 0 || noDisponible) &&
              styles.botonDeshabilitado,
          ]}
        >
          <Text style={styles.botonConfirmarTexto}>Confirmar compra</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function ItemLeyenda({ color, texto }: { color: string; texto: string }) {
  return (
    <View style={styles.itemLeyenda}>
      <View style={[styles.cuadroLeyenda, { backgroundColor: color }]} />
      <Text style={styles.itemLeyendaTexto}>{texto}</Text>
    </View>
  );
}

// ---------- Estilos ----------

const styles = StyleSheet.create({
  contenedor: {
    backgroundColor: "#12141c",
    paddingVertical: 32,
    paddingHorizontal: 16,
    alignItems: "center",
    gap: 24,
  },
  encabezado: {
    alignItems: "center",
  },
  titulo: {
    color: "#e9e7e2",
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
  },
  subtitulo: {
    color: "#9a97a8",
    fontSize: 13,
    marginTop: 4,
    textAlign: "center",
  },
  avisoNoDisponible: {
    color: "#e0806b",
    fontSize: 13,
    marginTop: 8,
    textAlign: "center",
  },
  pantallaContenedor: {
    alignItems: "center",
    gap: 4,
    width: "100%",
  },
  pantalla: {
    width: "80%",
    height: 8,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    backgroundColor: "#5b5a70",
    opacity: 0.7,
  },
  pantallaTexto: {
    color: "#6f6d80",
    fontSize: 11,
  },
  sala: {
    gap: 8,
    alignItems: "center",
  },
  salaDeshabilitada: {
    opacity: 0.4,
  },
  filaContenedor: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  filaEtiqueta: {
    width: 16,
    color: "#6f6d80",
    fontSize: 12,
    textAlign: "right",
  },
  filaAsientos: {
    flexDirection: "row",
    gap: 6,
  },
  asiento: {
    width: 28,
    height: 28,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    backgroundColor: "#232530",
    alignItems: "center",
    justifyContent: "center",
  },
  asientoPasillo: {
    marginRight: 12,
  },
  asientoOcupado: {
    backgroundColor: "#2a2a35",
  },
  asientoSeleccionado: {
    backgroundColor: "#d97757",
  },
  asientoTexto: {
    fontSize: 10,
    color: "#8a879a",
  },
  asientoTextoOcupado: {
    color: "#4c4a58",
  },
  asientoTextoSeleccionado: {
    color: "#1a1a1a",
    fontWeight: "600",
  },
  leyenda: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 16,
  },
  itemLeyenda: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  cuadroLeyenda: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  itemLeyendaTexto: {
    color: "#9a97a8",
    fontSize: 12,
  },
  resumen: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#2a2a35",
    paddingTop: 20,
  },
  resumenTexto: {
    color: "#9a97a8",
    fontSize: 13,
  },
  total: {
    color: "#e9e7e2",
    fontSize: 20,
    fontWeight: "600",
    marginTop: 4,
  },
  botonConfirmar: {
    backgroundColor: "#d97757",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  botonDeshabilitado: {
    opacity: 0.3,
  },
  botonConfirmarTexto: {
    color: "#1a1a1a",
    fontWeight: "600",
    fontSize: 14,
  },
});
