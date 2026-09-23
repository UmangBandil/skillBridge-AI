import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout/Layout";
// Replace eager imports with lazy-loaded ones and add Suspense
import { Suspense, lazy } from "react";

// Lazy-load named exports by mapping to default
const Home = lazy(() =>
  import("./pages/Home/Home").then((m) => ({ default: m.Home }))
);
const TaskList = lazy(() =>
  import("./pages/TaskList/TaskList").then((m) => ({ default: m.TaskList }))
);
const Portfolio = lazy(() =>
  import("./pages/Portfolio/Portfolio").then((m) => ({ default: m.Portfolio }))
);
const Match = lazy(() =>
  import("./pages/Match/Match").then((m) => ({ default: m.Match }))
);
const SignIn = lazy(() =>
  import("./pages/SignIn/SignIn").then((m) => ({ default: m.SignIn }))
);
const SignUp = lazy(() =>
  import("./pages/SignUp/SignUp").then((m) => ({ default: m.SignUp }))
);
const Recruiter = lazy(() =>
  import("./pages/Recruiter/Recruiter").then((m) => ({ default: m.Recruiter }))
);
const ApplicationTracker = lazy(() =>
  import("./pages/Applications/ApplicationTracker").then((m) => ({ default: m.ApplicationTracker }))
);
import { ProtectedRoute } from "./components/ProtectedRoute";
import { NotFound } from "./pages/NotFound/NotFound";

function App() {
  return (
    // Wrap routes with Suspense to show a fallback during lazy loads
    <Suspense fallback={<div>Loading...</div>}>
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
            path="applications"
            element={
              <ProtectedRoute>
                <ApplicationTracker />
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
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
export default App;
