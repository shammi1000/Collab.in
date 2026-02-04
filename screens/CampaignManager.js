import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  TouchableOpacity, Image, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function CampaignManager() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCampaigns = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get('http://192.168.6.29:5000/api/admin/campaigns', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCampaigns(res.data);
    } catch (err) {
      console.error('Fetch error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.put(
        `http://192.168.6.29:5000/api/admin/campaigns/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCampaigns(); // Refresh list
    } catch (err) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  return (
    <View>
      {loading ? (
        <ActivityIndicator color="#8E2DE2" size="large" />
      ) : (
        <ScrollView>
          {campaigns.map((item) => (
            <View key={item._id} style={styles.card}>
              <Text style={styles.name}>{item.title}</Text>
              <Text style={styles.info}>By: {item.createdBy?.name || 'Unknown'}</Text>
              <Text style={styles.info}>Budget: ${item.budget}</Text>
              <Text style={styles.status}>Status: {item.status.toUpperCase()}</Text>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageRow}>
                {item.images?.map((img, idx) => (
                  <Image
                    key={idx}
                    source={{ uri: `http://192.168.6.29:5000/${img}` }}
                    style={styles.imageThumb}
                  />
                ))}
              </ScrollView>

              {item.status === 'pending' && (
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.btn, { backgroundColor: '#4CAF50' }]}
                    onPress={() => handleStatusUpdate(item._id, 'approved')}>
                    <Text style={styles.btnText}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.btn, { backgroundColor: '#E53935' }]}
                    onPress={() => handleStatusUpdate(item._id, 'rejected')}>
                    <Text style={styles.btnText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff10', padding: 15, borderRadius: 10, marginBottom: 15,
  },
  name: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  info: { color: '#bbb', fontSize: 14 },
  status: { color: '#FFA726', fontWeight: 'bold', marginVertical: 6 },
  imageRow: { flexDirection: 'row', marginVertical: 10 },
  imageThumb: { width: 80, height: 80, marginRight: 10, borderRadius: 8 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  btn: { padding: 10, borderRadius: 20, flex: 1, marginHorizontal: 5, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', textTransform: 'uppercase' },
});
