// src/hooks/useOfflineProfile.js
import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export function useOfflineProfile(userId) {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(false);
  
  // Load profile data from local storage or Firestore
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    const loadProfile = async () => {
      setLoading(true);
      
      try {
        // Try to get data from local storage first
        const localData = localStorage.getItem(`profile_${userId}`);
        if (localData) {
          setProfileData(JSON.parse(localData));
        }
        
        // Check if we're online
        if (!navigator.onLine) {
          setIsOffline(true);
          if (localData) {
            // If we have local data, use it but mark as offline
            setError('You are offline. Using cached profile data.');
          } else {
            setError('You are offline. No cached profile data available.');
          }
          setLoading(false);
          return;
        }
        
        // Try to get from Firestore
        const docRef = doc(db, 'users', userId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfileData(data);
          // Update local storage
          localStorage.setItem(`profile_${userId}`, JSON.stringify(data));
          setError(null);
        } else if (!localData) {
          // No document and no local data
          setProfileData({});
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        setIsOffline(true);
        setError('Failed to load profile data. Using cached data if available.');
      } finally {
        setLoading(false);
      }
    };
    
    loadProfile();
    
    // Listen for online/offline events
    const handleOnline = () => {
      setIsOffline(false);
      loadProfile(); // Reload when we come back online
    };
    
    const handleOffline = () => {
      setIsOffline(true);
      setError('You are offline. Changes will be saved locally and synced when you reconnect.');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [userId]);
  
  // Save profile data
  const saveProfile = async (data) => {
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    // Always save to local storage
    localStorage.setItem(`profile_${userId}`, JSON.stringify(data));
    setProfileData(data);
    
    // If online, save to Firestore
    if (navigator.onLine) {
      try {
        const docRef = doc(db, 'users', userId);
        
        // Check if document exists
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          await updateDoc(docRef, data);
        } else {
          await setDoc(docRef, {
            ...data,
            createdAt: new Date()
          });
        }
        
        return { success: true, offline: false };
      } catch (err) {
        console.error('Error saving profile to Firestore:', err);
        return { success: true, offline: true, error: err.message };
      }
    } else {
      // Return success but mark as offline
      return { success: true, offline: true };
    }
  };
  
  return {
    profileData,
    loading,
    error,
    isOffline,
    saveProfile
  };
}