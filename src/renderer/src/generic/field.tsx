import get from 'lodash/get'

const Field = ({ values, editable, name, children }) => {
  if (editable) return children

  return <div>{get(values, name)}</div>
}

export default Field
