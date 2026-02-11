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
        title="우리에 대해"
        visible={visible}
        onCancel={() => setVisible(false)}
        closeOnEsc={true}
        footer={null}
      >
        <div className={styles.info}>
          <p>
            <a href="https://www.h5ds.com" target="_blank">
              쓰촨 아이취우 과학기술
            </a>
            （약칭: H5과학기술）
            은 시각적 콘텐츠 제작 도구 개발에 전념하는 순수 기술형 과학기술 회사로, 주로 고객에게 자체 개발 제품의 사유화 배포, 소스 코드 상용 라이선스, 기술 컨설팅, 맞춤형 개발 등의 서비스를 제공합니다. 고객이 연구개발 비용을 절감하고 개발 효율성을 높일 수 있도록 돕습니다.
          </p>
          <h2>제품 매트릭스</h2>
          <ul className={styles.items}>
            <li>
              <a href="https://video.h5ds.com" target="_blank">
                <i>
                  <icons.ClipIcon />
                  <em className={styles.clip}></em>
                </i>
                <h3>비디오 편집 도구</h3>
                {limitTxt('강력한 온라인 비디오 편집 도구로, 다양한 AI 도구의 통합을 지원하며, 짧은 비디오 콘텐츠 생성 도구를 빠르게 구현할 수 있습니다.')}
                <span className={styles.more}>자세히 알아보기 →</span>
              </a>
            </li>
            <li>
              <a href="https://image.h5ds.com" target="_blank">
                <i>
                  <icons.ImgIcon />
                  <em className={styles.img}></em>
                </i>
                <h3>이미지 편집 도구</h3>
                {limitTxt('무료 오픈 소스 온라인 이미지 편집 도구로, 사용자 경험이 좋고, 상호작용이 원��하며, 인터페이스가 아름답습니다. 현재 AI 기능 통합 작업을 진행 중입니다.')}
                <span className={styles.more}>자세히 알아보기 →</span>
              </a>
            </li>
            <li>
              <a href="https://h5.h5ds.com" target="_blank">
                <i>
                  <icons.H5Icon />
                  <em className={styles.h5}></em>
                </i>
                <h3>H5 편집 도구</h3>
                {limitTxt('강력한 온라인 H5 랜딩 페이지 제작 도구로, 주로 H5 슬라이딩 페이지, 이벤트 랜딩 페이지, 초대장 등을 제작하는 데 사용됩니다.')}
                <span className={styles.more}>자세히 알아보기 →</span>
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
                  '파노라마 사진은 관광지 안내, 온라인 집 보기, 문화 관광 홍보 등 분야에서 널리 사용되며, 이 도구를 통해 파노라마 사진을 빠르게 파노라마 애플리케이션으로 만들 수 있습니다.',
                )}
                <span className={styles.more}>자세히 알아보기 →</span>
              </a>
            </li>
            <li>
              <a href="https://sharezm.com" target="_blank">
                <i>
                  <icons.CloudIcon />
                  <em className={styles.cloud}></em>
                </i>
                <h3>시엘 데스크탑 - 클라우드</h3>
                {limitTxt(
                  '시엘 데스크탑은 매우 아름다운 인터페이스를 가진 온라인 클라우드 드라이브로, 사용자가 여러 클라우드 드라이브 공간을 생성할 수 있으며, 다중 사용자 협업을 지원하고 다양한 파일 형식을 지원합니다.',
                )}
                <span className={styles.more}>자세히 알아보기 →</span>
              </a>
            </li>
          </ul>
          <div className={styles.footer}>
            <img style={{ width: 200 }} src="https://cdn.h5ds.com/wxq.jpg" alt="" />
            <span className={styles.wechat}>
              <i>
                <Wechat theme="filled" size="40" fill="#67b114" />
              </i>
              <h5>공식 위챗 공공 계정</h5>
              <img style={{ width: 148 }} src="https://cdn.h5ds.com/wechat.jpg" alt="" />
            </span>
          </div>
        </div>
      </Modal>
      <a onClick={() => setVisible(true)} className={styles.us}>
        <Info theme="outline" size="22" fill="var(--theme-icon)" />
        우리에 대해
      </a>
    </>
  );
}
