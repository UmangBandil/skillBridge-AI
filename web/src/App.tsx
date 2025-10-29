import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout/Layout";
import { Home } from "./pages/Home/Home";
import { TaskList } from "./pages/TaskList/TaskList";
import { Portfolio } from "./pages/Portfolio/Portfolio";
import { Match } from "./pages/Match/Match";
import { SignIn } from "./pages/SignIn/SignIn";
import { SignUp } from "./pages/SignUp/SignUp";
import { Recruiter } from "./pages/Recruiter/Recruiter";
import { ProtectedRoute } from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route
          path="tasks"
          element={
            <ProtectedRoute>
              <TaskList />
            </ProtectedRoute>
          }
        />
        <Route
          path="match"
          element={
            <ProtectedRoute>
              <Match />
            </ProtectedRoute>
          }
        />
        <Route
          path="portfolio"
          element={
            <ProtectedRoute>
              <Portfolio />
            </ProtectedRoute>
          }
        />
        <Route
          path="recruiter"
          element={
            <ProtectedRoute>
              <Recruiter />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
    </Routes>
  );
}
export default App;