const API_URL = "http://localhost:5000/v1";

// Load planets and return as JSON.
async function httpGetPlanets() {
  const response = await fetch(`${API_URL}/planets`);
  return await response.json();
}

// Load launches, sort by flight number, and return as JSON.
async function httpGetLaunches() {
  const response = await fetch(`${API_URL}/launches`);
  // Keep server ordering (server now returns upcoming first). Do not
  // re-sort on the client so the `upcoming` / `history` split remains
  // consistent with server-side ordering.
  return await response.json();
}

// Submit given launch data to launch system.
async function httpSubmitLaunch(launch) {
  try {
    const response = await fetch(`${API_URL}/launches`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(launch),
    });

    // Try to parse JSON body (error or success) so the client can show
    // validation errors returned by the server.
    let body = null;
    try {
      body = await response.json();
    } catch (e) {
      // ignore parse errors
    }

    return { ok: response.ok, status: response.status, body };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      body: { error: "Network error" },
    };
  }
}

// Delete launch with given ID.
async function httpAbortLaunch(id) {
  try {
    const response = await fetch(`${API_URL}/launches/${id}`, {
      method: "delete",
    });
    let body = null;
    try {
      body = await response.json();
    } catch (e) {
      // ignore
    }
    return { ok: response.ok, status: response.status, body };
  } catch (err) {
    console.log(err);
    return { ok: false, status: 0, body: { error: "Network error" } };
  }
}

export { httpGetPlanets, httpGetLaunches, httpSubmitLaunch, httpAbortLaunch };
