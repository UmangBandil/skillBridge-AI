export const Home = () => (
    <section className="text-center py-20">
      <h2 className="text-4xl font-extrabold text-sky-600">Micro-Internships Meet AI</h2>
      <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
        Get matched to 10-40 h paid tasks at NGOs & start-ups. AI ranks your résumé and auto-generates mentor feedback.
      </p>
      <div className="mt-8 flex gap-4 justify-center">
        <a href="/tasks" className="btn">Browse Tasks</a>
        <a href="/match" className="btn">Upload Résumé</a>
      </div>
    </section>
  );