import { Controller } from 'react-hook-form'

const Field = ({ editable, name, children, control }) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (!editable ? field?.value : children({ ...field }))}
    />
  )
}

export default Field
