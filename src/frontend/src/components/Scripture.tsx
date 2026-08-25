import { BookOpen } from "lucide-react";
import React, { useState, useEffect } from "react";
import {
  CONTENT_KEYS,
  getText,
  useContentOverrides,
} from "../hooks/useContentOverrides";

const DEFAULT_VERSES = [
  {
    text: '"For I know the plans I have for you," declares the Lord, "plans to prosper you and not to harm you, plans to give you hope and a future."',
    reference: "Jeremiah 29:11",
  },
  {
    text: '"I can do all this through him who gives me strength."',
    reference: "Philippians 4:13",
  },
  {
    text: '"Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight."',
    reference: "Proverbs 3:5-6",
  },
  {
    text: '"Come to me, all you who are weary and burdened, and I will give you rest."',
    reference: "Matthew 11:28",
  },
  {
    text: '"Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go."',
    reference: "Joshua 1:9",
  },
  {
    text: '"And we know that in all things God works for the good of those who love him, who have been called according to his purpose."',
    reference: "Romans 8:28",
  },
];

const DEFAULT_COMMUNITY = [
  {
    title: "Weekly Devotionals",
    description:
      "Short reflections shared with our community every Monday morning.",
  },
  {
    title: "Prayer Wall",
    description:
      "A physical board in our shop where you can post and receive prayer.",
  },
  {
    title: "Bible Study Nights",
    description:
      "Monthly gatherings over coffee to explore scripture together.",
  },
];

const VERSE_KEYS = [
  {
    textKey: CONTENT_KEYS["scripture.verse1"],
    refKey: CONTENT_KEYS["scripture.verse1.ref"],
  },
  {
    textKey: CONTENT_KEYS["scripture.verse2"],
    refKey: CONTENT_KEYS["scripture.verse2.ref"],
  },
  {
    textKey: CONTENT_KEYS["scripture.verse3"],
    refKey: CONTENT_KEYS["scripture.verse3.ref"],
  },
  {
    textKey: CONTENT_KEYS["scripture.verse4"],
    refKey: CONTENT_KEYS["scripture.verse4.ref"],
  },
  {
    textKey: CONTENT_KEYS["scripture.verse5"],
    refKey: CONTENT_KEYS["scripture.verse5.ref"],
  },
  {
    textKey: CONTENT_KEYS["scripture.verse6"],
    refKey: CONTENT_KEYS["scripture.verse6.ref"],
  },
];

const COMMUNITY_KEYS = [
  {
    titleKey: CONTENT_KEYS["scripture.community1.title"],
    descKey: CONTENT_KEYS["scripture.community1.desc"],
  },
  {
    titleKey: CONTENT_KEYS["scripture.community2.title"],
    descKey: CONTENT_KEYS["scripture.community2.desc"],
  },
  {
    titleKey: CONTENT_KEYS["scripture.community3.title"],
    descKey: CONTENT_KEYS["scripture.community3.desc"],
  },
];

export default function Scripture() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const { overrides } = useContentOverrides();

  // Build resolved verses from overrides + defaults
  const verses = DEFAULT_VERSES.map((v, i) => ({
    text: getText(overrides, VERSE_KEYS[i].textKey, v.text),
    reference: getText(overrides, VERSE_KEYS[i].refKey, v.reference),
  }));

  const communityFeatures = DEFAULT_COMMUNITY.map((c, i) => ({
    title: getText(overrides, COMMUNITY_KEYS[i].titleKey, c.title),
    description: getText(overrides, COMMUNITY_KEYS[i].descKey, c.description),
  }));

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % verses.length);
        setIsVisible(true);
      }, 400);
    }, 7000);
    return () => clearInterval(interval);
  }, [verses.length]);

  const goToVerse = (index: number) => {
    setIsVisible(false);
    setTimeout(() => {
      setCurrentIndex(index);
      setIsVisible(true);
    }, 300);
  };

  const currentVerse = verses[currentIndex];

  return (
    <section id="community" className="py-20 md:py-28 bg-coffee-cream">
      {/* Yellow accent divider at top */}
      <div className="accent-divider max-w-3xl mx-auto mb-12" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-12 h-12 rounded-full bg-[var(--accent-yellow)]/30 border-2 border-[var(--accent-yellow)] flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-6 h-6 text-brown-dark" />
          </div>
          <h2
            className="font-display text-4xl md:text-5xl font-bold text-brown-dark mb-2"
            data-content-key={CONTENT_KEYS["scripture.heading"]}
          >
            {getText(
              overrides,
              CONTENT_KEYS["scripture.heading"],
              "Scripture & Community",
            )}
          </h2>
          {/* Yellow underline accent */}
          <div className="flex justify-center mb-4">
            <div className="h-1 w-16 rounded-full bg-[var(--accent-yellow)]" />
          </div>
          <p
            className="font-body text-brown-mid max-w-xl mx-auto"
            data-content-key={CONTENT_KEYS["scripture.desc"]}
          >
            {getText(
              overrides,
              CONTENT_KEYS["scripture.desc"],
              "Rooted in faith, growing in community. A verse to carry with you today.",
            )}
          </p>
        </div>

        {/* Verse Display */}
        <div className="bg-cream-light rounded-sm p-8 md:p-12 shadow-warm-lg mb-8 border border-[var(--accent-yellow)]/30 relative overflow-hidden">
          {/* Decorative yellow corner accent */}
          <div className="absolute top-0 left-0 w-1 h-full bg-[var(--accent-yellow)]/60 rounded-l-sm" />
          <div className="absolute top-0 right-0 w-1 h-full bg-[var(--accent-yellow)]/60 rounded-r-sm" />

          <div
            className="transition-opacity duration-400"
            style={{ opacity: isVisible ? 1 : 0 }}
          >
            <p
              className="font-display text-xl md:text-2xl text-brown-dark leading-relaxed text-center italic mb-6"
              data-content-key={VERSE_KEYS[currentIndex].textKey}
            >
              {currentVerse.text}
            </p>
            <p
              className="font-body text-sm font-semibold text-brown-mid text-center tracking-wide"
              data-content-key={VERSE_KEYS[currentIndex].refKey}
            >
              — {currentVerse.reference}
            </p>
          </div>
        </div>

        {/* Dot Navigation */}
        <div className="flex justify-center gap-3 mb-14">
          {verses.map((verse, index) => (
            <button
              key={verse.reference}
              type="button"
              onClick={() => goToVerse(index)}
              aria-label={`Go to verse ${index + 1}`}
              className={`transition-all duration-300 rounded-full ${
                index === currentIndex
                  ? "w-6 h-3 bg-[var(--accent-yellow)] border border-[var(--accent-yellow-border)]"
                  : "w-3 h-3 bg-brown-light border border-brown-mid hover:bg-[var(--accent-yellow)]/60 hover:border-[var(--accent-yellow)]"
              }`}
            />
          ))}
        </div>

        {/* Community Features */}
        <div className="grid md:grid-cols-3 gap-6">
          {communityFeatures.map((feature, index) => (
            <div
              key={feature.title}
              className="bg-cream-light rounded-sm p-6 shadow-warm-sm border border-[var(--accent-yellow)]/25 hover:border-[var(--accent-yellow)] hover:shadow-warm transition-all"
            >
              <div className="w-2 h-8 rounded-full bg-[var(--accent-yellow)] mb-4" />
              <h3
                className="font-display text-lg font-semibold text-brown-dark mb-2"
                data-content-key={COMMUNITY_KEYS[index].titleKey}
              >
                {feature.title}
              </h3>
              <p
                className="font-body text-sm text-brown-mid leading-relaxed"
                data-content-key={COMMUNITY_KEYS[index].descKey}
              >
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
