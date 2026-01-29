'use client';
import Header from "./Header";
import SideNav from "./SideNav";
import { usePathname } from 'next/navigation';

export default function MainHeaderFooter() {
  const pathname = usePathname();

  // List of paths where layout should be hidden
  const hideLayout = ['/login'];

  // Check if pathname matches or starts with any hidden route
  const shouldHideLayout = hideLayout.some(path => pathname.startsWith(path));

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

