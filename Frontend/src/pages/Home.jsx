const Home = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 via-white to-purple-100">
      <div className="bg-white shadow-lg rounded-2xl p-10 max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome to Authenticator 🔐</h1>
        <p className="text-gray-600 mb-6">
          Secure your account with our password reset feature. Login or Sign up to get started.
        </p>
        <div className="flex justify-center gap-4">
          <a
            href="/login"
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200"
          >
            Login
          </a>
          <a
            href="/signup"
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all duration-200"
          >
            Sign Up
          </a>
        </div>
      </div>
    </div>
  );
};

export default Home;
