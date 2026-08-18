"use client";

import React from "react";
import { motion } from "framer-motion";
import Reveal from "@/components/Reveal";
import { Stagger, StaggerItem } from "@/components/Stagger";
import TiltCard from "@/components/TiltCard";

interface TeamMember {
  name: string;
  title: string;
  /** Optional: drop a real photo path/URL here later (e.g. "/team/hasan.jpg") */
  image?: string;
}

const TEAM: TeamMember[] = [
  {
    name: "Hafeez Farooq",
    title: "CEO and Founder",
  },
  {
    name: "Hasan Shahir",
    title: "Lead Team Developer",
  },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function TeamSection() {
  return (
    <section id="team" className="py-20 border-t-2 border-border relative overflow-hidden">
      {/* Soft pink/blue glows behind the grid */}
      <div aria-hidden className="absolute top-1/3 -left-32 w-96 h-96 rounded-full bg-accent-pink/10 dark:bg-accent-pink/5 blur-3xl -z-10 pointer-events-none" />
      <div aria-hidden className="absolute -bottom-24 -right-32 w-96 h-96 rounded-full bg-accent-blue/10 dark:bg-accent-blue/5 blur-3xl -z-10 pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="eyebrow">The Crew</span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-text">
              Meet the Team <span className="font-normal text-text-muted">Behind the Punch</span>
            </h2>
            <p className="text-text-muted mt-3">
              The leadership behind HKH — a small, senior crew that ships directly. No account-manager layers, no hand-offs.
            </p>
          </div>
        </Reveal>

        <Stagger className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {TEAM.map((member) => (
            <StaggerItem key={member.name}>
              <TiltCard maxTilt={10} className="h-full">
                <div className="glass-card p-8 flex flex-col items-center text-center h-full group">
                  {/* Avatar — photo when provided, branded initials otherwise */}
                  <div className="relative mb-6">
                    <motion.div
                      whileHover={{ rotate: 4, scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 260, damping: 16 }}
                      className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-border shadow-brutal bg-flow-gradient flex items-center justify-center"
                    >
                      {member.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="font-display font-extrabold text-3xl text-white select-none">
                          {initials(member.name)}
                        </span>
                      )}
                    </motion.div>
                    <span className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-accent-blue border-2 border-border shadow-brutal-sm flex items-center justify-center">
                      <span className="w-2 h-2 rounded-full bg-white" />
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-xl text-text group-hover:text-accent-pink transition-colors">
                    {member.name}
                  </h3>
                  <p className="text-xs font-bold text-accent-blue uppercase tracking-widest mt-1.5">
                    {member.title}
                  </p>
                </div>
              </TiltCard>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
