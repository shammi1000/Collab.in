import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, KeyboardAvoidingView, FlatList, ActivityIndicator, RefreshControl
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ImagePicker from 'react-native-image-crop-picker';
import axios from 'axios';
import DropDownPicker from 'react-native-dropdown-picker';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { getRecentInfluencers, searchInfluencers } from '../services/influencerService';

export default function InfluencerManager({ route }) {
  const navigation = useNavigation();
  const [form, setForm] = useState({
    name: '', age: '', followers: '', description: '',
    categories: [], instagram: '', youtube: '', tiktok: '', twitter: ''
  });
  const [media, setMedia] = useState([]);
  const [influencers, setInfluencers] = useState([]);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categoryItems, setCategoryItems] = useState([
    { label: 'Fashion', value: 'Fashion' },
    { label: 'Travel', value: 'Travel' },
    { label: 'Tech', value: 'Tech' },
    { label: 'Fitness', value: 'Fitness' },
    { label: 'Beauty', value: 'Beauty' },
  ]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [ageRange, setAgeRange] = useState({ min: '', max: '' });

  const fetchRecentInfluencers = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      const data = await getRecentInfluencers(token);
      setInfluencers(data);
    } catch (error) {
      console.error('Error fetching recent influencers:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const searchParams = {
        query: searchQuery,
        category: selectedCategory,
        minAge: ageRange.min,
        maxAge: ageRange.max
      };

      const data = await searchInfluencers(token, searchParams);
      setInfluencers(data);
    } catch (error) {
      console.error('Error searching influencers:', error);
      Alert.alert('Error', 'Failed to search influencers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('InfluencerManager useEffect triggered with params:', route.params);
    if (route.params?.influencer) {
      const influencer = route.params.influencer;
      console.log('Received influencer data for edit:', influencer);
      const formData = {
        name: influencer.name || '',
        age: influencer.age?.toString() || '',
        followers: influencer.followers?.toString() || '',
        description: influencer.description || '',
        categories: influencer.categories || [],
        instagram: influencer.socialLinks?.instagram || '',
        youtube: influencer.socialLinks?.youtube || '',
        tiktok: influencer.socialLinks?.tiktok || '',
        twitter: influencer.socialLinks?.twitter || '',
      };
      console.log('Setting form data:', formData);
      setForm(formData);
      setIsEditing(true);
      setCurrentId(influencer._id);
    }
    fetchRecentInfluencers();
  }, [route.params]);

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.openPicker({ multiple: true, mediaType: 'any' });
      setMedia(result);
    } catch (error) {
      console.log('Media pick error:', error.message);
    }
  };

  const handleSubmit = async () => {
    if (!form.name || !form.followers) {
      Alert.alert('Error', 'Name and followers are required!');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const formData = new FormData();

      formData.append('name', form.name);
      formData.append('age', form.age);
      formData.append('followers', form.followers);
      formData.append('description', form.description);
      formData.append('categories', JSON.stringify(form.categories));
      formData.append('socialLinks', JSON.stringify({
        instagram: form.instagram,
        youtube: form.youtube,
        twitter: form.twitter,
        tiktok: form.tiktok,
      }));

      media.forEach((file, index) => {
        formData.append('media', {
          uri: file.path,
          type: file.mime,
          name: `file_${index}.${file.mime.split('/')[1]}`,
        });
      });

      if (isEditing) {
        await axios.put(`http://192.168.6.29:5000/api/influencers/${currentId}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          }
        });
        Alert.alert('Success', 'Influencer updated!');
      } else {
        await axios.post('http://192.168.6.29:5000/api/influencers/add', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          }
        });
        Alert.alert('Success', 'Influencer added!');
      }

      setForm({ name: '', age: '', followers: '', description: '', categories: [], instagram: '', youtube: '', tiktok: '', twitter: '' });
      setMedia([]);
      fetchRecentInfluencers();
      navigation.goBack();
    } catch (err) {
      console.log(err.response?.data || err.message);
      Alert.alert('Error', isEditing ? 'Failed to update influencer' : 'Failed to create influencer');
    }
  };

  const handleDelete = async (id) => {
    Alert.alert('Confirm Delete', 'Are you sure?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await axios.delete(`http://192.168.6.29:5000/api/influencers/${id}`);
            fetchRecentInfluencers();
          } catch (err) {
            Alert.alert('Error', 'Delete failed');
          }
        }
      }
    ]);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRecentInfluencers();
  };

  const renderInfluencerItem = ({ item }) => (
    <TouchableOpacity
      style={styles.influencerCard}
      onPress={() => navigation.navigate('InfluencerDetail', { influencer: item })}
    >
      <View style={styles.influencerInfo}>
        {item.media && item.media.length > 0 ? (
          <Image
            source={{ uri: `http://192.168.6.29:5000/${item.media[0]}` }}
            style={styles.profileImage}
          />
        ) : (
          <Image
            source={{ uri: item.profileImage || 'https://via.placeholder.com/50' }}
            style={styles.profileImage}
          />
        )}
        <View style={styles.influencerDetails}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.category}>{item.categories?.join(', ') || 'No categories'}</Text>
          <Text style={styles.followers}>{item.followers} followers</Text>
          <Text style={styles.date}>Added: {new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>
      </View>
      <Icon name="chevron-forward" size={24} color="#666" />
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
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 20 }}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
        >
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search influencers..."
              placeholderTextColor="#aaa"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <DropDownPicker
              open={categoryOpen}
              value={selectedCategory}
              items={categoryItems}
              setOpen={setCategoryOpen}
              setValue={setSelectedCategory}
              placeholder="Select Category"
              style={styles.dropdownStyle}
              dropDownContainerStyle={styles.dropdownContainerStyle}
              theme="DARK"
            />
            <View style={styles.ageRangeContainer}>
              <TextInput
                style={styles.ageInput}
                placeholder="Min Age"
                placeholderTextColor="#aaa"
                keyboardType="numeric"
                value={ageRange.min}
                onChangeText={(val) => setAgeRange({ ...ageRange, min: val })}
              />
              <TextInput
                style={styles.ageInput}
                placeholder="Max Age"
                placeholderTextColor="#aaa"
                keyboardType="numeric"
                value={ageRange.max}
                onChangeText={(val) => setAgeRange({ ...ageRange, max: val })}
              />
            </View>
            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
              <Text style={styles.searchButtonText}>Search</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.header}>{isEditing ? 'Edit Influencer' : 'Add Influencer'}</Text>

          {['name', 'age', 'followers', 'description', 'instagram', 'youtube', 'twitter', 'tiktok'].map((field) => (
            <TextInput
              key={field}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              placeholderTextColor="#aaa"
              style={styles.input}
              value={form[field]}
              onChangeText={(val) => setForm({ ...form, [field]: val })}
              multiline={field === 'description'}
            />
          ))}

          <DropDownPicker
            open={categoryOpen}
            value={form.categories}
            items={categoryItems}
            setOpen={setCategoryOpen}
            setValue={(callback) => setForm({ ...form, categories: callback(form.categories) })}
            setItems={setCategoryItems}
            multiple={true}
            mode="BADGE"
            listMode="SCROLLVIEW"
            placeholder="Select Categories"
            style={styles.dropdownStyle}
            dropDownContainerStyle={styles.dropdownContainerStyle}
            theme="DARK"
          />

          <TouchableOpacity style={styles.mediaBtn} onPress={handleImagePick}>
            <Text style={styles.btnText}>Upload Media</Text>
          </TouchableOpacity>

          <ScrollView horizontal style={{ marginVertical: 10 }}>
            {media.map((m, i) => (
              <Image key={i} source={{ uri: m.path }} style={styles.preview} />
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.btnText}>{isEditing ? 'Update Influencer' : 'Add Influencer'}</Text>
          </TouchableOpacity>

          <Text style={styles.header}>Recently Added Influencer</Text>

          {influencers.length > 0 ? (
            <View style={styles.recentInfluencerContainer}>
              {renderInfluencerItem({ item: influencers[0] })}
            </View>
          ) : (
            <Text style={styles.noInfluencersText}>No influencers added yet</Text>
          )}

          <View style={styles.viewAllButton}>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('AllInfluencers')}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <Icon name="arrow-forward" size={20} color="#8E2DE2" />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  input: {
    backgroundColor: '#ffffff15', color: '#fff', padding: 10,
    borderRadius: 10, marginBottom: 10,
  },
  mediaBtn: {
    backgroundColor: '#5C6BC0', padding: 12, borderRadius: 20, alignItems: 'center',
  },
  submitBtn: {
    backgroundColor: '#00C853', padding: 12, borderRadius: 20, alignItems: 'center',
    marginBottom: 20,
  },
  btnText: { color: '#fff', fontWeight: 'bold' },
  preview: { width: 70, height: 70, marginRight: 10, borderRadius: 8 },
  card: {
    backgroundColor: '#ffffff10', padding: 15, borderRadius: 10, marginBottom: 15,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  desc: { color: '#ccc', marginVertical: 4 },
  meta: { color: '#aaa' },
  thumb: { width: 60, height: 60, marginRight: 10, borderRadius: 8, marginTop: 10 },
  deleteBtn: {
    backgroundColor: '#E53935', marginTop: 10, padding: 10, borderRadius: 15, alignItems: 'center',
  },
  dropdownStyle: {
    marginBottom: 20,
    backgroundColor: '#24243e',
    borderColor: '#666',
    borderRadius: 10,
  },
  dropdownContainerStyle: {
    backgroundColor: '#302b63',
    borderColor: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  influencerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff15',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  influencerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  influencerDetails: {
    flex: 1,
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
  date: {
    fontSize: 12,
    color: '#888',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  viewAllText: {
    color: '#8E2DE2',
    marginRight: 4,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  noInfluencersText: {
    color: '#aaa',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  recentInfluencerContainer: {
    marginBottom: 20,
  },
  searchContainer: {
    padding: 15,
    backgroundColor: '#ffffff10',
    borderRadius: 10,
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: '#ffffff15',
    color: '#fff',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  ageRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  ageInput: {
    flex: 1,
    backgroundColor: '#ffffff15',
    color: '#fff',
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 5,
  },
  searchButton: {
    backgroundColor: '#8E2DE2',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
