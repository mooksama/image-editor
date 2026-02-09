import UndoRedoManager from 'undo-redo-manager2';
import debounce from 'lodash/debounce';
import { useEffect, useRef } from 'react';
import Store from './stores/Store';
import * as utils from './tools/utils';
import type { RecordItem, RecordType } from './types/helper';
import { pubsub } from '@utils/pubsub';

export interface IProps {
  store: Store;
}

/**
 * 작업 기록, 되돌리기, 다시 실행
 * @param props
 * @returns
 */
function RecordManager(props: IProps) {
  const manager = useRef<any>();
  const store = props.store;

  useEffect(() => {
    manager.current = new UndoRedoManager({
      limit: 50, // 최대 기록 30회 설정, 기본값은 50회
    });

    const add = (item: RecordItem<RecordType>) => {
      // console.log('Record 데이터--------------->', item, utils.toJS(store.data));
      manager.current.add({
        id: utils.createID(),
        type: 'global',
        desc: item.desc,
        selecteds: [...item.selecteds],
        mdata: utils.cloneData(store.data),
      });
      // test 업데이트
      if (store.addRecordCallback) {
        store.addRecordCallback();
      }
    };

    // 데이터 복원
    const restore = (item: RecordItem<RecordType>, type: 'undo' | 'redo'): boolean => {
      if (!item) {
        console.warn('이미 초기 위치로 복원되었습니다');
        return false;
      }
      // 해당 데이���를 찾아서 매개변수 설정
      if (item.mdata) {
        utils.objectCopyValue(item.mdata, store.data);
      }
      // 뷰 업데이트
      store.update();
      store.editor.update();
      pubsub.publish('emitSelectElements', [...(item.selecteds || [])]);
      return true;
    };

    // 다시 실행
    const redo = () => {
      const item = manager.current.redo() as RecordItem<RecordType>;
      return restore(item, 'redo');
    };

    // 되돌리기
    const undo = () => {
      const item = manager.current.undo() as RecordItem<RecordType>;
      return restore(item, 'undo');
    };

    store.record = { add, redo, undo, debounceAdd: debounce(add, 500), manager: manager.current };

    add({ type: 'global', desc: '초기화 데이터', selecteds: [] });

    return () => {
      manager.current.destroy();
    };
  }, []);

  return null;
}

export default RecordManager;
