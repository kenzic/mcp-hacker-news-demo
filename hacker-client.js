import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";

const TOP_STORIES_URL =
  "https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty";

// https://github.com/HackerNews/API?tab=readme-ov-file
export class HackerNewsClient {
  constructor() {
    this.name = "Hacker News";
    this.version = "1.0.0";
  }

  getItemUrl(id) {
    return `https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`;
  }

  async listTopStories() {
    try {
      const response = await fetch(TOP_STORIES_URL);
      if (!response.ok) {
        throw new Error(`Failed to fetch top stories: ${response.statusText}`);
      }
      const data = await response.json();
      // Get top 10 story
      const topStoryIds = data.splice(0, 10);

      // get details for each story
      const details = await Promise.all(
        topStoryIds.map(async (id) => {
          const response = await fetch(this.getItemUrl(id));
          return await response.json();
        })
      );
      return details;
    } catch (e) {
      console.error(e);
    }
  }

  async getStoryDetails(id) {
    try {
      // fetch story detail from hacker news
      const response = await fetch(this.getItemUrl(id));
      const story = await response.json();

      // fetch content of page story links to
      const pageContent = await fetch(story.url);
      const html = await pageContent.text();
      const doc = new JSDOM(html, { url: story.url });

      // Use Readability to parse html for main content
      let reader = new Readability(doc.window.document);
      let article = reader.parse();

      return {
        id,
        title: story.title,
        url: story.url,
        text: story.text,
        fullText: article.textContent,
      };
    } catch (e) {
      console.error(e);
    }
  }
}

export function formatTopStories(data) {
  return data
    .map((item) => {
      return `
        ID: ${item.id}
        Title: ${item.title}
        Url: ${item.url}
        Text: ${item.text || ""}
        `;
    })
    .join("\n---------------------------------\n");
}

export function formatStoryDetail(data) {
  return `
        ID: ${data.id}
        Title: ${data.title}
        Url: ${data.url}
        Text: ${data.fullText}
    `;
}
