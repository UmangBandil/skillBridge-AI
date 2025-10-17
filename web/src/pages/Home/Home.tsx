export const Home = () => (
    <section className="bg-background min-h-[80vh] flex items-center justify-center text-center relative overflow-hidden">
      <div className="relative z-10">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
          SkillBridge AI
        </h1>
        <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto text-muted-foreground">
          AI-driven micro-internship marketplace
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <a href="/signup" className="glow-btn">Get Started</a>
        </div>
      </div>
      {/* floating orbs */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl animate-pulse" />
      <div className="absolute bottom-10 right-10 w-48 h-48 bg-secondary/10 rounded-full blur-2xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-pulse delay-500" />
    </section>
  );