import { useNavigation } from '@remix-run/react'
import { AnimatePresence, motion } from 'framer-motion'

export default function NavigationIndicator() {
  const { state } = useNavigation()

  return (
    <AnimatePresence>
      {state === 'loading' && (
        <motion.div
          className="bg-primary-500 fixed left-0 top-0 z-10 h-1"
          animate={{
            width: '100%',
            transition: {
              type: 'tween',
              easings: [0.1, 1, 0.1, 1],
              duration: 5,
            },
          }}
          exit={{ width: '100%', x: '100%', transition: { duration: 0.5 } }}
        />
      )}
    </AnimatePresence>
  )
}
