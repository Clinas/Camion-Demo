import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useStore } from "../context/StoreContext";
import { CheckCircle2, ArrowLeft, Settings2, AlertTriangle } from "lucide-react-native";
import { PEDIDOS } from "../data/mockData";

export default function SourceSelectScreen({ navigation }) {
  const { selectedTruck, expectedItems, controlIssues } = useStore();
  const isBlocked = controlIssues.length > 0;
  const sourceByOrder = expectedItems.reduce((acc, item) => {
    acc[item.orderId] = item.sourceLabel;
    return acc;
  }, {});

  const handleStart = () => {
    if (!isBlocked) navigation.navigate("Scanner");
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerNav}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtnHeader}>
          <ArrowLeft color="#1e293b" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerNavTitle}>Configurar Control</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} style={{ flex: 1 }}>
        <View style={styles.truckInfoCard}>
          <Settings2 color="#2563eb" size={24} />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.truckPlate}>{selectedTruck?.plate}</Text>
            <Text style={styles.truckDriver}>{selectedTruck?.driver}</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>LISTA EFECTIVA DE CONTROL</Text>

        <View style={styles.card}>
          <Text style={styles.ruleText}>
            Remito reemplaza a colectada. Colectada reemplaza a pedido. Pedido solo se usa si todos sus productos tienen codigo especifico.
          </Text>

          {selectedTruck?.orders
            .map((id) => PEDIDOS[id])
            .filter(Boolean)
            .sort((a, b) => b.delivery_order - a.delivery_order)
            .map((order) => (
              <View key={order.id} style={styles.option}>
                <View style={styles.optionInfo}>
                  <Text style={styles.optionTitle}>
                    {order.id} - {order.client}
                  </Text>
                  <Text style={styles.optionDesc}>
                    Entrega #{order.delivery_order} - se carga en orden inverso
                  </Text>
                </View>
                <View style={[styles.sourceBadge, !sourceByOrder[order.id] && styles.sourceBadgeError]}>
                  <Text style={styles.sourceBadgeText}>
                    {sourceByOrder[order.id] || "Bloqueado"}
                  </Text>
                </View>
              </View>
            ))}
        </View>

        {isBlocked && (
          <View style={styles.alertCard}>
            <AlertTriangle color="#b91c1c" size={20} />
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>No se puede controlar este camion</Text>
              {controlIssues.map((issue) => (
                <Text key={issue} style={styles.alertText}>
                  {issue}
                </Text>
              ))}
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[styles.btn, isBlocked && styles.btnDisabled]}
          onPress={handleStart}
          disabled={isBlocked}
        >
          <CheckCircle2 color="#fff" size={20} style={{ marginRight: 8 }} />
          <Text style={styles.btnText}>Comenzar Carga</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  headerNav: {
    paddingTop: 45,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  backBtnHeader: { padding: 8, marginLeft: -10 },
  headerNavTitle: { fontSize: 18, fontWeight: "800", color: "#1e293b", marginLeft: 10 },

  scrollContent: { padding: 20 },
  truckInfoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 25,
  },
  truckPlate: { fontSize: 18, fontWeight: "800", color: "#1e293b" },
  truckDriver: { fontSize: 13, color: "#2563eb", fontWeight: "600" },

  sectionLabel: { fontSize: 12, fontWeight: "800", color: "#94a3b8", marginBottom: 10, marginLeft: 5 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    elevation: 2,
  },
  ruleText: { color: "#475569", fontSize: 13, lineHeight: 18, marginBottom: 10 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    gap: 10,
  },
  optionInfo: { flex: 1 },
  optionTitle: { fontSize: 15, fontWeight: "700", color: "#1e293b" },
  optionDesc: { fontSize: 12, color: "#64748b", marginTop: 2 },
  sourceBadge: {
    backgroundColor: "#dcfce7",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  sourceBadgeError: { backgroundColor: "#fee2e2" },
  sourceBadgeText: { color: "#166534", fontSize: 11, fontWeight: "900" },
  alertCard: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 8,
    padding: 14,
    marginTop: 16,
  },
  alertTitle: { color: "#991b1b", fontSize: 14, fontWeight: "800", marginBottom: 4 },
  alertText: { color: "#b91c1c", fontSize: 12, lineHeight: 17 },

  btn: {
    backgroundColor: "#2563eb",
    borderRadius: 8,
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
    elevation: 4,
  },
  btnDisabled: { backgroundColor: "#94a3b8" },
  btnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
});
