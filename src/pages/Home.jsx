import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[600px]">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48"
            alt="Gym background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black opacity-50"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex flex-col justify-center h-full">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Transform Your Life Today
            </h1>
            <p className="text-xl text-white mb-8 max-w-2xl">
              Join our state-of-the-art facility and start your fitness journey with expert guidance and premium equipment.
            </p>
            <Link
              to="/membership"
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full w-fit transition duration-300"
            >
              Start Your Journey
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-red-600 text-3xl mb-4">
                <i className="fas fa-dumbbell"></i>
              </div>
              <h3 className="text-xl font-semibold mb-2">Modern Equipment</h3>
              <p className="text-gray-600">
                Access to the latest fitness equipment and technology
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-red-600 text-3xl mb-4">
                <i className="fas fa-users"></i>
              </div>
              <h3 className="text-xl font-semibold mb-2">Expert Trainers</h3>
              <p className="text-gray-600">
                Certified professionals to guide your fitness journey
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-red-600 text-3xl mb-4">
                <i className="fas fa-clock"></i>
              </div>
              <h3 className="text-xl font-semibold mb-2">Flexible Hours</h3>
              <p className="text-gray-600">
                Open 24/7 to fit your busy schedule
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Promotional Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-600 rounded-lg p-8 md:p-12">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                Special Offer
              </h2>
              <p className="text-white text-xl mb-6">
                Join now and get 50% off your first month!
              </p>
              <Link
                to="/pricing"
                className="bg-white text-red-600 font-bold py-3 px-8 rounded-full inline-block hover:bg-gray-100 transition duration-300"
              >
                View Plans
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Classes Preview Section */}
      <div className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Classes</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {['Yoga', 'CrossFit', 'Cardio', 'Strength'].map((className) => (
              <div key={className} className="bg-white rounded-lg overflow-hidden shadow-md">
                <img
                  src={`https://source.unsplash.com/400x300/?${className.toLowerCase()}`}
                  alt={className}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{className}</h3>
                  <Link
                    to="/classes"
                    className="text-red-600 hover:text-red-700"
                  >
                    Learn More →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;