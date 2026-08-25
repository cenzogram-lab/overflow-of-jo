import Array "mo:core/Array";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Cycles "mo:core/Cycles";
import MixinObjectStorage "mo:caffeineai-object-storage/Mixin";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import MapAddressMixin "mixins/map-address-api";
import MenuImageStorageMixin "mixins/menu-image-storage-api";
import MenuImageStorageTypes "types/menu-image-storage";
import OQL       "mo:caffeineai-oql";
import Expose    "mo:caffeineai-oql/Expose";
import Entity    "mo:caffeineai-oql/Entity";
import MapEntity "mo:caffeineai-oql/MapEntity";
import RecordValue    "mo:caffeineai-oql/RecordValue";
import NatValue       "mo:caffeineai-oql/NatValue";
import TextValue      "mo:caffeineai-oql/TextValue";
import BoolValue      "mo:caffeineai-oql/BoolValue";
import IntValue       "mo:caffeineai-oql/IntValue";
import PrincipalValue "mo:caffeineai-oql/PrincipalValue";



actor {
  include MixinObjectStorage();

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

  let accessControlState : AccessControl.AccessControlState;
  include MixinAuthorization(accessControlState);

  var nextId : Nat;
  let inquiriesMap : Map.Map<Nat, Inquiry>;
  let userProfiles : Map.Map<Principal, UserProfile>;
  let prayerRequestsMap : Map.Map<Nat, PrayerRequest>;

  // Store menu categories as JSON string
  var menuCategoriesJson : Text;

  // Store hero, logo, and about images as base64 data URLs
  var heroImageBase64 : Text;
  var logoImageBase64 : Text;
  var aboutImageBase64 : Text;

  // Store drink images keyed by a unique image key, separately from the menu
  // payload (matching how site images are stored as dedicated fields).
  let drinkImages : MenuImageStorageTypes.DrinkImages;

  // Store social grid as JSON string (array of 9 base64 strings or empty strings)
  var socialGridJson : Text;

  // Store content overrides as JSON string
  var contentOverridesJson : Text;

  // Editable map address (empty string means unset; frontend falls back to
  // "5334 Lamm Rd, Wilson, NC 27893"). Wrapped in a record so the mixin
  // receives it by reference and mutations propagate.
  let mapAddressState : { var address : Text };

  include MapAddressMixin(accessControlState, mapAddressState);
  include MenuImageStorageMixin(accessControlState, drinkImages);

  // OQL exposure: every persisted (non-transient) field that holds queryable
  // data is exposed as a queryable entity with per-table authorization.
  // Collections become tables; the scalar site-config fields (menu categories,
  // site images, social grid, content overrides, map address) are exposed as a
  // single-row "siteConfig" entity so they are queryable too.
  include Expose({
    entities = [
      // Inquiries are private app data; the agent (controller) answers over
      // them, end users do not read them directly.
      inquiriesMap.toEntityManual("inquiry", "Inquiry", "id")
        .payload("id", func i = i.id)
        .payload("name", func i = i.name)
        .payload("email", func i = i.email)
        .payload("phone", func i = i.phone)
        .payload("eventType", func i = switch (i.eventType) {
          case (#Wedding) "Wedding";
          case (#ChurchEvent) "ChurchEvent";
          case (#CommunityGathering) "CommunityGathering";
        })
        .payload("eventDate", func i = i.eventDate)
        .payload("message", func i = i.message)
        .payload("starred", func i = i.starred)
        .controllerOnly()
        .build(),
      // Prayer requests are private app data; the agent answers over them.
      prayerRequestsMap.toEntity("prayerRequest", "PrayerRequest", "id")
        .sample({ id = 0; firstName = ""; request = ""; allowOnSleeve = false; submittedAt = 0; starred = false })
        .controllerOnly()
        .build(),
      // User profiles are per-user data: each signed-in user reads only their
      // own row, while the agent (controller) reads all for aggregate answers.
      OQL.Entity.manual<(Principal, UserProfile)>("userProfile", func () = userProfiles.entries(), "UserProfile", "principal")
        .payload("principal", func ((p, _)) = p)
        .payload("name", func ((_, u)) = u.name)
        .ownedBy("principal")
        .controllerOrScoped()
        .build(),
      // Drink images are private admin data; the agent answers over them.
      OQL.Entity.manual<(Text, Text)>("drinkImage", func () = drinkImages.entries(), "DrinkImage", "key")
        .payload("key", func ((k, _)) = k)
        .payload("base64", func ((_, v)) = v)
        .controllerOnly()
        .build(),
      // Single-row entity exposing the scalar site-config fields so they are
      // queryable through OQL alongside the collection tables.
      OQL.Entity.manual<Text>("siteConfig", func () = ["singleton"].values(), "SiteConfig", "id")
        .payload("id", func _ = 0)
        .payload("menuCategoriesJson", func _ = menuCategoriesJson)
        .payload("heroImageBase64", func _ = heroImageBase64)
        .payload("logoImageBase64", func _ = logoImageBase64)
        .payload("aboutImageBase64", func _ = aboutImageBase64)
        .payload("socialGridJson", func _ = socialGridJson)
        .payload("contentOverridesJson", func _ = contentOverridesJson)
        .payload("mapAddress", func _ = mapAddressState.address)
        .controllerOnly()
        .build(),
    ];
  });

  public shared ({ caller }) func submitInquiry(
    name : Text,
    email : Text,
    phone : Text,
    eventType : EventType,
    eventDate : Text,
    message : Text,
  ) : async Nat {
    let id = nextId;
    let newInquiry : Inquiry = {
      id;
      name;
      email;
      phone;
      eventType;
      eventDate;
      message;
      starred = false;
    };

    inquiriesMap.add(id, newInquiry);
    nextId += 1;
    id;
  };

  public shared ({ caller }) func submitPrayerRequest(
    firstName : Text,
    request : Text,
    allowOnSleeve : Bool,
  ) : async Nat {
    let id = nextId;
    let newPrayerRequest : PrayerRequest = {
      id;
      firstName;
      request;
      allowOnSleeve;
      submittedAt = Time.now();
      starred = false;
    };

    prayerRequestsMap.add(id, newPrayerRequest);
    nextId += 1;
    id;
  };

  public query ({ caller }) func getAllInquiries() : async [Inquiry] {
    inquiriesMap.values().toArray();
  };

  public query ({ caller }) func getAllPrayerRequests() : async [PrayerRequest] {
    prayerRequestsMap.values().toArray();
  };

  public shared ({ caller }) func starInquiry(id : Nat) : async Bool {
    switch (inquiriesMap.get(id)) {
      case (?inquiry) {
        let newStarred = not inquiry.starred;
        inquiriesMap.add(id, { inquiry with starred = newStarred });
        newStarred;
      };
      case null { false };
    };
  };

  public shared ({ caller }) func starPrayerRequest(id : Nat) : async Bool {
    switch (prayerRequestsMap.get(id)) {
      case (?pr) {
        let newStarred = not pr.starred;
        prayerRequestsMap.add(id, { pr with starred = newStarred });
        newStarred;
      };
      case null { false };
    };
  };

  public shared ({ caller }) func deleteInquiry(id : Nat) : async Bool {
    let exists = inquiriesMap.containsKey(id);
    if (exists) {
      inquiriesMap.remove(id);
    };
    exists;
  };

  public shared ({ caller }) func deletePrayerRequest(id : Nat) : async Bool {
    let exists = prayerRequestsMap.containsKey(id);
    if (exists) {
      prayerRequestsMap.remove(id);
    };
    exists;
  };

  public query ({ caller }) func getInquiryById(id : Nat) : async ?Inquiry {
    inquiriesMap.get(id);
  };

  public query ({ caller }) func getPrayerRequestsWithSleeveConsent() : async [PrayerRequest] {
    let allPr = prayerRequestsMap.values().toArray();
    let consented = allPr.filter(func(pr) { pr.allowOnSleeve });
    consented.sort(func(a, b) { Int.compare(b.submittedAt, a.submittedAt) });
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getTotalPrayerRequestsCount() : async Nat {
    prayerRequestsMap.size();
  };

  public shared ({ caller }) func saveMenuCategoriesJson(json : Text) : async () {
    menuCategoriesJson := json;
  };

  public shared ({ caller }) func saveHeroImageBase64(base64Data : Text) : async () {
    heroImageBase64 := base64Data;
  };

  public shared ({ caller }) func saveLogoImageBase64(base64Data : Text) : async () {
    logoImageBase64 := base64Data;
  };

  public shared ({ caller }) func saveAboutImageBase64(base64Data : Text) : async () {
    aboutImageBase64 := base64Data;
  };

  public shared ({ caller }) func saveSocialGridJson(json : Text) : async () {
    socialGridJson := json;
  };

  public query ({ caller }) func getMenuCategoriesJson() : async Text {
    menuCategoriesJson;
  };

  public query ({ caller }) func getHeroImageBase64() : async Text {
    heroImageBase64;
  };

  public query ({ caller }) func getLogoImageBase64() : async Text {
    logoImageBase64;
  };

  public query ({ caller }) func getAboutImageBase64() : async Text {
    aboutImageBase64;
  };

  public query ({ caller }) func getSocialGridJson() : async Text {
    socialGridJson;
  };

  public query func getContentOverrides() : async Text {
    contentOverridesJson;
  };

  public shared func saveContentOverrides(json : Text) : async () {
    contentOverridesJson := json;
  };

  public query func getCycles() : async Nat {
    Cycles.balance();
  };
};
