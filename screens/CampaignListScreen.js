import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator,
  TouchableOpacity, Image
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function CampaignListScreen() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedIndex, setExpandedIndex] = useState(null);

  const fetchCampaigns = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get('http://192.168.6.29:5000/api/campaigns/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCampaigns(res.data);
    } catch (err) {
      console.error('Error fetching campaigns:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const toggleExpand = (index) => {
    setExpandedIndex(index === expandedIndex ? null : index);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'approved': return styles.statusApproved;
      case 'rejected': return styles.statusRejected;
      default: return styles.statusPending;
    }
  };

  return (
    <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>
      <Text style={styles.title}>My Campaigns</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#8E2DE2" />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          {campaigns.length === 0 ? (
            <Text style={styles.empty}>No campaigns yet.</Text>
          ) : (
            campaigns.map((item, index) => (
              <TouchableOpacity key={index} onPress={() => toggleExpand(index)} activeOpacity={0.9}>
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.desc}>{item.description}</Text>
                  <Text style={styles.budget}>Budget: ${item.budget}</Text>
                  <Text style={[styles.status, getStatusStyle(item.status)]}>
                    {item.status.toUpperCase()}
                  </Text>

                  {expandedIndex === index && (
                    <>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageRow}>
                        {item.images?.map((imgUrl, i) => (
                          <Image
                            key={i}
                            source={{ uri: `http://192.168.6.29:5000/${imgUrl}` }}
                            style={styles.imageThumb}
                          />
                        ))}
                      </ScrollView>

                      {item.status === 'approved' && (
                        <TouchableOpacity style={styles.bookBtn}>
                          <Text style={styles.bookBtnText}>Book Influencer</Text>
                        </TouchableOpacity>
                      )}
                    </>
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 20 },
  scroll: { paddingBottom: 80 },
  title: {
    fontSize: 24, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 20,
  },
  card: {
    backgroundColor: '#ffffff10', borderRadius: 12, padding: 15, marginBottom: 15,
  },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  desc: { color: '#ccc', marginTop: 4, fontSize: 14 },
  budget: { color: '#ddd', marginTop: 6, fontSize: 14 },
  status: {
    marginTop: 10, fontWeight: 'bold', fontSize: 14,
    paddingVertical: 4, paddingHorizontal: 10, borderRadius: 6,
    alignSelf: 'flex-start',
  },
  statusPending: { backgroundColor: '#FFA726', color: '#fff' },
  statusApproved: { backgroundColor: '#4CAF50', color: '#fff' },
  statusRejected: { backgroundColor: '#E53935', color: '#fff' },
  empty: { color: '#bbb', textAlign: 'center', marginTop: 30 },

  imageRow: { flexDirection: 'row', marginTop: 10 },
  imageThumb: { width: 80, height: 80, marginRight: 10, borderRadius: 10 },

  bookBtn: {
    marginTop: 15,
    backgroundColor: '#8E2DE2',
    paddingVertical: 10,
    borderRadius: 25,
    alignItems: 'center',
  },
  bookBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    textTransform: 'uppercase',
  },
});
