import React, { useEffect, useMemo } from 'react';
import { Leafer, Box, Image, Rect } from 'leafer-ui';
import { LayerProps } from '@core/types/helper';
import useLayerBaseStyle from '@core/hooks/useLayerBaseStyle';
import { QrcodeLayer } from './types';
import QRCode from 'qrcode';
import { debounce } from 'lodash';

export default function QrcodeComp(props: LayerProps) {
  const layer = props.layer as QrcodeLayer;
  const imgUI = useMemo<Image>(() => {
    const img = new Image({
      editable: props.isChild ? false : true,
      url: '',
      // 중심으로 정렬
      x: layer.x,
      y: layer.y,
      width: layer.width,
      height: layer.height,
      rotation: layer.rotation,
      opacity: layer.opacity,
      cornerRadius: [...layer.cornerRadius],
      shadow: { ...layer.shadow },
      stroke: layer.border.stroke,
      dashPattern: layer.border.dashPattern,
      dashOffset: layer.border.dashOffset,
      strokeWidth: layer.border.visible ? layer.border.strokeWidth : 0,
    });
    props.parent!.add(img as any);
    img.id = layer.id;
    img.zIndex = props.zIndex;
    return img;
  }, []);

  // 공통 use
  useLayerBaseStyle(layer, imgUI as any, props.store, props.zIndex);

  useEffect(() => {
    imgUI.width = layer.width;
    imgUI.height = layer.height;

    // 뒤집기
    if (layer.flipx) {
      imgUI.scaleX = -1;
    } else {
      imgUI.scaleX = 1;
    }
    if (layer.flipy) {
      imgUI.scaleY = -1;
    } else {
      imgUI.scaleY = 1;
    }

    // 모서리 반경
    imgUI.cornerRadius = layer.cornerRadius ? [...layer.cornerRadius] : undefined;
  }, [layer.width, layer.height, layer.flipx, layer.flipy, layer.cornerRadius]);

  useEffect(() => {
    const options = {
      width: layer.width,
      margin: 1,
      color: {
        light: layer.lightcolor,
        dark: layer.darkcolor,
      },
    };

    // QR 코드 생성
    QRCode.toDataURL(layer.content || 'null', { ...options }).then(url => (imgUI.url = url));

    // 컨트롤러가 변경될 때 이 함수가 호출됩니다.
    props.store.controlScaleFuns[layer.id] = debounce(() => {
      QRCode.toDataURL(layer.content || 'null', { ...options }).then(url => (imgUI.url = url));
    }, 500);
    return () => {
      // 컴포넌트가 소멸될 때 함수의 참조를 삭제해야 합니다.
      delete props.store.elementDragUp[layer.id];
    };
  }, [layer.content, layer.lightcolor, layer.darkcolor]);

  useEffect(() => {
    return () => {
      imgUI.remove();
      // imgBox.destroy();
    };
  }, []);

  return null;
}
