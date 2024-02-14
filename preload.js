const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('cmp', {
  resurface: () => ipcRenderer.invoke('resurface')
})
