import { CheckIcon } from '@radix-ui/react-icons'
import { colorsSchema, Colors } from '~/constants/availableColors'

type ColorSelectionProps = { defaultColor?: Colors }

export function ColorSelection({ defaultColor }: ColorSelectionProps) {
  const colors = colorsSchema.options
  return (
    <div className="grid grid-cols-8 gap-1.5">
      {colors.map((c) => (
        <label
          data-color={c}
          className={`flex aspect-square items-center justify-center rounded-lg border-2 border-primary-600 bg-primary-400/75 transition hover:scale-105 hover:bg-primary-400/90 has-[:checked]:scale-110 has-[:checked]:bg-primary-400`}
          key={c}
        >
          <input
            defaultChecked={c === defaultColor}
            className="peer hidden"
            type="radio"
            name="color"
            value={c}
          />
          <CheckIcon className="hidden size-3/4 text-primary-800 peer-checked:block peer-checked:animate-in peer-checked:fade-in-0 peer-checked:spin-in-45" />
        </label>
      ))}
    </div>
  )
}
