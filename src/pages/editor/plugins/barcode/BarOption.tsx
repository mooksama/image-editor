import React, { useReducer } from 'react';
import Item from '@options/item';
import { editor } from '@stores/editor';
import { util } from '@utils/index';
import { observer } from 'mobx-react';
import SetColor from '@options/set-color';
import { BarcodeLayer } from './types';
import useUpdate from '@options/useUpdate';
import { TextArea, Toast } from '@douyinfe/semi-ui';
import tinycolor from 'tinycolor2';

export interface IProps {}

function BarOption(props: IProps) {
  const elementData = editor.getElementData() as BarcodeLayer;
  const [forceUpdate] = useUpdate();
  return (
    <>
      <Item title="바코드 내용">
        <TextArea
          value={elementData.content}
          onChange={e => {
            if (/^[a-zA-Z0-9-]+$/.test(e.target.value)) {
              elementData.content = e.target.value;
              editor.updateCanvas();
              forceUpdate();
            } else {
              Toast.error('숫자, 문자, 하이픈을 입력하세요');
            }
          }}
          autosize
          maxCount={1000}
          onBlur={() => {
            editor.record({
              type: 'update',
              desc: '바코드 텍스트 내용 수정',
            });
          }}
        />
      </Item>
      <Item title="색상">
        <SetColor
          list={true}
          color={{
            type: 'solid',
            color: elementData.color,
          }}
          onChange={(v: any) => {
            elementData.color = tinycolor(v.color).toHex();
            editor.updateCanvas();
            forceUpdate();
            editor.record({
              type: 'update',
              desc: '바코드 색상 수정',
            });
          }}
        />
      </Item>
    </>
  );
}

export default observer(BarOption);
