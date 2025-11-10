// file orientado a estrategias preprocesamiento de datos

class Preprocessor {
  // Normalize input to JS string. Accepts Buffer or string.
  normalize(input) {
    if (Buffer.isBuffer(input)) return input.toString('utf8');
    if (typeof input === 'string') return input;
    throw new TypeError('input must be a string or Buffer');
  }

  // Remove non-printable control characters except common whitespace
  stripControlChars(s) {
    return s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]+/g, '');
  }

  // Quick helper: ensure text is ASCII (fallback by replacing non-ascii with '?')
  toAscii(s) {
    return s.replace(/[^\x00-\x7F]/g, '?');
  }
}

module.exports = new Preprocessor();
