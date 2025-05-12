'use client';
import { useEffect, useState } from 'react';
import { friendApi, Friend } from '@/api/friendApi';

export default function FriendsPage() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    friendApi.getFriends()
      .then(data => setFriends(data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <h1 className="text-3xl font-bold mb-8 border-l-4 border-primary pl-3 bg-gradient-to-r from-[#d4b483] to-[#a3c293] bg-clip-text text-transparent">友链</h1>
      {loading ? <div>加载中...</div> : error ? <div className="text-red-500">{error}</div> : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {friends.map(friend => (
            <li key={friend.id} className="card bg-white/70 backdrop-blur-sm shadow p-4 flex items-center">
              {friend.avatar && <img src={friend.avatar.startsWith('http') ? `/api/proxy-image?url=${encodeURIComponent(friend.avatar)}` : friend.avatar} alt={friend.name} className="w-14 h-14 object-cover rounded-full mr-4" onError={e => { (e.target as HTMLImageElement).src = '/images/default-cover.jpg'; }} />}
              <div>
                <a href={friend.url} target="_blank" rel="noopener noreferrer" className="font-bold text-lg text-primary hover:underline">{friend.name}</a>
                {friend.desc && <div className="text-gray-500 text-sm mt-1">{friend.desc}</div>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 