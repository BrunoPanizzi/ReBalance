import { Input, type InputProps } from '../ui/input'

import BaseGroup from './BaseGroup'

export type InputGroupProps = {
  name: string
  label?: string
  input?: InputProps
}

export default function InputGroup({ name, label, input }: InputGroupProps) {
  return (
    <BaseGroup name={name} label={label}>
      <Input name={name} {...input} />
    </BaseGroup>
  )
}
