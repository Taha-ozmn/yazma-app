import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@yazma/draft';
const COLORS = {
  bg: '#020810',
  cyan: '#00d4ff',
  cyanDim: '#0088cc',
  text: '#b8e8f8',
  card: '#0a1628',
  border: '#1a3a5c',
  green: '#00ff88',
};

export default function App() {
  const [text, setText] = useState('');
  const [savedAt, setSavedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const data = JSON.parse(raw);
          setText(data.text || '');
          setSavedAt(data.savedAt || null);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const save = useCallback(async (value) => {
    setSaving(true);
    const stamp = new Date().toISOString();
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ text: value, savedAt: stamp })
    );
    setSavedAt(stamp);
    setSaving(false);
  }, []);

  useEffect(() => {
    if (loading) return;
    const timer = setTimeout(() => save(text), 600);
    return () => clearTimeout(timer);
  }, [text, loading, save]);

  const clear = async () => {
    setText('');
    setSavedAt(null);
    await AsyncStorage.removeItem(STORAGE_KEY);
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.cyan} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      <View style={styles.header}>
        <Text style={styles.logo}>YAZMA</Text>
        <Text style={styles.subtitle}>J.A.R.V.I.S. SCRIBE</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.body}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TextInput
          style={styles.editor}
          multiline
          placeholder="Begin writing, sir..."
          placeholderTextColor={COLORS.cyanDim}
          value={text}
          onChangeText={setText}
          textAlignVertical="top"
          autoCorrect
          autoCapitalize="sentences"
        />

        <View style={styles.toolbar}>
          <View style={styles.stats}>
            <Text style={styles.stat}>{wordCount} words</Text>
            <Text style={styles.stat}>{charCount} chars</Text>
            <Text style={styles.stat}>
              {saving
                ? 'Saving...'
                : savedAt
                  ? `Saved ${new Date(savedAt).toLocaleTimeString()}`
                  : 'Ready'}
            </Text>
          </View>
          <TouchableOpacity style={styles.clearBtn} onPress={clear}>
            <Text style={styles.clearBtnText}>Clear</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  loader: {
    flex: 1,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  logo: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.cyan,
    letterSpacing: 8,
  },
  subtitle: {
    fontSize: 10,
    color: COLORS.cyanDim,
    letterSpacing: 3,
    marginTop: 4,
  },
  body: {
    flex: 1,
    padding: 16,
  },
  editor: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 16,
    color: COLORS.text,
    fontSize: 17,
    lineHeight: 26,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 12,
  },
  stats: {
    flex: 1,
    gap: 2,
  },
  stat: {
    color: COLORS.cyanDim,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  clearBtn: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  clearBtnText: {
    color: COLORS.green,
    fontSize: 13,
    fontWeight: '600',
  },
});
