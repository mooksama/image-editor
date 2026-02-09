import { action, observable, transaction } from 'mobx';
import { util, storage, pubsub } from '../utils';
import type * as ctypes from '@config/types';
import type { SourceItem } from '@pages/editor/types';
import { theme } from '@theme';
import { language } from '@language/language';
// import { IApp } from '@leafer-ui/interface';
import Store from '../pages/editor/core/stores/Store';
import { Ruler } from 'leafer-x-ruler';
import type { RecordItem, RecordType } from '@pages/editor/core/types/helper';
import { BaseLayer, BasePage, GroupLayer, ViewData } from '@pages/editor/core/types/data';
import remove from 'lodash/remove';
import debounce from 'lodash/debounce';
import { Toast } from '@douyinfe/semi-ui';
// 소재 유형
export type MaterialTypes =
  | 'text'
  | 'image'
  | 'audio'
  | 'video'
  | 'sticker'
  | 'effect'
  | 'filter'
  | 'transition'
  | 'font'
  | string;

class Editor {
  public store!: Store;

  public data!: ViewData;

  // 복사된 데이터를 캐시
  public copyTempData: any;

  // 이미지 자르기 스위치
  @observable cropper: boolean = false;

  // 마지막으로 업데이트된 데이터
  public lastUpdateAppData: any = '';

  @observable updateViewKey: string = '';

  // 마우스 오른쪽 버튼 메뉴 표시 함수
  public showContextMenu: (event: any, props: Record<string, any>) => void;

  // 리소스 전환 후, list 데이터를 캐시
  public activeItems: Record<ctypes.SourceType, SourceItem[]> = {};
  // 캐시 데이터 설정
  setActiveItems = (items: SourceItem[], type: ctypes.SourceType) => {
    this.activeItems[type] = items;

    // 테스트용
    if (!(window as any).activeItems) {
      (window as any).activeItems = {};
    }
    (window as any).activeItems[type] = items;
  };
  // 캐시 데이터에서 데이터 읽기
  getFromActiveItems = (id: string, type: ctypes.SourceType) => {
    const items = this.activeItems[type] || [];
    return items.find(d => d.id === id);
  };

  // 현재 선택된 페이지
  @observable selectPageId: string;

  get pageData(): BasePage {
    return this.data.pages.find(d => d.id === this.selectPageId);
  }

  // 옵션 패널 사용자 정의
  @observable optionPanelCustom: 'background' | '' = '';

  // APPID 기록
  @observable appid: string = '';

  // 테마 업데이트
  @observable themeUpdateKey: 'dark' | 'light' = theme.getTheme();

  // 다국어
  @observable languageUpdateKey: 'zh-CN' | 'en-US' = language.getLanguage();

  // 히스토리 기록 테스트용
  @observable recordUpdateTestKey: number = 1;

  // 영화 생성 성공
  @observable movieCreateSuccess: boolean = false;
  // 설정 영역 변경 트리거
  @observable updateKey: string = '1';

  @observable updateCanvasKey: string = '1';

  @action
  updateOption = () => {
    this.updateKey = util.randomID();
  };

  @action
  updateOptionAsync = debounce(this.updateOption, 100);

  @action
  record = (params?: RecordItem<RecordType>) => {
    if (!params) {
      params = {
        type: 'global',
        desc: '작업 기록 추가',
        selecteds: [...editor.selectedElementIds],
      };
    }
    if (!params.selecteds) {
      params.selecteds = [...editor.selectedElementIds];
    }
    // 히스토리 기록
    this.store.record.add(params);
    this.recordUpdateTestKey = +new Date();
  };

  // 눈금자
  ruler: Ruler = null;

  @action
  updateCanvas = () => {
    console.log('화면 업데이트');
    this.updateCanvasKey = util.randomID();
    if (this.store) {
      this.store.update();
    }
  };

  @action
  updateCanvasSync = debounce(this.updateCanvas, 100);

  /**
   * 한 단계 위로 이동
   * @param selectedIds
   */
  @action
  upOneElement(selectedIds?: string[]) {
    if (!selectedIds) {
      selectedIds = [...this.selectedElementIds];
    }
    // 선택된 객체의 인덱스를 찾기
    let selectedIndexes = selectedIds.map(id => this.pageData.layers.findIndex(obj => obj.id === id));
    // 선택된 객체를 위로 이동
    const array = this.pageData.layers;
    selectedIndexes.forEach(index => {
      if (index > 0) {
        // 위치 교환
        [array[index], array[index - 1]] = [array[index - 1], array[index]];
      }
    });
    this.updateCanvas();
    this.store.emitControl(selectedIds);
  }
  /**
   * 한 단계 아래로 이동
   * @param selectedIds
   */
  @action
  downOneElement(selectedIds?: string[]) {
    console.log('선택한 레이어를 한 단계 아래로 이동');
    if (!selectedIds) {
      selectedIds = [...this.selectedElementIds];
    }
    // 선택된 객체의 인덱스를 찾기
    let selectedIndexes = selectedIds.map(id => this.pageData.layers.findIndex(obj => obj.id === id));
    // 선택된 객체를 아래로 이동
    const array = this.pageData.layers;
    selectedIndexes.forEach(index => {
      if (index < array.length - 1) {
        // 위치 교환
        [array[index], array[index + 1]] = [array[index + 1], array[index]];
      }
    });
    this.updateCanvas();
    this.store.emitControl(selectedIds);
  }

  /**
   * 맨 위로 이동
   * @param ids
   */
  @action
  moveTopElement(ids?: string[]) {
    if (!ids) {
      ids = [...this.selectedElementIds];
    }
    const removedObjects = remove(this.pageData.layers, obj => ids.includes(obj.id));
    this.pageData.layers.unshift(...removedObjects);
    this.updateCanvas();
    this.store.emitControl(ids);
  }

  /**
   * 맨 아래로 이동
   * @param ids
   */
  @action
  moveBottomElement(ids?: string[]) {
    if (!ids) {
      ids = [...this.selectedElementIds];
    }
    const removedObjects = remove(this.pageData.layers, obj => ids.includes(obj.id));
    this.pageData.layers.push(...removedObjects);
    this.updateCanvas();
    this.store.emitControl(ids);
  }

  /**
   * 요소 복사
   * @param ids
   */
  @action
  copyElement(ids?: string[]) {
    if (!ids) {
      ids = [...this.selectedElementIds];
    }
    const elements = this.getElementDataByIds(ids) || [];
    this.copyTempData = util.toJS(elements);
    Toast.success('복사 성공, Ctrl + V를 눌러 붙여넣기');
  }

  /**
   * 요소 잘라내기
   */
  cutElement(ids?: string[]) {
    console.log('요소 잘라내기');
    if (!ids) {
      ids = [...this.selectedElementIds];
    }
    const elements = this.getElementDataByIds(ids) || [];
    this.copyTempData = util.toJS(elements);
    this.store.deleteLayers(ids);
    this.updateCanvas();
    this.store.emitControl([]);
    Toast.success('잘라내기 성공, Ctrl + V를 눌러 붙여넣기');
  }

  /**
   * 선택된 요소
   */
  @observable selectedElementIds: string[] = [];
  @action
  setSelectedElementIds(ids: string[]) {
    if (ids.length) {
      pubsub.publish('showLayoutPanel', { type: 'options', visible: true });
    }
    transaction(() => {
      this.elementOptionType = 'basic';
      this.selectedElementIds = [...ids];
      if (ids.length === 0) {
        this.cropper = false;
      }
    });
  }

  /**
   * 컨트롤러 설정
   * @param element
   */
  setContorlAndSelectedElemenent = (ids: string[]) => {
    // updateControl은 Movie의 onSelectElements 이벤트를 트리거합니다.
    transaction(() => {
      this.setSelectedElementIds([...ids]);
      this.optionPanelCustom = '';
    });
    // 컨트롤러 설정
    console.log('컨트롤러 설정');
    this.store.emitControl([...ids]);
  };

  /**
   * 레이아웃 키 업데이트
   */
  @observable layoutKeys: Record<ctypes.LayoutName, string> = {
    sources: '1', // 리소스 패널
    timeline: '1', // 타임라인
    options: '1', // 설정 패널
    canvas: '1', //
    header: '1',
  };
  @action
  updateComponent = (...keyName: ctypes.LayoutName[]) => {
    transaction(() => {
      for (let i = 0; i < keyName.length; i++) {
        this.layoutKeys[keyName[i]] = util.randomID();
      }
      this.updateOption();
    });
  };

  /**
   * 리소스 패널 전환
   */
  @observable sourceType: ctypes.SourceType = 'template';
  @action
  setSourceType = (t: ctypes.SourceType) => {
    this.sourceType = t;
    pubsub.publish('showLayoutPanel', { type: 'sources', visible: true });
  };

  /**
   * 설정 패널 전환
   */
  @observable elementOptionType: ctypes.ElementOptionType = 'basic';
  @action
  setElementOptionType = (t: ctypes.ElementOptionType) => {
    this.elementOptionType = t;
  };

  @action
  getElementDataByIds = (ids: string[]) => {
    if (!this.store) {
      return [];
    }
    const arr = this.store.getLayerByIds(ids);
    return arr;
  };

  /**
   * 단일 선택된 요소 데이터 가져오기
   * @returns
   */
  @action
  getElementData = (): BaseLayer => {
    const elements = this.getElementDataByIds([...this.selectedElementIds]) || [];
    //@ts-ignore
    return elements[0] || {};
  };

  /**
   * 선택된 그룹의 요소 데이터 가져오기
   * @returns
   */
  @action
  getGroupElementData = () => {
    const elements = this.getElementDataByIds([...this.selectedElementIds]) || [];
    return elements;
  };

  @action
  cloneElements = (elements?: BaseLayer[]): BaseLayer[] => {
    if (!elements) {
      elements = this.getElementDataByIds([...this.selectedElementIds]) || [];
    }
    const cloneData: BaseLayer[] = util.toJS(elements);
    const changeId = (elems: BaseLayer[]) => {
      elems.forEach(elm => {
        elm.id = util.createID();
        elm._dirty = util.createID();
        if ((elm as GroupLayer).childs) {
          changeId((elm as GroupLayer).childs);
        }
      });
    };
    changeId(cloneData);
    cloneData.forEach(elem => {
      elem.x += 10;
      elem.y += 10;
    });
    return cloneData;
  };

  /**
   * 요소 복사
   */
  @action
  copyElementData = () => {
    const elems = this.cloneElements();
    this.pageData.layers.unshift(...elems);
    this.updateCanvas();
    this.setSelectedElementIds(elems.map(d => d.id));
    this.store.emitControl(elems.map(d => d.id));
  };

  @action
  destroy() {
    this.store = null;
    this.copyTempData = null;
  }
}

const editor = new Editor();

export { editor, Editor };
