/* ComplyScope Kenya — county licensing reference for all 47 counties.
   Research checked November 2026. Each county's Finance Act and its invoice are the final word on fees and inclusions.
   validity: 'issue'    = permit runs 12 months from the date of issue (County Licensing (Uniform Procedures) Act, 2024, s.17)
             'calendar' = county still issues permits for the calendar year (ends 31 December)
             null       = not confirmed; use the expiry printed on the permit
   portal: where the county says to apply and pay online (null = apply at the county or sub-county revenue office)
   bundles: approvals the county folds into the main permit (only set where confirmed)
   We deliberately do not list M-PESA paybill numbers: counties change them, and fake "county paybills" are a known fraud.
   Pay only with the bill number from the county's own invoice or portal. */

var MYCOUNTY = 'Safaricom MyCounty app (M-PESA) also lists this county for permit payments.';
var S = {
  act: { label: 'County Licensing (Uniform Procedures) Act, 2024 — summary', url: 'https://paybillke.com/guides/single-business-permit-kenya-2026' },
  ereg: { label: 'Kenya eRegulations — county procedures', url: 'https://kenya.eregulations.org/objective/448?l=en' }
};

var COUNTY_DATA = [
  { code: 1, name: 'Mombasa', hq: 'Mombasa', site: 'https://www.mombasa.go.ke', permit: 'Single Business Permit',
    portal: { label: 'Mombasa County e-services portal', url: 'https://eportal.mombasa.go.ke' }, validity: 'calendar',
    notes: ['Apply and pay online; a provisional permit is issued on payment so you can trade before the inspection, then the final permit is issued.', 'Alcoholic drinks licences are applied for on the same e-services portal.', 'Fire, public health and weights and measures approvals depend on your activity and may be billed separately.'],
    sources: [S.ereg] },
  { code: 2, name: 'Kwale', hq: 'Kwale (largest town: Ukunda)', site: 'https://kwale.go.ke', permit: 'Single Business Permit', portal: null, validity: null,
    notes: ['Revenue offices are at the county headquarters in Matuga and the sub-county offices.'], sources: [{ label: 'Kenya eRegulations — Kwale revenue offices', url: 'https://kenya.eregulations.org/Contacts/115?l=en' }] },
  { code: 3, name: 'Kilifi', hq: 'Kilifi', site: 'https://kilifi.go.ke', permit: 'Unified Business Permit (UBP)',
    portal: { label: 'Kilifi public portal (also the Kilifi App on Android and iOS)', url: 'https://www.kilifiservices.go.ke' }, validity: null, mycounty: true,
    notes: ['Create an account, apply for the UBP, pay through the portal and download the receipt and permit.', 'Main towns with their own fee bands include Malindi, Mtwapa, Watamu and Kilifi.'],
    sources: [{ label: 'Kilifi County — Unified Business Permit', url: 'https://invest.kilifi.go.ke/?p=10910' }] },
  { code: 4, name: 'Tana River', hq: 'Hola', site: 'https://tanariver.go.ke', permit: 'Single Business Permit', portal: null, validity: null, notes: [], sources: [] },
  { code: 5, name: 'Lamu', hq: 'Lamu', site: 'https://lamu.go.ke', permit: 'Single Business Permit', portal: null, validity: null, notes: [], sources: [] },
  { code: 6, name: 'Taita-Taveta', hq: 'Wundanyi (governor’s office in Mwatate)', site: 'https://www.taitataveta.go.ke', permit: 'Single Business Permit', portal: null, validity: null,
    notes: ['The county collects revenue online, but we have not confirmed a public self-service permit portal. Ask the revenue office for an invoice and pay against its bill number.', 'A current Single Business Permit is a standard requirement for county supplier registration.'],
    sources: [{ label: 'The Standard — Taita Taveta online revenue collection (Aug 2025)', url: 'https://www.standardmedia.co.ke/coast/article/2001527839/taita-taveta-revenue-growth-falls-short-of-cra-projections' }] },
  { code: 7, name: 'Garissa', hq: 'Garissa', site: 'https://garissa.go.ke', permit: 'Single Business Permit', portal: null, validity: null, notes: [], sources: [] },
  { code: 8, name: 'Wajir', hq: 'Wajir', site: 'https://wajir.go.ke', permit: 'Single Business Permit', portal: null, validity: null, notes: [], sources: [] },
  { code: 9, name: 'Mandera', hq: 'Mandera', site: 'https://mandera.go.ke', permit: 'Single Business Permit', portal: null, validity: null, notes: [], sources: [] },
  { code: 10, name: 'Marsabit', hq: 'Marsabit', site: 'https://marsabit.go.ke', permit: 'Single Business Permit', portal: null, validity: null, notes: [], sources: [] },
  { code: 11, name: 'Isiolo', hq: 'Isiolo', site: 'https://isiolo.go.ke', permit: 'Single Business Permit', portal: null, validity: null, notes: [], sources: [] },
  { code: 12, name: 'Meru', hq: 'Meru', site: 'https://meru.go.ke', permit: 'Single Business Permit', portal: { label: 'Revenue e-Services link on the county website', url: 'https://meru.go.ke' }, ussd: '*414#', validity: null,
    notes: ['Revenue is collected by the Meru County Revenue Board. Permits, parking, market and advertising fees are paid cashless through the county’s JamboPay system, including USSD *414#.', 'County contact centre: 0709 241 000.'],
    sources: [{ label: 'Nation — Meru contracts JamboPay', url: 'https://nation.africa/kenya/counties/meru/meru-contracts-jambopay-in-revenue-collection-deal-96468' }, S.ereg] },
  { code: 13, name: 'Tharaka-Nithi', hq: 'Kathwana', site: 'https://tharakanithi.go.ke', permit: 'Single Business Permit', portal: null, validity: null,
    notes: ['The county website links to an M-Pesa payment portal; get the invoice from the revenue office first. Toll-free line: 0800 720 370.'], sources: [{ label: 'Tharaka Nithi County website', url: 'https://tharakanithi.go.ke' }] },
  { code: 14, name: 'Embu', hq: 'Embu', site: 'https://embu.go.ke', permit: 'Single Business Permit', portal: null, validity: null, notes: [], sources: [] },
  { code: 15, name: 'Kitui', hq: 'Kitui', site: 'https://kitui.go.ke', permit: 'Single Business Permit', portal: null, validity: null, mycounty: true, notes: [], sources: [] },
  { code: 16, name: 'Machakos', hq: 'Machakos', site: 'https://machakos.go.ke', permit: 'Single Business Permit',
    portal: { label: 'Machakos Citizen Self-Service Portal', url: 'https://citizen.machakos.go.ke' }, validity: 'calendar', renewBy: '31 March',
    notes: ['Renewals and payment are due by 31 March each year; the county charges penalties after that.', 'New permits: download the application form from the county website, send it to the revenue office (email or the county WhatsApp line), the premises are inspected, then the permit is approved.', 'A one-stop revenue desk operates across the county’s 40 wards.', 'Licensed businesses can use the free county Biashara app for bookkeeping.'],
    sources: [{ label: 'Machakos County — New SBP process', url: 'https://machakos.go.ke/new-sbp/' }, { label: 'Radio Generation — 31 March 2026 renewal notice', url: 'https://radiogeneration.co.ke/land rates/78883/machakos-county-reminds-traders-and-property-owners-to-renew-permits' }] },
  { code: 17, name: 'Makueni', hq: 'Wote', site: 'https://makueni.go.ke', permit: 'Single Business Permit', portal: { label: 'MyMakueni County app (Safaricom)', url: null }, validity: null, mycounty: true,
    notes: ['Makueni was the first county on the MyCounty / MyMakueni app, which takes single business permit, liquor licence and market fee payments.'],
    sources: [{ label: 'Makueni County — digital services success story', url: 'https://umanyi.makueni.go.ke/storage/success_stories/685cf2f5da019_Success_Story.pdf' }] },
  { code: 18, name: 'Nyandarua', hq: 'Ol Kalou', site: 'https://nyandarua.go.ke', permit: 'Single Business Permit', portal: null, validity: null, notes: [], sources: [] },
  { code: 19, name: 'Nyeri', hq: 'Nyeri', site: 'https://nyeri.go.ke', permit: 'Single Business Permit', portal: null, validity: null,
    notes: ['The procedure is published on Kenya eRegulations (KenInvest).'], sources: [S.ereg] },
  { code: 20, name: 'Kirinyaga', hq: 'Kutus', site: 'https://kirinyaga.go.ke', permit: 'Single Business Permit', portal: null, validity: null, notes: [], sources: [] },
  { code: 21, name: "Murang'a", hq: "Murang'a", site: 'https://muranga.go.ke', permit: 'Single Business Permit', portal: { label: 'County revenue e-portal (link on the county website)', url: 'https://muranga.go.ke' }, validity: null,
    notes: ['All revenue collection is automated; you can apply for the permit on the county e-portal and print it.'],
    sources: [{ label: 'Council of Governors — Murang’a online automation', url: 'https://maarifa.cog.go.ke/county-initiatives/muranga-county-doubles-revenue-collection-embracing-online-automation' }] },
  { code: 22, name: 'Kiambu', hq: 'Kiambu', site: 'https://kiambu.go.ke', permit: 'Single Business Permit', portal: { label: 'Kiambu County Revenue Authority eServices', url: null }, ussd: '*476#', validity: 'issue',
    notes: ['Run by the Kiambu County Revenue Authority (KCRA).', 'The county moved small traders to a single permit covering several licence fees, valid 12 months from the date it is acquired.', 'Advertising and signage permits are handled by Physical Planning and billed separately; fees vary by zone (A, B, C), business size and type.'],
    sources: [{ label: 'Kenyans.co.ke — Kiambu single permit, 12-month validity', url: 'https://www.kenyans.co.ke/news/108523-relief-traders-governor-kimani-wamatangi-slashes-license-inspection-fees' }, { label: 'PaybillKE — Kiambu business permit', url: 'https://paybillke.com/counties/kiambu/business-permit' }] },
  { code: 23, name: 'Turkana', hq: 'Lodwar', site: 'https://turkana.go.ke', permit: 'Single Business Permit', portal: null, validity: null, notes: [], sources: [] },
  { code: 24, name: 'West Pokot', hq: 'Kapenguria', site: 'https://westpokot.go.ke', permit: 'Trade licence (Single Business Permit)', portal: null, validity: null,
    notes: ['Licensing follows the West Pokot County Trade Licence Act, 2015 and the current Finance Act, both published on the county website. Help line: 053 201 4000.'],
    sources: [{ label: 'West Pokot County — Acts', url: 'https://westpokot.go.ke/cgwpacts' }] },
  { code: 25, name: 'Samburu', hq: 'Maralal', site: 'https://samburu.go.ke', permit: 'Single Business Permit', portal: null, validity: null, mycounty: true, notes: [], sources: [] },
  { code: 26, name: 'Trans Nzoia', hq: 'Kitale', site: 'https://transnzoia.go.ke', permit: 'Single Business Permit', portal: { label: 'Erev app (linked from the county website)', url: 'https://transnzoia.go.ke' }, validity: null,
    notes: ['The county website links to its Erev revenue app; confirm the bill with the revenue office before paying.'], sources: [{ label: 'Trans Nzoia County website', url: 'https://transnzoia.go.ke' }] },
  { code: 27, name: 'Uasin Gishu', hq: 'Eldoret', site: 'https://uasingishu.go.ke', permit: 'Single Business Permit',
    portal: { label: 'Uasin Gishu County self-help portal', url: 'https://revenue.uasingishu.go.ke' }, validity: null, mycounty: true,
    notes: ['Apply online on the self-help portal, or in person at the Uasin Gishu County Service Centre, a one-stop office for permits, fire compliance, public health, signage, weights and measures and liquor licences.', 'The revenue system is called Sisibo Pay. Fees are set by zone (Eldoret municipality, townships, sub-counties), plus an application fee.'],
    sources: [{ label: 'Uasin Gishu revenue portal', url: 'https://revenue.uasingishu.go.ke' }, { label: 'Uasin Gishu — one-stop service centre', url: 'https://uasingishu.go.ke/index.php/county-operationalizes-a-one-stop-service-centre' }] },
  { code: 28, name: 'Elgeyo-Marakwet', hq: 'Iten', site: 'https://elgeyomarakwet.go.ke', permit: 'Single Business Permit', portal: null, validity: null, mycounty: true, notes: [], sources: [] },
  { code: 29, name: 'Nandi', hq: 'Kapsabet', site: 'https://nandi.go.ke', permit: 'Single Business Permit', portal: null, validity: null, notes: [], sources: [] },
  { code: 30, name: 'Baringo', hq: 'Kabarnet', site: 'https://baringo.go.ke', permit: 'Single Business Permit', portal: null, validity: null, notes: [], sources: [] },
  { code: 31, name: 'Laikipia', hq: 'Rumuruti (largest town: Nanyuki)', site: 'https://laikipia.go.ke', permit: 'Single Business Permit', portal: null, validity: null,
    notes: ['Apply at the county government offices once the business is registered and has its documents.'], sources: [{ label: 'Laikipia County — regulations', url: 'https://laikipia.go.ke/regulations' }] },
  { code: 32, name: 'Nakuru', hq: 'Nakuru', site: 'https://nakuru.go.ke', permit: 'Unified Business Permit (UBP)',
    portal: { label: 'NakuruPay', url: 'https://nakurupay.com' }, validity: null, bundles: { fire: true, signage: true, health: true },
    notes: ['The UBP combines the business, fire, food, health and advertising licences into one annual permit.', 'The county has previously given a grace period to 30 April for payment.'],
    sources: [{ label: 'Nation — Nakuru rolls out unified permit', url: 'https://beta.nation.co.ke/kenya/counties/nakuru/nakuru-rolls-out-single-business-permit-to-ease-trade--5021370' }, S.act] },
  { code: 33, name: 'Narok', hq: 'Narok', site: 'https://narok.go.ke', permit: 'Single Business Permit', portal: null, validity: null, mycounty: true, notes: [], sources: [] },
  { code: 34, name: 'Kajiado', hq: 'Kajiado', site: 'https://kajiado.go.ke', permit: 'Single Business Permit (trade licence)',
    portal: { label: 'Kajiado county e-payments', url: 'https://epayments.kajiado.go.ke' }, portal2: { label: 'Kajiado self-service portal', url: 'https://kajiado.craftcollect.africa' }, validity: null, mycounty: true,
    notes: ['The county does not publish an M-PESA paybill. Treat any “Kajiado paybill” given to you verbally with suspicion and pay only through the official portals.', 'Fees use Zone A (Kitengela, Kajiado and Ngong municipalities) and Zone B (all other areas). Short-stay rentals are charged per unit.'],
    sources: [{ label: 'PaybillKE — Kajiado has no paybill', url: 'https://paybillke.com/paybill/kajiado-county' }] },
  { code: 35, name: 'Kericho', hq: 'Kericho', site: 'https://kericho.go.ke', permit: 'Single Business Permit', portal: null, validity: null, notes: [], sources: [] },
  { code: 36, name: 'Bomet', hq: 'Bomet', site: 'https://bomet.go.ke', permit: 'Single Business Permit', portal: { label: 'BometPay', url: 'https://bometpay.go.ke' }, ussd: '*863#', validity: null, mycounty: true,
    notes: ['USSD *863# is available from 1 July 2026.'], sources: [] },
  { code: 37, name: 'Kakamega', hq: 'Kakamega', site: 'https://kakamega.go.ke', permit: 'Single Business Permit (trade licence)',
    portal: { label: 'Kakamega County Revenue Agency', url: 'https://revenue.kakamega.go.ke' }, validity: 'calendar',
    notes: ['Fees are paid to the Kakamega County Revenue Agency (KCRA). Permits expire on 31 December whatever the date of issue.', 'New businesses pay a one-off application fee. Help lines: 056 203 1850, info@kakamega.go.ke.'],
    sources: [{ label: 'Kakamega County Revenue Agency', url: 'https://revenue.kakamega.go.ke' }] },
  { code: 38, name: 'Vihiga', hq: 'Mbale', site: 'https://vihiga.go.ke', permit: 'Single Business Permit', portal: null, validity: null, notes: [], sources: [] },
  { code: 39, name: 'Bungoma', hq: 'Bungoma', site: 'https://bungoma.go.ke', permit: 'Single Business Permit', portal: null, validity: null, notes: [], sources: [] },
  { code: 40, name: 'Busia', hq: 'Busia', site: 'https://busia.go.ke', permit: 'Single Business Permit', portal: null, validity: null, mycounty: true, notes: [], sources: [] },
  { code: 41, name: 'Siaya', hq: 'Siaya', site: 'https://siaya.go.ke', permit: 'Single Business Permit', portal: null, validity: null, notes: [], sources: [] },
  { code: 42, name: 'Kisumu', hq: 'Kisumu', site: 'https://kisumu.go.ke', permit: 'Trade licence (Single Business Permit)',
    portal: { label: 'Kisumu County e-services', url: 'https://eservices.kisumu.go.ke' }, validity: null,
    notes: ['Apply and pay online on the county e-services portal.'], sources: [S.act] },
  { code: 43, name: 'Homa Bay', hq: 'Homa Bay', site: 'https://homabay.go.ke', permit: 'Single Business Permit', portal: null, validity: null,
    notes: ['Revenue is collected by the Homa Bay County Revenue Board. Tariffs are in the HBC Tariffs and Pricing Policy 2026, available on the county website. Toll-free: 0800 000 889.'],
    sources: [{ label: 'Homa Bay County downloads', url: 'https://homabay.go.ke/resources/downloads' }] },
  { code: 44, name: 'Migori', hq: 'Migori', site: 'https://migori.go.ke', permit: 'Single Business Permit', portal: null, validity: null, notes: [], sources: [] },
  { code: 45, name: 'Kisii', hq: 'Kisii', site: 'https://kisii.go.ke', permit: 'Single Business Permit', portal: null, validity: null, notes: [], sources: [] },
  { code: 46, name: 'Nyamira', hq: 'Nyamira', site: 'https://nyamira.go.ke', permit: 'Single Business Permit', portal: null, validity: null, notes: ['Fees are set by zone in the county Finance Act.'], sources: [] },
  { code: 47, name: 'Nairobi City', hq: 'Nairobi', site: 'https://nairobi.go.ke', permit: 'Unified Business Permit (UBP)',
    portal: { label: 'Nairobi Services portal (NairobiPay)', url: 'https://nairobiservices.go.ke' }, ussd: '*647#', validity: 'issue', mycounty: true, bundles: { fire: true, signage: true, health: true },
    notes: ['The UBP combines the business permit, fire clearance, food hygiene, pest control, health certificates and advertising into one licence.', 'Apply online, by USSD *647#, or at the customer service centre at City Hall Annex. Each premises needs its own permit.', 'Fees follow the Nairobi City County Finance Act; payment can be annual, half-yearly or quarterly. Operating without a permit can attract a fine of up to KSh 50,000.', 'Liquor licences are applied for separately on the LiquorPay platform.'],
    sources: [{ label: 'The Star — how to pay for the UBP', url: 'https://www.the-star.co.ke/news/2024-01-01-how-to-pay-for-and-activate-sakajas-unified-business-permit' }, S.act] }
];

export var COUNTY_GENERAL = [
  'Every premises (each branch) needs its own county business permit.',
  'Under the County Licensing (Uniform Procedures) Act, 2024, counties run a single application process, a licence for a business running a year or more is valid for one year from the date of issue, and counties must offer online licensing by December 2027.',
  'Health, hygiene and safety compliance is a condition for getting the licence.',
  'Fees are set each year in the county Finance Act and depend on activity, size, staff and zone. Use the amount on the county invoice.',
  'Pay only with the bill number from the county’s own invoice or portal. Never pay a permit fee to a personal number or a paybill someone gives you verbally.'
];

COUNTY_DATA.forEach(function (c) { if (c.mycounty) c.notes = c.notes.concat([MYCOUNTY]); c.slug = c.name.toLowerCase().replace(/[^a-z]+/g, '-'); });

export var COUNTY_BY_NAME = {};
COUNTY_DATA.forEach(function (c) { COUNTY_BY_NAME[c.name] = c; });
export default COUNTY_DATA;
