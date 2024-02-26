import { TextArea, type TextAreaProps } from '../ui/input'

import BaseGroup from './BaseGroup'

export type TextAreaGroupProps = {
  name: string
  label?: string
  textarea?: TextAreaProps
}

export default function TextAreaGroup({
  name,
  label,
  textarea,
}: TextAreaGroupProps) {
  return (
    <BaseGroup name={name} label={label}>
      <TextArea name={name} {...textarea} />
    </BaseGroup>
  )
}
