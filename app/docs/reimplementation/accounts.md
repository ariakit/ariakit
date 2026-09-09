# Accounts, teams, checkout, and administration

## Scope and source

This document records behavior from the removed application. Use it as input for a later implementation with Better Auth. It does not require the old page layout, Astro Actions interface, Clerk components, or Clerk metadata design.

The source snapshot is [`73d5c8645`](https://github.com/ariakit/ariakit/commit/73d5c8645458823366c7163446a9211128cf4cae). All descriptions of old behavior below refer to that commit. Read an archived file with this command:

```sh
git show 73d5c8645458823366c7163446a9211128cf4cae:app/src/lib/auth.ts
```

Inspected sources:

- `app/src/actions/admin.ts` and `app/src/actions/index.ts`.
- `app/src/lib/auth.ts`, `stripe.ts`, `kv.ts`, `price-key.ts`, `schemas.ts`, `locale.ts`, and account/checkout helpers in `url.ts`.
- `app/src/pages/admin/**` and `app/src/pages/plus/**`.
- `app/src/components/plus-checkout-frame.astro`.
- `app/src/pages/api/stripe-webhook.ts`, `app/src/middleware.ts`, and `app/env.d.ts`.

## Account data and access

Support signed-out users, signed-in users without a license, personal license holders, and team members.

Keep these data relationships separate from the authentication provider:

| Data                           | Purpose                                                                    |
| ------------------------------ | -------------------------------------------------------------------------- |
| Account ID                     | Stable identity used by purchases, promotions, and membership.             |
| Profile name and primary email | Account UI, team naming, and Stripe customer creation.                     |
| Stripe customer ID             | Associates the account with billing and checkout.                          |
| Personal entitlement           | Grants personal Plus access.                                               |
| Team membership and role       | Grants team access and controls team management.                           |
| Upgrade credit and currency    | Records the amount available when upgrading a personal purchase to a team. |
| Checkout-to-team association   | Prevents a repeated payment notification from creating another team.       |
| Completed fulfillment record   | Prevents a successfully fulfilled checkout from being applied again.       |
| Administrator permission       | Controls all administrative reads and writes.                              |

The previous current-user access check first used a direct Plus entitlement. If that was absent, membership in any team granted team access. The UI displayed Team when an account had team membership, including accounts that also had a personal entitlement. The explicit-user `getUserPlus` helper checked only direct entitlement; it did not inspect that user's teams. Define one intentional access policy in the replacement.

The replacement must refresh entitlement and membership data after checkout. A stale session must not leave a successful buyer on the payment step. The old helpers cached the current user in request-local state, read session claims by default, and could fetch fresh user metadata and memberships. Request caching and session claim names are implementation details.

The previous account pages provided:

- Sign-in and sign-out.
- A profile management screen supplied by Clerk.
- Account, Team, and Billing navigation.
- A badge for personal access, team access, or no license.
- A purchase link for signed-in users without access.
- A return link to the originating site page.

Signed-out account requests went to login. Signed-in login requests went to the account page. Account sign-in and sign-up returned to the account page; checkout sign-in and sign-up returned to the selected payment step. Sign-out returned to the applicable login page.

The source does not define each profile-management operation independently. Those operations came from the Clerk `UserProfile` widget. Choose the supported profile and security operations when implementing the Better Auth account UI.

## Team licenses

A team purchase created a team with a maximum of 10 members. The purchaser created and managed the team. The default name used the purchaser's first name, or the primary email name when no first name was present, followed by Team. An explicit name could override this default.

An account could belong to several teams. The Team page let the account select a team and open its management interface. Team creation from the switcher went through another team checkout. The page also offered an explicit additional team license link. An account without teams saw a no-membership state and a team purchase link.

The old membership and management UI came from Clerk `OrganizationSwitcher` and `OrganizationProfile`. The source does not separately define all invitation, member removal, role-change, or organization deletion rules. Define those permissions explicitly in the replacement.

Fulfillment of one checkout must create at most one team, including concurrent calls and retries after partial failure. The old code combined:

- A checkout session ID on the team.
- A search for an existing purchaser membership with that checkout ID.
- A unique organization slug derived from a hash of the checkout ID.
- Recovery of the existing organization when concurrent creation failed.

The slug kept 128 bits of a SHA-256 hash. The recovery path also checked the stored checkout ID before accepting the existing organization. Preserve the duplicate-prevention result. The slug format and Clerk API calls are implementation details.

## Checkout navigation

The old route format was:

```text
/plus/checkout/{login|payment|access}/{personal|team}
```

The default was `login/personal`. Invalid route values redirected to a valid checkout route. Changes to the step or license kept the other selection.

Keep this state flow:

| State                                                 | Result                                                                                                           |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Signed-out account opens payment or access            | Go to login.                                                                                                     |
| Signed-in account opens login                         | Go to payment.                                                                                                   |
| Personal license holder opens personal payment        | Go to access.                                                                                                    |
| Account without personal access opens personal access | Go to payment.                                                                                                   |
| Account without team access opens team access         | Go to payment.                                                                                                   |
| Existing team member buys another team                | Allow another team checkout.                                                                                     |
| Checkout return includes a session ID                 | Attempt fulfillment, remove the session ID, and use a `303` redirect to access on success or payment on failure. |

Login and payment showed a license selector. It described personal use and teams of up to 10 people. The old offer stated one-time payment, lifetime access, and free updates. Preserve these as existing product requirements for confirmation before the next launch.

The selector showed:

- The selected license.
- An existing personal purchase.
- An upgrade when credit applied.
- The payable amount.
- The original amount and percentage saved when a promotion applied.
- A notice that taxes are calculated at checkout.

The access step confirmed access and offered links to content and account/team management. Several old content links were placeholders pointing to `/`; their destinations are not established requirements. Celebration animation respected reduced-motion preferences and is optional presentation behavior.

Return destinations used local paths. The URL helper accepted HTTP(S) URL input but retained only its path, query, and fragment. It rejected other schemes and normalized leading slashes. Preserve local navigation and prevent an external redirect from user-controlled return data.

The checkout footer linked to the license agreement, privacy policy, terms of service, and FAQ. The old Plus landing page was only a heading and checkout link; it did not define a full product page.

## Prices, region, and upgrade credit

Support personal and team prices, with currency defaults and optional country overrides.

Price lookup followed this order:

1. License, currency, and country.
2. License and currency.
3. License and USD.

The old keys were:

```text
ariakit-plus-usd
ariakit-plus-eur-de
ariakit-plus-team-usd
ariakit-plus-team-eur-de
```

Key creation lowercased the currency and country. Parsing accepted only the expected prefix, optional `team-`, a three-letter lowercase currency, and an optional two-letter lowercase country.

The old country lookup checked `x-country`, `cf-ipcountry`, `x-vercel-ip-country`, and `cloudfront-viewer-country`, in that order, then defaulted to US. GB used GBP, IN used INR, listed EU countries used EUR, and other countries used USD. Treat this as the existing regional policy, not an authentication concern.

The cached price held its Stripe price ID, product ID, key, license type, currency, amount in minor units, and tax behavior. Tax behavior was carried through as a string to support Stripe values beyond the known literals.

A personal purchase recorded its paid total and currency as possible future upgrade credit. A team price could use this credit when the currencies matched. The existing order of operations was:

```text
amount before promotion = team price - eligible personal credit
payable amount = amount before promotion * (1 - promotion percentage / 100)
```

The team must exist before personal access and credit are removed during an upgrade. If team creation fails, the buyer must retain personal access and credit.

Before implementation, confirm rounding, negative balances, tax treatment, currency fallback, zero-decimal currencies, and whether the recorded paid total is the intended credit basis. The old implementation did not settle all of these rules safely. In particular, credit eligibility compared the requested currency with the credit currency before the final selected-price currency was checked. The UI also rounded currency display upward to a whole unit. These are observed implementation details, not requirements to copy.

## Stripe checkout and billing

Create or reuse the account's Stripe customer. New customers used the account's primary email. The account and Stripe customer stored a link to each other.

The old checkout used:

- One-time payment mode.
- Embedded checkout.
- One line item with quantity 1.
- Invoice creation.
- Automatic tax calculation.
- Tax ID collection.
- Automatic customer name and address updates.
- The selected promotion code.
- A return URL containing Stripe's checkout session placeholder.

When the effective amount, currency, and tax behavior matched the stored Stripe price, checkout used that price. When upgrade credit changed the effective amount, it created inline price data for the same product.

The checkout session and payment intent stored the account identifier, license type, and credit used. The old account field was named `clerkId`. Replace this provider-specific naming for new records, while planning how to resolve existing Stripe records during migration.

The checkout frame read the session client secret and mounted Stripe's embedded checkout. With no selected price or created session, it logged the problem and rendered nothing. Define useful loading and failure states for the replacement.

Billing required sign-in. With no Stripe customer, the route sent the account to checkout. Otherwise, it created a Stripe Billing Portal session with a local return destination. The account navigation opened billing in another tab. With no configured Stripe client, the old billing route returned to the site home page.

## Checkout fulfillment and retry behavior

Both the checkout return page and Stripe webhook could fulfill the same session.

Fulfillment must:

1. Retrieve the session when given an ID.
2. Check payment status.
3. Validate the license type and account association.
4. Detect prior completed fulfillment.
5. Grant the personal entitlement or create/reuse the purchased team.
6. Consume personal access and upgrade credit only after successful team creation.
7. Record completed fulfillment after all entitlement changes succeed.

The old code rejected `payment_status: "unpaid"` and accepted other payment statuses. Confirm the accepted statuses for the replacement, including zero-cost promotional purchases.

A personal purchase stored the paid total and currency as upgrade credit. A normal team purchase granted access through team membership. A team upgrade removed direct personal access and reset its credit and currency.

Do not write the completion marker before the entitlement changes. If fulfillment fails between steps, a webhook or return-page retry must be able to finish it.

The old KV completion check was separate from the write. It was not an atomic lock. Preserve duplicate protection at the actual entitlement/team operation as well as the completed-session record. The old Clerk-disabled helpers could return without granting access; the replacement must not interpret an absent backend as successful fulfillment.

## Promotions

Support public sale promotions and promotions restricted to one account. A promotion can restrict eligible products, expire at a timestamp, and limit total redemptions.

The cache stored:

- Promotion ID and type.
- Optional account ID.
- Eligible product IDs.
- Expiration time in Unix seconds.
- Percentage discount.
- Redemptions used.
- Optional maximum redemptions.

Account-specific promotions must never become public when the target account cannot be resolved. Creating a targeted promotion for an absent account must fail. If the account exists but has no Stripe customer, create and link the customer before creating the promotion.

The old creation flow reused an active, valid coupon with the same percentage and no product restrictions. Otherwise, it created a coupon tagged as an Ariakit Plus sale. It then created the promotion code with the optional customer, expiration, and redemption limit, and cached the result.

The old admin action accepted percentages from 1 through 100. Its UI offered selected values from 5 through 70. These were different limits; choose one intentional interface for the replacement.

Promotion selection:

- Included public promotions and those assigned to the current account.
- Applied product restrictions when present.
- Removed expired promotions from consideration at read time, because expiration alone did not update the cache through a webhook.
- Selected the largest percentage discount.
- Kept the first entry when discounts were equal.

The old read-time selection did not independently reject exhausted redemption limits. It relied on Stripe validity and event synchronization. The replacement must define behavior while that state is stale.

The checkout offer displayed either limited redemption availability, expiration date/time remaining, or a generic limited-time message. With fewer than 12 hours left, it favored expiration information, except when 10 or fewer licenses remained. Preserve truthful offer data; the exact wording and switching threshold are optional presentation choices.

## Administration

Only authorized administrators could read Prices, Promos, Users, and Teams pages or run administrative actions.

The old authorization rule required the `org:admin` role in the organization named by `ADMIN_ORG_ID`. Better Auth must provide an explicit replacement permission. The organization ID, JWT claim format, and role spelling are Clerk details.

Actions also checked authorization inside their handler. Middleware checked it before administrative action execution. Removing the pages must not leave an unprotected mutation endpoint.

The only old actions were:

```text
admin.sync
admin.setPrice
admin.setPromo
```

### Price and promotion synchronization

Manual synchronization:

- Read active one-time Stripe prices.
- Ignored missing or invalid lookup keys and deleted products.
- Cached valid Plus prices.
- Repaired Stripe product `plusType` metadata when it disagreed with the price key.
- Created missing default products and default currency prices.
- Removed invalid or inactive prices from the cache.
- Read active promotion codes and expanded their coupons/customers.
- Cached supported public and customer promotions.
- Removed invalid, inactive, unsupported, deleted-customer, or unresolved-account promotions.
- Recorded the last successful synchronization time.

A price key written during the same sync must survive cache cleanup even when the subsequent KV list returns stale metadata.

Historical seed amounts were:

| License  | USD | GBP | EUR |    INR |
| -------- | --: | --: | --: | -----: |
| Personal | 297 | 217 | 237 |  9,700 |
| Team     | 879 | 639 | 699 | 28,900 |

These values document the old defaults. Confirm prices before reuse.

The old UI displayed the relative last-sync time or never. Its sync action caught and logged errors without returning a distinct failure result. The replacement should define an observable failure result and must not report a successful sync time after failure.

Stripe price and promotion scans used auto-pagination. Product and membership calls had a limit of 100. KV list reads did not iterate through list cursors. These old scan limits are not product requirements; define complete pagination where data can exceed one page.

### Price editing

Administrators could create or replace a price for a license, currency, and optional country.

The Prices page paired personal and team prices for the same region and currency. It showed formatted values, a team-to-personal price ratio, and editing controls. A missing team price appeared as a zero-value placeholder. Confirm the desired display for incomplete pairs.

Stripe price replacement must preserve a valid active price if replacement creation fails:

1. Find the current price for the lookup key.
2. If it already matches the requested active amount, refresh the cache and finish pending predecessor cleanup.
3. Otherwise, create the replacement first and transfer the lookup key.
4. Cache the replacement.
5. Deactivate the old price.

The new price recorded its predecessor so a retry could finish cleanup after a partial failure. Before deactivating a recorded predecessor, the code checked its product, currency, lookup key, and that it was not the replacement itself. Preserve protection against deactivating an unrelated price.

The old form accepted amounts with up to two decimal places and multiplied them by 100. It allowed any three-letter currency and an optional two-letter country. The replacement must define validation and minor-unit conversion for all supported currencies.

### Promotion management

The Promos page supported percentage discounts with optional expiration in days, redemption limit, and account ID.

It listed public promotions before customer promotions. Each entry showed the percentage, redemption count, optional expiration, target account, and a Stripe management link. It identified the best current public promotion.

### Account and team lists

The Users page supported text search and sorted users by most recent activity. Entries showed profile image, name or email, direct license type, last activity, account-management link, and Stripe customer link when present.

The Teams page supported text search and sorted teams by creation date, newest first. Entries showed image, name, slug, member count, and management links.

Both lists supported:

- Result counts and first/last displayed result.
- Previous and next pages.
- Search and reset.
- Page sizes of 25, 50, and 100.
- A saved page-size preference.
- Empty results shown as `0 - 0`, with a minimum displayed page count of one.
- Query, limit, and offset in the URL.
- Normalization of invalid pagination input.

Clerk dashboard links must be replaced with suitable internal account/team management links. Stripe dashboard links can remain an administrative integration.

## Webhook requirements and the temporary removed-account state

The old webhook handled:

```text
checkout.session.completed
checkout.session.async_payment_succeeded
price.created
price.updated
price.deleted
promotion_code.created
promotion_code.updated
```

Verify the Stripe signature against the raw request body. Missing or invalid signatures returned a bad request. Missing server configuration returned a server error.

Price events maintained the cache from supported active prices. Deletion found the cached lookup key through the Stripe price ID.

Promotion events retrieved an unexpanded coupon when needed. They excluded unsupported public coupons, resolved restricted customers to accounts, removed invalid cache entries, and updated discount and redemption metadata.

The temporary implementation keeps signed price and public promotion cache updates. Checkout events and customer promotion events return `503` until the account implementation is restored. Customer promotions are rejected before fetching or changing account-associated data. Existing customer promotion cache entries remain intact.

During this period:

- Do not acknowledge checkout fulfillment as successful when no entitlement service is available.
- Do not record a checkout session as processed without granting access.
- Do not reinterpret a customer promotion as a public sale.
- Do not delete a valid customer promotion merely because the replacement identity service has not been implemented.
- Keep signature verification before all event handling.
- Leave existing Stripe records and KV data intact.

A temporary failure response permits event retries but does not itself guarantee later delivery. Before production use resumes, determine how failed or delayed events will be replayed and checked. Code removal does not disable or delete the Stripe webhook configuration or existing KV namespaces.

## Acceptance scenarios for reimplementation

| Scenario                                                         | Expected result                                                        |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Signed-out user opens account or payment                         | Sign-in is required.                                                   |
| Non-admin calls an admin mutation directly                       | The mutation is rejected without a write.                              |
| User completes personal checkout                                 | Personal access and the intended upgrade-credit record are stored.     |
| Checkout completion arrives twice                                | The purchase is applied once.                                          |
| Return page and webhook complete a team checkout concurrently    | One purchased team is created.                                         |
| Team creation fails during an upgrade                            | Personal access and credit remain available.                           |
| Team creation succeeds but later entitlement work fails          | A retry reuses the team and completes the remaining work.              |
| Completion-marker write fails                                    | A retry does not create another purchased team.                        |
| Existing member buys another team license                        | The new purchase creates a separate team.                              |
| Current session has stale access claims after payment            | Refreshed account data allows access.                                  |
| Country-specific price is absent                                 | Currency default is used, then USD fallback.                           |
| Personal credit uses another currency                            | It is not applied without an explicit conversion policy.               |
| Public and eligible customer promotions coexist                  | The best eligible valid promotion is selected.                         |
| Promotion expires without a webhook                              | It no longer affects a new quote.                                      |
| Target account for a customer promotion does not exist           | Creation fails; no public promotion is created.                        |
| Replacement Stripe price creation fails                          | The old price stays active.                                            |
| Replacement price is cached but old-price deactivation fails     | A retry safely finishes predecessor cleanup.                           |
| KV list returns stale data during sync                           | Prices written by that sync are retained.                              |
| Webhook has an invalid signature                                 | No cache or entitlement writes occur.                                  |
| Account backend is unavailable during a payment event            | The event is not marked fulfilled.                                     |
| Account backend is unavailable during a customer promotion event | The old cached promotion is preserved and the event remains retryable. |
| Return destination uses an external origin or unsafe scheme      | Navigation remains local or the destination is rejected.               |
| Search has no results                                            | Pagination shows an empty result range without invalid navigation.     |

## Data migration and unresolved design choices

The old provider-specific fields were `UserPublicMetadata.plus`, `UserPrivateMetadata.stripeId/credit/currency`, session `teams`, Stripe `clerkId`, and organization `stripeCheckoutSessionId`.

Before the next implementation, define:

- How existing Clerk account IDs map to Better Auth accounts.
- How users prove ownership of existing purchases.
- How Stripe customers, targeted promotions, teams, roles, upgrade credit, and fulfillment records are migrated.
- Whether every team membership grants access or only membership in a licensed team.
- The intended permission rules for invitations, membership changes, and team administration.
- Personal-to-team upgrade tax, rounding, and currency rules.
- Refund, dispute, and entitlement-revocation behavior. The inspected webhook did not implement these.
- How to recover events missed during the removed-account period.

Do not treat the old UI or its operational limits as answers to these choices.
