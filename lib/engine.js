/* ComplyScope Kenya — obligation and deadline engine (pure functions, no DOM) */
import { COUNTY_BY_NAME } from './counties.js';
var CS = (function () {
  'use strict';

  // ---------- dates (all UTC day numbers to avoid timezone drift) ----------
  var DAY = 86400000;
  function D(y, m, d) { return Date.UTC(y, m - 1, d); }
  function parts(t) { var x = new Date(t); return { y: x.getUTCFullYear(), m: x.getUTCMonth() + 1, d: x.getUTCDate(), wd: x.getUTCDay() }; }
  function iso(t) { var p = parts(t); return p.y + '-' + pad(p.m) + '-' + pad(p.d); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function fromIso(s) { if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null; var a = s.split('-').map(Number); return D(a[0], a[1], a[2]); }
  function lastDay(y, m) { return new Date(Date.UTC(y, m, 0)).getUTCDate(); }
  function addMonths(y, m, n) { var k = y * 12 + (m - 1) + n; return { y: Math.floor(k / 12), m: (k % 12) + 1 }; }
  function todayKE() {
    // Nairobi is UTC+3 all year
    var n = new Date(Date.now() + 3 * 3600000);
    return D(n.getUTCFullYear(), n.getUTCMonth() + 1, n.getUTCDate());
  }
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var MONTH = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  function fmt(t) { if (t == null) return 'Not set'; var p = parts(t); return p.d + ' ' + MON[p.m - 1] + ' ' + p.y; }
  function periodLabel(per) {
    if (/^\d{4}-\d{2}$/.test(per)) { var a = per.split('-'); return MONTH[+a[1] - 1] + ' ' + a[0]; }
    if (/^\d{4}-H[12]$/.test(per)) return (per.slice(-1) === '1' ? 'First half ' : 'Second half ') + per.slice(0, 4);
    if (/^\d{4}-I[1-4]$/.test(per)) return 'Instalment ' + per.slice(-1) + ', year of income ' + per.slice(0, 4);
    if (/^FY\d{4}$/.test(per)) return 'Year of income ' + per.slice(2);
    if (/^\d{4}$/.test(per)) return per;
    if (/^exp:/.test(per)) return 'Renewal due';
    if (/^renewal/.test(per)) return 'Renewal';
    if (per === 'once') return 'One-off';
    return per;
  }

  // Kenyan public holidays with fixed dates, plus Easter. Eid dates move and are announced by gazette.
  function easter(y) {
    var a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25),
      g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4,
      l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451),
      mo = Math.floor((h + l - 7 * m + 114) / 31), da = ((h + l - 7 * m + 114) % 31) + 1;
    return D(y, mo, da);
  }
  var holCache = {};
  // Holidays declared by gazette notice each year (Islamic holidays move with the moon; one-off national days).
  // Future years are provisional and set to the earlier likely date, so a due date is never pushed later by mistake.
  var GAZETTED = {
    2024: [[4, 10], [6, 17]],
    2025: [[3, 31], [6, 6], [10, 17]],
    2026: [[3, 20], [5, 27]],
    2027: [[3, 9], [5, 16]], // provisional until gazetted
    2028: [[2, 26], [5, 4]]  // provisional until gazetted
  };
  function holidays(y) {
    if (holCache[y]) return holCache[y];
    var list = [[1, 1], [5, 1], [6, 1], [10, 10], [10, 20], [12, 12], [12, 25], [12, 26]].concat(GAZETTED[y] || []).map(function (x) { return D(y, x[0], x[1]); });
    var obs = [];
    list.forEach(function (t) { if (parts(t).wd === 0) obs.push(t + DAY); }); // Sunday holiday observed Monday
    var e = easter(y);
    var all = list.concat(obs, [e - 2 * DAY, e + DAY]);
    var set = {}; all.forEach(function (t) { set[t] = true; });
    holCache[y] = set; return set;
  }
  function isWorking(t) { var p = parts(t); if (p.wd === 0 || p.wd === 6) return false; return !holidays(p.y)[t]; }
  function prevWorking(t) { while (!isWorking(t)) t -= DAY; return t; }
  function nthWorkingDay(y, m, n) { var t = D(y, m, 1), c = 0; while (true) { if (isWorking(t)) { c++; if (c === n) return t; } t += DAY; } }

  // ---------- reference data ----------
  var COUNTIES = ['Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet', 'Embu', 'Garissa', 'Homa Bay', 'Isiolo', 'Kajiado', 'Kakamega', 'Kericho', 'Kiambu', 'Kilifi', 'Kirinyaga', 'Kisii', 'Kisumu', 'Kitui', 'Kwale', 'Laikipia', 'Lamu', 'Machakos', 'Makueni', 'Mandera', 'Marsabit', 'Meru', 'Migori', 'Mombasa', "Murang'a", 'Nairobi City', 'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua', 'Nyeri', 'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River', 'Tharaka-Nithi', 'Trans Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot'];

  function countyInfo(c) {
    var d = COUNTY_BY_NAME[c];
    if (!d) return { permit: 'Single Business Permit', portal: (c || 'County') + ' revenue office', url: null, note: 'Fees and add-ons follow the county Finance Act.', validity: null };
    var b = d.bundles || {};
    return { permit: d.permit, portal: d.portal ? d.portal.label : c + ' County revenue office', url: (d.portal && d.portal.url) || d.site || null, ussd: d.ussd || null,
      note: d.notes.join(' '), validity: d.validity, bundlesFire: !!b.fire, bundlesSignage: !!b.signage, bundlesHealth: !!b.health, slug: d.slug };
  }

  var SECTORS = [
    ['cleaning', 'Cleaning, fumigation or pest control'], ['food', 'Food, restaurant or catering'], ['hospitality', 'Hotel or accommodation'],
    ['retail', 'Retail or wholesale shop'], ['professional', 'Professional or business services'], ['tech', 'Technology or communications'],
    ['health', 'Healthcare, clinic or pharmacy'], ['education', 'School, college or daycare'], ['manufacturing', 'Manufacturing or processing'],
    ['construction', 'Construction'], ['property', 'Property management or real estate'], ['transport', 'Transport or logistics'], ['agriculture', 'Farming or agro-processing'],
    ['finance', 'Financial or insurance services'], ['other', 'Something else']
  ];
  var ODPC_MANDATORY = { health: 1, education: 1, food: 1, hospitality: 1, transport: 1, finance: 1, property: 1 }; // Third Schedule, LN 265 of 2021

  var STRUCTURES = { company: 'Private limited company', sole: 'Sole proprietorship', partnership: 'Partnership', llp: 'Limited liability partnership', ngo: 'NGO or non-profit' };
  var TURNOVER = { lt1: 'Under KSh 1 million', '1to5': 'KSh 1 million to 5 million', '5to25': 'KSh 5 million to 25 million', gt25: 'Over KSh 25 million', unknown: 'Not sure yet' };

  // ---------- sources ----------
  var SRC = {
    paye: { label: 'KRA — PAYE due date', url: 'https://www.kra.go.ke/component/kra_faq/faq/729' },
    ahl: { label: 'KRA — Affordable Housing Levy notice', url: 'https://www.kra.go.ke/news-center/public-notices/2099-collection-of-the-affordable-housing-levy-by-kenya-revenue-authority-2' },
    shif: { label: 'SHA — employer portal', url: 'https://employers.sha.go.ke' },
    nssf: { label: 'NSSF — employer obligations', url: 'https://www.nssf.or.ke/employers' },
    nita: { label: 'NITA — training levy', url: 'https://nita.go.ke/our-services/levy-inspectorate.html' },
    vat: { label: 'KRA — Value Added Tax', url: 'https://www.kra.go.ke/individual/filing-paying/types-of-taxes/value-added-tax' },
    kra: { label: 'KRA — iTax', url: 'https://itax.kra.go.ke' },
    brs: { label: 'Business Registration Service', url: 'https://brs.go.ke/' },
    cos: { label: 'Companies Act, 2015 (Kenya Law)', url: 'https://new.kenyalaw.org/akn/ke/act/2015/17' },
    odpc: { label: 'ODPC — registration FAQs', url: 'https://www.odpc.go.ke/faqs/' },
    osh: { label: 'Occupational Safety and Health Act, 2007', url: 'https://new.kenyalaw.org/akn/ke/act/2007/15/eng%402022-12-31/source' },
    fire: { label: 'Fire Risk Reduction Rules, 2007', url: 'https://www.kenyalaw.org/kl/fileadmin/pdfdownloads/LegalNotices/2007/59-FactoriesandOtherPlacesofWork_FireRiskReduction_Rules_2007.pdf' },
    nbo: { label: 'Nairobi City County services', url: 'https://nairobiservices.go.ke' },
    pcpb: { label: 'Pest Control Products Board', url: 'https://www.pcpb.go.ke' },
    nema: { label: 'NEMA', url: 'https://www.nema.go.ke' },
    imm: { label: 'Department of Immigration Services', url: 'https://immigration.go.ke' },
    tra: { label: 'Tourism Regulatory Authority — licensing FAQs', url: 'https://tra.go.ke/contact-us/' },
    tlevy: { label: 'Tourism Fund Regulations, 2015 (LN 199)', url: 'https://www.policyvault.africa/wp-content/uploads/policy/KEN666.pdf' },
    ppb: { label: 'Pharmacy and Poisons Board', url: 'https://web.pharmacyboardkenya.org' },
    kmpdc: { label: 'KMPDC — health facility licensing', url: 'https://kmpdc.go.ke/notices-2/press_release_page/' },
    nca: { label: 'NCA — renewal of practising licence', url: 'https://www.nca.go.ke/license-renewal' },
    kebs: { label: 'KEBS — Standards Levy', url: 'https://www.kebs.org/?p=1896' }
  };

  // ---------- catalogue ----------
  // kind: once | monthly | annualFixed | expiry | fy | instalment | anniversary
  // scope: business | location
  function emp(p) { return (p.employees || 0) > 0; }
  function isCo(p) { return p.structure === 'company' || p.structure === 'llp'; }
  function has(p, s) { return (p.sectors || []).indexOf(s) >= 0; }
  function vatApplies(p) { return p.vat === 'yes' || p.turnover === '5to25' || p.turnover === 'gt25'; }

  var CATALOGUE = [
    // Registration
    { key: 'brs-co', group: 'Registration', title: 'Company incorporation certificate', auth: 'Business Registration Service', scope: 'business', kind: 'once',
      applies: function (p) { return isCo(p); }, why: 'Your business is a registered company or LLP.', how: 'Keep the certificate of incorporation and CR12 on file. Incorporate through eCitizen (BRS) if this is not done.', src: SRC.brs },
    { key: 'brs-bn', group: 'Registration', title: 'Business name registration', auth: 'Business Registration Service', scope: 'business', kind: 'once',
      applies: function (p) { return p.structure === 'sole' || p.structure === 'partnership'; }, why: 'Sole proprietors and partnerships trading under a name other than their own register it with BRS.', how: 'Register on eCitizen (BRS). Skip if you trade only under your own legal names.', src: SRC.brs },
    { key: 'pin', group: 'Tax', title: 'KRA PIN and tax obligations set up', auth: 'Kenya Revenue Authority', scope: 'business', kind: 'once',
      applies: function () { return true; }, why: 'Every business needs a KRA PIN with the right tax obligations on iTax.', how: 'On iTax, confirm the PIN is active and that PAYE, VAT, TOT or income tax obligations match your business.', src: SRC.kra },
    { key: 'etims', group: 'Tax', title: 'eTIMS electronic invoicing', auth: 'Kenya Revenue Authority', scope: 'business', kind: 'once',
      applies: function () { return true; }, why: 'KRA requires all businesses to issue invoices through eTIMS.', how: 'Onboard on the eTIMS portal (or eTIMS Lite for non-VAT businesses) and issue every invoice through it.', src: SRC.kra,
      penalty: 'Not using the electronic tax system: the higher of 5% of the tax due or KSh 100,000 for a company (KSh 10,000 for an individual), from 1 July 2026.' },
    { key: 'bo', group: 'Registration', title: 'Beneficial ownership information lodged', auth: 'Business Registration Service', scope: 'business', kind: 'once',
      applies: function (p) { return isCo(p); }, why: 'Companies keep a beneficial ownership register and lodge it with the Registrar; changes must be lodged promptly.', how: 'Lodge or update beneficial ownership details on the BRS portal whenever ownership changes.', src: SRC.brs },
    { key: 'ar', group: 'Registration', title: 'Annual return (CR29)', auth: 'Business Registration Service', scope: 'business', kind: 'anniversary',
      applies: function (p) { return isCo(p); }, why: 'Every company files an annual return made up to the anniversary of incorporation.', how: 'File on eCitizen (BRS). Set your incorporation date in the profile so the due date can be worked out.', src: SRC.cos,
      penalty: 'Late filing attracts default penalties and can lead to strike-off.' },

    // Payroll
    { key: 'emp-reg', group: 'Payroll', title: 'Employer registration with NSSF, SHA and NITA', auth: 'NSSF, SHA, NITA', scope: 'business', kind: 'once',
      applies: emp, why: 'You have employees, so the business must be registered as an employer with each body.', how: 'Register on the NSSF and SHA employer portals; NITA registration is done once and the levy is filed on iTax.', src: SRC.shif },
    { key: 'paye', group: 'Payroll', title: 'PAYE return and payment', auth: 'Kenya Revenue Authority', scope: 'business', kind: 'monthly', day: 9,
      applies: emp, why: 'You pay salaries, so you deduct and remit PAYE every month.', how: 'File the P10 on iTax and pay by the 9th of the following month. The Housing Levy and NITA levy are declared on the same return.', src: SRC.paye,
      penalty: 'Late payment: 5% of the tax plus 1% interest a month. Late filing: 25% of the tax or KSh 10,000, whichever is higher.' },
    { key: 'nssf', group: 'Payroll', title: 'NSSF contributions', auth: 'National Social Security Fund', scope: 'business', kind: 'monthly', day: 9,
      applies: emp, why: 'Employers contribute 6% and deduct 6% of pensionable pay (Tier I up to KSh 9,000, Tier II up to KSh 108,000 from February 2026).', how: 'Upload the monthly schedule and pay on the NSSF employer portal by the 9th.', src: SRC.nssf,
      penalty: '5% of the amount due for every month or part of a month it stays unpaid.' },
    { key: 'shif', group: 'Payroll', title: 'SHIF contributions (2.75%)', auth: 'Social Health Authority', scope: 'business', kind: 'monthly', day: 9,
      applies: emp, why: 'Employers deduct 2.75% of each employee’s gross pay and remit it to SHA.', how: 'Remit on the SHA employer portal by the 9th of the following month.', src: SRC.shif,
      penalty: '2% of the unpaid amount for each month it stays unpaid; employees can lose cover.' },
    { key: 'ahl', group: 'Payroll', title: 'Affordable Housing Levy (1.5% + 1.5%)', auth: 'Kenya Revenue Authority', scope: 'business', kind: 'monthly', workday: 9,
      applies: emp, why: 'Employers deduct 1.5% of gross pay and add a matching 1.5%.', how: 'Declare on the PAYE return and pay under the Housing Levy tax head by the 9th working day after month end.', src: SRC.ahl,
      penalty: '3% of the unpaid amount for each month it stays unpaid.' },
    { key: 'nita', group: 'Payroll', title: 'NITA industrial training levy', auth: 'NITA (collected by KRA)', scope: 'business', kind: 'monthly', day: 9,
      applies: emp, why: 'Employers pay KSh 50 per employee each month.', how: 'Declare on the PAYE return on iTax and pay by the 9th of the following month.', src: SRC.nita,
      penalty: '5% of the levy due.' },
    { key: 'wiba', group: 'Workplace', title: 'Work injury (WIBA) insurance cover', auth: 'Directorate of Occupational Safety and Health', scope: 'business', kind: 'expiry', defaultAnnual: false,
      applies: emp, why: 'Employers must insure employees against work injury under the Work Injury Benefits Act.', how: 'Keep a current WIBA policy. Enter the policy expiry date so the renewal is tracked.', src: SRC.osh },

    // Tax
    { key: 'vat-reg', group: 'Tax', title: 'VAT registration', auth: 'Kenya Revenue Authority', scope: 'business', kind: 'once',
      applies: function (p) { return (p.turnover === '5to25' || p.turnover === 'gt25') && p.vat !== 'yes'; }, why: 'Taxable turnover of KSh 5 million or more in 12 months makes VAT registration compulsory.', how: 'Add the VAT obligation to your PIN on iTax, then file monthly.', src: SRC.vat },
    { key: 'vat', group: 'Tax', title: 'VAT return (VAT3)', auth: 'Kenya Revenue Authority', scope: 'business', kind: 'monthly', day: 20,
      applies: vatApplies, why: 'VAT-registered businesses file every month, even with nil sales.', how: 'File the VAT3 on iTax and pay by the 20th of the following month.', src: SRC.vat,
      penalty: 'Late filing: KSh 10,000 or 5% of the tax, whichever is higher. Late payment: 5% plus 1% interest a month.' },
    { key: 'tot', group: 'Tax', title: 'Turnover Tax (3% of gross sales)', auth: 'Kenya Revenue Authority', scope: 'business', kind: 'monthly', day: 20,
      applies: function (p) { return p.turnover === '1to5' && p.vat !== 'yes'; }, why: 'Businesses with turnover between KSh 1 million and 25 million that are not VAT-registered pay Turnover Tax.', how: 'File and pay on iTax by the 20th of the following month.', src: SRC.kra },
    { key: 'cit', group: 'Tax', title: 'Corporate income tax return', auth: 'Kenya Revenue Authority', scope: 'business', kind: 'fy',
      applies: function (p) { return isCo(p); }, why: 'Companies file a self-assessment return within six months of the financial year end.', how: 'File the IT2C on iTax by the last day of the sixth month after your year end.', src: SRC.kra },
    { key: 'it1', group: 'Tax', title: 'Individual income tax return (owners)', auth: 'Kenya Revenue Authority', scope: 'business', kind: 'fy', fixedFyEnd: 12,
      applies: function (p) { return (p.structure === 'sole' || p.structure === 'partnership') && p.turnover !== '1to5'; }, why: 'Business profits of a sole proprietor or partner are taxed as the owner’s personal income, declared on the individual return for each calendar year.', how: 'Each owner files the IT1 on iTax by 30 June, declaring the business income (partners declare their share). Businesses on Turnover Tax pay that monthly instead.', src: SRC.kra,
      penalty: 'Late filing: 5% of the tax due or KSh 2,000, whichever is higher.' },
    { key: 'inst', group: 'Tax', title: 'Instalment tax', auth: 'Kenya Revenue Authority', scope: 'business', kind: 'instalment',
      applies: function (p) { return isCo(p) && p.turnover !== 'lt1' && p.turnover !== '1to5'; }, why: 'Companies expecting tax above KSh 40,000 pay income tax in four instalments during the year.', how: 'Pay by the 20th day of the 4th, 6th, 9th and 12th months of your financial year.', src: SRC.kra },

    // Data protection
    { key: 'odpc', group: 'Data protection', title: 'ODPC registration as data controller', auth: 'Office of the Data Protection Commissioner', scope: 'business', kind: 'expiry', validityMonths: 24,
      applies: function (p) { return p.cctv || (p.personalData && ((p.employees || 0) >= 10 || p.turnover === '5to25' || p.turnover === 'gt25' || (p.sectors || []).some(function (s) { return ODPC_MANDATORY[s]; }))); },
      why: 'You process personal data and are not exempt: the exemption only covers businesses with under KSh 5 million turnover and fewer than 10 employees, and never covers CCTV security systems, health, education, hospitality, property, financial or transport services.', how: 'Register on the ODPC portal and renew before the certificate expires. Enter the certificate expiry date to track renewal.', src: SRC.odpc,
      penalty: 'Processing personal data without registration is an offence; fines run up to KSh 5 million.' },

    // Workplace (per location)
    { key: 'dosh', group: 'Workplace', title: 'Workplace registration certificate', auth: 'Directorate of Occupational Safety and Health', scope: 'location', kind: 'expiry', calendarYear: true,
      applies: emp, why: 'Workplaces with employees are registered with DOSH and the certificate is renewed each year.', how: 'Apply or renew with DOSH for each premises.', src: SRC.osh },
    { key: 'fire-audit', group: 'Workplace', title: 'Annual fire safety audit', auth: 'Directorate of Occupational Safety and Health', scope: 'location', kind: 'expiry', annualFromLast: true,
      applies: emp, why: 'The Fire Risk Reduction Rules require a fire safety audit of each workplace at least once a year by an approved auditor.', how: 'Book an approved fire safety auditor and keep the report on file. Enter the last audit date.', src: SRC.fire },
    { key: 'fire-equip', group: 'Workplace', title: 'Fire-fighting equipment inspection', auth: 'Directorate of Occupational Safety and Health', scope: 'location', kind: 'expiry', annualFromLast: true,
      applies: emp, why: 'Fire extinguishers and other appliances must be inspected and serviced at least every 12 months.', how: 'Have a competent person service the equipment and tag it. Enter the last service date.', src: SRC.fire },
    { key: 'osh-audit', group: 'Workplace', title: 'Occupational safety and health audit', auth: 'Directorate of Occupational Safety and Health', scope: 'location', kind: 'expiry', annualFromLast: true,
      applies: emp, why: 'Occupiers carry out a safety and health audit of each workplace every 12 months by an approved auditor.', how: 'Book an approved OSH auditor and keep the report. Enter the last audit date.', src: SRC.osh },
    { key: 'osh-committee', group: 'Workplace', title: 'Safety and health committee', auth: 'Directorate of Occupational Safety and Health', scope: 'business', kind: 'once',
      applies: function (p) { return (p.employees || 0) >= 20; }, why: 'Workplaces with 20 or more employees set up a safety and health committee.', how: 'Appoint the committee, train members and keep minutes of its meetings.', src: SRC.osh },

    // County (per location)
    { key: 'permit', group: 'County', title: 'County business permit', auth: 'County government', scope: 'location', kind: 'expiry', countyValidity: true,
      applies: function () { return true; }, why: 'Every premises needs a county business permit. Under the County Licensing (Uniform Procedures) Act, 2024 a licence runs for one year from the date of issue; some counties still end permits on 31 December.', how: 'Renew on the county portal or at the revenue office before the expiry printed on the permit. Each branch needs its own permit.', src: null },
    { key: 'fire-county', group: 'County', title: 'County fire safety certificate', auth: 'County fire department', scope: 'location', kind: 'expiry', calendarYear: true,
      applies: function (p, loc) { return !(countyInfo(loc.county).bundlesFire); }, why: 'Most counties issue a separate annual fire safety certificate for business premises.', how: 'Request a fire inspection from the county and renew each year.', src: null },
    { key: 'signage', group: 'County', title: 'Outdoor advertising and signage permit', auth: 'County government', scope: 'location', kind: 'expiry', calendarYear: true,
      applies: function (p, loc) { return loc.signage && !(countyInfo(loc.county).bundlesSignage); }, why: 'This location displays outdoor signs, which counties license each year.', how: 'Apply on the county portal with the sign size and location.', src: null },
    { key: 'health-permit', group: 'County', title: 'Public health and food hygiene licence', auth: 'County public health office', scope: 'location', kind: 'expiry', calendarYear: true,
      applies: function (p, loc) { return (has(p, 'food') || has(p, 'hospitality') || has(p, 'education')) && !(loc && countyInfo(loc.county).bundlesHealth); }, why: 'Premises that prepare or serve food, or care for children, need a county public health licence.', how: 'Book a public health inspection and renew the licence every year.', src: null },
    { key: 'food-handlers', group: 'County', title: 'Food handlers’ medical certificates', auth: 'County public health office', scope: 'business', kind: 'expiry', validityMonths: 6,
      applies: function (p) { return has(p, 'food') || has(p, 'hospitality') || has(p, 'education'); }, why: 'Staff who handle food need a medical certificate, renewed every six months.', how: 'Arrange medical examinations for food-handling staff. Enter the date the current certificates expire.', src: null },
    { key: 'weights', group: 'County', title: 'Weighing equipment verification', auth: 'County weights and measures office', scope: 'location', kind: 'expiry', annualFromLast: true,
      applies: function (p) { return p.weighing; }, why: 'Scales used for trade must be verified and stamped every year.', how: 'Book verification with the county weights and measures office. Enter the last verification date.', src: null },

    // Sector
    { key: 'pcpb', group: 'Sector', title: 'Pest control operator licence', auth: 'Pest Control Products Board', scope: 'business', kind: 'expiry', calendarYear: true,
      applies: function (p) { return p.fumigation; }, why: 'Businesses offering fumigation or pest control services must hold a PCPB licence.', how: 'Apply or renew with the Pest Control Products Board.', src: SRC.pcpb },
    { key: 'nema-waste', group: 'Sector', title: 'Waste transport licence', auth: 'National Environment Management Authority', scope: 'business', kind: 'expiry', annualFromLast: false,
      applies: function (p) { return p.wasteTransport; }, why: 'Collecting or transporting waste requires a NEMA licence for each vehicle.', how: 'Apply or renew on the NEMA portal. Enter the licence expiry date.', src: SRC.nema },
    { key: 'tra', group: 'Sector', title: 'Tourism Regulatory Authority licence', auth: 'Tourism Regulatory Authority', scope: 'business', kind: 'expiry', calendarYear: true, leadDays: 90,
      applies: function (p) { return has(p, 'hospitality') || has(p, 'food'); }, why: 'Hotels, serviced apartments, restaurants and bars are tourism enterprises (Class A and B) under the Tourism Act and need a TRA licence. It expires on 31 December each year, and the county should not issue your business permit without it. If you only make or sell packaged food and nobody eats or drinks on your premises, mark this as not applicable.', how: 'Renew on the TRA licensing portal (licensing.tra.go.ke). The Act asks for renewal three months before expiry.', src: SRC.tra,
      penalty: 'Late renewal costs 10% of the licence fee for each month of delay.' },
    { key: 'tourism-levy', group: 'Sector', title: 'Tourism levy (2% of gross sales)', auth: 'Tourism Fund', scope: 'business', kind: 'monthly', day: 9,
      applies: function (p) { return has(p, 'hospitality') || has(p, 'food'); }, why: 'Class A and B tourism enterprises (hotels, serviced apartments, restaurants, bars and similar) pay 2% of gross receipts from food, drinks, accommodation and other services every month. If you only make or sell packaged food, mark this as not applicable.', how: 'Generate an e-slip on the Tourism Fund eLevy platform and pay. Tourism Fund notices give the 9th or 10th of the following month, so this tracks the 9th to be safe.', src: SRC.tlevy,
      penalty: 'KSh 5,000 at once, then 3% of the levy due for each month it stays unpaid.' },
    { key: 'ppb', group: 'Sector', title: 'Pharmacy premises and practice licences', auth: 'Pharmacy and Poisons Board', scope: 'business', kind: 'expiry', calendarYear: true,
      applies: function (p) { return p.pharmacy; }, why: 'Pharmacies need PPB premises registration and an annual practice licence for the pharmacist or pharmaceutical technologist in charge. All PPB licences expire on 31 December.', how: 'Renew on the PPB portal at least 30 days before expiry; renewal also depends on the superintendent’s CPD.', src: SRC.ppb,
      penalty: 'Late renewal attracts a penalty of 10% of the fee.' },
    { key: 'kmpdc', group: 'Sector', title: 'Health facility licence', auth: 'Kenya Medical Practitioners and Dentists Council', scope: 'business', kind: 'expiry', calendarYear: true, leadDays: 60,
      applies: function (p) { return p.healthFacility; }, why: 'Clinics, hospitals and other health institutions registered by KMPDC renew their operating licence every year. KMPDC now also requires institutional professional indemnity cover.', how: 'Renew on the KMPDC online portal (osp.kmpdc.go.ke) and pay through eCitizen before the deadline in KMPDC’s renewal notice.', src: SRC.kmpdc,
      penalty: 'Late renewal attracts penalties, and KMPDC has warned that unlicensed facilities lose SHA access.' },
    { key: 'nca', group: 'Sector', title: 'NCA contractor practising licence', auth: 'National Construction Authority', scope: 'business', kind: 'expiry',
      applies: function (p) { return has(p, 'construction'); }, why: 'Contractors need NCA registration and an annual practising licence to carry out construction works.', how: 'Renew on the NCA portal; renewal needs 10 CPD points from NCA or accredited seminars. Enter the licence expiry date.', src: SRC.nca },
    { key: 'kebs-levy', group: 'Sector', title: 'KEBS Standards Levy (0.2% of turnover)', auth: 'Kenya Bureau of Standards (via iTax)', scope: 'business', kind: 'monthly', day: 20,
      applies: function (p) { return has(p, 'manufacturing') && (p.turnover === '5to25' || p.turnover === 'gt25'); }, why: 'Manufacturers with annual turnover above KSh 5 million pay 0.2% of monthly turnover (net of VAT, excise and discounts), capped at KSh 4 million a year.', how: 'Declare and pay on iTax by the 20th of the following month and keep the monthly return.', src: SRC.kebs,
      penalty: '5% a month on the amount unpaid.' },
    { key: 'liquor', group: 'County', title: 'Alcoholic drinks licence', auth: 'County alcoholic drinks committee', scope: 'location', kind: 'expiry',
      applies: function (p) { return p.liquor; }, why: 'Selling alcohol needs a county alcoholic drinks licence for each premises, separate from the business permit in most counties.', how: 'Apply or renew with the county liquor licensing office. Enter the licence expiry date.', src: null },
    { key: 'work-permits', group: 'Sector', title: 'Work permits for foreign staff', auth: 'Department of Immigration Services', scope: 'business', kind: 'expiry',
      applies: function (p) { return p.foreignStaff; }, why: 'Foreign nationals need a valid work permit for their role.', how: 'Track each permit’s expiry and apply for renewal early. Enter the earliest expiry date.', src: SRC.imm }
  ];

  // ---------- helpers for county naming ----------
  function displayTitle(ob, loc) {
    if (ob.key === 'permit' && loc) return countyInfo(loc.county).permit;
    return ob.title;
  }
  function sourceFor(ob, loc) {
    if (ob.src) return ob.src;
    if (loc) { var c = countyInfo(loc.county); return c.url ? { label: loc.county + ' County services', url: c.url } : { label: c.portal, url: null }; }
    return null;
  }

  // ---------- occurrence generation ----------
  function monthlyDue(ob, y, m) { // period y-m -> due in following month
    var n = addMonths(y, m, 1);
    if (ob.workday) return nthWorkingDay(n.y, n.m, ob.workday);
    return prevWorking(D(n.y, n.m, ob.day));
  }

  // Build every obligation instance for a profile
  function instances(profile) {
    var out = [];
    var p = profile || {};
    var locs = p.locations || [];
    CATALOGUE.forEach(function (ob) {
      if (ob.scope === 'location') {
        locs.forEach(function (loc) {
          if (ob.applies(p, loc)) out.push({ id: ob.key + '@' + loc.id, ob: ob, loc: loc, title: displayTitle(ob, loc), src: sourceFor(ob, loc) });
        });
      } else if (ob.applies(p)) {
        out.push({ id: ob.key, ob: ob, loc: null, title: ob.title, src: sourceFor(ob, null) });
      }
    });
    return out;
  }

  function filedSet(filings, id) {
    var s = {};
    (filings || []).forEach(function (f) { if (f.id === id) s[f.period] = f; });
    return s;
  }

  // Compute status for one instance
  function evaluate(inst, ws, today) {
    var p = ws.profile || {}, rec = (ws.records || {})[inst.id] || {}, ob = inst.ob;
    var filed = filedSet(ws.filings, inst.id);
    var start = fromIso(ws.trackFrom) || D(parts(today).y, parts(today).m, 1);
    var res = { inst: inst, id: inst.id, status: 'ok', next: null, nextPeriod: null, overdue: [], upcoming: [], unconfirmed: [], note: '', needs: null, held: !!rec.held, record: rec };

    if (rec.na) { res.status = 'na'; res.note = 'Marked as not applicable to this business'; return res; }
    if (ob.kind === 'once') {
      if (rec.held) { res.status = 'done'; res.note = 'Recorded as in place' + (rec.ref ? ' · ref ' + rec.ref : ''); }
      else { res.status = 'missing'; res.note = 'Not recorded yet. Mark it as in place once done.'; }
      return res;
    }

    var occ = []; // {period, due}
    var incAt = fromIso(p.incDate);
    var createdAt = fromIso(ws.createdOn);
    var sp = parts(start), tp = parts(today);
    if (ob.kind === 'monthly') {
      // periods from (trackFrom month - 1) to today's month + 3
      var first = addMonths(sp.y, sp.m, -1);
      for (var k = 0; k < 60; k++) {
        var pm = addMonths(first.y, first.m, k);
        var due = monthlyDue(ob, pm.y, pm.m);
        if (due < start) continue;
        if (incAt && D(pm.y, pm.m, lastDay(pm.y, pm.m)) < incAt) continue; // no returns for months before the business existed
        if (due > today + 130 * DAY) break;
        occ.push({ period: pm.y + '-' + pad(pm.m), due: due });
      }
    } else if (ob.kind === 'anniversary') {
      var inc = fromIso(p.incDate);
      if (!inc) { res.status = 'info'; res.needs = 'incDate'; res.note = 'Add your incorporation date in the profile to work out the due date.'; return res; }
      var ip = parts(inc);
      for (var y = sp.y - 1; y <= tp.y + 1; y++) {
        if (y <= ip.y) continue;
        var ann = D(y, ip.m, Math.min(ip.d, lastDay(y, ip.m)));
        var dd = prevWorking(ann + 30 * DAY);
        if (dd < start) continue;
        occ.push({ period: String(y), due: dd });
      }
    } else if (ob.kind === 'fy' || ob.kind === 'instalment') {
      var fe = ob.fixedFyEnd || +p.fyEnd || 12;
      for (var fy = sp.y - 1; fy <= tp.y + 1; fy++) {
        if (incAt && D(fy, fe, lastDay(fy, fe)) < incAt) continue; // year ended before the business existed
        if (ob.kind === 'fy') {
          var e = addMonths(fy, fe, 6); var dd2 = D(e.y, e.m, lastDay(e.y, e.m));
          if (dd2 >= start) occ.push({ period: 'FY' + fy, due: prevWorking(dd2) });
        } else {
          // year of income ending in month fe of year fy starts the month after fe of fy-1
          var s0 = addMonths(fy, fe, -11);
          [4, 6, 9, 12].forEach(function (mth, i) {
            var mm = addMonths(s0.y, s0.m, mth - 1); var d3 = prevWorking(D(mm.y, mm.m, 20));
            if (d3 >= start) occ.push({ period: fy + '-I' + (i + 1), due: d3 });
          });
        }
      }
      occ = occ.filter(function (o) { return o.due <= today + 400 * DAY; });
    } else if (ob.kind === 'expiry') {
      var exp = fromIso(rec.expiry);
      var last = fromIso(rec.last);
      if (!exp && last && ob.annualFromLast) { var lp = parts(last); exp = D(lp.y + 1, lp.m, Math.min(lp.d, lastDay(lp.y + 1, lp.m))); }
      var calYear = ob.countyValidity ? (inst.loc && countyInfo(inst.loc.county).validity === 'calendar') : ob.calendarYear;
      if (!exp && rec.held && calYear) exp = D(tp.y, 12, 31);
      if (!exp) {
        res.status = rec.held ? 'info' : 'missing';
        res.needs = ob.annualFromLast ? 'last' : 'expiry';
        res.note = rec.held ? 'Add the expiry date so renewal can be tracked.' : (ob.annualFromLast ? 'No record yet. Add the date it was last done.' : 'No record yet. Add the current expiry date, or mark it as not held.');
        return res;
      }
      res.expiry = exp;
      occ.push({ period: 'exp:' + iso(exp), due: exp });
      res.assumed = !rec.expiry && !rec.last;
    }

    occ.sort(function (a, b) { return a.due - b.due; });
    occ.forEach(function (o) {
      if (filed[o.period]) return;
      if (o.due >= today) res.upcoming.push(o);
      else if (createdAt && o.due < createdAt && ob.kind !== 'expiry') res.unconfirmed.push(o); // fell due before the workspace existed: ask, don't accuse
      else res.overdue.push(o);
    });
    var nxt = res.overdue[0] || res.upcoming[0] || null;
    if (nxt) { res.next = nxt.due; res.nextPeriod = nxt.period; }
    var days = nxt ? Math.round((nxt.due - today) / DAY) : null;
    res.days = days;
    if (ob.kind === 'expiry') {
      if (days < 0) res.status = 'overdue';
      else if (days <= (ob.leadDays || 30)) res.status = 'soon';
      else res.status = 'ok';
      res.note = (days < 0 ? 'Expired ' : 'Valid until ') + fmt(res.expiry) + (res.assumed ? ' (assumed end of calendar year)' : '');
    } else if (res.overdue.length) {
      res.status = 'overdue';
      res.note = res.overdue.length === 1 ? periodLabel(res.overdue[0].period) + ' not marked as filed' : res.overdue.length + ' periods not marked as filed';
    } else if (res.unconfirmed.length) {
      res.status = 'info';
      res.note = 'Confirm whether ' + (res.unconfirmed.length === 1 ? periodLabel(res.unconfirmed[0].period) + ' was' : res.unconfirmed.length + ' earlier periods were') + ' filed';
    } else if (days != null && days <= 14) { res.status = 'soon'; res.note = periodLabel(nxt.period) + ' due'; }
    else if (nxt) { res.status = 'ok'; res.note = 'Next: ' + periodLabel(nxt.period); }
    else { res.status = 'ok'; res.note = 'Nothing due in the tracking window'; }
    return res;
  }

  function evaluateAll(ws, today) {
    today = today || todayKE();
    return instances(ws.profile).map(function (i) { return evaluate(i, ws, today); });
  }

  // Score = share of applicable obligations that are in order. Due-soon items count most of the way, items missing a date half, overdue and unrecorded items not at all.
  var WEIGHT = { done: 1, ok: 1, soon: 0.8, info: 0.5, missing: 0, overdue: 0 };
  function score(results) {
    var c = { overdue: 0, missing: 0, info: 0, soon: 0, ok: 0, done: 0, na: 0 };
    results.forEach(function (r) { c[r.status]++; });
    var n = results.length - c.na;
    if (!n) return { value: null, parts: c };
    var pts = 0; results.forEach(function (r) { if (r.status !== 'na') pts += WEIGHT[r.status]; });
    var v = Math.round(100 * pts / n);
    if (c.overdue && v > 89) v = 89; // anything overdue keeps the score out of the top band
    return { value: v, parts: c };
  }

  // Upcoming dated actions within N days (including overdue)
  function agenda(results, today, days) {
    today = today || todayKE();
    var list = [];
    results.forEach(function (r) {
      r.overdue.concat(r.upcoming).forEach(function (o) {
        if (o.due <= today + days * DAY) list.push({ r: r, period: o.period, due: o.due, days: Math.round((o.due - today) / DAY) });
      });
    });
    list.sort(function (a, b) { return a.due - b.due; });
    return list;
  }

  // Sample workspaces for the demo (built relative to today so they stay consistent)
  function sample(which, today) {
    today = today || todayKE();
    var tp = parts(today);
    var trackStart = addMonths(tp.y, tp.m, -2);
    var trackFrom = trackStart.y + '-' + pad(trackStart.m) + '-01';
    var thisYear = tp.y;
    var ws;
    if (which === 'kajiado') {
      ws = {
        profile: { name: 'Kajiado Daycare', structure: 'sole', stage: 'operating', incDate: '', fyEnd: 12, sectors: ['education', 'food'], activities: 'Daycare and early learning for children aged 1–5, with meals', employees: 10, turnover: '1to5', vat: 'no', personalData: true, foreignStaff: false, weighing: false, fumigation: false, wasteTransport: false,
          locations: [{ id: 'l1', name: 'Kitengela centre', county: 'Kajiado', signage: true }] },
        trackFrom: trackFrom, records: {}, filings: []
      };
      ws.records = {
        'brs-bn': { held: true, ref: 'BN-SAMPLE-2209' }, pin: { held: true }, etims: { held: true }, 'emp-reg': { held: true },
        'permit@l1': { held: true, expiry: thisYear + '-12-31' }, 'fire-county@l1': { held: true, expiry: thisYear + '-12-31' },
        'health-permit@l1': { held: true, expiry: thisYear + '-12-31' }, 'food-handlers': { held: true, expiry: iso(today + 40 * DAY) },
        'fire-equip@l1': { held: true, last: iso(today - 300 * DAY) }, wiba: { held: true, expiry: iso(today + 120 * DAY) }
      };
    } else {
      ws = {
        profile: { name: 'Usafi Cleaning Company Limited', structure: 'company', stage: 'operating', incDate: '2019-04-16', fyEnd: 12, sectors: ['cleaning'], activities: 'Office and commercial cleaning, fumigation and waste collection for corporate clients', employees: 105, turnover: 'gt25', vat: 'yes', personalData: true, foreignStaff: false, weighing: false, fumigation: true, wasteTransport: true,
          locations: [{ id: 'l1', name: 'Nairobi headquarters', county: 'Nairobi City', signage: true }, { id: 'l2', name: 'Nakuru branch', county: 'Nakuru', signage: false }, { id: 'l3', name: 'Eldoret branch', county: 'Uasin Gishu', signage: true }] },
        trackFrom: trackFrom, records: {}, filings: []
      };
      ws.records = {
        'brs-co': { held: true, ref: 'PVT-SAMPLE-019' }, bo: { held: true }, pin: { held: true }, etims: { held: true }, 'emp-reg': { held: true }, 'osh-committee': { held: true },
        'permit@l1': { held: true, expiry: thisYear + '-12-31', ref: 'UBP-SAMPLE-0031' }, 'permit@l2': { held: true, expiry: thisYear + '-12-31' }, 'permit@l3': { held: true, expiry: thisYear + '-12-31' },
        'fire-county@l2': { held: true, expiry: thisYear + '-12-31' }, 'fire-county@l3': { held: true, expiry: thisYear + '-12-31' },
        'signage@l3': { held: true, expiry: thisYear + '-12-31' },
        'dosh@l1': { held: true, expiry: thisYear + '-12-31' }, 'dosh@l2': { held: true, expiry: thisYear + '-12-31' }, 'dosh@l3': { held: true, expiry: thisYear + '-12-31' },
        'fire-audit@l1': { held: true, last: iso(today - 200 * DAY) }, 'fire-audit@l2': { held: true, last: iso(today - 350 * DAY) },
        'fire-equip@l1': { held: true, last: iso(today - 100 * DAY) }, 'fire-equip@l2': { held: true, last: iso(today - 100 * DAY) }, 'fire-equip@l3': { held: true, last: iso(today - 380 * DAY) },
        'osh-audit@l1': { held: true, last: iso(today - 250 * DAY) },
        odpc: { held: true, expiry: iso(today + 210 * DAY), ref: 'ODPC-SAMPLE' }, wiba: { held: true, expiry: iso(today + 75 * DAY) },
        pcpb: { held: true, expiry: thisYear + '-12-31' }, 'nema-waste': { held: true, expiry: iso(today + 25 * DAY) }
      };
    }
    // Filings: every monthly item filed for all periods whose due date has passed, except the most recent one for PAYE-linked items (to show an overdue case when relevant)
    var res = instances(ws.profile);
    res.forEach(function (inst) {
      var ob = inst.ob;
      if (ob.kind !== 'monthly' && ob.kind !== 'fy' && ob.kind !== 'instalment' && ob.kind !== 'anniversary') return;
      var ev = evaluate(inst, ws, today);
      ev.overdue.forEach(function (o, idx) {
        var leaveOpen = which !== 'kajiado' && ob.key === 'nita' && idx === ev.overdue.length - 1;
        if (leaveOpen) return;
        var filedOn = Math.min(o.due - 2 * DAY, today);
        ws.filings.push({ fid: 'f' + ws.filings.length, id: inst.id, period: o.period, date: iso(filedOn), ref: 'DEMO-' + ob.key.toUpperCase() + '-' + o.period.replace(/[^0-9A-Z]/gi, '') });
      });
    });
    return ws;
  }

  return {
    D: D, DAY: DAY, parts: parts, iso: iso, fromIso: fromIso, fmt: fmt, todayKE: todayKE, periodLabel: periodLabel, MONTH: MONTH,
    isWorking: isWorking, nthWorkingDay: nthWorkingDay, prevWorking: prevWorking, holidays: holidays,
    COUNTIES: COUNTIES, countyInfo: countyInfo, SECTORS: SECTORS, STRUCTURES: STRUCTURES, TURNOVER: TURNOVER, CATALOGUE: CATALOGUE,
    instances: instances, evaluate: evaluate, evaluateAll: evaluateAll, score: score, agenda: agenda, sample: sample, WEIGHT: WEIGHT
  };
})();

export default CS;
