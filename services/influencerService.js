import axios from 'axios';
import { API_URL } from './apiConfig';

export const getInfluencers = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/api/influencers`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching influencers:', error);
    throw error;
  }
};

export const getRecentInfluencers = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/api/influencers/recent`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching recent influencers:', error);
    throw error;
  }
};

export const searchInfluencers = async (token, params) => {
  try {
    console.log('Search params:', params);
    const response = await axios.get(`${API_URL}/api/influencers/search`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        category: params.category || 'All',
        ageRange: params.ageRange ? parseInt(params.ageRange) : undefined,
        followers: params.followers ? parseInt(params.followers) : undefined
      }
    });
    console.log('Search response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error searching influencers:', error.response?.data || error.message);
    throw error;
  }
};

export const getInfluencerById = async (token, id) => {
  try {
    const response = await axios.get(`${API_URL}/api/influencers/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching influencer:', error);
    throw error;
  }
};

export const getCampaignStats = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/api/campaigns/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching campaign stats:', error);
    throw error;
  }
};

export const getMyCampaigns = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/api/campaigns/my`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log('Campaigns response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching campaigns:', error.response?.data || error.message);
    throw error;
  }
};