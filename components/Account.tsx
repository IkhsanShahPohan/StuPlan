import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { Session } from '@supabase/supabase-js'

export default function Account({ session }: { session: Session }) {
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [website, setWebsite] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')

  useEffect(() => {
    if (session) getProfile()
  }, [session])

  async function getProfile() {
    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')

      const { data, error, status } = await supabase
        .from('profiles')
        .select('username, website, avatar_url')
        .eq('id', session.user.id)
        .single()

      if (error && status !== 406) throw error

      if (data) {
        setUsername(data.username)
        setWebsite(data.website)
        setAvatarUrl(data.avatar_url)
      }
    } catch (error) {
      if (error instanceof Error) Alert.alert('Error', error.message)
    } finally {
      setLoading(false)
    }
  }

  async function updateProfile({
    username,
    website,
    avatar_url,
  }: {
    username: string
    website: string
    avatar_url: string
  }) {
    try {
      setLoading(true)
      if (!session?.user) throw new Error('No user on the session!')

      const updates = {
        id: session.user.id,
        username,
        website,
        avatar_url,
        updated_at: new Date(),
      }

      const { error } = await supabase.from('profiles').upsert(updates)
      if (error) throw error

      Alert.alert('Success', 'Profile updated!')
    } catch (error) {
      if (error instanceof Error) Alert.alert('Error', error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={[styles.input, { backgroundColor: '#eee' }]}
        value={session?.user?.email || ''}
        editable={false}
      />

      <Text style={styles.label}>Username</Text>
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        placeholder="Enter your username"
      />

      <Text style={styles.label} className="text-blue-500">Website</Text>
      <TextInput
        style={styles.input}
        value={website}
        onChangeText={setWebsite}
        placeholder="Enter your website"
      />

      {loading ? (
        <ActivityIndicator size="large" color="#6C63FF" style={{ marginTop: 20 }} />
      ) : (
        <>
          <TouchableOpacity
            style={styles.buttonPrimary}
            onPress={() => updateProfile({ username, website, avatar_url: avatarUrl })}
          >
            <Text style={styles.buttonText}>Update Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.buttonSecondary} onPress={() => supabase.auth.signOut()}>
            <Text style={styles.buttonTextSecondary}>Sign Out</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    fontSize: 16,
    color: '#333',
  },
  buttonPrimary: {
    backgroundColor: '#6C63FF',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonSecondary: {
    borderWidth: 1.5,
    borderColor: '#6C63FF',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  buttonTextSecondary: {
    color: '#6C63FF',
    fontWeight: '600',
    fontSize: 16,
  },
})
