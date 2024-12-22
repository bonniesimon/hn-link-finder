function findLinks() {
  const comments = document.querySelectorAll(".comment");
  const links = [];

  comments.forEach((comment) => {
    // Get the comment ID from the closest containing element with an id
    const commentRow = comment.closest("tr[id]");
    const commentId = commentRow ? commentRow.id : null;

    // Get username and age if available
    const userElement = commentRow?.querySelector(".hnuser");
    const ageElement = commentRow?.querySelector(".age");

    const username = userElement ? userElement.textContent : "";
    const timestamp = ageElement ? ageElement.textContent : "";

    const anchors = comment.querySelectorAll("a");
    anchors.forEach((anchor) => {
      if (!anchor.href.includes("news.ycombinator.com")) {
        links.push({
          url: anchor.href,
          text: anchor.textContent,
          comment:
            comment.querySelector(".comment-text")?.textContent.trim() || "",
          commentId: commentId,
          username: username,
          timestamp: timestamp,
        });
      }
    });
  });

  return {
    links,
    threadUrl: window.location.href,
  };
}

async function initializePopup() {
  try {
    const [tab] = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });

    const [{ result }] = await browser.scripting.executeScript({
      target: { tabId: tab.id },
      func: findLinks,
    });

    const container = document.getElementById("links-container");
    container.innerHTML = "";

    if (!result || !result.links || result.links.length === 0) {
      container.innerHTML =
        '<div class="no-links">No links found in comments</div>';
      return;
    }

    result.links.forEach((link) => {
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

      const metadata = document.createElement("div");
      metadata.className = "metadata";
      if (link.username && link.timestamp) {
        metadata.textContent = `Posted by ${link.username} ${link.timestamp}`;
      }

      // Create source link only if we have a comment ID
      if (link.commentId) {
        const sourceLink = document.createElement("a");
        sourceLink.href = `${new URL(result.threadUrl).origin}/item?id=${link.commentId}`;
        sourceLink.className = "source-link";
        sourceLink.textContent = "↪ View on Hacker News";
        sourceLink.target = "_blank";
        sourceLink.rel = "noopener noreferrer";
        metadata.appendChild(document.createElement("br"));
        metadata.appendChild(sourceLink);
      }

      linkElement.appendChild(anchor);
      linkElement.appendChild(context);
      linkElement.appendChild(metadata);
      container.appendChild(linkElement);
    });
  } catch (error) {
    document.getElementById("links-container").innerHTML =
      `<div class="no-links">Error: Make sure you're on a Hacker News page</div>`;
    console.error("Error:", error);
  }
}

document.addEventListener("DOMContentLoaded", initializePopup);
