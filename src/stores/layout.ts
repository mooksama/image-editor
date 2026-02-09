import { theme } from '@theme';
import { action, observable, transaction } from 'mobx';
import { util, storage } from '../utils';

export interface SelectItem {
  type: 'folder' | 'item';
  id: string;
}

class Layout {
  @observable layoutKeys: Record<string, string> = {};

  @observable themeUpdateKey: 'dark' | 'light' = theme.getTheme();
  @observable languageUpdateKey: number = 1;

  // 다중 선택
  @observable selects: SelectItem[] = [];
  // 일괄 작업 스위치
  @observable openSelectManage: boolean = false;
  // 취소
  @action
  cancelSelected = () => {
    transaction(() => {
      this.selects = [];
      this.openSelectManage = false;
    });
  };
  @action
  setSelected = (item: SelectItem, checked: boolean) => {
    transaction(() => {
      if (checked) {
        this.selects.push({ ...item });
      } else {
        this.selects = this.selects.filter(d => d.id !== item.id);
      }
      if (this.selects.length) {
        this.openSelectManage = true;
      }
      this.selects = [...this.selects];
    });
  };

  // 수동으로 모듈 업데이트 트리거
  @action
  updateComponent = (...keyName: string[]) => {
    transaction(() => {
      for (let i = 0; i < keyName.length; i++) {
        this.layoutKeys[keyName[i]] = util.randomID();
      }
    });
  };
}

const layout = new Layout();

export { layout, Layout };
