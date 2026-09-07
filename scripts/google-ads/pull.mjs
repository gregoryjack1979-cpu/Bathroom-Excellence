#!/usr/bin/env node
/**
 * Pull lead and service-area data for the Bathroom Excellence Google Ads account.
 *
 *   npm run ads:pull -- accounts        # which accounts can this login reach?
 *   npm run ads:pull -- campaigns       # campaign list + last-30-day performance
 *   npm run ads:pull -- leads           # conversions, lead-form submissions, calls, LSA leads
 *   npm run ads:pull -- service-area    # location targets + performance by city/ZIP
 *   npm run ads:pull -- all
 *
 * Options
 *   --customer 123-456-7890   account to report on (default GOOGLE_ADS_CUSTOMER_ID)
 *   --days 30                 reporting window ending today (default 30)
 *   --by city|postal_code     geo-performance granularity (default city)
 *   --out exports/google-ads  export directory (default exports/google-ads)
 *   --format csv|json|both    export format (default both)
 *   --redact                  mask names / phone numbers / emails in lead exports
 *   --limit 15                rows to print per table (default 15)
 *
 * Exports land in <out>/<customer-id>/<YYYY-MM-DD>/<dataset>.{csv,json}.
 * Setup: docs/google-ads-api.md
 */
import path from "node:path";
import {
  loadEnv,
  getConfig,
  createClient,
  isQueryShapeError,
  parseArgs,
  reportError,
  pick,
  microsToUnits,
  round,
  resourceId,
  dateClause,
  dateRange,
  isoDate,
  writeDataset,
  printTable,
  formatCustomerId,
  normalizeCustomerId,
} from "./lib.mjs";

const args = parseArgs(process.argv.slice(2));
const command = args._[0] ?? "help";

if (command === "help" || args.help) {
  console.log(`Usage: node scripts/google-ads/pull.mjs <accounts|campaigns|leads|service-area|all> [options]

  --customer <id>       Google Ads customer ID to report on (default: GOOGLE_ADS_CUSTOMER_ID)
  --days <n>            Reporting window in days, ending today (default: 30)
  --by city|postal_code Granularity for geo performance (default: city)
  --out <dir>           Export directory (default: exports/google-ads)
  --format csv|json|both
  --redact              Mask contact details in lead exports
  --limit <n>           Rows to print per table (default: 15)
`);
  process.exit(0);
}

loadEnv();

const DAYS = Math.max(1, parseInt(args.days ?? "30", 10) || 30);
const FORMAT = ["csv", "json", "both"].includes(args.format) ? args.format : "both";
const LIMIT = parseInt(args.limit ?? "15", 10) || 15;
const OUT_ROOT = path.resolve(args.out ?? "exports/google-ads");
const BY_POSTAL = String(args.by ?? "city").toLowerCase().replace(/-/g, "_") === "postal_code";
const REDACT = Boolean(args.redact);

const LEAD_CATEGORIES = new Set([
  "SUBMIT_LEAD_FORM", "PHONE_CALL_LEAD", "IMPORTED_LEAD", "BOOK_APPOINTMENT", "REQUEST_QUOTE",
  "CONTACT", "QUALIFIED_LEAD", "CONVERTED_LEAD", "SIGNUP",
]);

const PII_FIELDS = new Set(["FULL_NAME", "FIRST_NAME", "LAST_NAME", "EMAIL", "WORK_EMAIL", "PHONE_NUMBER", "WORK_PHONE", "STREET_ADDRESS"]);

/** Localities from config/site.ts (kept in sync by hand — this script runs without the TS build). */
const SERVICE_AREA_LOCALITIES = ["st. charles", "st charles", "saint charles", "st. peters", "st peters", "saint peters", "o'fallon", "ofallon", "cottleville", "chesterfield", "st. louis", "st louis", "saint louis"];

try {
  const cfg = getConfig({ required: ["developerToken", "clientId", "clientSecret", "refreshToken"] });
  const client = createClient(cfg);

  if (command === "accounts") {
    await accounts(client, cfg);
  } else {
    const customerId = normalizeCustomerId(args.customer ?? cfg.customerId);
    if (!customerId) {
      throw new Error(
        "No customer ID. Set GOOGLE_ADS_CUSTOMER_ID or pass --customer 123-456-7890.\nRun `npm run ads:pull -- accounts` to see the IDs this login can reach.",
      );
    }
    const ctx = await describeAccount(client, customerId);
    const outDir = path.join(OUT_ROOT, customerId, isoDate(new Date()));
    const { start, end } = dateRange(DAYS);
    console.log(
      `\nAccount ${formatCustomerId(customerId)} — ${ctx.name} (${ctx.currency}, ${ctx.timeZone}${ctx.testAccount ? ", TEST ACCOUNT" : ""})`,
    );
    console.log(`Window ${start} → ${end} (${DAYS} days). Exports → ${path.relative(process.cwd(), outDir)}\n`);

    const run = { campaigns, leads, "service-area": serviceArea };
    const commands = command === "all" ? Object.keys(run) : [command];
    if (!commands.every((c) => run[c])) throw new Error(`Unknown command "${command}". Try --help.`);
    for (const name of commands) await run[name](client, customerId, ctx, outDir);
  }
} catch (err) {
  reportError(err);
  process.exit(1);
}

/* ────────────────────────────────── accounts ─────────────────────────────── */

async function accounts(client, cfg) {
  const ids = await client.listAccessibleCustomers();
  console.log(`\nThe authorised Google account can directly access ${ids.length} customer(s):\n`);
  const rows = [];
  for (const id of ids) {
    try {
      const [row] = await client.search(id, `
        SELECT customer.id, customer.descriptive_name, customer.currency_code, customer.time_zone,
               customer.manager, customer.test_account, customer.status
        FROM customer`);
      rows.push({
        customerId: formatCustomerId(id),
        name: pick(row, "customer.descriptiveName", ""),
        type: pick(row, "customer.manager") ? "manager" : "client",
        test: pick(row, "customer.testAccount") ? "yes" : "",
        status: pick(row, "customer.status", ""),
        currency: pick(row, "customer.currencyCode", ""),
        timeZone: pick(row, "customer.timeZone", ""),
      });
    } catch (err) {
      rows.push({ customerId: formatCustomerId(id), name: `(not readable: ${err.errors?.[0]?.code ?? err.message.split("\n")[0]})` });
    }
  }
  printTable(rows, ["customerId", "name", "type", "test", "status", "currency", "timeZone"], { limit: 100 });

  // Manager accounts: list every client under them so the right GOOGLE_ADS_CUSTOMER_ID is easy to find.
  for (const m of rows.filter((r) => r.type === "manager")) {
    const managerId = normalizeCustomerId(m.customerId);
    const clientRows = await client.search(managerId, `
      SELECT customer_client.client_customer, customer_client.descriptive_name, customer_client.level,
             customer_client.manager, customer_client.test_account, customer_client.status, customer_client.currency_code
      FROM customer_client
      WHERE customer_client.status != 'CLOSED'
      ORDER BY customer_client.level, customer_client.descriptive_name`).catch((err) => {
      console.log(`\n  (could not list clients of manager ${m.customerId}: ${err.errors?.[0]?.code ?? err.message.split("\n")[0]})`);
      return [];
    });
    if (!clientRows.length) continue;
    console.log(`\nAccounts under manager ${m.customerId} (${m.name}):\n`);
    printTable(
      clientRows.map((r) => ({
        customerId: formatCustomerId(resourceId(pick(r, "customerClient.clientCustomer"))),
        name: pick(r, "customerClient.descriptiveName", ""),
        level: pick(r, "customerClient.level", 0),
        type: pick(r, "customerClient.manager") ? "manager" : "client",
        test: pick(r, "customerClient.testAccount") ? "yes" : "",
        status: pick(r, "customerClient.status", ""),
        currency: pick(r, "customerClient.currencyCode", ""),
      })),
      ["customerId", "name", "level", "type", "test", "status", "currency"],
      { limit: 500 },
    );
    console.log(`\n  → Use GOOGLE_ADS_LOGIN_CUSTOMER_ID=${normalizeCustomerId(m.customerId)} with GOOGLE_ADS_CUSTOMER_ID=<client id above>.`);
  }
  console.log();
}

async function describeAccount(client, customerId) {
  const [row] = await client.search(customerId, `
    SELECT customer.id, customer.descriptive_name, customer.currency_code, customer.time_zone, customer.test_account
    FROM customer`);
  return {
    name: pick(row, "customer.descriptiveName", "(unnamed)"),
    currency: pick(row, "customer.currencyCode", "USD"),
    timeZone: pick(row, "customer.timeZone", ""),
    testAccount: Boolean(pick(row, "customer.testAccount")),
  };
}

async function campaignMap(client, customerId) {
  const rows = await client.search(customerId, `
    SELECT campaign.id, campaign.name, campaign.status, campaign.advertising_channel_type
    FROM campaign`);
  return new Map(rows.map((r) => [String(pick(r, "campaign.id")), pick(r, "campaign.name", "")]));
}

/* ───────────────────────────────── campaigns ─────────────────────────────── */

async function campaigns(client, customerId, ctx, outDir) {
  section("Campaigns");
  const rows = await client.search(customerId, `
    SELECT campaign.id, campaign.name, campaign.status, campaign.advertising_channel_type,
           campaign.geo_target_type_setting.positive_geo_target_type,
           metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions,
           metrics.all_conversions, metrics.conversions_value, metrics.phone_calls
    FROM campaign
    WHERE ${dateClause(DAYS)} AND campaign.status != 'REMOVED'
    ORDER BY metrics.cost_micros DESC`);
  const data = rows.map((r) => ({
    campaignId: pick(r, "campaign.id"),
    campaign: pick(r, "campaign.name"),
    status: pick(r, "campaign.status"),
    channel: pick(r, "campaign.advertisingChannelType"),
    locationTargeting: pick(r, "campaign.geoTargetTypeSetting.positiveGeoTargetType"),
    impressions: Number(pick(r, "metrics.impressions", 0)),
    clicks: Number(pick(r, "metrics.clicks", 0)),
    cost: microsToUnits(pick(r, "metrics.costMicros")),
    conversions: round(pick(r, "metrics.conversions", 0)),
    allConversions: round(pick(r, "metrics.allConversions", 0)),
    conversionValue: round(pick(r, "metrics.conversionsValue", 0)),
    phoneCalls: Number(pick(r, "metrics.phoneCalls", 0)),
  }));
  for (const d of data) d.costPerLead = d.allConversions ? round(d.cost / d.allConversions) : "";
  printTable(data, ["campaign", "status", "channel", "impressions", "clicks", "cost", "allConversions", "costPerLead", "phoneCalls"], { limit: LIMIT });
  exported(writeDataset(outDir, "campaigns", data, FORMAT, ["campaignId", "campaign", "status", "channel", "locationTargeting", "impressions", "clicks", "cost", "conversions", "allConversions", "conversionValue", "phoneCalls", "costPerLead"]));
}

/* ─────────────────────────────────── leads ───────────────────────────────── */

async function leads(client, customerId, ctx, outDir) {
  const names = await campaignMap(client, customerId);

  /* 1 ── Conversion actions: how many leads each action (form, call, chat…) produced */
  section("Lead conversions by conversion action");
  const actionRows = await client.search(customerId, `
    SELECT conversion_action.id, conversion_action.name, conversion_action.category, conversion_action.type,
           conversion_action.status, conversion_action.primary_for_goal,
           metrics.all_conversions, metrics.conversions, metrics.conversions_value
    FROM conversion_action
    WHERE ${dateClause(DAYS)} AND conversion_action.status != 'REMOVED'
    ORDER BY metrics.all_conversions DESC`);
  const actions = actionRows.map((r) => ({
    conversionActionId: pick(r, "conversionAction.id"),
    conversionAction: pick(r, "conversionAction.name"),
    category: pick(r, "conversionAction.category"),
    type: pick(r, "conversionAction.type"),
    status: pick(r, "conversionAction.status"),
    primaryForGoal: Boolean(pick(r, "conversionAction.primaryForGoal")),
    allConversions: round(pick(r, "metrics.allConversions", 0)),
    conversions: round(pick(r, "metrics.conversions", 0)),
    conversionValue: round(pick(r, "metrics.conversionsValue", 0)),
    isLeadCategory: LEAD_CATEGORIES.has(pick(r, "conversionAction.category")),
  }));
  printTable(actions, ["conversionAction", "category", "type", "status", "allConversions", "conversionValue"], { limit: LIMIT });
  exported(writeDataset(outDir, "lead-conversions-by-action", actions, FORMAT, ["conversionActionId", "conversionAction", "category", "type", "status", "primaryForGoal", "allConversions", "conversions", "conversionValue", "isLeadCategory"]));

  /* 2 ── Same thing split by campaign, so you can see which campaign the leads came from */
  section("Lead conversions by campaign");
  const byCampaignRows = await client.search(customerId, `
    SELECT campaign.id, campaign.name, segments.conversion_action_name, segments.conversion_action_category,
           metrics.all_conversions, metrics.conversions_value
    FROM campaign
    WHERE ${dateClause(DAYS)} AND metrics.all_conversions > 0
    ORDER BY metrics.all_conversions DESC`);
  const byCampaign = byCampaignRows.map((r) => ({
    campaignId: pick(r, "campaign.id"),
    campaign: pick(r, "campaign.name"),
    conversionAction: pick(r, "segments.conversionActionName"),
    category: pick(r, "segments.conversionActionCategory"),
    allConversions: round(pick(r, "metrics.allConversions", 0)),
    conversionValue: round(pick(r, "metrics.conversionsValue", 0)),
  }));
  printTable(byCampaign, ["campaign", "conversionAction", "category", "allConversions"], { limit: LIMIT });
  exported(writeDataset(outDir, "lead-conversions-by-campaign", byCampaign, FORMAT, ["campaignId", "campaign", "conversionAction", "category", "allConversions", "conversionValue"]));

  /* 3 ── Lead form asset submissions (the actual names / phones / answers) */
  section("Lead form submissions (Google lead form assets)");
  const { start } = dateRange(DAYS);
  const submissionRows = await client.search(customerId, `
    SELECT lead_form_submission_data.id, lead_form_submission_data.submission_date_time,
           lead_form_submission_data.campaign, lead_form_submission_data.ad_group,
           lead_form_submission_data.ad_group_ad, lead_form_submission_data.asset, lead_form_submission_data.gclid,
           lead_form_submission_data.lead_form_submission_fields,
           lead_form_submission_data.custom_lead_form_submission_fields
    FROM lead_form_submission_data
    ORDER BY lead_form_submission_data.submission_date_time DESC`).catch(skip("lead form submissions"));
  const submissions = submissionRows
    .filter((r) => String(pick(r, "leadFormSubmissionData.submissionDateTime", "")).slice(0, 10) >= start)
    .map((r) => {
      const out = {
        submissionId: pick(r, "leadFormSubmissionData.id"),
        submittedAt: pick(r, "leadFormSubmissionData.submissionDateTime"),
        campaign: names.get(resourceId(pick(r, "leadFormSubmissionData.campaign"))) ?? pick(r, "leadFormSubmissionData.campaign"),
        adGroup: resourceId(pick(r, "leadFormSubmissionData.adGroup")),
        gclid: pick(r, "leadFormSubmissionData.gclid"),
      };
      for (const f of pick(r, "leadFormSubmissionData.leadFormSubmissionFields", [])) {
        out[f.fieldType ?? "FIELD"] = redactField(f.fieldType, f.fieldValue);
      }
      for (const f of pick(r, "leadFormSubmissionData.customLeadFormSubmissionFields", [])) {
        out[`Q: ${f.questionText}`] = f.fieldValue;
      }
      return out;
    });
  printTable(submissions, ["submittedAt", "campaign", "FULL_NAME", "PHONE_NUMBER", "EMAIL", "POSTAL_CODE", "CITY"], { limit: LIMIT });
  // Identity columns are fixed so the file has a header even with no rows; the
  // answered fields vary per lead, so they extend it in first-seen order.
  const submissionBase = ["submissionId", "submittedAt", "campaign", "adGroup", "gclid"];
  const submissionCols = [
    ...submissionBase,
    ...new Set(submissions.flatMap((r) => Object.keys(r)).filter((k) => !submissionBase.includes(k))),
  ];
  exported(writeDataset(outDir, "lead-form-submissions", submissions, FORMAT, submissionCols));

  /* 4 ── Phone calls from call assets / call-only ads (Google forwarding numbers) */
  section("Phone call leads (call reporting)");
  const callRows = await client.search(customerId, `
    SELECT call_view.start_call_date_time, call_view.end_call_date_time, call_view.call_duration_seconds,
           call_view.caller_area_code, call_view.caller_country_code, call_view.call_status, call_view.type,
           call_view.call_tracking_display_location, campaign.id, campaign.name, ad_group.name
    FROM call_view
    WHERE ${dateClause(DAYS)}
    ORDER BY call_view.start_call_date_time DESC`).catch(skip("call reporting"));
  const calls = callRows.map((r) => ({
    startedAt: pick(r, "callView.startCallDateTime"),
    endedAt: pick(r, "callView.endCallDateTime"),
    durationSeconds: Number(pick(r, "callView.callDurationSeconds", 0)),
    callerAreaCode: REDACT ? "***" : pick(r, "callView.callerAreaCode", ""),
    callerCountry: pick(r, "callView.callerCountryCode", ""),
    status: pick(r, "callView.callStatus"),
    callType: pick(r, "callView.type"),
    displayLocation: pick(r, "callView.callTrackingDisplayLocation"),
    campaign: pick(r, "campaign.name"),
    adGroup: pick(r, "adGroup.name"),
  }));
  printTable(calls, ["startedAt", "durationSeconds", "callerAreaCode", "status", "callType", "campaign"], { limit: LIMIT });
  exported(writeDataset(outDir, "phone-calls", calls, FORMAT, ["startedAt", "endedAt", "durationSeconds", "callerAreaCode", "callerCountry", "status", "callType", "displayLocation", "campaign", "adGroup"]));

  /* 5 ── Local Services Ads leads (only if the account runs LSA) */
  section("Local Services Ads leads");
  const lsaFields = `
    local_services_lead.id, local_services_lead.creation_date_time, local_services_lead.lead_type,
    local_services_lead.lead_status, local_services_lead.category_id, local_services_lead.service_id,
    local_services_lead.contact_details.consumer_name, local_services_lead.contact_details.phone_number,
    local_services_lead.lead_charged, local_services_lead.note.description, local_services_lead.locale`;
  const lsaRows = await client
    .search(customerId, `
      SELECT ${lsaFields}
      FROM local_services_lead
      WHERE local_services_lead.creation_date_time >= '${start} 00:00:00'
      ORDER BY local_services_lead.creation_date_time DESC`)
    .catch((err) => {
      // Not every API version lets creation_date_time be filtered or sorted on.
      // Pull the resource plainly instead and narrow the window below.
      if (!isQueryShapeError(err)) throw err;
      console.log("  (creation_date_time is not filterable here — pulling unfiltered and narrowing locally)");
      return client.search(customerId, `SELECT ${lsaFields} FROM local_services_lead`);
    })
    .catch(skip("Local Services Ads leads (account may not run LSA)"));
  // Always narrow and sort client-side, so both query paths yield the same window.
  const lsa = lsaRows
    .filter((r) => String(pick(r, "localServicesLead.creationDateTime", "")).slice(0, 10) >= start)
    .sort((a, b) =>
      String(pick(b, "localServicesLead.creationDateTime", "")).localeCompare(
        String(pick(a, "localServicesLead.creationDateTime", "")),
      ),
    )
    .map((r) => ({
    leadId: pick(r, "localServicesLead.id"),
    createdAt: pick(r, "localServicesLead.creationDateTime"),
    leadType: pick(r, "localServicesLead.leadType"),
    status: pick(r, "localServicesLead.leadStatus"),
    category: pick(r, "localServicesLead.categoryId"),
    service: pick(r, "localServicesLead.serviceId"),
    consumerName: redactField("FULL_NAME", pick(r, "localServicesLead.contactDetails.consumerName", "")),
    phone: redactField("PHONE_NUMBER", pick(r, "localServicesLead.contactDetails.phoneNumber", "")),
    charged: Boolean(pick(r, "localServicesLead.leadCharged")),
    note: pick(r, "localServicesLead.note.description", ""),
  }));
  printTable(lsa, ["createdAt", "leadType", "status", "category", "consumerName", "phone", "charged"], { limit: LIMIT });
  exported(writeDataset(outDir, "local-services-leads", lsa, FORMAT, ["leadId", "createdAt", "leadType", "status", "category", "service", "consumerName", "phone", "charged", "note"]));

  /* 6 ── One-line summary */
  const totalLeads = round(actions.filter((a) => a.isLeadCategory).reduce((s, a) => s + a.allConversions, 0));
  console.log(`\nSummary (${DAYS}d): ${totalLeads} lead-category conversions · ${submissions.length} lead-form submissions · ${calls.length} tracked calls · ${lsa.length} LSA leads\n`);
}

function redactField(type, value) {
  if (!REDACT || value == null || value === "" || !PII_FIELDS.has(type)) return value;
  const s = String(value);
  return s.length <= 4 ? "****" : `${s.slice(0, 2)}${"*".repeat(Math.max(2, s.length - 4))}${s.slice(-2)}`;
}

/* ─────────────────────────────── service area ────────────────────────────── */

async function serviceArea(client, customerId, ctx, outDir) {
  /* 1 ── Where each campaign is targeted (cities / ZIPs / radius around the shop) */
  section("Location targets per campaign");
  const criteriaRows = await client.search(customerId, `
    SELECT campaign.id, campaign.name, campaign.status,
           campaign.geo_target_type_setting.positive_geo_target_type,
           campaign.geo_target_type_setting.negative_geo_target_type,
           campaign_criterion.criterion_id, campaign_criterion.type, campaign_criterion.negative,
           campaign_criterion.bid_modifier,
           campaign_criterion.location.geo_target_constant,
           campaign_criterion.proximity.radius, campaign_criterion.proximity.radius_units,
           campaign_criterion.proximity.address.street_address, campaign_criterion.proximity.address.city_name,
           campaign_criterion.proximity.address.province_code, campaign_criterion.proximity.address.postal_code,
           campaign_criterion.proximity.geo_point.latitude_in_micro_degrees,
           campaign_criterion.proximity.geo_point.longitude_in_micro_degrees
    FROM campaign_criterion
    WHERE campaign_criterion.type IN ('LOCATION', 'PROXIMITY') AND campaign.status != 'REMOVED'
    ORDER BY campaign.name`);

  const geoIds = new Set(
    criteriaRows.map((r) => resourceId(pick(r, "campaignCriterion.location.geoTargetConstant"))).filter(Boolean),
  );
  const geo = await geoTargetLookup(client, customerId, geoIds);

  const targets = criteriaRows.map((r) => {
    const type = pick(r, "campaignCriterion.type");
    const g = geo.get(resourceId(pick(r, "campaignCriterion.location.geoTargetConstant")));
    const lat = pick(r, "campaignCriterion.proximity.geoPoint.latitudeInMicroDegrees");
    const lng = pick(r, "campaignCriterion.proximity.geoPoint.longitudeInMicroDegrees");
    return {
      campaignId: pick(r, "campaign.id"),
      campaign: pick(r, "campaign.name"),
      campaignStatus: pick(r, "campaign.status"),
      targetingMode: pick(r, "campaign.geoTargetTypeSetting.positiveGeoTargetType"),
      exclude: Boolean(pick(r, "campaignCriterion.negative")),
      type,
      location:
        type === "PROXIMITY"
          ? `${pick(r, "campaignCriterion.proximity.radius")} ${String(pick(r, "campaignCriterion.proximity.radiusUnits", "")).toLowerCase()} around ${
              [
                pick(r, "campaignCriterion.proximity.address.streetAddress"),
                pick(r, "campaignCriterion.proximity.address.cityName"),
                pick(r, "campaignCriterion.proximity.address.provinceCode"),
                pick(r, "campaignCriterion.proximity.address.postalCode"),
              ].filter(Boolean).join(", ") || (lat != null ? `${lat / 1e6}, ${lng / 1e6}` : "point")
            }`
          : g?.canonicalName ?? g?.name ?? `geoTargetConstants/${resourceId(pick(r, "campaignCriterion.location.geoTargetConstant"))}`,
      locationType: type === "PROXIMITY" ? "Radius" : g?.targetType ?? "",
      geoTargetId: type === "LOCATION" ? resourceId(pick(r, "campaignCriterion.location.geoTargetConstant")) : "",
      bidModifier: pick(r, "campaignCriterion.bidModifier", ""),
    };
  });
  printTable(targets, ["campaign", "exclude", "location", "locationType", "targetingMode", "bidModifier"], { limit: LIMIT });
  exported(writeDataset(outDir, "location-targets", targets, FORMAT, ["campaignId", "campaign", "campaignStatus", "targetingMode", "exclude", "type", "location", "locationType", "geoTargetId", "bidModifier"]));

  /* 2 ── Where the clicks / leads actually came from */
  const granularity = BY_POSTAL ? "ZIP code" : "city";
  const key = BY_POSTAL ? "postalCode" : "city";
  section(`Performance by ${granularity} (where searchers were, or what area they searched for)`);
  const segment = BY_POSTAL ? "segments.geo_target_postal_code" : "segments.geo_target_city";
  const perfRows = await client.search(customerId, `
    SELECT campaign.id, campaign.name, geographic_view.location_type, geographic_view.country_criterion_id,
           segments.geo_target_region, ${segment},
           metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions,
           metrics.all_conversions, metrics.conversions_value, metrics.phone_calls
    FROM geographic_view
    WHERE ${dateClause(DAYS)}
    ORDER BY metrics.all_conversions DESC, metrics.clicks DESC`);

  const perfGeoIds = new Set();
  for (const r of perfRows) {
    perfGeoIds.add(resourceId(pick(r, "segments.geoTargetRegion")));
    perfGeoIds.add(resourceId(pick(r, BY_POSTAL ? "segments.geoTargetPostalCode" : "segments.geoTargetCity")));
  }
  perfGeoIds.delete("");
  for (const id of perfGeoIds) if (!geo.has(id)) perfGeoIds.add(id);
  const perfGeo = await geoTargetLookup(client, customerId, [...perfGeoIds].filter((id) => !geo.has(id)));
  for (const [k, v] of perfGeo) geo.set(k, v);

  const perf = perfRows.map((r) => {
    const locId = resourceId(pick(r, BY_POSTAL ? "segments.geoTargetPostalCode" : "segments.geoTargetCity"));
    const regionId = resourceId(pick(r, "segments.geoTargetRegion"));
    return {
      campaignId: pick(r, "campaign.id"),
      campaign: pick(r, "campaign.name"),
      [BY_POSTAL ? "postalCode" : "city"]: geo.get(locId)?.name ?? (locId ? `#${locId}` : "(unknown)"),
      region: geo.get(regionId)?.name ?? (regionId ? `#${regionId}` : ""),
      locationType: pick(r, "geographicView.locationType"), // LOCATION_OF_PRESENCE = physically there; AREA_OF_INTEREST = searched for it
      geoTargetId: locId,
      impressions: Number(pick(r, "metrics.impressions", 0)),
      clicks: Number(pick(r, "metrics.clicks", 0)),
      cost: microsToUnits(pick(r, "metrics.costMicros")),
      conversions: round(pick(r, "metrics.conversions", 0)),
      allConversions: round(pick(r, "metrics.allConversions", 0)),
      conversionValue: round(pick(r, "metrics.conversionsValue", 0)),
      phoneCalls: Number(pick(r, "metrics.phoneCalls", 0)),
    };
  });
  exported(writeDataset(outDir, `geo-performance-by-${BY_POSTAL ? "postal-code" : "city"}`, perf, FORMAT, ["campaignId", "campaign", key, "region", "locationType", "geoTargetId", "impressions", "clicks", "cost", "conversions", "allConversions", "conversionValue", "phoneCalls"]));

  /* 3 ── Roll-up across campaigns: the service-area leaderboard */
  const summary = new Map();
  for (const p of perf) {
    const id = `${p[key]}|${p.region}`;
    const s = summary.get(id) ?? { [key]: p[key], region: p.region, geoTargetId: p.geoTargetId, impressions: 0, clicks: 0, cost: 0, allConversions: 0, conversionValue: 0, phoneCalls: 0 };
    s.impressions += p.impressions;
    s.clicks += p.clicks;
    s.cost += p.cost;
    s.allConversions += p.allConversions;
    s.conversionValue += p.conversionValue;
    s.phoneCalls += p.phoneCalls;
    summary.set(id, s);
  }
  const leaderboard = [...summary.values()]
    .map((s) => ({
      ...s,
      cost: round(s.cost),
      allConversions: round(s.allConversions),
      conversionValue: round(s.conversionValue),
      costPerLead: s.allConversions ? round(s.cost / s.allConversions) : "",
      inServiceArea: SERVICE_AREA_LOCALITIES.some((l) => String(s[key]).toLowerCase().includes(l)),
    }))
    .sort((a, b) => b.allConversions - a.allConversions || b.clicks - a.clicks);
  printTable(leaderboard, [key, "region", "impressions", "clicks", "cost", "allConversions", "costPerLead", "phoneCalls"], { limit: LIMIT });
  exported(writeDataset(outDir, `service-area-summary-by-${BY_POSTAL ? "postal-code" : "city"}`, leaderboard, FORMAT, [key, "region", "geoTargetId", "impressions", "clicks", "cost", "allConversions", "conversionValue", "phoneCalls", "costPerLead", "inServiceArea"]));

  const outside = leaderboard.filter((l) => !l.inServiceArea && l.cost > 0);
  if (!BY_POSTAL && outside.length) {
    const wasted = round(outside.reduce((s, l) => s + l.cost, 0));
    console.log(`\n  ${outside.length} ${granularity}(s) with spend fall outside the configured service area (config/site.ts) — ${ctx.currency} ${wasted} in the window. Review "location-targets" above.`);
  }
  console.log();
}

async function geoTargetLookup(client, customerId, ids) {
  const map = new Map();
  const list = [...ids].filter(Boolean);
  for (let i = 0; i < list.length; i += 500) {
    const chunk = list.slice(i, i + 500);
    const rows = await client.search(customerId, `
      SELECT geo_target_constant.id, geo_target_constant.name, geo_target_constant.canonical_name,
             geo_target_constant.target_type, geo_target_constant.country_code
      FROM geo_target_constant
      WHERE geo_target_constant.id IN (${chunk.join(", ")})`).catch(skip("geo target name lookup"));
    for (const r of rows) {
      map.set(String(pick(r, "geoTargetConstant.id")), {
        name: pick(r, "geoTargetConstant.name"),
        canonicalName: pick(r, "geoTargetConstant.canonicalName"),
        targetType: pick(r, "geoTargetConstant.targetType"),
        countryCode: pick(r, "geoTargetConstant.countryCode"),
      });
    }
  }
  return map;
}

/* ───────────────────────────────── helpers ───────────────────────────────── */

function section(title) {
  console.log(`\n▸ ${title}`);
}

function exported(paths) {
  console.log(`  ↳ ${paths.map((p) => path.relative(process.cwd(), p)).join(", ")}`);
}

/** Turn an API error for an optional dataset into an empty result plus a note. */
function skip(what) {
  return (err) => {
    const first = err.errors?.[0];
    console.log(`  (skipped ${what}: ${first ? `${first.code} — ${first.message}` : err.message.split("\n").slice(-1)[0]})`);
    return [];
  };
}

