import { Slider, type SliderProps } from '~/components/ui/slider'

import BaseGroup from './BaseGroup'

export type SliderGroupProps = {
  name: string
  label?: string
  slider?: SliderProps
}

export default function SliderGroup({ name, label, slider }: SliderGroupProps) {
  return (
    <BaseGroup name={name} label={label}>
      <Slider name={name} {...slider} />
    </BaseGroup>
  )
}
