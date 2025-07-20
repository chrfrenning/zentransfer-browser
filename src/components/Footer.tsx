export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-12">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center text-sm text-gray-600 space-y-2">
          <div>
            This gallery is produced by{' '}
            <a 
              href="https://github.com/chrfrenning/zentransfer-desktop/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              ZenTransfer
            </a>
            , which is free open source software.
          </div>
          <div>
            Copyright © {currentYear} ZenTransfer by Perceptron AS. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}