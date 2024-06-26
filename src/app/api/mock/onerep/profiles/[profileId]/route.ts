/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {
  MOCK_ONEREP_TIME,
  MOCK_ONEREP_FIRSTNAME,
  MOCK_ONEREP_LASTNAME,
  MOCK_ONEREP_BIRTHDATE,
  MOCK_ONEREP_ADDRESSES,
} from "../../config/config.ts";
import { ShowProfileResponse } from "../../../../../functions/server/onerep.ts";
import { NextRequest, NextResponse } from "next/server";

// Mocked profile data to simulate response
//TODO: mock out the URL

async function extractProfileId(req: NextRequest) {
  const idFromBody: number = req.body !== null && (await req.json()).profileId;
  if (idFromBody) return idFromBody;
  const idFromUrl: number = Number(req.url.match(/profiles\/([0-9]+)/)![1]);
  return idFromUrl;
}

// Mock endpoint to simulate fetching a profile by ID
export async function GET(req: NextRequest) {
  // Extract profileId from query parameters or request body
  const profileId: number = await extractProfileId(req);

  if (!profileId || isNaN(profileId)) {
    return NextResponse.json({ error: "Invalid profile ID" }, { status: 400 });
  }

  const mockProfileData: ShowProfileResponse = {
    id: profileId,
    first_name: MOCK_ONEREP_FIRSTNAME(),
    last_name: MOCK_ONEREP_LASTNAME(),
    birth_date: MOCK_ONEREP_BIRTHDATE(),
    addresses: MOCK_ONEREP_ADDRESSES(),
    status: "inactive",
    created_at: MOCK_ONEREP_TIME(),
    updated_at: MOCK_ONEREP_TIME(),
    url: `${process.env.ONEREP_API_BASE}/profiles/${profileId}`,
  };

  return NextResponse.json(mockProfileData);
}