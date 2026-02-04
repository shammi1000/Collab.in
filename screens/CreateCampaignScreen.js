import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Image, Alert
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import ImagePicker from 'react-native-image-crop-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CreateCampaignScreen() {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [budget, setBudget] = useState('');
  const [images, setImages] = useState([]);

  const handleImagePick = async () => {
    try {
      const selected = await ImagePicker.openPicker({
        multiple: true,
        mediaType: 'photo',
      });
      setImages(selected);
    } catch (error) {
      console.log('Image pick error:', error.message);
    }
  };

  const handleSubmit = async () => {
    if (!title || !desc || !budget || images.length === 0) {
      Alert.alert('Error', 'All fields and at least one image are required.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', desc);
      formData.append('budget', budget);

      images.forEach((image, index) => {
        formData.append('images', {
          uri: image.path,
          type: image.mime,
          name: `image_${index}.jpg`,
        });
      });

      const token = await AsyncStorage.getItem('token');

      const response = await axios.post(
        'http://192.168.6.29:5000/api/campaigns/create',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert('Success', 'Campaign created successfully!');
      setTitle('');
      setDesc('');
      setBudget('');
      setImages([]);
    } catch (error) {
      console.error('Submit Error:', error.response?.data || error.message);
      Alert.alert('Error', 'Failed to create campaign. Try again.');
    }
  };

  return (
    <LinearGradient colors={['#0f0c29', '#302b63', '#24243e']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.innerContainer}>
        <Text style={styles.title}>Create Campaign</Text>

        <TextInput
          placeholder="Campaign Title"
          placeholderTextColor="#aaa"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
        />
        <TextInput
          placeholder="Description"
          placeholderTextColor="#aaa"
          value={desc}
          onChangeText={setDesc}
          multiline
          style={[styles.input, { height: 100 }]}
        />
        <TextInput
          placeholder="Budget ($)"
          placeholderTextColor="#aaa"
          value={budget}
          onChangeText={setBudget}
          keyboardType="numeric"
          style={styles.input}
        />

        <TouchableOpacity style={styles.imageButton} onPress={handleImagePick}>
          <Text style={styles.buttonText}>Pick Images</Text>
        </TouchableOpacity>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.previewRow}>
          {images.map((img, idx) => (
            <Image key={idx} source={{ uri: img.path }} style={styles.previewImage} />
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Submit Campaign</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  innerContainer: { paddingTop: 60, paddingBottom: 100, paddingHorizontal: 20 },
  title: {
    fontSize: 24, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 30,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff',
    padding: 15, borderRadius: 10, marginBottom: 20, fontSize: 16,
  },
  imageButton: {
    backgroundColor: '#8E2DE2', padding: 15, borderRadius: 30, alignItems: 'center', marginBottom: 20,
  },
  previewRow: { flexDirection: 'row', marginBottom: 20 },
  previewImage: {
    width: 70, height: 70, borderRadius: 10, marginRight: 10,
  },
  submitButton: {
    backgroundColor: '#00C853', padding: 15, borderRadius: 30, alignItems: 'center',
  },
  buttonText: {
    color: '#fff', fontWeight: '700', fontSize: 16, letterSpacing: 1,
  },
});
