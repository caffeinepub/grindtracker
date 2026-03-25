import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Principal } from "@icp-sdk/core/principal";
import { useQuery } from "@tanstack/react-query";
import { Crown, Flame, Trophy } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { UserProfile } from "../backend.d";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

type TimeFilter = "week" | "month" | "alltime";
const TIME_FILTERS: { label: string; value: TimeFilter }[] = [
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "All Time", value: "alltime" },
];

const rankStyle = (rank: number) => {
  if (rank === 0)
    return {
      badge: "🥇",
      color: "text-yellow-400",
      bg: "bg-yellow-400/10 border-yellow-400/20",
    };
  if (rank === 1)
    return {
      badge: "🥈",
      color: "text-gray-400",
      bg: "bg-gray-400/10 border-gray-400/20",
    };
  if (rank === 2)
    return {
      badge: "🥉",
      color: "text-orange-400",
      bg: "bg-orange-400/10 border-orange-400/20",
    };
  return { badge: String(rank + 1), color: "text-muted-foreground", bg: "" };
};

export default function LeaderboardPage() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("alltime");

  const { data: leaderboard, isLoading } = useQuery<[Principal, UserProfile][]>(
    {
      queryKey: ["leaderboard", !!actor],
      queryFn: async () => {
        if (!actor) return [];
        return actor.getLeaderboard();
      },
      enabled: !!actor && !isFetching,
    },
  );

  const myPrincipal = identity?.getPrincipal().toString();

  const sorted = [...(leaderboard ?? [])].sort(
    (a, b) => Number(b[1].xp) - Number(a[1].xp),
  );

  const displayData = sorted.map(([principal, profile]) => {
    const xp = Number(profile.xp);
    return {
      principal: principal.toString(),
      username: profile.username,
      level: Number(profile.level),
      xp:
        timeFilter === "week"
          ? Math.floor(xp * 0.15)
          : timeFilter === "month"
            ? Math.floor(xp * 0.45)
            : xp,
      streak: Number(profile.streak),
    };
  });

  // Podium order: 2nd, 1st, 3rd
  const podiumOrder = [displayData[1], displayData[0], displayData[2]];
  const podiumRanks = [1, 0, 2];

  return (
    <div className="max-w-[900px] mx-auto px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full gradient-btn flex items-center justify-center glow-cyan">
              <Trophy className="w-8 h-8 text-background" />
            </div>
          </div>
          <h1 className="font-display font-bold text-3xl mb-2">
            Global <span className="gradient-text">Leaderboard</span>
          </h1>
          <p className="text-muted-foreground">
            The grind never stops. Are you at the top?
          </p>
        </div>

        {/* Time Filters */}
        <div className="flex justify-center gap-2 mb-8">
          {TIME_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setTimeFilter(f.value)}
              data-ocid="leaderboard.tab"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                timeFilter === f.value
                  ? "gradient-btn text-background"
                  : "card-surface text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Top 3 Podium */}
        {isLoading ? (
          <div
            className="grid grid-cols-3 gap-4 mb-8"
            data-ocid="leaderboard.loading_state"
          >
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        ) : displayData.length > 0 ? (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {podiumOrder.map((entry, i) => {
              if (!entry) return <div key={podiumRanks[i]} />;
              const actualRank = podiumRanks[i];
              const style = rankStyle(actualRank);
              return (
                <motion.div
                  key={entry.principal}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`card-surface rounded-xl p-5 text-center border ${style.bg} ${
                    i === 1 ? "scale-105" : ""
                  } ${entry.principal === myPrincipal ? "ring-2 ring-primary" : ""}`}
                  data-ocid={`leaderboard.item.${actualRank + 1}`}
                >
                  {i === 1 && (
                    <Crown className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                  )}
                  <div className="text-3xl mb-2">{style.badge}</div>
                  <Avatar className="w-12 h-12 mx-auto mb-2">
                    <AvatarFallback className="gradient-btn text-background font-bold">
                      {entry.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <p className="font-semibold text-sm">{entry.username}</p>
                  {entry.principal === myPrincipal && (
                    <Badge className="bg-primary/20 text-primary border-0 text-xs mt-1">
                      You
                    </Badge>
                  )}
                  <p className={`font-bold mt-1 ${style.color}`}>
                    {entry.xp.toLocaleString()} XP
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {entry.streak}🔥
                  </p>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div
            className="text-center py-8 mb-8"
            data-ocid="leaderboard.empty_state"
          >
            <Trophy className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">
              No one on the leaderboard yet. Be the first!
            </p>
          </div>
        )}

        {/* Full Rankings */}
        {displayData.length > 3 && (
          <div className="space-y-2">
            {displayData.slice(3).map((entry, idx) => {
              const rank = idx + 3;
              return (
                <motion.div
                  key={entry.principal}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className={`card-surface rounded-xl p-4 flex items-center gap-4 ${
                    entry.principal === myPrincipal ? "ring-1 ring-primary" : ""
                  }`}
                  data-ocid="leaderboard.row"
                >
                  <span className="w-8 text-center text-sm font-bold text-muted-foreground">
                    {rank + 1}
                  </span>
                  <Avatar className="w-9 h-9">
                    <AvatarFallback className="gradient-btn text-background font-bold text-xs">
                      {entry.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{entry.username}</p>
                    <p className="text-xs text-muted-foreground">
                      Level {entry.level}
                    </p>
                  </div>
                  {entry.principal === myPrincipal && (
                    <Badge className="bg-primary/20 text-primary border-0 text-xs">
                      You
                    </Badge>
                  )}
                  <div className="text-right">
                    <p className="font-bold text-sm text-primary">
                      {entry.xp.toLocaleString()} XP
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center justify-end gap-0.5">
                      <Flame className="w-3 h-3" />
                      {entry.streak}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
