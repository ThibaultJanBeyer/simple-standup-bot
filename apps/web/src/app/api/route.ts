import { parse } from "url";
import { NextRequest, NextResponse } from "next/server";
import { WebClient } from "@slack/web-api";

import { sql } from "@ssb/orm";

import { db, Users, Workspaces } from "@/lib/orm";

export const GET = async (req: NextRequest) => {
  try {
    const { query } = parse(req.url || "", true);
    const code = query.code as string;
    const state = query.state as string; // for XSRF

    // Slack OAuth
    const response = await fetch("https://slack.com/api/oauth.v2.access", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.SLACK_CLIENT_ID!,
        client_secret: process.env.SLACK_CLIENT_SECRET!,
        redirect_uri: process.env.SLACK_REDIRECT_URI!,
      }),
    });

    const data = await response.json();

    if (!data.ok) {
      console.error(data);
      throw new Error("Error connecting to Slack");
    }

    const { access_token, team } = data;

    // Workspace
    await db
      .insert(Workspaces)
      .values({
        workspaceId: team.id,
        botToken: access_token,
      })
      .onConflictDoUpdate({
        target: Workspaces.workspaceId,
        set: { botToken: access_token },
      })
      .execute();

    // Users from Workspace
    const client = new WebClient(access_token);
    const userList = await client.users.list();
    if (!userList.ok) {
      console.error(userList);
      return NextResponse.error();
    }
    if (userList?.members?.length) {
      const members = userList.members.flatMap((member) => {
        if (member.is_bot || member.name === "slackbot") return [];
        return [
          {
            slackId: member.id || "",
            slackName: member.name || "",
            workspaceId: team.id,
          },
        ];
      });
      await db
        .insert(Users)
        .values(members)
        .onConflictDoUpdate({
          target: Users.slackId,
          set: {
            slackName: sql`EXCLUDED.slack_name`,
            workspaceId: team.id,
          },
        })
        .execute();
    }

    const url = req.nextUrl.clone();
    return NextResponse.redirect(url.origin);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};
