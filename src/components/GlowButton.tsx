import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Shadows } from '../theme/colors';

interface GlowButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  disabled?: boolean;
}

export function GlowButton({ title, onPress, variant = 'primary', size = 'md', style, disabled }: GlowButtonProps) {
  const btnStyle = [
    styles.base,
    styles[size],
    variant === 'primary' && styles.primary,
    variant === 'outline' && styles.outline,
    variant === 'danger' && styles.danger,
    variant === 'primary' && Shadows.glow,
    disabled && styles.disabled,
    style,
  ];

  const textStyle = [
    styles.text,
    styles[`${size}Text`],
    variant === 'outline' && styles.outlineText,
    variant === 'danger' && styles.dangerText,
  ];

  return (
    <TouchableOpacity style={btnStyle} onPress={onPress} activeOpacity={0.7} disabled={disabled}>
      <Text style={textStyle}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sm: { paddingVertical: 8, paddingHorizontal: 16 },
  md: { paddingVertical: 14, paddingHorizontal: 24 },
  lg: { paddingVertical: 18, paddingHorizontal: 32 },
  primary: {
    backgroundColor: Colors.blue,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  danger: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  disabled: { opacity: 0.4 },
  text: {
    color: Colors.white,
    fontWeight: '600',
  },
  smText: { fontSize: 13 },
  mdText: { fontSize: 15 },
  lgText: { fontSize: 17 },
  outlineText: { color: Colors.text },
  dangerText: { color: Colors.danger },
});
