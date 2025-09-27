import { create } from "zustand";

const useUserStore = create((set) => ({
  users: [], 
  setUsers: (userArray) => set({ users: userArray }), 
  addUser: (newUser) =>
    set((state) => ({ users: [...state.users, newUser] })), 
  removeUser: (id) =>
    set((state) => ({ users: state.users.filter((u) => u.id !== id) })), 
  clearUsers: () => set({ users: [] }),
}));

export default useUserStore;
// global state to just acces the data and also store data directly
//  fetched by the database and use it globally around our application