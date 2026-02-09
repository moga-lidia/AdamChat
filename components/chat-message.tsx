import { StyleSheet, View, Text } from 'react-native';
import type { ChatMessage as ChatMessageType } from '@/types/chat';
import { useThemeColor } from '@/hooks/use-theme-color';

interface Props {
  message: ChatMessageType;
}

export function ChatMessage({ message }: Props) {
  const isUser = message.role === 'user';
  const textColor = useThemeColor({}, 'text');
  const userBubbleBg = useThemeColor({ light: '#DCB36C', dark: '#A67C3D' }, 'tint');
  const assistantBubbleBg = useThemeColor({ light: '#e8e9e4', dark: '#2A2A2A' }, 'background');

  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowAssistant]}>
      {!isUser && (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>✝</Text>
        </View>
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
    backgroundColor: '#DCB36C',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 4,
  },
  avatarText: {
    fontSize: 16,
    color: '#FFFFFF',
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
