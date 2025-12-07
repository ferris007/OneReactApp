import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

type TabsProps = {
  defaultValue: string;
  value?: string; // Add this to accept a controlled value
  onValueChange?: (value: string) => void; // Add this to notify the parent of changes
  children: React.ReactNode;
};

type TabsListProps = {
  children: React.ReactNode;
  activeTab?: string;
  handleTabPress?: (value: string) => void;
};

type TabsTriggerProps = {
  value: string;
  children: React.ReactNode;
  activeTab?: string;
  handleTabPress?: (value: string) => void;
};

type TabsContentProps = {
  value: string;
  children: React.ReactNode;
};

const Tabs = ({ defaultValue, value, onValueChange, children }: TabsProps) => {
  const [internalActiveTab, setInternalActiveTab] = useState(defaultValue);

  // Determine the active tab: use the controlled `value` if provided, otherwise use internal state.
  const activeTab = value !== undefined ? value : internalActiveTab;

  const handleTabPress = (tabValue: string) => {
    setInternalActiveTab(tabValue);
    if (onValueChange) {
      onValueChange(tabValue);
    }
  };

  return (
    <View>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return null;

        if (child.type === TabsList) {
          return React.cloneElement(child as React.ReactElement<TabsListProps>, { activeTab, handleTabPress });
        }
        if (child.type === TabsContent && (child.props as TabsContentProps).value === activeTab) {
          return child;
        }
        return null;
      })}
    </View>
  );
};

const TabsList = ({ children, activeTab, handleTabPress }: TabsListProps) => (
  <View style={styles.tabsList}>
    {React.Children.map(children, (child) => {
      if (!React.isValidElement(child)) return null;
      return React.cloneElement(child as React.ReactElement<TabsTriggerProps>, { activeTab, handleTabPress });
    })}
  </View>
);

const TabsTrigger = ({ value, children, activeTab, handleTabPress }: TabsTriggerProps) => (
  <TouchableOpacity
    style={[styles.tab, activeTab === value && styles.activeTab]}
    onPress={() => handleTabPress?.(value)}
  >
    <Text style={[styles.tabText, activeTab === value && styles.activeTabText]}>
      {children}
    </Text>
  </TouchableOpacity>
);

const TabsContent = ({ value, children }: TabsContentProps) => <View>{children}</View>;

const styles = StyleSheet.create({
  tabsList: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.20,
    shadowRadius: 1.41,
    elevation: 2,
  },
  tabText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  activeTabText: {
    color: '#111827',
  },
});

export { Tabs, TabsList, TabsTrigger, TabsContent };
