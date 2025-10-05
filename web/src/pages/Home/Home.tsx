export const Home = () => (
  <section className="hero-gradient text-white min-h-[60vh] flex items-center justify-center text-center relative overflow-hidden">
    <div className="relative z-10">
      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight drop-shadow-lg">
        SkillBridge <span className="gradient-text">AI</span>
      </h1>
      <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto drop-shadow-md">
        Micro-internships meet AI. Get matched to 10-40 h paid tasks at NGOs & start-ups.
      </p>
      <div className="mt-8 flex gap-4 justify-center">
        <a href="/tasks" className="glow-btn">Browse Tasks</a>
        <a href="/match" className="glow-btn">Upload Résumé</a>
      </div>
    </div>
    {/* floating orbs */}
    <div className="absolute top-10 left-10 w-24 h-24 bg-white/10 rounded-full blur-xl animate-pulse" />
    <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse delay-1000" />
  </section>
);