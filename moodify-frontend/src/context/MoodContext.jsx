import React, { createContext, useContext, useState } from 'react'

const MoodContext = createContext(null)

export function MoodProvider({ children }) {
  const [currentMood, setCurrentMood] = useState(null)
  const [todaysMood, setTodaysMood] = useState(null)

  return (
    <MoodContext.Provider value={{ currentMood, setCurrentMood, todaysMood, setTodaysMood }}>
      {children}
    </MoodContext.Provider>
  )
}

export function useMood() {
  return useContext(MoodContext)
}
