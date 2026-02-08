import { useState } from 'react';
import { Info, Wechat } from '@icon-park/react';
import { Modal } from '@douyinfe/semi-ui';
import styles from './aboutus.module.less';
import * as icons from './icon';

export interface IProps {}

export default function AboutUs(props: IProps) {
  const [visible, setVisible] = useState(false);

  const limitTxt = (str: string, n?: number) => {
    if (!n) {
      n = 20;
    }
    let nstr = str.substring(0, n);
    if (nstr.length < str.length) {
      nstr += '...';
    }
    return (
      <span className={styles.desc} title={str}>
        {nstr}
      </span>
    );
  };

  return (
    <>
      <Modal
        width={1000}
        title="정보"
        visible={visible}
        onCancel={() => setVisible(false)}
        closeOnEsc={true}
        footer={null}
      >
        <div className={styles.info}>
          <p>
            <a href="https://www.h5ds.com" target="_blank">
              四川爱趣五科技
            </a>
            （약칭: H5과기）
            는 시각화 콘텐츠 제작 도구 연구개발에 집중하는 순수 기술 과학기술 회사이며, 주로 고객에게 자체 개발 제품의 프라이빗 배포, 소스 코드 상업 라이선스, 기술 자문, 맞춤 개발 등의 서비스를 제공합니다; 고객의 연구개발 비용을 절감하고, 개발 효율을 향상시킵니다.
          </p>
          <h2>제품 생태계</h2>
          <ul className={styles.items}>
            <li>
              <a href="https://video.h5ds.com" target="_blank">
                <i>
                  <icons.ClipIcon />
                  <em className={styles.clip}></em>
                </i>
                <h3>비디오 편집 도구</h3>
                {limitTxt('강력한 온라인 비디오 편집 도구, 다양한 AI 도구 통합 지원, 숏폼 콘텐츠 생성 도구 빠른 구축')}
                <span className={styles.more}>더 알아보기 →</span>
              </a>
            </li>
            <li>
              <a href="https://image.h5ds.com" target="_blank">
                <i>
                  <icons.ImgIcon />
                  <em className={styles.img}></em>
                </i>
                <h3>이미지 편집 도구</h3>
                {limitTxt('무료 오픈소스 온라인 이미지 편집 도구, 우수한 사용자 경험, 부드러운 인터랙션, 아름다운 인터페이스, 현재 AI 기능 통합 중')}
                <span className={styles.more}>더 알아보기 →</span>
              </a>
            </li>
            <li>
              <a href="https://h5.h5ds.com" target="_blank">
                <i>
                  <icons.H5Icon />
                  <em className={styles.h5}></em>
                </i>
                <h3>H5 편집 도구</h3>
                {limitTxt('강력한 온라인 H5 랜딩 페이지 제작 도구, 주로 H5 슬라이드 페이지, 활동 랜딩 페이지, 초대장 등 제작에 사용')}
                <span className={styles.more}>더 알아보기 →</span>
              </a>
            </li>
            <li>
              <a href="https://720.h5ds.com" target="_blank">
                <i>
                  <icons.VRIcon />
                  <em className={styles.vr}></em>
                </i>
                <h3>720 파노라마 도구</h3>
                {limitTxt(
                  '파노라마 이미지는 관광지 안내, 온라인 부동산 보기, 문화관광 홍보 등 분야에 널리 활용되며, 이 도구로 파노라마 사진을 빠르게 파노라마 응용프로그램으로 제작할 수 있습니다',
                )}
                <span className={styles.more}>더 알아보기 →</span>
              </a>
            </li>
            <li>
              <a href="https://sharezm.com" target="_blank">
                <i>
                  <icons.CloudIcon />
                  <em className={styles.cloud}></em>
                </i>
                <h3>시어 데스크톱-클라우드</h3>
                {limitTxt(
                  '시어 데스크톱은 매우 아름다운 인터페이스의 온라인 클라우드 스토리지로, 사용자가 여러 클라우드 공간을 생성할 수 있으며, 다중 사용자 협업과 다양한 파일 형식을 지원합니다',
                )}
                <span className={styles.more}>더 알아보기 →</span>
              </a>
            </li>
          </ul>
          <div className={styles.footer}>
            <img style={{ width: 200 }} src="https://cdn.h5ds.com/wxq.jpg" alt="" />
            <span className={styles.wechat}>
              <i>
                <Wechat theme="filled" size="40" fill="#67b114" />
              </i>
              <h5>공식 위챗 공개 계정</h5>
              <img style={{ width: 148 }} src="https://cdn.h5ds.com/wechat.jpg" alt="" />
            </span>
          </div>
        </div>
      </Modal>
      <a onClick={() => setVisible(true)} className={styles.us}>
        <Info theme="outline" size="22" fill="var(--theme-icon)" />
        정보
      </a>
    </>
  );
}
