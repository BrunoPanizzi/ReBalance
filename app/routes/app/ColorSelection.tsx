import { colorsSchema, Colors } from '~/constants/availableColors'

type ColorSelectionProps = { defaultColor?: Colors }

export function ColorSelection({ defaultColor }: ColorSelectionProps) {
  const colors = colorsSchema.options
  return (
    <div className="grid grid-cols-8 gap-1.5">
      {colors.map((c) => (
        <label
          data-color={c}
          className={`aspect-square rounded border-2 border-primary-600 bg-primary-400 bg-opacity-75  has-[:checked]:scale-110 has-[:checked]:bg-opacity-100`}
          key={c}
        >
          <input
            defaultChecked={c === defaultColor}
            className="hidden"
            type="radio"
            name="color"
            value={c}
          />
        </label>
      ))}
    </div>
  )
}
