import React from 'react'
import './LoadingSpinner.css'

export default function LoadingSpinner({ size = 'md', text = '' }) {
  return (
    <div className={`spinner-wrapper spinner-${size}`}>
      <div className="spinner-ring">
        <div></div><div></div><div></div><div></div>
      </div>
      {text && <p className="spinner-text">{text}</p>}
    </div>
  )
}
