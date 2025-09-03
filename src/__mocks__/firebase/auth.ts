const getAuth = jest.fn(() => ({}));
// call the callback immediately with `null` (no user) to simulate signed-out state
const onAuthStateChanged = jest.fn((auth: unknown, cb: (user: unknown) => void) => {
  try {
    cb(null);
  } catch {
    // ignore
  }
  return jest.fn();
});
const signInWithPopup = jest.fn();
const GoogleAuthProvider = jest.fn();
const signOut = jest.fn();

module.exports = {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
};

export {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
};
