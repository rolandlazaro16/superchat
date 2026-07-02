import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="absolute top-20 left-20 w-64 h-64 bg-primary rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-20 right-20 w-64 h-64 bg-accent rounded-full blur-[100px] opacity-20 pointer-events-none"></div>

      <div className="text-center z-10 max-w-3xl">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
          Connect with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Superchat</span>
        </h1>
        <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
          The ultimate multi-user platform for seamless text, voice, and high-quality video communication. Experience chatting like never before.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register" className="btn-primary text-white font-semibold py-4 px-8 rounded-full shadow-lg hover:shadow-primary/30 transition-all duration-300 text-lg flex items-center justify-center gap-2">
            Get Started
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
          <Link href="/login" className="bg-white/10 hover:bg-white/20 border border-white/10 text-white font-semibold py-4 px-8 rounded-full transition-all duration-300 text-lg flex items-center justify-center backdrop-blur-md">
            Log In
          </Link>
        </div>
      </div>
      
      {/* Features preview */}
      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 z-10 w-full max-w-5xl">
        <div className="glass-panel p-6 rounded-2xl flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-primary/20 text-primary rounded-xl flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-2">Real-time Text</h3>
          <p className="text-gray-400 text-sm">Lightning fast messaging with delivery and read receipts.</p>
        </div>
        
        <div className="glass-panel p-6 rounded-2xl flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-accent/20 text-accent rounded-xl flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-2">Crystal Voice</h3>
          <p className="text-gray-400 text-sm">High fidelity audio calls with background noise cancellation.</p>
        </div>
        
        <div className="glass-panel p-6 rounded-2xl flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-pink-500/20 text-pink-500 rounded-xl flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold mb-2">HD Video</h3>
          <p className="text-gray-400 text-sm">Face to face conversations anywhere in the world.</p>
        </div>
      </div>
    </div>
  );
}
