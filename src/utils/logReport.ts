/* eslint-disable prettier/prettier */
/**
 * 로그 관련 비즈니스 처리
 */
class LogReport {
  constructor() {

    //@ts-ignore
    this.debug = window.debug;
  }

  /**
   * 현재 오류 데이터를 가져옵니다
   * @param {object} param {msg, apiUrl = '', codeLine = '', codeName = '', error}
   * @returns
   */
  getParams({ msg = '', apiUrl = '', codeName = '', codeLine = '', error }: any) {
    return {
      ua: window.navigator.userAgent,
      errUrl: window.location.href,
      msg, // 구체적인 오류 정보
      apiUrl, // 오류가 발생한 URL
      codeLine, // 오류가 발생한 줄
      codeName, // 코드 모듈 이름
      error // 구체적인 오류 객체
    };
  }

  error(params: any) {
    console.error(this.getParams(params));
  }

  warn(params: any) {
    console.warn(this.getParams(params));
  }

  log(params: any) {
    console.log(this.getParams(params));
  }
}

const logReport = new LogReport();

export { logReport };
