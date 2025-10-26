import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TabItem {
  id: string;
  label: string;
  icon: string;
  isActive: boolean;
  onPress: () => void;
}

interface BottomTabNavigationProps {
  activeTab: string;
  onTabPress: (tabId: string) => void;
  showAccountTab?: boolean;
  showHotlistTab?: boolean;
  showMessagesTab?: boolean;
  showLoginTab?: boolean;
}

export const BottomTabNavigation: React.FC<BottomTabNavigationProps> = ({
  activeTab,
  onTabPress,
  showAccountTab = true,
  showHotlistTab = true,
  showMessagesTab = true,
  showLoginTab = false,
}) => {
  const exploreTab: TabItem = {
    id: 'explore',
    label: 'Explore',
    icon: '🔍',
    isActive: activeTab === 'explore',
    onPress: () => onTabPress('explore'),
  };

  const hotlistTab: TabItem = {
    id: 'hotlist',
    label: 'Hotlist',
    icon: '❤️',
    isActive: activeTab === 'hotlist',
    onPress: () => onTabPress('hotlist'),
  };

  const messagesTab: TabItem = {
    id: 'messages',
    label: 'Messages',
    icon: '💬',
    isActive: activeTab === 'messages',
    onPress: () => onTabPress('messages'),
  };

  const accountTab: TabItem = {
    id: 'account',
    label: 'Account',
    icon: '👤',
    isActive: activeTab === 'account',
    onPress: () => onTabPress('account'),
  };

  const loginTab: TabItem = {
    id: 'login',
    label: 'Login',
    icon: '🔑',
    isActive: activeTab === 'login',
    onPress: () => onTabPress('login'),
  };

  const tabs = [
    exploreTab,
    ...(showHotlistTab ? [hotlistTab] : []),
    ...(showMessagesTab ? [messagesTab] : []),
    ...(showAccountTab ? [accountTab] : []),
    ...(showLoginTab ? [loginTab] : []),
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[styles.tab, tab.isActive && styles.activeTab]}
          onPress={tab.onPress}
        >
          <Text style={[styles.tabIcon, tab.isActive && styles.activeTabIcon]}>
            {tab.icon}
          </Text>
          <Text style={[styles.tabLabel, tab.isActive && styles.activeTabLabel]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingBottom: 8,
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  activeTab: {
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  activeTabIcon: {
    fontSize: 22,
  },
  tabLabel: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  activeTabLabel: {
    color: '#E91E63',
    fontWeight: '600',
  },
});
