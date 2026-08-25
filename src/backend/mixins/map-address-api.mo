import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import MapAddressLib "../lib/map-address";
import Types "../types/map-address";

// Public API mixin for the map-address domain.
// State is injected as a MapAddressState record (mutable Text wrapped in a
// record so it is shared by reference), along with the shared access-control
// state so saveMapAddress can be gated to admins via AccessControl.isAdmin,
// matching the existing authorization pattern used by other admin-gated
// endpoints.
mixin (
  accessControlState : AccessControl.AccessControlState,
  mapAddressState : Types.MapAddressState,
) {
  // Public query: returns the saved map address (empty string when unset).
  public query func getMapAddress() : async Text {
    MapAddressLib.getMapAddress(mapAddressState);
  };

  // Public update: stores the address. Gated so only the admin can save,
  // following the existing isCallerAdmin / authorization pattern.
  public shared ({ caller }) func saveMapAddress(address : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can save the map address");
    };
    MapAddressLib.saveMapAddress(mapAddressState, address);
  };
};
