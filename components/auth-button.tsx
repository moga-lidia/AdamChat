import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '@/hooks/use-auth';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';

interface Props {
  onPress: () => void;
}

export function AuthButton({ onPress }: Props) {
  const { user } = useAuth();
  const borderColor = useThemeColor({ light: '#E0E0E0', dark: '#333' }, 'icon');
  const iconColor = useThemeColor({ light: '#2f2482', dark: '#ECEDEE' }, 'text');

  const initial = user?.name?.[0]?.toUpperCase() ?? user?.email?.[0]?.toUpperCase();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { borderColor, opacity: pressed ? 0.6 : 1 },
      ]}
    >
      {user ? (
        <View style={styles.initialCircle}>
          <Text style={styles.initialText}>{initial}</Text>
        </View>
      ) : (
        <IconSymbol name="person.fill" size={18} color={iconColor} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1,
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2f2482',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
