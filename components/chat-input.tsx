import { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  Platform,
} from 'react-native';
import { useI18n } from '@/hooks/use-i18n';
import { useThemeColor } from '@/hooks/use-theme-color';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface Props {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: Props) {
  const [text, setText] = useState('');
  const { t } = useI18n();
  const bg = useThemeColor({ light: '#EEECEC', dark: '#2A2A2A' }, 'background');
  const textColor = useThemeColor({}, 'text');
  const placeholderColor = useThemeColor({ light: '#999', dark: '#666' }, 'icon');
  const accentColor = useThemeColor({ light: '#2f2482', dark: '#c1c1e3' }, 'tint');

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
  };

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <TextInput
        style={[styles.input, { color: textColor }]}
        placeholder={t.chat.inputPlaceholder}
        placeholderTextColor={placeholderColor}
        value={text}
        onChangeText={setText}
        multiline
        maxLength={2000}
        editable={!disabled}
        onSubmitEditing={handleSend}
        blurOnSubmit={false}
      />
      <Pressable
        onPress={handleSend}
        disabled={disabled || !text.trim()}
        style={({ pressed }) => [
          styles.sendButton,
          {
            backgroundColor: text.trim() && !disabled ? accentColor : 'transparent',
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        <IconSymbol
          name="arrow.up"
          size={20}
          color={text.trim() && !disabled ? '#FFFFFF' : placeholderColor}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 24,
    marginHorizontal: 12,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    maxHeight: 120,
    paddingHorizontal: 8,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
  },
  sendButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
});
