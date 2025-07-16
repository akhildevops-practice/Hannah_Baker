/**
 * This is the schema reference for the Create Organization Action.
 */

const businessConfigForm: any = {
  function: [{ name: "" }],
  businessUnit: [{ name: "" }],
  entityType: [{ name: "" }],
  section: [{ name: "" }],
  systemType: [{ name: "", color: "yellow" }],
  fiscalYearFormat: "",
  fiscalYearQuarters: "",
  auditYear: "",
};

export const orgForm = {
  organizationId: 0,
  principalGeography: "",
  instanceUrl: "",
  organizationName: "",
  realmName: "",
  domain:"",
  // ...technicalConfigForm,
  ...businessConfigForm,
};
