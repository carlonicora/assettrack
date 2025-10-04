// Mock for marked during testing
module.exports = {
  marked: jest.fn((text) => `<p>${text}</p>`),
  parse: jest.fn((text) => `<p>${text}</p>`),
  setOptions: jest.fn(),
  use: jest.fn(),
};
