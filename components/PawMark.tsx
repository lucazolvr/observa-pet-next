export default function PawMark({
  size = 32,
  className = '',
}: {
  size?: number
  className?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Main pad */}
      <ellipse cx="20" cy="26" rx="10" ry="9" fill="currentColor" />
      {/* Top left toe */}
      <ellipse cx="10" cy="16" rx="4.2" ry="5.5" fill="currentColor" />
      {/* Top center-left toe */}
      <ellipse cx="16" cy="12" rx="4" ry="5" fill="currentColor" />
      {/* Top center-right toe */}
      <ellipse cx="24" cy="12" rx="4" ry="5" fill="currentColor" />
      {/* Top right toe */}
      <ellipse cx="30" cy="16" rx="4.2" ry="5.5" fill="currentColor" />
    </svg>
  )
}
