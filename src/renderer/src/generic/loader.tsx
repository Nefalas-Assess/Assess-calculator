import Lottie from 'lottie-react'
import animationData from '@renderer/assets/animation_loader.json'

export const Loader = ({ style }) => {
  return <Lottie animationData={animationData} loop={true} autoplay style={style} />
}

export default Loader
