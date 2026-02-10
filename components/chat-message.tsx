import { Image, StyleSheet, View, Text } from 'react-native';
import type { ChatMessage as ChatMessageType } from '@/types/chat';
import { useThemeColor } from '@/hooks/use-theme-color';

interface Props {
  message: ChatMessageType;
  fontSize?: number;
}

export function ChatMessage({ message, fontSize }: Props) {
  const isUser = message.role === 'user';
  const textColor = useThemeColor({}, 'text');
  const userBubbleBg = useThemeColor({ light: '#2f2482', dark: '#4a3a9e' }, 'tint');
  const assistantBubbleBg = useThemeColor({ light: '#e8e9e4', dark: '#2A2A2A' }, 'background');

  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowAssistant]}>
      {!isUser && (
        <Image
          source={require('@/assets/images/logo-speranta.jpg')}
          style={styles.avatar}
        />
      )}
      <View
        style={[
          styles.bubble,
          isUser
            ? [styles.bubbleUser, { backgroundColor: userBubbleBg }]
            : [styles.bubbleAssistant, { backgroundColor: assistantBubbleBg }],
        ]}
      >
        <Text
          style={[
            styles.text,
            { color: isUser ? '#FFFFFF' : textColor },
            fontSize != null && { fontSize, lineHeight: fontSize * 1.4 },
          ]}
        >
          {message.content}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginVertical: 4,
    paddingHorizontal: 12,
  },
  rowUser: {
    justifyContent: 'flex-end',
  },
  rowAssistant: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    marginTop: 4,
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleUser: {
    borderBottomRightRadius: 4,
  },
  bubbleAssistant: {
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: 15,
    lineHeight: 21,
  },
});
