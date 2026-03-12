import Header from "./Header";
import SideNav from "./SideNav";
import { useLocation } from 'react-router-dom';

export default function MainHeaderFooter() {
  const location = useLocation();
  const hideLayout = ['/login'];
  const shouldHideLayout = hideLayout.some(path => location.pathname.startsWith(path));

  return (
    <>
      {!shouldHideLayout && (
        <>
          <Header />
          <SideNav />
        </>
      )}
    </>
  );
}

