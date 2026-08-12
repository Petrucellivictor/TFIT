import type { NewAchievement } from "../schema/achievements";

type SeedAchievement = Omit<NewAchievement, "id" | "createdAt">;

/** Matches the criteria types packages/gamification/src/achievements.ts understands. */
export const ACHIEVEMENT_SEED: SeedAchievement[] = [
  {
    slug: "primeiro-treino",
    name: "Primeiro treino",
    description: "Complete seu primeiro treino.",
    icon: "barbell",
    criteriaType: "workouts_completed",
    criteriaValue: 1,
  },
  {
    slug: "dez-treinos",
    name: "10 treinos",
    description: "Complete 10 treinos.",
    icon: "trophy",
    criteriaType: "workouts_completed",
    criteriaValue: 10,
  },
  {
    slug: "trinta-treinos",
    name: "30 treinos",
    description: "Complete 30 treinos.",
    icon: "trophy",
    criteriaType: "workouts_completed",
    criteriaValue: 30,
  },
  {
    slug: "primeiro-recorde",
    name: "Primeiro recorde",
    description: "Bata seu primeiro recorde pessoal.",
    icon: "medal",
    criteriaType: "personal_records",
    criteriaValue: 1,
  },
  {
    slug: "sete-dias",
    name: "7 dias",
    description: "Mantenha uma sequência de check-ins por 7 dias.",
    icon: "flame",
    criteriaType: "streak_days",
    criteriaValue: 7,
  },
  {
    slug: "trinta-dias",
    name: "30 dias",
    description: "Mantenha uma sequência de check-ins por 30 dias.",
    icon: "flame",
    criteriaType: "streak_days",
    criteriaValue: 30,
  },
  {
    slug: "desafio-concluido",
    name: "Desafio concluído",
    description: "Complete seu primeiro desafio.",
    icon: "ribbon",
    criteriaType: "challenges_completed",
    criteriaValue: 1,
  },
];
