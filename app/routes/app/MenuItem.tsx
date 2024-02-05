import { ReactNode } from 'react'
import { Button } from '~/components/ui/button'

type MenuItemProps = {
  title: string
  icon: ReactNode
  onClick: () => void
}

export default function MenuItem({ icon, onClick, title }: MenuItemProps) {
  return (
    <Button
      variant="colorful-ghost"
      className="justify-start gap-2 rounded-md px-2 py-1 transition "
      onClick={onClick}
    >
      {icon}
      <span>{title}</span>
    </Button>
  )
}
