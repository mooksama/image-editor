import styles from './optionsInner.module.less';
import { observer } from 'mobx-react';
import ImageOptions from './elements/ImageOptions';
import TextOptions from './elements/TextOptions';
import GroupOptions from './elements/GroupOptions';
import GroupLayerOptions from './elements/GroupLayerOptions';
import { editor } from '@stores/editor';
import { Empty } from '@douyinfe/semi-ui';
import { IllustrationNoResult, IllustrationNoResultDark } from '@douyinfe/semi-illustrations';
import exLayers from '@plugins/index';

// console.log('exLayers', exLayers);

export interface IProps {
  elements: any[];
}

function OptionsInner(props: IProps) {
  const elements = editor.getElementDataByIds([...editor.selectedElementIds]) || [];

  if (elements.length === 1) {
    const [elementData] = elements;

    console.log('elementData', elementData);

    switch (elementData.type) {
      case 'image':
        return <ImageOptions key={elementData.id} element={elementData} />;
      case 'text':
        return <TextOptions key={elementData.id} element={elementData} />;
      case 'group':
        return <GroupLayerOptions key={elementData.id} element={elementData} />;
      default:
        const exLayer = exLayers.find(d => d.config.pid === elementData.type);
        if (exLayer) {
          return <exLayer.Options key={elementData.id} element={elementData} />;
        }
        return <div>알 수 없는 유형</div>;
    }
  } else if (elements.length > 1) {
    return <GroupOptions />;
  }

  return (
    <div className={styles.empty}>
      <Empty
        image={<IllustrationNoResult style={{ width: 150, height: 150 }} />}
        darkModeImage={<IllustrationNoResultDark style={{ width: 150, height: 150 }} />}
        description={'유형 오류'}
      />
    </div>
  );
}
export default observer(OptionsInner);
