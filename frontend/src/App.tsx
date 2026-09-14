import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import Cameras from "./pages/Cameras";
import Alerts from "./pages/Alerts";
import Vehicles from "./pages/Vehicles";
import Watchlist from "./pages/Watchlist";
import History from "./pages/History";
import Map from "./pages/Map";


function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#080b12] text-slate-100">
        
        <Sidebar />

        <div className="ml-64">
          <Header />

          <main className="p-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />

              <Route
                path="/cameras"
                element={<Cameras />} 
              />

              <Route path="/alerts" element={<Alerts />} />

              <Route path="/vehicles" element={<Vehicles />} />

              <Route path="/watchlist" element={<Watchlist />} />

              <Route path="/history" element={<History />} />

              <Route path="/map" element={<Map />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;