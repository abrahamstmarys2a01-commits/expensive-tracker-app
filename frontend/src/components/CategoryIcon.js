import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getCategoryByName } from '../constants/categories';

const CategoryIcon = ({ categoryName, size = 40 }) => {
  const category = getCategoryByName(categoryName);
  
  return (
    <View style={[
      styles.container, 
      { 
        width: size, 
        height: size, 
        borderRadius: size / 2,
        backgroundColor: category.color + '20' 
      }
    ]}>
      <Text style={{ fontSize: size / 2 }}>{category.icon}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CategoryIcon;
