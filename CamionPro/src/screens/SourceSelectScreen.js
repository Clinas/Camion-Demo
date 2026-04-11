import React from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useStore } from '../context/StoreContext';
import { CheckCircle2, ArrowLeft, Settings2 } from 'lucide-react-native';

export default function SourceSelectScreen({ navigation }) {
  const { loadingConfig, setLoadingConfig, selectedTruck } = useStore();

  const toggleSwitch = (key) => {
    setLoadingConfig({ ...loadingConfig, [key]: !loadingConfig[key] });
  };

  const handleStart = () => {
    navigation.navigate('Scanner');
  };

  return (
    <View style={styles.container}>
      {/* Custom Header for Web */}
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

        <Text style={styles.sectionLabel}>FUENTES DE VALIDACIÓN</Text>
        
        <View style={styles.card}>
          <View style={styles.option}>
            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>Validar vs Pedidos</Text>
              <Text style={styles.optionDesc}>Coteja con lo que pidió el cliente originalmente.</Text>
            </View>
            <Switch 
              value={loadingConfig.useOrders} 
              onValueChange={() => toggleSwitch('useOrders')} 
              trackColor={{ false: "#e2e8f0", true: "#93c5fd" }}
              thumbColor={loadingConfig.useOrders ? "#2563eb" : "#f1f5f9"}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.option}>
            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>Validar vs Colectas</Text>
              <Text style={styles.optionDesc}>Coteja con lo que ya se preparó en depósito.</Text>
            </View>
            <Switch 
              value={loadingConfig.useCollections} 
              onValueChange={() => toggleSwitch('useCollections')} 
              trackColor={{ false: "#e2e8f0", true: "#93c5fd" }}
              thumbColor={loadingConfig.useCollections ? "#2563eb" : "#f1f5f9"}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.option}>
            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>Validar vs Remitos</Text>
              <Text style={styles.optionDesc}>Coteja con el documento legal de transporte.</Text>
            </View>
            <Switch 
              value={loadingConfig.useRemitos} 
              onValueChange={() => toggleSwitch('useRemitos')} 
              trackColor={{ false: "#e2e8f0", true: "#93c5fd" }}
              thumbColor={loadingConfig.useRemitos ? "#2563eb" : "#f1f5f9"}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleStart}>
          <CheckCircle2 color="#fff" size={20} style={{ marginRight: 8 }} />
          <Text style={styles.btnText}>Comenzar Carga</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  headerNav: {
    paddingTop: 45,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backBtnHeader: { padding: 8, marginLeft: -10 },
  headerNavTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b', marginLeft: 10 },
  
  scrollContent: { padding: 20 },
  truckInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 25,
  },
  truckPlate: { fontSize: 18, fontWeight: '800', color: '#1e293b' },
  truckDriver: { fontSize: 13, color: '#2563eb', fontWeight: '600' },
  
  sectionLabel: { fontSize: 12, fontWeight: '800', color: '#94a3b8', marginBottom: 10, marginLeft: 5 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    elevation: 2,
  },
  option: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  optionInfo: { flex: 0.8 },
  optionTitle: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  optionDesc: { fontSize: 12, color: '#64748b', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#f1f5f9' },
  
  btn: {
    backgroundColor: '#2563eb',
    borderRadius: 16,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    elevation: 4,
  },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
