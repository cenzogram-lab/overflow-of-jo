import Map "mo:core/Map";

module {
  // Map of image key -> base64 Text, holding drink images separately from the
  // menu payload. This mirrors how site images (hero/logo/about) are stored as
  // dedicated base64 fields rather than embedded in the menu JSON.
  public type DrinkImages = Map.Map<Text, Text>;
};
