import React, { useEffect, useMemo, useRef } from 'react';
import { Leafer, Box, Image, Rect } from 'leafer-ui';
import { LayerProps } from '../types/helper';
import { ImageLayer } from '../types/data';
import useLayerBaseStyle from '../hooks/useLayerBaseStyle';
import type { IImagePaint } from '@leafer-ui/interface';
import { getFileExtension } from '../tools/utils';
import { utils } from '../tools';

export default function ImageComp(props: LayerProps) {
  const layer = props.layer as ImageLayer;
  const svgstr = useRef('');
  const [imgBox, imgUI] = useMemo<[Box, Image]>(() => {
    const box = new Box({
      editable: props.isChild ? false : true,
      x: layer.x,
      y: layer.y,
      width: layer.width,
      height: layer.height,
      rotation: layer.rotation,
      opacity: layer.opacity,
      fill: 'rgba(0,0,0,0.0)',
      hoverStyle: {
        stroke: '#000',
      },
      // overflow: 'hide',
    });
    box.id = layer.id;
    box.zIndex = props.zIndex;
    const img = new Image({
      // url: layer.url,
      fill: {
        type: 'image',
        mode: 'clip',
        url: props.store.setURL(layer.url),
        // scale: { x: 1, y: 1 },
      },
      around: 'center',
      x: layer.width / 2,
      y: layer.height / 2,
      width: layer.width,
      height: layer.height,
      cornerRadius: [...layer.cornerRadius],
      shadow: { ...layer.shadow },
      stroke: layer.border.stroke,
      dashPattern: layer.border.dashPattern,
      dashOffset: layer.border.dashOffset,
      strokeWidth: layer.border.visible ? layer.border.strokeWidth : 0,
    });
    box.add(img as any);
    props.parent!.add(box as any);
    return [box, img];
  }, []);

  // 공용 훅
  useLayerBaseStyle(layer, imgBox as any, props.store, props.zIndex);

  const replaceColor = (txt: string) => {
    if (!layer.svgColorType) {
      layer.svgColorType = 'more';
    }
    console.log('layer.svgColorType', layer.svgColorType, layer.svgColors);
    // 색상 교체
    if (layer.svgColorType === 'one') {
      if (layer.svgColors && layer.svgColors[0]) {
        txt = utils.replaceSveColor(txt, layer.svgColors[0] || '#000000');
      }
    } else {
      if (layer.svgColors && layer.svgColors.length) {
        txt = utils.replaceSveColor(txt, layer.svgColors);
      }
    }
    return 'data:image/svg+xml,' + encodeURIComponent(txt);
  };

  // SVG인 경우 데이터 구조를 분석해야 합니다.
  const svgHTML = async (url: string) => {
    const ext = getFileExtension(url);
    if (svgstr.current) {
      return replaceColor(svgstr.current);
    }
    if (ext === 'svg') {
      return await fetch(url)
        .then(async response => {
          if (response.ok) {
            const txt = await response.text();
            svgstr.current = txt;
            console.log('처음으로 SVG를 로드합니다', txt);
            return replaceColor(txt);
          }
          throw new Error('네트워크 응답이 올바르지 않습니다.');
        })
        .catch(error => {
          console.error('fetch 작업에 문제가 발생했습니다:', error);
        });
    } else {
      return url;
    }
  };

  useEffect(() => {
    const url = props.store.setURL(layer.url);
    svgHTML(url).then(u => {
      (imgUI.fill as IImagePaint) = {
        url: u || '',
        type: 'image',
        mode: 'clip',
        scale: { x: scaleX, y: scaleY },
        offset: { x: -x * scaleX, y: -y * scaleX },
      };
    });

    const { x, y, width, height } = layer.cropSize || {
      x: 0,
      y: 0,
      width: layer.naturalWidth,
      height: layer.naturalHeight,
    };
    const scaleX = layer.width / width;
    const scaleY = layer.height / height;

    imgUI.width = layer.width;
    imgUI.height = layer.height;
    imgUI.x = layer.width / 2;
    imgUI.y = layer.height / 2;

    // 너비와 높이 설정
    imgBox.width = layer.width;
    imgBox.height = layer.height;

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
  }, [
    layer.width,
    layer.height,
    layer.flipx,
    layer.flipy,
    layer.cornerRadius,
    layer.url,
    layer.cropSize,
    layer.svgColorType,
    layer.svgColors,
  ]);

  useEffect(() => {
    props.store.controlScaleFuns[layer.id] = () => {
      imgUI.width = layer.width;
      imgUI.height = layer.height;
      imgUI.x = layer.width / 2;
      imgUI.y = layer.height / 2;

      // 자르기
      const { x, y, width, height } = layer.cropSize || {
        x: 0,
        y: 0,
        width: layer.naturalWidth,
        height: layer.naturalHeight,
      };
      const scaleX = layer.width / width;
      const scaleY = layer.height / height;
      svgHTML(props.store.setURL(layer.url)).then(u => {
        (imgUI.fill as IImagePaint) = {
          url: u || '',
          type: 'image',
          mode: 'clip',
          scale: { x: scaleX, y: scaleY },
          offset: { x: -x * scaleX, y: -y * scaleX },
        };
      });
    };
    return () => {
      delete props.store.controlScaleFuns[layer.id];
      imgBox.remove();
      // imgBox.destroy();
    };
  }, []);

  return null;
}
