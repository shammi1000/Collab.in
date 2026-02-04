import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Animated,
  Dimensions,
  Platform,
  ActivityIndicator,
  Alert,
  RefreshControl
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import UserList from './UserList';
import CampaignManager from './CampaignManager';
import InfluencerManager from './InfluencerManager';
import AllInfluencersScreen from './AllInfluencersScreen';
import { getAdminStats, getRecentActivities } from '../services/adminService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const adminStats = [
  {
    id: '1',
    title: 'Total Users',
    icon: 'people-outline',
    color: '#8E2DE2',
    screen: 'Users',
    key: 'totalUsers'
  },
  {
    id: '2',
    title: 'Pending Campaigns',
    icon: 'time-outline',
    color: '#FFA726',
    screen: 'Campaigns',
    key: 'pendingCampaigns'
  },
  {
    id: '3',
    title: 'Influencers',
    icon: 'star-outline',
    color: '#fdcb6e',
    screen: 'Influencers',
    key: 'totalInfluencers'
  },
  {
    id: '4',
    title: 'Success Rate',
    icon: 'trending-up-outline',
    color: '#e17055',
    screen: 'Analytics',
    key: 'successRate'
  }
];

const quickActions = [
  {
    id: '1',
    title: 'Analytics',
    description: 'View detailed platform analytics',
    icon: 'analytics-outline',
    screen: 'Analytics'
  },
  {
    id: '2',
    title: 'Reports',
    description: 'Generate and view reports',
    icon: 'document-text-outline',
    screen: 'Reports'
  },
  {
    id: '3',
    title: 'Settings',
    description: 'Manage platform settings',
    icon: 'settings-outline',
    screen: 'Settings'
  }
];

export default function AdminScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const [statsData, activitiesData] = await Promise.all([
        getAdminStats(token),
        getRecentActivities(token)
      ]);
      setStats(statsData);
      setActivities(activitiesData);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setError(error.message);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Users': return <UserList />;
      case 'Campaigns': return <CampaignManager />;
      case 'Influencers': return <AllInfluencersScreen />;
      default: return renderDashboard();
    }
  };

  const renderDashboard = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8E2DE2" />
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={50} color="#ff6b6b" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const handleLogout = async () => {
      try {
        await AsyncStorage.clear();
        navigation.replace('Login');
      } catch (error) {
        console.error('Error logging out:', error);
        Alert.alert('Error', 'Failed to logout. Please try again.');
      }
    };

    return (
      <ScrollView
        style={styles.dashboardContainer}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchData}
            colors={['#8E2DE2']}
            tintColor="#8E2DE2"
          />
        }
      >
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          {adminStats.map((stat) => (
            <TouchableOpacity
              key={stat.id}
              style={[styles.statCard, { backgroundColor: stat.color + '20' }]}
              onPress={() => setActiveTab(stat.screen)}
            >
              <View style={[styles.statIconContainer, { backgroundColor: stat.color }]}>
                <Icon name={stat.icon} size={24} color="#fff" />
              </View>
              <Text style={styles.statValue}>
                {stat.key === 'successRate' ? `${stats?.[stat.key]}%` : stats?.[stat.key]}
              </Text>
              <Text style={styles.statTitle}>{stat.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsContainer}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.quickActionCard}
              onPress={() => setActiveTab(action.screen)}
            >
              <View style={styles.quickActionIcon}>
                <Icon name={action.icon} size={28} color="#8E2DE2" />
              </View>
              <View style={styles.quickActionContent}>
                <Text style={styles.quickActionTitle}>{action.title}</Text>
                <Text style={styles.quickActionDescription}>{action.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Activity */}
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityContainer}>
          {activities.map((activity) => (
            <View key={activity.id} style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Icon 
                  name={activity.type === 'campaign' ? 'briefcase-outline' : 'person-outline'} 
                  size={20} 
                  color="#8E2DE2" 
                />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>{activity.title}</Text>
                <Text style={styles.activityTime}>
                  {new Date(activity.timestamp).toLocaleDateString()}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="log-out-outline" size={24} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  return (
    <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <View style={styles.tabRow}>
          {['Dashboard', 'Users', 'Campaigns', 'Influencers'].map(tab => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.content}>{renderContent()}</View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    backgroundColor: '#1b1a2e',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 15,
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: 10,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: '#8E2DE2',
  },
  tabText: {
    color: '#aaa',
    fontWeight: '600',
    fontSize: 14,
  },
  activeTabText: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  dashboardContainer: {
    flex: 1,
    padding: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    width: (width - 60) / 2,
    padding: 15,
    borderRadius: 15,
    marginBottom: 20,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  statTitle: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  quickActionsContainer: {
    marginBottom: 30,
  },
  quickActionCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff10',
    padding: 15,
    borderRadius: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ffffff20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  quickActionDescription: {
    fontSize: 12,
    color: '#ccc',
  },
  activityContainer: {
    marginBottom: 30,
  },
  activityItem: {
    flexDirection: 'row',
    backgroundColor: '#ffffff10',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 5,
  },
  activityTime: {
    fontSize: 12,
    color: '#ccc',
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
    padding: 20,
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
  },
  retryButton: {
    backgroundColor: '#8E2DE2',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff6b6b',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    marginBottom: 30,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});
