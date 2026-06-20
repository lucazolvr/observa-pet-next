import { ImageResponse } from 'next/og'

export const sizes = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #2a6af0, #5b8cff)',
        }}
      >
        <svg width="120" height="120" viewBox="0 0 40 40" fill="white">
          <ellipse cx="20" cy="26" rx="10" ry="9" />
          <ellipse cx="10" cy="16" rx="4.2" ry="5.5" />
          <ellipse cx="16" cy="12" rx="4" ry="5" />
          <ellipse cx="24" cy="12" rx="4" ry="5" />
          <ellipse cx="30" cy="16" rx="4.2" ry="5.5" />
        </svg>
      </div>
    ),
    { width: 180, height: 180 }
  )
}
