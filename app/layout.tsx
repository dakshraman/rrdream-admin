import { Suspense } from 'react';

import "../public/admin-assets/styles/style.css";
import MainHeaderFooter from "@/components/backendcomponents/MainHeaderFooter";
import AuthSessionGuard from "@/components/backendcomponents/AuthSessionGuard";
import NextTopLoader from "nextjs-toploader";
import Loader from "@/app/loading";
import '../public/admin-assets/fonts/font.css';
import { Toaster } from 'react-hot-toast';
import { ReduxProvider } from "../store/ReduxProvider";
export const metadata = {
  title: "RDream Admin Panel",
  description: "RDream Admin Panel",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body cz-shortcut-listen="true">
        <ReduxProvider>
          <Loader />
          <AuthSessionGuard>
            <MainHeaderFooter />
            <Suspense fallback={<Loader />}>
              {children}
            </Suspense>
          </AuthSessionGuard>
          <Toaster
            position="top-center"
            reverseOrder={true}
            toastOptions={{
              duration: 1000,
              style: {
                borderRadius: '8px',
                padding: '12px 16px',
                color: '#fff',
              },
              success: {
                style: { background: '#22c55e' },
                iconTheme: {
                  primary: '#ffffff',
                  secondary: '#16a34a',
                },
              },
              error: {
                style: { background: '#ef4444' },
                iconTheme: {
                  primary: '#ffffff',
                  secondary: '#b91c1c',
                },
              },
            }}
          />
        </ReduxProvider>
      </body>
    </html>
  );
}




// import { Suspense } from 'react';
// import Head from 'next/head';
// import "../../../public/admin-assets/styles/style.css";
// import MainHeaderFooter from "@/components/backendcomponents/MainHeaderFooter";
// import NextTopLoader from "nextjs-toploader";
// import '../../../public/admin-assets/fonts/font.css';
// import { Toaster } from 'react-hot-toast';
// import { ReduxProvider }  from "../../../store/ReduxProvider";
// export const metadata = {
//   title: "RDream Admin Panel",
//   description: "RDream Admin Panel",
// };

// export default function AdminLayout({ children }: { children: React.ReactNode }) {

//   return (
//     <html lang="en">
//       <ReduxProvider>
//         <Head>
//           <title>RDream Admin Panle</title>
//           <meta name="description" content="Admin Panel for RDream" />
//         </Head>
//         <body>
//           <NextTopLoader color="#243b56" showSpinner={false} />
//           <MainHeaderFooter />
//           {/* ✅ Wrap dynamic children in Suspense */}
//           <Suspense fallback={<div>Loading...</div>}>
//             {children}
//           </Suspense>
//           <Toaster
//             position="top-center"
//             reverseOrder={true}
//             toastOptions={{
//               duration: 5000,
//               style: {
//                 borderRadius: '8px',
//                 padding: '12px 16px',
//                 color: '#fff',
//               },
//               success: {
//                 style: { background: '#22c55e' },
//                 iconTheme: {
//                   primary: '#ffffff',
//                   secondary: '#16a34a',
//                 },
//               },
//               error: {
//                 style: { background: '#ef4444' },
//                 iconTheme: {
//                   primary: '#ffffff',
//                   secondary: '#b91c1c',
//                 },
//               },
//             }}
//           />
//         </body>
//       </ReduxProvider>
//     </html>
//   );
// }
