import { Friend, ReceivedVideo } from '../types';

export const MOCK_FRIENDS: Friend[] = [
  { id: 'f1', username: 'alex_sings',   avatarColor: '#e74c3c', initials: 'AS' },
  { id: 'f2', username: 'mia_music',    avatarColor: '#3498db', initials: 'MM' },
  { id: 'f3', username: 'drummerdan',   avatarColor: '#2ecc71', initials: 'DD' },
  { id: 'f4', username: 'karaoke_king', avatarColor: '#f39c12', initials: 'KK' },
  { id: 'f5', username: 'pop_princess', avatarColor: '#9b59b6', initials: 'PP' },
];

export const MOCK_RECEIVED_VIDEOS: ReceivedVideo[] = [
  {
    id: 'rv1',
    sender: MOCK_FRIENDS[0],
    songId: 'bohemian_rhapsody',
    sentAt: Date.now() - 1000 * 60 * 15,   // 15 min ago
    watched: false,
  },
  {
    id: 'rv2',
    sender: MOCK_FRIENDS[1],
    songId: 'shake_it_off',
    sentAt: Date.now() - 1000 * 60 * 60,   // 1 hr ago
    watched: false,
  },
  {
    id: 'rv3',
    sender: MOCK_FRIENDS[2],
    songId: 'uptown_funk',
    sentAt: Date.now() - 1000 * 60 * 60 * 3, // 3 hrs ago
    watched: true,
  },
  {
    id: 'rv4',
    sender: MOCK_FRIENDS[3],
    songId: 'dont_stop_believin',
    sentAt: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
    watched: true,
  },
  {
    id: 'rv5',
    sender: MOCK_FRIENDS[4],
    songId: 'dancing_queen',
    sentAt: Date.now() - 1000 * 60 * 60 * 48, // 2 days ago
    watched: true,
  },
];
