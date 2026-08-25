import {
  Check,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import {
  type AdminDrinkItem,
  type AdminMenuCategory,
  fileToDataURL,
  getDrinkImageFromBackend,
  getMenuCategoriesFromBackend,
  saveDrinkImageToBackend,
  saveMenuCategoriesToBackend,
} from "../../utils/adminStorage";
import { validateImageFile } from "../../utils/fileValidation";

// Hardcoded category structure — names and IDs never change
const HARDCODED_CATEGORIES: Pick<AdminMenuCategory, "id" | "name">[] = [
  { id: "coffee", name: "Coffee" },
  { id: "tea", name: "Tea" },
  { id: "refreshers", name: "Refreshers" },
  { id: "hot-chocolates", name: "Hot Chocolates" },
  { id: "bakery", name: "Bakery" },
  { id: "monthly-specials", name: "Monthly Specials" },
];

const DEFAULT_CATEGORIES: AdminMenuCategory[] = [
  {
    id: "coffee",
    name: "Coffee",
    items: [
      {
        id: "c1",
        name: "Classic Latte",
        description:
          "Smooth espresso with velvety steamed milk, a timeless coffeehouse staple.",
        image: "/assets/generated/menu-latte.dim_400x300.png",
      },
      {
        id: "c2",
        name: "Cold Brew",
        description:
          "12-hour steeped for a smooth, low-acid finish that speaks for itself.",
        image: "/assets/generated/menu-iced-coffee.dim_400x300.png",
      },
      {
        id: "c3",
        name: "Cappuccino",
        description:
          "Equal parts espresso, steamed milk, and thick velvety foam.",
        image: "/assets/generated/menu-hot-coffee.dim_400x300.png",
      },
      {
        id: "c4",
        name: "Honey Oat Latte",
        description:
          "Creamy oat milk, local honey, and a double shot of espresso.",
        image: "/assets/generated/menu-latte.dim_400x300.png",
      },
    ],
  },
  {
    id: "tea",
    name: "Tea",
    items: [
      {
        id: "t1",
        name: "Earl Grey",
        description:
          "Classic black tea with bergamot — aromatic, smooth, and timeless.",
        image: "/assets/generated/menu-tea.dim_400x300.png",
      },
      {
        id: "t2",
        name: "Chamomile Honey",
        description:
          "Soothing chamomile blended with a touch of local honey for gentle warmth.",
        image: "/assets/generated/menu-tea.dim_400x300.png",
      },
      {
        id: "t3",
        name: "Matcha Latte",
        description:
          "Ceremonial grade matcha whisked with steamed milk for a calm energy boost.",
        image: "/assets/generated/menu-tea.dim_400x300.png",
      },
      {
        id: "t4",
        name: "Peach Iced Tea",
        description:
          "House-brewed black tea infused with sweet peach, served over ice.",
        image: "/assets/generated/menu-tea.dim_400x300.png",
      },
    ],
  },
  {
    id: "refreshers",
    name: "Refreshers",
    items: [
      {
        id: "r1",
        name: "Strawberry Lemonade",
        description:
          "Fresh strawberry puree and house-squeezed lemonade over crushed ice.",
        image: "/assets/generated/menu-refresher.dim_400x300.png",
      },
      {
        id: "r2",
        name: "Mango Coconut Cooler",
        description: "Tropical mango and coconut water, bright and refreshing.",
        image: "/assets/generated/menu-refresher.dim_400x300.png",
      },
      {
        id: "r3",
        name: "Blueberry Mint Fizz",
        description:
          "Blueberry syrup, fresh mint, and sparkling water — light and lively.",
        image: "/assets/generated/menu-refresher.dim_400x300.png",
      },
      {
        id: "r4",
        name: "Watermelon Breeze",
        description:
          "Fresh watermelon juice with a hint of lime, served chilled.",
        image: "/assets/generated/menu-refresher.dim_400x300.png",
      },
    ],
  },
  {
    id: "hot-chocolates",
    name: "Hot Chocolates",
    items: [
      {
        id: "hc1",
        name: "Classic Hot Chocolate",
        description:
          "Rich, creamy cocoa made with real chocolate — a warm hug in a cup.",
        image: "/assets/generated/menu-mocha.dim_400x300.png",
      },
      {
        id: "hc2",
        name: "White Hot Chocolate",
        description:
          "Velvety white chocolate melted into steamed milk with a hint of vanilla.",
        image: "/assets/generated/menu-mocha.dim_400x300.png",
      },
      {
        id: "hc3",
        name: "Salted Caramel Cocoa",
        description:
          "Dark chocolate with a drizzle of caramel and a touch of sea salt.",
        image: "/assets/generated/menu-mocha.dim_400x300.png",
      },
      {
        id: "hc4",
        name: "Peppermint Mocha",
        description:
          "Bold espresso, rich chocolate, and cool peppermint in one cozy cup.",
        image: "/assets/generated/menu-mocha.dim_400x300.png",
      },
    ],
  },
  {
    id: "bakery",
    name: "Bakery",
    items: [
      {
        id: "b1",
        name: "Butter Croissant",
        description: "Flaky, golden, and buttery — baked fresh each morning.",
        image: "/assets/generated/menu-bakery.dim_400x300.png",
      },
      {
        id: "b2",
        name: "Blueberry Muffin",
        description:
          "Moist muffin loaded with plump blueberries and a crumbled sugar top.",
        image: "/assets/generated/menu-bakery.dim_400x300.png",
      },
      {
        id: "b3",
        name: "Cinnamon Roll",
        description:
          "Soft, pillowy roll swirled with cinnamon and finished with cream cheese glaze.",
        image: "/assets/generated/menu-bakery.dim_400x300.png",
      },
      {
        id: "b4",
        name: "Banana Nut Bread",
        description:
          "Moist slice of homemade banana bread with toasted walnuts.",
        image: "/assets/generated/menu-bakery.dim_400x300.png",
      },
    ],
  },
  {
    id: "monthly-specials",
    name: "Monthly Specials",
    items: [],
  },
];

interface DrinkFormState {
  name: string;
  description: string;
  image: string; // preview URL (data URL or existing asset path)
  imageFile: File | null; // pending file to upload on save
  imageError: string;
}

const emptyForm = (): DrinkFormState => ({
  name: "",
  description: "",
  image: "",
  imageFile: null,
  imageError: "",
});

export default function MenuManagement() {
  const [categories, setCategories] =
    useState<AdminMenuCategory[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [activeCategoryId, setActiveCategoryId] = useState(
    DEFAULT_CATEGORIES[0]?.id ?? "",
  );
  const [editingDrinkId, setEditingDrinkId] = useState<string | null>(null);
  const [addingDrink, setAddingDrink] = useState(false);
  const [form, setForm] = useState<DrinkFormState>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const addFileInputRef = useRef<HTMLInputElement | null>(null);

  // Load categories from backend on mount
  useEffect(() => {
    getMenuCategoriesFromBackend()
      .then((data) => {
        if (data && data.length > 0) {
          // Always use hardcoded category names/IDs.
          // Only pull items from backend for matching category IDs.
          const merged: AdminMenuCategory[] = HARDCODED_CATEGORIES.map(
            (hardcat) => {
              const backendCat = data.find((c) => c.id === hardcat.id);
              const defaultCat = DEFAULT_CATEGORIES.find(
                (c) => c.id === hardcat.id,
              );
              return {
                id: hardcat.id,
                name: hardcat.name,
                items: backendCat?.items ?? defaultCat?.items ?? [],
              };
            },
          );
          setCategories(merged);
          setActiveCategoryId(merged[0]?.id ?? "");
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const activeCategory =
    categories.find((c) => c.id === activeCategoryId) ?? categories[0];

  const persist = async (updated: AdminMenuCategory[]) => {
    // Ensure category names stay hardcoded before saving
    const safe = updated.map((cat) => {
      const hard = HARDCODED_CATEGORIES.find((h) => h.id === cat.id);
      return hard ? { ...cat, name: hard.name } : cat;
    });
    setCategories(safe);
    setSaveError(null);
    try {
      await saveMenuCategoriesToBackend(safe);
    } catch (err) {
      console.error("Failed to save menu categories to backend:", err);
      setSaveError("Failed to save. Please try again.");
    }
  };

  const handleImageChange = async (file: File) => {
    const result = validateImageFile(file);
    if (!result.valid) {
      setForm((f) => ({ ...f, imageError: result.error ?? "Invalid file" }));
      return;
    }
    // Store data URL for preview only; actual upload happens on save
    const dataUrl = await fileToDataURL(file);
    setForm((f) => ({ ...f, image: dataUrl, imageFile: file, imageError: "" }));
  };

  const startEdit = (drink: AdminDrinkItem) => {
    setEditingDrinkId(drink.id);
    setAddingDrink(false);
    setForm({
      name: drink.name,
      description: drink.description,
      image: drink.image,
      imageFile: null,
      imageError: "",
    });
    // When the drink references a separately stored image by key, resolve it
    // so the edit form shows a preview.
    if (drink.imageKey) {
      getDrinkImageFromBackend(drink.imageKey).then((url) => {
        if (url) {
          setForm((f) => ({ ...f, image: url }));
        }
      });
    }
  };

  const cancelEdit = () => {
    setEditingDrinkId(null);
    setAddingDrink(false);
    setForm(emptyForm());
  };

  const saveEdit = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    setSaveError(null);
    try {
      // When a new image file was selected, upload it to the backend and store
      // only its key in the menu item instead of the base64 data URL.
      let newImageKey: string | undefined;
      let newImage: string | undefined;
      if (form.imageFile) {
        const key = `drink_${editingDrinkId}`;
        await saveDrinkImageToBackend(key, form.image);
        newImageKey = key;
        newImage = "";
      }
      const updated = categories.map((cat) => {
        if (cat.id !== activeCategoryId) return cat;
        return {
          ...cat,
          items: cat.items.map((item) =>
            item.id === editingDrinkId
              ? {
                  ...item,
                  name: form.name,
                  description: form.description,
                  image: newImage !== undefined ? newImage : item.image,
                  imageKey:
                    newImageKey !== undefined ? newImageKey : item.imageKey,
                }
              : item,
          ),
        };
      });
      await persist(updated);
      setEditingDrinkId(null);
      setForm(emptyForm());
    } catch (err: any) {
      setSaveError(err?.message ?? "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const saveAdd = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    setSaveError(null);
    try {
      const drinkId = `${activeCategoryId}_${Date.now()}`;
      // When a new image file was selected, upload it to the backend and store
      // only its key in the menu item instead of the base64 data URL.
      let imageKey: string | undefined;
      let image = form.image || (activeCategory?.items[0]?.image ?? "");
      if (form.imageFile) {
        const key = `drink_${drinkId}`;
        await saveDrinkImageToBackend(key, form.image);
        imageKey = key;
        image = "";
      }
      const newDrink: AdminDrinkItem = {
        id: drinkId,
        name: form.name,
        description: form.description,
        image,
        imageKey,
      };
      const updated = categories.map((cat) => {
        if (cat.id !== activeCategoryId) return cat;
        return { ...cat, items: [...cat.items, newDrink] };
      });
      await persist(updated);
      setAddingDrink(false);
      setForm(emptyForm());
    } catch (err: any) {
      setSaveError(err?.message ?? "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const deleteDrink = async (drinkId: string) => {
    const updated = categories.map((cat) => {
      if (cat.id !== activeCategoryId) return cat;
      return { ...cat, items: cat.items.filter((item) => item.id !== drinkId) };
    });
    await persist(updated);
  };

  const resetCategory = async () => {
    const defaultCat = DEFAULT_CATEGORIES.find(
      (c) => c.id === activeCategoryId,
    );
    if (!defaultCat) return;
    const updated = categories.map((cat) =>
      cat.id === activeCategoryId ? { ...defaultCat } : cat,
    );
    await persist(updated);
    setEditingDrinkId(null);
    setAddingDrink(false);
    setForm(emptyForm());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-admin-accent/30 border-t-admin-accent rounded-full animate-spin" />
        <span className="ml-3 text-admin-muted text-sm">Loading menu…</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-admin-text">Menu Management</h2>
          <p className="text-admin-muted text-sm mt-0.5">
            Add, edit, or remove drinks from each category.
          </p>
        </div>
      </div>

      {saveError && (
        <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-md text-red-400 text-sm">
          {saveError}
        </div>
      )}

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => {
              setActiveCategoryId(cat.id);
              cancelEdit();
            }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 ${
              activeCategoryId === cat.id
                ? "bg-admin-accent text-admin-accent-text border-admin-accent"
                : "bg-admin-input text-admin-muted border-admin-border hover:text-admin-text hover:border-admin-accent/50"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Category Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-admin-text">
          {activeCategory?.name}
        </h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={resetCategory}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-admin-muted hover:text-admin-text border border-admin-border hover:border-admin-accent/50 rounded-md transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset to Default
          </button>
          <button
            type="button"
            onClick={() => {
              setAddingDrink(true);
              setEditingDrinkId(null);
              setForm(emptyForm());
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-admin-accent text-admin-accent-text rounded-md hover:bg-admin-accent-hover transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Drink
          </button>
        </div>
      </div>

      {/* Add Drink Form */}
      {addingDrink && (
        <div className="bg-admin-card border border-admin-accent/30 rounded-lg p-5 mb-5">
          <h4 className="text-sm font-semibold text-admin-text mb-4">
            New Drink
          </h4>
          <DrinkForm
            form={form}
            setForm={setForm}
            onImageChange={handleImageChange}
            fileInputRef={addFileInputRef}
          />
          <div className="flex gap-2 mt-4">
            <button
              type="button"
              onClick={saveAdd}
              disabled={saving || !form.name.trim()}
              className="flex items-center gap-1.5 px-4 py-2 bg-admin-accent text-admin-accent-text text-sm font-medium rounded-md hover:bg-admin-accent-hover disabled:opacity-50 transition-all"
            >
              {saving ? (
                <div className="w-3.5 h-3.5 border-2 border-admin-accent-text/30 border-t-admin-accent-text rounded-full animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              {saving ? "Saving…" : "Save Drink"}
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              disabled={saving}
              className="px-4 py-2 text-sm text-admin-muted hover:text-admin-text border border-admin-border rounded-md transition-all disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Drink List */}
      <div className="space-y-3">
        {activeCategory?.items.map((drink) => (
          <div
            key={drink.id}
            className="bg-admin-card border border-admin-border rounded-lg overflow-hidden"
          >
            {editingDrinkId === drink.id ? (
              <div className="p-5">
                <h4 className="text-sm font-semibold text-admin-text mb-4">
                  Edit: {drink.name}
                </h4>
                <DrinkForm
                  form={form}
                  setForm={setForm}
                  onImageChange={handleImageChange}
                  fileInputRef={fileInputRef}
                />
                <div className="flex gap-2 mt-4">
                  <button
                    type="button"
                    onClick={saveEdit}
                    disabled={saving || !form.name.trim()}
                    className="flex items-center gap-1.5 px-4 py-2 bg-admin-accent text-admin-accent-text text-sm font-medium rounded-md hover:bg-admin-accent-hover disabled:opacity-50 transition-all"
                  >
                    {saving ? (
                      <div className="w-3.5 h-3.5 border-2 border-admin-accent-text/30 border-t-admin-accent-text rounded-full animate-spin" />
                    ) : (
                      <Check className="w-3.5 h-3.5" />
                    )}
                    {saving ? "Saving…" : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    disabled={saving}
                    className="px-4 py-2 text-sm text-admin-muted hover:text-admin-text border border-admin-border rounded-md transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4 p-4">
                <DrinkImage
                  item={drink}
                  className="w-16 h-16 object-cover rounded-md flex-shrink-0 border border-admin-border"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-admin-text truncate">
                    {drink.name}
                  </p>
                  <p className="text-xs text-admin-muted mt-0.5 line-clamp-2">
                    {drink.description}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => startEdit(drink)}
                    className="p-2 text-admin-muted hover:text-admin-accent hover:bg-admin-accent/10 rounded-md transition-all"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteDrink(drink.id)}
                    className="p-2 text-admin-muted hover:text-red-400 hover:bg-red-500/10 rounded-md transition-all"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {activeCategory?.items.length === 0 && (
          <div className="text-center py-10 text-admin-muted text-sm border border-dashed border-admin-border rounded-lg">
            No drinks in this category. Click &quot;Add Drink&quot; to get
            started.
          </div>
        )}
      </div>
    </div>
  );
}

interface DrinkFormProps {
  form: DrinkFormState;
  setForm: React.Dispatch<React.SetStateAction<DrinkFormState>>;
  onImageChange: (file: File) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

function DrinkForm({
  form,
  setForm,
  onImageChange,
  fileInputRef,
}: DrinkFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="drink-name"
            className="block text-xs font-medium text-admin-muted mb-1.5"
          >
            Drink Name *
          </label>
          <input
            id="drink-name"
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full px-3 py-2 bg-admin-input border border-admin-border rounded-md text-admin-text text-sm placeholder-admin-muted focus:outline-none focus:ring-2 focus:ring-admin-accent focus:border-transparent"
            placeholder="e.g. Vanilla Latte"
          />
        </div>
        <div>
          <label
            htmlFor="drink-image-upload"
            className="block text-xs font-medium text-admin-muted mb-1.5"
          >
            Image (JPG, PNG, WEBP)
          </label>
          <div className="flex items-center gap-2">
            {form.image && (
              <img
                src={form.image}
                alt="preview"
                className="w-10 h-10 object-cover rounded border border-admin-border flex-shrink-0"
              />
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 text-xs border border-admin-border rounded-md text-admin-muted hover:text-admin-text hover:border-admin-accent/50 transition-all"
            >
              <Upload className="w-3.5 h-3.5" />
              {form.image ? "Change Image" : "Upload Image"}
            </button>
            <input
              id="drink-image-upload"
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onImageChange(file);
                e.target.value = "";
              }}
            />
          </div>
          {form.imageError && (
            <p className="text-xs text-red-400 mt-1">{form.imageError}</p>
          )}
          {form.imageFile && (
            <p className="text-xs text-admin-muted mt-1">
              Image ready — click Save to apply.
            </p>
          )}
        </div>
      </div>
      <div>
        <label
          htmlFor="drink-description"
          className="block text-xs font-medium text-admin-muted mb-1.5"
        >
          Description
        </label>
        <textarea
          id="drink-description"
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
          rows={2}
          className="w-full px-3 py-2 bg-admin-input border border-admin-border rounded-md text-admin-text text-sm placeholder-admin-muted focus:outline-none focus:ring-2 focus:ring-admin-accent focus:border-transparent resize-none"
          placeholder="Describe this drink..."
        />
      </div>
    </div>
  );
}

// Resolves and renders a drink's photo. When the item references a separately
// stored image by key, it is fetched from the backend; otherwise the legacy
// embedded base64 data URL or asset path is displayed directly.
function DrinkImage({
  item,
  className,
}: {
  item: AdminDrinkItem;
  className?: string;
}) {
  const [src, setSrc] = useState<string>(item.image);

  useEffect(() => {
    if (item.imageKey) {
      let active = true;
      getDrinkImageFromBackend(item.imageKey).then((url) => {
        if (active && url) setSrc(url);
      });
      return () => {
        active = false;
      };
    }
    setSrc(item.image);
  }, [item.imageKey, item.image]);

  return <img src={src} alt={item.name} className={className} />;
}
