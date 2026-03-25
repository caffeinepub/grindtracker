import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";

module {
  type RadarScores = {
    work : Float;
    health : Float;
    learning : Float;
    social : Float;
    personal : Float;
    focus : Float;
  };

  type Profile = {
    username : Text;
    level : Nat;
    xp : Nat;
    streak : Nat;
    lastActive : Int;
    radarScores : RadarScores;
  };

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

  type NewActor = {
    userProfiles : Map.Map<Principal, Profile>;
    userTasks : Map.Map<Principal, Map.Map<Nat, Task>>;
    focusSessions : Map.Map<Principal, [FocusSession]>;
  };

  public func run(_old : {}) : NewActor {
    {
      userProfiles = Map.empty<Principal, Profile>();
      userTasks = Map.empty<Principal, Map.Map<Nat, Task>>();
      focusSessions = Map.empty<Principal, [FocusSession]>();
    };
  };
};
