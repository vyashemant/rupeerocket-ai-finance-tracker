const iconProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: '1.7',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

function Svg({ className = 'h-5 w-5', ariaHidden = true, children }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} aria-hidden={ariaHidden} {...iconProps}>
      {children}
    </svg>
  )
}

export function EyeIcon(props) {
  return (
    <Svg {...props}>
      <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      <circle cx="12" cy="12" r="3" />
    </Svg>
  )
}

export function EyeOffIcon(props) {
  return (
    <Svg {...props}>
      <path d="M3 3l18 18" />
      <path d="M10.94 10.94A3 3 0 0113.06 13.06" />
      <path d="M9.88 5.27C11.06 5.09 12.27 5 13.5 5c4.477 0 8.268 2.943 9.542 7-1.064 3.39-3.64 5.83-6.6 6.8M5.5 5.5C3.77 6.99 2.46 8.92 1.66 11c1.274 4.057 5.065 7 9.542 7 1.19 0 2.33-.17 3.38-.48" />
    </Svg>
  )
}

export function MenuIcon(props) {
  return (
    <Svg {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Svg>
  )
}

export function BellIcon(props) {
  return (
    <Svg {...props}>
      <path d="M6 9a6 6 0 1112 0c0 7 3 6 3 8H3c0-2 3-1 3-8" />
      <path d="M10 20a2 2 0 004 0" />
    </Svg>
  )
}

export function ChevronDownIcon(props) {
  return (
    <Svg {...props}>
      <path d="m6 9 6 6 6-6" />
    </Svg>
  )
}

export function SunIcon(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </Svg>
  )
}

export function MoonIcon(props) {
  return (
    <Svg {...props}>
      <path d="M20.5 14.8A8.5 8.5 0 109.2 3.5a7 7 0 1011.3 11.3z" />
    </Svg>
  )
}

export function HomeIcon(props) {
  return (
    <Svg {...props}>
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6.5 10.5V20h11V10.5" />
    </Svg>
  )
}

export function ChartIcon(props) {
  return (
    <Svg {...props}>
      <path d="M4 19V5" />
      <path d="M8 19V12" />
      <path d="M12 19V8" />
      <path d="M16 19v-5" />
      <path d="M20 19V3" />
    </Svg>
  )
}

export function PlusIcon(props) {
  return (
    <Svg {...props}>
      <path d="M12 5v14M5 12h14" />
    </Svg>
  )
}

export function ReceiptIcon(props) {
  return (
    <Svg {...props}>
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3z" />
      <path d="M8 7h8M8 11h8M8 15h5" />
    </Svg>
  )
}

export function SparklesIcon(props) {
  return (
    <Svg {...props}>
      <path d="M12 2l1.8 5.5L19 9.3l-5.2 1.8L12 16l-1.8-4.9L5 9.3l5.2-1.8z" />
      <path d="M19 14l.8 2.4L22 17.2l-2.2.8L19 20l-.8-2-2.2-.8 2.2-.8z" />
    </Svg>
  )
}

export function UserIcon(props) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5.5 20c1.4-3.2 4-5 6.5-5s5.1 1.8 6.5 5" />
    </Svg>
  )
}

export function SettingsIcon(props) {
  return (
    <Svg {...props}>
      <path d="M12 8.5a3.5 3.5 0 100 7 3.5 3.5 0 000-7z" />
      <path d="M19.4 15a7.9 7.9 0 00.1-6l2-1.5-2-3.4-2.4.7a8.4 8.4 0 00-5.2-3l-.5-2.5H10l-.5 2.5a8.4 8.4 0 00-5.2 3L1.9 4.1l-2 3.4 2 1.5a7.9 7.9 0 000 6l-2 1.5 2 3.4 2.4-.7a8.4 8.4 0 005.2 3l.5 2.5h2l.5-2.5a8.4 8.4 0 005.2-3l2.4.7 2-3.4-2-1.5z" />
    </Svg>
  )
}

export function LogoutIcon(props) {
  return (
    <Svg {...props}>
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
      <path d="M15 3h6v18h-6" />
    </Svg>
  )
}

export function UploadIcon(props) {
  return (
    <Svg {...props}>
      <path d="M12 16V4" />
      <path d="m7 9 5-5 5 5" />
      <path d="M4 20h16" />
    </Svg>
  )
}

export function XIcon(props) {
  return (
    <Svg {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Svg>
  )
}

export default EyeIcon
