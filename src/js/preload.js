const { ipcRenderer } = require('electron');

window.api = {
  // Function to initiate login process
  login: async (username, password) => {
    try {
      const result = await ipcRenderer.invoke('validate-credentials', username, password);
      return result;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  },
  signup: async (username, password) => {
    try {
      const result = await ipcRenderer.invoke('signup-user', username, password);
      return result;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
};
