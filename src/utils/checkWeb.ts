// 브라우저가 Google Chrome인지 확인
export function isChrome() {
  return /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
}

// Google Chrome의 버전 번호를 가져옴
export function getChromeVersion() {
  const match = navigator.userAgent.match(/Chrome\/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

// Google Chrome 버전이 98보다 큰지 확인
export function isChromeVersionGreaterThan(ver: number) {
  const chromeVersion = getChromeVersion();
  return chromeVersion && chromeVersion > ver;
}
