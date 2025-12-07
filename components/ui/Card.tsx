import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';

type CardContainerProps = {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

type CardTextProps = {
  children?: React.ReactNode;
  style?: StyleProp<TextStyle>;
  size?: number;
};

const Card = ({ children, style }: CardContainerProps) => (
  <View style={[styles.card, style]}>{children}</View>
);

const CardHeader = ({ children, style }: CardContainerProps) => (
  <View style={[styles.cardHeader, style]}>{children}</View>
);

const CardTitle = ({ children, style, size }: CardTextProps) => (
  <View style={{ flex: 1 }}>
    <Text style={[styles.cardTitle, style, { fontSize: size }]}>{children}</Text>
  </View>
);

const CardDescription = ({ children, style }: CardTextProps) => (
  <Text style={[styles.cardDescription, style]}>{children}</Text>
);

const CardContent = ({ children, style }: CardContainerProps) => (
  <View style={[styles.cardContent, style]}>{children}</View>
);

const CardFooter = ({ children, style }: CardContainerProps) => (
  <View style={[styles.cardFooter, style]}>{children}</View>
);

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'red',
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
  cardHeader: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  cardDescription: {
    fontSize: 14,
    color: '#6B7280',
  },
  cardContent: {
    padding: 24,
  },
  cardFooter: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
});

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
