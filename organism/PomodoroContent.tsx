// src/molecules/PomodoroSection.tsx
import PomodoroCard from "@/molecules/PomodoroCard";
import SectionHeader from "@/molecules/SectionContentIndex";
import React from "react";
import { View } from "react-native";

interface PomodoroSession {
  id: number;
  task: string;
  duration: string;
  completedAt: string;
}

interface PomodoroSectionProps {
  sessions: PomodoroSession[];
  onSeeMore?: () => void;
}

export default function PomodoroSection({
  sessions,
  onSeeMore,
}: PomodoroSectionProps) {
  return (
    <View>
      <SectionHeader title="Recent Sessions" onPress={onSeeMore} />
      {sessions.map((session) => (
        <PomodoroCard
          key={session.id}
          id={session.id}
          task={session.task}
          duration={session.duration}
          completedAt={session.completedAt}
        />
      ))}
    </View>
  );
}
