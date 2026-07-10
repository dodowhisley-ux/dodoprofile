const revealItems = document.querySelectorAll("[data-reveal]");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.14,
  },
);

revealItems.forEach((item) => observer.observe(item));

const profileCarousel = document.querySelector("[data-profile-carousel]");

if (profileCarousel) {
  const slides = Array.from(profileCarousel.querySelectorAll(".profile-slide"));
  const dots = Array.from(profileCarousel.querySelectorAll("[data-profile-dot]"));
  const prevButton = profileCarousel.querySelector("[data-profile-prev]");
  const nextButton = profileCarousel.querySelector("[data-profile-next]");
  let activeProfileIndex = Math.max(0, slides.findIndex((slide) => slide.classList.contains("is-active")));
  let profileTimer = null;

  function showProfileSlide(nextIndex) {
    const normalizedIndex = (nextIndex + slides.length) % slides.length;
    if (normalizedIndex === activeProfileIndex) {
      return;
    }

    const currentSlide = slides[activeProfileIndex];
    const nextSlide = slides[normalizedIndex];

    currentSlide.classList.remove("is-active");
    currentSlide.classList.add("is-leaving");
    nextSlide.classList.remove("is-leaving");
    nextSlide.classList.add("is-active");

    dots.forEach((dot, index) => {
      dot.classList.toggle("is-active", index === normalizedIndex);
    });

    window.setTimeout(() => {
      currentSlide.classList.remove("is-leaving");
    }, 920);

    activeProfileIndex = normalizedIndex;
  }

  function startProfileCarousel() {
    window.clearInterval(profileTimer);
    profileTimer = window.setInterval(() => {
      showProfileSlide(activeProfileIndex + 1);
    }, 1000);
  }

  prevButton?.addEventListener("click", () => {
    showProfileSlide(activeProfileIndex - 1);
    startProfileCarousel();
  });

  nextButton?.addEventListener("click", () => {
    showProfileSlide(activeProfileIndex + 1);
    startProfileCarousel();
  });

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      showProfileSlide(Number(dot.dataset.profileDot));
      startProfileCarousel();
    });
  });

  profileCarousel.addEventListener("mouseenter", () => window.clearInterval(profileTimer));
  profileCarousel.addEventListener("mouseleave", startProfileCarousel);

  startProfileCarousel();
}

const interestCarousels = document.querySelectorAll("[data-interest-carousel]");
const interestCarouselStates = [];
let interestCarouselTimer = null;

interestCarousels.forEach((carousel) => {
  const slides = Array.from(carousel.querySelectorAll(".interest-slide")).filter(
    (slide) => !slide.hidden,
  );
  const dotsWrap = carousel.querySelector(".interest-dots");

  if (slides.length <= 1 || !dotsWrap) {
    return;
  }

  let activeIndex = Math.max(0, slides.findIndex((slide) => slide.classList.contains("is-active")));

  slides.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", `查看第 ${index + 1} 张兴趣照片`);
    dot.classList.toggle("is-active", index === activeIndex);
    dot.addEventListener("click", () => {
      showSlide(index);
      restartInterestCarouselClock();
    });
    dotsWrap.appendChild(dot);
  });

  const dots = Array.from(dotsWrap.querySelectorAll("button"));

  function showSlide(nextIndex) {
    const normalizedIndex = (nextIndex + slides.length) % slides.length;
    if (normalizedIndex === activeIndex) {
      return;
    }

    slides[activeIndex].classList.remove("is-active");
    slides[normalizedIndex].classList.add("is-active");
    dots.forEach((dot, index) => {
      dot.classList.toggle("is-active", index === normalizedIndex);
    });
    activeIndex = normalizedIndex;
  }

  interestCarouselStates.push({
    carousel,
    next() {
      showSlide(activeIndex + 1);
    },
  });
});

function startInterestCarouselClock() {
  window.clearInterval(interestCarouselTimer);
  if (!interestCarouselStates.length) {
    return;
  }

  interestCarouselTimer = window.setInterval(() => {
    interestCarouselStates.forEach((state) => state.next());
  }, 1000);
}

function restartInterestCarouselClock() {
  startInterestCarouselClock();
}

interestCarouselStates.forEach(({ carousel }) => {
  carousel.addEventListener("mouseenter", () => window.clearInterval(interestCarouselTimer));
  carousel.addEventListener("mouseleave", restartInterestCarouselClock);
});

startInterestCarouselClock();

const toolkitSwitchers = document.querySelectorAll("[data-toolkit-switcher]");

toolkitSwitchers.forEach((switcher) => {
  const items = Array.from(switcher.querySelectorAll("[data-tool-item]"));
  const previews = Array.from(switcher.querySelectorAll("[data-tool-preview]"));

  function showTool(index) {
    items.forEach((item, itemIndex) => {
      item.classList.toggle("is-active", itemIndex === index);
    });

    previews.forEach((preview, previewIndex) => {
      preview.classList.toggle("is-active", previewIndex === index);
    });

  }

  items.forEach((item, index) => {
    item.addEventListener("mouseenter", () => {
      showTool(index);
    });
    item.addEventListener("focusin", () => {
      showTool(index);
    });
  });
});

const storyCards = document.querySelectorAll(".story-card");
const storyCarousels = document.querySelectorAll(".story-carousel");

function updateStoryArc(activeCard) {
  storyCarousels.forEach((carousel) => {
    const cards = Array.from(carousel.querySelectorAll(".story-card"));
    const activeIndex = activeCard && cards.includes(activeCard)
      ? cards.indexOf(activeCard)
      : Number(carousel.dataset.activeIndex || 0);

    cards.forEach((card, index) => {
      const slot = Math.max(-4, Math.min(4, index - activeIndex));
      card.classList.remove(
        "slot--4",
        "slot--3",
        "slot--2",
        "slot--1",
        "slot-0",
        "slot-1",
        "slot-2",
        "slot-3",
        "slot-4",
      );
      card.classList.add(slot < 0 ? `slot-${slot}` : `slot-${slot}`);
    });
  });
}

function clearSelectedStoryCards(exceptCard) {
  storyCards.forEach((card) => {
    if (card !== exceptCard) {
      card.classList.remove("is-selected");
      card.classList.remove("is-flipped");
      card.setAttribute("aria-expanded", "false");
    }
  });

  storyCarousels.forEach((carousel) => {
    const hasSelected = Boolean(carousel.querySelector(".story-card.is-selected"));
    carousel.classList.toggle("has-selected", hasSelected);
  });

  if (!exceptCard) {
    updateStoryArc();
  }
}

function selectStoryCard(card) {
  clearSelectedStoryCards(card);
  const carousel = card.closest(".story-carousel");
  if (carousel) {
    const cards = Array.from(carousel.querySelectorAll(".story-card"));
    carousel.dataset.activeIndex = String(cards.indexOf(card));
  }
  card.classList.add("is-selected");
  card.classList.remove("is-flipped");
  card.setAttribute("aria-expanded", "false");
  carousel?.classList.add("has-selected");
  updateStoryArc(card);
}

function selectStoryByIndex(carousel, index) {
  const cards = Array.from(carousel.querySelectorAll(".story-card"));
  const normalizedIndex = Math.max(0, Math.min(cards.length - 1, index));
  selectStoryCard(cards[normalizedIndex]);
}

storyCards.forEach((card) => {
  card.addEventListener("click", () => {
    const isSelected = card.classList.contains("is-selected");

    if (!isSelected) {
      selectStoryCard(card);
      return;
    }

    const shouldOpen = !card.classList.contains("is-flipped");
    card.classList.toggle("is-flipped", shouldOpen);
    card.setAttribute("aria-expanded", String(shouldOpen));
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    clearSelectedStoryCards();
  }
});

const copyButtons = document.querySelectorAll("[data-copy-text]");

copyButtons.forEach((button) => {
  const status = button.querySelector("[data-copy-status]");
  const defaultLabel = button.dataset.copyLabel || status?.textContent.trim() || button.textContent.trim();
  let resetTimer = null;

  async function copyText(text) {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }

  button.addEventListener("click", async () => {
    try {
      await copyText(button.dataset.copyText);
      if (status) {
        status.textContent = "已复制到剪贴板";
      }
      button.classList.add("is-copied");
      window.clearTimeout(resetTimer);
      resetTimer = window.setTimeout(() => {
        if (status) {
          status.textContent = defaultLabel;
        }
        button.classList.remove("is-copied");
      }, 1800);
    } catch {
      if (status) {
        status.textContent = button.dataset.copyText;
      } else {
        button.textContent = button.dataset.copyText;
      }
    }
  });
});

storyCarousels.forEach((carousel) => {
  let touchStartX = 0;
  let touchStartY = 0;
  let wheelLock = false;

  carousel.dataset.activeIndex = "0";

  carousel.addEventListener(
    "wheel",
    (event) => {
      if (Math.abs(event.deltaX) < 12 && Math.abs(event.deltaY) < 12) {
        return;
      }

      event.preventDefault();

      if (wheelLock) {
        return;
      }

      wheelLock = true;
      const direction = event.deltaX + event.deltaY > 0 ? 1 : -1;
      selectStoryByIndex(carousel, Number(carousel.dataset.activeIndex || 0) + direction);
      window.setTimeout(() => {
        wheelLock = false;
      }, 480);
    },
    { passive: false },
  );

  carousel.addEventListener("touchstart", (event) => {
    const touch = event.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  });

  carousel.addEventListener("touchend", (event) => {
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;

    if (Math.abs(deltaX) < 44 || Math.abs(deltaX) < Math.abs(deltaY)) {
      return;
    }

    selectStoryByIndex(carousel, Number(carousel.dataset.activeIndex || 0) + (deltaX < 0 ? 1 : -1));
  });
});

updateStoryArc();
