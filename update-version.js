#!/usr/bin/env node

/**
 * 무혼 비동 - 버전 자동 업데이트 스크립트
 * 
 * 사용법:
 *   node update-version.js 1.0.2
 * 
 * 기능:
 *   - service-worker.js의 VERSION 업데이트
 *   - manifest.json의 version 및 start_url 업데이트
 *   - 모든 HTML 파일의 meta version 업데이트
 */

const fs = require('fs');
const path = require('path');

// 버전 번호 검증 정규식 (예: 1.0.2, 2.5.10)
const VERSION_REGEX = /^\d+\.\d+\.\d+$/;

// 명령줄 인수에서 새 버전 가져오기
const newVersion = process.argv[2];

if (!newVersion) {
    console.error('❌ 오류: 버전 번호를 입력해주세요!');
    console.log('📝 사용법: node update-version.js 1.0.2');
    process.exit(1);
}

if (!VERSION_REGEX.test(newVersion)) {
    console.error('❌ 오류: 잘못된 버전 형식입니다! (예: 1.0.2)');
    process.exit(1);
}

console.log(`\n🚀 버전 업데이트 시작: v${newVersion}\n`);

// 1. service-worker.js 업데이트
function updateServiceWorker() {
    const filePath = path.join(__dirname, 'service-worker.js');
    let content = fs.readFileSync(filePath, 'utf8');
    
    // VERSION 상수 찾아서 교체
    content = content.replace(
        /const VERSION = 'v\d+\.\d+\.\d+';/,
        `const VERSION = 'v${newVersion}';`
    );
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ service-worker.js 업데이트 완료');
}

// 2. manifest.json 업데이트
function updateManifest() {
    const filePath = path.join(__dirname, 'manifest.json');
    let content = fs.readFileSync(filePath, 'utf8');
    const manifest = JSON.parse(content);
    
    manifest.version = newVersion;
    manifest.start_url = `./index.html?v=${newVersion}`;
    
    fs.writeFileSync(filePath, JSON.stringify(manifest, null, 2), 'utf8');
    console.log('✅ manifest.json 업데이트 완료');
}

// 3. 모든 HTML 파일 업데이트
function updateHtmlFiles() {
    const htmlFiles = [
        'index.html',
        'stage_1.html',
        'stage_2.html',
        'stage_3.html',
        'stage_final.html',
        'rest_area_1.html',
        'rest_area_2.html',
        'rest_area_3.html',
        'ending.html'
    ];
    
    htmlFiles.forEach(filename => {
        const filePath = path.join(__dirname, filename);
        if (!fs.existsSync(filePath)) {
            console.warn(`⚠️  ${filename} 파일을 찾을 수 없습니다.`);
            return;
        }
        
        let content = fs.readFileSync(filePath, 'utf8');
        
        // meta version 태그 교체
        content = content.replace(
            /<meta name="version" content="\d+\.\d+\.\d+">/,
            `<meta name="version" content="${newVersion}">`
        );
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ ${filename} 업데이트 완료`);
    });
}

// 4. VERSION_UPDATE_GUIDE.md 업데이트
function updateGuide() {
    const filePath = path.join(__dirname, 'VERSION_UPDATE_GUIDE.md');
    if (!fs.existsSync(filePath)) {
        console.warn('⚠️  VERSION_UPDATE_GUIDE.md 파일을 찾을 수 없습니다.');
        return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 현재 버전 업데이트
    content = content.replace(
        /## 현재 버전: v\d+\.\d+\.\d+/,
        `## 현재 버전: v${newVersion}`
    );
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ VERSION_UPDATE_GUIDE.md 업데이트 완료');
}

// 실행
try {
    updateServiceWorker();
    updateManifest();
    updateHtmlFiles();
    updateGuide();
    
    console.log(`\n✨ 모든 파일이 v${newVersion}으로 업데이트되었습니다!`);
    console.log('\n📤 다음 단계:');
    console.log('   1. 수정된 파일들을 서버에 업로드');
    console.log('   2. 스마트폰에서 게임 실행 및 테스트');
    console.log('   3. 콘솔에서 새 버전 확인\n');
    
} catch (error) {
    console.error('\n❌ 오류 발생:', error.message);
    process.exit(1);
}
