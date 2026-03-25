import Map "mo:core/Map";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Auth "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

import Float "mo:core/Float";

actor {
  func containsPrincipal(list : [Principal], value : Principal) : Bool {
    for (item in list.values()) {
      if (item == value) {
        return true;
      };
    };
    false;
  };

  module Profile {
    public type RadarScores = {
      work : Float;
      health : Float;
      learning : Float;
      social : Float;
      personal : Float;
      focus : Float;
    };

    public type Profile = {
      username : Text;
      level : Nat;
      xp : Nat;
      streak : Nat;
      lastActive : Int;
      radarScores : RadarScores;
    };

    public func compare(a : Profile, b : Profile) : Order.Order {
      Nat.compare(b.xp, a.xp);
    };
  };

  public type UserProfile = Profile.Profile;
  public type UserRadarScores = Profile.RadarScores;

  type Category = { #work; #health; #learning; #social; #personal };
  type Priority = { #high; #medium; #low };

  type Task = {
    title : Text;
    category : Category;
    priority : Priority;
    dueDate : Int;
    completed : Bool;
    xpReward : Nat;
  };

  type FocusSession = {
    durationMinutes : Nat;
    completedAt : Int;
    xpEarned : Nat;
  };

  var nextTaskId = 1 : Nat;
  let userProfiles = Map.empty<Principal, UserProfile>();
  let userTasks = Map.empty<Principal, Map.Map<Nat, Task>>();
  let focusSessions = Map.empty<Principal, [FocusSession]>();

  let friendships = Map.empty<Principal, [Principal]>();
  let friendRequestsSent = Map.empty<Principal, [Principal]>();
  let friendRequestsReceived = Map.empty<Principal, [Principal]>();

  // Initialize the user system state
  let accessControlState = Auth.initState();
  // Apply authentication mixin to automatically provide authentication and role-based access to all public functions
  include MixinAuthorization(accessControlState);

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  // Now public, not admin-only so everyone can fetch profiles by principal
  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getTasks() : async [(Nat, Task)] {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access tasks");
    };
    let tasks = userTasks.get(caller);
    switch (tasks) {
      case (null) { [] };
      case (?tasksMap) {
        tasksMap.toArray();
      };
    };
  };

  public shared ({ caller }) func addTask(title : Text, category : Category, priority : Priority, dueDate : Int, xpReward : Nat) : async Task {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add tasks");
    };
    let id = nextTaskId;
    nextTaskId += 1;

    let newTask : Task = {
      title;
      category;
      priority;
      dueDate;
      completed = false;
      xpReward;
    };

    let existingTasks = switch (userTasks.get(caller)) {
      case (?tasks) { tasks };
      case (null) { Map.empty<Nat, Task>() };
    };
    existingTasks.add(id, newTask);
    userTasks.add(caller, existingTasks);

    newTask;
  };

  public shared ({ caller }) func updateTask(id : Nat, completed : Bool) : async Task {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update tasks");
    };
    switch (userTasks.get(caller)) {
      case (null) {
        Runtime.trap("No tasks found for this user");
      };
      case (?tasksMap) {
        switch (tasksMap.get(id)) {
          case (null) {
            Runtime.trap("Task not found");
          };
          case (?task) {
            let updatedTask = { task with completed };
            tasksMap.add(id, updatedTask);
            updatedTask;
          };
        };
      };
    };
  };

  public shared ({ caller }) func deleteTask(id : Nat) : async () {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete tasks");
    };
    switch (userTasks.get(caller)) {
      case (null) {
        Runtime.trap("No tasks found for this user");
      };
      case (?tasksMap) {
        tasksMap.remove(id);
      };
    };
  };

  public query ({ caller }) func getFocusSessions() : async [FocusSession] {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access focus sessions");
    };
    switch (focusSessions.get(caller)) {
      case (null) { [] };
      case (?sessions) { sessions };
    };
  };

  public shared ({ caller }) func addFocusSession(durationMinutes : Nat, xpEarned : Nat) : async FocusSession {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add focus sessions");
    };
    if (durationMinutes > 120) {
      Runtime.trap("Focus session cannot exceed 2 hours");
    };
    if (xpEarned > 1000) {
      Runtime.trap("XP earned cannot exceed 1000");
    };

    let session : FocusSession = {
      durationMinutes;
      completedAt = Time.now();
      xpEarned;
    };

    let existingSessions = switch (focusSessions.get(caller)) {
      case (null) { [] };
      case (?sessions) { sessions };
    };
    focusSessions.add(caller, existingSessions.concat([session]));

    session;
  };

  public query ({ caller }) func getLeaderboard() : async [(Principal, UserProfile)] {
    let sorted = userProfiles.entries().toArray().sort(
      func((p1, profile1), (p2, profile2)) {
        Nat.compare(profile2.xp, profile1.xp)
      }
    );
    sorted.sliceToArray(0, Nat.min(20, sorted.size()));
  };

  // FRIENDS SYSTEM

  public shared ({ caller }) func sendFriendRequest(to : Principal) : async Text {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Only users can send friend requests");
    };
    if (caller == to) {
      Runtime.trap("Cannot send friend request to yourself");
    };

    switch (friendships.get(caller)) {
      case (?friends) {
        if (containsPrincipal(friends, to)) {
          return "already_friends";
        };
      };
      case (null) {};
    };

    switch (friendRequestsSent.get(caller)) {
      case (?sent) {
        if (containsPrincipal(sent, to)) {
          return "already_sent";
        };
      };
      case (null) {};
    };

    let callerSent = switch (friendRequestsSent.get(caller)) {
      case (?sent) { sent.concat([to]) };
      case (null) { [to] };
    };
    friendRequestsSent.add(caller, callerSent);

    let toReceived = switch (friendRequestsReceived.get(to)) {
      case (?received) { received.concat([caller]) };
      case (null) { [caller] };
    };
    friendRequestsReceived.add(to, toReceived);

    "sent";
  };

  public shared ({ caller }) func acceptFriendRequest(from : Principal) : async Text {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Only users can accept friend requests");
    };
    let received = switch (friendRequestsReceived.get(caller)) {
      case (?rec) { rec };
      case (null) { Runtime.trap("No friend requests received") };
    };

    if (not containsPrincipal(received, from)) {
      return "not_found";
    };

    friendRequestsReceived.add(caller, received.filter(func(p) { p != from }));

    switch (friendRequestsSent.get(from)) {
      case (?sent) {
        friendRequestsSent.add(from, sent.filter(func(p) { p != caller }));
      };
      case (null) {};
    };

    let callerFriends = switch (friendships.get(caller)) {
      case (?friends) { friends.concat([from]) };
      case (null) { [from] };
    };
    friendships.add(caller, callerFriends);

    let fromFriends = switch (friendships.get(from)) {
      case (?friends) { friends.concat([caller]) };
      case (null) { [caller] };
    };
    friendships.add(from, fromFriends);

    "accepted";
  };

  public shared ({ caller }) func rejectFriendRequest(from : Principal) : async () {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Only users can reject friend requests");
    };
    switch (friendRequestsReceived.get(caller)) {
      case (?received) {
        friendRequestsReceived.add(caller, received.filter(func(p) { p != from }));
      };
      case (null) {};
    };
    switch (friendRequestsSent.get(from)) {
      case (?sent) {
        friendRequestsSent.add(from, sent.filter(func(p) { p != caller }));
      };
      case (null) {};
    };
  };

  public shared ({ caller }) func removeFriend(friend : Principal) : async () {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Only users can remove friends");
    };
    switch (friendships.get(caller)) {
      case (?friends) {
        friendships.add(caller, friends.filter(func(p) { p != friend }));
      };
      case (null) {};
    };
    switch (friendships.get(friend)) {
      case (?friends) {
        friendships.add(friend, friends.filter(func(p) { p != caller }));
      };
      case (null) {};
    };
  };

  public query ({ caller }) func getFriends() : async [Principal] {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Only users can view friends");
    };
    switch (friendships.get(caller)) {
      case (null) { [] };
      case (?friends) { friends };
    };
  };

  public query ({ caller }) func getFriendRequests() : async [Principal] {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Only users can view friend requests");
    };
    switch (friendRequestsReceived.get(caller)) {
      case (null) { [] };
      case (?requests) { requests };
    };
  };

  public query ({ caller }) func getFriendsLeaderboard() : async [(Principal, UserProfile)] {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Only users can view friends leaderboard");
    };
    let friends = switch (friendships.get(caller)) {
      case (null) { [] };
      case (?friends) { friends };
    };

    let entries = friends.concat([caller]).filterMap(
      func(p) {
        switch (userProfiles.get(p)) {
          case (null) { null };
          case (?profile) { ?(p, profile) };
        };
      }
    );
    entries.sort(
      func((p1, prof1), (p2, prof2)) {
        Nat.compare(prof2.xp, prof1.xp)
      }
    );
  };
};
