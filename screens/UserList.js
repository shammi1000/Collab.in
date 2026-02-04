import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get('http://192.168.6.29:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    Alert.alert(
      'Delete User',
      'Are you sure you want to delete this user?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              await axios.delete(`http://192.168.6.29:5000/api/admin/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              fetchUsers(); // Refresh list
            } catch (err) {
              console.error('Delete failed:', err.message);
              Alert.alert('Error', 'Failed to delete user');
            }
          },
        },
      ]
    );
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <View>
      {loading ? (
        <ActivityIndicator color="#8E2DE2" size="large" />
      ) : (
        <ScrollView>
          {users.map((user) => (
            <View key={user._id} style={styles.card}>
              <Text style={styles.name}>{user.name}</Text>
              <Text style={styles.email}>{user.email}</Text>
              <Text style={styles.role}>Role: {user.role}</Text>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(user._id)}>
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff10',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  name: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  email: { color: '#bbb', fontSize: 14 },
  role: { color: '#aaa', marginTop: 5 },
  deleteBtn: {
    backgroundColor: '#E53935',
    marginTop: 10,
    padding: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  deleteText: {
    color: '#fff',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});
