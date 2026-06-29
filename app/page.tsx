import Link from "next/link";
import { ArrowRight, Zap, ShoppingBag, Wrench, Star } from "lucide-react";
import { VehicleSelector } from "@/components/marketplace/VehicleSelector";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center overflow-hidden px-4">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0a0a] z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-20%,rgba(59,130,246,0.12),transparent_70%)]" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative z-20 text-center max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs text-white/60 mb-8">
            <Zap size={12} className="text-blue-400" />
            Tesla Model 3 & Model Y — MVP Live
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6">
            <span className="text-white">Mod your Tesla.</span>
            <br />
            <span className="text-white/40">See it. Buy it.</span>
          </h1>

          <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
            The first visual marketplace for EV modifications. Configure your car in 3D with real aftermarket parts — then purchase directly.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="#vehicles"
              className="group flex items-center gap-2 px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-white/90 transition-all duration-200"
            >
              Start Configuring
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/marketplace"
              className="flex items-center gap-2 px-8 py-4 border border-white/20 text-white/80 font-medium rounded-full hover:border-white/40 hover:text-white transition-all duration-200"
            >
              Browse Mods
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30 z-20">
          <span className="text-xs tracking-widest uppercase">Select your vehicle</span>
          <div className="w-px h-12 bg-gradient-to-b from-white/30 to-transparent" />
        </div>
      </section>

      {/* Vehicle Selector */}
      <section id="vehicles" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Choose Your Vehicle</h2>
            <p className="text-white/40 text-lg">Select your Tesla to begin configuring</p>
          </div>
          <VehicleSelector />
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap size={24} />,
                title: "Live 3D Preview",
                description: "See every modification applied to your exact car in real-time 3D. Orbit, zoom, inspect.",
              },
              {
                icon: <ShoppingBag size={24} />,
                title: "Instant Purchase",
                description: "Every visual change links directly to the product. One click to buy from verified sellers.",
              },
              {
                icon: <Wrench size={24} />,
                title: "Install Booking",
                description: "Book professional installation through our partner network. Nationwide coverage.",
              },
            ].map((feature) => (
              <div key={feature.title} className="p-8 rounded-2xl border border-white/5 bg-white/2 hover:border-white/10 transition-colors">
                <div className="text-white/40 mb-4">{feature.icon}</div>
                <h3 className="text-white font-semibold text-xl mb-3">{feature.title}</h3>
                <p className="text-white/40 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-24 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <blockquote className="text-2xl md:text-3xl font-light text-white/70 max-w-3xl mx-auto italic">
            &ldquo;Finally, a platform that shows me exactly what my Tesla will look like before I spend thousands on mods.&rdquo;
          </blockquote>
          <p className="mt-6 text-white/30">Tesla Model 3 owner, London</p>
        </div>
      </section>
    </div>
  );
}
