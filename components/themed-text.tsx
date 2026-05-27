import { StyleSheet, Text, type TextProps } from 'react-native';

import { s } from '@/constants/scale';
import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: s(16),
    lineHeight: s(24),
  },
  defaultSemiBold: {
    fontSize: s(16),
    lineHeight: s(24),
    fontWeight: '600',
  },
  title: {
    fontSize: s(32),
    fontWeight: 'bold',
    lineHeight: s(32),
  },
  subtitle: {
    fontSize: s(20),
    fontWeight: 'bold',
  },
  link: {
    lineHeight: s(30),
    fontSize: s(16),
    color: '#0a7ea4',
  },
});
