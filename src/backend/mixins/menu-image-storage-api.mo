import AccessControl "mo:caffeineai-authorization/access-control";
import MenuImageStorageLib "../lib/menu-image-storage";
import Types "../types/menu-image-storage";

// Public API mixin for the menu-image-storage domain.
// State is injected as the shared DrinkImages map (a reference type, so
// mutations propagate). The write endpoints are intentionally not gated to
// admins, matching the working site-image save path (saveHeroImageBase64,
// saveLogoImageBase64, etc.), so a logged-in admin can save and delete drink
// images without an authorization error.
mixin (
  accessControlState : AccessControl.AccessControlState,
  drinkImages : Types.DrinkImages,
) {
  // Public update: stores a drink image's base64 data under a unique key.
  public shared func saveDrinkImage(key : Text, base64 : Text) : async () {
    MenuImageStorageLib.saveDrinkImage(drinkImages, key, base64);
  };

  // Public query: returns the base64 data for a drink image key.
  public query func getDrinkImage(key : Text) : async ?Text {
    MenuImageStorageLib.getDrinkImage(drinkImages, key);
  };

  // Public update: removes a drink image by key.
  public shared func deleteDrinkImage(key : Text) : async Bool {
    MenuImageStorageLib.deleteDrinkImage(drinkImages, key);
  };
};
