import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TabParamList } from '../types';
import { FeedScreen } from '../screens/FeedScreen';
import { SongSelectScreen } from '../screens/SongSelectScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { useAppStore } from '../store/useAppStore';

const Tab = createBottomTabNavigator<TabParamList>();

function TabIcon({ icon, focused }: { icon: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.45 }}>{icon}</Text>
  );
}

export function TabNavigator() {
  const unreadCount = useAppStore((s) =>
    s.receivedVideos.filter((v) => !v.watched).length
  );

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0d0d0d',
          borderTopColor: '#1a1a1a',
          height: 80,
          paddingBottom: 16,
        },
        tabBarActiveTintColor: '#FF3B30',
        tabBarInactiveTintColor: '#555',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Feed"
        component={FeedScreen}
        options={{
          tabBarLabel: 'Inbox',
          tabBarIcon: ({ focused }) => <TabIcon icon="📬" focused={focused} />,
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: { backgroundColor: '#FF3B30' },
        }}
      />
      <Tab.Screen
        name="Songs"
        component={SongSelectScreen}
        options={{
          tabBarLabel: 'Record',
          tabBarIcon: ({ focused }) => <TabIcon icon="🎤" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon icon="👤" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}
