import { useNavigation } from 'react-router';
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useTime,
  useTransform,
} from 'framer-motion'

export default function NavigationIndicator() {
  const { state } = useNavigation()
  const shouldShowLoader = state === 'loading'

  return (
    <AnimatePresence>
      {shouldShowLoader && <Bar key={Date.now()} />}
    </AnimatePresence>
  )
}

function Bar() {
  const time = useTime()

  const progress = useTransform(() => (1 - 1 / (time.get() / 200 + 1)) * 100)
  const width = useMotionTemplate`${progress}%`

  return (
    <motion.div
      className="fixed left-0 top-0 z-50 bg-primary-500"
      initial={{ width: '0%', opacity: 0, height: 0 }}
      style={{ width }}
      animate={{ opacity: 1, height: '4px' }}
      exit={{
        x: '100%',
        opacity: 0,
        height: 0,
        transition: { duration: 0.5 },
      }}
    />
  )
}
