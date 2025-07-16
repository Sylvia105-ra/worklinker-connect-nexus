const StatsSection = () => {
  const stats = [
    {
      number: "10K+",
      label: "Active Jobs",
      description: "Opportunities across all industries"
    },
    {
      number: "5K+",
      label: "Companies",
      description: "From startups to Fortune 500"
    },
    {
      number: "50K+",
      label: "Job Seekers",
      description: "Talented professionals worldwide"
    },
    {
      number: "95%",
      label: "Success Rate",
      description: "Successful placements and hires"
    }
  ];

  return (
    <section className="py-20 bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Trusted by Thousands
          </h2>
          <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
            Join the growing community of successful professionals and innovative companies
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-4xl md:text-5xl font-bold mb-2 text-accent-light">
                {stat.number}
              </div>
              <div className="text-xl font-semibold mb-2">
                {stat.label}
              </div>
              <div className="text-primary-foreground/70">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;