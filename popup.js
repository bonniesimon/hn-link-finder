function findLinks() {
  const comments = document.querySelectorAll(".comment");
  const links = [];

  comments.forEach((comment) => {
    const anchors = comment.querySelectorAll("a");
    anchors.forEach((anchor) => {
      if (!anchor.href.includes("news.ycombinator.com")) {
        links.push({
          url: anchor.href,
          text: anchor.textContent,
          comment:
            comment.querySelector(".comment-text")?.textContent.trim() || "",
        });
      }
    });
  });

  return links;
}

async function initializePopup() {
  try {
    // Get the active tab
    const [tab] = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });

    // Inject and execute the content script
    const [{ result }] = await browser.scripting.executeScript({
      target: { tabId: tab.id },
      func: findLinks,
    });

    const container = document.getElementById("links-container");
    container.innerHTML = ""; // Clear loading message

    if (!result || result.length === 0) {
      container.innerHTML =
        '<div class="no-links">No links found in comments</div>';
      return;
    }

    result.forEach((link) => {
      const linkElement = document.createElement("div");
      linkElement.className = "link-item";

      const anchor = document.createElement("a");
      anchor.href = link.url;
      anchor.className = "link-url";
      anchor.textContent = link.text || link.url;
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";

      const context = document.createElement("div");
      context.className = "link-context";
      context.textContent = link.comment;

      linkElement.appendChild(anchor);
      linkElement.appendChild(context);
      container.appendChild(linkElement);
    });
  } catch (error) {
    document.getElementById("links-container").innerHTML =
      `<div class="no-links">Error: Make sure you're on a Hacker News page</div>`;
    console.error("Error:", error);
  }
}

document.addEventListener("DOMContentLoaded", initializePopup);
