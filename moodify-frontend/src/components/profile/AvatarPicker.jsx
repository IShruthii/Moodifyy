import React from 'react'
import './AvatarPicker.css'

const AVATARS = [
  { id: 'avatar_1', emoji: '🧑', label: 'Person' },
  { id: 'avatar_2', emoji: '🧑‍🎨', label: 'Artist' },
  { id: 'avatar_3', emoji: '🧑‍💻', label: 'Coder' },
  { id: 'avatar_4', emoji: '🧑‍🎤', label: 'Musician' },
  { id: 'avatar_5', emoji: '🧑‍🚀', label: 'Explorer' },
  { id: 'avatar_6', emoji: '🦊', label: 'Fox' },
  { id: 'avatar_7', emoji: '🐼', label: 'Panda' },
  { id: 'avatar_8', emoji: '🦋', label: 'Butterfly' },
  { id: 'avatar_9', emoji: '🌙', label: 'Moon' },
  { id: 'avatar_10', emoji: '⭐', label: 'Star' },
  { id: 'avatar_11', emoji: '🌸', label: 'Blossom' },
  { id: 'avatar_12', emoji: '🔮', label: 'Crystal' },
]

export default function AvatarPicker({ selected, onSelect }) {
  return (
    <div className="avatar-picker">
      {AVATARS.map(avatar => (
        <button
          key={avatar.id}
          className={`avatar-option ${selected === avatar.id ? 'selected' : ''}`}
          onClick={() => onSelect(avatar.id)}
          title={avatar.label}
        >
          <span className="avatar-emoji">{avatar.emoji}</span>
        </button>
      ))}
    </div>
  )
}

export function getAvatarEmoji(avatarId, gender) {
  // If avatar is explicitly set, use it
  if (avatarId && avatarId !== 'avatar_1') {
    return AVATARS.find(a => a.id === avatarId)?.emoji || getGenderAvatar(gender)
  }
  // Fall back to gender-based default
  return getGenderAvatar(gender) || AVATARS.find(a => a.id === avatarId)?.emoji || '🧑'
}

function getGenderAvatar(gender) {
  if (gender === 'female') return '👩'
  if (gender === 'male') return '👨'
  if (gender === 'other') return '🧑'
  return null
}
