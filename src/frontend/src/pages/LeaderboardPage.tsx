import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Crown, Flame, Trophy } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { leaderboardData } from "../data/mockData";

type TimeFilter = "week" | "month" | "alltime";

const TIME_FILTERS: { label: string; value: TimeFilter }[] = [
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "All Time", value: "alltime" },
];

export default function LeaderboardPage() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("alltime");

  const displayData = leaderboardData.map((u) => ({
    ...u,
    xp:
      timeFilter === "week"
        ? Math.floor(u.xp * 0.15)
        : timeFilter === "month"
          ? Math.floor(u.xp * 0.45)
          : u.xp,
    streak: timeFilter === "week" ? Math.min(u.streak, 7) : u.streak,
  }));

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
          <h1 className="font-display font-bold text-4xl uppercase tracking-wider">
            THE <span className="gradient-text">LEADERBOARD</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            Compete, grind, and rise to the top.
          </p>
        </div>

        {/* Time filter */}
        <div className="flex justify-center gap-2 mb-8">
          {TIME_FILTERS.map((f) => (
            <button
              type="button"
              key={f.value}
              onClick={() => setTimeFilter(f.value)}
              data-ocid="leaderboard.tab"
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                timeFilter === f.value
                  ? "gradient-btn text-background"
                  : "card-surface text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Top 3 podium */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {displayData.slice(0, 3).map((user, i) => {
            const style = rankStyle(i);
            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: i === 0 ? -16 : 0 }}
                transition={{ delay: i * 0.1 }}
                className={`card-surface rounded-2xl p-6 text-center border ${
                  user.isCurrentUser ? "border-primary/40" : style.bg
                } ${i === 0 ? "border border-yellow-400/30" : ""}`}
              >
                <div className="text-3xl mb-3">{style.badge}</div>
                <Avatar className="w-14 h-14 mx-auto mb-3">
                  <AvatarFallback className="text-lg gradient-btn text-background font-bold">
                    {user.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="font-semibold">{user.name}</div>
                {user.isCurrentUser && (
                  <Badge className="bg-primary/20 text-primary border-0 text-xs mt-1">
                    You
                  </Badge>
                )}
                <div
                  className={`font-display font-bold text-2xl mt-2 ${style.color}`}
                >
                  {user.xp.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">XP</div>
                <div className="flex items-center justify-center gap-1 mt-2 text-orange-400 text-sm">
                  <Flame className="w-3.5 h-3.5" />
                  <span>{user.streak}d</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Full table */}
        <div
          className="card-surface rounded-2xl overflow-hidden"
          data-ocid="leaderboard.table"
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Rank
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  User
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden sm:table-cell">
                  Level
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  XP
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">
                  Streak
                </th>
                <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden lg:table-cell">
                  Badges
                </th>
              </tr>
            </thead>
            <tbody>
              {displayData.map((user, i) => {
                const style = rankStyle(i);
                return (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    data-ocid={`leaderboard.row.${i + 1}`}
                    className={`border-b border-border/50 transition-all ${
                      user.isCurrentUser ? "bg-primary/5" : "hover:bg-muted/20"
                    }`}
                  >
                    <td className="px-6 py-4">
                      <span className={`font-bold text-lg ${style.color}`}>
                        {i < 3 ? style.badge : i + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-9 h-9">
                          <AvatarFallback className="text-sm gradient-btn text-background font-bold">
                            {user.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{user.name}</span>
                            {user.isCurrentUser && (
                              <Badge className="bg-primary/20 text-primary border-0 text-xs px-1">
                                You
                              </Badge>
                            )}
                            {i === 0 && (
                              <Crown className="w-3.5 h-3.5 text-yellow-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell">
                      <Badge className="bg-accent/20 text-accent border-0">
                        Lv.{user.level}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-primary">
                        {user.xp.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="text-orange-400 flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5" />
                        {user.streak}d
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <div className="flex gap-1">
                        {user.badges.map((b, bi) => (
                          <span
                            key={`${user.id}-badge-${bi}`}
                            className="text-base"
                          >
                            {b}
                          </span>
                        ))}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
