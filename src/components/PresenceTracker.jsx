import { useEffect } from 'react';
import { db } from '../firebase/config';
import {
  onDisconnect,
  onValue,
  ref,
  set,
} from 'firebase/database';
import { v4 as uuidv4 } from 'uuid';

const PresenceTracker = () => {
  useEffect(() => {
    const userId = uuidv4(); 

    const connectedRef = ref(db, '.info/connected');
    const userRef = ref(db, `presence/${userId}`);

    const unsubscribe = onValue(connectedRef, (snapshot) => {
      if (snapshot.val() === true) {
        set(userRef, true);

        onDisconnect(userRef).remove();
      }
    });

    return () => {
      set(userRef, null);
      unsubscribe();
    };
  }, []);

  return null; 
};

export default PresenceTracker;
