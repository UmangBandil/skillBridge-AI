import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout/Layout";
import { Home } from "./pages/Home/Home";
import { Tasks } from "./pages/Tasks/Tasks";
import { Portfolio } from "./pages/Portfolio/Portfolio";
import { Match } from "./pages/Match/Match";
import { SignIn } from "./pages/SignIn/SignIn";
import { SignUp } from "./pages/SignUp/SignUp";
import { Recruiter } from "./pages/Recruiter/Recruiter";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="match" element={<Match />} />
          <Route path="portfolio" element={<Portfolio />} />
          <Route path="recruiter" element={<Recruiter />} />
        </Route>
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;