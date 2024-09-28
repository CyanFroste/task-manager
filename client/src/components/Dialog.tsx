type Props = React.PropsWithChildren<{
  open: boolean
  onClose?: () => void
  className?: string
}>

export default function Dialog({ open, children, className }: Props) {
  return open && <div className={'fixed inset-0 z-50 bg-black/50 flex ' + className}>{children}</div>
}
