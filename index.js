import {
  HackerNewsClient,
  formatStoryDetail,
  formatTopStories,
} from "./hacker-client.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const client = new HackerNewsClient();

const server = new McpServer(
  {
    name: "Hacker News",
    version: "1.0.0",
  },
  {
    capabilities: {
      logging: {},
    },
  }
);

server.tool("list-top-stories", {}, async () => {
  const topStories = await client.listTopStories();
  const formattedTopStories = formatTopStories(topStories);
  return {
    content: [{ type: "text", text: formattedTopStories }],
  };
});

server.tool("story-details", { id: z.number() }, async ({ id }) => {
  const story = await client.getStoryDetails(id);
  const formattedStory = formatStoryDetail(story);
  return {
    content: [{ type: "text", text: formattedStory }],
  };
});

const transport = new StdioServerTransport();
await server.connect(transport);
