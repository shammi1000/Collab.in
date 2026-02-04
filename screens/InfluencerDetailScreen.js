import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  Linking,
  ActivityIndicator,
  FlatList,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getInfluencerById, getMyCampaigns } from '../services/influencerService';

const { width } = Dimensions.get('window');

const InfluencerDetailScreen = ({ route, navigation }) => {
  const { influencerId, showBooking } = route.params;
  const [influencer, setInfluencer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const fetchInfluencerDetails = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }
        const data = await getInfluencerById(token, influencerId);
        setInfluencer(data);
      } catch (error) {
        console.error('Error fetching influencer details:', error);
        Alert.alert('Error', 'Failed to load influencer details');
      } finally {
        setLoading(false);
      }
    };

    fetchInfluencerDetails();

    if (showBooking) {
      fetchCampaigns();
    }
  }, [influencerId, showBooking]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const data = await getMyCampaigns(token);
      console.log('Fetched campaigns:', data);
      
      // Filter only accepted campaigns
      const acceptedCampaigns = data.filter(campaign => campaign.status === 'accepted');
      console.log('Accepted campaigns:', acceptedCampaigns.length);
      
      setCampaigns(acceptedCampaigns);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to load campaigns. Please try again later.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const openLink = (url) => {
    if (url) Linking.openURL(url);
  };

  const handleBookNow = () => {
    setShowBookingModal(true);
    fetchCampaigns();
  };

  const handleConfirmBooking = async () => {
    if (!selectedCampaign) {
      Alert.alert('Error', 'Please select a campaign first');
      return;
    }

    try {
      setBookingLoading(true);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Here you would implement the actual booking API call
      Alert.alert(
        'Booking Successful',
        `You have successfully booked ${influencer.name} for the campaign "${selectedCampaign.title}"`,
        [
          {
            text: 'OK',
            onPress: () => {
              setShowBookingModal(false);
              navigation.goBack();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Booking error:', error);
      Alert.alert(
        'Booking Error',
        error.response?.data?.message || error.message || 'Failed to book influencer'
      );
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8E2DE2" />
        </View>
      </LinearGradient>
    );
  }

  if (!influencer) {
    return (
      <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Influencer not found</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Icon name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Influencer Profile</Text>
      </View>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.profileImageContainer}>
            {influencer.media && influencer.media.length > 0 ? (
              <Image
                source={{ uri: `http://192.168.6.29:5000/${influencer.media[0]}` }}
                style={styles.profileImage}
              />
            ) : (
              <Image
                source={{ uri: influencer.profileImage || 'https://via.placeholder.com/150' }}
                style={styles.profileImage}
              />
            )}
          </View>
          <Text style={styles.name}>{influencer.name}</Text>
          <Text style={styles.age}>Age: {influencer.age}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{influencer.followers?.toLocaleString() || '0'}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{influencer.age || 'N/A'}</Text>
            <Text style={styles.statLabel}>Age</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <View style={styles.categoriesContainer}>
            {influencer.categories?.map((category, index) => (
              <View key={index} style={styles.categoryTag}>
                <Text style={styles.categoryText}>{category}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{influencer.description || 'No description available'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Social Media</Text>
          <View style={styles.socialLinks}>
            {influencer.socialLinks?.instagram && (
              <TouchableOpacity 
                style={styles.socialLink} 
                onPress={() => openLink(influencer.socialLinks.instagram)}
                activeOpacity={0.7}
              >
                <Icon name="logo-instagram" size={24} color="#E1306C" />
              </TouchableOpacity>
            )}
            {influencer.socialLinks?.youtube && (
              <TouchableOpacity 
                style={styles.socialLink} 
                onPress={() => openLink(influencer.socialLinks.youtube)}
                activeOpacity={0.7}
              >
                <Icon name="logo-youtube" size={24} color="#FF0000" />
              </TouchableOpacity>
            )}
            {influencer.socialLinks?.tiktok && (
              <TouchableOpacity 
                style={styles.socialLink} 
                onPress={() => openLink(influencer.socialLinks.tiktok)}
                activeOpacity={0.7}
              >
                <Icon name="logo-tiktok" size={24} color="#000000" />
              </TouchableOpacity>
            )}
            {influencer.socialLinks?.twitter && (
              <TouchableOpacity 
                style={styles.socialLink} 
                onPress={() => openLink(influencer.socialLinks.twitter)}
                activeOpacity={0.7}
              >
                <Icon name="logo-twitter" size={24} color="#1DA1F2" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {influencer.media && influencer.media.length > 1 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Media</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.mediaScrollContent}
            >
              {influencer.media.slice(1).map((media, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setSelectedImage(`http://192.168.6.29:5000/${media}`)}
                  activeOpacity={0.7}
                >
                  <Image
                    source={{ uri: `http://192.168.6.29:5000/${media}` }}
                    style={styles.mediaImage}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {showBooking && (
          <View style={styles.bookingContainer}>
            <TouchableOpacity 
              style={styles.bookButton} 
              onPress={handleBookNow}
              disabled={bookingLoading}
            >
              {bookingLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.bookButtonText}>Book Now</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <Modal visible={!!selectedImage} transparent>
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalClose}
            onPress={() => setSelectedImage(null)}
            activeOpacity={0.7}
          >
            <Icon name="close" size={30} color="#fff" />
          </TouchableOpacity>
          <Image
            source={{ uri: selectedImage }}
            style={styles.fullImage}
            resizeMode="contain"
          />
        </View>
      </Modal>

      <Modal
        visible={showBookingModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowBookingModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Campaign</Text>
            
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#8E2DE2" />
              </View>
            ) : (
              <FlatList
                data={campaigns}
                keyExtractor={item => item._id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.campaignItem,
                      selectedCampaign?._id === item._id && styles.selectedCampaign
                    ]}
                    onPress={() => setSelectedCampaign(item)}
                  >
                    <Text style={styles.campaignTitle}>{item.title}</Text>
                    <Text style={styles.campaignStatus}>Status: {item.status}</Text>
                    <Text style={styles.campaignBudget}>Budget: ${item.budget}</Text>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No campaigns available</Text>
                    <Text style={styles.emptySubText}>Create a campaign first to book this influencer</Text>
                  </View>
                }
              />
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowBookingModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.modalButton, 
                  styles.confirmButton,
                  !selectedCampaign && styles.disabledButton
                ]}
                onPress={handleConfirmBooking}
                disabled={!selectedCampaign || bookingLoading}
              >
                {bookingLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalButtonText}>Confirm Booking</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#fff',
    fontSize: 18,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(26, 26, 46, 0.95)',
    zIndex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  topBarTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    paddingTop: 60,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(26, 26, 46, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#16213e',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  age: {
    fontSize: 16,
    color: '#aaa',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 20,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 14,
    color: '#aaa',
    marginTop: 4,
  },
  section: {
    padding: 20,
    marginBottom: 20,
    backgroundColor: 'rgba(26, 26, 46, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    marginHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryTag: {
    backgroundColor: '#16213e',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryText: {
    color: '#fff',
    fontSize: 14,
  },
  description: {
    fontSize: 16,
    color: '#ccc',
    lineHeight: 24,
  },
  socialLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    padding: 10,
  },
  socialLink: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  mediaImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalClose: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '90%',
    height: '70%',
  },
  mediaScrollContent: {
    paddingRight: 15,
  },
  bookingContainer: {
    width: '100%',
    marginTop: 30,
    marginBottom: 20,
  },
  bookButton: {
    backgroundColor: '#8E2DE2',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContent: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  campaignItem: {
    backgroundColor: '#ffffff10',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  selectedCampaign: {
    backgroundColor: '#8E2DE2',
  },
  campaignTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  campaignStatus: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 5,
  },
  campaignBudget: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubText: {
    color: '#ccc',
    fontSize: 14,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#ff4444',
  },
  confirmButton: {
    backgroundColor: '#8E2DE2',
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
  },
  modalButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default InfluencerDetailScreen;
