import { NewTaskForm } from "./components/NewTaskForm";
import { TaskList } from "./pages/TaskList";

function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-sky-600 text-white p-4">
        <h1 className="text-2xl font-bold">SkillBridge AI</h1>
        <p className="text-sm">Micro-internship marketplace</p>
      </header>
      <main>
        <NewTaskForm />
        <TaskList />
      </main>
    </div>
  );
}
export default App;