import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { getInfluencers } from '../services/influencerService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import axios from 'axios';

const AllInfluencersScreen = () => {
  const [influencers, setInfluencers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    fetchInfluencers();
  }, []);

  const fetchInfluencers = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      const data = await getInfluencers(token);
      setInfluencers(data);
    } catch (error) {
      console.error('Error fetching influencers:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchInfluencers();
  };

  const handleUpdate = (influencer) => {
    console.log('Passing influencer data to edit:', influencer);
    navigation.navigate('InfluencerManager', { influencer });
  };

  const handleDelete = async (id) => {
    Alert.alert(
      'Delete Influencer',
      'Are you sure you want to delete this influencer?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              await axios.delete(`http://192.168.6.29:5000/api/influencers/${id}`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                }
              });
              fetchInfluencers();
              Alert.alert('Success', 'Influencer deleted successfully');
            } catch (error) {
              console.error('Error deleting influencer:', error);
              Alert.alert('Error', 'Failed to delete influencer');
            }
          }
        }
      ]
    );
  };

  const renderInfluencerItem = ({ item }) => (
    <TouchableOpacity
      style={styles.influencerCard}
      onPress={() => navigation.navigate('InfluencerDetail', { influencerId: item._id })}
    >
      <View style={styles.influencerInfo}>
        <Image
          source={{ uri: item.profileImage || 'https://via.placeholder.com/50' }}
          style={styles.profileImage}
        />
        <View style={styles.influencerDetails}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.category}>{item.categories?.join(', ') || 'No categories'}</Text>
          <Text style={styles.followers}>{item.followers} followers</Text>
          <Text style={styles.description} numberOfLines={2}>
            {item.description || 'No description available'}
          </Text>
        </View>
      </View>
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.updateButton}
          onPress={() => handleUpdate(item)}
        >
          <Icon name="create-outline" size={24} color="#8E2DE2" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item._id)}
        >
          <Icon name="trash-outline" size={24} color="#FF3B30" />
        </TouchableOpacity>
        <View style={styles.mediaPreview}>
          {item.media && item.media.length > 0 && (
            <Image
              source={{ uri: `http://192.168.6.29:5000/${item.media[0]}` }}
              style={styles.mediaImage}
            />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8E2DE2" />
      </View>
    );
  }

  return (
    <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>All Influencers</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('InfluencerManager')}
        >
          <Icon name="add-circle-outline" size={24} color="#fff" />
          <Text style={styles.createButtonText}>Create</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={influencers}
        renderItem={renderInfluencerItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#8E2DE2']}
            tintColor="#8E2DE2"
          />
        }
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0c29',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8E2DE2',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  influencerCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff10',
    borderRadius: 15,
    marginBottom: 16,
    overflow: 'hidden',
    padding: 15,
  },
  influencerInfo: {
    flex: 1,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 10,
  },
  influencerDetails: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    color: '#8E2DE2',
    marginBottom: 4,
  },
  followers: {
    fontSize: 14,
    color: '#aaa',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  updateButton: {
    padding: 8,
    marginRight: 8,
  },
  deleteButton: {
    padding: 8,
    marginRight: 8,
  },
  mediaPreview: {
    width: 100,
    height: 100,
    backgroundColor: '#ffffff10',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
});

export default AllInfluencersScreen; 