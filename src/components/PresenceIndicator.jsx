import { useEffect, useState } from 'react';
import { db } from '../firebase/config';
import { onValue, ref } from 'firebase/database';

const PresenceIndicator = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const presenceRef = ref(db, 'presence');

    const unsubscribe = onValue(presenceRef, (snapshot) => {
      const data = snapshot.val();
      const userCount = data ? Object.keys(data).length : 0;
      setCount(userCount);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="text-sm text-gray-600 bg-green-100 border border-green-300 px-3 py-1 rounded inline-block mb-2 ml-6">
      🟢 {count} user{count !== 1 ? 's' : ''} online
    </div>
  );
};

export default PresenceIndicator;
