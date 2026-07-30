import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useStore } from "../context/StoreContext";
import { CheckCircle2, ArrowLeft, Boxes, Hash, Layers3, AlertTriangle, Circle } from "lucide-react-native";

export default function SourceSelectScreen({ navigation }) {
  const { selectedTruck, expectedItems, controlIssues, stageCompletions, selectControlStage } = useStore();
  const isBlocked = controlIssues.length > 0;

  const handleStart = (stageId) => {
    if (!isBlocked) {
      selectControlStage(stageId);
      navigation.navigate("Scanner");
    }
  };
  const countFor = (group) =>
    expectedItems.filter(
      (item) =>
        item.grupoArticulo === group &&
        !(group === "CAJAS" ? stageCompletions.cajas : stageCompletions.correlativos),
    ).length;
  const bothDone = Boolean(stageCompletions.cajas && stageCompletions.correlativos);
  const stages = [
    { id: "cajas", title: "Control de cajas", description: `${countFor("CAJAS")} productos del grupo CAJAS`, icon: Boxes, done: stageCompletions.cajas },
    { id: "correlativos", title: "Control de correlativos", description: `${countFor("CORRELATIVOS")} productos del grupo CORRELATIVOS`, icon: Hash, done: stageCompletions.correlativos },
    {
      id: "completo",
      title: "Hacer todo junto",
      description:
        stageCompletions.cajas || stageCompletions.correlativos
          ? "Controlar solamente las etapas que aun estan pendientes"
          : "Controlar cajas y correlativos en una sola operacion",
      icon: Layers3,
      done: bothDone,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.headerNav}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtnHeader}>
          <ArrowLeft color="#1e293b" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerNavTitle}>Seleccionar etapa</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} style={{ flex: 1 }}>
        <View style={styles.truckInfoCard}>
          <Layers3 color="#2563eb" size={24} />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.truckPlate}>{selectedTruck?.plate}</Text>
            <Text style={styles.truckDriver}>{selectedTruck?.driver}</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>CONTROL DE CARGA</Text>

        <View style={styles.card}>
          <Text style={styles.ruleText}>
            Los productos se separan por grupo de articulos. El control general queda finalizado cuando Cajas y Correlativos estan cumplidos.
          </Text>
          {stages.map((stage) => {
            const Icon = stage.icon;
            return (
              <TouchableOpacity
                key={stage.id}
                style={[styles.option, stage.done && styles.optionDone]}
                onPress={() => handleStart(stage.id)}
                disabled={isBlocked || Boolean(stage.done)}
              >
                <Icon color={stage.done ? "#15803d" : "#2563eb"} size={24} />
                <View style={styles.optionInfo}>
                  <Text style={styles.optionTitle}>{stage.title}</Text>
                  <Text style={styles.optionDesc}>{stage.description}</Text>
                  {stage.done?.observation ? (
                    <Text style={styles.observation}>Observ. del Operador: {stage.done.observation}</Text>
                  ) : null}
                  {stage.done?.findings?.length > 0 ? (
                    <Text style={styles.findings}>
                      Advertencias: {stage.done.findings.join(" · ")}
                    </Text>
                  ) : stage.done ? (
                    <Text style={styles.noFindings}>Sin advertencias.</Text>
                  ) : null}
                </View>
                {stage.done ? <CheckCircle2 color="#16a34a" size={22} /> : <Circle color="#94a3b8" size={22} />}
              </TouchableOpacity>
            );
          })}
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

        {bothDone && <View style={styles.completeCard}><CheckCircle2 color="#15803d" size={22} /><Text style={styles.completeText}>Control general finalizado</Text></View>}
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
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  optionDone: { backgroundColor: "#f0fdf4" },
  optionInfo: { flex: 1 },
  optionTitle: { fontSize: 15, fontWeight: "700", color: "#1e293b" },
  optionDesc: { fontSize: 12, color: "#64748b", marginTop: 2 },
  observation: { fontSize: 11, color: "#15803d", marginTop: 5, fontStyle: "italic" },
  findings: { fontSize: 11, color: "#b45309", marginTop: 4, fontWeight: "600" },
  noFindings: { fontSize: 11, color: "#15803d", marginTop: 4, fontWeight: "600" },
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
  completeCard: { flexDirection: "row", alignItems: "center", gap: 9, backgroundColor: "#dcfce7", padding: 14, borderRadius: 8, marginTop: 16 },
  completeText: { color: "#166534", fontWeight: "800" },
});
