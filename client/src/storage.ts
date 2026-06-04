import { OngoingGame } from "./api";

const KEY = "tic-tac-grow:ongoing";

export const loadOngoing = (): OngoingGame[] => {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(parsed) ? (parsed as OngoingGame[]) : [];
  } catch {
    return [];
  }
};

const writeAll = (games: OngoingGame[]) =>
  localStorage.setItem(KEY, JSON.stringify(games));

export const saveOngoing = (game: OngoingGame): void =>
  writeAll([game, ...loadOngoing().filter((g) => g.id !== game.id)]);

export const removeOngoing = (id: string): void =>
  writeAll(loadOngoing().filter((g) => g.id !== id));
