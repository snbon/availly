const Footer = () => {
  return (
    <footer className="bg-gray-900/95 text-white relative overflow-hidden">
      <div className="container-custom py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 xl:gap-12">
          {/* Company Info */}
          <div className="text-center sm:text-left space-y-3">
            <h3 className="text-lg sm:text-xl font-semibold text-white">Availly</h3>
            <p className="text-gray-400 text-sm leading-relaxed max-w-full sm:max-w-xs">
              Smart calendar availability management for modern teams and professionals.
            </p>
          </div>
          
          {/* Quick Links */}
          <div className="text-center space-y-3">
            <h3 className="text-lg sm:text-xl font-semibold text-white">Quick Links</h3>
            <div className="space-y-2">
              <a 
                href="/" 
                className="block text-gray-400 hover:text-white text-sm transition-colors duration-200 hover:translate-x-1 transform"
              >
                Home
              </a>
              <a 
                href="/login" 
                className="block text-gray-400 hover:text-white text-sm transition-colors duration-200 hover:translate-x-1 transform"
              >
                Login
              </a>
              <a 
                href="/register" 
                className="block text-gray-400 hover:text-white text-sm transition-colors duration-200 hover:translate-x-1 transform"
              >
                Sign Up
              </a>
            </div>
          </div>
          
          {/* Legal */}
          <div className="text-center lg:text-right space-y-3">
            <h3 className="text-lg sm:text-xl font-semibold text-white">Legal</h3>
            <div className="space-y-2">
              <a 
                href="/privacypolicy" 
                className="block text-gray-400 hover:text-white text-sm transition-colors duration-200 hover:translate-x-1 transform"
              >
                Privacy Policy
              </a>
              <a 
                href="/termsofservice" 
                className="block text-gray-400 hover:text-white text-sm transition-colors duration-200 hover:translate-x-1 transform"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-10 pt-6 text-center">
          <p className="text-gray-400 text-sm">
            © 2025 Availly by BaghLabs. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
