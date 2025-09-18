import React, { useState } from "react";

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

  const handleGenerateAudio = async () => {
    if (!text) return alert("Please enter some text.");
    setLoading(true);
    setAudioUrl(null);

    try {
      const API_URL = process.env.REACT_APP_TTS_API_URL;
      
      const response = await fetch(`${API_URL}/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      const response = await fetch(`${API_URL}/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 space-y-8">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-6 text-center">Text-to-Speech App</h1>
        
        <textarea
          placeholder="Type your text here..."
          value={text}
          onChange={e => setText(e.target.value)}
          rows={5}
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
        />

        <select
          value={language}
          onChange={e => setLanguage(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
        >
          {languages.map(lang => (
            <option key={lang.code} value={lang.code}>{lang.name}</option>
          ))}
        </select>

        <button
          onClick={handleGenerateAudio}
          disabled={loading}
          className={`w-full py-3 rounded-md text-white font-semibold transition ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              Generating...
            </div>
          ) : "Generate Audio"}
        </button>

        {audioUrl && (
          <div className="mt-6">
            <audio controls src={audioUrl} autoPlay className="w-full" />
          </div>
        )}
      </div>

      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-lg">
        <h2 className="text-2xl font-semibold mb-4 text-center">Text Translator</h2>

        <textarea
          placeholder="Enter text to translate..."
          value={srcText}
          onChange={e => setSrcText(e.target.value)}
          rows={4}
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
        />

        <div className="grid grid-cols-2 gap-3 mb-4">
          <select
            value={srcLang}
            onChange={e => setSrcLang(e.target.value)}
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="auto">Auto Detect</option>
            {languages.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.name}</option>
            ))}
          </select>

          <select
            value={dstLang}
            onChange={e => setDstLang(e.target.value)}
            className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {languages.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.name}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleTranslateText}
          disabled={txLoading}
          className={`w-full py-3 rounded-md text-white font-semibold transition ${
            txLoading ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
          }`}
        >
          {txLoading ? "Translating..." : "Translate Text"}
        </button>

        {translated && (
          <div className="mt-4 p-3 border rounded bg-gray-50 whitespace-pre-wrap">{translated}</div>
        )}
      </div>
    </div>
  );
}

export default App;
