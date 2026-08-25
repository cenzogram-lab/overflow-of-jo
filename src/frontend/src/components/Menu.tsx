import React, { useEffect, useMemo, useState } from "react";
import { useSiteContent } from "../contexts/SiteContentContext";
import { getDrinkImageFromBackend } from "../utils/adminStorage";

type DrinkItem = {
  name: string;
  description: string;
  image: string;
  imageKey?: string;
};

type MenuCategory = {
  id: string;
  name: string;
  items: DrinkItem[];
};

const DEFAULT_MENU_CATEGORIES: MenuCategory[] = [
  {
    id: "coffee",
    name: "Coffee",
    items: [
      {
        name: "Classic Latte",
        description:
          "Smooth espresso with velvety steamed milk, a timeless coffeehouse staple.",
        image: "/assets/generated/menu-latte.dim_400x300.png",
      },
      {
        name: "Cold Brew",
        description:
          "12-hour steeped for a smooth, low-acid finish that speaks for itself.",
        image: "/assets/generated/menu-iced-coffee.dim_400x300.png",
      },
      {
        name: "Cappuccino",
        description:
          "Equal parts espresso, steamed milk, and thick velvety foam.",
        image: "/assets/generated/menu-hot-coffee.dim_400x300.png",
      },
      {
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
        name: "Earl Grey",
        description:
          "Classic black tea with bergamot — aromatic, smooth, and timeless.",
        image: "/assets/generated/menu-tea.dim_400x300.png",
      },
      {
        name: "Chamomile Honey",
        description:
          "Soothing chamomile blended with a touch of local honey for gentle warmth.",
        image: "/assets/generated/menu-tea.dim_400x300.png",
      },
      {
        name: "Matcha Latte",
        description:
          "Ceremonial grade matcha whisked with steamed milk for a calm energy boost.",
        image: "/assets/generated/menu-tea.dim_400x300.png",
      },
      {
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
        name: "Strawberry Lemonade",
        description:
          "Fresh strawberry puree and house-squeezed lemonade over crushed ice.",
        image: "/assets/generated/menu-refresher.dim_400x300.png",
      },
      {
        name: "Mango Coconut Cooler",
        description: "Tropical mango and coconut water, bright and refreshing.",
        image: "/assets/generated/menu-refresher.dim_400x300.png",
      },
      {
        name: "Blueberry Mint Fizz",
        description:
          "Blueberry syrup, fresh mint, and sparkling water — light and lively.",
        image: "/assets/generated/menu-refresher.dim_400x300.png",
      },
      {
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
        name: "Classic Hot Chocolate",
        description:
          "Rich, creamy cocoa made with real chocolate — a warm hug in a cup.",
        image: "/assets/generated/menu-mocha.dim_400x300.png",
      },
      {
        name: "White Hot Chocolate",
        description:
          "Velvety white chocolate melted into steamed milk with a hint of vanilla.",
        image: "/assets/generated/menu-mocha.dim_400x300.png",
      },
      {
        name: "Salted Caramel Cocoa",
        description:
          "Dark chocolate with a drizzle of caramel and a touch of sea salt.",
        image: "/assets/generated/menu-mocha.dim_400x300.png",
      },
      {
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
        name: "Butter Croissant",
        description: "Flaky, golden, and buttery — baked fresh each morning.",
        image: "/assets/generated/menu-bakery.dim_400x300.png",
      },
      {
        name: "Blueberry Muffin",
        description:
          "Moist muffin loaded with plump blueberries and a crumbled sugar top.",
        image: "/assets/generated/menu-bakery.dim_400x300.png",
      },
      {
        name: "Cinnamon Roll",
        description:
          "Soft, pillowy roll swirled with cinnamon and finished with cream cheese glaze.",
        image: "/assets/generated/menu-bakery.dim_400x300.png",
      },
      {
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

export default function Menu() {
  const { menuJson } = useSiteContent();
  const [activeCategory, setActiveCategory] = useState<string>("coffee");

  const menuCategories = useMemo<MenuCategory[]>(() => {
    if (!menuJson) return DEFAULT_MENU_CATEGORIES;
    try {
      const parsed = JSON.parse(menuJson) as MenuCategory[];
      if (!parsed || parsed.length === 0) return DEFAULT_MENU_CATEGORIES;
      // Always keep hardcoded category names/IDs.
      // Only pull items from backend for matching category IDs.
      return DEFAULT_MENU_CATEGORIES.map((defaultCat) => {
        const backendCat = parsed.find((c) => c.id === defaultCat.id);
        return backendCat
          ? { ...defaultCat, items: backendCat.items }
          : defaultCat;
      });
    } catch {
      // fall back to defaults
      return DEFAULT_MENU_CATEGORIES;
    }
  }, [menuJson]);

  const currentCategory =
    menuCategories.find((c) => c.id === activeCategory) ?? menuCategories[0];

  return (
    <section id="menu" className="pt-12 md:pt-16 pb-12 md:pb-16 bg-cream-light">
      {/* Top accent divider */}
      <div className="accent-divider max-w-3xl mx-auto mb-12" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10">
          <p className="font-body text-sm font-semibold tracking-widest text-brown-light uppercase mb-3">
            What We Serve
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-brown-dark mb-3">
            Our Menu
          </h2>
          <div className="flex justify-center mb-4">
            <div
              className="h-1 w-16 rounded-full"
              style={{ backgroundColor: "var(--accent-yellow)" }}
            />
          </div>
          <p className="font-body text-brown-mid max-w-xl mx-auto text-base leading-relaxed">
            Every drink crafted with intention — explore our full selection
            below.
          </p>
        </div>

        {/* Category Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {menuCategories.map((category) => {
            const isActive = activeCategory === category.id;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategory(category.id)}
                className={`font-body text-sm font-semibold tracking-wide px-5 py-2 rounded-full border transition-all duration-200 ${
                  isActive
                    ? "text-brown-dark border-[var(--accent-yellow-border)] shadow-yellow-glow"
                    : "text-brown-mid border-cream-dark bg-cream-light hover:border-[var(--accent-yellow)] hover:text-brown-dark"
                }`}
                style={
                  isActive ? { backgroundColor: "var(--accent-yellow)" } : {}
                }
              >
                {category.name}
              </button>
            );
          })}
        </div>

        {/* Category Title */}
        <div className="text-center mb-8">
          <h3 className="font-display text-2xl md:text-3xl font-semibold text-brown-dark">
            {currentCategory?.name}
          </h3>
          <div className="flex justify-center mt-2">
            <div className="h-px w-24 bg-brown-light/30" />
          </div>
        </div>

        {/* Drink Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {currentCategory?.items.map((item, idx) => (
            <div
              key={`${item.name}-${idx}`}
              className="bg-cream-light rounded-sm overflow-hidden shadow-warm border border-cream-dark hover:border-[var(--accent-yellow)] hover:shadow-yellow-glow transition-all duration-200 flex flex-col"
            >
              {/* Drink Photo */}
              <div className="w-full aspect-[4/3] overflow-hidden">
                <DrinkImage item={item} />
              </div>

              {/* Drink Info */}
              <div className="p-5 flex flex-col flex-1">
                {/* Gold accent line */}
                <div
                  className="h-0.5 w-8 rounded-full mb-3"
                  style={{ backgroundColor: "var(--accent-yellow)" }}
                />
                <h4 className="font-display text-lg font-semibold text-brown-dark mb-2 leading-snug">
                  {item.name}
                </h4>
                <p className="font-body text-sm text-brown-mid leading-relaxed flex-1">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
          {currentCategory?.items.length === 0 && (
            <div className="col-span-full text-center py-12 text-brown-mid font-body text-sm italic">
              Coming soon — check back for new additions!
            </div>
          )}
        </div>

        {/* Scripture Verse */}
        <div className="mt-14 flex justify-center">
          <div className="relative max-w-xl w-full text-center px-8 py-8 border border-cream-dark rounded-sm bg-cream-light shadow-warm">
            {/* Left gold bar */}
            <div
              className="absolute left-0 top-6 bottom-6 w-0.5 rounded-full"
              style={{ backgroundColor: "var(--accent-yellow)" }}
            />
            {/* Right gold bar */}
            <div
              className="absolute right-0 top-6 bottom-6 w-0.5 rounded-full"
              style={{ backgroundColor: "var(--accent-yellow)" }}
            />

            {/* Opening quotation mark */}
            <div
              className="font-display text-5xl leading-none mb-2 select-none"
              style={{ color: "var(--accent-yellow)" }}
              aria-hidden="true"
            >
              "
            </div>

            {/* Verse text */}
            <p className="font-display text-xl md:text-2xl font-semibold text-brown-dark leading-snug mb-3 italic">
              Whatever you do, do it all for the glory of God.
            </p>

            {/* Reference */}
            <p className="font-body text-sm font-semibold tracking-widest text-brown-light uppercase mb-4">
              — 1 Corinthians 10:31
            </p>

            {/* Gold accent divider */}
            <div className="flex justify-center mb-4">
              <div className="h-px w-12 bg-brown-light/30" />
            </div>

            {/* Subline */}
            <p className="font-body text-sm text-brown-mid italic leading-relaxed">
              (even with a cup of coffee)
            </p>
          </div>
        </div>
      </div>

      {/* Bottom accent divider */}
      <div className="accent-divider max-w-3xl mx-auto mt-12" />
    </section>
  );
}

// Resolves and renders a drink's photo. When the item references a separately
// stored image by key, it is fetched from the backend; otherwise the legacy
// embedded base64 data URL or asset path is displayed directly.
function DrinkImage({ item }: { item: DrinkItem }) {
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

  return (
    <img
      src={src}
      alt={item.name}
      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
    />
  );
}
