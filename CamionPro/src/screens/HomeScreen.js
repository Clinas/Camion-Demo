import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useStore } from '../context/StoreContext';
import { CAMIONES } from '../data/mockData';
import { Truck, ChevronRight } from 'lucide-react-native';

export default function HomeScreen({ navigation }) {
  const { selectTruck } = useStore();

  const handleSelectTruck = (truck) => {
    selectTruck(truck);
    navigation.navigate('SourceSelect');
  };

  const renderTruck = ({ item }) => (
    <TouchableOpacity 
      style={styles.truckCard}
      onPress={() => handleSelectTruck(item)}
    >
      <View style={styles.iconContainer}>
        <Truck color="#2563eb" size={32} />
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.plate}>{item.plate}</Text>
        <Text style={styles.driver}>{item.driver}</Text>
        <Text style={styles.date}>{item.date}</Text>
      </View>
      <ChevronRight color="#94a3b8" size={24} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={{ color: 'red', fontWeight: 'bold', textAlign: 'center' }}>Control V7</Text>
      <Text style={styles.header}>Control de Carga</Text>
      <Text style={styles.subHeader}>Seleccione un camión para iniciar</Text>
      <FlatList
        data={CAMIONES}
        renderItem={renderTruck}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        style={{ flex: 1 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 40,
  },
  subHeader: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 30,
  },
  list: {
    gap: 15,
  },
  truckCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  iconContainer: {
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 10,
    marginRight: 16,
  },
  infoContainer: {
    flex: 1,
  },
  plate: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  driver: {
    fontSize: 14,
    color: '#64748b',
  },
  date: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
});
