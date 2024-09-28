import { ChevronDownIcon } from 'lucide-react'
import { useState } from 'react'

type Props = {
  className?: string
  options: string[]
  value: string
  onChange: (value: string) => void
}

export default function Select({ value, onChange, options, className }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className={'relative shrink-0 w-40 ' + className}>
      <button className="py-2 px-4 border rounded w-full flex items-center" onClick={() => setOpen(!open)}>
        {value} <ChevronDownIcon className="ml-auto text-lg" />
      </button>

      <ul className={'absolute left-0 w-full bg-white border rounded shadow-lg mt-2' + (open ? ' block' : ' hidden')}>
        {options.map(option => (
          <li
            key={option}
            className="py-2 px-4 hover:bg-gray-100 cursor-pointer"
            onClick={() => {
              onChange(option)
              setOpen(false)
            }}>
            {option}
          </li>
        ))}
      </ul>
    </div>
  )
}
