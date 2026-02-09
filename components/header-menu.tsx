import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';

interface HeaderMenuProps {
  onAccount: () => void;
  onSettings: () => void;
  onNewChat?: () => void;
}

export function HeaderMenu({ onAccount, onSettings, onNewChat }: HeaderMenuProps) {
  const [open, setOpen] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const menuBg = useThemeColor({ light: '#FFFFFF', dark: '#2A2A2A' }, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({ light: '#E0E0E0', dark: '#444' }, 'icon');

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: open ? 1 : 0,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [open]);

  const handleItem = (action: () => void) => {
    setOpen(false);
    action();
  };

  return (
    <View>
      <Pressable
        onPress={() => setOpen((v) => !v)}
        style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
      >
        <IconSymbol
          name={open ? 'xmark' : 'line.3.horizontal'}
          size={24}
          color="#2f2482"
        />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="none"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Animated.View
            style={[
              styles.dropdown,
              {
                backgroundColor: menuBg,
                borderColor,
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-8, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Pressable
              onPress={() => handleItem(onAccount)}
              style={({ pressed }) => [styles.menuItem, { opacity: pressed ? 0.6 : 1 }]}
            >
              <IconSymbol name="person.fill" size={20} color="#2f2482" />
              <Text style={[styles.menuLabel, { color: textColor }]}>Cont</Text>
            </Pressable>

            <View style={[styles.separator, { backgroundColor: borderColor }]} />

            <Pressable
              onPress={() => handleItem(onSettings)}
              style={({ pressed }) => [styles.menuItem, { opacity: pressed ? 0.6 : 1 }]}
            >
              <IconSymbol name="gearshape.fill" size={20} color="#2f2482" />
              <Text style={[styles.menuLabel, { color: textColor }]}>Setari</Text>
            </Pressable>

            {onNewChat && (
              <>
                <View style={[styles.separator, { backgroundColor: borderColor }]} />
                <Pressable
                  onPress={() => handleItem(onNewChat)}
                  style={({ pressed }) => [styles.menuItem, { opacity: pressed ? 0.6 : 1 }]}
                >
                  <IconSymbol name="plus" size={20} color="#2f2482" />
                  <Text style={[styles.menuLabel, { color: textColor }]}>Conversatie noua</Text>
                </Pressable>
              </>
            )}
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'flex-end',
    paddingTop: 56,
    paddingRight: 16,
  },
  dropdown: {
    minWidth: 200,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
  },
});
