import { NextRequest, NextResponse } from "next/server";
import { WebClient } from "@slack/web-api";

import getUser from "@/lib/getUser";
import {
  cacheItem,
  getCachedItem,
  hasCachedItem,
} from "@/lib/simpleMemoryCache";

import getChannels from "./getChannels";

export const GET = async (req: NextRequest) => {
  const user = await getUser(req);
  if (user instanceof NextResponse) return user;

  const key = `channels_${user.id}`;
  let channels: { slackId?: string; name?: string }[] = [];
  if (hasCachedItem(key)) channels = getCachedItem(key);
  else {
    const client = new WebClient(user.workspace.botToken);
    channels = await getChannels(client);
    cacheItem(key, channels, 60 * 60);
  }

  return NextResponse.json(
    {
      key,
      channels,
    },
    { status: 200 },
  );
};
