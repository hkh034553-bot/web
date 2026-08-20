"use client";

import React from "react";
import Reveal from "@/components/Reveal";
import { Stagger, StaggerItem } from "@/components/Stagger";

interface TeamMember {
  name: string;
  title: string;
}

const TEAM: TeamMember[] = [
  { name: "Hafeez Farooq", title: "CEO and Founder" },
  { name: "Hasan Shahir", title: "Lead Team Developer" },
  { name: "Bilal Sajjad Khan", title: "Assistant Team Developer" },
  { name: "Karam Hameed", title: "Graphic Designer & Video Editor" },
  { name: "Ali Hasan", title: "AI Professional" },
];

export default function TeamSection() {
  return (
    <section id="team" className="py-20 border-t border-border">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="text-center mb-12">
            <span className="eyebrow">The Crew</span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-text">
              Meet the Team <span className="font-normal text-text-muted">Behind HKH</span>
            </h2>
          </div>
        </Reveal>

        <Stagger className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TEAM.map((member) => (
            <StaggerItem key={member.name}>
              <div className="text-center py-6 px-4 rounded-xl border border-border/50 bg-surface/50">
                <h3 className="font-display font-bold text-lg text-text">
                  {member.name}
                </h3>
                <p className="text-sm text-text-muted mt-1">
                  {member.title}
                </p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
