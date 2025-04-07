// Global speech utility functions
const SpeechUtils = {
  speak: (text, options = {}) => {
    if (!('speechSynthesis' in window)) {
      console.log('Text-to-speech not supported in this browser');
      return false;
    }
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    // Create a new speech utterance
    const speech = new SpeechSynthesisUtterance(text);
    
    // Apply options with defaults
    speech.lang = options.lang || 'en-US';
    speech.rate = options.rate || 1;
    speech.pitch = options.pitch || 1;
    speech.volume = options.volume || 1;
    
    // Set callbacks if provided
    if (options.onstart) speech.onstart = options.onstart;
    if (options.onend) speech.onend = options.onend;
    if (options.onerror) speech.onerror = options.onerror;
    
    // Start speaking
    window.speechSynthesis.speak(speech);
    return true;
  },
  
  stop: () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      return true;
    }
    return false;
  },
  
  isSpeechSupported: () => {
    return 'speechSynthesis' in window;
  }
};

export default SpeechUtils;