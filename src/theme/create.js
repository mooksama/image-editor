// theme.less 파일을 theme-dark.ts로 생성
const fs = require('fs');

// 읽을 파일 경로 지정
const filePath = 'theme.less';

// fs.readFile 메서드를 사용하여 비동기적으로 파일 내용을 읽음
fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error(err);
    return;
  }
  // 정규 표현식을 사용하여 변수 정의를 매칭
  const regex = /--([\w-]+):\s([^;]+)/g;
  let matches;
  const result = {};

  while ((matches = regex.exec(data)) !== null) {
    const [, key, value] = matches;
    result['--' + key] = value.trim();
  }
  const output = JSON.stringify(result, null, 2);
  console.log(output);
});
