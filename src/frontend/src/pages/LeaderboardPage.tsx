import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Principal } from "@icp-sdk/core/principal";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  Crown,
  Flame,
  Loader2,
  Trophy,
  UserMinus,
  UserPlus,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
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

interface LeaderboardEntry {
  principal: string;
  username: string;
  level: number;
  xp: number;
  streak: number;
}

function buildEntries(
  data: [Principal, UserProfile][],
  timeFilter: TimeFilter,
): LeaderboardEntry[] {
  return [...data]
    .sort((a, b) => Number(b[1].xp) - Number(a[1].xp))
    .map(([principal, profile]) => {
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
}

function PodiumAndList({
  entries,
  myPrincipal,
}: {
  entries: LeaderboardEntry[];
  myPrincipal: string | undefined;
}) {
  const podiumOrder = [entries[1], entries[0], entries[2]];
  const podiumRanks = [1, 0, 2];
  return (
    <>
      {entries.length === 0 ? (
        <div
          className="text-center py-8 mb-8"
          data-ocid="leaderboard.empty_state"
        >
          <Trophy className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">
            No one on the leaderboard yet.
          </p>
        </div>
      ) : (
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
      )}
      {entries.length > 3 && (
        <div className="space-y-2">
          {entries.slice(3).map((entry, idx) => {
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
    </>
  );
}

function FriendsTab({ myPrincipal }: { myPrincipal: string | undefined }) {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();
  const [addInput, setAddInput] = useState("");
  const [sending, setSending] = useState(false);
  const [acceptingPrincipal, setAcceptingPrincipal] = useState<string | null>(
    null,
  );
  const [removingPrincipal, setRemovingPrincipal] = useState<string | null>(
    null,
  );

  const { data: friendsLeaderboard, isLoading: loadingLeaderboard } = useQuery<
    [Principal, UserProfile][]
  >({
    queryKey: ["friendsLeaderboard", !!actor],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFriendsLeaderboard();
    },
    enabled: !!actor && !isFetching,
  });

  const { data: friendRequests, isLoading: loadingRequests } = useQuery<
    Principal[]
  >({
    queryKey: ["friendRequests", !!actor],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFriendRequests();
    },
    enabled: !!actor && !isFetching,
  });

  const { data: friends, isLoading: loadingFriends } = useQuery<Principal[]>({
    queryKey: ["friends", !!actor],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFriends();
    },
    enabled: !!actor && !isFetching,
  });

  // Fetch profiles for friend requests
  const { data: requestProfiles } = useQuery<
    { principal: string; profile: UserProfile | null }[]
  >({
    queryKey: [
      "friendRequestProfiles",
      friendRequests?.map((p) => p.toString()),
    ],
    queryFn: async () => {
      if (!actor || !friendRequests || friendRequests.length === 0) return [];
      const results = await Promise.all(
        friendRequests.map(async (p) => ({
          principal: p.toString(),
          profile: await actor.getUserProfile(p),
        })),
      );
      return results;
    },
    enabled: !!actor && !!friendRequests && friendRequests.length > 0,
  });

  // Fetch profiles for friends
  const { data: friendProfiles } = useQuery<
    { principal: string; profile: UserProfile | null }[]
  >({
    queryKey: ["friendProfiles", friends?.map((p) => p.toString())],
    queryFn: async () => {
      if (!actor || !friends || friends.length === 0) return [];
      const results = await Promise.all(
        friends.map(async (p) => ({
          principal: p.toString(),
          profile: await actor.getUserProfile(p),
        })),
      );
      return results;
    },
    enabled: !!actor && !!friends && friends.length > 0,
  });

  const sendRequest = async () => {
    if (!actor || !addInput.trim()) return;
    setSending(true);
    try {
      const principal = Principal.fromText(addInput.trim());
      const result = await actor.sendFriendRequest(principal);
      toast.success(result || "Friend request sent!");
      setAddInput("");
    } catch (e) {
      toast.error(
        e instanceof Error && e.message.includes("decode")
          ? "Invalid Principal ID"
          : "Failed to send friend request",
      );
    } finally {
      setSending(false);
    }
  };

  const acceptRequest = async (principalStr: string) => {
    if (!actor) return;
    setAcceptingPrincipal(principalStr);
    try {
      const p = Principal.fromText(principalStr);
      await actor.acceptFriendRequest(p);
      toast.success("Friend request accepted!");
      await queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      await queryClient.invalidateQueries({ queryKey: ["friends"] });
      await queryClient.invalidateQueries({ queryKey: ["friendsLeaderboard"] });
    } catch {
      toast.error("Failed to accept request");
    } finally {
      setAcceptingPrincipal(null);
    }
  };

  const rejectRequest = async (principalStr: string) => {
    if (!actor) return;
    try {
      const p = Principal.fromText(principalStr);
      await actor.rejectFriendRequest(p);
      toast.success("Request rejected");
      await queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
    } catch {
      toast.error("Failed to reject request");
    }
  };

  const removeFriend = async (principalStr: string) => {
    if (!actor) return;
    setRemovingPrincipal(principalStr);
    try {
      const p = Principal.fromText(principalStr);
      await actor.removeFriend(p);
      toast.success("Friend removed");
      await queryClient.invalidateQueries({ queryKey: ["friends"] });
      await queryClient.invalidateQueries({ queryKey: ["friendsLeaderboard"] });
    } catch {
      toast.error("Failed to remove friend");
    } finally {
      setRemovingPrincipal(null);
    }
  };

  const leaderboardEntries = buildEntries(friendsLeaderboard ?? [], "alltime");

  return (
    <div className="space-y-8">
      {/* Friends Leaderboard */}
      <section>
        <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          Friends Leaderboard
        </h2>
        {loadingLeaderboard ? (
          <div
            className="grid grid-cols-3 gap-4 mb-8"
            data-ocid="leaderboard.loading_state"
          >
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        ) : (
          <PodiumAndList
            entries={leaderboardEntries}
            myPrincipal={myPrincipal}
          />
        )}
      </section>

      {/* Add Friend */}
      <section className="card-surface rounded-xl p-6">
        <h2 className="font-semibold mb-3 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-primary" />
          Add Friend
        </h2>
        <p className="text-xs text-muted-foreground mb-3">
          Enter your friend's Principal ID to send them a friend request.
        </p>
        <div className="flex gap-2">
          <Input
            value={addInput}
            onChange={(e) => setAddInput(e.target.value)}
            placeholder="Principal ID (e.g. aaaaa-aa)"
            data-ocid="leaderboard.input"
            className="text-sm font-mono"
            onKeyDown={(e) => e.key === "Enter" && sendRequest()}
          />
          <Button
            onClick={sendRequest}
            disabled={sending || !addInput.trim()}
            className="gradient-btn text-background font-semibold shrink-0"
            data-ocid="leaderboard.primary_button"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
            <span className="ml-2 hidden sm:inline">Send Request</span>
          </Button>
        </div>
        {myPrincipal && (
          <p className="text-xs text-muted-foreground mt-3">
            Your ID:{" "}
            <span className="font-mono text-primary">{myPrincipal}</span>
          </p>
        )}
      </section>

      {/* Pending Requests */}
      <section>
        <h2 className="font-semibold mb-3 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-accent" />
          Pending Requests
          {friendRequests && friendRequests.length > 0 && (
            <Badge className="bg-accent/20 text-accent border-0 text-xs">
              {friendRequests.length}
            </Badge>
          )}
        </h2>
        {loadingRequests ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-14 rounded-xl" />
            ))}
          </div>
        ) : !friendRequests || friendRequests.length === 0 ? (
          <div
            className="card-surface rounded-xl p-4 text-center"
            data-ocid="leaderboard.empty_state"
          >
            <p className="text-sm text-muted-foreground">No pending requests</p>
          </div>
        ) : (
          <div className="space-y-2">
            {(
              requestProfiles ??
              friendRequests.map((p) => ({
                principal: p.toString(),
                profile: null,
              }))
            ).map(({ principal: pStr, profile }, idx) => (
              <motion.div
                key={pStr}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="card-surface rounded-xl p-4 flex items-center gap-3"
                data-ocid={`leaderboard.item.${idx + 1}`}
              >
                <Avatar className="w-9 h-9">
                  <AvatarFallback className="gradient-btn text-background font-bold text-xs">
                    {(profile?.username ?? pStr).slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">
                    {profile?.username ?? "Unknown Grinder"}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono truncate">
                    {pStr}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => acceptRequest(pStr)}
                  disabled={acceptingPrincipal === pStr}
                  className="gradient-btn text-background font-semibold"
                  data-ocid="leaderboard.confirm_button"
                >
                  {acceptingPrincipal === pStr ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Check className="w-3 h-3" />
                  )}
                  <span className="ml-1">Accept</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => rejectRequest(pStr)}
                  className="border-destructive/40 text-destructive hover:bg-destructive/10"
                  data-ocid="leaderboard.cancel_button"
                >
                  <X className="w-3 h-3" />
                  <span className="ml-1">Reject</span>
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* My Friends */}
      <section>
        <h2 className="font-semibold mb-3 flex items-center gap-2">
          <Crown className="w-5 h-5 text-yellow-400" />
          My Friends
          {friends && friends.length > 0 && (
            <Badge className="bg-muted text-muted-foreground border-0 text-xs">
              {friends.length}
            </Badge>
          )}
        </h2>
        {loadingFriends ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-14 rounded-xl" />
            ))}
          </div>
        ) : !friends || friends.length === 0 ? (
          <div
            className="card-surface rounded-xl p-4 text-center"
            data-ocid="leaderboard.empty_state"
          >
            <p className="text-sm text-muted-foreground">
              No friends yet. Add some to start competing!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {(
              friendProfiles ??
              friends.map((p) => ({ principal: p.toString(), profile: null }))
            ).map(({ principal: pStr, profile }, idx) => (
              <motion.div
                key={pStr}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="card-surface rounded-xl p-4 flex items-center gap-3"
                data-ocid={`leaderboard.item.${idx + 1}`}
              >
                <Avatar className="w-9 h-9">
                  <AvatarFallback className="gradient-btn text-background font-bold text-xs">
                    {(profile?.username ?? pStr).slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">
                    {profile?.username ?? "Unknown Grinder"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Level {profile ? Number(profile.level) : "?"} ·{" "}
                    {profile ? Number(profile.xp).toLocaleString() : "?"} XP
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => removeFriend(pStr)}
                  disabled={removingPrincipal === pStr}
                  className="border-destructive/40 text-destructive hover:bg-destructive/10"
                  data-ocid={`leaderboard.delete_button.${idx + 1}`}
                >
                  {removingPrincipal === pStr ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <UserMinus className="w-3 h-3" />
                  )}
                  <span className="ml-1">Remove</span>
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

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
  const displayData = buildEntries(leaderboard ?? [], timeFilter);

  return (
    <div className="max-w-[900px] mx-auto px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full gradient-btn flex items-center justify-center glow-cyan">
              <Trophy className="w-8 h-8 text-background" />
            </div>
          </div>
          <h1 className="font-display font-bold text-3xl mb-2">
            <span className="gradient-text">Leaderboard</span>
          </h1>
          <p className="text-muted-foreground">
            The grind never stops. Are you at the top?
          </p>
        </div>

        <Tabs defaultValue="global">
          <TabsList className="w-full mb-8 bg-card border border-border">
            <TabsTrigger
              value="global"
              className="flex-1"
              data-ocid="leaderboard.tab"
            >
              🌐 Global
            </TabsTrigger>
            <TabsTrigger
              value="friends"
              className="flex-1"
              data-ocid="leaderboard.tab"
            >
              👥 Friends
            </TabsTrigger>
          </TabsList>

          <TabsContent value="global">
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

            {isLoading ? (
              <div
                className="grid grid-cols-3 gap-4 mb-8"
                data-ocid="leaderboard.loading_state"
              >
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-40 rounded-xl" />
                ))}
              </div>
            ) : (
              <PodiumAndList entries={displayData} myPrincipal={myPrincipal} />
            )}
          </TabsContent>

          <TabsContent value="friends">
            <FriendsTab myPrincipal={myPrincipal} />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
