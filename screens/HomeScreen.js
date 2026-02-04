import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  StatusBar,
  ScrollView,
  Dimensions,
  Animated,
  Platform,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getRecentInfluencers, getCampaignStats } from '../services/influencerService';

const { width } = Dimensions.get('window');

const sliderData = [
  {
    id: '1',
    title: 'Connect with Top Influencers',
    description: 'Find the perfect match for your brand',
    image: require('../assets/o1.png'),
  },
  {
    id: '2',
    title: 'Launch Successful Campaigns',
    description: 'Create and manage campaigns with ease',
    image: require('../assets/o2.png'),
  },
  {
    id: '3',
    title: 'Track Performance',
    description: 'Monitor your campaign results in real-time',
    image: require('../assets/o3.png'),
  },
];

const quickActions = [
  {
    id: '1',
    title: 'Create Campaign',
    icon: 'add-circle-outline',
    screen: 'CreateCampaign',
  },
  {
    id: '2',
    title: 'My Campaigns',
    icon: 'briefcase-outline',
    screen: 'Campaigns',
  },
  {
    id: '3',
    title: 'Discover',
    icon: 'search-outline',
    screen: 'Search',
  },
];

export default function HomeScreen({ user }) {
  const navigation = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [featuredInfluencers, setFeaturedInfluencers] = useState([]);
  const [stats, setStats] = useState({
    pendingCampaigns: 0,
    totalInfluencers: 0,
    successRate: 80 // Fixed success rate
  });
  const [loading, setLoading] = useState(true);
  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Fetch featured influencers
        const influencers = await getRecentInfluencers(token);
        setFeaturedInfluencers(influencers);

        // Fetch campaign stats
        const campaignStats = await getCampaignStats(token);
        setStats({
          ...campaignStats,
          successRate: 80 // Override the success rate from API
        });
      } catch (error) {
        console.error('Error fetching home screen data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderSliderItem = ({ item, index }) => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.8, 1, 0.8],
    });

    return (
      <Animated.View style={[styles.sliderItem, { transform: [{ scale }] }]}>
        <Image source={item.image} style={styles.sliderImage} />
        <View style={styles.sliderContent}>
          <Text style={styles.sliderTitle}>{item.title}</Text>
          <Text style={styles.sliderDescription}>{item.description}</Text>
        </View>
      </Animated.View>
    );
  };

  const renderQuickAction = ({ item }) => (
    <TouchableOpacity
      style={styles.quickActionButton}
      onPress={() => navigation.navigate(item.screen)}
    >
      <View style={styles.quickActionIconContainer}>
        <Icon name={item.icon} size={24} color="#fff" />
      </View>
      <Text style={styles.quickActionText}>{item.title}</Text>
    </TouchableOpacity>
  );

  const renderInfluencerItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('InfluencerDetail', { influencerId: item._id })}
    >
      {item.media && item.media.length > 0 ? (
        <Image
          source={{ uri: `http://192.168.6.29:5000/${item.media[0]}` }}
          style={styles.cardImage}
        />
      ) : (
        <Image
          source={{ uri: item.profileImage || 'https://via.placeholder.com/150' }}
          style={styles.cardImage}
        />
      )}
      <Text style={styles.cardName}>{item.name}</Text>
      <Text style={styles.cardDetails}>{item.categories?.[0] || 'No category'}</Text>
      <Text style={styles.cardDetails}>{item.followers} followers</Text>
      <TouchableOpacity 
        style={styles.connectButton}
        onPress={() => navigation.navigate('InfluencerDetail', { influencerId: item._id })}
      >
        <Text style={styles.connectButtonText}>View Profile</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8E2DE2" />
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      <ScrollView contentContainerStyle={styles.innerContainer}>
        {/* Slider */}
        <View style={styles.sliderContainer}>
          <Animated.FlatList
            data={sliderData}
            renderItem={renderSliderItem}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: true }
            )}
            onMomentumScrollEnd={(ev) => {
              setCurrentIndex(Math.round(ev.nativeEvent.contentOffset.x / width));
            }}
          />
          <View style={styles.pagination}>
            {sliderData.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  currentIndex === index && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <FlatList
            data={quickActions}
            renderItem={renderQuickAction}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickActionsList}
          />
        </View>

        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.pendingCampaigns}</Text>
            <Text style={styles.statLabel}>Pending Campaigns</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalInfluencers}</Text>
            <Text style={styles.statLabel}>Total Influencers</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.successRate}%</Text>
            <Text style={styles.statLabel}>Success Rate</Text>
          </View>
        </View>

        {/* Featured Influencers */}
        <Text style={styles.sectionTitle}>🌟 Featured Influencers</Text>
        <FlatList
          data={featuredInfluencers}
          keyExtractor={(item) => item._id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.influencerList}
          renderItem={renderInfluencerItem}
        />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerContainer: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 80,
  },
  sliderContainer: {
    height: 250,
    marginBottom: 20,
  },
  sliderItem: {
    width,
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderImage: {
    width: width * 0.8,
    height: 150,
    borderRadius: 20,
    resizeMode: 'cover',
  },
  sliderContent: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  sliderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  sliderDescription: {
    fontSize: 14,
    color: '#fff',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 10,
    width: '100%',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff50',
    marginHorizontal: 5,
  },
  paginationDotActive: {
    backgroundColor: '#fff',
  },
  quickActionsContainer: {
    marginBottom: 30,
  },
  quickActionsList: {
    paddingHorizontal: 20,
  },
  quickActionButton: {
    alignItems: 'center',
    marginRight: 20,
  },
  quickActionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#8E2DE2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: '#ffffff10',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#ccc',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  influencerList: {
    paddingLeft: 20,
  },
  card: {
    backgroundColor: '#ffffff10',
    padding: 15,
    borderRadius: 15,
    marginRight: 15,
    alignItems: 'center',
    width: 160,
  },
  cardImage: {
    width: 90,
    height: 90,
    resizeMode: 'cover',
    borderRadius: 45,
    marginBottom: 10,
  },
  cardName: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardDetails: {
    fontSize: 13,
    color: '#ccc',
  },
  connectButton: {
    backgroundColor: '#8E2DE2',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginTop: 10,
  },
  connectButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
