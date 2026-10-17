const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
});
const makeId = p => `${p}-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
const parseJson = (v, fallback = []) => { try { return v ? JSON.parse(v) : fallback; } catch { return fallback; } };
async function all(db, sql) { return (await db.prepare(sql).all()).results || []; }

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null, { status: 204 });
    try {
      if (url.pathname === "/api/health" && request.method === "GET") return json({ ok: true, service: "SureBox Staff" });

      if (url.pathname === "/api/data" && request.method === "GET") {
        const staffRows = await all(env.DB, "SELECT * FROM staff ORDER BY name COLLATE NOCASE");
        const reports = await all(env.DB, "SELECT * FROM reports ORDER BY created_at DESC");
        const news = await all(env.DB, "SELECT * FROM news ORDER BY created_at DESC");
        const vacations = await all(env.DB, "SELECT * FROM vacations ORDER BY created_at DESC");
        const promotions = await all(env.DB, "SELECT * FROM promotions ORDER BY created_at DESC");
        const tasks = await all(env.DB, "SELECT * FROM tasks ORDER BY created_at DESC");
        const notifications = await all(env.DB, "SELECT * FROM notifications ORDER BY created_at DESC");
        const settingsRows = await all(env.DB, "SELECT * FROM settings");
        const settings = {};
        for (const r of settingsRows) settings[r.key] = parseJson(r.value, r.value);
        const staff = staffRows.map(s => ({
          ...s, lifetimeTotal: s.lifetime_total, warnReason: s.warn_reason,
          warnRequired: s.warn_required, warnProgress: s.warn_progress, warnWorkType: s.warn_work_type,
          profilePoints: s.profile_points, profileFrame: s.profile_frame, profileTitle: s.profile_title,
          profileArtifact: s.profile_artifact, bannerUrl: s.banner_url, createdAt: s.created_at,
          warnHistory: parseJson(s.warn_history), roleHistory: parseJson(s.role_history),
          shopInventory: parseJson(s.shop_inventory), customBadges: parseJson(s.custom_badges),
          hiddenAchievements: parseJson(s.hidden_achievements)
        }));
        return json({
          staff, reports, news, vacations, promotions, tasks, notifications,
          weekArchives: await all(env.DB, "SELECT * FROM week_archives ORDER BY created_at DESC"),
          antiAbuseFlags: await all(env.DB, "SELECT * FROM anti_abuse_flags ORDER BY created_at DESC"),
          weeklyTopAwards: await all(env.DB, "SELECT * FROM weekly_top_awards ORDER BY created_at DESC"),
          logs: await all(env.DB, "SELECT * FROM logs ORDER BY created_at DESC"),
          messages: await all(env.DB, "SELECT * FROM messages ORDER BY created_at DESC"),
          hallOfFame: await all(env.DB, "SELECT * FROM hall_of_fame ORDER BY created_at DESC"),
          academyProgress: await all(env.DB, "SELECT * FROM academy_progress ORDER BY created_at DESC"),
          salaries: settings.salaries || {"Хелпер":300,"Ст. Хелпер":400,"Мл. Модератор":500,"Модератор":600,"Ст. Модератор":700},
          norms: settings.norms || {helperMutes:50,modMutes:55,modBans:15}
        });
      }

      if (url.pathname === "/api/reports" && request.method === "POST") {
        const b = await request.json();
        if (!b.target || !b.cmd || !b.reason) return json({ error: "Укажите цель, тип наказания и причину" }, 400);
        const reportId = makeId("rep"), createdAt = Date.now();
        await env.DB.prepare("INSERT INTO reports (id,author,target,cmd,duration,reason,img,time,created_at) VALUES (?,?,?,?,?,?,?,?,?)")
          .bind(reportId,b.author || null,String(b.target),String(b.cmd),b.duration || null,String(b.reason),b.img || null,b.time || new Date().toISOString(),createdAt).run();
        if (b.author) {
          const column = b.cmd === "tempmute" ? "mutes" : "bans";
          await env.DB.prepare(`UPDATE staff SET ${column}=${column}+1,total=total+1,lifetime_total=lifetime_total+1 WHERE name=?`).bind(b.author).run();
        }
        return json({ success: true, id: reportId }, 201);
      }

      if (url.pathname === "/api/sync" && request.method === "POST") {
        // IMPORTANT: protect this endpoint with authentication before public production use.
        const data = await request.json();
        for (const key of ["norms","salaries"]) if (data[key]) {
          await env.DB.prepare("INSERT OR REPLACE INTO settings(key,value) VALUES(?,?)").bind(key,JSON.stringify(data[key])).run();
        }
        if (Array.isArray(data.staff)) for (const s of data.staff) {
          if (!s.name) continue;
          await env.DB.prepare(`INSERT INTO staff
          (id,name,pass,role,mutes,bans,total,lifetime_total,warns,warn_reason,warn_required,warn_progress,warn_work_type,suriki,profile_points,profile_frame,profile_title,profile_artifact,avatar,banner_url,created_at,warn_history,role_history,shop_inventory,custom_badges,hidden_achievements)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
          ON CONFLICT(id) DO UPDATE SET name=excluded.name,pass=excluded.pass,role=excluded.role,mutes=excluded.mutes,bans=excluded.bans,total=excluded.total,lifetime_total=excluded.lifetime_total,warns=excluded.warns,warn_reason=excluded.warn_reason,warn_required=excluded.warn_required,warn_progress=excluded.warn_progress,warn_work_type=excluded.warn_work_type,suriki=excluded.suriki,profile_points=excluded.profile_points,profile_frame=excluded.profile_frame,profile_title=excluded.profile_title,profile_artifact=excluded.profile_artifact,avatar=excluded.avatar,banner_url=excluded.banner_url,warn_history=excluded.warn_history,role_history=excluded.role_history,shop_inventory=excluded.shop_inventory,custom_badges=excluded.custom_badges,hidden_achievements=excluded.hidden_achievements`)
          .bind(s.id || makeId("st"),s.name,s.pass || null,s.role || "Хелпер",s.mutes || 0,s.bans || 0,s.total || 0,s.lifetime_total || s.lifetimeTotal || 0,s.warns || 0,s.warnReason || null,s.warnRequired || 0,s.warnProgress || 0,s.warnWorkType || "mutes",s.suriki || 0,s.profilePoints || 0,s.profileFrame || "none",s.profileTitle || null,s.profileArtifact || null,s.avatar || null,s.bannerUrl || null,s.createdAt || Date.now(),JSON.stringify(s.warnHistory || []),JSON.stringify(s.roleHistory || []),JSON.stringify(s.shopInventory || []),JSON.stringify(s.customBadges || []),JSON.stringify(s.hiddenAchievements || [])).run();
        }
        return json({ success: true });
      }
      return json({ error: "Not Found" }, 404);
    } catch (e) {
      return json({ error: e?.message || "Internal server error" }, 500);
    }
  }
};
