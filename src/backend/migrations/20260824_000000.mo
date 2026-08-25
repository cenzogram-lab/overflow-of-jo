import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Text "mo:core/Text";

module {
  // Inline every project type a stable field references; the chain must not
  // import project files.

  type UserRole = { #admin; #guest; #user };

  type AccessControlState = {
    var adminAssigned : Bool;
    userRoles : Map.Map<Principal, UserRole>;
  };

  type EventType = {
    #Wedding;
    #ChurchEvent;
    #CommunityGathering;
  };

  type Inquiry = {
    id : Nat;
    name : Text;
    email : Text;
    phone : Text;
    eventType : EventType;
    eventDate : Text;
    message : Text;
    starred : Bool;
  };

  type PrayerRequest = {
    id : Nat;
    firstName : Text;
    request : Text;
    allowOnSleeve : Bool;
    submittedAt : Int;
    starred : Bool;
  };

  type UserProfile = {
    name : Text;
  };

  type MapAddressState = {
    var address : Text;
  };

  // Previous stable shape (legacy single-migration actor). Matches the
  // deployed stable signature exactly.
  type OldActor = {
    accessControlState : AccessControlState;
    var nextId : Nat;
    inquiriesMap : Map.Map<Nat, Inquiry>;
    userProfiles : Map.Map<Principal, UserProfile>;
    prayerRequestsMap : Map.Map<Nat, PrayerRequest>;
    var menuCategoriesJson : Text;
    var heroImageBase64 : Text;
    var logoImageBase64 : Text;
    var aboutImageBase64 : Text;
    var socialGridJson : Text;
    var contentOverridesJson : Text;
    mapAddressState : MapAddressState;
  };

  // Pure legacy->EM upgrade: stable shape unchanged, plus the new drinkImages
  // field added for this build (empty for existing deployed data).
  type NewActor = {
    accessControlState : AccessControlState;
    var nextId : Nat;
    inquiriesMap : Map.Map<Nat, Inquiry>;
    userProfiles : Map.Map<Principal, UserProfile>;
    prayerRequestsMap : Map.Map<Nat, PrayerRequest>;
    var menuCategoriesJson : Text;
    var heroImageBase64 : Text;
    var logoImageBase64 : Text;
    var aboutImageBase64 : Text;
    var socialGridJson : Text;
    var contentOverridesJson : Text;
    mapAddressState : MapAddressState;
    drinkImages : Map.Map<Text, Text>;
  };

  public func migration(old : OldActor) : NewActor {
    {
      accessControlState = old.accessControlState;
      var nextId = old.nextId;
      inquiriesMap = old.inquiriesMap;
      userProfiles = old.userProfiles;
      prayerRequestsMap = old.prayerRequestsMap;
      var menuCategoriesJson = old.menuCategoriesJson;
      var heroImageBase64 = old.heroImageBase64;
      var logoImageBase64 = old.logoImageBase64;
      var aboutImageBase64 = old.aboutImageBase64;
      var socialGridJson = old.socialGridJson;
      var contentOverridesJson = old.contentOverridesJson;
      mapAddressState = old.mapAddressState;
      drinkImages = Map.empty();
    };
  };
};
