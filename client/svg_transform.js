// Jest transform for SVG imports (referenced by jest.config.js). No tests import
// SVGs; this stub exists so Jest can validate the transform option.
module.exports = {
  process: () => ({ code: 'module.exports = {}' })
}
