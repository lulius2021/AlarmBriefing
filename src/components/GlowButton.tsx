import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../theme/colors';

interface GlowButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  disabled?: boolean;
}

export function GlowButton({ title, onPress, variant = 'primary', size = 'md', style, disabled }: GlowButtonProps) {
  const sizeStyle = size === 'lg' ? s.lg : size === 'sm' ? s.sm : s.md;
  const variantStyle = variant === 'danger' ? s.danger : variant === 'outline' ? s.outline : s.primary;
  const textStyle = variant === 'outline' ? s.outlineText : variant === 'danger' ? s.dangerText : s.primaryText;

  return (
    <TouchableOpacity
      style={[s.base, sizeStyle, variantStyle, disabled && { opacity: 0.5 }, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={[s.text, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  base: { borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  sm: { paddingVertical: 8, paddingHorizontal: 16 },
  md: { paddingVertical: 12, paddingHorizontal: 20 },
  lg: { paddingVertical: 16, paddingHorizontal: 24 },
  primary: { backgroundColor: Colors.blue, shadowColor: Colors.blue, shadowRadius: 20, shadowOpacity: 0.4, elevation: 8 },
  outline: { backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border },
  danger: { backgroundColor: 'rgba(239,68,68,0.12)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' },
  text: { fontSize: 15, fontWeight: '600' },
  primaryText: { color: 'white' },
  outlineText: { color: Colors.text },
  dangerText: { color: Colors.danger },
});
