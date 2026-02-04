import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, FlatList, Image, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Picker } from '@react-native-picker/picker';
import Slider from '@react-native-community/slider';
import { searchInfluencers } from '../services/influencerService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

// Use emulator-appropriate host for local server
const HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const BASE_URL = `http://192.168.6.29:5000`;

export default function SearchScreen() {
  const navigation = useNavigation();
  const [ageRange, setAgeRange] = useState(25);
  const [followers, setFollowers] = useState(100000);
  const [category, setCategory] = useState('All');
  const [influencers, setInfluencers] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const searchParams = { category, ageRange, followers };
      const results = await searchInfluencers(token, searchParams);
      setInfluencers(results);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert(
        'Search Error',
        error.response?.data?.message || error.message || 'An error occurred while searching',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const renderInfluencerItem = ({ item }) => {
    // Determine the image path from media or profileImage
    const path = item.profileImage || (item.media && item.media.length > 0 ? item.media[0] : null);
    const imageUri = path ? `${BASE_URL}/${path}` : 'https://via.placeholder.com/150';

    return (
      <TouchableOpacity
        style={styles.influencerCard}
        onPress={() => navigation.navigate('InfluencerDetail', {
          influencerId: item._id,
          showBooking: true,
        })}
      >
        <Image source={{ uri: imageUri }} style={styles.profileImage} />
        <View style={styles.influencerInfo}>
          <Text style={styles.influencerName}>{item.name}</Text>
          <Text style={styles.influencerCategory}>{item.categories?.[0] || 'No category'}</Text>
          <Text style={styles.influencerDetails}>Age: {item.age} | Followers: {item.followers?.toLocaleString() || 0}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <View style={styles.searchContainer}>
        <Text style={styles.title}>Search Influencers</Text>
        {/* Category Picker */}
        <Text style={styles.label}>Category</Text>
        <View style={styles.pickerWrapper}>
          <Picker selectedValue={category} onValueChange={setCategory} style={styles.picker}>
            <Picker.Item label="All" value="All" />
            <Picker.Item label="Fashion" value="Fashion" />
            <Picker.Item label="Fitness" value="Fitness" />
            <Picker.Item label="Tech" value="Tech" />
            <Picker.Item label="Travel" value="Travel" />
            <Picker.Item label="Food" value="Food" />
            <Picker.Item label="Lifestyle" value="Lifestyle" />
          </Picker>
        </View>
        {/* Age Slider */}
        <Text style={styles.label}>Age Range: {ageRange}</Text>
        <Slider
          style={styles.slider}
          minimumValue={18}
          maximumValue={50}
          value={ageRange}
          onValueChange={setAgeRange}
          minimumTrackTintColor="#8E2DE2"
          maximumTrackTintColor="#ffffff30"
          thumbTintColor="#8E2DE2"
        />
        {/* Followers Slider */}
        <Text style={styles.label}>Minimum Followers: {followers.toLocaleString()}</Text>
        <Slider
          style={styles.slider}
          minimumValue={1000}
          maximumValue={1000000}
          step={10000}
          value={followers}
          onValueChange={setFollowers}
          minimumTrackTintColor="#8E2DE2"
          maximumTrackTintColor="#ffffff30"
          thumbTintColor="#8E2DE2"
        />
        {/* Search Button */}
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search Influencers</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8E2DE2" />
        </View>
      ) : (
        <FlatList
          data={influencers}
          renderItem={renderInfluencerItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.influencerList}
          ListEmptyComponent={<Text style={styles.emptyText}>No influencers found. Try adjusting your search criteria.</Text>}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
  label: { color: '#fff', marginTop: 15, marginBottom: 5 },
  pickerWrapper: { backgroundColor: '#ffffff10', borderRadius: 10, marginBottom: 10 },
  picker: { color: '#fff' },
  slider: { width: '100%', height: 40 },
  searchButton: { backgroundColor: '#8E2DE2', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  searchButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  influencerList: { paddingHorizontal: 20, paddingBottom: 20 },
  influencerCard: { flexDirection: 'row', backgroundColor: '#ffffff10', borderRadius: 15, padding: 15, marginBottom: 15, alignItems: 'center' },
  profileImage: { width: 60, height: 60, borderRadius: 30, marginRight: 15 },
  influencerInfo: { flex: 1 },
  influencerName: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  influencerCategory: { color: '#8E2DE2', fontSize: 14, marginBottom: 5 },
  influencerDetails: { color: '#ccc', fontSize: 12 },
  emptyText: { color: '#fff', textAlign: 'center', marginTop: 20, fontSize: 16 },
});
