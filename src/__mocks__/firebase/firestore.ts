const addDoc = jest.fn();
const collection = jest.fn(() => ({}));
const serverTimestamp = jest.fn(() => 'ts');
const onSnapshot = jest.fn();
const query = jest.fn();
const orderBy = jest.fn();
const getCountFromServer = jest.fn();
const deleteDoc = jest.fn();
const doc = jest.fn();
const updateDoc = jest.fn();

// firebase/firestore also exports getFirestore which is used by src/firebase/config.ts
const getFirestore = jest.fn(() => ({}));

module.exports = {
  addDoc,
  collection,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  getCountFromServer,
  deleteDoc,
  doc,
  updateDoc,
  getFirestore,
};

// default behavior for getCountFromServer used in tests: return { data: () => ({ count: 0 }) }
getCountFromServer.mockResolvedValue({ data: () => ({ count: 0 }) });

// also export as named exports for ESM import compatibility
export {
  addDoc,
  collection,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  getCountFromServer,
  deleteDoc,
  doc,
  updateDoc,
  getFirestore,
};
