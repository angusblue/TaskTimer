"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const vehicles = [
  {
    slug: "tesla-model-3-highland",
    name: "Model 3 Highland",
    year: "2024",
    trim: "Refresh",
    description: "The redesigned Model 3. Sleeker, faster, further.",
    badge: "NEW",
    specs: ["0–60 in 3.1s", "358mi range", "All-Wheel Drive"],
    gradient: "from-blue-900/30 to-transparent",
  },
  {
    slug: "tesla-model-3-legacy",
    name: "Model 3 Legacy",
    year: "2017–2023",
    trim: "Long Range AWD",
    description: "The car that changed EVs forever. Classic design.",
    badge: "POPULAR",
    specs: ["0–60 in 3.5s", "358mi range", "All-Wheel Drive"],
    gradient: "from-zinc-800/40 to-transparent",
  },
  {
    slug: "tesla-model-y",
    name: "Model Y",
    year: "2020–2024",
    trim: "Performance",
    description: "World's best-selling car. Versatile and powerful.",
    badge: "BEST SELLER",
    specs: ["0–60 in 3.5s", "330mi range", "7-seat option"],
    gradient: "from-emerald-900/30 to-transparent",
  },
];

export function VehicleSelector() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {vehicles.map((vehicle, i) => (
        <motion.div
          key={vehicle.slug}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
        >
          <Link href={`/configurator/${vehicle.slug}`} className="group block">
            <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-[#111] hover:border-white/20 transition-all duration-300 hover:-translate-y-1">
              {/* Badge */}
              <div className="absolute top-4 left-4 z-10">
                <span className="px-2 py-1 text-xs font-semibold tracking-wider text-white/70 bg-white/10 rounded-full border border-white/10">
                  {vehicle.badge}
                </span>
              </div>

              {/* Car visual area */}
              <div className={`relative h-48 bg-gradient-to-br ${vehicle.gradient} flex items-center justify-center overflow-hidden`}>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_80%,rgba(255,255,255,0.04),transparent)]" />
                {/* Placeholder car silhouette — Model 3 SVG */}
                <CarSilhouette model={vehicle.slug} />
              </div>

              {/* Info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-white/40 text-xs font-medium tracking-wider uppercase mb-1">
                      Tesla · {vehicle.year}
                    </p>
                    <h3 className="text-white font-bold text-xl">{vehicle.name}</h3>
                    <p className="text-white/40 text-sm">{vehicle.trim}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-white/40 group-hover:bg-white/5 transition-all">
                    <ArrowRight size={14} className="text-white/40 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>

                <p className="text-white/40 text-sm mb-4 leading-relaxed">{vehicle.description}</p>

                <div className="flex flex-wrap gap-2">
                  {vehicle.specs.map((spec) => (
                    <span key={spec} className="px-2.5 py-1 text-xs text-white/50 bg-white/5 rounded-full">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="px-6 pb-6">
                <div className="w-full py-2.5 text-center text-sm font-medium text-white/60 border border-white/10 rounded-xl group-hover:text-white group-hover:border-white/30 group-hover:bg-white/5 transition-all">
                  Configure →
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}

function CarSilhouette({ model }: { model: string }) {
  const isModelY = model === "tesla-model-y";

  return (
    <svg
      viewBox="0 0 300 140"
      className="w-full h-full px-8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Shadow */}
      <ellipse cx="150" cy="125" rx="100" ry="8" fill="rgba(0,0,0,0.4)" />

      {/* Main body */}
      <path
        d={isModelY
          ? "M30 90 L30 75 Q32 65 45 62 L75 55 Q95 40 115 38 L185 38 Q210 38 225 48 L255 60 Q268 64 270 75 L270 90 Q268 95 255 96 L45 96 Q32 96 30 90Z"
          : "M35 90 L35 78 Q37 68 48 65 L78 56 Q96 42 115 40 L185 40 Q208 40 222 50 L252 62 Q264 66 265 78 L265 90 Q263 95 250 96 L50 96 Q37 96 35 90Z"
        }
        fill="rgba(255,255,255,0.08)"
        stroke="rgba(255,255,255,0.15)"
        strokeWidth="1"
      />

      {/* Roof/cabin */}
      <path
        d={isModelY
          ? "M85 62 Q88 48 100 42 L200 42 Q218 44 225 54 L240 62Z"
          : "M88 58 Q92 44 105 38 L195 38 Q212 40 220 52 L235 58Z"
        }
        fill="rgba(255,255,255,0.06)"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="1"
      />

      {/* Windshield */}
      <path
        d={isModelY
          ? "M120 62 Q115 48 130 40 L175 40 Q195 42 200 58 L200 62Z"
          : "M120 58 Q116 44 128 40 L178 40 Q192 42 198 56 L198 58Z"
        }
        fill="rgba(120,160,255,0.12)"
        stroke="rgba(120,160,255,0.2)"
        strokeWidth="1"
      />

      {/* Rear window */}
      <path
        d={isModelY
          ? "M200 62 L228 58 Q234 52 232 44 L220 42 Q205 42 200 50Z"
          : "M198 58 L226 56 Q232 50 228 44 L218 42 Q203 42 198 50Z"
        }
        fill="rgba(120,160,255,0.10)"
        stroke="rgba(120,160,255,0.15)"
        strokeWidth="1"
      />

      {/* Door line */}
      <line x1="155" y1="64" x2="155" y2="95" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

      {/* Wheels */}
      <circle cx="80" cy="98" r="16" fill="rgba(30,30,30,0.9)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
      <circle cx="80" cy="98" r="10" fill="rgba(50,50,50,0.9)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      <circle cx="80" cy="98" r="3" fill="rgba(255,255,255,0.3)" />

      <circle cx={isModelY ? "218" : "215"} cy="98" r="16" fill="rgba(30,30,30,0.9)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
      <circle cx={isModelY ? "218" : "215"} cy="98" r="10" fill="rgba(50,50,50,0.9)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      <circle cx={isModelY ? "218" : "215"} cy="98" r="3" fill="rgba(255,255,255,0.3)" />

      {/* Headlight */}
      <path d="M36 75 Q38 70 44 70 L60 72 Q63 75 60 78 L44 78 Q38 78 36 75Z" fill="rgba(200,220,255,0.3)" />

      {/* Taillight */}
      <path d={isModelY ? "M260 72 L268 74 L268 80 L260 82 Q257 78 260 72Z" : "M257 72 L263 74 L263 80 L257 82 Q254 78 257 72Z"} fill="rgba(255,80,80,0.4)" />
    </svg>
  );
}
