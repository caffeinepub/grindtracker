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
import Migration "migration";
import Float "mo:core/Float";

(with migration = Migration.run)
actor {
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

  // Initialize the user system state
  let accessControlState = Auth.initState();
  include MixinAuthorization(accessControlState);

  var nextTaskId = 1;
  let userProfiles = Map.empty<Principal, UserProfile>();
  let userTasks = Map.empty<Principal, Map.Map<Nat, Task>>();
  let focusSessions = Map.empty<Principal, [FocusSession]>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not Auth.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func getTasks() : async [Task] {
    if (not (Auth.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access tasks");
    };
    let tasks = userTasks.get(caller);
    switch (tasks) {
      case (null) { [] };
      case (?tasksMap) {
        tasksMap.values().toArray();
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

  public shared ({ caller }) func getFocusSessions() : async [FocusSession] {
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
};

