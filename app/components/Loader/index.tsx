import { cn } from '~/lib/utils'

type LoaderProps = { className?: string }

export default function Loader({ className }: LoaderProps) {
  return (
    <svg
      fill="none"
      strokeWidth={1.25}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 15 15"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('animate-spin', className)}
      style={{
        overflow: 'visible',
        color: '',
      }}
    >
      <path d="M 7.5 1.875 a5.625 5.625 0 1 0 5.625 5.625" />
    </svg>
  )
}
