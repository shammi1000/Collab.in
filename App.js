import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import OnboardingScreen from './screens/OnboardingScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import HomeScreen from './screens/HomeScreen';
import CreateCampaignScreen from './screens/CreateCampaignScreen';
import InfluencerManager from './screens/InfluencerManager';
import AdminScreen from './screens/AdminScreen';
import CampaignListScreen from './screens/CampaignListScreen';
import SearchScreen from './screens/SearchScreen';
import ProfileScreen from './screens/ProfileScreen';
import InfluencerDetailScreen from './screens/InfluencerDetailScreen';
import AllInfluencersScreen from './screens/AllInfluencersScreen';



const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// 👇 Bottom Tabs here directly
function AppTabs({ route }) {
  const { user } = route.params;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: '#0f0c29', borderTopWidth: 0 },
        tabBarActiveTintColor: '#8E2DE2',
        tabBarInactiveTintColor: '#aaa',
        tabBarIcon: ({ color }) => {
          let icon;
          if (route.name === 'Home') icon = 'home-outline';
          else if (route.name === 'Campaigns') icon = 'list-outline';
          else if (route.name === 'Search') icon = 'search-outline';
          else if (route.name === 'Profile') icon = 'person-outline';
          return <Icon name={icon} size={20} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home">
        {props => <HomeScreen {...props} user={user} />}
      </Tab.Screen>
      <Tab.Screen name="Campaigns">
        {props => <CampaignListScreen {...props} user={user} />}
      </Tab.Screen>
      <Tab.Screen name="Search">
        {props => <SearchScreen {...props} user={user} />}
      </Tab.Screen>
      <Tab.Screen name="Profile">
        {props => <ProfileScreen {...props} user={user} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

// 👇 Main App Router
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="CreateCampaign" component={CreateCampaignScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="AppTabs" component={AppTabs} />
        <Stack.Screen name="Admin" component={AdminScreen} />
        <Stack.Screen name="InfluencerManager" component={InfluencerManager} />
        <Stack.Screen name="AllInfluencers" component={AllInfluencersScreen} />
        <Stack.Screen name="InfluencerDetail" component={InfluencerDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
