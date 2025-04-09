// src/lib/backgroundSync.js
export function setupBackgroundSync() {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }
    
    // Handle online event to trigger sync
    window.addEventListener('online', async () => {
      try {
        // Check if there are pending profile updates
        const keys = Object.keys(localStorage);
        const pendingProfileKeys = keys.filter(k => k.startsWith('pending_profile_'));
        
        if (pendingProfileKeys.length > 0) {
          console.log(`Found ${pendingProfileKeys.length} pending profile updates to sync`);
          
          // Process each pending update
          for (const key of pendingProfileKeys) {
            const userId = key.replace('pending_profile_', '');
            const pendingData = JSON.parse(localStorage.getItem(key));
            
            try {
              // Update Firestore
              const docRef = doc(db, 'users', userId);
              await updateDoc(docRef, pendingData);
              
              // Remove from pending
              localStorage.removeItem(key);
              console.log(`Synced profile for user ${userId}`);
            } catch (error) {
              console.error(`Failed to sync profile for ${userId}:`, error);
            }
          }
        }
      } catch (error) {
        console.error('Error during background sync:', error);
      }
    });
  }