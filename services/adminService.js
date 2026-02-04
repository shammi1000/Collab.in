import axios from 'axios';
import { API_URL, ENDPOINTS, getHeaders, ERROR_MESSAGES } from './apiConfig';

export const getAdminStats = async (token) => {
  try {
    const [usersResponse, campaignsResponse, influencersResponse] = await Promise.all([
      axios.get(`${API_URL}${ENDPOINTS.ADMIN.USERS}`, { headers: getHeaders(token) }),
      axios.get(`${API_URL}${ENDPOINTS.ADMIN.CAMPAIGNS}`, { headers: getHeaders(token) }),
      axios.get(`${API_URL}${ENDPOINTS.INFLUENCERS.BASE}`, { headers: getHeaders(token) })
    ]);

    const totalUsers = usersResponse.data.length;
    const totalCampaigns = campaignsResponse.data.length;
    const totalInfluencers = influencersResponse.data.length;

    // Calculate pending campaigns
    const pendingCampaigns = campaignsResponse.data.filter(
      campaign => campaign.status === 'pending'
    ).length;

    // Calculate success rate (example: campaigns with status 'completed')
    const completedCampaigns = campaignsResponse.data.filter(
      campaign => campaign.status === 'completed'
    ).length;
    const successRate = totalCampaigns > 0 
      ? Math.round((completedCampaigns / totalCampaigns) * 100) 
      : 0;

    return {
      totalUsers,
      totalCampaigns,
      pendingCampaigns,
      totalInfluencers,
      successRate
    };
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    if (error.response) {
      switch (error.response.status) {
        case 401:
          throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
        case 404:
          throw new Error(ERROR_MESSAGES.NOT_FOUND);
        default:
          throw new Error(ERROR_MESSAGES.SERVER_ERROR);
      }
    } else {
      throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
    }
  }
};

export const getRecentActivities = async (token) => {
  try {
    const [campaignsResponse, usersResponse] = await Promise.all([
      axios.get(`${API_URL}${ENDPOINTS.ADMIN.CAMPAIGNS}`, { headers: getHeaders(token) }),
      axios.get(`${API_URL}${ENDPOINTS.ADMIN.USERS}`, { headers: getHeaders(token) })
    ]);

    // Combine and sort activities by date
    const activities = [
      ...campaignsResponse.data.map(campaign => ({
        type: 'campaign',
        id: campaign._id,
        title: `New campaign created: ${campaign.title}`,
        user: campaign.createdBy.name,
        timestamp: campaign.createdAt
      })),
      ...usersResponse.data.map(user => ({
        type: 'user',
        id: user._id,
        title: `New user registered: ${user.name}`,
        user: user.name,
        timestamp: user.createdAt
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
     .slice(0, 5); // Get only the 5 most recent activities

    return activities;
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    if (error.response) {
      switch (error.response.status) {
        case 401:
          throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
        case 404:
          throw new Error(ERROR_MESSAGES.NOT_FOUND);
        default:
          throw new Error(ERROR_MESSAGES.SERVER_ERROR);
      }
    } else {
      throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
    }
  }
}; 