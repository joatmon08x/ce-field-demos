/**
 * Extra Fieldnote book accounts seeded alongside the ten core customers.
 * Owned by the app. Same ids and rows on every reseed.
 */

export type ExtraAccount = {
  customerId: string;
  invoiceId: string;
  invoiceNumber: string;
  name: string;
  segment: string;
  plan: "STARTER" | "GROWTH" | "SCALE";
  contactName: string;
  email: string;
};

export const EXTRA_ACCOUNTS: ExtraAccount[] = [
  {
    customerId: "cus_northstarfab",
    invoiceId: "inv_2001",
    invoiceNumber: "INV-2001",
    name: "Northstar Fabrication",
    segment: "Enterprise",
    plan: "GROWTH",
    contactName: "Mara Ellison",
    email: "ap@northstarfab.example",
  },
  {
    customerId: "cus_northstarlog",
    invoiceId: "inv_2002",
    invoiceNumber: "INV-2002",
    name: "North Star Logistics",
    segment: "Enterprise",
    plan: "GROWTH",
    contactName: "Devan Kohl",
    email: "billing@northstarlogistics.example",
  },
  {
    customerId: "cus_alderbio",
    invoiceId: "inv_2003",
    invoiceNumber: "INV-2003",
    name: "Alder BioSystems",
    segment: "Strategic",
    plan: "SCALE",
    contactName: "Ines Beaufort",
    email: "finance@alderbio.example",
  },
  {
    customerId: "cus_juniperpw",
    invoiceId: "inv_2004",
    invoiceNumber: "INV-2004",
    name: "Juniper Public Works",
    segment: "Public Sector",
    plan: "STARTER",
    contactName: "Ray Okafor",
    email: "accounts@juniperpw.example",
  },
  {
    customerId: "cus_helioretail",
    invoiceId: "inv_2005",
    invoiceNumber: "INV-2005",
    name: "Helio Retail Group",
    segment: "Enterprise",
    plan: "GROWTH",
    contactName: "Sanne Vos",
    email: "ap@helioretail.example",
  },
  {
    customerId: "cus_cedarhealth",
    invoiceId: "inv_2006",
    invoiceNumber: "INV-2006",
    name: "Cedar Health Network",
    segment: "Strategic",
    plan: "SCALE",
    contactName: "Toni Merced",
    email: "payables@cedarhealth.example",
  },
  {
    customerId: "cus_velaenergy",
    invoiceId: "inv_2007",
    invoiceNumber: "INV-2007",
    name: "Vela Energy Systems",
    segment: "Enterprise",
    plan: "GROWTH",
    contactName: "Bram Whitlock",
    email: "billing@velaenergy.example",
  },
  {
    customerId: "cus_kestrelmob",
    invoiceId: "inv_2008",
    invoiceNumber: "INV-2008",
    name: "Kestrel Mobility",
    segment: "Growth",
    plan: "STARTER",
    contactName: "Freja Lindqvist",
    email: "ap@kestrelmobility.example",
  },
  {
    customerId: "cus_blueharbor",
    invoiceId: "inv_2009",
    invoiceNumber: "INV-2009",
    name: "Blue Harbor Bank",
    segment: "Strategic",
    plan: "SCALE",
    contactName: "Curtis Alba",
    email: "vendors@blueharborbank.example",
  },
  {
    customerId: "cus_stonebridge",
    invoiceId: "inv_2010",
    invoiceNumber: "INV-2010",
    name: "Stonebridge Media",
    segment: "Growth",
    plan: "STARTER",
    contactName: "Petra Hollis",
    email: "accounts@stonebridgemedia.example",
  },
  {
    customerId: "cus_lumenedu",
    invoiceId: "inv_2011",
    invoiceNumber: "INV-2011",
    name: "Lumen Education",
    segment: "Public Sector",
    plan: "STARTER",
    contactName: "Marisol Duarte",
    email: "finance@lumenedu.example",
  },
  {
    customerId: "cus_orchidfoods",
    invoiceId: "inv_2012",
    invoiceNumber: "INV-2012",
    name: "Orchid Foods",
    segment: "Enterprise",
    plan: "GROWTH",
    contactName: "Hana Sook",
    email: "ap@orchidfoods.example",
  },
  {
    customerId: "cus_summitaero",
    invoiceId: "inv_2013",
    invoiceNumber: "INV-2013",
    name: "Summit Aero",
    segment: "Strategic",
    plan: "SCALE",
    contactName: "Callum Reyes",
    email: "payables@summitaero.example",
  },
  {
    customerId: "cus_redwoodcomp",
    invoiceId: "inv_2014",
    invoiceNumber: "INV-2014",
    name: "Redwood Components",
    segment: "Growth",
    plan: "STARTER",
    contactName: "Josie Tran",
    email: "billing@redwoodcomponents.example",
  },
];
