import styles from './home.module.less';

interface IProps {
  ssrRes?: any; // 서버 렌더링으로 로드된 데이터
  history: History;
  location: { pathname: string; search: string; hash: string; state: any };
  match: { path: string; url: string; isExact: boolean; params: any };
  staticContext: { path: string; url: string; isExact: boolean; params: any };
  route: { path: string; ssr: boolean; exact: boolean; component: JSX.Element };
}

function Home(props: IProps) {
  return (
    <div className={styles.home}>
      <div className={styles.header}></div>
    </div>
  );
}
export default Home;
