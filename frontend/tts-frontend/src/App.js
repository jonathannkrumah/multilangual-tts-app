import React, { useState } from "react";
import { useAuth } from "./AuthContext";
import { AuthModal } from "./components/Auth";

const languages = [
  { code: "en", name: "English" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "es", name: "Spanish" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "ar", name: "Arabic" },
  { code: "ru", name: "Russian" },
  { code: "nl", name: "Dutch" }
];

function App() {
  const { isAuthenticated, loading: authLoading, signOut, getIdToken, getCurrentUser } = useAuth();
  const [text, setText] = useState("");
  const [language, setLanguage] = useState("en");
  const [audioUrl, setAudioUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  // Text-to-text translator state
  const [srcText, setSrcText] = useState("");
  const [srcLang, setSrcLang] = useState("auto");
  const [dstLang, setDstLang] = useState("en");
  const [translated, setTranslated] = useState("");
  const [txLoading, setTxLoading] = useState(false);

  // Auth modal state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState("signin");
  const [userInfo, setUserInfo] = useState(null);

  // Get user info when authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      getCurrentUser().then(setUserInfo).catch(console.error);
    }
  }, [isAuthenticated, getCurrentUser]);

  const handleGenerateAudio = async () => {
    if (!text) return alert("Please enter some text.");
    setLoading(true);
    setAudioUrl(null);

    try {
      const API_URL = process.env.REACT_APP_TTS_API_URL;
      const token = await getIdToken();
      
      const response = await fetch(`${API_URL}/tts`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { "Authorization": token } : {})
        },
        body: JSON.stringify({ text, target_language: language })
      });

      const data = await response.json();

      if (data.url) setAudioUrl(data.url);
      else alert(data.error || "Something went wrong.");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTranslateText = async () => {
    if (!srcText) return alert("Please enter text to translate.");
    setTxLoading(true);
    setTranslated("");
    try {
      const API_URL = process.env.REACT_APP_TTS_API_URL;
      const token = await getIdToken();
      const response = await fetch(`${API_URL}/translate`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { "Authorization": token } : {})
        },
        body: JSON.stringify({ text: srcText, source_language: srcLang, target_language: dstLang })
      });
      const data = await response.json();
      if (data.translated_text !== undefined) setTranslated(data.translated_text);
      else alert(data.error || "Translation failed.");
    } catch (err) {
      alert(err.message);
    } finally {
      setTxLoading(false);
    }
  };

  // Show loading screen while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth modal if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Header */}
        <header className="bg-white shadow-lg">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center space-x-3 mb-4 md:mb-0">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Jonatech Multilingual App</h1>
                  <p className="text-sm text-gray-600">Break language barriers with AI-powered translation</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setAuthModalMode("signin");
                    setAuthModalOpen(true);
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setAuthModalMode("signup");
                    setAuthModalOpen(true);
                  }}
                  className="px-6 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Sign Up
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
              Transform Your Words Into{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Any Language
              </span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Experience the power of AI-driven translation and text-to-speech technology. 
              Convert text between 11 languages and generate natural-sounding speech instantly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button
                onClick={() => {
                  setAuthModalMode("signup");
                  setAuthModalOpen(true);
                }}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg"
              >
                Get Started Free
              </button>
              <button
                onClick={() => {
                  setAuthModalMode("signin");
                  setAuthModalOpen(true);
                }}
                className="px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-all duration-200"
              >
                Sign In
              </button>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Text-to-Speech</h3>
                <p className="text-gray-600">Convert any text into natural-sounding speech with AI-powered voices</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Translation</h3>
                <p className="text-gray-600">Translate text between 11 languages with high accuracy</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">AI-Powered</h3>
                <p className="text-gray-600">Powered by Amazon's advanced AI services for best results</p>
              </div>
            </div>
          </div>
        </main>

        <AuthModal 
          isOpen={authModalOpen} 
          onClose={() => setAuthModalOpen(false)} 
          mode={authModalMode}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Jonatech Multilingual App</h1>
                <p className="text-sm text-gray-600">Break language barriers with AI-powered translation</p>
              </div>
            </div>
             <div className="flex items-center space-x-4">
               <div className="flex space-x-2">
                 <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                 <span className="text-sm text-gray-600">AI Powered</span>
               </div>
               <div className="flex items-center space-x-3">
                 <span className="text-sm text-gray-600">Welcome, {userInfo?.name || 'User'}</span>
                 <button
                   onClick={signOut}
                   className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors"
                 >
                   Sign Out
                 </button>
               </div>
             </div>
          </div>
        </div>
      </header>

      {/* Marquee Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-3 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap">
          <span className="text-white text-lg font-medium mx-4">
            ✨ Transform your text into speech • Translate between 11 languages • AI-powered accuracy • Professional quality results
          </span>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 20s linear infinite;
        }
      `}</style>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Text-to-Speech Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 110 12.728M5.586 15.536a5 5 0 000-7.072m2.828 9.9a9 9 0 000-12.728" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Text-to-Speech</h2>
            </div>
            
            <textarea
              placeholder="Type your text here..."
              value={text}
              onChange={e => setText(e.target.value)}
              rows={5}
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4 transition-all duration-200"
            />

            <select
              value={language}
              onChange={e => setLanguage(e.target.value)}
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4 transition-all duration-200"
            >
              {languages.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>

            <button
              onClick={handleGenerateAudio}
              disabled={loading}
              className={`w-full py-4 rounded-xl text-white font-semibold transition-all duration-300 ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  Generating Audio...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Generate Audio
                </div>
              )}
            </button>

            {audioUrl && (
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Your Audio</h3>
                <audio controls src={audioUrl} autoPlay className="w-full rounded-lg" />
              </div>
            )}
          </div>

          {/* Text Translator Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Text Translator</h2>
            </div>
            
            <textarea
              placeholder="Enter text to translate..."
              value={srcText}
              onChange={e => setSrcText(e.target.value)}
              rows={5}
              className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent mb-4 transition-all duration-200"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <select
                value={srcLang}
                onChange={e => setSrcLang(e.target.value)}
                className="p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              >
                <option value="auto">Auto Detect</option>
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>

              <select
                value={dstLang}
                onChange={e => setDstLang(e.target.value)}
                className="p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleTranslateText}
              disabled={txLoading}
              className={`w-full py-4 rounded-xl text-white font-semibold transition-all duration-300 ${
                txLoading ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              }`}
            >
              {txLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  Translating...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  Translate Text
                </div>
              )}
            </button>

            {translated && (
              <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl border border-green-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Translation</h3>
                <div className="p-4 bg-white rounded-lg border border-green-200 whitespace-pre-wrap text-gray-700">
                  {translated}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16 bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Powerful Language Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Text-to-Speech</h3>
              <p className="text-gray-600">Convert any text into natural-sounding speech in multiple languages with our advanced AI technology.</p>
            </div>
            
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-green-50 to-teal-50 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Instant Translation</h3>
              <p className="text-gray-600">Translate text between 11 major world languages with high accuracy and contextual understanding.</p>
            </div>
            
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">AI-Powered</h3>
              <p className="text-gray-600">Leverage cutting-edge artificial intelligence for natural language processing and speech synthesis.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <span className="text-xl font-bold">Jonatech</span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-400">© 2023 Jonatech Multilingual App</p>
              <p className="text-gray-500 mt-1">All rights reserved for Jonatech Consult</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
