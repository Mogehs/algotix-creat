export const getUser = () => JSON.parse(localStorage.getItem("chatUser"));

export const saveUser = (user) =>
  localStorage.setItem("chatUser", JSON.stringify(user));

export const logoutUser = () => localStorage.removeItem("chatUser");
