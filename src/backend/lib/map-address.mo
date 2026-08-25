import Types "../types/map-address";

module {
  public type MapAddress = Types.MapAddress;
  public type MapAddressState = Types.MapAddressState;

  // Returns the saved map address (empty string when unset).
  public func getMapAddress(state : Types.MapAddressState) : Types.MapAddress {
    state.address;
  };

  // Stores the address on the shared state record.
  // Caller (the mixin) is responsible for admin authorization gating.
  public func saveMapAddress(state : Types.MapAddressState, address : Text) : () {
    state.address := address;
  };
};
