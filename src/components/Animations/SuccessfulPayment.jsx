
import { AnimatePresence, motion } from 'framer-motion';
import PropTypes from 'prop-types';

const SuccessAnimation = ({ show }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed bottom-4 right-4 z-50" // Positioning at bottom-right corner
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 50 }}
            className="bg-white rounded-lg p-4 shadow-lg flex items-center space-x-3"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="bg-green-500 rounded-full p-2" // Reduced padding
            >
              <svg
                className="w-6 h-6 text-white" // Reduced size
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <motion.path
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5 }}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </motion.div>
            <p className="text-sm font-medium text-gray-800">
              Payment Successful!
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
SuccessAnimation.propTypes = {
  show: PropTypes.bool.isRequired,
};

export default SuccessAnimation;
