// import { useEffect, useState } from "react";
// import { getHealth } from "./services/api";

// import '@aws-amplify/ui-react';

// import {Authenticator} from '@aws-amplify/ui-react';
// import DocumentUpload from "./components/DocumentUpload";
// import Chat from "./components/Chat";

// interface HealthResponse {
//   success: boolean;
//   service: string;
//   status: string;
//   database: string;
//   timestamp: string;
// }

// function App() {
//   // const [health, setHealth] =
//   //   useState<HealthResponse | null>(null);

//   // const [error, setError] =
//   //   useState<string | null>(null);

//   // useEffect(() => {
//   //   getHealth()
//   //     .then(setHealth)
//   //     .catch((error) => {
//   //       setError(error.message);
//   //     });
//   // }, []);

//   // return (
//   //   <div>
//   //     <h1>Enterprise AI Assistant</h1>

//   //     <h2>System Status</h2>

//   //     {error && (
//   //       <p>
//   //         Error: {error}
//   //       </p>
//   //     )}

//   //     {health && (
//   //       <div>
//   //         <p>
//   //           API: {health.status}
//   //         </p>

//   //         <p>
//   //           Database: {health.database}
//   //         </p>

//   //         <p>
//   //           Service: {health.service}
//   //         </p>
//   //       </div>
//   //     )}
//   //   </div>
//   // );

//   return (
//     // <Authenticator>
//     //   {({signOut, user}) => (
//     //     <div style={{ padding: 40 }}>
//     //       <h1>
//     //         Enterprise AI Assistant
//     //       </h1>

//     //       <p>
//     //         Welcome{" "}
//     //         {user?.signInDetails?.loginId}
//     //       </p>

//     //       <button onClick={signOut}> Sign Out</button>

//     //       <hr />

//     //       <DocumentUpload />
//     //     </div>
//     //   )}
//     // </Authenticator>

//     <>
//     <Chat />
//   </>
//   )
// }

// export default App;

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import {
  Authenticator
} from "@aws-amplify/ui-react";

import "@aws-amplify/ui-react/styles.css";

import AdminDashboard
  from "./pages/AdminDashboard";

import AdminDocuments
  from "./pages/AdminDocuments";

import ChatPage
  from "./pages/ChatPage";

export default function App() {
  return (
    <Authenticator>
      {({ signOut, user }) => (
        <BrowserRouter>

          <div style={{ padding: "20px" }}>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "20px"
              }}
            >

              <div>
                Welcome,{" "}
                {user?.signInDetails?.loginId}
              </div>

              <button onClick={signOut}>
                Sign Out
              </button>

            </div>

            <Routes>

              <Route
                path="/"
                element={
                  <Navigate
                    to="/chat"
                    replace
                  />
                }
              />

              <Route
                path="/chat"
                element={<ChatPage />}
              />

              <Route
                path="/admin"
                element={<AdminDashboard />}
              />

              <Route
                path="/admin/documents"
                element={<AdminDocuments />}
              />

              <Route
                path="*"
                element={
                  <Navigate
                    to="/chat"
                    replace
                  />
                }
              />

            </Routes>

          </div>

        </BrowserRouter>
      )}
    </Authenticator>
  );
}