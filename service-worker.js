// 무혼 비동 Service Worker
// ⚠️ 업데이트 시 이 버전을 반드시 변경하세요! (예: v1.0.0 -> v1.0.1)
const VERSION = 'v1.0.1';
const CACHE_NAME = `muhon-bidong-${VERSION}`;

console.log(`[Service Worker ${VERSION}] 초기화`);

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './stage_1.html',
  './stage_2.html',
  './stage_3.html',
  './stage_final.html',
  './rest_area_1.html',
  './rest_area_2.html',
  './rest_area_3.html',
  './ending.html',
  './manifest.json',
  // 공통 에셋
  './assets/common/Dokdo-Regular.ttf',
  './assets/common/rising_sheet.png',
  './assets/common/falling_sheet.png',
  './assets/common/jump_effect_sheet.png',
  './assets/common/axe.png',
  './assets/common/spear.png',
  './assets/common/sword.png',
  './assets/common/trap_asset.png',
  './assets/common/deflect_sheet.png',
  './assets/common/hit_effect_sheet.png',
  './assets/common/dead_sheet.png',
  './assets/common/right_out.png',
  './assets/common/option_btn.png',
  './assets/common/bgm_on.png',
  './assets/common/bgm_off.png',
  './assets/common/bgm.mp3',
  './assets/common/gameover.mp3'
];

// 설치 이벤트: 캐시에 파일 저장
self.addEventListener('install', (event) => {
  console.log('[Service Worker] 설치 중...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] 캐싱 시작');
        // 필수 파일만 먼저 캐싱 (에러 무시)
        return cache.addAll(ASSETS_TO_CACHE.slice(0, 10))
          .catch((err) => {
            console.warn('[Service Worker] 일부 파일 캐싱 실패:', err);
          })
          .then(() => {
            // 나머지 파일은 개별적으로 시도
            return Promise.all(
              ASSETS_TO_CACHE.slice(10).map((url) => {
                return cache.add(url).catch((err) => {
                  console.warn(`[Service Worker] ${url} 캐싱 실패`);
                });
              })
            );
          });
      })
      .then(() => {
        console.log('[Service Worker] 설치 완료');
        return self.skipWaiting(); // 즉시 활성화
      })
  );
});

// 활성화 이벤트: 오래된 캐시 삭제
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] 활성화 중...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] 오래된 캐시 삭제:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
      console.log('[Service Worker] 활성화 완료');
      return self.clients.claim(); // 모든 클라이언트 제어
    })
  );
});

// Fetch 이벤트: 스마트 캐싱 전략
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // HTML 파일은 네트워크 우선 (항상 최신 버전 확인)
  if (event.request.destination === 'document' || 
      url.pathname.endsWith('.html') ||
      url.pathname === '/' || 
      url.pathname.endsWith('/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // 네트워크에서 가져온 HTML을 캐시에 저장
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // 오프라인이면 캐시된 HTML 사용
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // 동영상과 큰 파일은 네트워크 우선
  if (event.request.url.includes('.mp4') || 
      event.request.url.includes('.webm') ||
      event.request.url.includes('cutscene')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request);
      })
    );
    return;
  }

  // 나머지 리소스(이미지, 폰트, 오디오)는 캐시 우선
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // 캐시에 있으면 캐시 반환 (빠른 로딩)
          // 동시에 백그라운드에서 업데이트 확인
          fetch(event.request).then((response) => {
            if (response && response.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, response);
              });
            }
          }).catch(() => {});
          
          return cachedResponse;
        }
        
        // 캐시에 없으면 네트워크에서 가져오기
        return fetch(event.request)
          .then((response) => {
            // 유효한 응답이면 캐시에 저장
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch((err) => {
            console.error('[Service Worker] Fetch 실패:', err);
            return new Response('오프라인 상태입니다.', {
              headers: { 'Content-Type': 'text/plain; charset=utf-8' }
            });
          });
      })
  );
});
