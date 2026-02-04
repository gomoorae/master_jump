const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1600,
    height: 900,
    useContentSize: true, // ★ 핵심: 제목 표시줄을 제외하고 '내부 콘텐츠'만 딱 1600x900으로 맞춘다!
    resizable: false,     // 창 크기 조절 금지
    icon: path.join(__dirname, 'assets/common/right_out.png'), // 게임 아이콘도 슬쩍 넣어봤어!
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // 메뉴바(File, Edit 등)를 숨겨서 진짜 게임처럼 보이게 함
  win.setMenu(null); 

  win.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});