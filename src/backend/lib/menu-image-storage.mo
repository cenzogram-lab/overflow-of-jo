import Types "../types/menu-image-storage";

module {
  public type DrinkImages = Types.DrinkImages;

  // Stores a drink image's base64 data under a unique key.
  public func saveDrinkImage(images : Types.DrinkImages, key : Text, base64 : Text) : () {
    images.add(key, base64);
  };

  // Returns the base64 data for a drink image key, or null when absent.
  public func getDrinkImage(images : Types.DrinkImages, key : Text) : ?Text {
    images.get(key);
  };

  // Removes a drink image by key. Returns true when the key existed.
  public func deleteDrinkImage(images : Types.DrinkImages, key : Text) : Bool {
    let exists = images.containsKey(key);
    if (exists) {
      images.remove(key);
    };
    exists;
  };
};
