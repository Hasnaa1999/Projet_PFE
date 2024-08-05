import { BrowserRouter, Route, Routes } from "react-router-dom";
import Dashboard from "./scenes";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import { useStateContext } from "./contexts/ContextProvider";
import { DashboardPage } from "./components/Dashboard";



function App() {
  const { activeMenu } = useStateContext();
  return (
    <div>
      <BrowserRouter>
        <div className="flex relaive dark:bg-main-dark-bg">
          
          {activeMenu ? (
            <div
              className="w-72 fixed sidebar
            dark:bg-secondary-dark-bg
            bg-white"
            >
              <Sidebar />
            </div>
          ) : (
            <div
              className="w-0
            dark:bg-secondary-dark-bg"
            >
              <Sidebar />
            </div>
          )}
          <div
            className={`dark:bg-main-bg bg-main-bg
            min-h-screen w-full ${activeMenu ? "md:ml-72" : "flex-2"} `}
          >
            <div
              className="fixed md:static
            bg-main-bg dark:bg-main-dark-bg
            navbar w-full"
            >
              <Navbar />
            </div>
          
          <div>
            <Routes>
              {/* Dashboard*/}

              <Route path="/" element={<Dashboard />} />
              <Route path="/Dashboard" element={<Dashboard />} />
              {/* <Route path="/Add-Dashboard" element={<Dashboard />} /> */}
              <Route path="/dashboard/:dashboardId" element={<DashboardPage />} />
            </Routes>
          </div>
          </div>
        </div>
      </BrowserRouter>
    </div>
  );
};

export default App;
// // supppression des nouveau dashboard avec un id Undefined
// import React, { useEffect } from 'react';
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import DashboardPage from './components/Dashboard/DashboardPage' // Assurez-vous que le chemin est correct
// import { useStateContext } from './contexts/ContextProvider';
// import Sidebar from './components/Sidebar'; // Assurez-vous que le chemin est correct

// function App() {
//   const { dashboards, setDashboards } = useStateContext();

//   useEffect(() => {
//     // Filtrer les dashboards sans ID valide
//     const filteredDashboards = dashboards.filter(dashboard => dashboard.id !== undefined);
//     setDashboards(filteredDashboards);
//     localStorage.setItem('dashboards', JSON.stringify(filteredDashboards));
//   }, [dashboards, setDashboards]); // Dépendances pour s'assurer que le nettoyage s'effectue après la mise à jour des dashboards

//   return (
//     <Router>
//       <div className="App">
//         <Sidebar />
//         <Routes>
//           <Route path="/" element={<div>Accueil</div>} />
//           <Route path="/dashboard/:dashboardId" element={<DashboardPage />} />
//           {/* Ajoutez d'autres routes selon vos besoins */}
//         </Routes>
//       </div>
//     </Router>
//   );
// }

// export default App;
