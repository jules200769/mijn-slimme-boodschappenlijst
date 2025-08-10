import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

const BonusBadge = ({ bonus, onPress, style, top }) => {
  const { colors } = useTheme();

  if (!bonus) return null;

  const formatPrice = (price) => {
    if (!price) return '';
    return `€${price.toFixed(2)}`;
  };

  const getDiscountText = () => {
    // Use bonus description if available
    if (bonus.bonus_description) {
      return bonus.bonus_description;
    }
    
    if (bonus.discount_percentage) {
      return `${bonus.discount_percentage}% korting`;
    }
    if (bonus.discount) {
      return `€${bonus.discount.toFixed(2)} korting`;
    }
    return 'Bonus AH';
  };

  return (
    <TouchableOpacity 
      style={[
        styles.container, 
        { backgroundColor: '#FF8C00' }, 
        top !== undefined && { top },
        style
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
    >
      <MaterialCommunityIcons 
        name="tag" 
        size={12} 
        color={colors.white} 
        style={styles.icon}
      />
             <View style={styles.content}>
         <Text style={[styles.store, { color: colors.white }]}>
           In de bonus%
         </Text>
       </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    position: 'absolute',
    right: 10,
    top: 13,
    minWidth: 90,
    maxWidth: 110,
    height: 24,
    zIndex: 1000,
    elevation: 1000,
  },
  icon: {
    marginRight: 4,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  store: {
    fontSize: 8,
    fontWeight: 'bold',
    marginRight: 4,
  },
  price: {
    fontSize: 9,
    fontWeight: 'bold',
    marginRight: 4,
  },
  originalPrice: {
    fontSize: 7,
    textDecorationLine: 'line-through',
    opacity: 0.8,
    marginRight: 4,
  },
  discount: {
    fontSize: 8,
    fontWeight: '500',
  },
});

export default BonusBadge;
