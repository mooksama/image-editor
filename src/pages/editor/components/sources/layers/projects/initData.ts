import { ViewData } from '@pages/editor/core/types/data';
import { util } from '@utils/index';

export function getInitData(): ViewData {
  const pid = util.createID();
  return {
    name: '제목 없음',
    desc: '설명 없음',
    version: '1.0.0',
    thumb: '',
    createTime: 0,
    updateTime: 0,
    selectPageId: pid,
    pages: [
      {
        id: pid,
        name: '첫 페이지',
        desc: '설명 없음',
        width: 1242,
        height: 2208,
        background: {
          type: 'solid',
          color: '#fff',
        },
        layers: [],
      },
    ],
  };
}
