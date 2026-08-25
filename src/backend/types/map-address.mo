module {
  // The editable map address stored as a Text variable.
  // Initialized empty so the frontend can fall back to the default address
  // "5334 Lamm Rd, Wilson, NC 27893" when no address is saved.
  public type MapAddress = Text;

  // Mutable state record shared by reference between main.mo and the mixin.
  // Motoko mixins cannot take `var` parameters (mutations would not propagate
  // by value), so the mutable Text is wrapped in a record and the record is
  // passed by reference.
  public type MapAddressState = {
    var address : MapAddress;
  };
};
