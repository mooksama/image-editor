import styles from './more.module.less';
import WaterFull from '@components/water-full';
import { PayCodeOne, VipOne, ChartHistogramOne, StereoPerspective, BarCode, Audit, Search } from '@icon-park/react';
import { DanMuIcon } from './icon';
import { addItem } from '../addItem';
import { editor } from '@stores/editor';
import { Toast } from '@douyinfe/semi-ui';
import exLayers from '@plugins/index';

export interface IProps {
  show: boolean;
}
let hasRender = false;

export default function More(props: IProps) {
  if (!hasRender) {
    if (props.show) {
      hasRender = true;
    } else {
      return null;
    }
  }

  const addPlus = a => {
    console.log('플러그인 추가', a);
    const exLayer = exLayers.find(d => d.config.pid === a.id);
    if (exLayer) {
      const ndata = new exLayer.LayerData();
      console.log(ndata);
      editor.pageData.layers.unshift(ndata);
      editor.updateCanvas();
      editor.store.emitControl([ndata.id]);
    } else {
      Toast.warning('작성자가 아직 시간이 없어요. 코드 기여를 기다립니다');
    }
    // switch (d.id) {
    //   case 'chart':
    //     addItem({ type: 'echart' });
    //     break;
    //   case 'model3D':
    //     addItem({ type: 'model3D' });
    //     break;
    // }
  };

  return (
    <div style={{ height: '100%', display: props.show ? 'block' : 'none' }}>
      <div className={styles.moreList + ' scroll'}>
        <h1 className={styles.title}>추가 플러그인</h1>
        <WaterFull
          itemWidth={60}
          itemClassName={styles.waterfull}
          item={(d: any) => {
            return (
              <div
                onClick={() => {
                  addPlus(d);
                }}
                className={styles.item}
              >
                <span>
                  {d.icon}
                  <p>
                    {d.vip && <VipOne theme="filled" size="14" fill="#FFA24D" />}
                    {d.name}
                  </p>
                </span>
              </div>
            );
          }}
          list={[
            {
              id: 'qrcode',
              name: 'QR 코드',
              icon: <PayCodeOne theme="filled" size="25" fill="var(--theme-icon)" />,
            },
            {
              id: 'barcode',
              name: '바코드',
              icon: <BarCode theme="filled" size="25" fill="var(--theme-icon)" />,
            },
            {
              id: 'chart',
              name: '차트',
              vip: false,
              icon: <ChartHistogramOne theme="filled" size="25" fill="var(--theme-icon)" />,
            },
            {
              id: 'watermark',
              name: '워터마크',
              vip: false,
              icon: <Audit theme="filled" size="25" fill="var(--theme-icon)" />,
            },
          ].map(d => {
            return { ...d, width: 100, height: 100 };
          })}
        />
      </div>
    </div>
  );
}
